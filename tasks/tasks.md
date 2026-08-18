# Tasques — RevisorDeures

## Regles de seguiment

Aquest fitxer conté totes les tasques per implementar el projecte RevisorDeures.

- Seguir l'ordre d'execució indicat per la numeració (T001 → T0XX).
- Executar cada tasca de manera individual. No començar la següent fins que l'anterior estigui `[done]`.
- Una tasca amb estat `[in-progress]` es pot tornar a `[pending]` si cal reiniciar.
- Si una tasca no es pot completar per una raó externa, posar `[blocked]` amb el motiu.
- Després de completar la implementació i els tests d'una tasca, canviar l'estat a `[done]`.
- No renumerar mai els IDs de tasca.
- Les tasques de UI/HTML es poden fer quan el backend que les consumeix ja estigui `[done]` (segons dependències).

## Tests

Cada tasca funcional inclou:

- **Tests de validació**: tests nous o específics que verifiquen la funcionalitat d'aquesta tasca.
- **Tests de regressió**: tests de tasques anteriors que cal tornar a executar per confirmar que no s'han trencat.

Quan una tasca modifica codi compartit (db.js, middleware, servidor), els tests de regressió incloguen totes les suites anteriors.

---

## Fase 1: Infraestructura base

### [done] T001 — Inicialitzar `package.json` del servidor

**Objectiu**
Crear `server/package.json` amb dependències de producció.

**Depèn de**
cap

**Abast**
- Crear `server/package.json` amb:
  - `express` (producció)
  - `express-session` (producció)
  - `cookie-parser` (producció)
  - `better-sqlite3` (producció)
  - `cors` (producció, opcional)
  - No incloure devDependencies encara

**Criteris de finalització**
- `server/package.json` existeix amb les dependències de producció indicades

**Tests de validació**
- `node -e "JSON.parse(require('fs').readFileSync('server/package.json'))"` no genera error
- `dependencies` conté almenys `express`, `express-session`, `cookie-parser`, `better-sqlite3`

**Tests de regressió**
cap

---

### [done] T002 — Instal·lar dependències de producció

**Objectiu**
Instal·lar les dependències definides a T001.

**Depèn de**
T001

**Abast**
- Executar `npm install` al directori `server/`
- Verificar que `server/node_modules/` existeix

**Criteris de finalització**
- `server/node_modules/` existeix
- No hi ha errors en l'instal·lació

**Tests de validació**
- `node -e "require('express')"` no genera error
- `node -e "require('express-session')"` no genera error
- `node -e "require('cookie-parser')"` no genera error
- `node -e "require('better-sqlite3')"` no genera error

**Tests de regressió**
T001

---

### [done] T003 — Crear `settings.env` al servidor

**Objectiu**
Definir `server/settings.env` amb les variables necessàries.

**Depèn de**
cap

**Abast**
- Crear `server/settings.env` amb:
  - `ADMIN_USER=admin`
  - `ADMIN_PASSWORD=change_me_in_production`
  - `SESSION_SECRET=random_secret_for_production_change_me`
  - `PORT=3000`

**Criteris de finalització**
- `server/settings.env` existeix amb les 4 variables indicades

**Tests de validació**
- `grep "ADMIN_USER=admin" server/settings.env` retorna match
- `grep "ADMIN_PASSWORD=change_me_in_production" server/settings.env` retorna match
- `grep "SESSION_SECRET=random_secret_for_production_change_me" server/settings.env` retorna match
- `grep "PORT=3000" server/settings.env` retorna match

**Tests de regressió**
cap

---

### [done] T004 — Crear `.gitignore` per al projecte

**Objectiu**
Assegurar que fitxers sensibles no van al version control.

**Depèn de**
cap

**Abast**
- Crear/modificar `.gitignore` al projecte arrel
- Incloure:
  - `server/settings.env`
  - `server/*.db`
  - `*.db`
  - `node_modules/`

**Criteris de finalització**
- `.gitignore` existeix i conté les entrades necessàries

**Tests de validació**
- `grep "server/settings.env" .gitignore` retorna match
- `grep "server/*.db" .gitignore` retorna match

**Tests de regressió**
cap

---

### [pending] T005 — Crear l'estructura de directoris

**Objectiu**
Crear totes les carpetes necessàries sota `server/`.

**Depèn de**
cap

**Abast**
- Crear:
  - `server/lib/`
  - `server/routes/`
  - `server/middleware/`
  - `server/public/`
  - `server/public/admin/`
  - `server/public/student/`
  - `server/tests/`
  - `server/tests/unit/`
  - `server/tests/integration/`
  - `server/tests/web/`
  - `server/tests/helpers/`

**Criteris de finalització**
- Totes les carpetes existents

**Tests de validació**
- `test -d server/lib && test -d server/routes && test -d server/middleware && test -d server/public && test -d server/tests` no retorna error

**Tests de regressió**
cap

---

