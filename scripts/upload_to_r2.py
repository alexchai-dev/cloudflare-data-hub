#!/usr/bin/env python3
import os
import sys

# Попробуем импортировать boto3, если его нет — выведем инструкцию
try:
    import boto3
except ImportError:
    print("[Ошибка] Библиотека 'boto3' не установлена. Установите её командой: pip install boto3")
    sys.exit(1)

def upload_file_to_r2(local_path, r2_path):
    # Получаем учетные данные из переменных окружения (в GitHub Actions они задаются через Secrets)
    account_id = os.environ.get("CF_ACCOUNT_ID")
    access_key = os.environ.get("CF_R2_ACCESS_KEY")
    secret_key = os.environ.get("CF_R2_SECRET_KEY")
    bucket_name = "agent-data-vault"

    if not all([account_id, access_key, secret_key]):
        print("[Ошибка] Отсутствуют учетные данные R2 (CF_ACCOUNT_ID, CF_R2_ACCESS_KEY, CF_R2_SECRET_KEY).")
        return False

    # Инициализируем клиент S3, настроенный на эндпоинт Cloudflare R2
    s3_client = boto3.client(
        service_name="s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="auto"
    )

    try:
        print(f"[Инфо] Загрузка {local_path} в R2 бакет '{bucket_name}'...")
        s3_client.upload_file(
            Filename=local_path,
            Bucket=bucket_name,
            Key=r2_path,
            ExtraArgs={"ContentType": "application/json; charset=utf-8"}
        )
        print(f"[Успех] Файл успешно обновлен в R2 по пути: {r2_path}")
        return True
    except Exception as e:
        print(f"[Ошибка] Ошибка загрузки в R2: {e}")
        return False

if __name__ == "__main__":
    # По умолчанию обновляем цены на AI API
    # Определяем путь к файлу динамически относительно расположения скрипта
    script_dir = os.path.dirname(os.path.abspath(__file__))
    local_file = os.path.abspath(os.path.join(script_dir, "..", "data", "saas", "ai-api-pricing.json"))
    r2_destination = "saas/ai-api-pricing.json"
    
    if len(sys.argv) > 2:
        local_file = sys.argv[1]
        r2_destination = sys.argv[2]
        
    upload_file_to_r2(local_file, r2_destination)
