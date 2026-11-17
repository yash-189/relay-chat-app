import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { toast } from "@/lib/toast";
import { useCopyToClipboard } from "./useCopyToClipboard";

vi.mock("@/lib/toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useCopyToClipboard", () => {
  it("copies text and shows success toast", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("Hello clipboard");
    });

    expect(writeTextMock).toHaveBeenCalledWith("Hello clipboard");
    expect(toast.success).toHaveBeenCalledWith("Copied to clipboard");
  });

  it("shows error toast when copy fails", async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error("denied"));
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("Failing text");
    });

    expect(toast.error).toHaveBeenCalledWith("Failed to copy");
  });
});
