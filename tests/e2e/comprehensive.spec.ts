import { test, expect } from "@playwright/test";

test.describe("Legacy Vault Protocol — Comprehensive E2E Journeys", () => {
  
  test("1. Homepage and Navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Legacy Vault Protocol").first()).toBeVisible();
    await expect(page.getByText("Protect My Family").first()).toBeVisible();
    
    // Check key legal disclaimers
    await expect(page.getByText(/legal advice/i).first()).toBeVisible();
  });

  test("2. Conversational Onboarding Journey", async ({ page }) => {
    await page.goto("/onboard");
    
    // Check that startup elements load
    await expect(page.getByText("What would you like to protect?")).toBeVisible();
    await expect(page.getByRole("button", { name: "Protect my Will" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Secure my property deeds" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Secure my crypto wallets" })).toBeVisible();
    
    // Click on one of the quick prompts and wait for chat response
    await page.getByRole("button", { name: "Protect my Will" }).click();
    await page.waitForTimeout(1000);
    
    // Verify a message got added
    await expect(page.getByText("I want to set up my digital will and document my inheritance rules.")).toBeVisible();
  });

  test("3. Sovereign Namespaces & Reward Claims Panel", async ({ page }) => {
    await page.goto("/namespaces");
    await expect(page.getByText("Earn TROP Rewards for Active Namespaces")).toBeVisible();
    await expect(page.getByText("Reward claims console")).toBeVisible();
    
    // Interactive certificate modal check
    await page.getByRole("heading", { name: ".legacy", exact: true }).click({ force: true });
    await expect(page.getByText(".legacy Root Authority SFT").first()).toBeVisible();
    await expect(page.getByText("IPFS Metadata CID").first()).toBeVisible();
    await page.locator("button:has(svg.lucide-x)").click();
    
    // Try typing address and claiming rewards
    const walletInput = page.locator("#recipientWallet");
    await walletInput.fill("7xKXtg2CW87d97TXJSDpbD5jBkheT1234567890abcdef");
    
    const claimBtn = page.getByRole("button", { name: "Claim TROP →" });
    await expect(claimBtn).toBeEnabled();
    await claimBtn.click();
    
    // Monitor simulated terminal output
    await page.waitForTimeout(3000);
    await expect(page.getByText("Claim Successful!")).toBeVisible();
    await expect(page.getByText("Transaction Signature:")).toBeVisible();
  });

  test("4. Legacy Blockchain Explorer (Hyperledger Besu / Stellar / XRPL)", async ({ page }) => {
    await page.goto("/explorer");
    await expect(page.getByText("Legacy Explorer System")).toBeVisible();
    await expect(page.getByText("Hyperledger Besu (EVM Registry Node)")).toBeVisible();
    await expect(page.getByText("rpc.unykorn.org")).toBeVisible();
    await expect(page.getByText("Chain ID: 7777")).toBeVisible();
    await expect(page.getByText("Validator Peer Group")).toBeVisible();
    await expect(page.getByText("System Node Console Log")).toBeVisible();
    
    // Verify anchor transaction cards
    await expect(page.getByText(".legacy").first()).toBeVisible();
    await expect(page.getByText(".troptions").first()).toBeVisible();
  });

  test("5. Vault Dashboard and Resource Creation", async ({ page }) => {
    await page.goto("/vault");
    await expect(page.getByText("Chain Registry")).toBeVisible();
  });

  test("6. Sovereign Back-Office, SMTP, and Local AI Kernel", async ({ page }) => {
    await page.goto("/back-office");
    await expect(page.getByText("Sovereign Executive Portal")).toBeVisible();
    
    // Switch to SMTP Router Tab
    await page.getByRole("button", { name: "Zoho SMTP Router" }).click();
    await expect(page.getByRole("button", { name: "Send secure alert through Zoho SMTP" })).toBeVisible();
    
    // Switch to Private AI Kernel Tab
    await page.getByRole("button", { name: "Private AI Kernel" }).click();
    await expect(page.getByText("Private AI Query Interface")).toBeVisible();
    
    const aiInput = page.locator("input[placeholder*='Ask local AI']");
    await aiInput.fill("What is the Georgia probate law RUFADAA waiting period?");
    await aiInput.press("Enter");
    
    // Verify vector document matching response
    await page.waitForTimeout(2000);
    await expect(page.locator(".prose")).toContainText(/RUFADAA/i);
  });
});
