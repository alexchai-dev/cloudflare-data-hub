export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Стандартные заголовки CORS для ИИ-агентов
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-payment-tx',
      'Access-Control-Expose-Headers': 'x-payment-address, x-payment-price, x-payment-networks',
      'Content-Type': 'application/json; charset=utf-8'
    };

    // Обработка предварительных CORS-запросов (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Разрешаем только GET запросы
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: "Method not allowed. Only GET is supported." }), {
        status: 405,
        headers: corsHeaders
      });
    }

    // Очищаем путь от лишних слешей
    let cleanPath = path.replace(/^\/+|\/+$/g, '');

    // Стартовая страница шлюза
    if (!cleanPath) {
      return new Response(JSON.stringify({
        message: "Добро пожаловать в Cloudflare x402 Data Hub!",
        usage: "GET /<категория>/<название-датасета> (например: GET /expat/rent-tbilisi)"
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // Проверяем наличие привязки R2
    if (!env.DATA_VAULT) {
      return new Response(JSON.stringify({
        error: "Ошибка конфигурации: бакет R2 с привязкой 'DATA_VAULT' не найден."
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // Проверяем наличие адреса продавца в настройках Worker
    const merchantAddress = env.MERCHANT_ADDRESS;
    if (!merchantAddress) {
      return new Response(JSON.stringify({
        error: "Ошибка конфигурации: переменная 'MERCHANT_ADDRESS' не задана в настройках Worker."
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // 1. Получаем запрашиваемый файл данных из R2 для определения цены
    const fileKey = `${cleanPath}.json`;
    const object = await env.DATA_VAULT.get(fileKey);

    if (!object) {
      return new Response(JSON.stringify({
        error: `Набор данных не найден: '${cleanPath}'.`
      }), {
        status: 404,
        headers: corsHeaders
      });
    }

    // Читаем содержимое файла
    const fileText = await object.text();
    let fileData;
    try {
      fileData = JSON.parse(fileText);
    } catch (e) {
      fileData = {};
    }

    // Динамическая цена из метаданных (дефолт: 0.01 USDC)
    const priceUSD = fileData.metadata?.price_usdc !== undefined ? parseFloat(fileData.metadata.price_usdc) : 0.01;

    // Конфигурация поддерживаемых сетей
    const networks = {
      arbitrum: {
        rpc: "https://arb1.arbitrum.io/rpc",
        usdc: [
          "0xaf88d065e77c8cc2239327c5edb3a432268e5831", // Native USDC
          "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"  // Bridged USDC.e
        ],
        name: "Arbitrum One"
      },
      base: {
        rpc: "https://mainnet.base.org",
        usdc: [
          "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"  // Native USDC
        ],
        name: "Base"
      }
    };

    // Получаем транзакцию оплаты из заголовков запроса
    const txHash = request.headers.get("x-payment-tx");

    // 14-Day Free Launch Promo Flag (Set to true during Launch Special, or controlled via env.FREE_TRIAL_MODE)
    const isLaunchPromo = env.FREE_TRIAL_MODE === "false" ? false : true;

    // Если транзакции нет — проверяем промо-акцию або выдаем 402 (Payment Required)
    if (!txHash) {
      if (isLaunchPromo) {
        // Во время Launch Special отдаем данные бесплатно с промо-заголовком!
        const promoHeaders = new Headers({
          ...corsHeaders,
          'x-launch-promo': '14-Day Free Launch Access Active (50 Free Requests/Day)',
          'ETag': object.httpEtag,
          'Last-Modified': object.uploaded.toUTCString()
        });

        return new Response(fileText, {
          status: 200,
          headers: promoHeaders
        });
      }

      return new Response(JSON.stringify({
        error: `Payment Required. Для доступа к данным необходимо отправить ${priceUSD} USDC на указанный адрес в сети Arbitrum One или Base, и передать хэш транзакции в заголовке 'x-payment-tx'.`,
        payment_instructions: {
          address: merchantAddress,
          price_usdc: priceUSD,
          networks: ["Arbitrum One", "Base"],
          header_required: "x-payment-tx"
        }
      }), {
        status: 402,
        headers: {
          ...corsHeaders,
          'x-payment-address': merchantAddress,
          'x-payment-price': priceUSD.toString(),
          'x-payment-networks': 'arbitrum,base'
        }
      });
    }

    // Проверяем формат хэша транзакции EVM
    const txRegex = /^0x([A-Fa-f0-9]{64})$/;
    if (!txRegex.test(txHash)) {
      return new Response(JSON.stringify({ error: "Неверный формат хэша транзакции. Ожидается хэш EVM (0x...)." }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Вспомогательная функция запроса чека к RPC ноде
    async function getTransactionReceipt(rpcUrl, hash) {
      try {
        const response = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getTransactionReceipt",
            params: [hash],
            id: 1
          })
        });
        const data = await response.json();
        return data.result || null;
      } catch (err) {
        return null;
      }
    }

    try {
      // 2. Проверяем в R2, не использовалась ли эта транзакция ранее
      const txKey = `txs/${txHash}.json`;
      const usedTx = await env.DATA_VAULT.get(txKey);
      if (usedTx) {
        return new Response(JSON.stringify({ error: "Эта транзакция уже была использована для оплаты." }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // 3. Параллельно опрашиваем ноды Arbitrum и Base
      const [receiptArb, receiptBase] = await Promise.all([
        getTransactionReceipt(networks.arbitrum.rpc, txHash),
        getTransactionReceipt(networks.base.rpc, txHash)
      ]);

      let receipt = null;
      let networkKey = null;

      if (receiptArb) {
        receipt = receiptArb;
        networkKey = "arbitrum";
      } else if (receiptBase) {
        receipt = receiptBase;
        networkKey = "base";
      }

      if (!receipt) {
        return new Response(JSON.stringify({
          error: "Транзакция не найдена в блокчейнах Arbitrum One или Base. Подождите несколько секунд или проверьте хэш."
        }), {
          status: 402,
          headers: corsHeaders
        });
      }

      // Проверяем успешность выполнения транзакции (status должен быть 0x1)
      if (receipt.status !== "0x1") {
        return new Response(JSON.stringify({ error: "Указанная транзакция завершилась ошибкой в блокчейне." }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // 4. Проверяем логи события Transfer для USDC
      let isPaymentValid = false;
      const cleanMerchantAddr = merchantAddress.toLowerCase().replace("0x", "");
      const paddedMerchantAddr = "0x" + cleanMerchantAddr.padStart(64, "0");
      const validTokens = networks[networkKey].usdc;

      for (const log of receipt.logs || []) {
        const logAddress = log.address.toLowerCase();
        const topics = log.topics || [];

        // Проверяем, что событие Transfer исходит от легитимного USDC-контракта на выбранной сети
        const isUSDCToken = validTokens.some(token => token.toLowerCase() === logAddress);
        if (
          isUSDCToken &&
          topics.length >= 3 &&
          topics[0].toLowerCase() === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
        ) {
          // Проверяем получателя
          if (topics[2].toLowerCase() === paddedMerchantAddr) {
            const rawAmount = parseInt(log.data, 16);
            const amountUSDC = rawAmount / 1000000; // У всех USDC на Arbitrum/Base 6 знаков

            if (amountUSDC >= priceUSD) {
              isPaymentValid = true;
              break;
            }
          }
        }
      }

      if (!isPaymentValid) {
        return new Response(JSON.stringify({
          error: `Транзакция верна, но в ней нет перевода как минимум ${priceUSD} USDC на кошелек продавца в сети ${networks[networkKey].name}.`
        }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // 5. Записываем транзакцию в R2 как использованную
      await env.DATA_VAULT.put(txKey, JSON.stringify({
        used_at: new Date().toISOString(),
        amount: priceUSD,
        network: networkKey
      }));

      // 6. Отдаем содержимое файла данных
      const responseHeaders = new Headers({
        ...corsHeaders,
        'ETag': object.httpEtag,
        'Last-Modified': object.uploaded.toUTCString(),
      });

      return new Response(fileText, {
        headers: responseHeaders
      });

    } catch (e) {
      return new Response(JSON.stringify({
        error: "Внутренняя ошибка при проверке транзакции",
        details: e.message
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};
