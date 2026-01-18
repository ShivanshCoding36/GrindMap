import { puppeteerPool } from '../../utils/puppeteerPool.js';

export async function fetchCodeChefStats(username) {
  let page;
  try {
    const browser = await puppeteerPool.getBrowser();
    page = await browser.newPage();
    
    await page.goto(`https://www.codechef.com/users/${username}`, {
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    const stats = await page.evaluate(() => {
      const ratingElement = document.querySelector('.rating-number');
      const problemsElement = document.querySelector('.problems-solved');
      
      return {
        rating: ratingElement ? parseInt(ratingElement.textContent) : 0,
        problemsSolved: problemsElement ? parseInt(problemsElement.textContent) : 0
      };
    });
    
    return {
      platform: 'CODECHEF',
      username,
      data: stats
    };
  } catch (error) {
    throw new Error('Failed to fetch CodeChef data');
  } finally {
    if (page) {
      await puppeteerPool.closePage(page);
    }
  }
}