import { test, expect, Page, Browser } from "@playwright/test";
import { cleanupTestUser, generateTestUser, closePrisma } from "./test-utils";

/**
 * Full User Journey E2E Test
 *
 * This test covers the complete user flow:
 * 1. Create a new account (register)
 * 2. Log in
 * 3. Create a new property
 * 4. Enter that property
 * 5. Add a block (Buy block)
 * 6. Go back to the dashboard
 * 7. Delete the property
 */

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
      // Clean up test data
      await cleanupTestUser(testUser.email);
    } finally {
      await closePrisma();
      await page.close();
    }
  });

  test("complete user journey - register, login, create property, add block, delete", async () => {
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
    await page.click('button[type="submit"]');

    await page.waitForURL("/", { timeout: 10000 });
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

    await page.waitForURL("/", { timeout: 10000 });
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

    // Wait for the property card to appear
    const propertyCard = page
      .locator('[data-testid="property-card"]')
      .filter({ hasText: propertyName });
    await expect(propertyCard).toBeVisible({ timeout: 10000 });

    // Get property ID from the link
    const viewLink = propertyCard.locator('a[href^="/build/"]');
    const href = await viewLink.getAttribute("href");
    createdPropertyId = href?.replace("/build/", "") || null;

    console.log(
      `[E2E] ✓ Property created: ${propertyName} (ID: ${createdPropertyId})`,
    );
    expect(createdPropertyId).not.toBeNull();

    // ==========================================
    // STEP 4: Enter property and add Buy block
    // ==========================================
    console.log("[E2E] Step 4: Entering property and adding Buy block...");

    await page.goto(`/build/${createdPropertyId}`);

    // Wait for loading to complete and page to be ready
    await expect(page.locator("text=Loading property...")).not.toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('[data-testid="add-block-button"]')).toBeVisible({
      timeout: 10000,
    });

    await page.click('[data-testid="add-block-button"]');
    await expect(page.locator('[data-testid="add-buy-block"]')).toBeVisible();
    await page.click('[data-testid="add-buy-block"]');

    await expect(page.locator("text=Buy Block")).toBeVisible();

    // Fill in Buy block details
    const buyBlockSection = page.locator('[data-testid="buy-block"]');
    await expect(buyBlockSection).toBeVisible();

    const purchasePriceInput = buyBlockSection.locator(
      '[data-testid="buy-cost"]',
    );
    await purchasePriceInput.fill("500000");
    const downPaymentInput = buyBlockSection.locator(
      '[data-testid="buy-downpayment"]',
    );
    await downPaymentInput.fill("20");

    console.log("[E2E] ✓ Buy block added and configured");

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

    // Find the specific property card by name
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
    console.log("[E2E] ✓✓✓ Full user journey completed successfully!");
  });
});
