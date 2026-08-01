import worker from '../index.js';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Имитируем R2 бакет
const mockStorage = new Map();
const env = {
  MERCHANT_ADDRESS: "0xB23B0d7d25113E991D2931Ca147677A5b5Da40E4",
  DATA_VAULT: {
    async get(key) {
      if (mockStorage.has(key)) {
        return {
          body: mockStorage.get(key),
          httpEtag: '"mock-etag"',
          uploaded: new Date()
        };
      }
      const filePath = path.join(__dirname, '../data', key);
      try {
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          return {
            body: fs.readFileSync(filePath),
            httpEtag: `"${stats.mtimeMs}"`,
            uploaded: stats.mtime
          };
        }
      } catch (err) {
        console.error("Ошибка чтения mock R2:", err);
      }
      return null;
    },
    async put(key, value) {
      mockStorage.set(key, value);
    }
  }
};

// Заглушка (Mock) для глобального fetch, имитируем RPC Arbitrum One
global.fetch = async (url, options) => {
  if (url === "https://arb1.arbitrum.io/rpc") {
    const body = JSON.parse(options.body);
    if (body.method === "eth_getTransactionReceipt") {
      const txHash = body.params[0];
      
      // 1. Имитируем успешный платеж 1.00 USDC на Arbitrum (контракт Native USDC: 0xaf88...)
      if (txHash === "0x0000000000000000000000000000000000000000000000000000000000000001") {
        return new Response(JSON.stringify({
          result: {
            status: "0x1",
            logs: [
              {
                address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831", // Arbitrum Native USDC
                topics: [
                  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", // Transfer event
                  "0x0000000000000000000000001111111111111111111111111111111111111111", // from
                  "0x000000000000000000000000b23b0d7d25113e991d2931ca147677a5b5da40e4"  // to (merchant address)
                ],
                data: "0x00000000000000000000000000000000000000000000000000000000000f4240" // 1,000,000 (1.00 USDC)
              }
            ]
          }
        }));
      }
      
      // 2. Имитируем отклоненную/проваленную транзакцию
      if (txHash === "0x0000000000000000000000000000000000000000000000000000000000000002") {
        return new Response(JSON.stringify({
          result: {
            status: "0x0",
            logs: []
          }
        }));
      }
    }
  }
  return new Response(JSON.stringify({ error: "Transaction not found" }), { status: 200 });
};

async function runTests() {
  console.log("=== Запуск тестов Cloudflare Worker с платежами Arbitrum ===");

  // 1. Тест корневого маршрута (Welcome)
  {
    console.log("Тест 1: GET / (корневой маршрут)");
    const req = new Request("https://api.datahub.com/", { method: "GET" });
    const res = await worker.fetch(req, env, {});
    
    assert.strictEqual(res.status, 200);
    console.log("  [ПРОЙДЕНО]");
  }

  // 2. Тест запроса без заголовка оплаты (Ожидается 402 Payment Required)
  {
    console.log("Тест 2: GET /expat/rent-tbilisi без оплаты (Ожидается 402)");
    const req = new Request("https://api.datahub.com/expat/rent-tbilisi", { method: "GET" });
    const res = await worker.fetch(req, env, {});
    
    assert.strictEqual(res.status, 402);
    assert.strictEqual(res.headers.get("x-payment-address"), env.MERCHANT_ADDRESS);
    assert.strictEqual(res.headers.get("x-payment-price"), "0.01");
    assert.strictEqual(res.headers.get("x-payment-network"), "arbitrum");
    
    const body = await res.json();
    assert.ok(body.error.includes("Payment Required"));
    console.log("  [ПРОЙДЕНО]");
  }

  // 3. Тест запроса с успешным хэшем транзакции на Arbitrum (Ожидается 200)
  {
    console.log("Тест 3: GET /expat/rent-tbilisi с верной Arbitrum транзакцией (Ожидается 200)");
    const tx = "0x0000000000000000000000000000000000000000000000000000000000000001";
    const req = new Request("https://api.datahub.com/expat/rent-tbilisi", {
      method: "GET",
      headers: { "x-payment-tx": tx }
    });
    const res = await worker.fetch(req, env, {});
    
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.metadata.city, "Tbilisi");
    console.log("  [ПРОЙДЕНО]");
  }

  // 4. Тест повторной отправки той же транзакции (Ожидается 400 Double Spend)
  {
    console.log("Тест 4: Повторная отправка той же транзакции (Ожидается 400)");
    const tx = "0x0000000000000000000000000000000000000000000000000000000000000001";
    const req = new Request("https://api.datahub.com/expat/rent-tbilisi", {
      method: "GET",
      headers: { "x-payment-tx": tx }
    });
    const res = await worker.fetch(req, env, {});
    
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes("уже была использована"));
    console.log("  [ПРОЙДЕНО]");
  }

  // 5. Тест запроса с отклоненной транзакцией (Ожидается 400)
  {
    console.log("Тест 5: GET с неуспешной транзакцией (Ожидается 400)");
    const tx = "0x0000000000000000000000000000000000000000000000000000000000000002";
    const req = new Request("https://api.datahub.com/expat/rent-tbilisi", {
      method: "GET",
      headers: { "x-payment-tx": tx }
    });
    const res = await worker.fetch(req, env, {});
    
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes("завершилась ошибкой"));
    console.log("  [ПРОЙДЕНО]");
  }

  console.log("\n=== Все Arbitrum тесты успешно пройдены! ===");
}

runTests().catch(err => {
  console.error("Тест провалился:", err);
  process.exit(1);
});
