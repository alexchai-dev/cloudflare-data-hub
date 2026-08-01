#!/usr/bin/env python3
import requests
import json
import datetime
import os

CF_TOKEN = os.environ.get("CF_API_TOKEN") or os.environ.get("CF_TOKEN") or "cfat_PLACEHOLDER"
ACCOUNT_ID = os.environ.get("CF_ACCOUNT_ID") or "e988f02a19c299566de86b1f298daf2d"
MERCHANT_WALLET = os.environ.get("MERCHANT_WALLET") or "0xB23B0d7d25113E991D2931Ca147677A5b5Da40E4"

def get_cloudflare_worker_metrics():
    url = "https://api.cloudflare.com/client/v4/graphql"
    headers = {
        "Authorization": f"Bearer {CF_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Calculate datetime for 24h ago
    now = datetime.datetime.utcnow()
    since = (now - datetime.timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%SZ")
    
    query = f"""
    query {{
      viewer {{
        accounts(filter: {{accountTag: "{ACCOUNT_ID}"}}) {{
          workersInvocationsAdaptive(limit: 50, filter: {{datetime_geq: "{since}"}}) {{
            sum {{
              requests
              errors
              subrequests
            }}
            dimensions {{
              scriptName
              status
            }}
          }}
        }}
      }}
    }}
    """
    
    try:
        r = requests.post(url, headers=headers, json={"query": query}, timeout=10)
        data = r.json()
        invocations = data.get("data", {}).get("viewer", {}).get("accounts", [{}])[0].get("workersInvocationsAdaptive", [])
        
        total_requests = 0
        total_errors = 0
        scripts_summary = {}
        
        for item in invocations:
            s_name = item.get("dimensions", {}).get("scriptName", "unknown")
            reqs = item.get("sum", {}).get("requests", 0)
            errs = item.get("sum", {}).get("errors", 0)
            
            total_requests += reqs
            total_errors += errs
            
            if s_name not in scripts_summary:
                scripts_summary[s_name] = {"requests": 0, "errors": 0}
            scripts_summary[s_name]["requests"] += reqs
            scripts_summary[s_name]["errors"] += errs
            
        return {
            "status": "success",
            "total_requests_24h": total_requests,
            "total_errors_24h": total_errors,
            "scripts": scripts_summary
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_onchain_treasury_status():
    # Query Base / Arbitrum RPC for balance or transactions
    rpc_base = "https://mainnet.base.org"
    
    try:
        # Get ETH gas balance for merchant wallet
        payload = {
            "jsonrpc": "2.0",
            "method": "eth_getBalance",
            "params": [MERCHANT_WALLET, "latest"],
            "id": 1
        }
        r = requests.post(rpc_base, json=payload, timeout=5)
        raw_bal = int(r.json().get("result", "0x0"), 16)
        eth_bal = raw_bal / 10**18
        
        return {
            "merchant_wallet": MERCHANT_WALLET,
            "base_eth_balance": eth_bal,
            "status": "active"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    print("Fetching Cloudflare Worker Analytics & On-Chain Metrics...")
    cf_data = get_cloudflare_worker_metrics()
    chain_data = get_onchain_treasury_status()
    
    report = {
        "timestamp_utc": datetime.datetime.utcnow().isoformat() + "Z",
        "cloudflare_workers": cf_data,
        "treasury_onchain": chain_data
    }
    print(json.dumps(report, indent=2))
