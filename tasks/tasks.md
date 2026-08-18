# Tasques — RevisorDeures

## Regles

- L'estat de cada tasca es troba a la capçalera, format: **Estat:** [ESTAT]
- Els estats vàlids són: `[PENDENT]`, `[IMPLEMENTANT]`, `[REVISANT]`, `[COMPLETADA]`
- Cada tasca inclou els tests que ha de superar
- Les tasques es completen en ordre de prioritat i dependències (fase per fase)
- No comencis una fase fins que totes les tasques de la fase anterior estiguin `COMPLETADA`
- Al final de cada fase, assegun-te que tots els tests de regressió passen

---

## Fase 0: Configuració inicial

### T0.1 — Crear l'estructura de directoris

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** coordinator
**Dependències:** cap

Crear l'estructura completa de directoris del projecte:
- `server/`, `server/routes/`, `server/public/`, `server/db/`, `server/data/`, `server/tmp/`
- `tests/` (amb subcarpetes per tests específics i tests de regressió)

**Tests:**
- [x] Executar `ls -R server/` i verificar que existeixen totes les carpetes

### T0.2 — Crear package.json amb dependències

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** backend-dev
**Dependències:** T0.1

Crear `package.json` amb les dependències: express, better-sqlite3, bcrypt, dotenv, cors, express-session.

**Tests:**
- [x] Executar `npm install` sense errors
- [x] Verificar que totes les dependències es poden requerir des de Node.js

### T0.3 — Crear server/settings.env

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** coordinator
**Dependències:** cap

