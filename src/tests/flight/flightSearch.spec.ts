import {test,expect} from "@playwright/test";
import { flightSearchData } from "../../fixtures/flight-data";
import { HomePage } from "../../pages/home.page";
import { FlightResultsPage } from "../../pages/flight-results.page";
import { ItineraryReviewPage } from "../../pages/itinerary-review.page";

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
   
   expect(airlineNames).toContain(flightSearchData.expectedAirline);
   
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


  const itineraryReview = new ItineraryReviewPage(itineraryPage, { flightDate,From,To, cheapestPriceFromList : cheapestPrice });
  await itineraryReview.verifyDetails();
  await itineraryReview.clickContinueButton();

const [paymentPage] = await Promise.all([
  context.waitForEvent("page"),
  itineraryReview.clickPaymentButton(), // clicking Continue to payment opens new tab
]);

}); 

