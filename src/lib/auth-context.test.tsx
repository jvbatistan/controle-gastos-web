import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "@/lib/auth-context";
import { useAuth } from "@/lib/useAuth";
import { me } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  me: vi.fn(),
}));

const meMock = vi.mocked(me);

function Consumer({ label }: { label: string }) {
  const auth = useAuth();
  return <p>{`${label}:${auth.status}`}</p>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    meMock.mockReset();
  });

  it("resolves the current user once for multiple consumers", async () => {
    meMock.mockResolvedValue({ id: 1, name: "Maria", email: "maria@example.com", active: true });

    render(
      <AuthProvider>
        <Consumer label="page" />
        <Consumer label="header" />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("page:authenticated")).toBeInTheDocument();
      expect(screen.getByText("header:authenticated")).toBeInTheDocument();
    });

    expect(meMock).toHaveBeenCalledTimes(1);
  });
});
