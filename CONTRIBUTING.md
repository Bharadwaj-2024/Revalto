# Contributing to Revalto

Thanks for contributing. This guide helps everyone collaborate with a consistent workflow.

## Before You Start

- Make sure Node.js 18+ and MongoDB are installed.
- Install dependencies with `npm install`.
- Read setup instructions in `README.md`.

## Branching

- Create a feature branch from `main`.
- Use clear branch names such as:
  - `feature/listing-filters`
  - `fix/review-validation`
  - `docs/readme-improvements`

## Commit Messages

Use short, descriptive commit messages.

Recommended format:

```text
<type>: <short summary>
```

Examples:
- `feat: add booking status badge`
- `fix: handle missing listing geometry`
- `docs: update setup instructions`

## Pull Requests

When opening a PR:

- Describe what changed and why.
- Include screenshots for UI changes.
- Mention any database or migration impact.
- Add manual testing steps.
- Link related issues if available.

## Code Style Expectations

- Follow existing folder structure (`models`, `routes`, `controllers`, `views`).
- Keep controllers focused and avoid route logic duplication.
- Reuse middleware for auth/authorization checks.
- Validate incoming data with Joi schema patterns already in the project.
- Keep changes scoped to the task; avoid unrelated refactors.

## Local Verification Checklist

Before submitting:

- App starts with `npm start`
- Core flows used by your change work locally
- No sensitive values are hardcoded in new code
- Documentation updated when behavior changes

## Reporting Security Issues

Please do not open public issues for sensitive vulnerabilities.
Share details privately with maintainers.
