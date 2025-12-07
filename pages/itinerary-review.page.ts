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


        await expect(priceNumber).toBe(this.expected.cheapestPrice);


    }
}


