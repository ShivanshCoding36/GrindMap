import puppeteer from 'puppeteer';

class PuppeteerPool {
  constructor() {
    this.browsers = [];
    this.maxBrowsers = 3;
    this.currentIndex = 0;
  }

  async getBrowser() {
    if (this.browsers.length < this.maxBrowsers) {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      this.browsers.push(browser);
      return browser;
    }
    
    // Reuse existing browser
    const browser = this.browsers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.browsers.length;
    return browser;
  }

  async closePage(page) {
    try {
      await page.close();
    } catch (error) {
      console.error('Error closing page:', error.message);
    }
  }

  async closeAll() {
    for (const browser of this.browsers) {
      try {
        await browser.close();
      } catch (error) {
        console.error('Error closing browser:', error.message);
      }
    }
    this.browsers = [];
  }
}

export const puppeteerPool = new PuppeteerPool();

// Cleanup on process exit
process.on('SIGINT', () => puppeteerPool.closeAll());
process.on('SIGTERM', () => puppeteerPool.closeAll());