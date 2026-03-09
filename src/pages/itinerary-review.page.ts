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
        await this.page.screenshot({ path: 'screenshots/step0-itinerary-loaded.png' });

        // STEP 1: Dismiss airport change modal if present
        const modalContinue = this.page.locator('button').filter({ hasText: 'Continue' }).first();
        if (await modalContinue.isVisible({ timeout: 3000 }).catch(() => false)) {
            await modalContinue.click();
            await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
            console.log("modal dismissed");
            await this.page.screenshot({ path: 'screenshots/step1-modal-dismissed.png' });
        }

        // STEP 2: Click the main itinerary Continue button
        const mainContinue = this.page.locator('button').filter({ hasText: 'Continue' }).first();
        await mainContinue.waitFor({ state: 'visible' });
        await mainContinue.click();
        await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
        console.log("main continue clicked");
        await this.page.screenshot({ path: 'screenshots/step2-after-main-continue.png' });

   // STEP 2: Insurance screen — appears conditionally, so check with short timeout
        const noInsurance = this.page.locator('text=No, I will book without insurance');
        if (await noInsurance.isVisible({ timeout: 4000 }).catch(() => false)) {
            await noInsurance.click();
            console.log("no insurance selected");
            const insuranceContinue = this.page.locator('button').filter({ hasText: 'Continue' }).first();
            await insuranceContinue.waitFor({ state: 'visible' });
            await insuranceContinue.click();
            await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
            console.log("insurance continue clicked");
        } else {
            console.log("insurance screen not shown, skipping");
        }

        // STEP 3: Handle Skip add-ons screen if it appears
        const skipAddonButton = this.page.getByText('Skip add ons');
        if (await skipAddonButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await skipAddonButton.click();
            await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
            console.log("skip addons clicked");
        } else {
            const skipContinue = this.page.locator('button').filter({ hasText: 'Continue' }).first();
            if (await skipContinue.isVisible({ timeout: 3000 }).catch(() => false)) {
                await skipContinue.click();
                await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
                console.log("skip addons continue clicked");
            }
        }
        await this.page.screenshot({ path: 'screenshots/step3-after-skip-addons.png' });

        // STEP 4: Fill contact details
        // Wait for phone input — most reliable signal the contact form is ready
        const phoneInput = this.page.locator('input[type="text"]').first();
        await phoneInput.waitFor({ state: 'visible' });
        await this.page.screenshot({ path: 'screenshots/step4-contact-form-visible.png' });
        await phoneInput.click();
        await phoneInput.fill('8129024134');
        await phoneInput.press('Tab');
        console.log("phoneInput filled");

        // Email input — use 'attached' + force since the field may be obscured by its label
        const emailInput = this.page.locator('input[type="email"]');
        await emailInput.waitFor({ state: 'attached', timeout: 10000 });
        await emailInput.fill('nafinalakath66@gmail.com', { force: true });
        console.log("emailInput filled");
        await this.page.screenshot({ path: 'screenshots/step4-contact-form-filled.png' });

        // STEP 5: Click the contact form's Continue button
        const contactContinueButton = this.page.locator('button').filter({ hasText: 'Continue' }).first();
        await contactContinueButton.waitFor({ state: 'visible' });
        await contactContinueButton.click();
        console.log("contactContinueButton clicked");

        
        // FIX 6: Wait for passenger details section to appear before interacting
        const femaleOption = this.page.locator('p:has-text("Female")');
        await femaleOption.waitFor({ state: 'visible' });
        await femaleOption.click();

        await this.page.getByRole('textbox').nth(2).click();
        await this.page.getByRole('textbox').nth(2).fill('Nafiha');
        await this.page.getByRole('textbox').nth(3).click();
        await this.page.getByRole('textbox').nth(3).fill('N');

        await this.page.screenshot({ path: 'screenshots/passenger-details-filled.png' });

        const comboboxDOB = this.page.locator('p:has-text("Date of birth")');
        if (await comboboxDOB.isVisible()) {
            await this.page.getByRole('combobox').first().selectOption('26');
            await this.page.getByRole('combobox').nth(1).selectOption('Oct');
            await this.page.getByRole('combobox').nth(2).selectOption('1997');
        } else {
            console.log("DOB combobox not visible, skipping DOB selection.");
        }

        // FIX: locator('div').filter({ hasText: ... }) matches every ancestor div too,
        // causing a strict mode violation (11 elements). Use a specific label/heading
        // locator scoped tightly, then check count() instead of isVisible().
        const passportInput = this.page.locator('label, p, span').filter({ hasText: /^Passport Number and Nationality$/ }).first();
        if (await passportInput.count() > 0 && await passportInput.isVisible().catch(() => false)) {
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

    async clickPaymentButton() {
        const paymentButton = this.page.getByRole('button', { name: 'Continue to payment' });
        // FIX 7: Wait for payment button to be visible before clicking
        await paymentButton.waitFor({ state: 'visible' });
        await paymentButton.click();
    }
}