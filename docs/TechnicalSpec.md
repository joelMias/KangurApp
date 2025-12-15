# KangurApp — Technical Documentation

Contents
- Architecture overview
- Key services and files
- Data model
- Offline strategy
- Sync algorithm
- How to run and test
- Known issues & next steps

Architecture overview
---------------------
KangurApp is a client-side SPA built with Vue 3 and Ionic, using Firebase (Authentication + Firestore) for backend services. It also uses Vite for development/build. Key features:

- Vue + Ionic UI components for mobile-friendly interface.
- Firebase Auth for sign-in and Firestore for data storage.
- Local offline queue (`localStorage`) to store write operations and a background processor to flush them when online.

Key services and files
----------------------
- `src/services/firebase.ts` — Firebase initialization and exports.
- `src/services/auth.service.ts` — Authentication wrapper; caches `uid`, `localNados` on login.
- `src/services/api.service.ts` — (optional) Axios-based API client (present but mostly unused in Firebase mode).
- `src/services/offline.service.ts` — main offline queue: `addPending()`, `processQueue()` and `getPendingCount()`.

Data model (Firestore)
----------------------
Collections are namespaced per user under `users/{uid}`:

- `users/{uid}/cangurs` — caregiver documents ({ name, createdAt })
- `users/{uid}/nados` — baby documents ({ name, setmanes, dies, createdAt })
- `users/{uid}/cronometres` — saved sessions ({ cangurId, cangurNom, nadoId, nadoNom, temps, dia, hora, createdAt })
- `users/{uid}/entrades` — unit entries ({ nadoId, dia, horaEntrada, horaSortida, createdAt })

Offline strategy
----------------
The app uses a simple, robust offline approach:

- Read caches: lists such as `cangurs` and `nados` are cached in `localStorage` as `localCangurs` and `localNados` for read access while offline.
- Write queue: `addPending(collectionName, data, userId)` stores items in `localStorage.offlineQueue`.
- Processor: `processQueue()` runs on `window.online` and `onAuthStateChanged` to flush the queue. It creates `nados` for temporary local ids (`__tempId`) and maps them to real server ids so `cronometres` referencing local `nadoId`s are updated before pushing.
- Concurrency control: a module-level `isProcessing` flag prevents multiple concurrent flushes that could create duplicates.

Sync algorithm (high level)
--------------------------
1. On `online` event or after login, `processQueue()` reads `offlineQueue`.
2. For each item:
   - If `collection === 'nados'` and `__tempId` provided, create the server document and record mapping `temp->serverId`.
   - If `collection === 'cronometres'` references a `nadoId` that starts with `local-`, map or create nado first.
   - Push the item to Firestore under `users/{uid}/{collection}`.
3. Remove successfully processed items from the queue and persist remaining ones back to `localStorage`.

How to run and test
-------------------
Prerequisites: `node` >= 18 and `npm` installed. (Project uses Vite + Vue 3 + Ionic.)

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Unit tests (Vitest):

```bash
npm run test:unit
```

End-to-end tests (Cypress):

```bash
npm run test:e2e
```

Known issues & next steps
-------------------------
- Current queue is stored in `localStorage`. For larger/robust usage, migrate to IndexedDB (e.g., Dexie) to handle more data and avoid size limits.
- Consider adding retry/backoff and better deduplication strategies (e.g., check for existing documents by unique keys before creating) to further prevent duplicates.
- Add E2E tests that simulate offline/online transitions and verify exactly-once semantics for queued items.
- UI: show pending queue count in the main screen to give visibility to users.

Key file references
- Functional flows: `src/views/GuardarCrono.vue`, `src/views/RegisterEntrada.vue`, `src/views/Nado.vue`, `src/views/Cangurs.vue`
- Offline queue: `src/services/offline.service.ts`
- Auth and caching: `src/services/auth.service.ts`
