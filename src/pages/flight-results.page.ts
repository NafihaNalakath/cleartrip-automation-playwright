import { Page,expect } from "@playwright/test";    
import{ BasePage } from "./base.page";


export class FlightResultsPage extends BasePage {

        private cheapestIndex: number | null = null;

    constructor(page: Page) {
        super(page);
    }


async getAirlinesList(): Promise<string[]> {
        // Scope to flight rows only, then get the airline name which is the first p.mt-1
        // inside each row. Using allInnerTexts() on the unscoped p.mt-1 grabbed promo
        // text like "Get at ₹11969 with Axis Credit Cards" which also uses p.mt-1.
        const rows = this.page.locator('div[style="padding: 0px;"]');
        await rows.first().waitFor({ state: 'visible' });

        const rowCount = await rows.count();
        const airlineNames: string[] = [];

        for (let i = 0; i < rowCount; i++) {
            const nameEl = rows.nth(i).locator('p.mt-1').first();
            const visible = await nameEl.isVisible().catch(() => false);
            if (!visible) continue;
            const name = await nameEl.innerText().catch(() => '');
            if (name.trim()) airlineNames.push(name.trim());
        }

        console.log(`Successfully captured ${airlineNames.length} airlines:`, airlineNames);
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

 //cheapestPrice =  this.getCheapestFlight();

    async bookButton() {
        if (this.cheapestIndex === null) {
            throw new Error("Cheapest index not found. Call getCheapestFlight() before bookButton()");
        }
        const rows = this.page.locator('div.sc-aXZVg.jhlNOR.mt-6 > div > div[style="padding: 0px;"]')
        const cheapestAirlineLocator = rows.nth(this.cheapestIndex).locator('.sc-gEvEer.QldSh');


await cheapestAirlineLocator.waitFor({ state: 'visible' });
        await cheapestAirlineLocator.click();    }

  
}
