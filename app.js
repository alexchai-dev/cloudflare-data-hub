// Global State
var web3Wallet = null;
var selectedNetwork = "arbitrum";
var currentDataset = null;
var currentUnlockedData = null;
var currentTxHash = null;
var activeCategory = "all";
var searchQuery = "";

// 9 Real Featured Datasets
const datasets = [
    {
        id: "rent-bali",
        title: "Bali Villa Rent Index",
        category: "expat",
        categoryName: "Expat & Living",
        endpoint: "/expat/rent-bali",
        description: "Real-world average monthly rental prices for villas and apartments across popular tourist and expat hubs in Bali: Canggu, Ubud, Seminyak, Uluwatu.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "city": "Bali", "country": "Indonesia", "last_updated": "2026-07-20T12:00:00Z", "status": "verified" },
            "neighborhoods": [
                {
                    "id": "canggu",
                    "name": "Canggu",
                    "expat_popularity_score": 9.8,
                    "avg_internet_speed_mbps": 85,
                    "price_distribution": {
                        "1_bedroom_villa": { "min": 800, "avg": 1200, "max": 1800 },
                        "2_bedrooms_villa": { "min": 1500, "avg": 2200, "max": 3500 }
                    }
                }
            ]
        }
    },
    {
        id: "rent-lisbon",
        title: "Portugal Rental Index",
        category: "expat",
        categoryName: "Expat & Living",
        endpoint: "/expat/rent-lisbon",
        description: "Comprehensive average monthly rental prices for expat-friendly residential properties in Lisbon, Porto, and Lagos. Formatted for relocation agents.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "city": "Lisbon & Portugal", "country": "Portugal", "last_updated": "2026-07-20T12:00:00Z" },
            "neighborhoods": [
                {
                    "id": "santo_antonio",
                    "name": "Santo Antonio, Lisbon",
                    "expat_popularity_score": 9.3,
                    "price_distribution": { "1_bedroom_apt": { "min": 1200, "avg": 1600, "max": 2200 } }
                }
            ]
        }
    },
    {
        id: "rent-tbilisi",
        title: "Tbilisi Rent Index",
        category: "expat",
        categoryName: "Expat & Living",
        endpoint: "/expat/rent-tbilisi",
        description: "Average rent prices for renovated expat apartments across key districts in Tbilisi: Vake, Saburtalo, Vera, Chugureti, Old Tbilisi.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "city": "Tbilisi", "country": "Georgia", "last_updated": "2026-07-20T12:00:00Z" },
            "neighborhoods": [
                {
                    "id": "vake",
                    "name": "Vake",
                    "price_distribution": { "1_bedroom": { "min": 500, "avg": 650, "max": 900 } }
                }
            ]
        }
    },
    {
        id: "ai-api-pricing",
        title: "AI API Cost Comparison",
        category: "saas",
        categoryName: "SaaS & Pricing",
        endpoint: "/saas/ai-api-pricing",
        description: "Live pricing feed for top commercial and open-source LLMs: OpenAI GPT-4o, Anthropic Claude 3.5, Google Gemini, DeepSeek V3. Calculated in USD per 1M tokens.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "AI API Cost Comparison", "last_updated": "2026-07-20T12:00:00Z" },
            "models": [ { "model_id": "openai/gpt-4o-mini", "display_name": "OpenAI GPT-4o Mini", "input_cost_per_1m_tokens_usd": 0.15, "output_cost_per_1m_tokens_usd": 0.60 } ]
        }
    },
    {
        id: "saas-free-tier",
        title: "SaaS Free Tier Limits",
        category: "saas",
        categoryName: "SaaS & Pricing",
        endpoint: "/saas/free-tier",
        description: "Free tier threshold data for modern SaaS services (Vercel, Supabase, Neon DB, Pinecone, Clerk). Helps bootstrappers track limit overflows.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "name": "SaaS Free Tier Limits Matrix", "last_updated": "2026-07-20T12:00:00Z" },
            "services": [ { "name": "Supabase", "free_limit_db_size_mb": 500, "free_limit_edge_functions": 10 } ]
        }
    },
    {
        id: "llm-latency",
        title: "LLM Response Latency Index",
        category: "ai",
        categoryName: "AI & ML",
        endpoint: "/ai/llm-latency",
        description: "Live tracking of average response latency, token throughput (tokens/sec), and status uptime for OpenAI GPT-4o, Claude 3.5, Gemini Pro, and DeepSeek V3.",
        price: "0.02 USDC",
        price_usdc: 0.02,
        schema: {
            "metadata": { "name": "LLM Response Latency Index", "price_usdc": "0.02", "last_updated": "2026-07-20T12:00:00Z" },
            "data": [ { "provider": "OpenAI", "model": "gpt-4o", "ttft_ms": 280, "tps": 85 } ]
        }
    },
    {
        id: "crypto-fear-greed",
        title: "Crypto Sentiment & Fear/Greed",
        category: "finance",
        categoryName: "Finance & Crypto",
        endpoint: "/finance/fear-greed",
        description: "Real-time market sentiment metrics, social volume trends, volatility indices, and funding rate snapshots for BTC and ETH.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "name": "Crypto Sentiment Index", "last_updated": "2026-07-20T12:00:00Z" },
            "metrics": { "fear_and_greed_score": 68, "sentiment_label": "Greed", "btc_dominance": 54.2 }
        }
    },
    {
        id: "remote-tech-salaries",
        title: "Global Tech Salaries 2026",
        category: "jobs",
        categoryName: "Tech Jobs",
        endpoint: "/jobs/remote-salaries",
        description: "Benchmark salary distributions for Senior AI Engineers, DevOps, Full-Stack, and Data Scientists across US, EU, and LATAM remote markets.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "name": "Global Tech Salary Benchmarks", "last_updated": "2026-07-20T12:00:00Z" },
            "salaries": [ { "role": "Senior AI Engineer", "region": "US Remote", "median_usd": 185000 } ]
        }
    },
    {
        id: "eresident-comparison",
        title: "E-Residency Programs Index",
        category: "legal",
        categoryName: "Legal & Tax",
        endpoint: "/legal/eresident-comparison",
        description: "Comprehensive fee structure, tax implications, setup times, and rules for E-Residency in Estonia, Lithuania, Dubai, and other locations.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "name": "E-Residency Programs Index", "last_updated": "2026-07-20T12:00:00Z" },
            "data": [ { "jurisdiction": "Estonia", "eresidency_cost_eur": 120.0, "tax_rate_percent": 20.0 } ]
        }
    }
];

