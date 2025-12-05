import { Page } from "@playwright/test";    
import{ BasePage } from "./base.page";


export class FlightResultsPage extends BasePage {

        private cheapestIndex: number | null = null;

    constructor(page: Page) {
        super(page);
    }

    async getAirlinesList() {
        const rows = this.page.locator('div.sc-aXZVg.jhlNOR.mt-6 > div > div[style="padding: 0px;"]')
        const rowsCount = rows.count();
        const airlineNames = [];
        console.log(`Total number of flights: ${await rowsCount}`);
        for (let i = 0; i < await rowsCount; i++) {
            const airlineDiv = rows.nth(i).locator('div').first();
            const airlineNameLocator= airlineDiv.locator('.sc-gEvEer.ezLjvn.mt-1');
            const airLineName = await airlineNameLocator.innerText();
            airlineNames.push(airLineName);
            //console.log(`Row ${i + 1}:`, airLineName);
        }
        return airlineNames;
    }   
    async getCheapestFlight() {
        const rows = this.page.locator('div.sc-aXZVg.jhlNOR.mt-6 > div > div[style="padding: 0px;"]')
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
}
           
            //console.log(`Row ${i + 1}:`, airLineName);
        }

        const cheapestPriceFromList = Math.min(...airlinePrices);
        this.cheapestIndex = airlinePrices.indexOf(cheapestPriceFromList);

console.log(`Cheapest index: ${this.cheapestIndex}, Cheapest Price: ${airlinePrices}`);
        return cheapestPriceFromList;
        


    }

    async bookButton() {
        if (this.cheapestIndex === null) {
            throw new Error("Cheapest index not found. Call getCheapestFlight() before bookButton()");
        }
        const rows = this.page.locator('div.sc-aXZVg.jhlNOR.mt-6 > div > div[style="padding: 0px;"]')
        const cheapestAirlineLocator = rows.nth(this.cheapestIndex).locator('.sc-gEvEer.QldSh');


        await cheapestAirlineLocator.click();
    }
}
