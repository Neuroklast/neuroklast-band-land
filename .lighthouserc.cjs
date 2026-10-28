/**
 * Mobile Lighthouse CI against the locally built application.
 * First establish a real baseline, then tighten these limits based on data.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start -- --hostname 127.0.0.1',
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 60000,
      url: [
        'http://127.0.0.1:3000/',
        'http://127.0.0.1:3000/plugins',
        'http://127.0.0.1:3000/releases',
      ],
      numberOfRuns: 2,
      settings: {
        formFactor: 'mobile',
        throttlingMethod: 'simulate',
        screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false },
        chromeFlags: '--no-sandbox --headless --no-proxy-server --disable-dev-shm-usage',
      },
    },
    assert: {
      assertions: {
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:performance': ['warn', { minScore: 0.65 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 5500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.15 }],
        'total-blocking-time': ['warn', { maxNumericValue: 950 }],
        'resource-summary:script:size': ['error', { maxNumericValue: 900000 }],
        'resource-summary:total:size': ['error', { maxNumericValue: 3500000 }],
      },
    },
    upload: { target: 'filesystem', outputDir: './lighthouse-reports' },
  },
}
