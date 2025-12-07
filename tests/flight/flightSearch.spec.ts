import {test,expect} from "@playwright/test";
import { HomePage } from "../../pages/home.page";
import { FlightResultsPage } from "../../pages/flight-results.page";
import { ItineraryReviewPage } from "../../pages/itinerary-review.page";
import { TIMEOUT } from "dns";


test("Search flights and check flights are avaialabe", async ({ page,context }) => {
  const home = new HomePage(page);
  const flightResult = new FlightResultsPage(page);
  

  await home.gotoHomePage();

  const From =await home.selectFrom("Kozhikode");
  const To = await home.selectTo("Dubai");
  const flightDate = await home.selectDate();
  await home.searchFlight();
  await page.waitForLoadState('networkidle');


   await  page.locator('//div[@class="sc-aXZVg XkSZw flex flex-middle my-2"]/child::h3').waitFor({state:'visible', timeout:6000});
   const flightCount= await page.locator('//div[@class="sc-aXZVg XkSZw flex flex-middle my-2"]/child::h3').textContent();

    const flightCountNumber = flightCount ? parseInt(flightCount.replace(/\D/g, '')) : 0;
    
    expect(flightCountNumber).toBeGreaterThan(0); 


   
    const airlineNames = await flightResult.getAirlinesList();
   // const expectedNames = ["IndiGo","Air Arabia", "Air India Express","SpiceJet"];
    expect(airlineNames).toContain("IndiGo");

    
  const cheapestPrice = await flightResult.getCheapestFlight();

    

  // ---- 🔥 OPEN NEW TAB HERE ----
  const [itineraryPage] = await Promise.all([
    context.waitForEvent("page"),
    flightResult.bookButton(), // clicking Book opens new tab
  ]);
    await itineraryPage.waitForLoadState();

  console.log("New tab title:", await itineraryPage.title());

  // Now create a page object for the new tab and verify details there
  const itineraryReview = new ItineraryReviewPage(itineraryPage, { flightDate,From,To,cheapestPrice });
  await itineraryReview.verifyDetails();
}); 

