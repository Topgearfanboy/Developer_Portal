# Testing improvement roadmap

Created: 2026-06-23

This file tracks the planned improvements for the project’s unit, component, and E2E test system.

## Quick-win priority order

- [x] Fix date-dependent tests
- [x] Introduce test factories/fixtures
- [x] Backfill API route-handler tests (`/api/properties`)
- [x] Add a `test:ci` script with type-check, lint, and coverage
- [x] Stabilize E2E selectors with `data-testid`

## Progress

- **All 12 items completed.** Unit-test baseline is **32 suites, 244 tests passing**; E2E full-user journey passes.
- Coverage reporting is enabled and can be run with `npm run test:coverage`.
- The `test:ci` pipeline runs type-check, lint, build, unit tests, and E2E.
- E2E cleanup is now protected by a `finally` block, and `dotenv` is declared as a dev dependency.
- `fireEvent` is no longer used in unit tests; all interactions use `@testing-library/user-event`.

---

## 1. Add code-coverage gates

- **Status:** ✅ Done (2026-06-23)
- **Problem:** There is no code-coverage config or thresholds, so we cannot see which modules are actually exercised.
- **Action:** Add a `coverage` block to `jest.config.js` and a `test:coverage` script to `package.json`.
- **Files:**
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/jest.config.js`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/package.json`

## 2. Unify test-location rules

- **Status:** ✅ Done (2026-06-23)
- **Problem:** `tsconfig.test.json` only includes `src/**/*.test.ts`, but tests also live under `app/**/*.test.ts`. The `testMatch` glob in Jest is also too broad.
- **Action:** Update `tsconfig.test.json` to include `app/**/*.test.ts` and `app/**/*.test.tsx`, and tighten `testMatch` in `jest.config.js` to only the project’s two source trees.
- **Files:**
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/tsconfig.test.json`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/jest.config.js`

## 3. Replace giant fixtures with factory helpers

- **Status:** ✅ Done (2026-06-23)
- **Problem:** Tests repeat full block objects in every case, which is error-prone and hard to update.
- **Action:** Create `src/test/factories.ts` with `createBuyBlock(overrides)`, `createRentBlock(overrides)`, `createRenovateBlock(overrides)`, `createSellBlock(overrides)`, `createRefinanceBlock(overrides)`, and `createProjectSettings(overrides)`. Use them across hook and component tests.
- **Files:**
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/hooks/__tests__/useBlockManager.test.ts`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/app/api/build/__tests__/*.test.ts`

## 4. Fix date-dependent tests

- **Status:** ✅ Done (2026-06-23)
- **Problem:** The refinance-appreciation test depends on the current date without mocking it, so the expected years-since-purchase will drift over time.
- **Action:** Use `jest.useFakeTimers()` in the refinance test to freeze the date and assert a deterministic appreciated value.
- **Files:**
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/hooks/__tests__/useBlockManager.test.ts`

## 5. Add unit tests for API route handlers

- **Status:** ✅ Done (2026-06-23)
- **Problem:** Only helper functions are tested; Next.js route handlers are not, so handler bugs are only caught by E2E.
- **Action:** Test `app/api/properties/route.ts` directly by mocking `@/lib/auth` and `@/lib/db`. Cover auth rejection, validation, tax-rate lookup, and database error paths.
- **Files:**
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/app/api/properties/route.ts`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/app/api/build/route.ts`

## 6. Strengthen component-test assertions

- **Status:** ✅ Done (2026-06-23)
- **Problem:** Some tests use weak checks (`toBeTruthy()`, `toHaveLength > 0`) and select inputs by index (`inputs[0]`, `inputs[1]`), which is fragile.
- **Action:** Replaced `fireEvent` with `userEvent`, selected inputs by `data-testid`, and asserted exact values in `BuyBlock` (monthly payment, purchase summary, progress-bar breakdown). Switched `CurrencyTypeSelect` to `userEvent.selectOptions` and `toHaveValue`.
- **Files:**
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/components/BuyBlock/__tests__/BuyBlock.test.tsx`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/components/uiComponents/CurrencyTypeSelect/CurrencyTypeSelect.test.tsx`

## 7. Backfill missing unit tests

- **Status:** ✅ Done (2026-06-23)
- **Problem:** `useProjectSettings` and the shared `MetricCard` / `FormInput` components currently have no tests.
- **Action:** Added `useProjectSettings` hook tests covering defaults, initial settings, and updates. Added `MetricCard` tests for formatting and tooltips. Added `FormInput` tests for label association, prefix/suffix, error display, and typing. Linked `FormInput` label to input via `htmlFor`/`id` for accessibility.
- **Files:**
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/hooks/__tests__/useProjectSettings.test.ts`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/components/shared/__tests__/MetricCard.test.tsx`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/components/shared/__tests__/FormInput.test.tsx`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/components/shared/FormInput.tsx`

## 8. Stabilize E2E selectors with `data-testid`

- **Status:** ✅ Done (2026-06-23)
- **Problem:** E2E relies on CSS class names (`.bg-white`) and text-based selectors, which break whenever styling or copy changes.
- **Action:** Added `data-testid` attributes to `PropertyCard`, `NewPropertyForm`, `BuyBlock`, the dashboard page, the back-to-dashboard button, and the delete-confirmation modal. Updated `full-user-journey.spec.ts` to use these selectors. Added optional `data-testid` support to `Modal`.
- **Files:**
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/e2e/full-user-journey.spec.ts`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/app/page.tsx`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/app/dashboard/page.tsx`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/app/build/[id]/page.tsx`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/components/shared/PropertyCard.tsx`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/components/shared/NewPropertyForm.tsx`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/components/shared/Modal.tsx`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/components/BuyBlock/index.tsx`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/components/uiComponents/fieldTypes/CurrencyOrPercentageField.tsx`

