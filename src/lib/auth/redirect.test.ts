import { describe, expect, it } from "vitest";

import { getSafeRedirectPath } from "./redirect";

describe("getSafeRedirectPath", () => {
  it("keeps relative paths inside the app", () => {
    expect(getSafeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(getSafeRedirectPath("/calendar?view=week")).toBe(
      "/calendar?view=week",
    );
  });

  it("falls back when the path is missing or external", () => {
    expect(getSafeRedirectPath(null)).toBe("/dashboard");
    expect(getSafeRedirectPath("https://evil.example")).toBe("/dashboard");
    expect(getSafeRedirectPath("//evil.example/path")).toBe("/dashboard");
    expect(getSafeRedirectPath("javascript:alert(1)")).toBe("/dashboard");
  });

  it("supports a custom safe fallback", () => {
    expect(getSafeRedirectPath("not-a-path", "/login")).toBe("/login");
  });
});
