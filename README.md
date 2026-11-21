# GoodPaw — Veterinary Reception Desk

A TypeScript + React reception workspace for the official [Spring PetClinic REST](https://github.com/spring-petclinic/spring-petclinic-rest) backend. It keeps owner lookup, owner details, pet records, visit history, and create/edit workflows together so a receptionist can work while speaking with a customer.

## Requirements

- Node.js 20+ and npm
- Java 17+ (check the backend repository's current requirements)
- Git

## Run locally

### 1. Start the unchanged backend

```bash
git clone https://github.com/spring-petclinic/spring-petclinic-rest.git
cd spring-petclinic-rest
./mvnw spring-boot:run
```

The REST API is expected at `http://localhost:9966/petclinic/api`. Confirm health at `http://localhost:9966/petclinic/actuator/health` and inspect Swagger at `http://localhost:9966/petclinic/swagger-ui.html`.

### 2. Start this frontend

```bash
cd PetClinic
npm install
cp .env.example .env.local # optional; defaults are already configured
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). To use a different backend URL, set `VITE_API_BASE_URL` in `.env.local`.

### 3. Verify

```bash
npm test
npm run build
```

## Architecture and technical decisions

- **State management:** React component state manages the selected owner, selected pet, search query, form data, loading indicators, and success/error messages. The selected owner is refreshed from the backend after successful mutations to keep the UI synchronized with server data.
- **UI feedback:** the workspace handles loading, empty search results, backend/network errors, form validation errors, and success messages after create/update operations. This helps receptionists understand the outcome of each action.
- **Vite + React + TypeScript:** fast local development, strict static checking, and a small build setup.
- **Single receptionist workspace:** owner directory and selected owner/pet details sit side-by-side. Create/edit forms use focused dialogs rather than unrelated pages.
- **API boundary:** `src/api/client.ts` owns HTTP calls, base URL configuration, JSON handling, and normalized errors. UI components do not construct endpoint URLs.
- **Typed domain model:** owner, pet, pet type, visit and input payloads live in `src/types/petclinic.ts`.
- **Server as source of truth:** after mutations, the selected owner is re-fetched; no speculative local persistence or duplicate backend state is maintained.
- **Search behavior:** the frontend fetches the owner list using `GET /owners` and performs case-insensitive client-side filtering across first name, last name, and full name. This avoids relying on the backend's restrictive last-name filter.

## API mapping

| User action           | PetClinic REST operation                     |
| --------------------- | -------------------------------------------- |
| Search owners         | `GET /owners` (client-side filtering)        |
| Load owner and pets   | `GET /owners/{ownerId}`                      |
| Create / update owner | `POST /owners`, `PUT /owners/{ownerId}`      |
| Load pet types        | `GET /pettypes`                              |
| Add pet               | `POST /owners/{ownerId}/pets`                |
| Load pet details      | `GET /owners/{ownerId}/pets/{petId}`         |
| Update pet            | `PUT /owners/{ownerId}/pets/{petId}`         |
| Add visit             | `POST /owners/{ownerId}/pets/{petId}/visits` |

## Assumptions

- The assignment expects the standard PetClinic REST app on port `9966` and context path `/petclinic`.
- Owner search is by last name because that is the filter exposed by the documented owner-list endpoint. The UI intentionally does not imply full-text search across phone, first name, or address.
- Pet type is sent as an object containing its backend ID, as expected by the PetClinic pet model.
- Visits are recorded with date and description. The visit history is read from the selected pet returned as part of the owner representation.
- The backend's default H2 profile is suitable for local evaluation; data may reset when the backend restarts.

## API gaps / workarounds

- **Search API limitation:** the backend's last-name filter can return HTTP 404 for unmatched search terms instead of an empty result. Workaround: fetch the owner list using `GET /owners` and perform case-insensitive filtering on the frontend across first name, last name, and full name. Proposed API improvement: support partial and multi-field search with consistent empty results and pagination.
- **No visit-history endpoint nested under a pet is used here:** the owner representation supplies pets and their visits in the expected PetClinic model. If a deployed backend omits visits from that representation, add a dedicated `GET /owners/{ownerId}/pets/{petId}/visits` endpoint or use the existing visit query API with a documented pet filter.
- **No API contract tests against a live backend are bundled:** the included tests validate API client URL construction and error handling without requiring Java/backend startup.

## Known limitations

- Owner search currently fetches the complete owner list and filters it in the browser. This is suitable for the assignment's dataset but may not scale for large clinics. Server-side multi-field search and pagination would be preferable.
- No authentication flow is implemented because the default backend configuration has security disabled. Do not expose an unsecured instance publicly.
- No delete workflows, appointment scheduling, billing, file attachments, or veterinarian assignment are included; these are outside the assignment's required receptionist actions.
- Backend integration has been manually verified against the local Spring PetClinic REST service, including owner search, owner creation and editing, pet creation and editing, pet details, and visit registration.
- PetClinic's default in-memory H2 database is not persistent across backend restarts.

## What I would improve next

1. Add Playwright end-to-end tests covering owner creation, pet creation, editing, and visit registration against a disposable backend.
2. Add pagination and richer owner search once supported by the API.
3. Add accessible keyboard navigation, focus trapping/return for dialogs, and stronger field-level validation.
4. Add an API contract test suite generated from the OpenAPI document and CI checks for typecheck, unit tests and production build.
5. Add authentication/session handling if the backend is deployed with security enabled.

## AI-assisted development artifacts

The assignment brief was used as the requirements source. AI assistance was used to scaffold the project, draft the typed API client and UI structure, and prepare the README/test starting points. The submitted code should be reviewed and understood by the developer. No credentials, personal data, or employer-confidential information were supplied to AI tools.

## Project structure

```text
src/
  api/client.ts            # REST boundary and error handling
  api/client.test.ts       # API client tests
  types/petclinic.ts       # Domain and input types
  App.tsx                  # Reception workspace and workflows
  styles.css               # Responsive visual system
  main.tsx                 # React entry point
```
