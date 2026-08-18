# Prompt: Executar el bucle agèntic d'implementació

Aquest prompt defineix el bucle d'implementació que desenvoluparà l'aplicació RevisorDeures a partir de les tasques definides a `tasks/tasks.md`.

## Instruccions generals

Executa el següent bucle fins que totes les tasques de totes les fases estiguin `COMPLETADA`:

---

## Configuració inicial (només una vegada)

1. Verifica que existeixen els fitxers generats pel prompt-arnes.md:
   - `.opencode/skills/` (web-dev.md, frontend.md, auth.md, ai-agent.md, tests.md)
   - `.opencode/agents/` (coordinator.md, backend-dev.md, frontend-dev.md, tester.md, ai-reviewer.md)
   - `PLAN.md`
   - `AGENTS.md`

2. Assegura't que Node.js i npm estan instal·lats:
   ```bash
   node --version
   npm --version
   ```

3. Inicia el bucle d'implementació (veure bucle principal a sota)

---

## Bucle principal d'implementació

Per a cada fase, en ordre (0, 1, 2, 3, 4, 5, 6, 7, 8, 9):

### Pas 1: Seleccionar la fase actual

- Llegeix les tasques de la fase actual a `tasks/tasks.md`
- Filtra les tasques amb estat `[PENDENT]`
- Si no hi ha tasques pendents a la fase actual, passa a la següent fase
- Si totes les fases estan completades, acaba el bucle

### Pas 2: Seleccionar la següent tasca

- Dins de la fase actual, selecciona la següent tasca pendent que compleixi:
  - Totes les seves dependències estan `COMPLETADA`
  - És la primera tasca pendent en ordre de número
- Marca la tasca com `[IMPLEMENTANT]` a `tasks/tasks.md`

### Pas 3: Assignar l'agent i implementar

- Llegeix l'agent assignat a la tasca (a `tasks/tasks.md`)
- Assigna la tasca a l'agent corresponent:
  - `coordinator` → tu mateix (el coordinator)
  - `backend-dev` → implementa el backend
  - `frontend-dev` → implementa el frontend
  - `ai-reviewer` → implementa l'agent de valoració
- Executa la tasca segons la descripció:
  - Crea/modifica els fitxers necessaris
  - Segueix les convencions de les skills
  - Segueix l'estructura definida a `server/`

### Pas 4: Executar tests específics

- Llista els tests de la tasca (a `tasks/tasks.md`, sota "Tests:")
- Executa cada test indicat:
  - Per a tests de backend: utilitza `node`, `curl`, `sqlite3`
  - Per a tests d'interfície: utilitza l'MCP Playwright
- Si algun test falla:
  - Corregeix l'error
  - Torna a executar el test
  - No continuis fins que tot passi

### Pas 5: Marcar com revisant

- Marca la tasca com `[REVISANT]` a `tasks/tasks.md`
- Revisa el codi generat:
  - Segueix les convencions de les skills
  - Verifica que el codi és net i mantenable
  - Verifica que no hi ha codi mort
  - Verifica que els noms de variables són clars
  - Verifica que no hi ha secrets als fitxers (només a settings.env)
  - Verifica que les rutes API tenen el prefix correcte
  - Verifica que les rutes HTML estan a server/public/
  - Verifica que els errors es gestionen correctament

### Pas 6: Tornar a executar tests

- Torna a executar tots els tests de la tasca
- Si algun falla:
  - Corregeix i torna a provar
  - No avancis fins que tot passi correctament

### Pas 7: Marcar com completada

- Si tots els tests passen i la revisió és correcta:
  - Marca la tasca com `[COMPLETADA]` a `tasks/tasks.md`
  - Continua amb la següent tasca

### Pas 8: Verificació de fase

- Quan totes les tasques de la fase estan `[COMPLETADA]`:
  - Executa els tests de regressió acumulats de totes les fases anteriors
  - Executa els tests de Playwright de totes les pàgines implementades fins ara
  - Si algun test falla:
    - Corregeix els errors
    - Torna a executar tots els tests de regressió
    - No avancis fins que tot passi
  - Si tots els tests passen:
    - Fer un commit de fita amb el MCP de GitHub:
      ```bash
      git add .
      git commit -m "Fase {fase}: {descripció breu}"
      ```
    - Passa a la següent fase

### Pas 9: Repetir

- Torna al Pas 2 i continua amb la següent fase

