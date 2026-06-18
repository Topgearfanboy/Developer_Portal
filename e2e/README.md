# End-to-End (E2E) Testing

This directory contains Playwright E2E tests that test the full application stack including the database, API routes, and UI interactions.

## Test Coverage

### Full User Journey (`full-user-journey.spec.ts`)

A comprehensive test covering the complete user flow:

1. **Register** - Creates a new user account
2. **Login** - Authenticates with the created account
3. **Create Property** - Adds a new property to the dashboard
4. **Enter Property** - Navigates to the property build page
5. **Add Block** - Adds a Buy block with sample data
6. **Return to Dashboard** - Navigates back
7. **Delete Property** - Cleans up by deleting the test property

## Running Tests

### Prerequisites

Ensure your development server is running or the app is deployed:

```bash
# Option 1: Use local dev server (tests will start it automatically)
npm run test:e2e

# Option 2: Test against a deployed instance
TEST_BASE_URL=https://your-app.vercel.app npm run test:e2e
```

### Commands

```bash
# Run all E2E tests headlessly
npm run test:e2e

# Run tests with UI for debugging
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/full-user-journey.spec.ts

# Run with trace viewer
npx playwright test --trace on
```

## Database Safety

⚠️ **Important**: These tests create and delete real data in the database.

- Tests generate unique test users to avoid conflicts
- Test cleanup removes all created data after tests complete
- Tests run sequentially (not parallel) to avoid race conditions
- Single worker ensures database isolation

### Test User Pattern

Each test run creates a unique user with the pattern:
```
e2e-test-{timestamp}@example.com
```

This prevents collisions between test runs and makes cleanup reliable.

## Configuration

### `playwright.config.ts`

- **baseURL**: Set via `TEST_BASE_URL` env var or defaults to `http://localhost:3000`
- **workers**: 1 (single worker for database safety)
- **fullyParallel**: false (sequential test execution)

### Environment Variables

```bash
# Test against a specific URL
TEST_BASE_URL=https://your-app.vercel.app

# Allow running against non-test databases (not recommended)
ALLOW_NON_TEST_DB=1
```

## Debugging Failed Tests

1. **View trace**: `npx playwright show-trace test-results/*/trace.zip`
2. **Screenshot on failure**: Automatically captured in `test-results/`
3. **Video recording**: Available for failed tests
4. **UI mode**: `npm run test:e2e:ui` for interactive debugging

## Adding New Tests

When adding new E2E tests:

1. Use `test.describe.serial()` for tests that modify shared state
2. Always clean up created data in `test.afterAll()`
3. Use unique identifiers (timestamps) for test data
4. Prefer data-testid attributes for selectors when possible
