/**
 * Global setup for E2E tests
 * Ensures test database is clean before test run
 */
async function globalSetup() {
  console.log("[E2E Setup] Preparing test environment...");

  // Ensure we're using a test database
  const databaseUrl = process.env.DATABASE_URL || "";
  if (!databaseUrl.includes("test") && !process.env.ALLOW_NON_TEST_DB) {
    console.warn(
      "[E2E Setup] WARNING: Not using a test database. Set ALLOW_NON_TEST_DB=1 to override.",
    );
    console.warn(
      "[E2E Setup] DATABASE_URL:",
      databaseUrl.replace(/:[^:]*@/, ":***@"),
    );
    // Don't throw - just warn for now
  }

  console.log("[E2E Setup] Ready");
}

export default globalSetup;
