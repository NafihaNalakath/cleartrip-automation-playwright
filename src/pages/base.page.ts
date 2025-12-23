import {Page} from "@playwright/test";

export class BasePage {
    readonly page: Page;
    constructor(page: Page) {
        this.page = page;
    }

async navigateTo(url: string) {
    await this.page.goto(url);
}

async  click(selector: string) {
    await this.page.locator(selector).click();
}

async type(selector: string,text: string) {
    await this.page.locator(selector).fill(text);   
}

async getText(selector: string){
return await this.page.locator(selector).innerText();
}

}