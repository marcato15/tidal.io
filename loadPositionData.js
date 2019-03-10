const puppeteer = require('puppeteer');

const loadPositionData = async (positions, year) => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});

  const promises = positions.map( async (position) => {
    const url = `https://legacy.baseballprospectus.com/compensation/index.php?pos=${position}&cyear=${year}`;
    const page = await browser.newPage();
    await page.goto(url, { timeout: 0 });

    return await page.evaluate((position) => {
      const nodeList = document.querySelectorAll("#cotsyearpos_datagrid > tbody > tr");
      const rows = Array.from(nodeList);
      const financialData = rows.map( row => { 
        const name = row.querySelector(".playerdef > a").innerText;
        const href = row.querySelector(".playerdef > a").href;
        const id = href.split("=").length > 1 ? href.split("=")[1] : null;
        const salaryText = row.querySelector("td:nth-child(3)")
          .innerText.replace(/[\$\,]/g,'');
        const salary = parseInt(salaryText,10);
        const warpText = row.querySelector("td:nth-child(5)")
          .innerText.replace(/[\$\,]/g,'');
        const warp = parseFloat(warpText);

        return { id, name, salary, warp };
      });
      return {position, financialData};
    },position);
  });
  const yearData = await Promise.all(promises);

  browser.close();
  return yearData;
};

module.exports = loadPositionData; 
