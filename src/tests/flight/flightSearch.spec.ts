import {test,expect} from "@playwright/test";
import { HomePage } from "../../pages/home.page";
import { FlightResultsPage } from "../../pages/flight-results.page";
import { ItineraryReviewPage } from "../../pages/itinerary-review.page";

import flightSearchData from "../../fixtures/flight-data.json";
import passengerData from "../../fixtures/passenger-data.json";

test.setTimeout(60000);

test.skip(!!process.env.CI, 
  'Skipped in CI — site requires browser interaction');

let home : HomePage;
let From: string;
let To: string;
let flightDate: RegExp;
let cheapestPrice: number;
test.beforeEach(async ({ page }) => {
  home = new HomePage(page);
  await home.gotoHomePage();
  From =await home.selectFrom(flightSearchData.from);
  To = await home.selectTo(flightSearchData.to);
  flightDate = await home.selectDate();
  await home.searchFlight();
  await page.waitForLoadState("networkidle");
await page.locator('div.sc-aXZVg.jhlNOR.mt-6 > div > div[style="padding: 0px;"]').first().waitFor({ state: 'visible' });
})

test("Search flights and validate flights are avaialabe", async ({ page,context }) => {
  
  //check flights are available by  checking the flight count
   page.locator('//div[@class="sc-aXZVg XkSZw flex flex-middle my-2"]/child::h3');
   const flightCount= await page.locator('//div[@class="sc-aXZVg XkSZw flex flex-middle my-2"]/child::h3').textContent();

    const flightCountNumber = flightCount ? parseInt(flightCount.replace(/\D/g, '')) : 0;
    
    expect(flightCountNumber).toBeGreaterThan(0); 

    console.log(`Number of flights found: ${flightCountNumber}`);
  });

    
test("Validate the list of airlines and find the cheapest flight", async ({ page,context }) => {
    const flightResult = new FlightResultsPage(page);

    const airlineNames = await flightResult.getAirlinesList();
   
const knownAirlines = flightSearchData.expectedAirlines;
  const hasKnownAirline = airlineNames.some(name => knownAirlines.includes(name));
  expect(hasKnownAirline, `Expected at least one of ${knownAirlines} in: ${airlineNames}`).toBe(true);
   
    //get the cheapest flight price
  const cheapestPrice = await flightResult.getCheapestFlight();
});

    
test("select the cheapest flight and book the flight", async ({ page,context }) => {

    const flightResult = new FlightResultsPage(page);
  const cheapestPrice = await flightResult.getCheapestFlight();


  // OPEN NEW TAB HERE TO review the selected flight details
  const [itineraryPage] = await Promise.all([
    context.waitForEvent("page"),
    flightResult.bookButton(), // clicking Book opens new tab
  ]);
  await itineraryPage.waitForLoadState("domcontentloaded");
await itineraryPage.waitForLoadState("networkidle");


 // const itineraryReview = new ItineraryReviewPage(itineraryPage, { flightDate,From,To, cheapestPriceFromList : cheapestPrice });
  const itineraryReview = new ItineraryReviewPage(itineraryPage, { 
    flightDate, 
    From, 
    To, 
    cheapestPriceFromList: cheapestPrice,
    passenger: passengerData   // pass passenger data from JSON
  }); 
  
 await itineraryReview.verifyDetails();
  await itineraryReview.clickContinueButton();

await itineraryReview.clickPaymentButton();
await itineraryPage.waitForLoadState("domcontentloaded");

const paymentUrl = itineraryPage.url();
  console.log("Payment page URL:", paymentUrl);
  expect(paymentUrl).toContain('cleartrip.com');
  expect(paymentUrl).not.toContain('/flights/results');

}); 

