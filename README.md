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
npm install
npx playwright install --with-deps chromium
```

### Set environment variables

Create a .env file in the root of the project with the following content:

```bash
cat <<EOF > .env
PUBLISHING_DOMAIN=staging.publishing.service.gov.uk
PUBLIC_DOMAIN=www.staging.publishing.service.gov.uk
BASIC_AUTH_USERNAME=<username>
BASIC_AUTH_PASSWORD=<password>
SIGNON_EMAIL=<email>
SIGNON_PASSWORD=<password>
NOTIFY_API_KEY=<api_key>
EMAIL_ALERT_EMAIL=<email_alert_email>
EMAIL_ALERT_PASSWORD<email_alert_password>
EOF
```

Replace placeholders with appropriate values.

### Run

```bash
npm run test
```

## Running in Github Actions

At the moment, the tests are only run on demand - to run them, go to the [Playwright action](https://github.com/alphagov/content-modelling-e2e/actions/workflows/playwright.yml)
and click "Run workflow".
