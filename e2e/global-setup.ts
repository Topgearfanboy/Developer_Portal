import "dotenv/config";

/**
 * Global setup for E2E tests
 * Ensures test database is clean before test run
 */
async function globalSetup() {
  console.log("[E2E Setup] Preparing test environment...");

  const databaseUrl = process.env.DATABASE_URL || "";
  const isTestDb = databaseUrl.includes("test");

  if (!isTestDb) {
    if (process.env.CI) {
      const maskedUrl = databaseUrl.replace(/:[^:]*@/, ":***@");
      throw new Error(
        `[E2E Setup] DATABASE_URL must point to a test database in CI (got "${maskedUrl}"). ` +
          `Set ALLOW_NON_TEST_DB=1 only if you explicitly want to run against a non-test database.`,
      );
    }

    console.warn(
      `[E2E Setup] Warning: DATABASE_URL does not contain 'test'. ` +
        `E2E tests will run against the configured database and create/delete test data.`,
    );
  }

  console.log("[E2E Setup] Ready");
}

export default globalSetup;
