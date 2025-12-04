import {test,expect} from "@playwright/test";
import { HomePage } from "../../pages/home.page";
import { FlightResultsPage } from "../../pages/flight-results.page";
import { TIMEOUT } from "dns";


test("Search flights and check flights are avaialabe", async ({ page }) => {
  const home = new HomePage(page);
  const flightResult = new FlightResultsPage(page);

  await home.gotoHomePage();

  await home.selectFrom("Kozhikode");
  await home.selectTo("Dubai");
  await home.selectDate();
  await home.searchFlight();
  await page.waitForLoadState('networkidle');


   await  page.locator('//div[@class="sc-aXZVg XkSZw flex flex-middle my-2"]/child::h3').waitFor({state:'visible', timeout:3000});
   const flightCount= await page.locator('//div[@class="sc-aXZVg XkSZw flex flex-middle my-2"]/child::h3').textContent();

    const flightCountNumber = flightCount ? parseInt(flightCount.replace(/\D/g, '')) : 0;
    
    expect(flightCountNumber).toBeGreaterThan(0); 


   
    const airlineNames = await flightResult.getAirlinesList();
   // const expectedNames = ["IndiGo","Air Arabia", "Air India Express","SpiceJet"];
    expect(airlineNames).toContain("IndiGo");

}); 