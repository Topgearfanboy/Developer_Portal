import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "../Navbar";

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockLogout = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from "@/hooks/useAuth";

const mockedUseAuth = useAuth as jest.Mock;

describe("Navbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows login link when not authenticated", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  });

  it("shows hamburger menu with settings and logout when authenticated", async () => {
    const user = userEvent.setup();
    mockedUseAuth.mockReturnValue({
      user: { id: "1", email: "user@example.com", name: "Test User", isActive: true },
      isLoading: false,
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<Navbar />);

    const menuButton = screen.getByTestId("user-menu-button");
    expect(menuButton).toBeInTheDocument();

    await user.click(menuButton);

    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    expect(screen.getByTestId("settings-link")).toBeInTheDocument();
    expect(screen.getByTestId("logout-button")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("calls logout and redirects when logout is clicked", async () => {
    const user = userEvent.setup();
    mockLogout.mockResolvedValue(undefined);
    mockedUseAuth.mockReturnValue({
      user: { id: "1", email: "user@example.com", name: null, isActive: true },
      isLoading: false,
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<Navbar />);

    await user.click(screen.getByTestId("user-menu-button"));
    await user.click(screen.getByTestId("logout-button"));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("navigates to settings when settings link is clicked", async () => {
    const user = userEvent.setup();
    mockedUseAuth.mockReturnValue({
      user: { id: "1", email: "user@example.com", name: null, isActive: true },
      isLoading: false,
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<Navbar />);

    await user.click(screen.getByTestId("user-menu-button"));
    const settingsLink = screen.getByTestId("settings-link");
    expect(settingsLink).toHaveAttribute("href", "/settings");
  });
});
