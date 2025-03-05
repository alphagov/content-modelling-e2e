import { expect } from "@playwright/test";
import { test } from "../lib/cachebust-test";
import { publishingAppUrl, waitForUrlToBeAvailable } from "../lib/utils";

test.describe("Content Block Manager", () => {
  test("Can create and embed an object", async ({ page, context }) => {
    const whitehallPath = publishingAppUrl("whitehall-admin");
    const mainstreamPath = publishingAppUrl("publisher");

    const contentBlockPath = `${whitehallPath}/content-block-manager/`;

    await test.step("Logging in", async () => {
      await page.goto(contentBlockPath);
      await expect(
        page.getByRole("banner", { text: "Content Block Manager" }),
      ).toBeVisible();
    });

    const rate = "£122.33";

    const title = await test.step("Can create an object", async () => {
      const title = `E2E TEST PENSION - ${new Date().getTime()}`;

      await page.goto(contentBlockPath);
      await page.getByRole("button", { name: "Create content block" }).click();
      await page.getByLabel("Pension").click();
      await page.getByRole("button", { name: "Save and continue" }).click();

      await page.getByLabel("Title").fill(title);

      await expect(async () => {
        const comboBox = await page.getByRole("combobox", {
          name: "Lead organisation",
        });
        await comboBox.click();

        const option = await comboBox.getByRole("option").nth(2);
        await option.click();
      }).toPass();

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

      return title;
    });

    const whitehallUrl =
      await test.step("Can embed an object in Whitehall", async () => {
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);

        await page.goto(contentBlockPath);

        await page.getByRole("link", { name: title }).click();

        await page.getByText("Copy code").click();

        await page.goto(whitehallPath);

        await page.getByRole("link", { name: "New document" }).click();
        await page.getByLabel("News article").check();
        await page.getByRole("button", { name: "Next" }).click();

        await page.locator(".choices__item").first().click();
        await page
          .getByRole("option", { name: "News story", exact: true })
          .click();

        const documentTitle = `TEST DOCUMENT - ${new Date().getTime()}`;

        await page.getByLabel("Title (required)").fill(documentTitle);
        await page.getByLabel("Summary (required)").fill("Some summary");
        await page.getByLabel("Body (required)").click();
        await page.getByLabel("Body (required)").press("Meta+v");

        await page
          .getByRole("button", { name: "Save and go to document" })
          .click();
        await page.getByRole("link", { name: "Add tags" }).click();
        await page
          .locator('[id="taxonomy_tag_form\\[taxons\\]"]')
          .getByRole("list")
          .locator("div")
          .first()
          .click();
        await page.getByRole("button", { name: "Save" }).click();

        await page.getByRole("button", { name: "Force publish" }).click();
        await page
          .getByLabel("Reason for force publishing")
          .fill("Some reason");
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

        return url;
      });

    const mainstreamUrl =
      await test.step("Can embed an object in Mainstream", async () => {
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);

        await page.goto(contentBlockPath);

        await page.getByRole("link", { name: title }).click();

        await page.getByText("Copy code").click();

        await page.goto(mainstreamPath);

        await page.getByRole("link", { name: "Add artefact" }).click();

        const documentTitle = `TEST DOCUMENT - ${new Date().getTime()}`;
        const documentSlug = `test-document-${new Date().getTime()}`;

        await page.getByLabel("Title").fill(documentTitle);
        await page.getByLabel("Slug").fill(documentSlug);
        await page.getByLabel("Format").selectOption("answer");
        await page.getByRole("button", { name: "Save and go to item" }).click();

        await page.getByLabel("Body").click();
        await page.getByLabel("Body").press("Meta+v");

        await page.getByRole("button", { name: "Save" }).click();
        await page.getByRole("link", { name: "2nd pair of eyes" }).click();
        await page
          .locator("input")
          .filter({ hasText: "Send to 2nd pair of eyes" })
          .click();
        await page
          .getByText("Skip to main content Toggle")
          .press("ControlOrMeta+r");
        await page.getByRole("link", { name: "Skip review" }).click();
        await page.locator("input").filter({ hasText: "Skip review" }).click();
        await page.getByRole("link", { name: "Publish", exact: true }).click();
        await page
          .locator("input")
          .filter({ hasText: "Send to publish" })
          .click();

        const url = await waitForUrlToBeAvailable(
          page,
          await page
            .getByRole("link", { name: "View this on the GOV.UK" })
            .getAttribute("href"),
        );

        await page.goto(url);
        await expect(page.getByText(rate)).toBeVisible();

        return url;
      });

    await test.step("Dependent content updates when block content changes", async () => {
      const updatedRate = "£122.99";

      await page.goto(contentBlockPath);

      await page.getByRole("link", { name: title }).click();

      await page.getByRole("button", { name: "Edit pension" }).click();
      await page.getByRole("button", { name: "Save and continue" }).click();

      await page
        .locator('[data-test-id="embedded_some-rate"]')
        .getByRole("link", { name: "Edit" })
        .click();
      await page.getByLabel("Amount").fill(updatedRate);
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

      await expect(async () => {
        await page.goto(`${whitehallUrl}?cacheBust=${new Date().getTime()}`);
        await expect(page.getByText(updatedRate)).toBeVisible();
      }).toPass();

      await expect(async () => {
        await page.goto(`${mainstreamUrl}?cacheBust=${new Date().getTime()}`);
        await expect(page.getByText(updatedRate)).toBeVisible();
      }).toPass();
    });
  });
});