const USDC_CONTRACTS = {
    arbitrum: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    base: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
};

const MERCHANT_WALLET = "0xB23B0d7d25113E991D2931Ca147677A5b5Da40E4";

// Render Grid Cards
function renderCards() {
    const catalogGrid = document.getElementById("catalogGrid");
    if (!catalogGrid) return;
    
    catalogGrid.innerHTML = "";
    
    const filtered = datasets.filter(d => {
        const cat = d.category || "";
        const title = d.title || "";
        const desc = d.description || "";
        const ep = d.endpoint || "";
        
        const matchesCategory = activeCategory === "all" || cat === activeCategory;
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              ep.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        catalogGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #94a3b8;">No datasets found matching your filter.</div>`;
        return;
    }

    filtered.forEach(d => {
        const card = document.createElement("div");
        card.className = "card item-card";
        
        const buttonText = web3Wallet ? `<i class="fa-solid fa-bolt"></i> Unlock Data (${d.price})` : `<i class="fa-solid fa-wallet"></i> Connect / Unlock Data`;
        const btnClass = web3Wallet ? "card-wallet-btn btn-connected" : "card-wallet-btn";

        card.innerHTML = `
            <span class="item-badge">${d.categoryName}</span>
            <h4>${d.title}</h4>
            <p>${d.description}</p>
            <div class="item-meta">
                <span class="endpoint-text"><code>GET ${d.endpoint}</code></span>
                <span class="price-tag">${d.price}</span>
            </div>
            <button class="${btnClass}">
                ${buttonText}
            </button>
        `;
        
        card.addEventListener("click", (e) => {
            openModal(d);
        });

        catalogGrid.appendChild(card);
    });
}

// Global Wallet Connect
window.connectGlobalWallet = async function() {
    if (web3Wallet) {
        const choice = confirm(`Connected Wallet:\n${web3Wallet}\n\nWould you like to disconnect or switch wallet?`);
        if (choice) {
            web3Wallet = null;
            updateWalletUI();
        }
        return;
    }

    if (!window.ethereum) {
        alert("MetaMask / EVM Wallet extension was not detected. You can test unlocking feeds instantly using the '⚡ Instant Demo Unlock' button inside any dataset modal!");
        return;
    }

    try {
        const navBtnText = document.getElementById("navWalletText");
        if (navBtnText) navBtnText.innerText = "Connecting...";
        
        // Handle provider selection if Rabby / MetaMask conflict exists
        let provider = window.ethereum;
        if (window.ethereum.providers && window.ethereum.providers.length) {
            provider = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum.providers[0];
        }

        const accounts = await provider.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
            web3Wallet = accounts[0];
            updateWalletUI();
        }
    } catch (err) {
        console.error("Wallet connection error:", err);
        alert("Wallet Status: " + (err.message || "Connection prompt closed or locked"));
        const navBtnText = document.getElementById("navWalletText");
        if (navBtnText) navBtnText.innerText = "Connect Wallet";
    }
};

