import "dotenv/config";
import { prisma } from "../src/lib/db";

/**
 * Clean up all test data for a specific user email
 */
export async function cleanupTestUser(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { properties: true },
  });

  if (user) {
    // Delete all properties first (cascade should handle this, but being explicit)
    await prisma.property.deleteMany({
      where: { userId: user.id },
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log(`[Test Cleanup] Deleted test user: ${email}`);
  }
}

/**
 * Verify a user is marked inactive in the database
 */
export async function verifyUserInactive(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { isActive: true },
  });
  return user?.isActive === false;
}

/**
 * Generate unique test user credentials
 */
export function generateTestUser() {
  const timestamp = Date.now();
  return {
    email: `e2e-test-${timestamp}@example.com`,
    password: "TestPassword123!",
    name: `E2E Test User ${timestamp}`,
  };
}

/**
 * Close prisma connection
 */
export async function closePrisma(): Promise<void> {
  await prisma.$disconnect();
}

export { prisma };
