# Content Modelling E2E tests

A suite of end-to-end tests for Content Modelling using [Playwright](https://playwright.dev/).

These are separate and distinct from the [tests in govuk-e2e-tests](https://github.com/alphagov/govuk-e2e-tests/blob/main/tests/content-block-manager.spec.js),
which are light touch smoke tests, designed to be used in production and non-production environments.

These tests test the full workflow, and create and publish content blocks and documents, and as such, should
not be used in Production.

## Running the tests locally

### Setup

Clone and navigate to the root folder.

Install the dependencies:

```
yarn install
yarn playwright install --with-deps chromium
```

### Get and set environment variables

Ensure you are logged into the integration AWS environment:

```bash
eval $(gds aws govuk-integration-developer -e --art 8h)
kubectl config use-context govuk-integration
```

Create a .env file in the root of the project from the shared secrets:

```bash
bin/generate-env-file
```

### Run

```bash
yarn run test
```

Or to run with the Playwright UI:

```bash
yarn run test:ui
```

### Running in the staging environment

If you want to run the tests in the staging environment, you can change the `PUBLISHING_DOMAIN` and `PUBLIC_DOMAIN`
environment variables in the `.env` file to `staging.publishing.service.gov.uk` and
`www.staging.publishing.service.gov.uk` respectively. You will need to be connected to the
[GDS VPN](https://docs.publishing.service.gov.uk/manual/get-started.html#8-connect-to-the-gds-vpn) for these tests
to run correctly.

## Running in GitHub Actions

These tests are run on a schedule at 11am every weekday. See the [workflow file](.github/workflows/playwright.yml)
for more details. Any failures will be reported to the #govuk-content-modelling-automations Slack channel.

To run the tests manually, run the following command locally:

```bash
gh workflow run playwright.yml
```

## Troubleshooting

You may occasionally see the following error:

```
    AxiosError: Request failed with status code 403

       at ../lib/notify.js:5

      3 | export async function getEmailAlerts(title) {
      4 |   const notifyClient = new NotifyClient(process.env.NOTIFY_API_KEY);
    > 5 |   const response = await notifyClient.getNotifications(
        |                    ^
      6 |     "email",
      7 |     "delivered",
      8 |     null,
        at settle (/home/runner/work/content-modelling-e2e/content-modelling-e2e/node_modules/axios/lib/core/settle.js:19:12)
        at IncomingMessage.handleStreamEnd (/home/runner/work/content-modelling-e2e/content-modelling-e2e/node_modules/axios/lib/adapters/http.js:793:11)
        at Axios.request (/home/runner/work/content-modelling-e2e/content-modelling-e2e/node_modules/axios/lib/core/Axios.js:45:41)
        at getEmailAlerts (/home/runner/work/content-modelling-e2e/content-modelling-e2e/lib/notify.js:5:20)
        at /home/runner/work/content-modelling-e2e/content-modelling-e2e/tests/content-block-manager.spec.js:87:22
        at /home/runner/work/content-modelling-e2e/content-modelling-e2e/tests/content-block-manager.spec.js:86:5
```

This means that the Notify API key that we use to check email alerts has been reset. If this happens, first ensure you
are logged into the integration AWS environment:

```bash
eval $(gds aws govuk-integration-developer -e --art 8h)
kubectl config use-context govuk-integration
```

Then run:

```bash
bin/update-notify-secret
```

This will update the `NOTIFY_API_KEY` environment variable in GitHub. Once this is done, you can re-run the tests.
Note: this requires the GitHub CLI (`gh`) to be installed to perform the update in GitHub.

You may also want to run `bin/generate-env-file` manually to ensure that you can run the tests locally.
