import {test} from "@playwright/test";
import { HomePage } from "../../pages/home.page";

test("Search flights", async ({ page }) => {
  const home = new HomePage(page);

  await home.gotoHomePage();

  await home.selectFrom("Kozhikode");
  await home.selectTo("Dubai");
    await page.waitForTimeout(3000);

  await home.searchFlight();

  await page.waitForTimeout(3000);
});