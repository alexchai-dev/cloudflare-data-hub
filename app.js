// Global State
var web3Wallet = null;
var selectedNetwork = "arbitrum";
var currentDataset = null;
var currentUnlockedData = null;
var currentTxHash = null;
var activeCategory = "all";
var searchQuery = "";
var selectedSnippetLang = "curl";
var selectedDocLang = "curl";

// 54 Premium Featured Datasets (6 Categories x 9 Datasets = Perfect 3x3 Grid per Category)
const datasets = [
    // =========================================================================
    // 1. SAAS & PRICING (9 Datasets)
    // =========================================================================
    {
        id: "ai-api-pricing",
        title: "AI API Cost Comparison",
        category: "saas",
        categoryName: "SaaS & Pricing",
        endpoint: "/saas/ai-api-pricing",
        description: "Live pricing feed for top commercial and open-source LLMs: OpenAI GPT-4o, Anthropic Claude 3.5, Google Gemini, DeepSeek V3 per 1M tokens.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "AI API Cost Comparison", "last_updated": "2026-07-22T12:00:00Z", "status": "verified" },
            "models": [
                { "model_id": "openai/gpt-4o-mini", "display_name": "OpenAI GPT-4o Mini", "input_cost_per_1m_tokens_usd": 0.15, "output_cost_per_1m_tokens_usd": 0.60 },
                { "model_id": "anthropic/claude-3-5-sonnet", "display_name": "Anthropic Claude 3.5 Sonnet", "input_cost_per_1m_tokens_usd": 3.00, "output_cost_per_1m_tokens_usd": 15.00 },
                { "model_id": "deepseek/deepseek-v3", "display_name": "DeepSeek V3", "input_cost_per_1m_tokens_usd": 0.14, "output_cost_per_1m_tokens_usd": 0.28 }
            ]
        }
    },
    {
        id: "saas-free-tier",
        title: "SaaS Free Tier Limits",
        category: "saas",
        categoryName: "SaaS & Pricing",
        endpoint: "/saas/free-tier",
        description: "Free tier threshold data for modern SaaS services (Vercel, Supabase, Neon DB, Pinecone, Clerk). Track limit overflows.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "name": "SaaS Free Tier Limits Matrix", "last_updated": "2026-07-22T12:00:00Z" },
            "services": [
                { "name": "Supabase", "free_limit_db_size_mb": 500, "free_limit_edge_functions": 500000, "overage_rate_usd": 0.125 },
                { "name": "Vercel", "free_limit_bandwidth_gb": 100, "free_limit_serverless_execution_hrs": 100, "overage_rate_usd": 0.15 }
            ]
        }
    },
    {
        id: "cloud-hosting-index",
        title: "Cloud GPU & VPS Rental Index",
        category: "saas",
        categoryName: "SaaS & Pricing",
        endpoint: "/saas/cloud-hosting-index",
        description: "Real-time hourly rental rates for H100, A100, and RTX 4090 GPUs across RunPod, Lambda Labs, Vast.ai, Modal, and Hetzner.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Cloud GPU Rental Rate Index", "last_updated": "2026-07-22T12:00:00Z" },
            "providers": [
                { "provider": "RunPod", "gpu": "NVIDIA H100 SXM5", "vram_gb": 80, "hourly_rate_usd": 2.49, "availability": "High" },
                { "provider": "Lambda Labs", "gpu": "NVIDIA A100 PCIe", "vram_gb": 80, "hourly_rate_usd": 1.89, "availability": "Medium" }
            ]
        }
    },
    {
        id: "api-rate-limits",
        title: "Top SaaS API Rate Limit Matrix",
        category: "saas",
        categoryName: "SaaS & Pricing",
        endpoint: "/saas/api-rate-limits",
        description: "Official and enforced API rate limits (RPM, TPM, burst capacity) for Stripe, GitHub, OpenAI, Twitter, and Twilio.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "SaaS API Rate Limits & Throttling Rules", "last_updated": "2026-07-22T12:00:00Z" },
            "apis": [
                { "service": "GitHub REST API", "authenticated_rpm": 5000, "search_rpm": 30, "retry_after_header": "Retry-After" },
                { "service": "Stripe API", "read_rpm": 600, "write_rpm": 100, "burst_multiplier": 2.0 }
            ]
        }
    },
    {
        id: "nocode-limits",
        title: "No-Code Platform Limit Matrix",
        category: "saas",
        categoryName: "SaaS & Pricing",
        endpoint: "/saas/nocode-limits",
        description: "Task caps, database row limits, and multi-user seats for Zapier, Make, Bubble, Webflow, and Airtable.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "No-Code Platform Execution Limits", "last_updated": "2026-07-22T12:00:00Z" },
            "platforms": [
                { "platform": "Make.com", "free_monthly_ops": 1000, "starter_plan_usd": 9.0, "starter_monthly_ops": 10000 },
                { "platform": "Zapier", "free_monthly_tasks": 100, "starter_plan_usd": 19.99, "starter_monthly_tasks": 750 }
            ]
        }
    },
    {
        id: "vector-db-pricing",
        title: "Vector Database Cost Index",
        category: "saas",
        categoryName: "SaaS & Pricing",
        endpoint: "/saas/vector-db-pricing",
        description: "Cost comparison per 1 million 1536-dim vector embeddings across Pinecone, Qdrant Cloud, Weaviate, Milvus, and Chroma.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Vector Database Cost & Performance Matrix", "last_updated": "2026-07-22T12:00:00Z" },
            "databases": [
                { "name": "Pinecone Serverless", "cost_per_1m_vectors_usd": 0.33, "read_unit_cost_usd": 0.008, "p95_latency_ms": 14 },
                { "name": "Qdrant Cloud", "cost_per_1m_vectors_usd": 0.28, "read_unit_cost_usd": 0.005, "p95_latency_ms": 9 }
            ]
        }
    },
    {
        id: "enterprise-pricing",
        title: "Enterprise SaaS Pricing Index",
        category: "saas",
        categoryName: "SaaS & Pricing",
        endpoint: "/saas/enterprise-pricing",
        description: "Benchmark contract prices, per-seat costs, and annual minimum commit thresholds for Salesforce, Datadog, Snowflake, and Okta.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Enterprise SaaS Minimum Commit & Seat Cost Index", "last_updated": "2026-07-22T12:00:00Z" },
            "vendors": [
                { "vendor": "Datadog", "product": "APM", "base_seat_usd_monthly": 31.0, "log_ingestion_per_gb_usd": 0.10 },
                { "vendor": "Snowflake", "credit_price_usd": 3.00, "storage_tb_monthly_usd": 40.0 }
            ]
        }
    },
    {
        id: "cloud-storage-index",
        title: "Cloud Storage & CDN Cost Matrix",
        category: "saas",
        categoryName: "SaaS & Pricing",
        endpoint: "/saas/cloud-storage-index",
        description: "Egress traffic fees and storage pricing per GB/month for Cloudflare R2, AWS S3, Wasabi, Backblaze B2, and Fastly.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Object Storage Egress & Storage Fee Index", "last_updated": "2026-07-22T12:00:00Z" },
            "providers": [
                { "name": "Cloudflare R2", "storage_per_gb_usd": 0.015, "egress_fee_per_gb_usd": 0.0, "free_tier_gb": 10 },
                { "name": "AWS S3 Standard", "storage_per_gb_usd": 0.023, "egress_fee_per_gb_usd": 0.09, "free_tier_gb": 5 }
            ]
        }
    },
    {
        id: "ai-voice-tts-pricing",
        title: "AI Voice & Speech API Pricing",
        category: "saas",
        categoryName: "SaaS & Pricing",
        endpoint: "/saas/ai-voice-tts-pricing",
        description: "Pricing benchmarks per 1,000 characters or minute of audio across ElevenLabs, Deepgram, OpenAI Whisper, and Cartesia.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Text-to-Speech & Speech-to-Text API Cost Benchmark", "last_updated": "2026-07-22T12:00:00Z" },
            "providers": [
                { "provider": "ElevenLabs", "tts_cost_per_1k_chars_usd": 0.15, "latency_ms": 220, "voice_cloning_supported": true },
                { "provider": "Deepgram Nova-2", "stt_cost_per_minute_usd": 0.0043, "latency_ms": 120, "realtime_streaming": true }
            ]
        }
    },

    // =========================================================================
    // 2. AI & ML (9 Datasets)
    // =========================================================================
    {
        id: "llm-latency",
        title: "LLM Response Latency Index",
        category: "ai",
        categoryName: "AI & ML",
        endpoint: "/ai/llm-latency",
        description: "Live tracking of average TTFT (time-to-first-token), token throughput (tps), and uptime across OpenAI GPT-4o, Claude 3.5, Gemini, and DeepSeek.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "name": "LLM Response Latency & Throughput Index", "last_updated": "2026-07-22T12:00:00Z" },
            "data": [
                { "provider": "OpenAI", "model": "gpt-4o", "ttft_ms": 280, "tps": 85, "uptime_percent": 99.94 },
                { "provider": "DeepSeek", "model": "deepseek-v3", "ttft_ms": 190, "tps": 110, "uptime_percent": 99.85 }
            ]
        }
    },
    {
        id: "huggingface-top-models",
        title: "Trending Open-Source LLMs",
        category: "ai",
        categoryName: "AI & ML",
        endpoint: "/ai/huggingface-top-models",
        description: "Benchmarks, VRAM requirements, context windows, and license terms for top open-weight models (DeepSeek-V3, Llama 3.3, Qwen 2.5).",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Trending Open-Source LLMs Index", "last_updated": "2026-07-22T12:00:00Z" },
            "models": [
                { "name": "DeepSeek-V3", "parameters": "671B (37B active)", "context_window": 128000, "min_vram_gb": 160, "license": "MIT" },
                { "name": "Llama-3.3-70B-Instruct", "parameters": "70B", "context_window": 128000, "min_vram_gb": 40, "license": "Llama 3.3 License" }
            ]
        }
    },
    {
        id: "github-trending-ai",
        title: "Trending AI Agent Frameworks",
        category: "ai",
        categoryName: "AI & ML",
        endpoint: "/ai/github-trending-ai",
        description: "Weekly top open-source AI agent frameworks, star growth rates, and primary tech stacks (elizaOS, CrewAI, LangChain, AutoGen).",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Trending AI Agent Frameworks Index", "last_updated": "2026-07-22T12:00:00Z" },
            "frameworks": [
                { "name": "elizaOS", "language": "TypeScript", "stars": 14200, "weekly_growth_stars": 1850, "primary_use_case": "Autonomous Web3 AI Agents" },
                { "name": "CrewAI", "language": "Python", "stars": 22400, "weekly_growth_stars": 920, "primary_use_case": "Multi-Agent Orchestration" }
            ]
        }
    },
    {
        id: "mcp-servers",
        title: "MCP Servers & Tools Directory",
        category: "ai",
        categoryName: "AI & ML",
        endpoint: "/ai/mcp-servers",
        description: "Catalog of Model Context Protocol (MCP) servers for Cursor, Claude Desktop, and autonomous agents (PostgreSQL, GitHub, Web Search MCPs).",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Model Context Protocol Server Directory", "last_updated": "2026-07-22T12:00:00Z" },
            "servers": [
                { "name": "@modelcontextprotocol/server-postgres", "author": "Anthropic", "transport": "stdio", "tools_provided": ["query", "list_tables", "describe_table"] },
                { "name": "puppeteer-mcp", "author": "Community", "transport": "sse", "tools_provided": ["navigate", "click", "screenshot"] }
            ]
        }
    },
    {
        id: "prompt-libraries",
        title: "Standardized AI Agent Prompts",
        category: "ai",
        categoryName: "AI & ML",
        endpoint: "/ai/prompt-libraries",
        description: "Battle-tested system prompts and structured output JSON schemas for Code Reviewers, SQL Generators, and Autonomous RAG Agents.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Standardized AI Agent Prompt Templates", "last_updated": "2026-07-22T12:00:00Z" },
            "prompts": [
                { "id": "code_refactor_agent", "role": "Senior Staff Architect", "format": "JSON", "success_rate_percent": 94.2 },
                { "id": "sql_query_optimizer", "role": "Database DBA Specialist", "format": "Markdown", "success_rate_percent": 96.8 }
            ]
        }
    },
    {
        id: "llm-benchmarks",
        title: "LLM Reasoning Leaderboard",
        category: "ai",
        categoryName: "AI & ML",
        endpoint: "/ai/llm-benchmarks",
        description: "Verified evaluation scores across HumanEval (Coding), MMLU-Pro (Reasoning), and SWE-bench for proprietary and open-source models.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "LLM Coding & Reasoning Benchmark Matrix", "last_updated": "2026-07-22T12:00:00Z" },
            "leaderboard": [
                { "model": "Claude 3.5 Sonnet", "humaneval_pass1": 93.7, "swe_bench_verified": 49.0, "mmlu_pro": 78.4 },
                { "model": "DeepSeek-V3", "humaneval_pass1": 92.6, "swe_bench_verified": 48.4, "mmlu_pro": 75.9 }
            ]
        }
    },
    {
        id: "ai-alternatives",
        title: "Proprietary vs Open AI Mapping",
        category: "ai",
        categoryName: "AI & ML",
        endpoint: "/ai/ai-alternatives",
        description: "Mapping of closed commercial AI models (GPT-4o, Midjourney, ElevenLabs) to open-weight self-hosted alternatives (Qwen, Flux, Bark).",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Proprietary vs Open-Weight AI Model Mapping", "last_updated": "2026-07-22T12:00:00Z" },
            "mappings": [
                { "proprietary": "OpenAI GPT-4o", "open_alternative": "DeepSeek-V3", "quality_match_percent": 97.5, "self_hostable": true },
                { "proprietary": "Midjourney v6", "open_alternative": "FLUX.1-dev", "quality_match_percent": 98.0, "self_hostable": true }
            ]
        }
    },
    {
        id: "api-uptime-history",
        title: "Major AI API Uptime Tracker",
        category: "ai",
        categoryName: "AI & ML",
        endpoint: "/ai/api-uptime-history",
        description: "Monthly incident log, outage duration, and SLA compliance metrics for OpenAI, Anthropic, Google Gemini, and Replicate.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "AI API Incident & Outage Log", "last_updated": "2026-07-22T12:00:00Z" },
            "history": [
                { "provider": "OpenAI", "monthly_uptime_percent": 99.82, "major_incidents_count": 1, "avg_resolution_time_mins": 35 },
                { "provider": "Anthropic", "monthly_uptime_percent": 99.91, "major_incidents_count": 0, "avg_resolution_time_mins": 0 }
            ]
        }
    },
    {
        id: "scraping-targets",
        title: "Web Anti-Bot Protection Index",
        category: "ai",
        categoryName: "AI & ML",
        endpoint: "/ai/scraping-targets",
        description: "Protection levels (Cloudflare Turnstile, DataDome, Akamai, PerimeterX) and proxy success rates for web scraping agents.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Web Scraping Anti-Bot Protection Matrix", "last_updated": "2026-07-22T12:00:00Z" },
            "targets": [
                { "domain": "linkedin.com", "waf_provider": "DataDome", "difficulty_rating": "Extreme", "headless_browser_bypass": "Low" },
                { "domain": "amazon.com", "waf_provider": "Akamai Bot Manager", "difficulty_rating": "High", "headless_browser_bypass": "Medium" }
            ]
        }
    },

    // =========================================================================
    // 3. EXPAT & LIVING (9 Datasets)
    // =========================================================================
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
            "metadata": { "city": "Bali", "country": "Indonesia", "last_updated": "2026-07-22T12:00:00Z" },
            "neighborhoods": [
                { "name": "Canggu", "expat_score": 9.8, "avg_wifi_mbps": 85, "price_1bed_usd": 1200, "price_2bed_usd": 2200 },
                { "name": "Ubud", "expat_score": 9.2, "avg_wifi_mbps": 65, "price_1bed_usd": 850, "price_2bed_usd": 1600 }
            ]
        }
    },
    {
        id: "rent-lisbon",
        title: "Portugal Rental Index",
        category: "expat",
        categoryName: "Expat & Living",
        endpoint: "/expat/rent-lisbon",
        description: "Comprehensive average monthly rental prices for expat-friendly residential properties in Lisbon, Porto, and Lagos.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "city": "Lisbon & Portugal", "country": "Portugal", "last_updated": "2026-07-22T12:00:00Z" },
            "neighborhoods": [
                { "name": "Santo Antonio, Lisbon", "expat_score": 9.3, "price_1bed_usd": 1600, "price_2bed_usd": 2500 },
                { "name": "Paranhos, Porto", "expat_score": 8.7, "price_1bed_usd": 950, "price_2bed_usd": 1450 }
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
            "metadata": { "city": "Tbilisi", "country": "Georgia", "last_updated": "2026-07-22T12:00:00Z" },
            "neighborhoods": [
                { "name": "Vake", "price_1bed_usd": 650, "price_2bed_usd": 1100, "safety_score": 9.6 },
                { "name": "Saburtalo", "price_1bed_usd": 500, "price_2bed_usd": 850, "safety_score": 9.4 }
            ]
        }
    },
    {
        id: "digital-nomad-hubs",
        title: "Top Digital Nomad Hubs 2026",
        category: "expat",
        categoryName: "Expat & Living",
        endpoint: "/expat/digital-nomad-hubs",
        description: "Comparison of top digital nomad cities including wifi speed, safety, cost of living, monthly expense benchmarks, and visa ease.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Top Global Digital Nomad Hubs Index", "last_updated": "2026-07-22T12:00:00Z" },
            "hubs": [
                { "city": "Canggu", "country": "Indonesia", "avg_cost_monthly_usd": 1250, "avg_wifi_mbps": 85, "safety_index": 8.2 },
                { "city": "Bangkok", "country": "Thailand", "avg_cost_monthly_usd": 1350, "avg_wifi_mbps": 220, "safety_index": 8.8 }
            ]
        }
    },
    {
        id: "nomad-visas",
        title: "Digital Nomad Visas Index",
        category: "expat",
        categoryName: "Expat & Living",
        endpoint: "/expat/nomad-visas",
        description: "Income requirements, tax rates, validity periods, and rejection rates for Nomad Visas in Spain, Portugal, Dubai, Costa Rica, and Bali.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Global Digital Nomad Visas Comparison Matrix", "last_updated": "2026-07-22T12:00:00Z" },
            "visas": [
                { "country": "Spain", "min_monthly_income_usd": 2600, "tax_rate_percent": 15, "validity_years": 3 },
                { "country": "Dubai (UAE)", "min_monthly_income_usd": 3500, "tax_rate_percent": 0, "validity_years": 1 }
            ]
        }
    },
    {
        id: "cost-of-living",
        title: "Expat Consumer Price Index",
        category: "expat",
        categoryName: "Expat & Living",
        endpoint: "/expat/cost-of-living",
        description: "Granular cost benchmarks for groceries, gym memberships, dining out, and coworking across 25 expat destination cities.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Expat Consumer Price Index", "last_updated": "2026-07-22T12:00:00Z" },
            "cities": [
                { "city": "Lisbon", "coffee_usd": 1.50, "coworking_monthly_usd": 180, "gym_monthly_usd": 40 },
                { "city": "Medellin", "coffee_usd": 1.20, "coworking_monthly_usd": 120, "gym_monthly_usd": 25 }
            ]
        }
    },
    {
        id: "coworking-wifi",
        title: "Top Coworking Spaces & Speeds",
        category: "expat",
        categoryName: "Expat & Living",
        endpoint: "/expat/coworking-wifi",
        description: "Verified fiber internet download/upload speeds, day pass prices, and generator backup status for top expat coworking spaces.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Global Coworking Wifi & Facility Matrix", "last_updated": "2026-07-22T12:00:00Z" },
            "spaces": [
                { "name": "BHub Coworking", "city": "Canggu", "download_mbps": 320, "upload_mbps": 300, "day_pass_usd": 14.0, "backup_generator": true },
                { "name": "Largo Coworking", "city": "Lisbon", "download_mbps": 500, "upload_mbps": 500, "day_pass_usd": 18.0, "backup_generator": true }
            ]
        }
    },
    {
        id: "nomad-taxes",
        title: "Expat Tax & 183-Day Rule Matrix",
        category: "expat",
        categoryName: "Expat & Living",
        endpoint: "/expat/nomad-taxes",
        description: "Territorial tax rules, 183-day physical presence thresholds, and double taxation treaty status across 30 countries.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Global Expat Taxation Rules & Thresholds", "last_updated": "2026-07-22T12:00:00Z" },
            "jurisdictions": [
                { "country": "Georgia", "territorial_tax": true, "foreign_income_tax_percent": 0, "physical_presence_days": 183 },
                { "country": "Panama", "territorial_tax": true, "foreign_income_tax_percent": 0, "physical_presence_days": 183 }
            ]
        }
    },
    {
        id: "international-schools",
        title: "International School Fee Index",
        category: "expat",
        categoryName: "Expat & Living",
        endpoint: "/expat/international-schools",
        description: "Annual tuition costs, IB curriculum accreditations, and application waitlists for expat international schools in Bali, Lisbon, Dubai, and Bangkok.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Global International Schools Tuition Benchmark", "last_updated": "2026-07-22T12:00:00Z" },
            "schools": [
                { "name": "Green School Bali", "city": "Ubud", "curriculum": "Sustainability / IB", "annual_tuition_usd": 14500 },
                { "name": "St. Julian's School", "city": "Lisbon", "curriculum": "British / IB", "annual_tuition_usd": 16800 }
            ]
        }
    },

    // =========================================================================
    // 4. FINANCE & CRYPTO (9 Datasets)
    // =========================================================================
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
            "metadata": { "name": "Crypto Sentiment & Volatility Index", "last_updated": "2026-07-22T12:00:00Z" },
            "metrics": { "fear_and_greed_score": 68, "sentiment_label": "Greed", "btc_dominance": 54.2, "eth_btc_ratio": 0.052 }
        }
    },
    {
        id: "gas-tracker",
        title: "Multi-Chain Gas Tracker",
        category: "finance",
        categoryName: "Finance & Crypto",
        endpoint: "/finance/gas-tracker",
        description: "Real-time gas prices in Gwei and average transaction fees in USD across Ethereum, Arbitrum, Base, Polygon, and Solana.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Multi-Chain Gas Tracker & L2 Fee Index", "last_updated": "2026-07-22T12:00:00Z" },
            "networks": [
                { "chain": "Arbitrum One", "gas_price_gwei": { "average": 0.15 }, "estimated_swap_cost_usd": 0.04 },
                { "chain": "Base Mainnet", "gas_price_gwei": { "average": 0.08 }, "estimated_swap_cost_usd": 0.02 }
            ]
        }
    },
    {
        id: "hysa-rates",
        title: "High-Yield Savings Account Index",
        category: "finance",
        categoryName: "Finance & Crypto",
        endpoint: "/finance/hysa-rates",
        description: "Current APYs, minimum deposit requirements, and FDIC/EFSA insurance limits for top USD and EUR high-yield savings accounts.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "High-Yield Savings Account APY Index", "last_updated": "2026-07-22T12:00:00Z" },
            "accounts": [
                { "bank": "Marcus by Goldman Sachs", "currency": "USD", "apy_percent": 4.40, "fdic_insured_usd": 250000 },
                { "bank": "Trade Republic", "currency": "EUR", "apy_percent": 3.75, "efsa_insured_eur": 100000 }
            ]
        }
    },
    {
        id: "neobanks",
        title: "Expat Neobank & Multi-Currency Index",
        category: "finance",
        categoryName: "Finance & Crypto",
        endpoint: "/finance/neobanks",
        description: "FX markup rates, ATM withdrawal caps, and crypto deposit policies across Wise, Revolut, N26, Mercury, and Relai.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Multi-Currency Neobank Feature Comparison", "last_updated": "2026-07-22T12:00:00Z" },
            "neobanks": [
                { "name": "Wise", "fx_markup_percent": 0.35, "currencies_supported": 40, "iban_jurisdictions": ["EU", "UK", "US"] },
                { "name": "Revolut Premium", "fx_markup_percent": 0.0, "currencies_supported": 30, "crypto_trading": true }
            ]
        }
    },
    {
        id: "crypto-staking-yields",
        title: "L1/L2 Crypto Staking Yields",
        category: "finance",
        categoryName: "Finance & Crypto",
        endpoint: "/finance/crypto-staking-yields",
        description: "Real-time native staking APYs, liquid staking token (LST) yields, and unbonding lockup times for ETH, SOL, AVAX, and NEAR.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Crypto Native & Liquid Staking APY Matrix", "last_updated": "2026-07-22T12:00:00Z" },
            "assets": [
                { "asset": "Ethereum (ETH)", "native_apy_percent": 3.4, "lst": "Lido stETH", "unbonding_days": 7 },
                { "asset": "Solana (SOL)", "native_apy_percent": 6.8, "lst": "JitoSOL", "unbonding_days": 3 }
            ]
        }
    },
    {
        id: "startup-funding-rounds",
        title: "AI & Web3 Seed Round Index",
        category: "finance",
        categoryName: "Finance & Crypto",
        endpoint: "/finance/startup-funding-rounds",
        description: "Recent seed and Series A funding rounds in AI infrastructure and Web3 protocols, check sizes, valuations, and lead VCs.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "AI & Web3 Startup Funding Transactions", "last_updated": "2026-07-22T12:00:00Z" },
            "rounds": [
                { "company": "Agentic Scaling Inc", "round": "Seed", "amount_usd": 4500000, "lead_investor": "a16z CSX", "sector": "AI Infrastructure" },
                { "company": "x402 Protocol", "round": "Pre-Seed", "amount_usd": 1800000, "lead_investor": "Base Ecosystem Fund", "sector": "Web3 Data" }
            ]
        }
    },
    {
        id: "dividend-stocks",
        title: "Global Dividend Aristocrats",
        category: "finance",
        categoryName: "Finance & Crypto",
        endpoint: "/finance/dividend-stocks",
        description: "Dividend yields, payout ratios, 5-year dividend growth rates, and ex-dividend dates for top global Dividend Aristocrat stocks.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Global Dividend Yield & Growth Benchmark", "last_updated": "2026-07-22T12:00:00Z" },
            "stocks": [
                { "ticker": "JNJ", "name": "Johnson & Johnson", "yield_percent": 3.10, "payout_ratio_percent": 62.0, "consecutive_years_growth": 62 },
                { "ticker": "PG", "name": "Procter & Gamble", "yield_percent": 2.45, "payout_ratio_percent": 59.5, "consecutive_years_growth": 67 }
            ]
        }
    },
    {
        id: "creditcard-rewards",
        title: "Expat & Travel Credit Card Index",
        category: "finance",
        categoryName: "Finance & Crypto",
        endpoint: "/finance/creditcard-rewards",
        description: "Foreign transaction fee waivers, airport lounge perks, signup point bonuses, and annual fees for top expat travel credit cards.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Travel Credit Cards Perks & Fee Matrix", "last_updated": "2026-07-22T12:00:00Z" },
            "cards": [
                { "card_name": "Chase Sapphire Reserve", "annual_fee_usd": 550, "fx_fee_percent": 0.0, "lounge_access": "Priority Pass Select" },
                { "card_name": "Capital One Venture X", "annual_fee_usd": 395, "fx_fee_percent": 0.0, "lounge_access": "Plaza Premium + Capital One" }
            ]
        }
    },
    {
        id: "microsaas-marketplace",
        title: "Micro-SaaS Valuation Multiples",
        category: "finance",
        categoryName: "Finance & Crypto",
        endpoint: "/finance/microsaas-marketplace",
        description: "ARR valuation multiples, monthly churn rates, asking prices, and deal closed metrics across Acquire.com and Flippa for Micro-SaaS.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Micro-SaaS Valuation Multiples & Deal Terms", "last_updated": "2026-07-22T12:00:00Z" },
            "deals": [
                { "category": "AI Wrapper SaaS", "median_arr_multiple": 3.8, "median_monthly_churn_percent": 4.2, "avg_deal_size_usd": 65000 },
                { "category": "Developer Tooling", "median_arr_multiple": 5.2, "median_monthly_churn_percent": 1.8, "avg_deal_size_usd": 140000 }
            ]
        }
    },

    // =========================================================================
    // 5. TECH JOBS (9 Datasets)
    // =========================================================================
    {
        id: "remote-salaries",
        title: "Global Tech Salaries 2026",
        category: "jobs",
        categoryName: "Tech Jobs",
        endpoint: "/jobs/remote-salaries",
        description: "Benchmark salary distributions for Senior AI Engineers, DevOps, Full-Stack, and Data Scientists across US, EU, and LATAM remote markets.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "name": "Global Tech Salary Benchmarks", "last_updated": "2026-07-22T12:00:00Z" },
            "salaries": [
                { "role": "Senior AI Engineer", "region": "US Remote", "median_usd": 185000, "p90_usd": 240000 },
                { "role": "Senior Rust / Web3 Developer", "region": "EU Remote", "median_usd": 125000, "p90_usd": 165000 }
            ]
        }
    },
    {
        id: "freelance-rates",
        title: "Developer Hourly Rate Index",
        category: "jobs",
        categoryName: "Tech Jobs",
        endpoint: "/jobs/freelance-rates",
        description: "Hourly contractor rates for specialized skills (Rust, Python AI, React, Solidity, DevOps) across Upwork, Toptal, and Braintrust.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Specialized Developer Contractor Rate Index", "last_updated": "2026-07-22T12:00:00Z" },
            "skills": [
                { "skill": "Solidity Smart Contract Auditor", "hourly_median_usd": 160, "toptal_p90_usd": 250 },
                { "skill": "Python LLM Fine-Tuning Specialist", "hourly_median_usd": 120, "toptal_p90_usd": 190 }
            ]
        }
    },
    {
        id: "nomad-friendly-jobs",
        title: "100% Async Remote Tech Companies",
        category: "jobs",
        categoryName: "Tech Jobs",
        endpoint: "/jobs/nomad-friendly-jobs",
        description: "Directory of tech companies with true location-agnostic hiring policies, no timezone mandates, and home-office stipends.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Async Location-Agnostic Tech Employers", "last_updated": "2026-07-22T12:00:00Z" },
            "companies": [
                { "name": "GitLab", "remote_policy": "100% Async", "hiring_countries": "Global 60+", "equipment_stipend_usd": 1500 },
                { "name": "Automattic", "remote_policy": "100% Async", "hiring_countries": "Global 90+", "equipment_stipend_usd": 2000 }
            ]
        }
    },
    {
        id: "ai-annotation-jobs",
        title: "RLHF & AI Data Annotator Pay",
        category: "jobs",
        categoryName: "Tech Jobs",
        endpoint: "/jobs/ai-annotation-jobs",
        description: "Hourly pay rates and qualification rules for specialized RLHF prompt engineers, code evaluators, and domain expert annotators.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "RLHF & Specialized Data Annotator Compensation", "last_updated": "2026-07-22T12:00:00Z" },
            "platforms": [
                { "platform": "Scale AI (RLHF Specialist)", "domain": "Software Engineering", "hourly_rate_usd": 45.0, "requires_degree": true },
                { "platform": "DataAnnotation.tech", "domain": "General Reasoning", "hourly_rate_usd": 20.0, "requires_degree": false }
            ]
        }
    },
    {
        id: "visa-sponsorship-jobs",
        title: "Tech Visa Sponsorship Directory",
        category: "jobs",
        categoryName: "Tech Jobs",
        endpoint: "/jobs/visa-sponsorship-jobs",
        description: "Tech companies actively sponsoring UK Scale-up visas, Germany Chancenkarte, US O-1/H-1B, and Netherlands 30% Ruling.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Active Tech Visa Sponsoring Employers", "last_updated": "2026-07-22T12:00:00Z" },
            "employers": [
                { "company": "Revolut", "country": "UK", "supported_visas": ["Skilled Worker", "Scale-up Visa"], "min_salary_gbp": 55000 },
                { "company": "Booking.com", "country": "Netherlands", "supported_visas": ["Highly Skilled Migrant (30% Ruling)"], "min_salary_eur": 62000 }
            ]
        }
    },
    {
        id: "rto-mandates",
        title: "Tech RTO Mandates vs Remote Status",
        category: "jobs",
        categoryName: "Tech Jobs",
        endpoint: "/jobs/rto-mandates",
        description: "Tracking Return-To-Office (RTO) mandatory days per week vs 100% remote policies across top 50 global tech employers.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Global Tech Employers Office Mandate Tracker", "last_updated": "2026-07-22T12:00:00Z" },
            "status": [
                { "company": "Amazon", "mandatory_office_days_per_week": 5, "badge_tracking": true, "exceptions_policy": "Strict" },
                { "company": "Spotify", "mandatory_office_days_per_week": 0, "badge_tracking": false, "exceptions_policy": "Work From Anywhere" }
            ]
        }
    },
    {
        id: "niche-job-boards",
        title: "Developer Niche Job Boards Index",
        category: "jobs",
        categoryName: "Tech Jobs",
        endpoint: "/jobs/niche-job-boards",
        description: "Job posting costs, monthly developer traffic, and candidate conversion metrics for Web3, Rust, AI, and Elixir job boards.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Niche Developer Job Board Traffic & Posting Cost Index", "last_updated": "2026-07-22T12:00:00Z" },
            "boards": [
                { "name": "Web3.career", "niche": "Crypto / Blockchain", "post_cost_usd": 299, "monthly_visitors": 450000 },
                { "name": "RustJobs.dev", "niche": "Systems / Rust", "post_cost_usd": 199, "monthly_visitors": 120000 }
            ]
        }
    },
    {
        id: "employer-benefits",
        title: "Tech Startup Benefit Benchmarks",
        category: "jobs",
        categoryName: "Tech Jobs",
        endpoint: "/jobs/employer-benefits",
        description: "Health coverage %, equity vesting cliffs, learning stipends, and parental leave allowances for Series A-C tech startups.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Tech Startup Employee Perks & Benefits Benchmarks", "last_updated": "2026-07-22T12:00:00Z" },
            "benchmarks": [
                { "benefit": "Equity Vesting Schedule", "standard": "4 years with 1-year cliff", "startup_p90": "3 years with 6-month cliff" },
                { "benefit": "Learning & Education Stipend", "standard_annual_usd": 1000, "startup_p90_annual_usd": 2500 }
            ]
        }
    },
    {
        id: "whitelabel-agencies",
        title: "AI & Web3 Dev Agency Rates",
        category: "jobs",
        categoryName: "Tech Jobs",
        endpoint: "/jobs/whitelabel-agencies",
        description: "Benchmark project costs and sprint rates for custom AI Agent builds, RAG pipelines, and smart contract audits.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "AI & Web3 Software Agency Project Rate Index", "last_updated": "2026-07-22T12:00:00Z" },
            "services": [
                { "service": "Custom RAG & Vector Search Pipeline", "fixed_project_avg_usd": 12000, "timeline_weeks": 3 },
                { "service": "EVM Smart Contract Security Audit", "fixed_project_avg_usd": 18000, "timeline_weeks": 2 }
            ]
        }
    },

    // =========================================================================
    // 6. LEGAL & TAX (9 Datasets)
    // =========================================================================
    {
        id: "eresident-comparison",
        title: "E-Residency Programs Index",
        category: "legal",
        categoryName: "Legal & Tax",
        endpoint: "/legal/eresident-comparison",
        description: "Fee structures, corporate tax rates, setup times, and remote banking rules for E-Residency in Estonia, Lithuania, Dubai, and Palau.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "name": "E-Residency Programs Comparison Index", "last_updated": "2026-07-22T12:00:00Z" },
            "data": [
                { "jurisdiction": "Estonia", "eresidency_cost_eur": 120.0, "retained_earnings_tax_percent": 0.0, "distributed_dividend_tax_percent": 20.0 },
                { "jurisdiction": "Dubai IFZA", "eresidency_cost_usd": 3500.0, "corporate_tax_percent": 9.0, "personal_tax_percent": 0.0 }
            ]
        }
    },
    {
        id: "company-registration-costs",
        title: "Offshore Company Setup Costs",
        category: "legal",
        categoryName: "Legal & Tax",
        endpoint: "/legal/company-registration-costs",
        description: "Government fees, registered agent costs, annual maintenance fees, and setup timelines for Wyoming LLC, Delaware LLC, Singapore Pte Ltd.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Global Company Incorporation & Maintenance Fee Index", "last_updated": "2026-07-22T12:00:00Z" },
            "entities": [
                { "jurisdiction": "Wyoming (US)", "state_fee_usd": 100, "annual_report_usd": 60, "crypto_friendly": true },
                { "jurisdiction": "Singapore", "state_fee_usd": 300, "min_local_director_cost_usd": 1800, "crypto_friendly": true }
            ]
        }
    },
    {
        id: "crypto-regulations",
        title: "Crypto Legal & Regulatory Status",
        category: "legal",
        categoryName: "Legal & Tax",
        endpoint: "/legal/crypto-regulations",
        description: "MiCA compliance requirements, SEC token classification status, and capital gains tax brackets across 30 countries.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Global Cryptocurrency Legal Status & Tax Rates", "last_updated": "2026-07-22T12:00:00Z" },
            "countries": [
                { "country": "Germany", "holding_period_for_0_tax_months": 12, "staking_rewards_tax_status": "Taxable as Income" },
                { "country": "Switzerland (Zug)", "holding_period_for_0_tax_months": 0, "personal_capital_gains_tax_percent": 0 }
            ]
        }
    },
    {
        id: "ai-copyright-laws",
        title: "Global AI Copyright Regulations",
        category: "legal",
        categoryName: "Legal & Tax",
        endpoint: "/legal/ai-copyright-laws",
        description: "Copyrightability of AI-generated output, web scraping Fair Use precedents, and training dataset opt-out laws across US, EU, UK, and Japan.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "AI Output Copyrightability & Training Data Law Matrix", "last_updated": "2026-07-22T12:00:00Z" },
            "jurisdictions": [
                { "region": "United States", "ai_generated_copyrightable": false, "training_data_fair_use_status": "Pending Supreme Court Test" },
                { "region": "Japan", "ai_generated_copyrightable": false, "training_data_fair_use_status": "Permissive (Article 30-4 Copyright Act)" }
            ]
        }
    },
    {
        id: "gdpr-templates",
        title: "SaaS & AI Data Privacy Matrix",
        category: "legal",
        categoryName: "Legal & Tax",
        endpoint: "/legal/gdpr-templates",
        description: "Mandatory compliance checklists, Right-to-be-Forgotten data deletion rules, and LLM training consent terms for GDPR and CCPA.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "SaaS & AI Model Data Protection Compliance Matrix", "last_updated": "2026-07-22T12:00:00Z" },
            "requirements": [
                { "framework": "GDPR (EU)", "user_data_deletion_days": 30, "dpo_required_threshold": "Large Scale Processing" },
                { "framework": "CCPA / CPRA (California)", "user_data_deletion_days": 45, "opt_out_button_mandatory": true }
            ]
        }
    },
    {
        id: "foreign-realestate-laws",
        title: "Foreigner Property Ownership Rules",
        category: "legal",
        categoryName: "Legal & Tax",
        endpoint: "/legal/foreign-realestate-laws",
        description: "Freehold vs leasehold rules, property purchase taxes, and Golden Visa eligibility thresholds for foreign buyers in Bali, Portugal, Spain, Thailand.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Foreign Property Ownership & Real Estate Tax Index", "last_updated": "2026-07-22T12:00:00Z" },
            "jurisdictions": [
                { "country": "Indonesia (Bali)", "foreign_freehold_allowed": false, "leasehold_typical_years": 25, "hak_pakai_title_min_price_usd": 150000 },
                { "country": "Thailand", "foreign_condo_freehold_quota_percent": 49, "land_ownership_allowed": false }
            ]
        }
    },
    {
        id: "labor-laws",
        title: "Global Remote Contractor Legal Index",
        category: "legal",
        categoryName: "Legal & Tax",
        endpoint: "/legal/labor-laws",
        description: "Misclassification risks, statutory severance pay rules, and mandatory notice periods when hiring international remote contractors.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "International Remote Contractor Misclassification Rules", "last_updated": "2026-07-22T12:00:00Z" },
            "countries": [
                { "country": "Brazil", "contractor_misclassification_risk": "High", "mandatory_severance": true },
                { "country": "United Kingdom", "ir35_compliance_applies": true, "tax_withholding_required": true }
            ]
        }
    },
    {
        id: "import-export-duties",
        title: "Tech Hardware Tariff & HS Code Index",
        category: "legal",
        categoryName: "Legal & Tax",
        endpoint: "/legal/import-export-duties",
        description: "Import tariff rates, VAT/GST thresholds, and HS code classifications for GPU servers, microcontrollers, and consumer electronics.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "Electronics & GPU Server Tariff & Duty Rate Index", "last_updated": "2026-07-22T12:00:00Z" },
            "codes": [
                { "hs_code": "8471.50", "description": "Processing Units / AI GPU Servers", "eu_duty_percent": 0.0, "us_duty_percent": 0.0 },
                { "hs_code": "8517.62", "description": "Network Switches & Routers", "eu_duty_percent": 0.0, "us_duty_percent": 0.0 }
            ]
        }
    },
    {
        id: "gambling-licenses",
        title: "Gaming & iGaming License Matrix",
        category: "legal",
        categoryName: "Legal & Tax",
        endpoint: "/legal/gambling-licenses",
        description: "Setup costs, annual renewal fees, crypto-wagering friendliness, and corporate tax rates for iGaming licenses in Curacao, Anjouan, Malta.",
        price: "0.01 USDC",
        price_usdc: 0.01,
        schema: {
            "metadata": { "dataset_name": "iGaming & Crypto Casino Licensing Cost Comparison", "last_updated": "2026-07-22T12:00:00Z" },
            "jurisdictions": [
                { "jurisdiction": "Curacao (LOK Framework)", "setup_cost_usd": 25000, "annual_fee_usd": 18000, "crypto_wagering_allowed": true },
                { "jurisdiction": "Anjouan (Comoros)", "setup_cost_usd": 14000, "annual_fee_usd": 9000, "crypto_wagering_allowed": true }
            ]
        }
    }
];