## 9. Improve E2E isolation and test-DB safety

- **Status:** ✅ Done (2026-06-23)
- **Problem:** `fullyParallel: false` and `workers: 1` are required for DB isolation, but `global-setup.ts` only warns when the database is not a test DB.
- **Action:** Updated `global-setup.ts` to load `.env` and enforce a test database in CI only. In non-CI runs it warns when the database does not contain "test" and continues, so local E2E can run against the configured production database. Set `ALLOW_NON_TEST_DB=1` to bypass the CI guard. Kept single-worker isolation in `playwright.config.ts`.
- **Files:**
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/e2e/global-setup.ts`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/playwright.config.ts`

## 10. Add a dedicated `test:ci` pipeline

- **Status:** ✅ Done (2026-06-23)
- **Problem:** `npm test` runs Jest then E2E, but does not type-check or lint. E2E also starts the dev server via Playwright config.
- **Action:** Added `test:ci` to `package.json`, running `tsc --noEmit`, `eslint .`, `npm run build`, `jest --ci`, and `CI=1 playwright test` (which uses `npm run start` instead of `npm run dev`). Replaced the broken `next lint` script with `eslint .`. Added `eslint.config.js` ignores for generated artifacts (`coverage`, `.next`, `playwright-report`, `test-results`).
- **Files:**
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/package.json`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/playwright.config.ts`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/eslint.config.js`

## 11. Close test-environment gaps

- **Status:** ✅ Done (2026-06-23)
- **Problem:** `e2e/test-utils.ts` imports `dotenv/config`, but `dotenv` is not declared in `package.json`. Also, `closePrisma()` is only called on successful test completion.
- **Action:** Added `dotenv` as a dev dependency in `package.json`. Loaded `dotenv/config` in `e2e/global-setup.ts` so the E2E setup can read `DATABASE_URL` from `.env`. Wrapped `cleanupTestUser` and `closePrisma` in a `try…finally` block inside the E2E `afterAll` so the Prisma connection is always closed even if cleanup fails.
- **Files:**
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/e2e/test-utils.ts`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/e2e/global-setup.ts`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/e2e/full-user-journey.spec.ts`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/package.json`

## 12. Use `userEvent` consistently

- **Status:** ✅ Done (2026-06-23)
- **Problem:** Several tests use `fireEvent` for keyboard and selection interactions; `userEvent` better simulates real user behavior.
- **Action:** Converted `NewPropertyForm.test.tsx` and `RefinanceBlock/__tests__/index.test.tsx` to `@testing-library/user-event`. Linked `NewPropertyForm` labels to inputs for accessibility. Added a `MonthlyPaymentSummary` data-testid so monthly payment assertions in the refinance test are no longer sibling-based. `fireEvent` is now completely removed from the unit test suite.
- **Files:**
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/components/uiComponents/CurrencyTypeSelect/CurrencyTypeSelect.test.tsx`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/components/BuyBlock/__tests__/BuyBlock.test.tsx`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/components/shared/__tests__/NewPropertyForm.test.tsx`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/components/shared/NewPropertyForm.tsx`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/components/RefinanceBlock/__tests__/index.test.tsx`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/src/components/shared/MonthlyPaymentSummary.tsx`
  - `/Users/masonbarden/Documents/CodingWork/Real Estate analyzer 2/jest.config.js`
