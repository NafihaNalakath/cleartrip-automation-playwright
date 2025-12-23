import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class ItineraryReviewPage extends BasePage {
    constructor(page: Page, private expected: any) {
        super(page);
    }

    async verifyDetails() {

        const itineraryHeading = this.page.getByRole('heading', { name: /Review your itinerary/i });
        await expect(itineraryHeading).toBeVisible({ timeout: 10000 });
        await expect(itineraryHeading).toHaveText(/Review your itinerary/i);

        const dateLocator = await this.page.locator('//p[@class="sc-gEvEer itIhby"]').first();
        await expect(dateLocator).toHaveText(this.expected.flightDate);

        // Use first() to resolve strict mode: multiple elements match the text
        if (this.expected.From) {
            const fromText = this.page.getByText(this.expected.From, { exact: false }).first();
            await expect(fromText).toBeVisible({ timeout: 5000 });
        }

        if (this.expected.To) {
            const toText = this.page.getByText(this.expected.To, { exact: false }).first();
            await expect(toText).toBeVisible({ timeout: 5000 });
        }

       const priceLocator = this.page.locator('h3:has-text("Total Price")').locator('xpath=following-sibling::h2');

const priceText = await priceLocator.textContent();
if (!priceText) {
    throw new Error('Price text not found on the page');
}
const numericString = priceText.replace(/[₹,]/g, '');

// Convert to number
const priceNumber = Number(numericString);
console.log("Total Price on Itinerary Review Page:", priceNumber);


         expect.soft(priceNumber).toBe(this.expected.cheapestPrice);


    }

     async clickContinueButton(){
            console.log("new tab url:" + this.page.url());
          
            // Step 1: Handle airport change modal if present
            const modalContinue = this.page
              .locator('button')
              .filter({ hasText: 'Continue' })
              .first();
          
            if (await modalContinue.isVisible({ timeout: 3000 })) {
              await modalContinue.click();
            }


            //continue in addons 
          
            const mainContinue = this.page
              .locator('button')
              .filter({ hasText: 'Continue' })
              .last();
          
            await mainContinue.waitFor({ state: 'attached' });
            await mainContinue.click();
          


// 1️⃣ Click main page Skip add-ons
const mainSkipAddons = this.page.locator('text=/Skip add-?ons/i');
await mainSkipAddons.waitFor({ state: 'visible', timeout: 10000 });
await mainSkipAddons.click();
console.log("mainSkipAddons clicked");
//await this.page.screenshot({ path: 'after_skip_addons.png', fullPage: true });
// First, locate the modal container
const modal = this.page.locator('div.sc-aXZVg.dywpmT'); // the outermost modal div

// Then, locate the "Skip add ons" button inside the modal
if(await modal.isVisible({ timeout: 5000 })) {
    console.log("modal is visible");
const skipAddonsButton = modal.locator('p:text("Skip add ons")');
await skipAddonsButton.waitFor({ state: 'visible', timeout: 5000 });
// Click it
await skipAddonsButton.click();
console.log("skipAddonsButton clicked");
}   
          
const phoneInput = this.page.locator('input[type="text"]').first();
await phoneInput.waitFor({ state: 'visible', timeout: 5000 });
await phoneInput.click();
await phoneInput.fill('8129024134');
console.log("phoneInput filled");

const emailInput = this.page.locator('input[type="email"]');
await emailInput.waitFor({ state: 'visible', timeout: 5000 });
await emailInput.click();
await emailInput.fill('nafinalakath66@gmail.com');
console.log("emailInput filled");

const cotactContinueButton = this.page.locator('button')
.filter({ hasText: 'Continue' })
await cotactContinueButton.click();
console.log("cotactContinueButton clicked");

await this.page.locator('//p[normalize-space()="Female"]').click();
  await this.page.getByRole('textbox').nth(2).click();
  await this.page.getByRole('textbox').nth(2).fill('Nafiha');
  await this.page.getByRole('textbox').nth(3).click();
  await this.page.getByRole('textbox').nth(3).fill('n');
  await this.page.getByRole('combobox').first().selectOption('26');
  await this.page.getByRole('combobox').nth(1).selectOption('Oct');
  await this.page.getByRole('combobox').nth(2).selectOption('1997');
  await this.page.getByRole('textbox').nth(4).click();
  await this.page.getByRole('textbox').nth(4).fill('CX210908');
  await this.page.getByRole('textbox').nth(5).click();
  await this.page.locator('div').filter({ hasText: /^India$/ }).first().click();
  await this.page.locator('input[type="text"]').nth(5).click();
  await this.page.locator('div').filter({ hasText: /^India$/ }).first().click();
  await this.page.getByRole('combobox').nth(3).selectOption('22');
  await this.page.getByRole('combobox').nth(4).selectOption('Nov');
  await this.page.getByRole('combobox').nth(5).selectOption('2033');
  await this.page.getByRole('button', { name: 'Continue to payment' }).click();


console.log("continue to payment clicked");


}}