### [pending] T006 — Instal·lar dependències de test i crear scripts

**Objectiu**
Instal·lar mocha, chai, supertest i puppeteer com a devDependencies.

**Depèn de**
T002

**Abast**
- Afegir a `server/package.json` devDependencies: `mocha`, `chai`, `supertest`, `puppeteer`
- Afegir scripts a `package.json`:
  - `"test": "mocha 'tests/**/*.test.js'"`
  - `"test:unit": "mocha 'tests/unit/*.test.js'"`
  - `"test:integration": "mocha 'tests/integration/*.test.js'"`
  - `"test:web": "mocha 'tests/web/*.test.js'"`
- Executar `npm install` a `server/`

**Criteris de finalització**
- `mocha`, `chai`, `supertest`, `puppeteer` instal·lats a `server/node_modules/`
- Scripts de test existents a `package.json`

**Tests de validació**
- `node -e "require('mocha')"` no genera error
- `node -e "require('chai')"` no genera error
- `node -e "require('supertest')"` no genera error
- `node -e "require('puppeteer')"` no genera error
- `npm run test:unit` no retorna error d'execució (encara sense tests)

**Tests de regressió**
T002

---

## Fase 2: Servidor Express

### [pending] T007 — Crear `server.js` esquelet amb Express

**Objectiu**
Crear el punt d'entrada de l'aplicació Express.

**Depèn de**
T002, T003

**Abast**
- Crear `server/server.js`:
  - Parseig manual de `settings.env` (sense dotenv, només `fs.readFileSync` i parseig lineal)
  - Configurar express amb `express()`
  - Middleware: `express.json()`, `express.urlencoded({ extended: true })`, `express.static('public')`, `express-session()` amb configuració:
    - `secret` des de `SESSION_SECRET` de `settings.env`
    - `resave: false`
    - `saveUninitialized: false`
    - `cookie: { httpOnly: true, sameSite: 'strict', maxAge: 28800000 }`
  - Muntar rutes des de `routes/` (encara no existeixen, només importació)
  - `listen` al PORT de `settings.env`
  - Exportar `app` per tests: `module.exports = app`
  - Endpoint `GET /health` que retorna `{ status: 'ok' }` amb codi 200

**Criteris de finalització**
- `server/server.js` existeix
- Express arrenca sense errors
- L'`app` express s'exporta per `require('./server')`

**Tests de validació**
- `supertest(require('./server')).get('/health').then(res => res.status === 200 && res.body.status === 'ok')` passa

**Tests de regressió**
cap

---

### [pending] T008 — Crear tests bàsics del servidor

**Objectiu**
Crear tests per validar que el servidor arrenca i respon correctament.

**Depèn de**
T007

**Abast**
- Crear `server/tests/unit/server.test.js`:
  - Test que `require('./server')` retorna un objecte express
  - Test `GET /health` → 200 amb `{ status: 'ok' }`
  - Test `GET /` → 200 (serveix fitxers estàtics o respon)

**Criteris de finalització**
- `npm run test:unit` passa

**Tests de validació**
- `npm run test:unit` passa (3 tests passen)

**Tests de regressió**
cap

---

## Fase 3: Base de dades

### [pending] T009 — Crear `db.js` amb connexió SQLite i esquema

**Objectiu**
Inicialitzar SQLite amb les taules alumnes, practiques i entregues.

**Depèn de**
T006, T007

**Abast**
- Crear `server/db.js`:
  - Connexió a SQLite: fitxer `revisordeures.db` o DB a memòria si `USE_MEMORY_DB=1`
  - Crear taules si no existeixen amb les columnes definides a PLAN.md:
    - `alumnes`: id, email UNIQUE, password_hash, name
    - `practiques`: id, titol, criterios, github_url
    - `entregues`: id, alumne_id, practica_id, github_url, accepted, graded DEFAULT 0, grade_summary, reviewed DEFAULT 0, reviewed_at, created_at, updated_at
  - Índex a `entregues(alumne_id)`, `entregues(practica_id)`
  - Constraint UNIQUE a `entregues(alumne_id, practica_id)`
  - Exportar la connexió
  - Exportar funcions SQL per entitat:
    - `alumnes.findAll()`, `alumnes.findById()`, `alumnes.create(data)`, `alumnes.update(id, data)`, `alumnes.delete(id)`
    - `practiques.findAll()`, `practiques.findById()`, `practiques.create(data)`, `practiques.update(id, data)`, `practiques.delete(id)`
    - `entregues.findAll(filter?)`, `entregues.findById()`, `entregues.create(data)`, `entregues.update(id, data)`, `entregues.delete(id)`
  - Les funcions que modifiquen (update/delete/create) han de retornar `true` o llançar error

**Criteris de finalització**
- `server/db.js` existeix
- Taules creats correctament
- Funcions CRUD exportades per entitat
- Funciona amb DB a memòria quan `USE_MEMORY_DB=1`

