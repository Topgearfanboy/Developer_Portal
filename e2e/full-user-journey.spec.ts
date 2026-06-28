import { test, expect, Page, Browser } from "@playwright/test";
import {
  cleanupTestUser,
  generateTestUser,
  closePrisma,
  verifyUserInactive,
} from "./test-utils";

/**
 * Full User Journey E2E Test
 *
 * This test covers the complete user flow:
 * 1. Create a new account (register)
 * 2. Log in
 * 3. Create a new property
 * 4. Enter that property, add all block types, and update every field
 * 5. Verify the updated values persist after reload
 * 6. Go back to the dashboard
 * 7. Delete the property
 * 8. Delete the account via the UI (sets inactive)
 * 9. Verify the account is inactive in the DB
 */

// Fill a data-testid input and blur so CurrencyField/PercentageField format
async function fillAndBlur(page: Page, testId: string, value: string) {
  const input = page.locator(`[data-testid="${testId}"]`);
  await input.fill("");
  await input.fill(value);
  await input.blur();
}

// Verify a data-testid input value
async function expectValue(page: Page, testId: string, expected: string) {
  await expect(page.locator(`[data-testid="${testId}"]`)).toHaveValue(expected);
}

// Add a block from the dropdown
async function addBlock(page: Page, dataTestId: string) {
  await page.click('[data-testid="add-block-button"]');
  await expect(page.locator(`[data-testid="${dataTestId}"]`)).toBeVisible();
  await page.click(`[data-testid="${dataTestId}"]`);
}

// Expand a collapsible section by its title
async function expandSection(page: Page, title: string) {
  await page.getByRole("button", { name: title }).click();
}

// Scroll a block into the carousel viewport
async function scrollToBlock(page: Page, testId: string) {
  await page.locator(`[data-testid="${testId}"]`).scrollIntoViewIfNeeded();
}