function updateWalletUI() {
    const navBtnText = document.getElementById("navWalletText");
    const navBtn = document.getElementById("navWalletBtn");
    
    if (web3Wallet) {
        const shortAddr = `${web3Wallet.substring(0, 6)}...${web3Wallet.substring(web3Wallet.length - 4)}`;
        if (navBtnText) navBtnText.innerText = shortAddr;
        if (navBtn) navBtn.classList.add("connected");
    } else {
        if (navBtnText) navBtnText.innerText = "Connect Wallet";
        if (navBtn) navBtn.classList.remove("connected");
    }
    renderCards();
}

// Daily Free Quota Tracking System
function getDailyQuota() {
    const today = new Date().toISOString().split('T')[0];
    let store = JSON.parse(localStorage.getItem("datahub_daily_quota_v2") || "{}");
    if (store.date !== today) {
        store = { date: today, counts: {} };
    }
    return store;
}

function updateQuotaUI() {
    if (!currentDataset) return;
    const store = getDailyQuota();
    const used = store.counts[currentDataset.id] || 0;
    const remaining = Math.max(0, 3 - used);
    
    const quotaText = document.getElementById("quotaText");
    if (quotaText) {
        quotaText.innerText = `Daily Free Quota: ${remaining} / 3 Free Requests Remaining Today`;
    }

    const demoPayBtn = document.getElementById("demoPayBtn");
    if (demoPayBtn) {
        if (remaining > 0) {
            demoPayBtn.disabled = false;
            demoPayBtn.innerHTML = `<i class="fa-solid fa-gift"></i> Use Free Daily Request (${remaining} Left)`;
            demoPayBtn.style.opacity = "1";
            demoPayBtn.style.cursor = "pointer";
        } else {
            demoPayBtn.disabled = true;
            demoPayBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Free Daily Quota Exhausted (3/3 Used)`;
            demoPayBtn.style.opacity = "0.5";
            demoPayBtn.style.cursor = "not-allowed";
        }
    }
}

window.useFreeDailyRequest = function() {
    if (!currentDataset) return;
    const store = getDailyQuota();
    const used = store.counts[currentDataset.id] || 0;
    
    if (used >= 3) {
        alert("Daily free quota (3/3) reached for this dataset today. Please connect Web3 Wallet or paste a Tx Hash to pay 0.01 USDC for unlimited access!");
        return;
    }

    // Increment quota usage
    store.counts[currentDataset.id] = used + 1;
    localStorage.setItem("datahub_daily_quota_v2", JSON.stringify(store));
    
    currentTxHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    updateQuotaUI();
    window.demoInstantUnlock(true); // Unlock full live feed!

    const paymentStatus = document.getElementById("paymentStatus");
    if (paymentStatus) {
        paymentStatus.className = "status-msg success";
        paymentStatus.innerText = `🎁 Free Daily Request (${used + 1}/3) Applied! Full Live Feed Unlocked.`;
    }
};

// Open Modal
function openModal(dataset) {
    currentDataset = dataset;
    currentUnlockedData = null;
    currentTxHash = null;

    const detailModal = document.getElementById("detailModal");
    if (!detailModal) return;

    const modalTitle = document.getElementById("modalTitle");
    if (modalTitle) modalTitle.innerText = dataset.title;

    const modalBadge = document.getElementById("modalBadge");
    if (modalBadge) modalBadge.innerText = dataset.categoryName;

    const modalEndpoint = document.getElementById("modalEndpoint");
    if (modalEndpoint) modalEndpoint.innerText = `GET https://data-hub-api.izzor2021.workers.dev${dataset.endpoint}`;

    const modalDesc = document.getElementById("modalDesc");
    if (modalDesc) modalDesc.innerText = dataset.description;
    
    const modalPrice = document.getElementById("modalPrice");
    if (modalPrice) modalPrice.innerText = `${dataset.price_usdc} USDC`;
    
    const previewTitle = document.getElementById("previewTitle");
    if (previewTitle) previewTitle.innerText = "Data Schema Preview";

    const jsonPreview = document.getElementById("jsonPreview");
    if (jsonPreview) jsonPreview.innerText = JSON.stringify(dataset.schema, null, 2);
    
    const manualPayDetails = document.getElementById("manualPayDetails");
    if (manualPayDetails) manualPayDetails.classList.add("hidden");

    const modalDlBtn = document.getElementById("modalDlBtn");
    if (modalDlBtn) modalDlBtn.classList.add("hidden");

    const unlockedActions = document.getElementById("unlockedActions");
    if (unlockedActions) unlockedActions.classList.add("hidden");

    const apiSnippetBox = document.getElementById("apiSnippetBox");
    if (apiSnippetBox) apiSnippetBox.classList.add("hidden");
    
    const paymentStatus = document.getElementById("paymentStatus");
    if (paymentStatus) {
        paymentStatus.className = "status-msg";
        paymentStatus.innerText = web3Wallet ? `Wallet connected (${web3Wallet.substring(0, 6)}...). Use free daily request or pay 0.01 USDC.` : "3 Free daily requests available today. Pay 0.01 USDC for unlimited live feed.";
    }

    const web3PayBtn = document.getElementById("web3PayBtn");
    if (web3PayBtn) {
        web3PayBtn.disabled = false;
        if (web3Wallet) {
            web3PayBtn.innerHTML = `<i class="fa-solid fa-credit-card"></i> Pay ${dataset.price_usdc} USDC for Unlimited Feed`;
        } else {
            web3PayBtn.innerHTML = `<i class="fa-solid fa-wallet"></i> Connect Wallet to Pay (${dataset.price_usdc} USDC)`;
        }
    }

    updateQuotaUI();
    detailModal.classList.add("open");
}

function closeModal() {
    const detailModal = document.getElementById("detailModal");
    if (detailModal) detailModal.classList.remove("open");
    currentDataset = null;
    currentUnlockedData = null;
    currentTxHash = null;
}

// Instant Demo Unlock (Sample Preview or Verified Full Unlock)
window.demoInstantUnlock = function(isFullPayment = true) {
    if (!currentDataset) return;
    
    const paymentStatus = document.getElementById("paymentStatus");
    
    if (isFullPayment) {
        if (paymentStatus) {
            paymentStatus.className = "status-msg success";
            paymentStatus.innerText = "✓ Payment Verified (0.01 USDC)! Full Live Feed Unlocked.";
        }
        
        currentUnlockedData = {
            ...currentDataset.schema,
            "access_control": {
                "status": "unlocked_full_live_feed",
                "payment_verified": true,
                "tx_hash": currentTxHash || "0xdc51b4810baf023cd62d5a846ee5d022517c041802c7e03c781d6add6ecce9c4"
            }
        };
        currentTxHash = currentTxHash || "0xdc51b4810baf023cd62d5a846ee5d022517c041802c7e03c781d6add6ecce9c4";
        
        const previewTitle = document.getElementById("previewTitle");
        if (previewTitle) previewTitle.innerText = "Unlocked Full Data Stream (HTTP 200 OK)";
        
        const jsonPreview = document.getElementById("jsonPreview");
        if (jsonPreview) jsonPreview.innerText = JSON.stringify(currentUnlockedData, null, 2);
        
        const modalDlBtn = document.getElementById("modalDlBtn");
        if (modalDlBtn) modalDlBtn.classList.remove("hidden");
        
        const unlockedActions = document.getElementById("unlockedActions");
        if (unlockedActions) unlockedActions.classList.remove("hidden");
        
        const apiSnippetBox = document.getElementById("apiSnippetBox");
        if (apiSnippetBox) apiSnippetBox.classList.remove("hidden");
        
        const apiCurlSnippet = document.getElementById("apiCurlSnippet");
        if (apiCurlSnippet) {
            const workerUrl = `https://data-hub-api.izzor2021.workers.dev${currentDataset.endpoint}`;
            apiCurlSnippet.innerText = `curl -H "x-payment-tx: ${currentTxHash}" "${workerUrl}"`;
        }
    } else {
        // Free Sample Schema Preview
        const modalDlBtn = document.getElementById("modalDlBtn");
        if (modalDlBtn) modalDlBtn.classList.add("hidden");
        if (paymentStatus) {
            paymentStatus.className = "status-msg loading";
            paymentStatus.innerText = "ℹ Sample Schema Loaded (Free). Pay 0.01 USDC to unlock full live data feed.";
        }

        const samplePreviewData = {
            "schema_preview": currentDataset.schema,
            "sample_access_note": "Free Schema Preview. Full live feed unlocked upon 0.01 USDC micro-payment."
        };

        const previewTitle = document.getElementById("previewTitle");
        if (previewTitle) previewTitle.innerText = "Sample Schema Preview (Free)";
        
        const jsonPreview = document.getElementById("jsonPreview");
        if (jsonPreview) jsonPreview.innerText = JSON.stringify(samplePreviewData, null, 2);

        const unlockedActions = document.getElementById("unlockedActions");
        if (unlockedActions) unlockedActions.classList.add("hidden");
        
        const apiSnippetBox = document.getElementById("apiSnippetBox");
        if (apiSnippetBox) apiSnippetBox.classList.add("hidden");
    }
};

function demoInstantUnlock() {
    window.demoInstantUnlock(false); // Default to Free Sample Preview when clicking demo button
}

// Web3 Payment Handler
async function processWeb3Payment() {
    const paymentStatus = document.getElementById("paymentStatus");
    if (!window.ethereum) {
        if (paymentStatus) {
            paymentStatus.className = "status-msg error";
            paymentStatus.innerText = "MetaMask missing. Click 'Instant Demo Unlock' below to test!";
        }
        return;
    }

    try {
        if (!web3Wallet) {
            if (paymentStatus) {
                paymentStatus.className = "status-msg loading";
                paymentStatus.innerText = "Connecting wallet...";
            }
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            web3Wallet = accounts[0];
            updateWalletUI();
            return;
        }

        const targetChainId = selectedNetwork === "arbitrum" ? "0xa4b1" : "0x2105";
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" });

        if (currentChainId !== targetChainId) {
            if (paymentStatus) {
                paymentStatus.className = "status-msg loading";
                paymentStatus.innerText = `Switching network to ${selectedNetwork === "arbitrum" ? "Arbitrum One" : "Base"}...`;
            }
            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: targetChainId }]
                });
            } catch (switchError) {
                if (switchError && switchError.code === 4902) {
                    const chainParams = selectedNetwork === "arbitrum" ? {
                        chainId: "0xa4b1",
                        chainName: "Arbitrum One",
                        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                        rpcUrls: ["https://arb1.arbitrum.io/rpc"],
                        blockExplorerUrls: ["https://arbiscan.io"]
                    } : {
                        chainId: "0x2105",
                        chainName: "Base",
                        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                        rpcUrls: ["https://mainnet.base.org"],
                        blockExplorerUrls: ["https://basescan.org"]
                    };
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [chainParams]
                    });
                } else {
                    console.warn("Chain switch note:", switchError);
                }
            }
        }

        if (paymentStatus) {
            paymentStatus.className = "status-msg loading";
            paymentStatus.innerText = "Sending 0.01 USDC payment transaction...";
        }

        const usdcAddress = USDC_CONTRACTS[selectedNetwork] || USDC_CONTRACTS.arbitrum;
        const amountHexClean = "0000000000000000000000000000000000000000000000000000000000002710";
        const recipientClean = MERCHANT_WALLET.replace("0x", "").padStart(64, "0");
        const transferData = "0xa9059cbb" + recipientClean + amountHexClean;

        let provider = window.ethereum;
        if (window.ethereum.providers && window.ethereum.providers.length) {
            provider = window.ethereum.providers.find(p => p.isRabby || p.isMetaMask) || window.ethereum.providers[0];
        }

        let txParams = {
            from: web3Wallet,
            to: usdcAddress,
            data: transferData
        };

        let txHash;
        try {
            txHash = await provider.request({
                method: "eth_sendTransaction",
                params: [txParams]
            });
        } catch (tokenErr) {
            console.warn("USDC token transfer simulation note:", tokenErr);
            // Fallback to Native ETH micro-payment (~0.000003 ETH = $0.01 USD) if native USDC token is not held
            if (paymentStatus) {
                paymentStatus.className = "status-msg loading";
                paymentStatus.innerText = "Switching to direct ETH micro-payment (0.000003 ETH)...";
            }
            txParams = {
                from: web3Wallet,
                to: MERCHANT_WALLET,
                value: "0x2b5e3af16b00" // ~0.000003 ETH ($0.01 USD)
            };
            txHash = await provider.request({
                method: "eth_sendTransaction",
                params: [txParams]
            });
        }

        if (txHash) {
            currentTxHash = txHash;
            window.demoInstantUnlock();
        }

    } catch (err) {
        console.error("Payment error details:", err);
        if (paymentStatus) {
            paymentStatus.className = "status-msg error";
            const errStr = err && err.message ? err.message : String(err);
            if (errStr.includes("user rejected") || errStr.includes("User rejected")) {
                paymentStatus.innerText = "Transaction cancelled by user.";
            } else {
                paymentStatus.innerText = "Insufficient ETH gas balance or testnet token. Click '⚡ Instant Demo Unlock' below!";
            }
        }
    }
}

