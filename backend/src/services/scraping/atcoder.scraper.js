import { puppeteerPool } from '../../utils/puppeteerPool.js';

export async function fetchAtCoderStats(username) {
  let page;
  try {
    const browser = await puppeteerPool.getBrowser();
    page = await browser.newPage();
    
    await page.goto(`https://atcoder.jp/users/${username}`, {
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    const stats = await page.evaluate(() => {
      const ratingElement = document.querySelector('.user-rating');
      const rankElement = document.querySelector('.user-rank');
      
      return {
        rating: ratingElement ? parseInt(ratingElement.textContent) : 0,
        rank: rankElement ? rankElement.textContent.trim() : 'Unrated'
      };
    });
    
    return {
      platform: 'ATCODER',
      username,
      data: stats
    };
  } catch (error) {
    throw new Error('Failed to fetch AtCoder data');
  } finally {
    if (page) {
      await puppeteerPool.closePage(page);
    }
  }
}