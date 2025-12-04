✈️ Cleartrip.com Automation Suite

A robust end-to-end UI automation framework built using Playwright and TypeScript to test major workflows on Cleartrip.com, focusing on stability, readability, and scalability.

📌 Project Overview

This project automates key user journeys on Cleartrip such as searching for flights, validating available options, applying filters, and navigating booking flows.
It follows best practices like Page Object Model (POM), test tagging, reusable components, and parallel execution.

🧰 Tech Stack

Playwright (Test Runner)

TypeScript

Node.js

Page Object Model (POM)

🚀 Getting Started
1. Install Dependencies
npm install

2. Run Tests

Run all tests:

npx playwright test


Run in headed mode:

npx playwright test --headed


Run a specific test:

npx playwright test tests/flight-search.spec.ts

📊 Reporting

Generate HTML report:

npx playwright show-report