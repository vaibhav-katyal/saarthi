# Saarthi Backend Test Documentation (Jest)

This project uses **Jest** to run unit/integration-style tests for the backend under `tests/`.

## What are “test suites” and “tests”?

### Test suite
A **test suite** is a single Jest file (or logical block in the file) that groups related checks.

In Jest output you’ll see something like:
- `PASS  tests/auth.test.js`
- `PASS  tests/jwt.test.js`
- `PASS  tests/weeklySummary.test.js`

Those correspond to **3 test suites**.

### Test (case)
A **test** (sometimes called a **test case**) is one individual assertion flow inside a suite.

In Jest output you’ll see:
- `Tests: 7 passed, 7 total`

That means across all suite files, there are **7 total test cases** (each created via `test(...)` / `it(...)`).

## Suites & what they contain

### 1) `tests/auth.test.js` — Auth / Login API suite
What is being tested:
- `POST /api/auth/login`

Test cases inside this suite (3):
1. **successful login**
   - Expected: `200` + JSON contains `{ success: true, token, user }`
2. **invalid password**
   - Expected: `401` + `{ success: false, error: 'Invalid credentials' }`
3. **non-existing user**
   - Expected: `401` + `{ success: false, error: 'Invalid credentials' }`

Implementation notes:
- Mocks `backend/models/User` so no real MongoDB is required.
- Uses Supertest against an Express app created in the test.

### 2) `tests/jwt.test.js` — JWT suite
What is being tested:
- JWT creation and verification behavior

Test cases inside this suite (3):
1. **valid token verifies** using `process.env.JWT_SECRET`
2. **invalid/malformed token rejected** (`jwt.verify` throws)
3. **token signed with wrong secret rejected**

Implementation notes:
- Tests use the same JWT secret strategy as the application (no PostgreSQL/Prisma involved).

### 3) `tests/weeklySummary.test.js` — Weekly summary email suite
What is being tested:
- `sendWeeklySummaryToUser(userId)` triggers the email sending flow

Test cases inside this suite (1):
1. **sendMail is triggered**
   - Expected: nodemailer transport `sendMail()` is called exactly once
   - Expected: mail `to` matches the user email and `subject` matches the weekly summary format

Implementation notes:
- Mocks `nodemailer` so **no real emails are sent**.
- Mocks `backend/models/User` and `backend/utils/weeklySummaryHelper` to make the test deterministic.

## How to run

From `saarthi-bee/`:

```bash
npm test
```

To get coverage:

```bash
npm run coverage
```

## Why do we see “suites passed” and “tests passed”?

- Jest reports suites (files) at the top-level.
- Then it reports the number of individual test cases that ran across all suites.

So for example:
- `Test Suites: 3 passed, 3 total` means 3 suite files succeeded.
- `Tests: 7 passed, 7 total` means 7 individual `test(...)` blocks succeeded.

