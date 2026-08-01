#!/usr/bin/env python3
import json
import os
import urllib.request
from datetime import datetime

def fetch_openrouter_pricing():
    url = "https://openrouter.ai/api/v1/models"
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"[Ошибка] Не удалось получить данные от OpenRouter: {e}")
        return None

def process_pricing_data(raw_data):
    if not raw_data or "data" not in raw_data:
        return None
        
    # Список интересующих нас моделей (популярные бенчмарки)
    target_models = {
        "openai/gpt-4o": "OpenAI GPT-4o",
        "openai/gpt-4o-mini": "OpenAI GPT-4o Mini",
        "anthropic/claude-3-5-sonnet": "Anthropic Claude 3.5 Sonnet",
        "anthropic/claude-3-haiku": "Anthropic Claude 3 Haiku",
        "google/gemini-pro-1.5": "Google Gemini 1.5 Pro",
        "google/gemini-flash-1.5": "Google Gemini 1.5 Flash",
        "deepseek/deepseek-chat": "DeepSeek V3 (Chat)",
        "meta-llama/llama-3-70b-instruct": "Meta Llama 3 70B",
        "cohere/command-r-plus": "Cohere Command R+",
        "mistralai/mixtral-8x22b-instruct": "Mistral Mixtral 8x22B"
    }
    
    processed_models = []
    
    for item in raw_data["data"]:
        model_id = item.get("id")
        if model_id in target_models:
            pricing = item.get("pricing", {})
            
            # Переводим цену за 1 токен в цену за 1 миллион токенов (умножаем на 1,000,000)
            try:
                input_fee = float(pricing.get("prompt", 0)) * 1000000
                output_fee = float(pricing.get("completion", 0)) * 1000000
            except (ValueError, TypeError):
                input_fee = 0.0
                output_fee = 0.0
                
            processed_models.append({
                "model_id": model_id,
                "display_name": target_models[model_id],
                "input_cost_per_1m_tokens_usd": round(input_fee, 4),
                "output_cost_per_1m_tokens_usd": round(output_fee, 4),
                "context_window_tokens": item.get("context_length", 0)
            })
            
    # Сортируем по возрастанию цены за входные токены
    processed_models.sort(key=lambda x: x["input_cost_per_1m_tokens_usd"])
    
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    return {
        "metadata": {
            "dataset_name": "AI API Cost Comparison",
            "last_updated": timestamp,
            "currency": "USD",
            "source": "OpenRouter API (Live feed)",
            "note": "Prices represent cost in USD per 1 million tokens."
        },
        "models": processed_models
    }

def main():
    print("[Инфо] Запрос свежих цен от OpenRouter...")
    raw_data = fetch_openrouter_pricing()
    
    if not raw_data:
        print("[Ошибка] Не удалось обновить цены.")
        return
        
    structured_data = process_pricing_data(raw_data)
    
    if not structured_data or not structured_data["models"]:
        print("[Ошибка] Не удалось распознать структуру данных.")
        return
        
    # Определяем путь к папке saas динамически относительно расположения скрипта
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.abspath(os.path.join(script_dir, "..", "saas"))
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, "ai-api-pricing.json")
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(structured_data, f, ensure_ascii=False, indent=2)
        
    print(f"[Успех] Цены ИИ успешно обновлены и сохранены в: {output_path}")

if __name__ == "__main__":
    main()
