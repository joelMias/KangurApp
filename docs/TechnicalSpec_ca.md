# KangurApp — Documentació Tècnica (Català)

Contingut
- Arquitectura
- Serveis i fitxers clau
- Model de dades
- Estratègia offline
- Algorisme de sincronització
- Com executar i provar
- Problemes coneguts i passos següents

Arquitectura
-----------
KangurApp és una SPA amb Vue 3 i Ionic. Utilitza Firebase (Auth + Firestore) per autenticació i persistència. Vite s'utilitza per desenvolupament i build. Es fan servir mòduls sèrie per separar lògiques (autenticació, offline, serveis).

Serveis i fitxers clau
---------------------
- `src/services/firebase.ts` — inicialització de Firebase.
- `src/services/auth.service.ts` — envoltatori d'autenticació; desa `uid` i cache de `nados` al login.
- `src/services/offline.service.ts` — cua local: `addPending()`, `processQueue()`, `getPendingCount()`.
- Vistes principals: `src/views/*.vue` (`GuardarCrono.vue`, `Nado.vue`, `Cangurs.vue`, `RegisterEntrada.vue`, `Historial.vue`, `Login.vue`).

Model de dades (Firestore)
--------------------------
Estructura principal: `users/{uid}/{collection}`

- `cangurs`: { name, createdAt }
- `nados`: { name, setmanes, dies, createdAt }
- `cronometres`: { cangurId, cangurNom, nadoId, nadoNom, temps, dia, hora, createdAt }
- `entrades`: { nadoId, dia, horaEntrada, horaSortida, createdAt }

Estratègia offline
-------------------
- Lectura: `localCangurs` i `localNados` ajuden la UI a funcionar offline.
- Escriptura: `offlineQueue` (a `localStorage`) emmagatzema operacions pendent.
  - Quan es crea un nadó offline, s'afegeix `__tempId` al payload per poder mapar-lo després.
- Sincronització: `processQueue()` es crida en `window.online` o quan canvia l'estat d'autenticació.
- Control de concurrència: `isProcessing` evita invocar `processQueue()` concurrentment i crear duplicats.

Algorisme de sincronització
---------------------------
Per cada item de la cua:
1. Si `collection === 'nados'` i `__tempId` present, crear el nado al servidor i guardar mapping `temp->serverId`.
2. Si `collection === 'cronometres'` i `nadoId` comença amb `local-`, crear o mapar el nado primer.
3. Crear el document a Firestore i eliminar l'item de la cua si s'ha processat correctament.

Execució i proves
-----------------
Instal·lació:
```bash
npm install
```

Desenvolupament:
```bash
npm run dev
```

Tests unitaris (Vitest):
```bash
npm run test:unit
```

E2E (Cypress):
```bash
npm run test:e2e
```

Problemes coneguts i següents passos
-----------------------------------
- Actualment la cua fa servir `localStorage`. Per major robustesa cal migrar a IndexedDB (p. ex. `dexie`).
- Afegir deduplicació addicional (comprovacions per unicitat abans de crear documents al servidor).
- Afegir E2E que simulin els fluxos offline→online per assegurar "exactly-once".
