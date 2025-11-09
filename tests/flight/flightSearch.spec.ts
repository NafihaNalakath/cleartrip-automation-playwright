import {test,expect} from "@playwright/test";
import { HomePage } from "../../pages/home.page";

test("Search flights", async ({ page }) => {
  const home = new HomePage(page);

  await home.gotoHomePage();

  await home.selectFrom("Kozhikode");
  await home.selectTo("Dubai");
  await home.selectDate();
  await home.searchFlight();

  //assertion for flight results
  const flightCountText = await page.locator('.sc-aXZVg.XkSZw.flex.flex-middle.my-2').textContent();
  console.log(flightCountText);
  const countMatch = flightCountText?.match(/\d+/); // extract first number

  const count = countMatch ? parseInt(countMatch[0]) : 0;
    console.log(count);

  expect(count).toBeGreaterThan(0);

  await page.waitForTimeout(3000);
}); 