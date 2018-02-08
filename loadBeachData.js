const puppeteer = require('puppeteer');

const loadBeachData = async (beaches) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
        headless: false,
    });

    const getTideInfo = async () => {
        return beaches.map( async (beach) => {
            const url = `https://www.tide-forecast.com/locations/${beach}/tides/latest`;
            const page = await browser.newPage();
            await page.goto(url, { timeout: 0 });

            return await page.evaluate((beach) => {
                const rowElements = document.querySelectorAll("#main > section > table > tbody > tr");
                allRows = [];
                let index = 0;
                let oddOrEven = null;
                rowElements.forEach( row => {
                    if(row.className !== oddOrEven){  
                        index++;
                        allRows[index] = [];
                        oddOrEven = row.className;
                    }
                    allRows[index].push(row);    
                });
                // Remove first empty element 
                allRows.shift();
                
                const tideData = allRows.map( dayRows => { 
                    const dateText = dayRows[0].querySelector(".date").innerText;

                    const dateObj = new Date(dateText);
                    const options = { weekday: "long", month: "long", day: "numeric" };
                    const date = dateObj.toLocaleDateString('en-US',options);

                    const timeRows = dayRows.map( row => row.querySelector(".time"));
                    const metricRows = dayRows.map( row => row.querySelector(".level.metric"));
                    const imperialRows = dayRows.map( row => row.querySelector(".level:not(.metric)"));
                    const tideCells = dayRows.map( row => row.querySelector("td:last-child"));

                    const sunriseRow = tideCells.findIndex( cell => cell.innerText === "Sunrise");
                    const sunsetRow = tideCells.findIndex( cell => cell.innerText === "Sunset");
                    const lowTideRow = tideCells.slice(sunriseRow,sunsetRow).findIndex( cell => cell.innerText === "Low Tide" ) + sunriseRow;

                    // If less than sunrise, Low Tide between days
                    if(lowTideRow < sunriseRow){
                        return {date, time: "N/A", height: "N/A", metricHeight:"N/A"};
                    }
                    const time = timeRows[lowTideRow].innerText;
                    const metricHeight = metricRows[lowTideRow].innerText;
                    const height = imperialRows[lowTideRow].innerText;
                    //Return the time and height for each daylight low tide,.
                    return { date, time, metricHeight, height };
                });
                return {beach, lowTide:tideData};
            },beach);
        });
    };

    const tideData = await getTideInfo().then( value => Promise.all(value) );
    browser.close();
    return tideData;
};

module.exports = loadBeachData; 
