# AI-assisted development notes

## Assignment interpretation

The requested user journey is receptionist-led: search/select an owner, inspect contact details and pets, choose a pet, inspect visit history, then create/update the relevant record without leaving the workspace.

## Design and implementation choices

- Kept the owner directory and selected profile in one responsive workspace.
- Chose a small service module rather than spreading `fetch` calls across components.
- Added explicit TypeScript models for API entities and write payloads.
- Used the existing owner/pet/visit API operations; no backend code or schema changes are included.
- Re-fetches owner state after writes so the UI reflects backend state.
- Implements case-insensitive client-side owner search across first name, last name, and full name because the backend's last-name filter has restrictive behavior.

## AI assistance used

## AI assistance used

ChatGPT was used as a development assistant throughout the assignment.

Representative areas of assistance:
- Breaking down the assignment requirements into implementation tasks and user workflows.
- Drafting the initial React, TypeScript, and API client structure.
- Troubleshooting API integration issues, including owner search behavior and PetClinic pet-type payload requirements.
- Preparing and extending Vitest tests for search, error handling, owner creation, and pet creation.
- Reviewing and improving the README and technical documentation.

Developer responsibilities:
- Ran the application and backend locally.
- Inspected actual API responses and investigated integration failures.
- Applied and reviewed code changes.
- Executed automated tests and the production build.
- Manually verified the receptionist workflows and UI feedback states.

AI-generated suggestions were treated as drafts, not authoritative implementation decisions. The final code and technical decisions were reviewed and verified by the submitting engineer.

## Verification status

- Automated tests: 8 tests passing using Vitest.
- Production build: `npm run build` completed successfully, including TypeScript compilation and Vite production bundling.
- Backend integration: manually verified against the local Spring PetClinic REST service.
- Verified workflows:
  - Owner search by first name, last name, and full name.
  - Owner creation and editing.
  - Pet creation and editing.
  - Pet details and visit history.
  - Visit registration.
- Verified UI states:
  - Empty search results.
  - Backend unavailable/network error.
  - Form validation.
  - Successful update feedback.

AI-generated code and documentation were reviewed, corrected, and tested during development. The submitting engineer remains responsible for understanding and explaining the final implementation.
