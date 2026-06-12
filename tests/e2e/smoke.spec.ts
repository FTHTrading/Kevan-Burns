import { test, expect } from "@playwright/test";

test.describe("Legacy Vault Protocol — smoke tests", () => {
  test("home page loads and shows hero text", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Legacy Vault Protocol").first()).toBeVisible();
    await expect(page.getByText("Protect My Family").first()).toBeVisible();
  });

  test("home page has legal disclaimer", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/legal advice/i).first()).toBeVisible();
  });

  test("vault overview page loads", async ({ page }) => {
    await page.goto("/vault");
    await expect(page.locator("body")).toBeVisible();
  });

  test("vault create page renders form", async ({ page }) => {
    await page.goto("/vault/create");
    await expect(page.getByLabel("Vault Name *")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Vault" })).toBeVisible();
  });

  test("wallets page renders", async ({ page }) => {
    await page.goto("/vault/wallets");
    await expect(page.getByText("Wallet Registry")).toBeVisible();
  });

  test("documents page renders", async ({ page }) => {
    await page.goto("/vault/documents");
    await expect(page.getByText("Document Vault")).toBeVisible();
  });

  test("executor portal home page renders", async ({ page }) => {
    await page.goto("/executor");
    await expect(page.getByRole("heading", { name: "Executor Portal" })).toBeVisible();
    await expect(page.getByText("Submit Estate Claim").first()).toBeVisible();
  });

  test("executor claim page renders form", async ({ page }) => {
    await page.goto("/executor/claim");
    await expect(page.getByText("Submit Estate Claim")).toBeVisible();
  });

  test("beneficiary portal renders", async ({ page }) => {
    await page.goto("/beneficiary");
    await expect(page.getByRole("heading", { name: "Beneficiary Portal" })).toBeVisible();
  });

  test("audit dashboard renders", async ({ page }) => {
    await page.goto("/admin/audit");
    await expect(page.getByText("Audit Dashboard")).toBeVisible();
    await expect(page.getByText("Immutable audit trail")).toBeVisible();
  });

  test("release policy page renders", async ({ page }) => {
    await page.goto("/vault/release-policy");
    await expect(page.getByRole("heading", { name: "Release Policy" })).toBeVisible();
  });

  test("vault assets page renders", async ({ page }) => {
    await page.goto("/vault/assets");
    await expect(page.getByText("Asset Registry")).toBeVisible();
  });

  test("executors page renders", async ({ page }) => {
    await page.goto("/vault/executors");
    await expect(page.getByRole("heading", { name: "Executors" })).toBeVisible();
  });

  test("beneficiaries page renders", async ({ page }) => {
    await page.goto("/vault/beneficiaries");
    await expect(page.getByRole("heading", { name: "Beneficiaries" })).toBeVisible();
  });
});
