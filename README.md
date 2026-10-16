# BookNest - Chapters 3, 4 and 5

Complete cumulative library project: **Chapter 3 Experiment 1 through Chapter 5 Experiment 2**. Chapter 5 Experiment 3 (online deployment) is outside this ZIP's scope.

## Start on Windows

1. Extract the ZIP and open the `lib-management` folder in VS Code.
2. Use Node.js 22.12 or later (Node 24 recommended).
3. Open a terminal in that folder:

```sh
npm install
npm start
```

Open the Local URL printed in the terminal. Keep the terminal open. Ctrl+C stops the frontend and backend. The app starts at Login/Register. Register your account, or use the lab account **LIB101 / Library@123**. This password is documented here for faculty testing; it is not displayed on the login screen.

`START-WINDOWS.bat` is an alternative after Node is installed. If PowerShell blocks npm.ps1, use Command Prompt as the VS Code terminal.

The ZIP deliberately excludes node_modules: Windows must install its own native dependencies. Do not copy node_modules from the previous ZIP.

## Commands

| Command                 | Purpose                                                              |
| ----------------------- | -------------------------------------------------------------------- |
| `npm start`             | Start React frontend and local Node API together                     |
| `npm test`              | Run Jest + React Testing Library component tests                     |
| `npm run test:coverage` | Run tests and generate coverage/lcov-report/index.html               |
| `npm run test:api`      | Run native Node API integration test using a temporary database      |
| `npm run lint`          | Check source with ESLint                                             |
| `npm run build`         | Generate production app, route chunks and PWA service worker in dist |
| `npm run server`        | Start the API by itself                                              |
| `npm run preview`       | Preview the production frontend, usually at localhost:4173           |

For PWA verification, first run `npm run build`. Then run `npm run server` in terminal 1 and `npm run preview` in terminal 2. Open the preview URL. A normal development run does not install the production service worker.

## Server and saved data

React displays pages. The Node REST API authenticates members and saves the catalogue, accounts, borrowing, holds and history in `db.json`. The Vite dev/preview proxy forwards `/api` requests to port 3001. No JSON Server installation or external API key is required.

Data survives refresh and backend restart. Session tokens are in memory and expire after 30 minutes; restarting the API requires login again. Registered passwords are salted scrypt hashes. The seeded lab account is for local demonstrations only. All signed-in members may manage books; this project does not add production administrator roles.

Back up db.json before resetting or changing it. Automated tests use temporary copies and do not modify your saved records.

## Included experiments

| Chapter / experiment           | Implementation                                                                                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3 / 1 React hooks              | Functional JSX components; useState, useEffect, search focus via useRef, useMemo filters/statistics, useCallback operations and responsive CSS                 |
| 3 / 2 Context and custom hooks | hooks/useBooks.js, hooks/useBorrowing.js, LibraryContext and shared member data                                                                                |
| 3 / 3 Navigation               | Dynamic /book/:id and /borrow/:id; nested /member routes using Outlet; request/confirmation/dashboard flow                                                     |
| 3 / 4 Protected UI             | AuthContext, ProtectedRoute, requested-page redirect, validated login/register/borrow/renew/profile forms and ErrorBoundary                                    |
| 4 / 1 REST API                 | Books, dynamic details, members and category-based recommendations, async loading/error/empty states                                                           |
| 4 / 2 Redux Toolkit            | One library slice/store; actions, middleware monitoring and catalogue cache in localStorage                                                                    |
| 4 / 3 CRUD                     | Manage books add/edit/delete, borrowing/renewal/return APIs and JSON persistence                                                                               |
| 4 / 4 Authentication API       | Login/register API, opaque Bearer tokens, protected APIs, logout and expiry                                                                                    |
| 5 / 1 Component testing        | Jest 30 + React Testing Library; src/test/_.test._                                                                                                             |
| 5 / 2 Optimization             | React.lazy/Suspense routes, React.memo book cards, WebP covers, lazy image loading, API GET deduplication/cache, PWA, accessible controls and input validation |

The existing Chapter 3 hooks and component structure are retained while Chapter 4 APIs/Redux provide their data. The latest requested simple Login/Register, navy-blue/light theme, Calibri font stack, and catalogue search fields are included. Calibri appears when installed; Arial/sans-serif is the fallback.

## Chapter 5 Experiment 1: show the output

Run `npm test`. Screenshot the terminal test summary. Tests cover cards, lists, details, availability, rendered title/category search, author/availability filtering, borrow and hold submission, invalid phone, return, renewal, failure messages, member profile saving, route protection, login and API cache behavior.

Run `npm run test:coverage` to view a coverage report. Tests exercise selected requirements; the report does not claim 100% application coverage. Component tests mock API-facing operations. `npm run test:api` separately verifies real server auth, CRUD, loans, renewal limits, hold priority and member isolation.

## Chapter 5 Experiment 2: show the output

1. **Lazy loading / code splitting:** run `npm run build`; separate BookDetailsPage, Login, MemberProfile and other page chunks appear. In DevTools Network, opening a page loads its chunk.
2. **Images:** covers are WebP; cards use loading=lazy, decoding=async and fixed dimensions. Original six covers reduced from 570,452 bytes to 81,632 bytes (about 86%).
3. **API loading:** details and recommendations share identical pending requests and cache successful reads in memory for 20 seconds. Mutations/logout invalidate the cache; token identity separates users. Member/history/state responses are not stored by the service worker. Catalogue searching is local useMemo filtering, so typing does not issue a request per character.
4. **PWA:** use the production preview. DevTools -> Application -> Manifest and Service Workers should show BookNest. Install through the browser's install option when available. First visit must be online. With Network Offline, reload: cached app files load, with an offline message. Login and borrowing require the API; offline mode does not queue transactions or expose stored private records.
5. **Accessibility:** Tab reaches the skip link; use Tab/Shift+Tab, Enter and Space for controls. Inputs have associated labels, navigation has a label, status/error messages use live/status roles, and reduced-motion preferences are respected.
6. **Security:** server validates types, lengths, email, phone, book year and renewal eligibility; API JSON responses use no-store/nosniff. React renders user text without HTML injection. Tokens/passwords are not printed. Browser localStorage tokens remain a classroom-demo tradeoff, not XSS-proof storage.

If an older production service worker shows stale content, accept the update prompt. For a clean demonstration, DevTools -> Application -> Service Workers -> Unregister, then Storage -> Clear site data (this also removes the login token).

## Main demonstration flow

Register/Login -> Books -> search/category -> Details -> Borrow -> Confirmation -> My library -> Renew (enter reason) -> Return -> Reading history -> Profile. Manage books supports actual field editing and deletion. Return a book before deletion.

For holds: account A borrows a book; log out and register account B; B places a hold on that book. A returns it. B, as first in the hold queue, may borrow it. Renewal is blocked for overdue/held books and after two renewals. Borrowing is 14 days; renewal adds 7 days to the existing due date.

## Validation

See TEST-RESULTS.md for checks performed on the delivered revision. This is a local academic application; no website has been published as part of this ZIP.
"# BookNest" 
