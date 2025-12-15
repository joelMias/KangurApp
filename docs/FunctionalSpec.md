# KangurApp — Functional Specification

Version: 1.0

Overview
--------
KangurApp is a small Ionic + Vue application for tracking caregiving sessions ("pell amb pell"), unit entry/exit times, and managing caregivers ("cangurs") and babies ("nadós"). Users authenticate with Firebase and store data in Firestore. The app supports offline usage by caching local data and queuing writes for later synchronization.

Primary User Flows
------------------
- Onboarding
  - Create account (name, email, password).
  - Add one or more caregivers (`Cangurs`) and then add a baby (`Nadó`).

- Recording a caregiving session (Cronòmetre)
  - Start cronòmetre, record elapsed time, select caregiver (cangur).
  - Save session: app stores `cangurId`, `cangurNom`, `nadoId`, `nadoNom`, `temps`, `dia`, `hora` and `createdAt`.
  - If offline, the session is queued locally and the user is returned to the main screen with a toast confirming offline save.

- Registering unit entry/exit (Entrades)
  - Select entry and exit times and save. Also queued when offline.

- Managing caregivers (Cangurs)
  - Add and remove caregivers; added caregivers are persisted and cached for offline use.

- Managing babies (Nados)
  - Create a baby record that can be selected in the cronòmetre and entrades flows. When created offline, it is queued with a temporary id so the sync process can create it later and map references.

Important UX details
--------------------
- Offline mode: the app caches lists (cangurs, nados) in `localStorage` (`localCangurs`, `localNados`) and queues write operations into `offlineQueue` in `localStorage`.
- After enqueueing, the app displays a toast and immediately redirects to the main (`/funcionalitats`).

Screens
-------
- `Login` — authenticate. (See: `src/views/Login.vue`)
- `Cangurs` — list/add/delete caregivers. (See: `src/views/Cangurs.vue`)
- `Nadó` — create baby. (See: `src/views/Nado.vue`)
- `GuardarCrono` — show timer and save session for selected caregiver. (See: `src/views/GuardarCrono.vue`)
- `RegisterEntrada` — register entry/exit of unit. (See: `src/views/RegisterEntrada.vue`)
- `Historial` — view sessions (list and charts). (See: `src/views/Historial.vue`)

Acceptance Criteria
-------------------
- Users can create and manage caregivers and babies while online and offline.
- Saving a cronòmetre or entrades offline stores the item in a persistent queue and informs the user.
- When connection returns, queued items are pushed to Firestore exactly once and references (e.g., local `nado` ids) are remapped correctly.
