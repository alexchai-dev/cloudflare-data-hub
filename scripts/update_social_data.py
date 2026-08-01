#!/usr/bin/env python3
import json
import os
import sys
from datetime import datetime

# Подключаем кодовую базу agent-reach
AGENT_REACH_PATH = "/home/admin/.gemini/antigravity/scratch/agent-reach"
if AGENT_REACH_PATH not in sys.path:
    sys.path.append(AGENT_REACH_PATH)

try:
    from agent_reach.channels.v2ex import V2EXChannel
except ImportError as e:
    print(f"[Ошибка] Не удалось импортировать V2EXChannel из agent-reach: {e}")
    sys.exit(1)

def get_timestamp():
    return datetime.utcnow().isoformat() + "Z"

def fetch_and_save_v2ex_topics():
    print("[Инфо] Запрос горячих тем V2EX через модуль agent-reach...")
    
    try:
        # Инициализируем канал V2EX из agent-reach
        v2ex = V2EXChannel()
        # Получаем топ-20 горячих тем
        hot_topics = v2ex.get_hot_topics(limit=20)
    except Exception as e:
        print(f"[Ошибка] Ошибка при сборе данных V2EX: {e}")
        return False

    if not hot_topics:
        print("[Ошибка] Собрана пустая лента горячих тем V2EX.")
        return False

    # Форматируем данные под структуру x402 Data Hub
    structured_data = {
        "metadata": {
            "dataset_name": "V2EX Hot Topics",
            "last_updated": get_timestamp(),
            "source": "V2EX API via Agent-Reach",
            "note": "Top trending discussion threads in the developer community."
        },
        "topics": hot_topics
    }

    # Определяем путь сохранения в категорию events
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.abspath(os.path.join(script_dir, "..", "events"))
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, "v2ex-hot-topics.json")
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(structured_data, f, ensure_ascii=False, indent=2)
        
    print(f"[Успех] Горячие темы V2EX успешно сохранены в: {output_path}")
    return True

def main():
    fetch_and_save_v2ex_topics()

if __name__ == "__main__":
    main()
