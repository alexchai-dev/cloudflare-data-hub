"""
x402 Data Hub - Python Integration Example for AI Agents
---------------------------------------------------------
This script demonstrates how an AI Agent or RAG pipeline can consume
verified, real-time datasets from https://x402datahub.io

Usage:
1. Free Tier (3 requests / day): Simply call fetch_dataset(endpoint)
2. Paid Tier ($0.01 USDC / request): Include your on-chain transaction hash
"""

import requests

BASE_URL = "https://data-hub-api.izzor2021.workers.dev"

def fetch_dataset(endpoint: str, tx_hash: str = None):
    url = f"{BASE_URL}{endpoint}"
    headers = {}
    if tx_hash:
        headers["x-payment-tx"] = tx_hash
        
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error {response.status_code}: {response.text}")
        return None

if __name__ == "__main__":
    # Example 1: Fetching AI API Costs (Free Quota)
    print("Fetching AI API Costs...")
    ai_pricing = fetch_dataset("/saas/ai-api-pricing")
    print(ai_pricing)

    # Example 2: Fetching Multi-Chain Gas Fees
    print("\nFetching Gas Tracker...")
    gas_data = fetch_dataset("/finance/gas-tracker")
    print(gas_data)
