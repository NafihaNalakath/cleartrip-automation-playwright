import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class ItineraryReviewPage extends BasePage {
    constructor(page: Page, private expected: any) {
        super(page);
    }

    async verifyDetails() {

        const itineraryHeading = this.page.getByRole('heading', { name: /Review your itinerary/i });
        await expect(itineraryHeading).toBeVisible();
        await expect(itineraryHeading).toHaveText(/Review your itinerary/i);

        const dateLocator = await this.page.locator('//p[@class="sc-gEvEer itIhby"]').first();
        await expect(dateLocator).toHaveText(this.expected.flightDate);

        // Use first() to resolve strict mode: multiple elements match the text
        if (this.expected.From) {
            const fromText = this.page.getByText(this.expected.From, { exact: false }).first();
            await expect(fromText).toBeVisible({ timeout: 5000 });
        }

        if (this.expected.ToList?.length) {

    const destinationMatched = await Promise.any(
        this.expected.ToList.map(async (city: string) => {
            const locator = this.page.getByText(city, { exact: false }).first();
            await expect(locator).toBeVisible();
            return city;
        })
    );

    console.log(`Matched destination: ${destinationMatched}`);
}

        // if (this.expected.To) {
        //     const toText = this.page.getByText(this.expected.To, { exact: false }).first();
        //     await expect(toText).toBeVisible();
        // }

       const priceLocator = this.page.locator('h3:has-text("Total Price")').locator('xpath=following-sibling::h2');

const priceText = await priceLocator.textContent();
if (!priceText) {
    throw new Error('Price text not found on the page');
}
const numericString = priceText.replace(/[₹,]/g, '');

// Convert to number
const priceNumber = Number(numericString);
console.log("Total Price on Itinerary Review Page:", priceNumber);
console.log("actual cheap price:",this.expected.cheapestPriceFromList);



         expect.soft(priceNumber).toBe(this.expected.cheapestPriceFromList);
    }

     async clickContinueButton(){
            console.log("new tab url:" + this.page.url());
          
            // Step 1: Handle airport change modal if present
            const modalContinue = this.page
              .locator('button')
              .filter({ hasText: 'Continue' })
              .first();
          
            if (await modalContinue.isVisible()) {
              await modalContinue.click();
            }
          
            const mainContinue = this.page
              .locator('button')
              .filter({ hasText: 'Continue' })
              .last();
          
           // await mainContinue.waitFor({ state: 'attached' });
            await mainContinue.click();
          
            const skipAddOnContinue = this.page.locator('button', { hasText: 'Continue' }).nth(0)
            await skipAddOnContinue.click();

            const skipAddonButton = this.page.getByText('Skip add ons');
             if (await skipAddonButton.isVisible()) {
              await skipAddonButton.click();
            }
          

// Step 2: Fill contact details
          
const phoneInput = this.page.locator('input[type="text"]').first();
await phoneInput.click();
await phoneInput.fill('8129024134');
console.log("phoneInput filled");

const emailInput = this.page.locator('input[type="email"]');
await emailInput.click();
await emailInput.fill('nafinalakath66@gmail.com');
console.log("emailInput filled");

const cotactContinueButton = this.page.locator('button')
.filter({ hasText: 'Continue' })
await cotactContinueButton.click();
console.log("cotactContinueButton clicked");

  await this.page.locator('p:has-text("Female")').click();
  await this.page.getByRole('textbox').nth(2).click();
  await this.page.getByRole('textbox').nth(2).fill('Nafiha');
  await this.page.getByRole('textbox').nth(3).click();
  await this.page.getByRole('textbox').nth(3).fill('N');
  //take a screenshot after filling passenger details
  await this.page.screenshot({ path: 'screenshots/passenger-details-filled.png' });
  const comboboxDOB = this.page.getByRole('combobox')
if (await comboboxDOB.isVisible()) {
  await this.page.getByRole('combobox').first().selectOption('26');
  await this.page.getByRole('combobox').nth(1).selectOption('Oct');
  await this.page.getByRole('combobox').nth(2).selectOption('1997');
} else {
  console.log("DOB combobox not visible, skipping DOB selection.");
}
const passportInput = this.page.locator('div').filter({ hasText: 'Passport Number and Nationality' });
if (await passportInput.isVisible()) {
  await this.page.getByRole('textbox').nth(4).click();
  await this.page.getByRole('textbox').nth(4).fill('CX210908');
  await this.page.getByRole('textbox').nth(5).click();
  await this.page.locator('div').filter({ hasText: /^India$/ }).first().click();
  await this.page.locator('input[type="text"]').nth(5).click();
  await this.page.locator('div').filter({ hasText: /^India$/ }).first().click();
  await this.page.getByRole('combobox').nth(3).selectOption('22');
  await this.page.getByRole('combobox').nth(4).selectOption('Nov');
  await this.page.getByRole('combobox').nth(5).selectOption('2033');
} else {
  console.log("Passport input fields not visible, skipping passport details.");
}

}

async clickPaymentButton(){
  await this.page.getByRole('button', { name: 'Continue to payment' }).click();

}
}