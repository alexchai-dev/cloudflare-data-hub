#!/usr/bin/env python3
import json
import os
import sys
from datetime import datetime

# Импортируем наши скраперы
try:
    import update_ai_pricing
    import update_social_data
except ImportError:
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    import update_ai_pricing
    import update_social_data

try:
    import boto3
except ImportError:
    print("[Ошибка] Библиотека 'boto3' не установлена.")
    sys.exit(1)

def get_timestamp():
    return datetime.utcnow().isoformat() + "Z"

def update_all_metadata(data_dir):
    print("[Инфо] Обновление метаданных и временных меток для всех датасетов...")
    
    # 1. Запускаем живой скрапер цен AI API
    try:
        print("[Инфо] Запуск живого скрапера цен AI API...")
        update_ai_pricing.main()
    except Exception as e:
        print(f"[Ошибка] Не удалось запустить скрапер цен AI: {e}")

    # 1.2 Запускаем скрапер социальных данных V2EX
    try:
        print("[Инфо] Запуск скрапера V2EX...")
        update_social_data.main()
    except Exception as e:
        print(f"[Ошибка] Не удалось запустить скрапер V2EX: {e}")

    # 2. Обходим все JSON-файлы в разрешенных папках категорий
    updated_files = []
    
    # Список категорий, которые лежат прямо в корне репозитория
    valid_categories = {"ai", "events", "expat", "finance", "jobs", "legal", "local", "products", "saas", "travel"}
    
    for category in valid_categories:
        cat_dir = os.path.join(data_dir, category)
        if not os.path.exists(cat_dir):
            continue
            
        print(f"[Инфо] Сканирование категории: {category}")
        for root, dirs, files in os.walk(cat_dir):
            for file in files:
                if file.endswith(".json"):
                    # Исключаем файлы транзакций
                    if "txs" in root:
                        continue
                        
                    file_path = os.path.join(root, file)
                    
                    # Не перезаписываем повторно динамически сгенерированные файлы
                    if file in ["ai-api-pricing.json", "v2ex-hot-topics.json"]:
                        updated_files.append(file_path)
                        continue
                    
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                        
                        # Обновляем временную метку
                        if "metadata" in data:
                            data["metadata"]["last_updated"] = get_timestamp()
                            data["metadata"]["status"] = "verified"
                            
                            # Сохраняем обновленный файл обратно
                            with open(file_path, "w", encoding="utf-8") as f:
                                json.dump(data, f, ensure_ascii=False, indent=2)
                            
                            updated_files.append(file_path)
                    except Exception as e:
                        print(f"[Предупреждение] Не удалось обновить {file}: {e}")
                        
    print(f"[Успех] Обновлены временные метки для {len(updated_files)} файлов.")
    return updated_files

def upload_files_to_r2(files_list, data_dir):
    account_id = os.environ.get("CF_ACCOUNT_ID")
    access_key = os.environ.get("CF_R2_ACCESS_KEY")
    secret_key = os.environ.get("CF_R2_SECRET_KEY")
    bucket_name = "agent-data-vault"

    if not all([account_id, access_key, secret_key]):
        print("[Ошибка] Отсутствуют учетные данные Cloudflare R2.")
        return False

    s3_client = boto3.client(
        service_name="s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="auto"
    )

    print(f"[Инфо] Загрузка {len(files_list)} файлов в Cloudflare R2...")
    success_count = 0
    
    for file_path in files_list:
        # Вычисляем относительный путь для R2 (например, saas/free-tier.json)
        r2_path = os.path.relpath(file_path, data_dir)
        
        try:
            s3_client.upload_file(
                Filename=file_path,
                Bucket=bucket_name,
                Key=r2_path,
                ExtraArgs={"ContentType": "application/json; charset=utf-8"}
            )
            success_count += 1
        except Exception as e:
            print(f"[Ошибка] Не удалось загрузить в R2 {r2_path}: {e}")
            
    print(f"[Успех] Успешно загружено {success_count} из {len(files_list)} файлов в R2.")
    return success_count == len(files_list)

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Папки категорий лежат прямо в корне репозитория (один уровень вверх от scripts)
    data_dir = os.path.abspath(os.path.join(script_dir, ".."))
    
    # Шаг 1: Обновляем все JSON локально
    updated_files = update_all_metadata(data_dir)
    
    # Шаг 2: Загружаем все обновленные файлы в R2
    if updated_files:
        upload_files_to_r2(updated_files, data_dir)
    else:
        print("[Ошибка] Нет файлов для обновления.")

if __name__ == "__main__":
    main()
