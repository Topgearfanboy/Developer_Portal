import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "../page";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: "1",
    email: "user@example.com",
    name: "Test User",
    createdAt: "2024-01-01T00:00:00.000Z",
  };

  const createFetchMock = (
    responses: Record<string, { ok: boolean; status?: number; body: unknown }>,
  ) =>
    jest.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      const key = `${init?.method ?? "GET"} ${url}`;
      const response = responses[key] ?? {
        ok: false,
        status: 404,
        body: { error: "Not found" },
      };
      return {
        ok: response.ok,
        status: response.status,
        json: async () => response.body,
      };
    });

  it("displays user profile information", async () => {
    global.fetch = createFetchMock({
      "GET /api/auth/me": { ok: true, body: { user: mockUser } },
    });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("user@example.com")).toBeInTheDocument();
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });
  });

  it("redirects to login when not authenticated", async () => {
    global.fetch = createFetchMock({
      "GET /api/auth/me": { ok: false, status: 401, body: {} },
    });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("opens delete account modal and deactivates account", async () => {
    const user = userEvent.setup();
    global.fetch = createFetchMock({
      "GET /api/auth/me": { ok: true, body: { user: mockUser } },
      "POST /api/auth/deactivate": {
        ok: true,
        body: { message: "Account deactivated successfully" },
      },
    });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("user@example.com")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("delete-account-button"));

    expect(screen.getByTestId("delete-account-modal")).toBeInTheDocument();

    await user.click(screen.getByTestId("confirm-delete-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/deactivate", {
        method: "POST",
      });
      expect(mockPush).toHaveBeenCalledWith("/login");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows error when deactivation fails", async () => {
    const user = userEvent.setup();
    global.fetch = createFetchMock({
      "GET /api/auth/me": { ok: true, body: { user: mockUser } },
      "POST /api/auth/deactivate": {
        ok: false,
        status: 500,
        body: { error: "Internal server error" },
      },
    });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("user@example.com")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("delete-account-button"));
    await user.click(screen.getByTestId("confirm-delete-button"));

    await waitFor(() => {
      expect(screen.getByText("Internal server error")).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});
