#!/usr/bin/env python3
import asyncio
import json
import os
import sys

# Подключаем корень проекта
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp_server import server, verify_usdc_payment

async def test_mcp_tools():
    print("[Тест] Инициализация MCP сервера...")
    
    print("[Тест] Тестирование 'list_tools' (какие инструменты зарегистрированы)...")
    tools = await server.list_tools()
    for tool in tools:
        print(f"  - Инструмент: {tool.name}, Описание: {tool.description}")
    print()

    print("[Тест] Тестирование 'list_datasets'...")
    res = await server.call_tool("list_datasets", arguments={})
    print(f"Результат list_datasets:\n{res.content[0].text}\n")
    
    print("[Тест] Тестирование 'get_free_dataset' для V2EX...")
    res = await server.call_tool("get_free_dataset", arguments={"dataset_name": "events/v2ex-hot-topics"})
    dataset_preview = json.loads(res.content[0].text)
    print(f"Успешно прочитан датасет: {dataset_preview['metadata']['dataset_name']}")
    print(f"Количество тем: {len(dataset_preview['topics'])}")
    print()
    
    print("[Тест] Тестирование 'buy_premium_dataset' с тестовым хешем...")
    res = await server.call_tool("buy_premium_dataset", arguments={
        "dataset_name": "saas/twitter-ai-agents",
        "tx_hash": "mock_hash"
    })
    dataset_preview = json.loads(res.content[0].text)
    print(f"Успешно разблокирован премиум-датасет: {dataset_preview['metadata']['dataset_name']}")
    print(f"Первый агент в тренде: {dataset_preview['agents'][0]['name']}")
    print()

    print("[Тест] Тестирование блокчейн верификации (verify_usdc_payment)...")
    # Проверим, что реальный фейковый хеш корректно отклоняется RPC
    fake_tx = "0x0000000000000000000000000000000000000000000000000000000000000000"
    is_valid = verify_usdc_payment(fake_tx)
    print(f"Верификация фейкового хеша: {is_valid} (Должно быть False)")

if __name__ == "__main__":
    asyncio.run(test_mcp_tools())
