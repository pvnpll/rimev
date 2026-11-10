import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("PWA Configuration & iOS Support", () => {
  const rootDir = path.resolve(__dirname, "../..");
  const manifestPath = path.join(rootDir, "public/manifest.json");

  it("manifest.json exists, is non-empty, and parses as valid JSON", () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = fs.readFileSync(manifestPath, "utf-8");
    expect(content.trim().length).toBeGreaterThan(0);

    const parsed = JSON.parse(content);
    expect(parsed.name).toBe("Rimev");
    expect(parsed.short_name).toBe("Rimev");
    expect(parsed.start_url).toBe("/");
    expect(parsed.scope).toBe("/");
    expect(parsed.display).toBe("standalone");
    expect(parsed.background_color).toBe("#09090b");
    expect(parsed.theme_color).toBe("#09090b");
  });

  it("manifest.json references icons that all exist on disk", () => {
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
      const iconPath = path.join(rootDir, "public", icon.src.replace(/^\//, ""));
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

  it("middleware.ts excludes manifest.json and sw.js from auth redirects", () => {
    const middlewarePath = path.join(rootDir, "src/middleware.ts");
    const middlewareContent = fs.readFileSync(middlewarePath, "utf-8");

    expect(middlewareContent).toContain("manifest");
    expect(middlewareContent).toContain("sw");
  });

  it("layout.tsx sets Apple web app metadata, viewportFit cover, and manifest link", () => {
    const layoutPath = path.join(rootDir, "src/app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    expect(layoutContent).toMatch(/manifest:\s*['"]\/manifest\.json['"]/);
    expect(layoutContent).toMatch(/capable:\s*true/);
    expect(layoutContent).toMatch(/title:\s*['"]Rimev['"]/);
    expect(layoutContent).toMatch(/viewportFit:\s*['"]cover['"]/);
    expect(layoutContent).toMatch(/PWAManager/);
  });
});