**Tests de validació**
- `USE_MEMORY_DB=1 node -e "const db = require('./server/db'); db.alumnes.create({email:'t@t.com', password_hash:'h', name:'T'})"` passa sense error

**Tests de regressió**
cap

---

### [pending] T010 — Connexió de `db.js` a `server.js`

**Objectiu**
Assegurar que `server.js` inicialitza la base de dades en arrencar.

**Depèn de**
T009

**Abast**
- A `server/server.js`, importar db.js i cridar inicialització al iniciar
- Comprovar que la connexió funciona en arrencar (loggejat o error)
- Verificar que `GET /health` respon correctament amb DB disponible

**Criteris de finalització**
- Servidor arrenca sense errors de DB
- `GET /health` respon `{ status: 'ok' }` amb 200

**Tests de validació**
- `supertest(require('./server')).get('/health').then(res => res.status === 200 && res.body.status === 'ok')` passa

**Tests de regressió**
T008

---

### [pending] T011 — Crear tests unitaris de db.js

**Objectiu**
Tests unitaris per validar totes les funcions CRUD de db.js.

**Depèn de**
T009, T010

**Abast**
- Crear `server/tests/unit/db.test.js` amb tests per:
  - `alumnes.findAll()` → array buit inicialment
  - `alumnes.create()` → inserta i retorna ID
  - `alumnes.findById()` → retorna alumne correcte o undefined
  - `alumnes.update()` → actualitza camps
  - `alumnes.delete()` → esborra alumne
  - `practiques` CRUD equivalent
  - `entregues` CRUD equivalent
  - Tots amb `USE_MEMORY_DB=1`

**Criteris de finalització**
- `npm run test:unit` passa

**Tests de validació**
- `npm run test:unit` passa (totes les proves CRUD passen)

**Tests de regressió**
T008, T010

---

## Fase 4: Hash de contrasenyes

### [pending] T012 — Crear `lib/hash.js` amb MD5

**Objectiu**
Crear el mòdul d'encapsulament de hash MD5 per contrasenyes.

**Depèn de**
cap

**Abast**
- Crear `server/lib/hash.js`:
  - Exportar `hashPassword(password)` que retorna MD5 hash (32 caràcters hex)
  - Exportar `comparePassword(password, hash)` que retorna `true` si `hashPassword(password) === hash`
  - Utilitzar `crypto.createHash('md5')`

**Criteris de finalització**
- `hashPassword('test')` retorna un hash de 32 caràcters hex
- `comparePassword('test', hashPassword('test'))` retorna `true`
- `comparePassword('wrong', hashPassword('test'))` retorna `false`

**Tests de validació**
- `node -e "const {hashPassword, comparePassword} = require('./server/lib/hash'); assert(comparePassword('test', hashPassword('test')) === true); assert(comparePassword('wrong', hashPassword('test')) === false)"` passa

**Tests de regressió**
cap

---

### [pending] T013 — Crear tests unitaris de hash.js

**Objectiu**
Tests unitaris per a `lib/hash.js`.

**Depèn de**
T012

**Abast**
- Crear `server/tests/unit/hash.test.js`:
  - Test `hashPassword` retorna string de 32 caràcters
  - Test `comparePassword` amb password correcte → `true`
  - Test `comparePassword` amb password incorrecte → `false`
  - Test `hashPassword` amb passwords buits o llargs
  - Test consistència: mateix password sempre mateix hash

**Criteris de finalització**
- `npm run test:unit` passa

**Tests de validació**
- `npm run test:unit` passa (5 tests de hash)

**Tests de regressió**
T008

---

## Fase 5: Middleware d'autorització

### [pending] T014 — Crear `middleware/auth.js`

**Objectiu**
Crear els middlewares d'autorització per admin i alumne.

**Depèn de**
T007, T012

**Abast**
- Crear `server/middleware/auth.js`:
  - `requireAdmin(req, res, next)`:
    - Comprova `req.session.admin === true`
    - Si no, respon 403 JSON `{ error: 'No autoritzat' }` i retorna
    - Si sí, crida `next()`
  - `requireStudent(req, res, next)`:
    - Comprova `req.session.studentId` existeix
    - Si no, respon 403 JSON `{ error: 'No autoritzat' }` i retorna
    - Si sí, crida `next()`
  - `authorizeStudent(studentId)`:
    - Middleware factory
    - Comprova `req.session.studentId === studentId`
    - Si no, respon 403 JSON `{ error: 'No autoritzat' }`
    - Si sí, crida `next()`

**Criteris de finalització**
- Els tres middlewares existents i exportats
- `requireAdmin` rebutja si no hi ha sessió admin activada
- `requireStudent` rebutja si no hi ha sessió alumne activada
- `authorizeStudent` rebutja si l'ID no coincideix

**Tests de validació**
- `node -e "const {requireAdmin} = require('./server/middleware/auth'); assert(typeof requireAdmin === 'function')"` passa

