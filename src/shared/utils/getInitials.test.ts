import { describe, expect, it } from "vitest";
import { getInitials } from "./getInitials";

describe("getInitials", () => {
  it("extracts initials correctly", () => {
    expect(getInitials("Sarah Chen")).toBe("SC");
    expect(getInitials("Engineering Frontend Architecture")).toBe("EA");
    expect(getInitials("Alex")).toBe("AL");
    expect(getInitials("")).toBe("?");
  });
});