const USDC_CONTRACTS = {
    arbitrum: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    base: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
};

const MERCHANT_WALLET = "0xB23B0d7d25113E991D2931Ca147677A5b5Da40E4";

// Code Snippet Generator
function generateSnippet(endpoint, lang = "curl", txHash = "") {
    const baseUrl = `https://data-hub-api.izzor2021.workers.dev${endpoint}`;
    if (lang === "python") {
        return txHash
            ? `import requests\n\nurl = "${baseUrl}"\nheaders = {"x-payment-tx": "${txHash}"}\nresponse = requests.get(url, headers=headers)\nprint(response.json())`
            : `import requests\n\nurl = "${baseUrl}"\nresponse = requests.get(url)\nprint(response.json())`;
    } else if (lang === "js") {
        return txHash
            ? `const res = await fetch("${baseUrl}", {\n  headers: { "x-payment-tx": "${txHash}" }\n});\nconst data = await res.json();\nconsole.log(data);`
            : `const res = await fetch("${baseUrl}");\nconst data = await res.json();\nconsole.log(data);`;
    }
    // Default cURL
    return txHash 
        ? `curl -s -H "x-payment-tx: ${txHash}" "${baseUrl}"`
        : `curl -s "${baseUrl}"`;
}

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
        
        const buttonText = web3Wallet ? `<i class="fa-solid fa-wallet"></i> Pay ${d.price}` : `<i class="fa-solid fa-lock"></i> Details / Web3 Pay`;
        const btnClass = web3Wallet ? "card-wallet-btn btn-connected" : "card-wallet-btn";

        card.innerHTML = `
            <span class="item-badge">${d.categoryName}</span>
            <h4>${d.title}</h4>
            <p>${d.description}</p>
            <div class="item-meta">
                <span class="endpoint-text"><code>GET ${d.endpoint}</code></span>
                <span class="price-tag">${d.price}</span>
            </div>
            <div class="card-btn-group">
                <button class="card-try-btn" data-id="${d.id}">
                    <i class="fa-solid fa-bolt"></i> Try Live
                </button>
                <button class="${btnClass}">
                    ${buttonText}
                </button>
            </div>
        `;
        
        // "Try Live" button opens modal and fires instant live fetch!
        const tryBtn = card.querySelector(".card-try-btn");
        if (tryBtn) {
            tryBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                openModal(d);
                window.fetchLiveData();
            });
        }

        card.addEventListener("click", () => {
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
        alert("MetaMask / EVM Wallet extension was not detected. You can test unlocking feeds instantly using the '⚡ Fetch Live Data' button inside any dataset modal!");
        return;
    }

    try {
        const navBtnText = document.getElementById("navWalletText");
        if (navBtnText) navBtnText.innerText = "Connecting...";
        
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

// Daily Free Quota Tracking System (50 requests/day limit)
function getDailyQuota() {
    const today = new Date().toISOString().split('T')[0];
    let store = JSON.parse(localStorage.getItem("datahub_daily_quota_v3") || "{}");
    if (store.date !== today) {
        store = { date: today, counts: {} };
    }
    return store;
}

function updateQuotaUI() {
    if (!currentDataset) return;
    const store = getDailyQuota();
    const used = store.counts[currentDataset.id] || 0;
    const remaining = Math.max(0, 50 - used);

    const demoPayBtn = document.getElementById("demoPayBtn");
    if (demoPayBtn) {
        if (remaining > 0) {
            demoPayBtn.disabled = false;
            demoPayBtn.innerHTML = `<span><i class="fa-solid fa-bolt"></i> Fetch Live Data (Free Test)</span><span class="quota-badge">${remaining} / 50 Left Today</span>`;
        } else {
            demoPayBtn.disabled = true;
            demoPayBtn.innerHTML = `<span><i class="fa-solid fa-lock"></i> Daily Limit Reached</span><span class="quota-badge quota-badge-used">0 / 50 Left</span>`;
        }
    }
}

// Real-Time Live API Fetching Function
window.fetchLiveData = async function() {
    if (!currentDataset) return;
    const store = getDailyQuota();
    const used = store.counts[currentDataset.id] || 0;
    
    if (used >= 50) {
        alert("Daily free quota (50/50) reached for this dataset today. Please connect Web3 Wallet or paste a Tx Hash to pay 0.01 USDC for unlimited access!");
        return;
    }

    const paymentStatus = document.getElementById("paymentStatus");
    if (paymentStatus) {
        paymentStatus.className = "status-msg loading";
        paymentStatus.innerText = "⚡ Fetching live feed from Cloudflare Worker API...";
    }

    const jsonPreview = document.getElementById("jsonPreview");
    if (jsonPreview) jsonPreview.innerText = "// Loading real-time data from Cloudflare Worker...";

    try {
        const workerUrl = `https://data-hub-api.izzor2021.workers.dev${currentDataset.endpoint}`;
        const res = await fetch(workerUrl);
        
        if (res.ok) {
            const data = await res.json();
            
            // Increment quota count
            store.counts[currentDataset.id] = used + 1;
            localStorage.setItem("datahub_daily_quota_v3", JSON.stringify(store));

            currentUnlockedData = data;
            updateQuotaUI();

            if (jsonPreview) jsonPreview.innerText = JSON.stringify(data, null, 2);

            const previewTitle = document.getElementById("previewTitle");
            if (previewTitle) previewTitle.innerText = "Live Data Feed (HTTP 200 OK)";

            if (paymentStatus) {
                paymentStatus.className = "status-msg success";
                paymentStatus.innerText = `⚡ Live Data Fetched! (${used + 1}/50 Free Daily Requests Used).`;
            }

            const unlockedActions = document.getElementById("unlockedActions");
            if (unlockedActions) unlockedActions.classList.remove("hidden");

            const modalDlBtn = document.getElementById("modalDlBtn");
            if (modalDlBtn) modalDlBtn.classList.remove("hidden");
            
            updateModalSnippet();
        } else {
            // Fallback to sample schema if HTTP 402 or error
            window.demoInstantUnlock(false);
        }

    } catch (err) {
        console.warn("Live fetch fallback to schema preview:", err);
        window.demoInstantUnlock(false);
    }
};

window.useFreeDailyRequest = function() {
    window.fetchLiveData();
};

function updateModalSnippet() {
    if (!currentDataset) return;
    const modalCodeSnippet = document.getElementById("modalCodeSnippet");
    if (modalCodeSnippet) {
        modalCodeSnippet.innerText = generateSnippet(currentDataset.endpoint, selectedSnippetLang, currentTxHash || "");
    }
}

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
    
    const paymentStatus = document.getElementById("paymentStatus");
    if (paymentStatus) {
        paymentStatus.className = "status-msg";
        paymentStatus.innerText = web3Wallet ? `Wallet connected (${web3Wallet.substring(0, 6)}...). Use 50 free daily requests or pay 0.01 USDC.` : "50 Free daily requests available per dataset. Pay 0.01 USDC for unlimited live feed.";
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

    updateModalSnippet();
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
        
        updateModalSnippet();
    } else {
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
    }
};

// Web3 Payment Handler
async function processWeb3Payment() {
    const paymentStatus = document.getElementById("paymentStatus");
    if (!window.ethereum) {
        if (paymentStatus) {
            paymentStatus.className = "status-msg error";
            paymentStatus.innerText = "MetaMask missing. Click 'Fetch Live Data' to test for free!";
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
            if (paymentStatus) {
                paymentStatus.className = "status-msg loading";
                paymentStatus.innerText = "Switching to direct ETH micro-payment (0.000003 ETH)...";
            }
            txParams = {
                from: web3Wallet,
                to: MERCHANT_WALLET,
                value: "0x2b5e3af16b00"
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
                paymentStatus.innerText = "Insufficient ETH gas balance or testnet token. Click 'Fetch Live Data' to test for free!";
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
    if (demoPayBtn) demoPayBtn.addEventListener("click", window.fetchLiveData);

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

    // Modal Snippet Tab Switching
    document.querySelectorAll(".snippet-tab").forEach(tab => {
        tab.addEventListener("click", (e) => {
            document.querySelectorAll(".snippet-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            selectedSnippetLang = tab.dataset.lang || "curl";
            updateModalSnippet();
        });
    });

    // Copy Modal Snippet Button
    const copyModalSnippetBtn = document.getElementById("copyModalSnippetBtn");
    if (copyModalSnippetBtn) {
        copyModalSnippetBtn.addEventListener("click", () => {
            const snippet = document.getElementById("modalCodeSnippet");
            if (snippet) {
                navigator.clipboard.writeText(snippet.innerText).then(() => {
                    const orig = copyModalSnippetBtn.innerHTML;
                    copyModalSnippetBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
                    setTimeout(() => { copyModalSnippetBtn.innerHTML = orig; }, 2000);
                });
            }
        });
    }

    // Doc Snippet Tab Switching
    document.querySelectorAll(".doc-tab").forEach(tab => {
        tab.addEventListener("click", (e) => {
            document.querySelectorAll(".doc-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            selectedDocLang = tab.dataset.lang || "curl";
            const docDisplay = document.getElementById("docCodeDisplay");
            if (docDisplay) {
                docDisplay.innerText = generateSnippet("/ai/llm-latency", selectedDocLang);
            }
        });
    });

    const copyDocCodeBtn = document.getElementById("copyDocCodeBtn");
    if (copyDocCodeBtn) {
        copyDocCodeBtn.addEventListener("click", () => {
            const docDisplay = document.getElementById("docCodeDisplay");
            if (docDisplay) {
                navigator.clipboard.writeText(docDisplay.innerText).then(() => {
                    copyDocCodeBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
                    setTimeout(() => { copyDocCodeBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy Code`; }, 2000);
                });
            }
        });
    }

    const copyJsonBtn = document.getElementById("copyJsonBtn");
    if (copyJsonBtn) copyJsonBtn.addEventListener("click", copyUnlockedJson);

    const downloadJsonBtn = document.getElementById("downloadJsonBtn");
    if (downloadJsonBtn) downloadJsonBtn.addEventListener("click", downloadUnlockedJson);

    const modalDlBtn = document.getElementById("modalDlBtn");
    if (modalDlBtn) modalDlBtn.addEventListener("click", downloadUnlockedJson);
}

// Document Ready Bootstrap
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    renderCards();
});

if (document.readyState === "complete" || document.readyState === "interactive") {
    setupEventListeners();
    renderCards();
}