**Tests de regressió**
cap

---

### [pending] T015 — Crear tests unitaris del middleware auth

**Objectiu**
Tests unitaris per `middleware/auth.js`.

**Depèn de**
T014

**Abast**
- Crear `server/tests/unit/middleware.test.js`:
  - Test `requireAdmin` amb sessió admin → crida `next()`
  - Test `requireAdmin` sense sessió admin → respon 403
  - Test `requireStudent` amb sessió studentId → crida `next()`
  - Test `requireStudent` sense sessió → respon 403
  - Test `authorizeStudent(1)` amb ID correcte → crida `next()`
  - Test `authorizeStudent(1)` amb ID incorrecte → respon 403
  - Utilitzar `supertest` per mock de peticions HTTP

**Criteris de finalització**
- `npm run test:unit` passa

**Tests de validació**
- `npm run test:unit` passa (6 tests de middleware)

**Tests de regressió**
T008

---

## Fase 6: Autenticació Admin

### [pending] T016 — Rutes admin login i logout

**Objectiu**
Implementar login i logout d'administrador.

**Depèn de**
T006, T007, T012, T014

**Abast**
- Crear `server/routes/auth.js`:
  - `POST /api/auth/admin/login`:
    - Reb `{ username, password }` JSON
    - Comprova `username === ADMIN_USER` de `settings.env`
    - Comprova `password === ADMIN_PASSWORD` de `settings.env`
    - Si correcte: `req.session.admin = true`, `req.session.save()` → `res.json({ ok: true, redirect: '/admin' })`
    - Si incorrecte: respon 401 JSON `{ error: 'Credencials incorrectes' }`
  - `POST /api/auth/admin/logout`:
    - Protegit amb `requireAdmin`
    - `req.session.destroy()` → `res.json({ ok: true, redirect: '/' })`
    - Tractar error si session ja destruïda

**Criteris de finalització**
- Login amb credencials correctes → 200, sessió admin activada
- Login amb credencials incorrectes → 401
- Logout amb sessió activa → 200, sessió destruïda
- Logout sense sessió → error no es produeix

**Tests de validació**
- `supertest(app).post('/api/auth/admin/login').send({username:'admin', password:'wrong'}).expect(401)`
- `supertest(app).post('/api/auth/admin/login').send({username:'admin', password:'change_me_in_production'}).expect(200).body.ok`
- `supertest(app).post('/api/auth/admin/logout').set('Cookie', sessionCookie).expect(200).body.ok`

**Tests de regressió**
T011, T015

---

### [pending] T017 — Protegir rutes admin amb requireAdmin

**Objectiu**
Assegurar que rutes protegides requereixen sessió admin.

**Depèn de**
T016

**Abast**
- Comprovar que totes les rutes que requereixen admin utilitzen `requireAdmin`
- Crear un endpoint de prova `GET /api/admin/protected` protegit amb `requireAdmin`
- Test que sense sessió → 403
- Test que amb sessió admin → 200

**Criteris de finalització**
- Rutes protegides amb requireAdmin responen 403 sense sessió
- Rutes protegides responen 200 amb sessió admin

**Tests de validació**
- `supertest(app).get('/api/admin/protected').expect(403)` (sense sessió)
- `supertest(app).get('/api/admin/protected').set('Cookie', sessionCookie).expect(200)` (amb sessió)

**Tests de regressió**
T016

---

## Fase 7: Autenticació Alumne

### [pending] T018 — Rutes student login i logout

**Objectiu**
Implementar login i logout d'alumne amb hash MD5.

**Depèn de**
T006, T007, T012, T014, T016

**Abast**
- A `server/routes/auth.js`:
  - `POST /api/auth/student/login`:
    - Reb `{ email, password }` JSON
    - Valida format email (regex bàsic) → 400 si no vàlid
    - Busca alumne per email a DB: `db.alumnes.findAll()` amb `WHERE email = ?`
    - Si no trobat: respon 401 JSON `{ error: 'Credencials incorrectes' }`
    - Si trobat: `comparePassword(password, alumne.password_hash)`
    - Si correcte: `req.session.studentId = alumne.id`, `req.session.studentName = alumne.name`, `req.session.save()` → respon 200 JSON `{ ok: true, redirect: '/student' }`
    - Si incorrecte: respon 401 JSON
  - `POST /api/auth/student/logout`:
    - Protegit amb `requireStudent`
    - `req.session.destroy()` → respon 200 JSON

**Criteris de finalització**
- Login amb credencials correctes → 200, sessió activada amb studentId i studentName
- Login amb credencials incorrectes → 401
- Email mal formatat → 400

**Tests de validació**
- Crear alumne a DB amb hash MD5, login amb password correcte → 200, sessió mantinguda
- Login amb password incorrecte → 401
- Email mal formatat → 400

**Tests de regressió**
T016

---

### [pending] T019 — Rute student register

