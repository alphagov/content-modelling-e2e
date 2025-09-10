import { test } from "../lib/cachebust-test";
import { publishingAppUrl } from "../lib/utils";
import { getEmailAlerts } from "../lib/notify";
import {
  createPensionBlock,
  embedInWhitehallDoc,
  embedInMainstreamDoc,
  updateRateAmount,
  verifyListedInLocations,
  verifyUpdateVisible,
  signUpForEmails,
} from "../lib/helpers";
import { expect } from "@playwright/test";

test.describe("Content Block Manager", () => {
  test("Can create and embed an object", async ({ page, context }) => {
    const timestamp = Date.now();
    const rate = "£122.33";
    const updatedRate = "£122.99";
    const title = `E2E TEST PENSION - ${timestamp}`;

    const whitehallPath = publishingAppUrl("whitehall-admin");
    const mainstreamPath = publishingAppUrl("publisher");
    const contentBlockPath = publishingAppUrl("content-block-manager");

    await test.step("Given a user has signed up for emails", async () => {
      await signUpForEmails(page);
    });

    await test.step("And I have logged in", async () => {
      await page.goto(contentBlockPath);
      await expect(
        page.getByRole("heading", { name: "Content Block Manager" }),
      ).toBeVisible();
    });

    await test.step("When I create an object", async () => {
      await createPensionBlock(page, contentBlockPath, rate, title);
    });

    const { url: whitehallUrl, title: whitehallTitle } =
      await test.step("Then I should be able to embed my object in a Whitehall document", async () => {
        return await embedInWhitehallDoc(
          page,
          context,
          contentBlockPath,
          whitehallPath,
          title,
          timestamp,
          rate,
        );
      });

    const { url: mainstreamUrl, title: mainstreamTitle } =
      await test.step("And I should be able to embed my object in a Mainstream document", async () => {
        return await embedInMainstreamDoc(
          page,
          context,
          contentBlockPath,
          mainstreamPath,
          title,
          timestamp,
          rate,
        );
      });

    await test.step("And I should see my pages in the list of locations", async () => {
      await verifyListedInLocations(
        page,
        contentBlockPath,
        title,
        whitehallTitle,
        mainstreamTitle,
      );
    });

    await test.step("When I make a change to my block", async () => {
      await updateRateAmount(page, contentBlockPath, title, updatedRate);
    });

    await test.step("Then the changed block should be visible on my pages", async () => {
      await verifyUpdateVisible(page, whitehallUrl, updatedRate);
      await verifyUpdateVisible(page, mainstreamUrl, updatedRate);
    });

    await test.step("And the subscribed user should have received an email alert", async () => {
      const emails = await getEmailAlerts(whitehallTitle);
      expect(emails.length).toBeGreaterThan(0);
    });
  });
});
