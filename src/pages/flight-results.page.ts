import { Page,expect } from "@playwright/test";    
import{ BasePage } from "./base.page";


export class FlightResultsPage extends BasePage {

        private cheapestIndex: number | null = null;

    constructor(page: Page) {
        super(page);
    }


async getAirlinesList(): Promise<string[]> {
    const airlineNames: string[] = [];

    // 1. We wrap the logic in a 'toPass' block. 
    // This will retry every few milliseconds until the 'expect' conditions are met.
    await expect(async () => {
        const selector = 'div[class*="sc-aXZVg"] div[style*="padding: 0px"]';
        const rows = await this.page.locator(selector).all();

        // 2. We set a "Success Condition": The list must have more than 1 item.
        // If it finds only 1, it will fail and try again automatically.
        if (rows.length <= 1) {
            throw new Error("List not fully loaded yet...");
        }

        airlineNames.length = 0; // Clear array for the retry

        for (const row of rows) {
            const name = await row.locator('p.mt-1').first().innerText();
            if (name.trim()) {
                airlineNames.push(name.trim());
            }
        }

        // 3. Final check: Ensure we didn't just get empty strings
        expect(airlineNames.length).toBeGreaterThan(1);

    }).toPass({
        intervals: [500, 1000, 2000], // Wait longer between each retry
        timeout: 15000 // Give up after 15 seconds
    });

    console.log(`Successfully captured ${airlineNames.length} airlines.`);
    return airlineNames;
}

    async getCheapestFlight() {
        const rows = this.page.locator('div.sc-aXZVg.jhlNOR.mt-6 > div > div[style="padding: 0px;"]')
               await rows.first().waitFor({state: 'visible'});
        const rowsCount = await rows.count();
        const airlinePrices = [];
         for (let i = 0; i < rowsCount; i++) {
            const airlineDiv = rows.nth(i).locator('div').first();
            const airlinePriceLocator= airlineDiv.locator('.sc-aXZVg.eYdrkD.flex.flex-right.flex-baseline');
            let airlinePriceText = await airlinePriceLocator.innerText();
            const match = airlinePriceText.match(/₹[\d,]+/); 
            if (match) {
            const airlinePrice = Number(match[0].replace(/[₹,]/g, ""));
         airlinePrices.push(Number(airlinePrice));}
            else {
    console.log("Invalid price:", airlinePriceText);
       }    //console.log(`Row ${i + 1}:`, airLineName);
        }

        const cheapestPriceFromList = Math.min(...airlinePrices);
        this.cheapestIndex = airlinePrices.indexOf(cheapestPriceFromList);

console.log(`Cheapest index: ${this.cheapestIndex}, Cheapest Price: ${airlinePrices}`);
        return cheapestPriceFromList;
    }

 cheapestPrice =  this.getCheapestFlight();

    async bookButton() {
        if (this.cheapestIndex === null) {
            throw new Error("Cheapest index not found. Call getCheapestFlight() before bookButton()");
        }
        const rows = this.page.locator('div.sc-aXZVg.jhlNOR.mt-6 > div > div[style="padding: 0px;"]')
        const cheapestAirlineLocator = rows.nth(this.cheapestIndex).locator('.sc-gEvEer.QldSh');


        await cheapestAirlineLocator.click();
    }

  
}
