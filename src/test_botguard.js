import BotGuard from './botguard.js';

function runTest(name, setup, assertions) {
    console.log(`\nRunning Test: ${name}`);

    // Mock Globals (reset each time)
    // Use defineProperty to avoid "getter-only" errors in some environments
    Object.defineProperty(global, 'window', {
        value: {
            innerWidth: 1024,
            innerHeight: 768,
            chrome: true,
        },
        writable: true,
        configurable: true
    });

    Object.defineProperty(global, 'navigator', {
        value: {
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
            webdriver: false,
            plugins: [{ name: "PDF Viewer" }],
            languages: ["en-US", "en"],
            hardwareConcurrency: 4,
            deviceMemory: 8
        },
        writable: true,
        configurable: true
    });

    // Apply specific setup
    setup(global.navigator);

    // Reset BotGuard state between tests!
    BotGuard.reset();

    // Execute
    BotGuard.run();

    // Assert
    assertions(global.window);
}

// TESTS

runTest("Clean User", (nav) => { }, (win) => {
    if (win.botguard_score === 0 && win.is_bot === false) {
        console.log(`✅ PASS: Correctly identified as HUMAN (Score: ${win.botguard_score})`);
    } else {
        console.error(`❌ FAIL: Expected HUMAN, got Score: ${win.botguard_score}`, win.botguard_reasons);
    }
});

runTest("Bot - Webdriver", (nav) => {
    nav.webdriver = true;
}, (win) => {
    if (win.is_bot === true && win.botguard_reasons.includes("webdriver")) {
        console.log(`✅ PASS: Correctly identified as BOT (Score: ${win.botguard_score})`);
    } else {
        console.error(`❌ FAIL: Expected BOT, got Score: ${win.botguard_score}`, win.botguard_reasons);
    }
});

runTest("Bot - Headless Traits", (nav) => {
    // Explicitly confirm webdriver is false (it should be from reset, but good to be safe)
    // nav.webdriver = false; 
    nav.plugins = [];
    nav.languages = [];
}, (win) => {
    // 15 + 15 = 30. Threshold is 50.
    if (win.is_bot === false && win.botguard_score === 30) {
        console.log(`✅ PASS: Correctly identified as HUMAN (Suspicious) (Score: ${win.botguard_score})`);
    } else {
        // If this fails with 65, it means webdriver is still true!
        console.error(`❌ FAIL: Expected SUSPICIOUS HUMAN, got Score: ${win.botguard_score}`, win.botguard_reasons);
    }
});

runTest("Bot - User Agent", (nav) => {
    nav.userAgent = "Googlebot/2.1 (+http://www.google.com/bot.html)";
}, (win) => {
    // UA is 90.
    if (win.is_bot === true && win.botguard_reasons.includes("known_bot_ua")) {
        console.log(`✅ PASS: Correctly identified as BOT (Score: ${win.botguard_score})`);
    } else {
        console.error(`❌ FAIL: Expected BOT, got Score: ${win.botguard_score}`, win.botguard_reasons);
    }
});

runTest("Bot - Low Hardware Spec", (nav) => {
    nav.hardwareConcurrency = 1;
    nav.deviceMemory = 0.5;
}, (win) => {
    // 10 + 10 = 20.
    if (win.is_bot === false && win.botguard_score === 20) {
        console.log(`✅ PASS: Correctly identified as HUMAN (Low Spec) (Score: ${win.botguard_score})`);
    } else {
        console.error(`❌ FAIL: Expected HUMAN, got Score: ${win.botguard_score}`, win.botguard_reasons);
    }
});
