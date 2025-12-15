# KangurApp — Especificació Funcional (Català)

Versió: 1.0

Resum
-----
KangurApp és una aplicació Ionic + Vue per a registrar sessions de cura ("pell amb pell"), registrar entrades/sortides de la unitat i gestionar cangurs i nadós. L'autenticació i la persistència es fan amb Firebase (Auth + Firestore). L'aplicació funciona en mode offline amb una cua local per a escrits que es sincronitza quan es recupera la connexió.

Fluxos d'usuari principals
-------------------------
- Registre / Inici de sessió
  - L'usuari es registra amb nom, correu i contrasenya o inicia sessió.
  - En fer login, es guarden dades rellevants en `localStorage` (p. ex. `uid`, `localNados`) per suport offline.

- Gestionar cangurs
  - Afegir/eliminar cangurs a la pantalla `Cangurs`.
  - Les dades es guarden a Firestore; si s'està offline, s'afegeixen a `localCangurs` i es posen a la cua.

- Crear nadó (Nadó)
  - Crear un nadó amb nom, setmanes i dies.
  - Si s'està offline, es crea un id temporal (`local-...`) i s'afegeix a la cua amb `__tempId` per ser creat al servidor després.

- Registrar sessió (GuardarCrono)
  - Seleccionar cangur, visualitzar temps i prémer "Registrar".
  - Les dades guardades: `cangurId`, `cangurNom`, `nadoId`, `nadoNom`, `temps`, `dia`, `hora`, `createdAt`.
  - Si s'està offline, la sessió s'afegeix a `localStorage.offlineQueue` i l'usuari és redirigit a la pantalla principal amb un toast informatiu.

- Registrar entrada/sortida (RegisterEntrada)
  - Seleccionar hores d'entrada i sortida i desar; el registre es guarda en Firestore o en la cua si estàs offline.

Comportament en mode offline
---------------------------
- Lectura: llistes com `cangurs` i `nados` es guarden en `localStorage` (`localCangurs`, `localNados`) per poder mostrar-les offline.
- Escriptura: una funció `addPending(collection, data, userId)` guarda l'operació a `localStorage.offlineQueue`.
- Sincronització: `processQueue()` s'executa en l'esdeveniment `online` i en `onAuthStateChanged` per buidar la cua.
  - Els nadós encolats amb `__tempId` es créen primer i es mapegen a l'id del servidor; així, els cronòmetres que feien referència a ids locals es poden actualitzar abans d'enviar-los.

Pantalles clau
--------------
- `Login.vue` — Inici de sessió.
- `Cangurs.vue` — Llista i gestió de cangurs.
- `Nado.vue` — Crear nadó.
- `GuardarCrono.vue` — Pantalla del cronòmetre i registre de sessions.
- `RegisterEntrada.vue` — Registrar entrada/sortida de la unitat.
- `Historial.vue` — Llista i gràfics d'històric.

Crèdits i accés ràpid
---------------------
- Arxius importants: `src/services/offline.service.ts`, `src/services/auth.service.ts`, `src/views/GuardarCrono.vue`, `src/views/Nado.vue`, `src/views/Cangurs.vue`, `src/views/RegisterEntrada.vue`, `src/views/Historial.vue`.