**Objectiu**
Implementar registre d'alumne.

**Depèn de**
T006, T012, T014, T016, T018

**Abast**
- A `server/routes/auth.js`:
  - `POST /api/auth/student/register`:
    - Reb `{ email, password, name }` JSON
    - Valida email format → 400 si no vàlid
    - Valida name no buit → 400 si buit
    - Valida password no buit → 400 si buit
    - Comprova que email no existeix a DB (unicitat) → 409 si duplicat
    - Hash password amb `lib/hash.js`
    - Inserta a DB: `db.alumnes.create({ email, password_hash, name })`
    - Respon 201 JSON `{ ok: true }`

**Criteris de finalització**
- Registre amb dades correctes → 201, alumne creat a DB
- Email duplicat → 409
- Camps buits → 400

**Tests de validació**
- `supertest(app).post('/api/auth/student/register').send({email:'new@test.com', password:'pass', name:'New'}).expect(201)`
- `supertest(app).post('/api/auth/student/register').send({email:'new@test.com', password:'pass', name:'New'}).expect(409)` (duplicat)
- `supertest(app).post('/api/auth/student/register').send({email:'invalid', password:'pass', name:'New'}).expect(400)` (email invàlid)
- `supertest(app).post('/api/auth/student/register').send({email:'a@b.com', password:'', name:'New'}).expect(400)` (password buit)

**Tests de regressió**
T018

---

### [pending] T020 — Tests d'integració d'autenticació

**Objectiu**
Tests d'integració per a totes les rutes d'autenticació.

**Depèn de**
T016, T018, T019

**Abast**
- Crear `server/tests/integration/auth.test.js`:
  - Test login admin + sessió mantinguda en peticions posteriors
  - Test logout admin + sessió destruïda
  - Test login alumne (crear alumne amb hash) + sessió mantinguda
  - Test logout alumne + sessió destruïda
  - Test registre alumne + immediatament poder fer login amb el mateix
  - Test que rutes admin no accessibles sense sessió
  - Test que rutes student no accessibles sense sessió

**Criteris de finalització**
- `npm run test:integration` passa

**Tests de validació**
- `npm run test:integration` (suite auth.test.js) passa

**Tests de regressió**
T017, T019

---

## Fase 8: Admin — Alumnes CRUD

### [pending] T021 — Rutes CRUD alumnes (backend)

**Objectiu**
Implementar rutes CRUD per alumnes amb autorització admin.

**Depèn de**
T006, T014, T012

**Abast**
- Crear `server/routes/admin.js`:
  - `GET /api/admin/alumnes` (requireAdmin):
    - Retorna array alumnes sense `password_hash`
    - Respon 200 JSON amb array d'objectes `{ id, email, name }`
  - `POST /api/admin/alumnes` (requireAdmin):
    - Reb `{ email, password, name }` JSON
    - Valida email format → 400 si no vàlid
    - Valida name no buit → 400 si buit
    - Valida password no buit → 400 si buit
    - Comprova email no duplicat → 409 si duplicat
    - Hash password amb `lib/hash.js`
    - Inserta a DB, respon 201 JSON `{ ok: true, id }`
  - `PUT /api/admin/alumnes/:id` (requireAdmin):
    - Reb `{ name?, email?, password? }` JSON
    - Valida camps proporcionats
    - Si hi ha password → hash amb `lib/hash.js`
    - Actualitza a DB, respon 200 JSON `{ ok: true }`
    - Si alumne no trobat → 404
  - `DELETE /api/admin/alumnes/:id` (requireAdmin):
    - Esborra alumne per ID
    - Respon 200 JSON `{ ok: true }`
    - Si no trobat → 404

**Criteris de finalització**
- Llistar alumnes retorna noms sense hash
- Crear alumne fa hash del password
- Editar alumne funciona (camps opcionals)
- Esborrar alumne funciona
- Sense sessió admin → 403 a totes les rutes
- Dades invalides → errors 400/404/409

**Tests de validació**
- `supertest(app).get('/api/admin/alumnes').expect(200).then(res => Array.isArray(res.body))`
- `supertest(app).post('/api/admin/alumnes').send({email:'a@b.com', password:'p', name:'A'}).expect(201)`
- `supertest(app).put('/api/admin/alumnes/1').send({name:'B'}).expect(200)`
- `supertest(app).delete('/api/admin/alumnes/1').expect(200)`
- `supertest(app).get('/api/admin/alumnes').expect(403)` (sense sessió)

**Tests de regressió**
T020

---

### [pending] T022 — Tests d'integració admin alumnes

**Objectiu**
Tests d'integració per a les rutes d'admin alumnes.

**Depèn de**
T021

