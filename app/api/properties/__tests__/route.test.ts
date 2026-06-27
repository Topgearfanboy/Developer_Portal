/**
 * @jest-environment node
 */

import { GET, POST } from "../route";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

jest.mock("@/lib/auth", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  prisma: {
    property: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;
const mockedPrisma = prisma as unknown as {
  property: {
    findMany: jest.MockedFunction<typeof prisma.property.findMany>;
    create: jest.MockedFunction<typeof prisma.property.create>;
  };
};

type MockProperty = Awaited<
  ReturnType<typeof prisma.property.findMany>
>[number];
type MockCreatedProperty = Awaited<ReturnType<typeof prisma.property.create>>;

function createMockRequest(body: object): Request {
  return new Request("http://localhost/api/properties", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/properties", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NINJA_API_KEY;
    global.fetch = jest.fn() as jest.Mock;
  });

  afterEach(() => {
    delete process.env.NINJA_API_KEY;
  });

  describe("GET", () => {
    it("returns 401 when the user is not authenticated", async () => {
      mockedGetCurrentUser.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(mockedPrisma.property.findMany).not.toHaveBeenCalled();
    });

    it("returns the current user's properties", async () => {
      mockedGetCurrentUser.mockResolvedValue({
        userId: "user-1",
        email: "test@example.com",
      });

      const now = new Date();
      mockedPrisma.property.findMany.mockResolvedValue([
        {
          id: "property-1",
          name: "Test Property",
          zipCode: "12345",
          county: "Test County",
          propertyTaxRate: 0.0123,
          isActive: true,
          blocks: [],
          projectSettings: { years: 30 },
          createdAt: now,
          updatedAt: now,
        } as unknown as MockProperty,
      ]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.properties).toHaveLength(1);
      expect(data.properties[0]).toMatchObject({
        id: "property-1",
        name: "Test Property",
        zipCode: "12345",
        county: "Test County",
        propertyTaxRate: 0.0123,
        isActive: true,
        blocks: [],
        projectSettings: {
          years: 30,
          cashStrategy: "profit",
          idealCashHoldingBalance: 10000,
          estimatedHomeAppreciationRate: 3,
          purchaseDate: expect.any(String),
        },
      });
      expect(mockedPrisma.property.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1", isActive: true },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("POST", () => {
    it("returns 401 when the user is not authenticated", async () => {
      mockedGetCurrentUser.mockResolvedValue(null);

      const request = createMockRequest({
        name: "Test Property",
        zipCode: "12345",
        county: "Test County",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(mockedPrisma.property.create).not.toHaveBeenCalled();
    });

    it("returns 400 when the property name is missing", async () => {
      mockedGetCurrentUser.mockResolvedValue({
        userId: "user-1",
        email: "test@example.com",
      });

      const request = createMockRequest({
        zipCode: "12345",
        county: "Test County",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/name|required|invalid input/i);
      expect(mockedPrisma.property.create).not.toHaveBeenCalled();
    });

    it("returns 400 for an invalid zip code", async () => {
      mockedGetCurrentUser.mockResolvedValue({
        userId: "user-1",
        email: "test@example.com",
      });

      const request = createMockRequest({
        name: "Test Property",
        zipCode: "not-a-zip",
        county: "Test County",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/Zip code must be 5 digits/);
      expect(mockedPrisma.property.create).not.toHaveBeenCalled();
    });

    it("creates a property without a tax lookup when no API key is set", async () => {
      mockedGetCurrentUser.mockResolvedValue({
        userId: "user-1",
        email: "test@example.com",
      });

      const now = new Date();
      mockedPrisma.property.create.mockResolvedValue({
        id: "property-1",
        name: "Test Property",
        zipCode: "12345",
        county: "Test County",
        propertyTaxRate: null,
        isActive: true,
        blocks: [],
        projectSettings: {},
        userId: "user-1",
        createdAt: now,
        updatedAt: now,
      } as unknown as MockCreatedProperty);

      const request = createMockRequest({
        name: "Test Property",
        zipCode: "12345",
        county: "Test County",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.property).toMatchObject({
        id: "property-1",
        name: "Test Property",
        zipCode: "12345",
        county: "Test County",
        propertyTaxRate: null,
      });
      expect(mockedPrisma.property.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "Test Property",
            zipCode: "12345",
            county: "Test County",
            propertyTaxRate: null,
            userId: "user-1",
          }),
        }),
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("looks up the property tax rate when an API key is available", async () => {
      process.env.NINJA_API_KEY = "test-api-key";
      mockedGetCurrentUser.mockResolvedValue({
        userId: "user-1",
        email: "test@example.com",
      });

      (global.fetch as jest.Mock).mockResolvedValue(
        new Response(
          JSON.stringify([{ property_tax_50th_percentile: 0.0123 }]),
          { status: 200 },
        ),
      );

      const now = new Date();
      mockedPrisma.property.create.mockResolvedValue({
        id: "property-1",
        name: "Test Property",
        zipCode: "12345",
        county: "Test County",
        propertyTaxRate: 0.0123,
        isActive: true,
        blocks: [],
        projectSettings: {},
        userId: "user-1",
        createdAt: now,
        updatedAt: now,
      } as unknown as MockCreatedProperty);

      const request = createMockRequest({
        name: "Test Property",
        zipCode: "12345",
        county: "Test County",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.property.propertyTaxRate).toBe(0.0123);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("propertytax?county="),
        expect.objectContaining({
          headers: { "X-Api-Key": "test-api-key" },
        }),
      );
    });

    it("lowercases the zip code and title-cases the county", async () => {
      mockedGetCurrentUser.mockResolvedValue({
        userId: "user-1",
        email: "test@example.com",
      });

      const now = new Date();
      mockedPrisma.property.create.mockResolvedValue({
        id: "property-1",
        name: "Test Property",
        zipCode: "12345",
        county: "Test County",
        propertyTaxRate: null,
        isActive: true,
        blocks: [],
        projectSettings: {},
        userId: "user-1",
        createdAt: now,
        updatedAt: now,
      } as unknown as MockCreatedProperty);

      const request = createMockRequest({
        name: "Test Property",
        zipCode: "12345",
        county: "test county",
      });
      await POST(request);

      expect(mockedPrisma.property.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            zipCode: "12345",
            county: "Test County",
          }),
        }),
      );
    });

    it("returns 500 when the database create fails", async () => {
      mockedGetCurrentUser.mockResolvedValue({
        userId: "user-1",
        email: "test@example.com",
      });
      mockedPrisma.property.create.mockRejectedValue(new Error("DB error"));

      const request = createMockRequest({
        name: "Test Property",
        zipCode: "12345",
        county: "Test County",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to create property");
    });
  });
});