---

## Detalls del bucle agèntic

### Regles de seguretat

- No mostrar mai el token GITHUB_PERSONAL_ACCESS_TOKEN ni SERVER_ADMIN_PWD als logs
- No afegir secrets als fitxers de codi
- Utilitza sempre variables d'entorn per als secrets
- Els fitxers de configuració (settings.env) han d'estar a .gitignore

### Regles de tests

- Cada test s'ha d'executar abans de marcar una tasca com a revisant
- Els tests de regressió s'executen abans de passar a la següent fase
- Si un test de regressió falla, corregeix immediatament i no avancis
- Els tests de Playwright han de verificar el comportament real de les pàgines

### Regles de codi

- Segueix les convencions de les skills carregades
- No utilitzis frameworks JavaScript (vanilla JS només)
- Les rutes API van sota `/api/`
- Les pàgines HTML estan a `server/public/`
- El CSS global va a `server/public/css/style.css`
- L'estructura del backend:
  - `server/index.js` — punt d'entrada
  - `server/routes/index.js` — router principal
  - `server/routes/auth.js` — rutes d'autenticació
  - `server/db/*.js` — capa de dades
  - `server/public/` — fitxers estàtics
  - `server/data/` — base de dades SQLite

### Regles de git

- No facis commits per cada tasca
- Fes un commit de fita al final de cada fase
- El missatge del commit ha de ser: "Fase {fase}: {descripció breu}"
- No mostris ni incloguis mai secrets als missatges de commit

### Regles de Playwright

- Per als tests de Playwright, utilitza els tools del MCP Puppeteer (puppeteer_puppeteer_navigate, puppeteer_puppeteer_fill, etc.)
- Navega a la URL de la pàgina (http://localhost:3000)
- Assegura't que el servidor s'està executant abans de fer els tests
- Verifica el contingut de les pàgines amb evaluacions JavaScript

### Regles de l'agent de valoració

- L'agent de valoració crida l'API d'OpenCode (IETI Agents) amb les dades de l'entrega
- El contingut del repositori es carrega abans d'enviar-lo a l'API
- Si l'API falla, l'estat de la valoració es posa a 'error'
- Els fitxers temporals s'esborren sempre, encara que hi hagi errors

---

## Estructura final esperada

```
RevisorDeures/
├── .gitignore
├── settings.env
├── opencode.json
├── AGENTS.md
├── PLAN.md
├── prompts/
│   ├── prompt-arnes.md
│   ├── prompt-tasques.md
│   └── prompt-implementa.md
├── tasks/
│   └── tasks.md
├── tests/
│   └── (tests de regressió i específics)
├── .opencode/
│   └── skills/
│       ├── web-dev.md
│       ├── frontend.md
│       ├── auth.md
│       ├── ai-agent.md
│       └── tests.md
│   └── agents/
│       ├── coordinator.md
│       ├── backend-dev.md
│       ├── frontend-dev.md
│       ├── tester.md
│       └── ai-reviewer.md
├── server/
│   ├── index.js
│   ├── settings.env
│   ├── routes/
│   │   ├── index.js
│   │   └── auth.js
│   ├── db/
│   │   ├── init.js
│   │   ├── alumnes.js
│   │   ├── practiques.js
│   │   ├── entregues.js
│   │   └── valoracions.js
│   ├── public/
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── index.html
│   │   ├── admin.html
│   │   ├── alumne.html
│   │   ├── admin-alumnes.html
│   │   ├── admin-practiques.html
│   │   ├── admin-entregues.html
│   │   ├── alumne-entregues.html
│   │   └── alumne-enviar.html
│   ├── data/
│   │   └── data.db
│   └── tmp/
│       └── (fitxers temporals de valoració)
└── package.json
```

---

## Verificació final

Al final del procés, verifica que:

1. Totes les tasques de `tasks/tasks.md` estan `[COMPLETADA]`
2. El servidor s'inicia sense errors: `node server/index.js`
3. El login funciona (admin i alumne)
4. El CRUD d'alumnes funciona
5. El CRUD de pràctiques funciona
6. Les entregues es poden crear, consultar i esborrar
7. La revisió d'entregues funciona
8. L'agent de valoració es dispara quan es crea una entrega
9. Totes les pàgines es mostren correctament (Playwright)
10. El commit final de la fase 9 s'ha creat

Quan tot estigui correcte, informa l'usuari del resultat.