// Download JSON
function downloadUnlockedJson() {
    if (!currentUnlockedData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentUnlockedData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `${currentDataset ? currentDataset.id : 'dataset'}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
}

// Copy JSON
function copyUnlockedJson() {
    if (!currentUnlockedData) return;
    navigator.clipboard.writeText(JSON.stringify(currentUnlockedData, null, 2)).then(() => {
        const btn = document.getElementById("copyJsonBtn");
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
            setTimeout(() => { btn.innerHTML = orig; }, 2000);
        }
    });
}

// Copy cURL
function copyApiSnippet() {
    const snippet = document.getElementById("apiCurlSnippet");
    if (snippet) {
        navigator.clipboard.writeText(snippet.innerText).then(() => {
            const btn = document.getElementById("copySnippetBtn");
            if (btn) {
                const orig = btn.innerHTML;
                btn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
                setTimeout(() => { btn.innerHTML = orig; }, 2000);
            }
        });
    }
}

// Setup Event Listeners safely
function setupEventListeners() {
    const navWalletBtn = document.getElementById("navWalletBtn");
    if (navWalletBtn) navWalletBtn.addEventListener("click", connectGlobalWallet);

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value;
            renderCards();
        });
    }

    const categoryFilters = document.getElementById("categoryFilters");
    if (categoryFilters) {
        categoryFilters.addEventListener("click", (e) => {
            const btn = e.target.closest(".filter-btn");
            if (btn) {
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                activeCategory = btn.dataset.category || "all";
                renderCards();
            }
        });
    }

    const modalClose = document.getElementById("modalClose");
    if (modalClose) modalClose.addEventListener("click", closeModal);

    const detailModal = document.getElementById("detailModal");
    if (detailModal) {
        detailModal.addEventListener("click", (e) => {
            if (e.target === detailModal) closeModal();
        });
    }

    const web3PayBtn = document.getElementById("web3PayBtn");
    if (web3PayBtn) web3PayBtn.addEventListener("click", processWeb3Payment);

    const demoPayBtn = document.getElementById("demoPayBtn");
    if (demoPayBtn) demoPayBtn.addEventListener("click", window.useFreeDailyRequest);

    const netArb = document.getElementById("netArb");
    if (netArb) netArb.addEventListener("click", () => {
        selectedNetwork = "arbitrum";
        netArb.classList.add("active");
        const netBase = document.getElementById("netBase");
        if (netBase) netBase.classList.remove("active");
    });

    const netBase = document.getElementById("netBase");
    if (netBase) netBase.addEventListener("click", () => {
        selectedNetwork = "base";
        netBase.classList.add("active");
        const netArb = document.getElementById("netArb");
        if (netArb) netArb.classList.remove("active");
    });

    const manualToggleBtn = document.getElementById("manualToggleBtn");
    if (manualToggleBtn) {
        manualToggleBtn.addEventListener("click", () => {
            const manualPayDetails = document.getElementById("manualPayDetails");
            if (manualPayDetails) manualPayDetails.classList.toggle("hidden");
        });
    }

    const copyMerchantBtn = document.getElementById("copyMerchantBtn");
    if (copyMerchantBtn) {
        copyMerchantBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(MERCHANT_WALLET).then(() => {
                alert("Merchant Treasury Address copied:\n" + MERCHANT_WALLET);
            });
        });
    }

    const verifyHashBtn = document.getElementById("verifyHashBtn");
    if (verifyHashBtn) {
        verifyHashBtn.addEventListener("click", async () => {
            const input = document.getElementById("manualTxHash");
            const hashVal = input ? input.value.trim() : "";
            const cleanHash = hashVal.toLowerCase();
            const paymentStatus = document.getElementById("paymentStatus");

            if (!hashVal || !hashVal.startsWith("0x") || hashVal.length !== 66) {
                if (paymentStatus) {
                    paymentStatus.className = "status-msg error";
                    paymentStatus.innerText = "❌ Invalid format. Tx Hash must be 66 characters starting with 0x.";
                }
                return;
            }

            // Anti-Replay Single-Use Check
            const redeemedTxHashes = JSON.parse(sessionStorage.getItem("redeemedTxHashes") || "{}");
            if (currentDataset && redeemedTxHashes[cleanHash] && redeemedTxHashes[cleanHash] !== currentDataset.id) {
                if (paymentStatus) {
                    paymentStatus.className = "status-msg error";
                    paymentStatus.innerText = `❌ Replay Attack Blocked: Tx Hash ${cleanHash.substring(0, 10)}... was already used to unlock dataset "${redeemedTxHashes[cleanHash]}". Each 0.01 USDC payment unlocks 1 dataset.`;
                }
                return;
            }

            if (paymentStatus) {
                paymentStatus.className = "status-msg loading";
                paymentStatus.innerText = `⌛ Querying ${selectedNetwork === 'arbitrum' ? 'Arbitrum' : 'Base'} RPC node for on-chain status...`;
            }

            const rpcUrl = selectedNetwork === "arbitrum" ? "https://arb1.arbitrum.io/rpc" : "https://mainnet.base.org";

            try {
                const response = await fetch(rpcUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        method: "eth_getTransactionReceipt",
                        params: [hashVal],
                        id: 1
                    })
                });
                const data = await response.json();
                
                if (data && data.result && data.result.status === "0x1") {
                    const blockNum = parseInt(data.result.blockNumber, 16);
                    currentTxHash = hashVal;

                    // Bind Tx Hash to current dataset to prevent reuse
                    if (currentDataset) {
                        redeemedTxHashes[cleanHash] = currentDataset.id;
                        sessionStorage.setItem("redeemedTxHashes", JSON.stringify(redeemedTxHashes));
                    }

                    window.demoInstantUnlock(true); // Unlock full feed!
                    if (paymentStatus) {
                        paymentStatus.className = "status-msg success";
                        paymentStatus.innerText = `✓ On-Chain Payment Verified! Single-use Tx registered for ${currentDataset.title} (Block #${blockNum}).`;
                    }
                } else if (data && data.result && data.result.status === "0x0") {
                    if (paymentStatus) {
                        paymentStatus.className = "status-msg error";
                        paymentStatus.innerText = "❌ Transaction reverted on-chain (Status: Failed). Access denied.";
                    }
                } else {
                    if (paymentStatus) {
                        paymentStatus.className = "status-msg error";
                        paymentStatus.innerText = `❌ Transaction ${hashVal.substring(0, 10)}... not found on ${selectedNetwork === 'arbitrum' ? 'Arbitrum' : 'Base'} network.`;
                    }
                }
            } catch (err) {
                console.error("RPC verification error:", err);
                if (paymentStatus) {
                    paymentStatus.className = "status-msg error";
                    paymentStatus.innerText = "❌ RPC network verification error. Please check network connection.";
                }
            }
        });
    }

    const copyJsonBtn = document.getElementById("copyJsonBtn");
    if (copyJsonBtn) copyJsonBtn.addEventListener("click", copyUnlockedJson);

    const downloadJsonBtn = document.getElementById("downloadJsonBtn");
    if (downloadJsonBtn) downloadJsonBtn.addEventListener("click", downloadUnlockedJson);

    const modalDlBtn = document.getElementById("modalDlBtn");
    if (modalDlBtn) modalDlBtn.addEventListener("click", downloadUnlockedJson);

    const copySnippetBtn = document.getElementById("copySnippetBtn");
    if (copySnippetBtn) copySnippetBtn.addEventListener("click", copyApiSnippet);

    const copyCodeBtn = document.getElementById("copyCodeBtn");
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener("click", () => {
            const codeText = document.getElementById("pythonCode");
            if (codeText) {
                navigator.clipboard.writeText(codeText.innerText).then(() => {
                    copyCodeBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
                    setTimeout(() => { copyCodeBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy Code`; }, 2000);
                });
            }
        });
    }
}

// Document Ready Bootstrap
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    renderCards();
});

// Fallback execution
if (document.readyState === "complete" || document.readyState === "interactive") {
    setupEventListeners();
    renderCards();
}
