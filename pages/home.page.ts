import {Page} from "@playwright/test";
import { BasePage } from "./base.page";

export class HomePage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    async gotoHomePage() {
        await this.navigateTo('https://www.cleartrip.com/');
        await this.page.getByTestId("closeIcon").click();
    }

    //locators
    fromCityInput = 'input[placeholder="Where from?"]';
    toCityInput = 'input[placeholder="Where to?"]';
    searchButton = this.page.getByRole('button', { name: 'Search flights' });

    //actions
    async selectFrom(city: string) {
        await this.type(this.fromCityInput, city);
        await this.page.getByText('Kozhikode, IN - Kozhikode').click();
       
    }
  async selectTo(city: string) {
    await this.page.locator('.field-1').click();
    await this.type(this.toCityInput, city);
    await this.page.getByText('Dubai, AE - Dubai International Airport (DXB)').click();
  }
  async selectDate() {
  let date = new Date();
  date.setDate(date.getDate() + 7);
  const day = date.getDate();
  const weekday = date.toLocaleString('default', { weekday: 'short' });
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();

  const formattedDate = `${weekday} ${month} ${day} ${year}`;
        await this.page.getByTestId('dateSelectOnward').click();
     await this.page.getByRole("gridcell",{name: `${formattedDate}` ,exact: true}).click();}

  async searchFlight() {
    await this.searchButton.click();
  }
}