test.describe.serial("Full User Journey", () => {
  const testUser = generateTestUser();
  let createdPropertyId: string | null = null;
  let page: Page;
  let browser: Browser;

  test.beforeAll(async ({ browser: b }) => {
    browser = b;
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    try {
      // Clean up test data (hard delete from DB)
      await cleanupTestUser(testUser.email);
    } finally {
      await closePrisma();
      await page.close();
    }
  });

  test("complete user journey - register, login, create property, manage all blocks, delete property, delete account", async () => {
    // ==========================================
    // STEP 1: Register new account
    // ==========================================
    console.log("[E2E] Step 1: Registering new account...");

    await page.goto("/register");
    await expect(page.locator("h2")).toHaveText("Create account");

    await page.fill("input#name", testUser.name);
    await page.fill("input#email", testUser.email);
    await page.fill("input#password", testUser.password);
    await page.fill("input#confirmPassword", testUser.password);

    await page.check("input#age");
    await page.check("input#eu");
    await page.check("input#terms");
    await page.check("input#california");

    await page.click('button[type="submit"]');

    try {
      await page.waitForURL("/", { timeout: 60000 });
    } catch (error) {
      const url = page.url();
      const body = await page.content();
      console.error(`[E2E] Registration timeout. URL: ${url}\nBody: ${body}`);
      throw error;
    }
    await expect(page.locator("h1")).toHaveText("Dashboard");
    console.log(`[E2E] ✓ User registered: ${testUser.email}`);

    // ==========================================
    // STEP 2: Log out and log back in
    // ==========================================
    console.log("[E2E] Step 2: Testing logout/login...");

    await page.context().clearCookies();
    await page.goto("/login");
    await expect(page.locator("h2")).toHaveText("Sign in");

    await page.fill("input#email", testUser.email);
    await page.fill("input#password", testUser.password);
    await page.click('button[type="submit"]');

    await page.waitForURL("/", { timeout: 60000 });
    await expect(page.locator("h1")).toHaveText("Dashboard");
    console.log("[E2E] ✓ User logged in successfully");

    // ==========================================
    // STEP 3: Create a new property
    // ==========================================
    console.log("[E2E] Step 3: Creating property...");

    await page.click('[data-testid="add-property-button"]');
    await expect(
      page.locator('[data-testid="new-property-modal"]'),
    ).toBeVisible();

    const propertyName = `Test Property ${Date.now()}`;
    await page.fill('[data-testid="new-property-name"]', propertyName);
    await page.fill('[data-testid="new-property-zip"]', "90210");
    await page.fill(
      '[data-testid="new-property-county"]',
      "Los Angeles County",
    );
    await page.click('[data-testid="create-property-button"]');

    await expect(
      page.locator('[data-testid="new-property-modal"]'),
    ).not.toBeVisible();

    const propertyCard = page
      .locator('[data-testid="property-card"]')
      .filter({ hasText: propertyName });
    await expect(propertyCard).toBeVisible({ timeout: 10000 });

    const viewLink = propertyCard.locator('a[href^="/build/"]');
    const href = await viewLink.getAttribute("href");
    createdPropertyId = href?.replace("/build/", "") || null;

    console.log(
      `[E2E] ✓ Property created: ${propertyName} (ID: ${createdPropertyId})`,
    );
    expect(createdPropertyId).not.toBeNull();

    // ==========================================
    // STEP 4: Add and configure every block type
    // ==========================================
    console.log("[E2E] Step 4: Adding and configuring all blocks...");

    await page.goto(`/build/${createdPropertyId}`);

    await expect(page.locator("text=Loading property...")).not.toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('[data-testid="add-block-button"]')).toBeVisible({
      timeout: 10000,
    });

    // ---- Buy block ----
    await addBlock(page, "add-buy-block");
    await expect(page.locator("text=Buy Block")).toBeVisible();
    await expect(page.locator('[data-testid="buy-block"]')).toBeVisible();

    await fillAndBlur(page, "buy-cost", "500000");
    await fillAndBlur(page, "buy-interest-rate", "4.5");
    await fillAndBlur(page, "buy-downpayment", "25");
    await fillAndBlur(page, "buy-closing-costs", "5");
    await page.click('[data-testid="buy-loan-term-15"]');
    await fillAndBlur(page, "buy-property-taxes", "1.5");
    await fillAndBlur(page, "buy-annual-hoa", "500");
    await fillAndBlur(page, "buy-insurance", "800");
    await page.check('[data-testid="buy-interest-only"]');

    await expandSection(page, "Project Planning");
    await fillAndBlur(page, "buy-income-needed", "100000");
    await fillAndBlur(page, "buy-max-loan-arv", "400000");
    await fillAndBlur(page, "buy-initial-cash", "150000");
    await fillAndBlur(page, "buy-saved-renovation", "50000");
    await fillAndBlur(page, "buy-minimum-cash", "200000");

    // ---- Renovate block ----
    await addBlock(page, "add-renovate-block");
    await expect(page.locator("text=Renovate Block")).toBeVisible();

    await page.click('[data-testid="renovate-items-add"]');
    await page.fill('[data-testid="renovate-items-item-0-name"]', "Kitchen");
    await page.fill('[data-testid="renovate-items-item-0-cost"]', "25000");

    await page.selectOption('[data-testid="renovate-time-days"]', "");
    await page.selectOption('[data-testid="renovate-time-months"]', "2");
    await page.selectOption('[data-testid="renovate-time-years"]', "");

    await fillAndBlur(page, "renovate-arv", "600000");

    await expandSection(page, "Monthly Cost To Own");
    await fillAndBlur(page, "renovate-utility-county", "100");
    await fillAndBlur(page, "renovate-utility-electricity", "150");
    await page.check('[data-testid="renovate-defer-interest"]');

    // ---- Refinance block ----
    await addBlock(page, "add-refinance-block");
    await expect(page.locator("text=Refinance Block")).toBeVisible();

    await page.check('[data-testid="refinance-cash-out-true"]');
    await fillAndBlur(page, "refinance-estimated-value", "600000");
    await fillAndBlur(page, "refinance-interest-rate", "5.5");
    await fillAndBlur(page, "refinance-financed-amount", "450000");
    await fillAndBlur(page, "refinance-closing-costs", "3");
    await page.click('[data-testid="refinance-loan-term-20"]');
    await fillAndBlur(page, "refinance-property-taxes", "1.5");
    await fillAndBlur(page, "refinance-insurance", "800");
    await page.check('[data-testid="refinance-interest-only"]');

    await expandSection(page, "Remaining Equity");
    await fillAndBlur(page, "refinance-remaining-equity-amount", "150000");
    await fillAndBlur(page, "refinance-remaining-equity-percent", "25");

    // ---- Rent block ----
    await addBlock(page, "add-rent-block");
    await expect(page.locator("text=Rent Block")).toBeVisible();

    await fillAndBlur(page, "rent-monthly-rent", "3000");
    await page.selectOption('[data-testid="rent-time-timeRentedMonths"]', "0");
    await page.selectOption('[data-testid="rent-time-timeRentedYears"]', "2");
    await fillAndBlur(page, "rent-vacancy", "8");
    await fillAndBlur(page, "rent-management", "10");
    await fillAndBlur(page, "rent-maintenance", "200");
    await fillAndBlur(page, "rent-annual-rent-increase", "3");

    // ---- Sell block ----
    await addBlock(page, "add-sell-block");
    await expect(page.locator("text=Sell Block")).toBeVisible();

    await fillAndBlur(page, "sell-price", "700000");
    await page.selectOption('[data-testid="sell-time-to-sell"]', "6");
    await fillAndBlur(page, "sell-closing-costs", "5");

    // Wait for auto-save to finish
    await page.waitForTimeout(2000);

    // Reload and verify all values persisted
    await page.reload();
    await expect(page.locator("text=Loading property...")).not.toBeVisible({
      timeout: 10000,
    });

    // Verify Buy block
    await scrollToBlock(page, "buy-block");
    await expectValue(page, "buy-cost", "$500,000");
    await expectValue(page, "buy-interest-rate", "4.50%");
    await expectValue(page, "buy-downpayment", "25.00%");
    await expectValue(page, "buy-closing-costs", "5.00%");
    await expect(
      page.locator('[data-testid="buy-loan-term-15"]'),
    ).toHaveAttribute("class", /bg-primary/);
    await expectValue(page, "buy-property-taxes", "1.50%");
    await expectValue(page, "buy-annual-hoa", "$500");
    await expectValue(page, "buy-insurance", "$800");
    await expect(
      page.locator('[data-testid="buy-interest-only"]'),
    ).toBeChecked();

    await expandSection(page, "Project Planning");
    await expectValue(page, "buy-income-needed", "$100,000");
    await expectValue(page, "buy-max-loan-arv", "$400,000");
    await expectValue(page, "buy-initial-cash", "$150,000");
    await expectValue(page, "buy-saved-renovation", "$50,000");
    await expectValue(page, "buy-minimum-cash", "$200,000");

    // Verify Renovate block
    await scrollToBlock(page, "renovate-block");
    await expect(
      page.locator('[data-testid="renovate-items-item-0-name"]'),
    ).toHaveValue("Kitchen");
    await expect(
      page.locator('[data-testid="renovate-items-item-0-cost"]'),
    ).toHaveValue("25000");
    await expectValue(page, "renovate-time-days", "");
    await expectValue(page, "renovate-time-months", "2");
    await expectValue(page, "renovate-time-years", "");
    await expectValue(page, "renovate-arv", "$600,000");

    await expandSection(page, "Monthly Cost To Own");
    await expectValue(page, "renovate-utility-county", "$100");
    await expectValue(page, "renovate-utility-electricity", "$150");
    await expect(
      page.locator('[data-testid="renovate-defer-interest"]'),
    ).toBeChecked();

    // Verify Refinance block
    await scrollToBlock(page, "refinance-block");
    await expect(
      page.locator('[data-testid="refinance-cash-out-true"]'),
    ).toBeChecked();
    await expectValue(page, "refinance-estimated-value", "$600,000");
    await expectValue(page, "refinance-interest-rate", "5.50%");
    await expectValue(page, "refinance-financed-amount", "$450,000");
    await expectValue(page, "refinance-closing-costs", "3.00%");
    await expect(
      page.locator('[data-testid="refinance-loan-term-20"]'),
    ).toHaveAttribute("class", /bg-primary/);
    await expectValue(page, "refinance-property-taxes", "1.50%");
    await expectValue(page, "refinance-insurance", "$800");
    await expect(
      page.locator('[data-testid="refinance-interest-only"]'),
    ).toBeChecked();

    await expandSection(page, "Remaining Equity");
    await expectValue(page, "refinance-remaining-equity-amount", "$150,000");
    await expectValue(page, "refinance-remaining-equity-percent", "25.00%");

    // Verify Rent block
    await scrollToBlock(page, "rent-block");
    await expectValue(page, "rent-monthly-rent", "$3,000");
    await expectValue(page, "rent-time-timeRentedMonths", "0");
    await expectValue(page, "rent-time-timeRentedYears", "2");
    await expectValue(page, "rent-vacancy", "8.00%");
    await expectValue(page, "rent-management", "10.00%");
    await expectValue(page, "rent-maintenance", "$200");
    await expectValue(page, "rent-annual-rent-increase", "3.00%");

    // Verify Sell block
    await scrollToBlock(page, "sell-block");
    await expectValue(page, "sell-price", "$700,000");
    await expectValue(page, "sell-time-to-sell", "6");
    await expectValue(page, "sell-closing-costs", "5.00%");

    console.log("[E2E] ✓ All blocks configured and values persisted");

    // ==========================================
    // STEP 5: Go back to dashboard
    // ==========================================
    console.log("[E2E] Step 5: Returning to dashboard...");

    await page.click('[data-testid="back-to-dashboard"]');
    await page.waitForURL("/", { timeout: 10000 });
    await expect(page.locator("h1")).toHaveText("Dashboard");

    console.log("[E2E] ✓ Navigated back to dashboard");

    // ==========================================
    // STEP 6: Delete the property
    // ==========================================
    console.log("[E2E] Step 6: Deleting property...");

    const testPropertyCard = page
      .locator('[data-testid="property-card"]')
      .filter({ hasText: propertyName });
    await expect(testPropertyCard).toBeVisible({ timeout: 10000 });

    await testPropertyCard
      .locator('[data-testid="delete-property-button"]')
      .click();
    await expect(
      page.locator('[data-testid="delete-property-modal"]'),
    ).toBeVisible();
    await page.click('[data-testid="confirm-delete-property-button"]');

    await expect(
      page.locator('[data-testid="delete-property-modal"]'),
    ).not.toBeVisible();
    await expect(
      page.locator("text=Failed to delete property"),
    ).not.toBeVisible();

    console.log("[E2E] ✓ Property deleted");

    // ==========================================
    // STEP 7: Delete the account via the UI
    // ==========================================
    console.log("[E2E] Step 7: Deleting account via UI...");

    await page.click('[data-testid="user-menu-button"]');
    await page.click('[data-testid="settings-link"]');

    await page.waitForURL("/settings", { timeout: 10000 });
    await expect(page.locator("h1")).toHaveText("Account Settings");

    await page.click('[data-testid="delete-account-button"]');
    await expect(
      page.locator('[data-testid="delete-account-modal"]'),
    ).toBeVisible();

    await page.click('[data-testid="confirm-delete-button"]');

    await page.waitForURL("/login", { timeout: 10000 });
    await expect(page.locator("h2")).toHaveText("Sign in");

    const isInactive = await verifyUserInactive(testUser.email);
    expect(isInactive).toBe(true);
    console.log("[E2E] ✓ Account deactivated in database");

    console.log("[E2E] ✓✓✓ Full user journey completed successfully!");
  });
});
