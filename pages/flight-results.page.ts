import { Page } from "@playwright/test";    
import{ BasePage } from "./base.page";


export class FlightResultsPage extends BasePage {
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
}