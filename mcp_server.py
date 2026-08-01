# -*- coding: utf-8 -*-
"""
x402 Data Hub MCP Server.

Provides AI agents with native tools to list datasets, access free data feeds,
and pay-per-request unlock premium datasets using Base/Arbitrum USDC transaction verification.
"""

import asyncio
import json
import os
import sys
import urllib.request
from typing import Any, List, Dict

try:
    from mcp.server.mcpserver import MCPServer
except ImportError:
    print("[Ошибка] Библиотека 'mcp' не установлена. Запустите: pip install mcp")
    sys.exit(1)

# Базовые параметры
BASE_USDC_CONTRACT = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
TREASURY_WALLET = "0xB23B0d7d25113E991D2931Ca147677A5b5Da40E4".lower()
BASE_RPC_URL = "https://mainnet.base.org"

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

# Доступные датасеты
DATASETS = {
    "saas/ai-api-pricing": {"type": "free", "description": "AI API Pricing & context windows from OpenRouter"},
    "events/v2ex-hot-topics": {"type": "free", "description": "V2EX hot trending topics and developer discussions"},
    "saas/twitter-ai-agents": {"type": "premium", "description": "Top discussed AI Agent frameworks and protocols on X (Requires $0.01 USDC)"},
    "saas/reddit-web3-topics": {"type": "premium", "description": "Most popular cryptocurrency and agent discussions on Reddit (Requires $0.01 USDC)"},
    "expat/living-costs": {"type": "premium", "description": "Structured cost of living indices for expats (Requires $0.01 USDC)"},
    "jobs/tech-salaries": {"type": "premium", "description": "Tech salaries and developer market rates (Requires $0.01 USDC)"},
    "finance/gas-tracker": {"type": "premium", "description": "Real-time gas metrics across EVM chains (Requires $0.01 USDC)"}
}

def call_json_rpc(url: str, method: str, params: list) -> dict:
    """Make a generic JSON-RPC call to the blockchain."""
    payload = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) x402-data-hub/1.0"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as e:
        print(f"[Ошибка RPC] {e}", file=sys.stderr)
        return {}

def verify_usdc_payment(tx_hash: str) -> bool:
    """
    Verify if tx_hash is a valid transfer of 0.01 USDC ($0.01) to TREASURY_WALLET on Base.
    Standard ERC20 Transfer event signature:
    Transfer(address indexed from, address indexed to, uint256 value)
    Topic 0: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
    """
    # Если это тестовый хеш заглушки
    if tx_hash.lower() in ["test_hash", "mock_hash", "0xmock"]:
        return True

    print(f"[Инфо] Проверка транзакции {tx_hash} в Base RPC...", file=sys.stderr)
    rpc_res = call_json_rpc(BASE_RPC_URL, "eth_getTransactionReceipt", [tx_hash])
    
    if not rpc_res or "result" not in rpc_res or rpc_res["result"] is None:
        print(f"[Ошибка] Транзакция не найдена в блокчейне.", file=sys.stderr)
        return False
        
    receipt = rpc_res["result"]
    
    # 1. Проверяем статус транзакции (0x1 = успех)
    if receipt.get("status") != "0x1":
        print(f"[Ошибка] Транзакция завершилась ошибкой в блокчейне.", file=sys.stderr)
        return False
        
    # 2. Проверяем логи переводов ERC-20
    logs = receipt.get("logs", [])
    for log in logs:
        # Проверяем, что адрес контракта — USDC
        if log.get("address", "").lower() != BASE_USDC_CONTRACT.lower():
            continue
            
        topics = log.get("topics", [])
        if not topics:
            continue
            
        # Topic 0 должен быть Transfer
        transfer_event_sig = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
        if topics[0].lower() != transfer_event_sig:
            continue
            
        # Проверяем получателя (Topic 2 - indexed to)
        if len(topics) >= 3:
            recipient_topic = topics[2].lower()
            # Переводим в 20-байтовый адрес
            clean_recipient = "0x" + recipient_topic[-40:]
            if clean_recipient != TREASURY_WALLET:
                continue
                
            # Проверяем сумму перевода (value)
            # USDC имеет 6 знаков после запятой, поэтому 0.01 USDC = 10000 wei/units (0.01 * 10^6)
            data = log.get("data", "0x")
            try:
                value = int(data, 16)
                # Разрешаем переводы от 10000 единиц ($0.01)
                if value >= 10000:
                    print(f"[Успех] Платеж {value / 1000000} USDC подтвержден!", file=sys.stderr)
                    return True
            except ValueError:
                continue
                
    print("[Ошибка] Транзакция не содержит перевода USDC на кошелек казначейства.", file=sys.stderr)
    return False

# Инициализируем сервер
server = MCPServer(
    name="x402-data-hub",
    version="1.0.0",
    description="Official MCP Server for x402 Data Hub"
)

@server.tool(name="list_datasets", description="List all available datasets in the hub, including free and premium ones.")
def list_datasets() -> str:
    return json.dumps(DATASETS, indent=2)

@server.tool(name="get_free_dataset", description="Get a free dataset directly by name (e.g. 'saas/ai-api-pricing' or 'events/v2ex-hot-topics').")
def get_free_dataset(dataset_name: str) -> str:
    if dataset_name not in DATASETS:
        return f"Error: Dataset '{dataset_name}' not found."
        
    if DATASETS[dataset_name]["type"] != "free":
        return f"Error: '{dataset_name}' is a premium dataset. Use buy_premium_dataset tool to unlock it."
    
    # Читаем локальный JSON файл
    file_path = os.path.join(PROJECT_ROOT, f"{dataset_name}.json")
    if not os.path.exists(file_path):
        return f"Error: Local file for '{dataset_name}' not found."
        
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

@server.tool(name="buy_premium_dataset", description="Unlock and access a premium dataset (e.g. 'expat/living-costs') by providing a valid USDC transaction hash on Base ($0.01 USDC sent to 0xB23B0d7d25113E991D2931Ca147677A5b5Da40E4).")
def buy_premium_dataset(dataset_name: str, tx_hash: str) -> str:
    if dataset_name not in DATASETS:
        return f"Error: Dataset '{dataset_name}' not found."
        
    if not tx_hash:
        return "Error: A transaction hash is required to verify payment."

    # Верифицируем блокчейн-платеж
    if not verify_usdc_payment(tx_hash):
        return "Error: Payment verification failed. Check the transaction hash and network."

    # Читаем локальный JSON файл
    file_path = os.path.join(PROJECT_ROOT, f"{dataset_name}.json")
    # Для примера, если локального файла нет, создаем заглушку
    if not os.path.exists(file_path):
        mock_data = {
            "metadata": {
                "dataset_name": dataset_name,
                "status": "unlocked",
                "unlocked_with_tx": tx_hash
            },
            "data": f"Mocked content for premium dataset '{dataset_name}'"
        }
        return json.dumps(mock_data, indent=2)
        
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

async def main():
    await server.run_stdio_async()

if __name__ == "__main__":
    asyncio.run(main())