**Abast**
- Crear `server/tests/integration/admin.test.js`:
  - Test login admin abans de cada operació
  - Test llistar alumnes buit → array
  - Test crear alumne → verifica 201 i alumne a DB
  - Test editar alumne → verifica actualització
  - Test esborrar alumne → verifica 404 després
  - Test accés sense sessió → 403 a totes les rutes
  - Test camps obligatoris → 400 si falta
  - Test email duplicat → 409

**Criteris de finalització**
- `npm run test:integration` (admin.test.js) passa

**Tests de validació**
- `npm run test:integration` passa

**Tests de regressió**
T020

---

### [pending] T023 — UI llista alumnes admin

**Objectiu**
Crear la vista HTML per llistar alumnes a l'admin.

**Depèn de**
T021

**Abast**
- Crear `server/public/admin/alumnes.html`:
  - HTML bàsic amb Express serveint fitxers estàtics
  - JavaScript que crida `GET /api/admin/alumnes` → llista alumnes
  - Formulari per crear alumne (email, password, name) amb botó "Crear"
  - Botó "Editar" per cada alumne
  - Botó "Esborrar" per cada alumne
  - Botó "Veure entregues" → link a `admin/entregues_alumne.html?alumne_id=<id>`
  - CSS bàsic net i llegible

**Criteris de finalització**
- Pàgina accessible a `/admin/alumnes.html`
- Mostra llista d'alumnes (noms + emails)
- Formulari de creació crida API correcta
- Botons d'editar/esborrar/veure entregues funcionals

**Tests de validació**
- `supertest(app).get('/admin/alumnes.html').expect(200)`
- Puppeteer: obrir /admin/alumnes.html → veure títol o estructura bàsica

**Tests de regressió**
T022

---

### [pending] T024 — Test web Puppeteer: crear alumne

**Objectiu**
Test E2E per crear un alumne des de l'admin amb Puppeteer.

**Depèn de**
T023, T021

**Abast**
- Crear `server/tests/web/create-student.test.js`:
  - Helper: setup server amb DB memòria, login admin automàtic
  - Obrir /admin/alumnes.html
  - Omplir formulari de creació amb dades vàlides
  - Clicar "Crear"
  - Verificar que l'alumne apareix a la llista
  - Neteguar (esborrar alumne creat)

**Criteris de finalització**
- `npm run test:web` (suite create-student) passa

**Tests de validació**
- `npm run test:web` passa

**Tests de regressió**
T023, T022

---

## Fase 9: Admin — Pràctiques CRUD

### [pending] T025 — Rutes CRUD pràctiques admin (backend)

**Objectiu**
Implementar rutes CRUD per pràctiques amb autorització admin.

**Depèn de**
T021

**Abast**
- A `server/routes/admin.js` (continuar):
  - `GET /api/admin/practiques` (requireAdmin):
    - Retorna array pràctiques → 200 JSON
  - `POST /api/admin/practiques` (requireAdmin):
    - Reb `{ titol, criterios, github_url }` JSON
    - Valida titol no buit → 400
    - Valida criterios no buit → 400
    - Valida github_url comença per `https://github.com/` → 400 si no
    - Inserta a DB, respon 201 JSON
  - `PUT /api/admin/practiques/:id` (requireAdmin):
    - Reb camps opcionals `{ titol?, criterios?, github_url? }`
    - Valida github_url si proporcionat → 400 si no vàlida
    - Actualitza a DB, respon 200 JSON
    - Si no trobat → 404
  - `DELETE /api/admin/practiques/:id` (requireAdmin):
    - Esborra pràctica, respon 200 JSON
    - Si no trobat → 404

**Criteris de finalització**
- CRUD de pràctiques funciona amb requireAdmin
- URL de GitHub.
---

## Fase 15: Vistes Alumne (cont.)

### [pending] T050 — UI detall entrega (alumne)

**Objectiu**
Crear la vista HTML per veure el detall d'una entrega des de l'alumne.

**Depèn de**
T030, T041

**Abast**
- Crear `server/public/student/detall_entrega.html`:
  - HTML bàsic
  - JavaScript que rep `?id=<id>` de la URL
  - Crada `GET /api/student/entregues` → obté entrega (o crida endpoint específic)
  - Mostra: practica, URL, accepted (sí/no), reviewed (sí/no), timestamp, summary
  - Si no revisada → mostra botó "Esborrar" i "Editar URL"
  - CSS bàsic

**Criteris de finalització**
- Pàgina accessible a `/student/detall_entrega.html?id=1`
- Mostra informació completa de l'entrega

**Tests de validació**
- `supertest(app).get('/student/detall_entrega.html?id=1').expect(200)`
- Puppeteer: obrir /student/detall_entrega.html?id=1 → veure informació

**Tests de regressió**
cap

---

### [pending] T051 — UI llista alumnes admin

**Objectiu**
Crear la vista HTML per l'alistat d'alumnes a l'admin.

**Depèn de**
T025

