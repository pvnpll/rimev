import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { AuthForm } from "@/features/auth/components/auth-form";

describe("PWA Configuration & iOS Support", () => {
  const rootDir = path.resolve(__dirname, "../..");
  const manifestPath = path.join(rootDir, "public/manifest.json");
  const webManifestPath = path.join(rootDir, "public/manifest.webmanifest");

  it("manifest.json and manifest.webmanifest exist, are non-empty, and parse as valid JSON", () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    expect(fs.existsSync(webManifestPath)).toBe(true);

    for (const file of [manifestPath, webManifestPath]) {
      const content = fs.readFileSync(file, "utf-8");
      expect(content.trim().length).toBeGreaterThan(0);

      const parsed = JSON.parse(content);
      expect(parsed.name).toBe("Rimev");
      expect(parsed.short_name).toBe("Rimev");
      expect(parsed.start_url).toBe("/");
      expect(parsed.scope).toBe("/");
      expect(parsed.display).toBe("standalone");
      expect(parsed.background_color).toBe("#09090b");
      expect(parsed.theme_color).toBe("#09090b");
    }
  });

  it("manifest references icons that all exist on disk", () => {
    const content = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(content);

    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");

    const purposes = manifest.icons.map((icon: { purpose: string }) => icon.purpose);
    expect(purposes).toContain("any");
    expect(purposes).toContain("maskable");

    for (const icon of manifest.icons) {
      const cleanPath = icon.src.replace(/^\//, "").split("?")[0];
      const iconPath = path.join(rootDir, "public", cleanPath);
      expect(fs.existsSync(iconPath)).toBe(true);
      const stat = fs.statSync(iconPath);
      expect(stat.size).toBeGreaterThan(0);
    }
  });

  it("apple-touch-icon exists in public for iOS Safari home-screen crawlers", () => {
    const appleTouchIconPath = path.join(rootDir, "public/apple-touch-icon.png");
    expect(fs.existsSync(appleTouchIconPath)).toBe(true);
    expect(fs.statSync(appleTouchIconPath).size).toBeGreaterThan(0);

    const precomposedPath = path.join(rootDir, "public/apple-touch-icon-precomposed.png");
    expect(fs.existsSync(precomposedPath)).toBe(true);
    expect(fs.statSync(precomposedPath).size).toBeGreaterThan(0);
  });

  it("middleware.ts excludes manifest and sw.js from auth redirects", () => {
    const middlewarePath = path.join(rootDir, "src/middleware.ts");
    const middlewareContent = fs.readFileSync(middlewarePath, "utf-8");

    expect(middlewareContent).toContain("manifest");
    expect(middlewareContent).toContain("sw");
  });

  it("layout.tsx sets Apple web app metadata, viewport scaling locks, and manifest link", () => {
    const layoutPath = path.join(rootDir, "src/app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    expect(layoutContent).toMatch(/manifest:\s*['"]\/manifest\.webmanifest['"]/);
    expect(layoutContent).toMatch(/capable:\s*true/);
    expect(layoutContent).toMatch(/title:\s*['"]Rimev['"]/);
    expect(layoutContent).toMatch(/viewportFit:\s*['"]cover['"]/);
    expect(layoutContent).toMatch(/maximumScale:\s*1/);
    expect(layoutContent).toMatch(/userScalable:\s*false/);
    expect(layoutContent).toMatch(/PWAManager/);
  });

  it("pwa-manager.tsx registers service worker cleanly without disrupting Safari crawlers", () => {
    const pwaManagerPath = path.join(rootDir, "src/components/providers/pwa-manager.tsx");
    const pwaManagerContent = fs.readFileSync(pwaManagerPath, "utf-8");

    expect(pwaManagerContent).toContain('navigator.serviceWorker');
    expect(pwaManagerContent).toContain('navigator.serviceWorker.register("/sw.js"');
    expect(pwaManagerContent).toContain('updateViaCache: "none"');
    expect(pwaManagerContent).toContain('registration?.update()');
    expect(pwaManagerContent).toContain('visibilitychange');
    expect(pwaManagerContent).not.toContain("window.location.reload()");
  });
});

describe("iOS PWA Password Suggestion & AutoFill Compliance", () => {
  it("server-renders auth fields instead of hiding them behind a search-param Suspense bailout", () => {
    const rootDir = path.resolve(__dirname, "../..");
    const authForm = fs.readFileSync(path.join(rootDir, "src/features/auth/components/auth-form.tsx"), "utf-8");
    const loginPage = fs.readFileSync(path.join(rootDir, "src/app/login/page.tsx"), "utf-8");
    const signupPage = fs.readFileSync(path.join(rootDir, "src/app/signup/page.tsx"), "utf-8");

    expect(authForm).not.toContain("useSearchParams");
    expect(loginPage).not.toContain("Suspense");
    expect(signupPage).not.toContain("Suspense");
    expect(loginPage).toContain('<AuthForm mode="login" redirectTo=');
    expect(signupPage).toContain('<AuthForm mode="signup" redirectTo=');
  });

  it("signup form renders with iOS WebKit strong password suggestion requirements", () => {
    const html = renderToStaticMarkup(React.createElement(AuthForm, { mode: "signup" }));

    // Form element has explicit method="post", action="/signup", and autoComplete="on"
    expect(html).toContain('method="post"');
    expect(html).toContain('action="/signup"');
    expect(html).toContain('autoComplete="on"');

    // Email field has id="email", name="email", type="email", and autocomplete="username"
    expect(html).toContain('for="email"');
    expect(html).toContain('id="email"');
    expect(html).toContain('name="email"');
    expect(html).toContain('type="email"');
    expect(html).toContain('autoComplete="username"');
    expect(html).toContain('autoCapitalize="none"');
    expect(html).toContain('autoCorrect="off"');
    expect(html).toContain('spellCheck="false"');

    // New password field has id="password", name="password", type="password", and autocomplete="new-password"
    expect(html).toContain('for="password"');
    expect(html).toContain('id="password"');
    expect(html).toContain('name="password"');
    expect(html).toContain('type="password"');
    expect(html).toContain('autoComplete="new-password"');
    expect(html).toContain('minLength="6"');
    expect(html).toContain('passwordrules="minlength: 6; maxlength: 128;"');
    expect(html).toContain('maxLength="128"');

    // Confirm password field has id="confirm-password", name="confirm-password", type="password", and autocomplete="new-password"
    expect(html).toContain('for="confirm-password"');
    expect(html).toContain('id="confirm-password"');
    expect(html).toContain('name="confirm-password"');
    expect(html.match(/passwordrules="minlength: 6; maxlength: 128;"/g)).toHaveLength(2);

    // Inputs remain browser-owned so iOS can inject a generated password without React replacing it.
    expect(html).not.toMatch(/<input[^>]+value=/);

    // Password visibility toggle buttons exist for user accessibility
    expect(html).toContain('aria-label="Show password"');
    expect(html).toContain('aria-label="Show confirm password"');
  });

  it("login form renders with iOS WebKit current password autofill requirements", () => {
    const html = renderToStaticMarkup(React.createElement(AuthForm, { mode: "login" }));

    // Form element has explicit method="post", action="/login", and autoComplete="on"
    expect(html).toContain('method="post"');
    expect(html).toContain('action="/login"');
    expect(html).toContain('autoComplete="on"');

    // Identifier field has id="username", name="username", and autocomplete="username"
    expect(html).toContain('for="username"');
    expect(html).toContain('id="username"');
    expect(html).toContain('name="username"');
    expect(html).toContain('autoComplete="username"');

    // Password field has id="password", name="password", type="password", and autocomplete="current-password"
    expect(html).toContain('for="password"');
    expect(html).toContain('id="password"');
    expect(html).toContain('name="password"');
    expect(html).toContain('type="password"');
    expect(html).toContain('autoComplete="current-password"');

    // Login inputs remain uncontrolled so iCloud Keychain and third-party managers can fill them.
    expect(html).not.toMatch(/<input[^>]+value=/);

    // Password visibility toggle exists
    expect(html).toContain('aria-label="Show password"');
  });
});
