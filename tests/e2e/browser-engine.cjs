// Reuse existing component/guest scenarios with an explicitly selected Playwright engine.
const path=require('node:path'),playwright=require('playwright');
const [engine,test]=process.argv.slice(2);
if(!['chromium','webkit','firefox'].includes(engine)||!test)throw Error('Usage: node tests/e2e/browser-engine.cjs <engine> <test.cjs>');
const launch=playwright[engine].launch.bind(playwright[engine]);
playwright.chromium.launch=launch;
console.log('Browser engine:',engine);require(path.resolve(test));
