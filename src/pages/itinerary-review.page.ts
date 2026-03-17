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

        const dateLocator = this.page.locator('//p[@class="sc-gEvEer itIhby"]').first();
        await expect(dateLocator).toHaveText(this.expected.flightDate);

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

        const priceLocator = this.page.locator('h3:has-text("Total Price")').locator('xpath=following-sibling::h2');
        const priceText = await priceLocator.textContent();
        if (!priceText) {
            throw new Error('Price text not found on the page');
        }
        const priceNumber = Number(priceText.replace(/[₹,]/g, ''));
        console.log("Total Price on Itinerary Review Page:", priceNumber);
        console.log("actual cheap price:", this.expected.cheapestPriceFromList);
        expect.soft(priceNumber).toBe(this.expected.cheapestPriceFromList);
    }

    async clickContinueButton() {
        console.log("new tab url:" + this.page.url());

        // STEP 1: Click main itinerary Continue — regular click works here,
        // no overlay present on the itinerary review page.
        const mainContinue = this.page.locator('button').filter({ hasText: 'Continue' }).first();
        await mainContinue.waitFor({ state: 'visible' });
        await mainContinue.click();
        await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
        console.log("main continue clicked");

        // STEP 2: Insurance screen — appears conditionally (not always shown).
        // We check for "Health Declaration" with a short timeout — if it appears,
        // we're on the insurance screen and use dispatchEvent to click Continue
        // (regular and force clicks fail here due to overlay interception).
        // If it doesn't appear, we skip silently and move on to add-ons.
        const insuranceVisible = await this.page.locator('text=Health Declaration')
            .isVisible({ timeout: 5000 }).catch(() => false);
        if (insuranceVisible) {
            const insuranceContinue = this.page.locator('button').filter({ hasText: 'Continue' }).first();
            await insuranceContinue.waitFor({ state: 'visible' });
            await insuranceContinue.dispatchEvent('click');
            await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
            console.log("insurance screen skipped");
        } else {
            console.log("insurance screen not shown, moving to add-ons");
        }

        // STEP 3: Add-ons screen — click "Skip add-ons" button (with hyphen).
        // Confirmed via DevTools: page button is <button> containing "Skip add-ons"
        const skipAddonsBtn = this.page.locator('button').filter({ hasText: 'Skip add-ons' }).first();
        if (await skipAddonsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await skipAddonsBtn.click();
            await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
            console.log("skip add-ons clicked");
        }

        // STEP 3b: "You missed adding Meal(s) and Seat(s)" modal popup.
        // Confirmed via DevTools: modal "Skip add ons" is a <p> tag (no hyphen)
        // which makes p:has-text uniquely target the modal vs the page button.
        const mealModalSkip = this.page.locator('p:has-text("Skip add ons")');
        if (await mealModalSkip.isVisible({ timeout: 3000 }).catch(() => false)) {
            await mealModalSkip.click();
            await mealModalSkip.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
            await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
            console.log("meal modal dismissed");
        }

        await this.page.screenshot({ path: 'screenshots/step3c-before-contact-form.png' });

        // STEP 4: Fill contact details — phone and email on the same form.
        const phoneInput = this.page.locator('input[type="text"]').first();
        await phoneInput.waitFor({ state: 'visible' });
        await phoneInput.click();
        await phoneInput.fill(this.expected.passenger.contact.phone);
        await phoneInput.press('Tab');
        console.log("phoneInput filled");

        // Email is input[type="email"] confirmed via DevTools
        const emailInput = this.page.locator('input[type="email"]');
        await emailInput.waitFor({ state: 'attached', timeout: 10000 });
        await emailInput.fill(this.expected.passenger.contact.email, { force: true });
        console.log("emailInput filled");

        // STEP 5: Click contact form Continue
        const contactContinueButton = this.page.locator('button').filter({ hasText: 'Continue' }).first();
        await contactContinueButton.waitFor({ state: 'visible' });
        await contactContinueButton.click();
        console.log("contactContinueButton clicked");

        // STEP 6: Fill traveller details
        const genderOption = this.page.locator(`p:has-text("${this.expected.passenger.traveller.gender}")`);
        await genderOption.waitFor({ state: 'visible' });
        await genderOption.click();

        await this.page.getByRole('textbox').nth(2).click();
        await this.page.getByRole('textbox').nth(2).fill(this.expected.passenger.traveller.firstName);
        await this.page.getByRole('textbox').nth(3).click();
        await this.page.getByRole('textbox').nth(3).fill(this.expected.passenger.traveller.lastName);

        await this.page.screenshot({ path: 'screenshots/passenger-details-filled.png' });

        // DOB — conditional, some fare types don't require it
        const comboboxDOB = this.page.locator('p:has-text("Date of birth")');
        if (await comboboxDOB.isVisible()) {
            const dob = this.expected.passenger.traveller.dob;
            await this.page.getByRole('combobox').first().selectOption(dob.day);
            await this.page.getByRole('combobox').nth(1).selectOption(dob.month);
            await this.page.getByRole('combobox').nth(2).selectOption(dob.year);
        } else {
            console.log("DOB combobox not visible, skipping.");
        }

        // Passport — conditional, only for international flights
        const passportLabel = this.page.locator('label, p, span')
            .filter({ hasText: /^Passport Number and Nationality$/ }).first();
        if (await passportLabel.count() > 0 && await passportLabel.isVisible().catch(() => false)) {
            const passport = this.expected.passenger.traveller.passport;
            const nationalityRegex = new RegExp(`^${passport.nationality}$`);
            await this.page.getByRole('textbox').nth(4).click();
            await this.page.getByRole('textbox').nth(4).fill(passport.number);
            await this.page.getByRole('textbox').nth(5).click();
            await this.page.locator('div').filter({ hasText: nationalityRegex }).first().click();
            await this.page.locator('input[type="text"]').nth(5).click();
            await this.page.locator('div').filter({ hasText: nationalityRegex }).first().click();
            await this.page.getByRole('combobox').nth(3).selectOption(passport.expiry.day);
            await this.page.getByRole('combobox').nth(4).selectOption(passport.expiry.month);
            await this.page.getByRole('combobox').nth(5).selectOption(passport.expiry.year);
        } else {
            console.log("Passport input fields not visible, skipping.");
        }
    }

    async clickPaymentButton() {
        const paymentButton = this.page.getByRole('button', { name: 'Continue to payment' });
        await paymentButton.waitFor({ state: 'visible' });
        await paymentButton.click();
    }
}