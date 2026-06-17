-- Drop legacy columns that no longer exist in the Prisma schema
ALTER TABLE "Property"
  DROP COLUMN IF EXISTS "purchasePrice",
  DROP COLUMN IF EXISTS "currentValue",
  DROP COLUMN IF EXISTS "description",
  DROP COLUMN IF EXISTS "squareFootage",
  DROP COLUMN IF EXISTS "yearBuilt",
  DROP COLUMN IF EXISTS "landValue",
  DROP COLUMN IF EXISTS "landValueType",
  DROP COLUMN IF EXISTS "closingDate",
  DROP COLUMN IF EXISTS "loanType",
  DROP COLUMN IF EXISTS "holdPeriod",
  DROP COLUMN IF EXISTS "exitStrategy",
  DROP COLUMN IF EXISTS "refinanceDate",
  DROP COLUMN IF EXISTS "refinanceInterest",
  DROP COLUMN IF EXISTS "metrics";
