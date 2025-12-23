import botSignatures from './signatures.js';

const BotGuard = {
    threshold: 50,
    score: 0,
    reasons: [],
    weights: {
        webdriver: 50,
        userAgent: 90,
        noPlugins: 15,
        noLanguages: 15,
        headlessChrome: 20,
        smallViewport: 10,
        lowConcurrency: 10,
        lowMemory: 10
    },

    reset: function () {
        this.score = 0;
        this.reasons = [];
    },

    detectStatic: function () {
        // Guard against non-browser environments for safe import
        if (typeof navigator === 'undefined') return;

        const nav = navigator;
        const ua = nav.userAgent;

        // 1. Webdriver check
        if (nav.webdriver) {
            this.score += this.weights.webdriver;
            this.reasons.push("webdriver");
        }

        // 2. User Agent Check
        const knownBots = new RegExp(botSignatures.join('|'), 'i');
        if (knownBots.test(ua)) {
            this.score += this.weights.userAgent;
            this.reasons.push("known_bot_ua");
        }

        // 3. Plugins (Headless often has 0)
        // Note: Array.isArray check to be safe
        if (nav.plugins && nav.plugins.length === 0) {
            this.score += this.weights.noPlugins;
            this.reasons.push("no_plugins");
        }

        // 4. Languages
        if (!nav.languages || nav.languages.length === 0) {
            this.score += this.weights.noLanguages;
            this.reasons.push("no_languages");
        }

        // 5. Headless Chrome
        if (typeof window !== 'undefined' && window.chrome === undefined && /Chrome/.test(ua)) {
            this.score += this.weights.headlessChrome;
            this.reasons.push("headless_chrome");
        }

        // 6. Viewport
        if (typeof window !== 'undefined' && window.innerWidth <= 800 && window.innerHeight <= 600) {
            this.score += this.weights.smallViewport;
            this.reasons.push("small_viewport");
        }

        // 7. Hardware Concurrency (Low core count is suspicious for modern desktops, typical for cheap bot VMs)
        if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 1) {
            this.score += this.weights.lowConcurrency;
            this.reasons.push("low_concurrency");
        }

        // 8. Device Memory (Low memory is suspicious)
        if (nav.deviceMemory && nav.deviceMemory <= 1) { // 1GB or less
            this.score += this.weights.lowMemory;
            this.reasons.push("low_memory");
        }
    },

    run: function () {
        this.detectStatic();

        // Expose results immediately if window exists
        if (typeof window !== 'undefined') {
            window.botguard_score = this.score;
            window.is_bot = this.score >= this.threshold;
            window.botguard_reasons = this.reasons;
        }
    }
};

export default BotGuard;