**Abast**
- Crear `server/public/admin/alumnes.html`:
  - HTML bàsic amb Express servint fitxers estàtics
  - JavaScript que crada `GET /api/admin/alumnes` → llista alumnes
  - Botó "Veure entregues" → link a `entregues_alumne.html?alumne_id=<id>`
  - CSS bàsic net i llegible

**Criteris de finalització**
- Pàgina accessible a `/admin/alumnes.html`
- Mostra llista d'alumnes (noms + compte d'entregues)
- Enllaços per veure entregues d'un alumne

**Tests de validació**
- `supertest(app).get('/admin/alumnes.html').expect(200)`
- Puppeteer: obrir /admin/alumnes.html → veure títol o estructura bàsica

**Tests de regressió**
T027

---

### [pending] T052 — UI llistat pràctiques (alumne)

**Objectiu**
Crear la vista HTML per l'alistat de pràctiques a l'alumne.

**Depèn de**
T025, T030

**Abast**
- Crear `server/public/student/practiques.html`:
  - HTML bàsic
  - JavaScript que crada `GET /api/admin/practiques` → llista pràctiques
  - Per cada pràctica, mostra: títol, lliurament, estat (enviada/no enviada)
  - Envia a `enviar.html?practica_id=<id>` per a pràctiques no enviades
  - CSS bàsic

**Criteris de finalització**
- Pàgina accessible a `/student/practiques.html`
- Mostra llista de pràctiques amb estat de entrega

**Tests de validació**
- `supertest(app).get('/student/practiques.html').expect(200)`

**Tests de regressió**
cap

---

## Fase 16: Pàgina pública de pràctiques

### [pending] T053 — UI pràctiques públiques

**Objectiu**
Crear la vista HTML pública per veure les pràctiques.

**Depèn de**
T025

**Abast**
- Crear `server/public/practiques.html`:
  - HTML bàsic
  - JavaScript que crada `GET /api/practiques` → llista pràctiques
  - Mostra títol, descripció, criterios, fecha límit, URL GitHub
  - CSS bàsic

**Criteris de finalització**
- Pàgina accessible a `/practiques.html` sense autenticació
- Mostra llista de pràctiques amb informació completa

**Tests de validació**
- `supertest(app).get('/practiques.html').expect(200)`

**Tests de regressió**
cap

---

## Fase 17: Integració Express i servei d'arxius estàtics

### [pending] T054 — Configuració Express complet

**Objectiu**
Configurar Express per servir tots els recursos estàtics i rutes API.

**Depèn de**
T025, T030

**Abast**
- A `server/index.js` (o `server/app.js`):
  - Configurar express.static per `server/public/`
  - Configurar express.static per `node_modules/` (per puppeteer)
  - Configurar middleware de sessions
  - Registrar rutes: `/api/admin`, `/api/student`, `/api/practiques`
  - Punt d'entrada: `app.listen(PORT, ...)`
  - Configurar `.env` per PORT (def. 3000)

**Criteris de finalització**
- `npm start` inicia el servidor correctament
- Fitxers estàtics servits des de `/` (admin, student, practiques.html)
- Rutes API funcionals

**Tests de validació**
- `supertest(app).get('/admin/practiques.html').expect(200)`
- `supertest(app).get('/api/admin/practiques').expect(401)` (abans del login)

**Tests de regressió**
cap

---

### [pending] T055 — Tests d'integració flux complet

**Objectiu**
Tests E2E que cobreixen el flux complet de l'aplicació.

**Depèn de**
T054

**Abast**
- Crear `server/tests/integration/flow.test.js`:
  - Test 1: Crear alumne com a admin → login alumne → enviar entrega → tancar sessió → verificar sessió tancada
  - Test 2: Admin valora entrega amb mock → verificar accepted a DB
  - Test 3: Alumne veu resultat de valoració a detall d'entrega

**Criteris de finalització**
- `npm run test:integration` (flow.test.js) passa

**Tests de validació**
- `npm run test:integration` passa

**Tests de regressió**
T054

---

### [pending] T056 — Test web Puppeteer: enviar entrega

**Objectiu**
Test E2E Puppeteer per enviar una entrega des de la UI de l'alumne.

**Depèn de**
T049, T027

**Abast**
- Crear `server/tests/web/send-delivery.test.js`:
  - Helper: setup server amb DB memòria, login alumne automàtic
  - Obrir /student/enviar.html
  - Seleccionar pràctica del select
  - Omplir URL de GitHub
  - Clicar "Enviar"
  - Redirigeix a /student/entregues.html
  - Verificar que l'entrega apareix a la llista
  - Neteguar (esborrar entrega creada)

**Criteris de finalització**
- `npm run test:web` (suite send-delivery) passa

**Tests de validació**
- `npm run test:web` passa

**Tests de regressió**
T049, T028

---

## Fase 18: Millores UX i validacions

### [pending] T057 — Millora CSS/HTML UIs

**Objectiu**
Millorar la presentació de totes les vistes HTML.

**Depèn de**
T054, T047, T043

