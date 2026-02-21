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
    async selectFrom(FromCity: string) {
        await this.type(this.fromCityInput, FromCity);
        await this.page.getByText('Kozhikode, IN - Kozhikode').click();
       return FromCity;
    }
  async selectTo(city: string) {
    await this.page.locator('.field-1').click();
    await this.type(this.toCityInput, city);
    await this.page.getByText('Dubai, AE - Dubai International Airport (DXB)').click();
    return city;
  }
  async selectDate() {
  let date = new Date(); 
  date.setDate(date.getDate() + 7);
 const day = date.getDate();

  const weekday = date.toLocaleString('default', { weekday: 'short' });
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();

  const bookingDate = new RegExp(`^${weekday} ${month} 0?${day} ${year}$`);

  const bookingDateInReviewPage = new RegExp(`^${weekday}, 0?${day} ${month} ${year}$`);
        
  await this.page.getByTestId('dateSelectOnward').click();
  await this.page.getByLabel(bookingDate).click();
          
  return bookingDateInReviewPage;

    }

  async searchFlight() {
    await this.searchButton.click();
  }

  
}