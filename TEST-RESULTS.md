# Validation - final cumulative project

- Jest + React Testing Library: **32 tests passed across 4 suites**.
- Native Node API integration: **passed**, using a temporary database. Covers login/register, duplicate registration, malformed inputs, protected API rejection, book CRUD, borrowing, renewal limit, account isolation, hold priority, return, profile save and logout invalidation.
- ESLint: **passed**.
- Vite production build: **passed**, with separate route chunks.
- PWA: **service worker and manifest generated**; browser verified precaching and offline app-shell reload. API responses are not in service-worker cache.
- Headless Chromium production-preview flow: **passed**. Login/register, title and category search, borrow/renew/return/history, profile edit, book add/edit/delete, session restoration, desktop layout and 375px mobile layout verified. No page runtime exceptions.
- Browser screenshots reviewed internally: login, desktop books and mobile books. No horizontal overflow at 375px.
- WebP covers: **570,452 -> 81,632 bytes**, about 86% smaller.

Tests mock component operations where appropriate; they do not establish 100% app coverage. Generate the coverage report with npm run test:coverage. Native API and browser checks complement the component tests.

The final database contains the original six books and one lab member, with no test loans or test registrations. Automated API checks use a temporary copy. No online deployment is included; scope ends at Chapter 5 Experiment 2.
