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
aws secretsmanager get-secret-value --secret-id govuk/content-block-manager/e2e-secrets \
  | jq '.SecretString' | jq -r 'fromjson | to_entries[] | "\(.key)=\(.value)"'  > .env
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

## Running in Github Actions

At the moment, the tests are only run on demand - to run them, go to the [Playwright action](https://github.com/alphagov/content-modelling-e2e/actions/workflows/playwright.yml)
and click "Run workflow".