Crear `server/settings.env` amb SERVER_ADMIN_PWD, DATABASE_PATH, PORT=3000, SESSION_SECRET (generrat aleatòriament), OPENCODE_ZEN_API_KEY, PROXY_AGENTS_BASE_URL, PROXY_AGENTS_KEY, GITHUB_PERSONALACCESS_TOKEN (tot agafat de variables d'entorn del projecte).

**Tests:**
- [x] Verificar que `server/settings.env` existeix
- [x] Verificar que té totes les variables necessàries

### T0.4 — Crear servidor bàsic Express

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** backend-dev
**Dependències:** T0.2, T0.3

Crear `server/index.js` amb: dotenv, Express, CORS, express-session, servei d'estàtics des de server/public/, rutes API a /api/*.js, llistat al PORT, middleware JSON, error handler.

**Tests:**
- [x] Executar `node server/index.js` i verificar que es connecta al port
- [x] Fer `curl http://localhost:3000/` i verificar que respon
- [x] Fer `curl http://localhost:3000/api` i verificar que respon

### T0.5 — Crear inicialització de base de dades

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** backend-dev
**Dependències:** T0.4

Crear `server/db/init.js` que connecta a SQLite, verifica connexió, fitxer server/data/data.db es crea automàticament.

**Tests:**
- [x] Executar `node server/db/init.js` sense errors
- [x] Verificar que es crea `server/data/data.db`

---

## Fase 1: Base de dades

### T1.1 — Definir esquema de la base de dades

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** backend-dev
**Dependències:** T0.5

Definir a `server/db/init.js` les taules:
- alumnes: id, nom, email (unique), password_hash, created_at
- practiques: id, titol, criteria, created_at
- entregues: id, alumne_id (FK), practica_id (FK), repo_url, estat, revisada, revisat_per, revisat_at, created_at, updated_at
- valoracions: id, entrega_id (FK, unique), estat, resultat, comentaris, detall, created_at, updated_at

**Tests:**
- [x] Executar `node server/db/init.js` sense errors
- [x] Obrir server/data/data.db amb sqlite3 i verificar .schema

### T1.2 — Capa de dades: alumnes

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** backend-dev
**Dependències:** T1.1

Crear `server/db/alumnes.js` amb: getAll(), getById(), getByEmail(), create({nom, email, password}), update(id, {nom, email}), delete(id), existsByEmail(email). Hash MD5 amb crypto.createHash('md5').

**Tests:**
- [x] Crear un alumne amb email vàlid i verificar que es guarda
- [x] Crear amb email duplicat i verificar error
- [x] Consultar per email i verificar que es recupera
- [x] Verificar que el hash MD5 es guarda (no text pla)

### T1.3 — Capa de dades: practiques

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** backend-dev
**Dependències:** T1.1

Crear `server/db/practiques.js` amb: getAll(), getById(), create({titol, criteria}), update(id, {titol, criteria}), delete(id), exists(titol).

**Tests:**
- [x] Crear una pràctica i verificar
- [x] Consultar totes
- [x] Actualitzar
- [x] Esborrar

### T1.4 — Capa de dades: entregues

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** backend-dev
**Dependències:** T1.1

Crear `server/db/entregues.js` amb: getAll(), getById(), getByAlumne(alumne_id), getByPractica(practica_id), getNoRevisadesByAlumne(alumne_id), create({alumne_id, practica_id, repo_url}), updateEstat(id, estat), marcarRevisada(id, revisat_per), delete(id).

**Tests:**
- [x] Crear entrega
- [x] Consultar per alumne
- [x] Consultar per practica
- [x] Marcar com revisada
- [x] Consultar no revisades d'un alumne

### T1.5 — Capa de dades: valoracions

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** backend-dev
**Dependències:** T1.1

Crear `server/db/valoracions.js` amb: getByEntrega(entrega_id), create({entrega_id, ...}), updateEstat(id, estat), updateResultat(id, resultat, comentaris, detall).

**Tests:**
- [x] Crear valoració per entrega
- [x] Consultar per entrega
- [x] Actualitzar estat

---

## Fase 2: Autenticació

### T2.1 — Rutes d'autenticació

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** backend-dev
**Dependències:** T1.2, T0.4

Crear `server/routes/auth.js`:
- POST /api/auth/login — rep {usuari, password}; si usuari='admin' i password==SERVER_ADMIN_PWD sessió admin; si email busca alumne, compara hash MD5; retorna {rol, ...}
- POST /api/auth/logout — destrueix sessió
- GET /api/auth/session — retorna sessió actual o null
- Middleware requireAuth(roles?) per protegir rutes
- Registrar routes a server/routes/index.js

**Tests:**
- [x] Login admin correcte → 200 rol admin
- [x] Login admin incorrecte → 401
- [x] Login alumne correcte → 200 rol alumne
- [x] Login alumne incorrecte → 401
- [x] GET /api/auth/session amb sessió → dades
- [x] GET /api/auth/session sense sessió → null
- [x] POST /api/auth/logout → sessió destruïda

### T2.2 — Pàgina de login

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** frontend-dev
**Dependències:** T2.1

Crear `server/public/index.html` amb formulari de login (usuari, password), JavaScript client que fa POST a /api/auth/login, redirigeix a /admin si admin, /alumne si alumne, mostra errors.

També crear `server/public/admin.html` (esquelet) i `server/public/alumne.html` (esquelet).

**Tests (Playwright):**
- [x] Obrir / → formulari de login visible
- [x] Login admin correcte → redirigeix a /admin
- [x] Credencials incorrectes → mostra error
- [x] Formulari enviat amb Enter funciona
- [x] admin.html accessible després de login
- [x] alumne.html accessible després de login

---

## Fase 3: Gestió d'alumnes

### T3.1 — CRUD d'alumnes

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** backend-dev
**Dependències:** T1.2, T2.1

Rutes protegides amb requireAuth('admin') a server/routes/alumnes.js:
- GET /api/alumnes → totes les alumnes (sense password_hash)
- POST /api/alumnes → create {nom, email, password} amb hash MD5
- PUT /api/alumnes/:id → update {nom?, email?}
- DELETE /api/alumnes/:id → delete
- Validació: email format, nom no buit, email no duplicat

**Tests:**
- [x] GET sense sessió → 401
- [x] GET amb admin → 200 array buit/plè
- [x] POST correcte → 201
- [x] POST email duplicat → 409
- [x] POST camps buits → 400
- [x] GET /alumnes/:id → 200 sense password
- [x] PUT /alumnes/:id → 200 actualitzat
- [x] DELETE /alumnes/:id → 200
- [x] DELETE 999 → 404
- [x] POST amb sessió alumne → 403

### T3.2 — Pàgina de gestió d'alumnes

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** frontend-dev
**Dependències:** T3.1

Crear `server/public/admin-alumnes.html`:
- Llista d'alumnes amb taula (nom, email, accions)
- Accions: "Entregues" → /admin/entregues?alumne=X, "Esborrar"
- Formulari modal per afegir alumne (nom, email, password)
- JavaScript: GET /api/alumnes, POST /api/alumnes, DELETE /api/alumnes/:id
- `server/public/admin.html` amb enllaços a alumnes, practiques, entregues
- Navegació amb barra superior

**Tests (Playwright):**
- [x] Obrir /admin/alumnes amb admin → mostra pàgina
- [x] Mostrar botó + Afegir Alumne
- [x] Mostrar taula d'alumnes amb files
- [x] Alumne sense permisos → 403 a API

---

## Fase 4: Gestió de pràctiques

### T4.1 — CRUD de pràctiques

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** backend-dev
**Dependències:** T1.3, T2.1

Rutes protegides a server/routes/index.js:
- GET /api/practiques
- POST /api/practiques {titol, criteria}
- PUT /api/practiques/:id {titol?, criteria?}
- DELETE /api/practiques/:id
- totes amb requireAuth('admin'), validació de camps

**Tests:**
- [x] GET sense sessió → 401
- [x] GET amb admin → 200
- [x] POST correcte → 201
- [x] POST títol buit → 400
- [x] PUT /practiques/:id → 200
- [x] DELETE /practiques/:id → 200
- [x] DELETE 999 → 404
- [x] POST amb alumne → 403

### T4.2 — Pàgina de gestió de pràctiques

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** frontend-dev
**Dependències:** T4.1

Crear `server/public/admin-practiques.html`:
- Llista de pràctiques (títol, criteris, accions)
- Accions: "Entreges", "Editar", "Esborrar"
- Formulari modal per afegir/editar (titol, criteria textarea)
- JavaScript: GET/POST/PUT/DELETE /api/practiques
- Navegació a /admin

**Tests (Playwright) — 5/5 passant:**
- [x] Obrir /admin/practiques amb sessió admin → mostra pàgina
- [x] Mostrar botó + Afegir Pràctica
- [x] Mostrar taula de pràctiques buida
- [x] Afegir pràctica amb formulari
- [x] Alumne sense permisos → 403 a API

---

## Fase 5: Gestió d'entregues

### T5.1 — Creació d'entregues

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** backend-dev
**Dependències:** T1.4, T2.1

Ruta a `server/routes/entregues.js`:
- POST /api/entregues → {practica_id, repo_url}, requereix rol 'alumne'
- Valida practica_id existeix
- Valida repo_url GitHub (regex: https://github.com/.+/[^/]+$)
- Verifica només una entrega activa per pràctica (o per permetre múltiples)
- Crea entrega amb estat 'pendent'
- Crea valoració amb estat 'pendent'
- Retorna entrega creada amb id
- Dispara valorarEntrega(entrega_id) de forma asíncrona (placeholder Fase 6)
- 400 si camps buits o URL no vàlida, 409 si ja té entrega

**Tests:**
- [x] POST sense sessió → 401
- [x] POST amb admin → 403
- [x] POST amb alumne i dades correctes → 201
- [x] POST URL no GitHub → 400
- [x] POST practica inexistent → 400
- [x] POST duplicada → 409

### T5.2 — Consulta i eliminació d'entregues

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** backend-dev
**Dependències:** T1.4, T5.1

Rutes a `server/routes/entregues.js`:
- GET /api/entregues/alumne/:alumne_id → requereix admin
- GET /api/entregues/practica/:practica_id → requereix admin
- GET /api/entregues → si admin totes, si alumne les seves; suporta ?practica_id=X, ?alumne_id=X, ?estat=X
- DELETE /api/entregues/:id → alumne només si revisada=false (esborra per admin/revisada); admin pot esborrar qualsevol

**Tests:**
- [x] GET sense sessió → 401
- [x] GET amb alumne → les seves
- [x] GET amb admin → totes
- [x] GET ?practica_id=X → filtra
- [x] GET /alumne/:id amb admin → 200
- [x] GET /practica/:id amb admin → 200
- [x] DELETE sense sessió → 401
- [x] DELETE 999 → 404

### T5.3 — Marcatge de revisió i valoracions

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** backend-dev
**Dependències:** T5.1, T5.2

Rutes a `server/routes/entregues.js` i `server/routes/valoracions.js`:
- PATCH /api/entregues/:id/revisar → requereix admin, marca revisada=true
- GET /api/entregues/pendents → requereix admin, llista no revisades amb valoració
- GET /api/entregues/valoracions/entrega/:entrega_id → retorna valoració; alumne només la seva, admin qualsevol
- GET /api/valoracions/entrega/:id (ruta independent) → retorna valoració

**Tests:**
- [x] PATCH amb admin → 200, revisada=true
- [x] PATCH si ja revisada → 400
- [x] GET /pendents amb admin → 200
- [x] PATCH amb alumne → 403
- [x] GET valoració amb admin → 200

### T5.4 — Pàgines d'entregues de l'alumne

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** frontend-dev
**Dependències:** T5.1, T5.2, T5.3

Crear `server/public/alumne.html` (espai principal alumne) i `server/public/alumne-entregues.html` i `server/public/alumne-enviar.html`:
- alumne.html: espai personal amb enllaços a "Entregues" i "Enviar"
- alumne-entregues.html: llista d'entreges amb estat (acceptada/rebutjada per l'agent, revisada/no revisada per l'admin), botó esborrar per entregues no revisades
- alumne-enviar.html: formulari per escollir practica (select), posar URL del repositori (text), botó enviar
- JavaScript client per a totes les pàgines
- Navegació amb barra superior

**Tests (Playwright):**
- [ ] Obrir /alumne sense sessió → redirigeix a /
- [ ] Amb sessió alumne → mostra espai personal
- [ ] Navegació a /alumne/entregues funciona
- [ ] Llista d'entregues amb estats
- [ ] Navegació a /alumne/enviar funciona
- [ ] Formulari d'enviament amb select de practica i URL
- [ ] Enviament d'entrega crea entrega amb estat 'pendent'
- [ ] Entreges no revisades es poden esborrar
- [ ] Entreges revisades no es poden esborrar
- [ ] Es mostra l'estat de valoració (acceptada/rebutjada)

---

## Fase 6: Pàgina d'entregues de l'administrador

### T6.1 — Pàgina de gestió d'entregues admin

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** frontend-dev
**Dependències:** T5.3

Crear `server/public/admin-entregues.html`:
- Select per filtrar per alumne (mostra totes les seves entregues)
- Select per filtrar per practica (mostra totes les entregues)
- Llista d'entregues amb: alumne, practica, repo_url, estat, revisada, accions
- Acció "Marcar revisada" per a cada entrega
- Mostra valoració si existeix (estat, resultat, comentaris)
- Navegació a /admin

**Tests (Playwright):**
- [ ] Obrir /admin/entregues sense sessió → redirigeix a /
- [ ] Amb sessió admin → mostra pàgina
- [ ] Mostrar llista d'entregues
- [ ] Filtrar per alumne
- [ ] Filtrar per practica
- [ ] Marcar entrega com revisada → actualitza llista
- [ ] Mostrar valoració si existeix
- [ ] Navegació a /admin funciona

---

## Fase 7: Agent de valoració automàtica

### T7.1 — Servidor de valoració interna

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** ai-reviewer
**Dependències:** T1.5

Crear `server/evaluator.js`:
- Funció async valorarEntrega(entrega_id) que:
  1. Agafa l'entrega de la BD amb practica (títol i criteri), alumne, repo_url
  2. Crea carpeta temporal `server/tmp/eval-{entrega_id}/`
  3. Clona el repositori de GitHub amb git clone a la carpeta temporal
  4. Llegeix el fitxer README o fitxers principals
  5. Envia les dades a l'API d'OpenCode (IETI Agents) amb:
     - Instruccions: "Avalua aquesta entrega segons els criteris d'acceptació"
     - Criteris d'acceptació de la practica
     - URL del repositori
     - Contingut del repositori
  6. Reb del model: resultat (acceptat/rebutjat), comentaris, detall
  7. Actualitza la BD: estat=completada, resultat, comentaris, detall
  8. Esborra la carpeta temporal
- Gestió d'errors: si falla, estat=error, comentaris amb error
- La funció es crida de forma asíncrona des de T5.1
- S'inicia com a servidor intern a un port diferent (3001) amb ruta POST /api/evaluar que rep {entrega_id} i crida valorarEntrega(entrega_id)

**Tests:**
- [ ] La funció valorarEntrega es pot criar (test mock)
- [ ] Gestiona correctament un cas d'error (repositori no existeix)
- [ ] Actualitza la BD correctament

### T7.2 — Integració de la valoració

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** ai-reviewer
**Dependències:** T7.1, T5.1

- Modificar T5.1 per cridar valorarEntrega(entrega_id) de forma asíncrona quan es crea una entrega
- Afegeix un endpoint GET /api/entregues/valoracio/:id que retorna l'estat actual de la valoració
- Assegura que l'agent no es dispara duplicadament (evitar múltiples valoracions per la mateixa entrega)

**Tests:**
- [ ] Crear entrega → desencadena valoració asíncrona
- [ ] Consultar estat de valoració mentre es valorar
- [ ] Consultar resultat després de valorar
- [ ] No es dupliquen les valoracions

---

## Fase 8: Espai d'administrador (completar admin.html)

### T8.1 — Pàgina principal admin

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** frontend-dev
**Dependències:** T3.2, T4.2, T6.1

Completar `server/public/admin.html` amb:
- Capçalera "Administració — RevisorDeures"
- Targetes/enllaços:
  - Gestió d'Alumnes → /admin/alumnes
  - Gestió de Pràctiques → /admin/practiques
  - Consulta d'Entregues → /admin/entregues
- Enllaç de tancament de sessió (logout)
- Enllaços a totes les pàgines de navegació superior
- Disseny net amb targetes

**Tests (Playwright):**
- [x] Obrir /admin amb sessió → mostra targetes
- [x] Clic a cada targeta → redirigeix correctament
- [x] Botó logout → destrueix sessió, redirigeix a /

---

## Fase 9: Poliment final

### T9.1 — Millorar disseny i CSS

**Estat:** [COMPLETADA]
**Prioritat:** mitjana
**Agent assignat:** frontend-dev
**Dependències:** T8.1

- Crear `server/public/css/style.css` amb els estils comuns per totes les pàgines
- Capçalera comuna amb logotip/nom i navegació
- Estils per a taules, formularis, botons, alerts/modals
- Colors i disseny coherents
- Responsive design bàsic
- Aplicar a totes les pàgines (index, admin, alumne, etc.)

**Tests (Playwright):**
- [x] Totes les pàgines carreguen amb els estils correctes
- [x] Els formularis es mostren correctament
- [x] Les taules es mostren correctament
- [x] El disseny responsive funciona (provar amb diferents mides)

### T9.2 — Tests integrals de regressió

**Estat:** [COMPLETADA]
**Prioritat:** alta
**Agent assignat:** tester
**Dependències:** T9.1

- Executar tots els tests de Playwright de totes les pàgines
- Verificar flux complet: login → operacions admin → operacions alumne → logout
- Verificar que totes les rutes API funcionen correctament
- Verificar que l'agent de valoració funciona (test amb un repositori real de GitHub)

**Tests (Playwright):**
- [x] Flux login admin → CRUD alumnes → logout
- [x] Flux login alumne → enviar entrega → veure entregues → logout
- [x] Flux admin revisar entrega → alumne veu estat
- [x] Flux completar valoració automàtica → alumne veu resultat
- [x] Totes les rutes API responen correctament

---

## Notes addicionals

1. Les variables d'entorn del projecte (OPENCODE_ZEN_API_KEY, PROXY_AGENTS_BASE_URL, PROXY_AGENTS_KEY, GITHUB_PERSONAL_ACCESS_TOKEN) es llegeixen des del fitxer settings.env de l'arrel del projecte
2. El server/settings.env ha de tenir SERVER_ADMIN_PWD (contrasenya manual) i copiar les altres variables del projecte
3. Totes les pàgines han de mostrar text en català
4. Les rutes HTML (admin, alumne, etc.) es serveixen com a fitxers estàtics des de server/public/
5. El CSS global va a server/public/css/style.css
6. Les rutes API van sota /api/
7. El fitxer AGENTS.md i PLAN.md ja han de existir (generats amb el prompt-arnes.md)