**Abast**
- Millorar CSS de:
  - `admin/practiques.html`
  - `admin/alumnes.html`
  - `admin/entregues.html`
  - `admin/entregues_alumne.html`
  - `admin/entregues_practica.html`
  - `admin/detall_entrega.html`
  - `student/index.html`
  - `student/entregues.html`
  - `student/enviar.html`
  - `student/detall_entrega.html`
  - `practiques.html`
- Disseny net, llegible, responsive bàsic
- Colors consistent amb "Revisor Deures"

**Criteris de finalització**
- Totes les vistes tenen CSS millorat
- Disseny coherent entre totes les pàgines

**Tests de validació**
- Puppeteer: verificar que totes les pàgines carreguen sense errors
- Verificar que no hi ha errors de CSS a la consola del navegador

**Tests de regressió**
T054

---

### [pending] T058 — Validacions frontend

**Objectiu**
Afegir validacions de formulari al frontend.

**Depèn de**
T057

**Abast**
- A cada formulari HTML:
  - Validar camps obligatoris (required attributes)
  - Validar format URL de GitHub (pattern o JS)
  - Validar camps numèrics (practica_id)
  - Mostrar missatges d'error visuals
  - Desactivar botons mentre s'està cridant l'API

**Criteris de finalització**
- Formularis amb validació visual
- Missatges d'error clars

**Tests de validació**
- Puppeteer: intentar crear pràctica amb camps buits → error mostrat
- Puppeteer: intentar crear amb URL no vàlida → error mostrat

**Tests de regressió**
T057

---

### [pending] T059 — Maneig d'errors al frontend

**Objectiu**
Gestionar errors de l'API al frontend amb missatges clars.

**Depèn de**
T058

**Abast**
- A totes les vistes HTML:
  - Si API retorna 401/403 → redirigeix a login
  - Si API retorna 400 → mostra missatge d'error del camp
  - Si API retorna 409 → mostra missatge de duplicat
  - Si API retorna 500 → mostra missatge genèric d'error
  - Loading states (spinners o desactivar botons)

**Criteris de finalització**
- Errors d'API es mostren al frontend correctament
- Redireccions automàtiques per errors d'autenticació

**Tests de validació**
- Puppeteer: simular error 401 de l'API → redirigeix a /
- Puppeteer: simular error 400 de l'API → mostra missatge d'error

**Tests de regressió**
T058

---

## Fase 19: Deploy i documentació

### [pending] T060 — Fitxers de deploy

**Objectiu**
Crear fitxers de deploy per a production.

**Depèn de**
cap

**Abast**
- Crear `Procfile` per Heroku/Render:
  - `web: node server/index.js`
- Crear `Dockerfile` bàsic:
  - Node 20 base image
  - Copy project files
  - `npm ci`
  - `CMD ["node", "server/index.js"]`
- Crear `.dockerignore`:
  - `node_modules/`
  - `.git/`
  - `*.test.js`
- Afegir `PORT` a `.env` o `settings.env`

**Criteris de finalització**
- `Procfile` existeix amb contingut correcte
- `Dockerfile` existeix amb contingut correcte
- `.dockerignore` existeix

**Tests de validació**
- `grep -q "node server/index.js" Procfile` retorna 0
- `grep -q "FROM node" Dockerfile` retorna 0
- `test -f .dockerignore` retorna 0

**Tests de regressió**
cap

---

## Resum del nombre de tasques

| Fase | Tasques | Total |
|------|---------|-------|
| Fase 0 | Infraestructura bàsica | T001–T006 (6) |
| Fase 1 | DB SQLite | T007–T010 (4) |
| Fase 2 | Tests bàsics | T011–T015 (5) |
| Fase 3 | Admin: Creació d'alumnes | T016–T021 (6) |
| Fase 4 | Tests integració alumnes | T022–T023 (2) |
| Fase 5 | UI alumnes | T024 (1) |
| Fase 6 | Pràctiques CRUD admin | T025 (1) |
| Fase 7 | Tests integració pràctiques | T026 (1) |
| Fase 8 | UI pràctiques admin | T027–T028 (2) |
| Fase 9 | Entregues model/consultes | T029–T031 (3) |
| Fase 10 | OpenCode grader instruccions | T032–T033 (2) |
| Fase 11 | OpenCode adapter Node.js | T034–T038 (5) |
| Fase 12 | OpenCode grader ruta | T039–T042 (4) |
| Fase 13 | Vistes d'entregues admin | T043–T046 (4) |
| Fase 14 | Vistes alumne | T047–T050 (4) |
| Fase 15 | Vistes Alumne (cont.) | T051–T052 (2) |
| Fase 16 | Pàgina pública | T053 (1) |
| Fase 17 | Integració Express | T054–T056 (3) |
| Fase 18 | Millores UX | T057–T059 (3) |
| Fase 19 | Deploy | T060 (1) |
| **Total** | | **60 tasques** |
