# BotGuard

A lightweight, purely static JavaScript bot detection library designed for instant execution and easy integration with tools like Optimizely.

## How It Works

BotGuard executes immediately when loaded (no waiting for user interaction) and analyzes static browser properties to calculate a "bot score". If the score exceeds a configured threshold, the session is flagged as a bot.

The detection logic checks for:

1.  **Automation Flags**: Checks `navigator.webdriver`.
2.  **User Agent**: Matches against a known list of bot signatures (Googlebot, Bingbot, GPTBot, etc.).
3.  **Headless Browser Traits**:
    *   Absence of plugins.
    *   Absence of languages.
    *   Inconsistent Chrome properties (e.g., User Agent says Chrome but `window.chrome` is missing).
4.  **Hardware & Viewport**:
    *   Unusually small viewports (800x600 or less).
    *   Low hardware concurrency (1 core or less).
    *   Low device memory (1GB or less).

## Scoring System

Each check contributes points to a total score.
*   **Threshold**: 50 (default)

**Weights:**
*   User Agent Match: 50
*   Webdriver Present: 40
*   Headless Chrome Traits: 20
*   No Plugins: 15
*   No Languages: 15
*   Small Viewport: 10
*   Low Concurrency: 10
*   Low Memory: 10

## Integration

Include the script in your page header or before your tagging/experimentation logic.

The script exposes the following global variables immediately:

*   `window.botguard_score` (Number): The calculated bot score.
*   `window.is_bot` (Boolean): True if score >= threshold.
*   `window.botguard_reasons` (Array): List of triggered detection rules (e.g., `["webdriver", "no_plugins"]`).

### Example (Optimizely Web)

You can use these variables to set up Custom JavaScript targeting conditions or attributes.

```javascript
// Ensure BotGuard has run
if (window.is_bot) {
    // Logic to exclude from experiment or tag user
}
```

## Development

**Install Dependencies:**
```bash
npm install
```

**Run Tests:**
Runs the validation script using a mocked browser environment.
```bash
npm test
```

**Build:**
Minifies the `src/botguard.js` file to `botguard.min.js`.
```bash
npm run build
```
