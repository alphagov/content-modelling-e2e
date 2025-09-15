import { expect } from "@playwright/test";
import { waitForUrlToBeAvailable } from "./utils";

export async function goToContentBlockPage(page, contentBlockPath, blockTitle) {
  await page.goto(contentBlockPath);
  await page.getByRole("textbox", { name: "Keyword" }).fill(blockTitle);
  await page.getByRole("button", { name: "View results" }).click();
  await page.getByRole("link", { name: blockTitle }).click();
}

export async function copyCodeForContentBlock(
  page,
  contentBlockPath,
  blockTitle,
) {
  await goToContentBlockPage(page, contentBlockPath, blockTitle);
  await page.getByText("Copy code").click();
}

export async function signUpForEmails(page) {
  await page.goto(
    `https://${process.env.PUBLISHING_DOMAIN}/business-and-industry`,
  );

  await page.getByRole("link", { name: "Get emails for this topic" }).click();
  await page.getByRole("radio", { name: "Business and industry (all" }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("radio", { name: "Each time we add" }).check();
  await page.getByRole("button", { name: "Continue" }).click();

  await page
    .getByRole("textbox", { name: "Enter your email address" })
    .fill(process.env.EMAIL_ALERT_EMAIL);
  await page.getByRole("button", { name: "Continue" }).click();

  await page
    .getByRole("button", { name: "Sign in to your GOV.UK One" })
    .click();
  await page.getByRole("button", { name: "Sign in" }).click();

  await page
    .getByRole("textbox", { name: "Enter your email address to" })
    .fill(process.env.EMAIL_ALERT_EMAIL);
  await page.getByRole("button", { name: "Continue" }).click();

  await page
    .getByRole("textbox", { name: "Enter your password" })
    .fill(process.env.EMAIL_ALERT_PASSWORD);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForLoadState();

  // Optionally click on the Confirm button if it's showing. If the user is already signed up
  // we won't see it
  const button = await page.getByRole("button", { name: "Confirm" });
  if (await button.isVisible()) {
    await button.click();
  }
}

export async function createPensionBlock(page, contentBlockPath, rate, title) {
  await page.goto(contentBlockPath);
  await page.getByRole("button", { name: "Create content block" }).click();
  await page.getByLabel("Pension").click();
  await page.getByRole("button", { name: "Save and continue" }).click();

  await page.getByLabel("Title").fill(title);

  const comboBox = await page.getByRole("combobox", {
    name: "Lead organisation",
  });
  await comboBox.click();
  await comboBox.getByRole("option").nth(2).click();

  await page.getByRole("button", { name: "Save and continue" }).click();

  await page.getByRole("button", { name: "Add a rate" }).click();
  await page.getByLabel("Title").fill("Some rate");
  await page.getByLabel("Amount").fill(rate);
  await page.getByLabel("Frequency").selectOption("a day");
  await page.getByLabel("Description").fill("Some description");
  await page.getByRole("button", { name: "Save and continue" }).click();

  await page.getByRole("button", { name: "Save and continue" }).click();

  await page.getByLabel("confirm").check();
  await page.getByRole("button", { name: "Publish" }).click();

  await expect(
    page.getByRole("heading", { name: "Pension created" }),
  ).toBeVisible();
}

export async function embedInWhitehallDoc(
  page,
  context,
  contentBlockPath,
  whitehallPath,
  title,
  timestamp,
  rate,
) {
  const documentTitle = `TEST DOCUMENT: ${timestamp}`;

  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await copyCodeForContentBlock(page, contentBlockPath, title);

  await page.goto(whitehallPath);
  await page.getByRole("link", { name: "New document" }).click();
  await page.getByLabel("News article").check();
  await page.getByRole("button", { name: "Next" }).click();

  await page.locator(".choices__item").first().click();
  await page.getByRole("option", { name: "News story", exact: true }).click();

  await page.getByLabel("Title (required)").fill(documentTitle);
  await page.getByLabel("Summary (required)").fill("Some summary");
  await page.getByLabel("Body (required)").click();
  await page.getByLabel("Body (required)").press("ControlOrMeta+v");

  await page.getByRole("button", { name: "Save and go to document" }).click();
  await page.getByRole("link", { name: "Add tags" }).click();
  await page
    .getByRole("listitem")
    .filter({ hasText: "Business and industry" })
    .locator("div")
    .click();
  await page.getByRole("button", { name: "Save" }).click();

  await page.getByRole("button", { name: "Force publish" }).click();
  await page.getByLabel("Reason for force publishing").fill("Some reason");
  await page.getByRole("button", { name: "Force publish" }).click();

  await page.getByRole("link", { name: documentTitle }).click();
  const url = await waitForUrlToBeAvailable(
    page,
    await page
      .getByRole("link", { name: "View on website" })
      .getAttribute("href"),
  );

  await page.goto(url);
  await expect(page.getByText(rate)).toBeVisible();

  return { url, title: documentTitle };
}

export async function embedInMainstreamDoc(
  page,
  context,
  contentBlockPath,
  mainstreamPath,
  title,
  timestamp,
  rate,
) {
  const documentTitle = `TEST DOCUMENT - ${timestamp}`;
  const documentSlug = `test-document-${timestamp}`;

  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await copyCodeForContentBlock(page, contentBlockPath, title);

  await page.goto(mainstreamPath);
  await page.getByRole("link", { name: "Add artefact" }).click();

  await page.getByLabel("Title").fill(documentTitle);
  await page.getByLabel("Slug").fill(documentSlug);
  await page.getByLabel("Format").selectOption("answer");
  await page.getByRole("button", { name: "Save and go to item" }).click();

  await page.getByLabel("Body").click();
  await page.getByLabel("Body").press("ControlOrMeta+v");

  await page.getByRole("button", { name: "Save" }).click();
  await page.getByRole("link", { name: "2nd pair of eyes" }).click();
  await page
    .locator("input")
    .filter({ hasText: "Send to 2nd pair of eyes" })
    .click();
  await page.getByRole("link", { name: "Skip review" }).click();
  await page.locator("input").filter({ hasText: "Skip review" }).click();
  await page.getByRole("link", { name: "Publish", exact: true }).click();
  await page.locator("input").filter({ hasText: "Send to publish" }).click();

  const url = await waitForUrlToBeAvailable(
    page,
    await page
      .getByRole("link", { name: "View this on the GOV.UK" })
      .getAttribute("href"),
  );

  await page.goto(url);
  await expect(page.getByText(rate)).toBeVisible();

  return { url, title: documentTitle };
}

export async function verifyListedInLocations(
  page,
  contentBlockPath,
  blockTitle,
  whitehallTitle,
  mainstreamTitle,
) {
  await goToContentBlockPage(page, contentBlockPath, blockTitle);
  await expect(page.locator("#host_editions")).toContainText(whitehallTitle);
  await expect(page.locator("#host_editions")).toContainText(mainstreamTitle);
}

export async function updateRateAmount(page, contentBlockPath, title, newRate) {
  await goToContentBlockPage(page, contentBlockPath, title);
  await page.getByRole("button", { name: "Edit pension" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();

  await page
    .locator('[data-test-id="embedded_some-rate"]')
    .getByRole("link", { name: "Edit" })
    .click();
  await page.getByLabel("Amount").fill(newRate);
  await page.getByRole("button", { name: "Save and continue" }).click();

  await page.getByRole("button", { name: "Save and continue" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();

  await page.getByLabel("No").check();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await page.getByLabel("Publish the edit now").check();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await page.getByLabel("I confirm that the details").check();
  await page.getByRole("button", { name: "Publish" }).click();
}

export async function verifyUpdateVisible(page, url, updatedRate) {
  await expect(async () => {
    await page.goto(`${url}?cacheBust=${Date.now()}`);
    await expect(page.getByText(updatedRate)).toBeVisible();
  }).toPass();
}
