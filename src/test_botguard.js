const fs = require('fs');
const vm = require('vm');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, 'botguard.js'), 'utf8');

function runTest(name, setup, assertions) {
    console.log(`\nRunning Test: ${name}`);

    // Create a fresh context for every test to avoid 'const' redeclaration issues
    // and ensuring clean global state.
    const sandbox = {
        window: {
            innerWidth: 1024,
            innerHeight: 768,
            chrome: true, // properties need to be on the window object
        },
        navigator: {
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
            webdriver: false,
            plugins: [{ name: "PDF Viewer" }],
            languages: ["en-US", "en"],
            hardwareConcurrency: 4,
            deviceMemory: 8
        },
        console: console // Allow logs
    };

    // Circular reference for window.window if needed, but simple assignments usually suffice.
    sandbox.window.window = sandbox.window;

    // allow code to access 'navigator' directly as if it were global
    sandbox.navigator = sandbox.navigator;

    // Apply setup tweaks to the sandbox
    setup(sandbox);

    try {
        vm.createContext(sandbox);
        vm.runInContext(code, sandbox);

        // Extract results from sandbox window
        const resultWindow = sandbox.window;
        assertions(resultWindow);
    } catch (e) {
        console.error("Script Execution Error:", e);
    }
}

// TESTS

runTest("Clean User", (ctx) => { }, (win) => {
    if (win.botguard_score === 0 && win.is_bot === false) {
        console.log(`✅ PASS: Correctly identified as HUMAN (Score: ${win.botguard_score})`);
    } else {
        console.error(`❌ FAIL: Expected HUMAN, got Score: ${win.botguard_score}`, win.botguard_reasons);
    }
});

runTest("Bot - Webdriver", (ctx) => {
    ctx.navigator.webdriver = true;
}, (win) => {
    // Webdriver is now 50, so it should trigger is_bot
    if (win.is_bot === true && win.botguard_reasons.includes("webdriver")) {
        console.log(`✅ PASS: Correctly identified as BOT (Score: ${win.botguard_score})`);
    } else {
        console.error(`❌ FAIL: Expected BOT, got Score: ${win.botguard_score}`, win.botguard_reasons);
    }
});

runTest("Bot - Headless Traits", (ctx) => {
    ctx.navigator.plugins = [];
    ctx.navigator.languages = [];
}, (win) => {
    // 15 + 15 = 30. Threshold is 50. Should NOT be a bot yet.
    if (win.is_bot === false && win.botguard_score === 30) {
        console.log(`✅ PASS: Correctly identified as HUMAN (Suspicious) (Score: ${win.botguard_score})`);
    } else {
        console.error(`❌ FAIL: Expected SUSPICIOUS HUMAN, got Score: ${win.botguard_score}`, win.botguard_reasons);
    }
});

runTest("Bot - User Agent", (ctx) => {
    ctx.navigator.userAgent = "Googlebot/2.1 (+http://www.google.com/bot.html)";
}, (win) => {
    // UA is 90. Should be bot.
    if (win.is_bot === true && win.botguard_reasons.includes("known_bot_ua")) {
        console.log(`✅ PASS: Correctly identified as BOT (Score: ${win.botguard_score})`);
    } else {
        console.error(`❌ FAIL: Expected BOT, got Score: ${win.botguard_score}`, win.botguard_reasons);
    }
});

runTest("Bot - Low Hardware Spec", (ctx) => {
    ctx.navigator.hardwareConcurrency = 1;
    ctx.navigator.deviceMemory = 0.5;
}, (win) => {
    // 10 + 10 = 20. Should not be bot.
    if (win.is_bot === false && win.botguard_score === 20) {
        console.log(`✅ PASS: Correctly identified as HUMAN (Low Spec) (Score: ${win.botguard_score})`);
    } else {
        console.error(`❌ FAIL: Expected HUMAN, got Score: ${win.botguard_score}`, win.botguard_reasons);
    }
});
