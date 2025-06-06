import { expect } from "@playwright/test";

function publishingAppUrl(appName) {
  return `https://${appName}.${process.env.PUBLISHING_DOMAIN}`;
}

async function logIntoSignon(page) {
  await page
    .getByLabel("Email", { exact: true })
    .fill(process.env.SIGNON_EMAIL);
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.SIGNON_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function waitForUrlToBeAvailable(page, url) {
  await expect(async () => {
    const response = await page.request.get(
      `${url}?cacheBust=${new Date().getTime()}`,
    );
    expect(response.status()).toBe(200);
  }).toPass({ timeout: 10_000 });
  return url;
}

export { logIntoSignon, waitForUrlToBeAvailable, publishingAppUrl };
