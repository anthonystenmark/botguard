export const config = {
    threshold: 50,
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
    signatures: [
        'googlebot', 'bingbot', 'applebot',
        'gptbot', 'oai-searchbot', 'chatgpt-user',
        'anthropic-ai', 'claudebot', 'claude-web',
        'perplexitybot', 'perplexity-user',
        'amazonbot', 'facebookbot', 'meta-externalagent', 'meta-webindexer',
        'linkedinbot', 'bytespider', 'duckassistbot',
        'cohere-ai', 'ai2bot', 'ccbot', 'diffbot', 'omgili',
        'timpibot', 'youbot', 'mistralai-user',
        'grokbot', 'xai-grok'
    ]
};
