import {test,expect} from "@playwright/test";
import { flightSearchData } from "../../fixtures/flight-data";
import { HomePage } from "../../pages/home.page";
import { FlightResultsPage } from "../../pages/flight-results.page";
import { ItineraryReviewPage } from "../../pages/itinerary-review.page";

test("Search flights and check flights are avaialabe", async ({ page,context }) => {
  const home = new HomePage(page);
  const flightResult = new FlightResultsPage(page);
  

  await home.gotoHomePage();

  const From =await home.selectFrom(flightSearchData.from);
  const To = await home.selectTo(flightSearchData.to);
  const flightDate = await home.selectDate();
  await home.searchFlight();
  await page.waitForLoadState('networkidle');

  //check flights are available by  checking the flight count
   await  page.locator('//div[@class="sc-aXZVg XkSZw flex flex-middle my-2"]/child::h3').waitFor({state:'visible', timeout:6000});
   const flightCount= await page.locator('//div[@class="sc-aXZVg XkSZw flex flex-middle my-2"]/child::h3').textContent();

    const flightCountNumber = flightCount ? parseInt(flightCount.replace(/\D/g, '')) : 0;
    
    expect(flightCountNumber).toBeGreaterThan(0); 


   
    const airlineNames = await flightResult.getAirlinesList();
   // const expectedNames = ["IndiGo","Air Arabia", "Air India Express","SpiceJet"];
   expect(airlineNames).toContain(flightSearchData.expectedAirline);

    //get the cheapest flight price
  const cheapestPrice = await flightResult.getCheapestFlight();

    

  // OPEN NEW TAB HERE TO review the selected flight details
  const [itineraryPage] = await Promise.all([
    context.waitForEvent("page"),
    flightResult.bookButton(), // clicking Book opens new tab
  ]);

   
  const itineraryReview = new ItineraryReviewPage(itineraryPage, { flightDate,From,To,cheapestPrice });
  await itineraryReview.verifyDetails();
  await itineraryReview.clickContinueButton();


}); 

