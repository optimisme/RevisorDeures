# Prompt: Generar l'arnès bàsic del projecte

Aquest prompt genera l'estructura bàsica del projecte RevisorDeures: la configuració d'OpenCode (agents, skills, PLAN.md) i el fitxer AGENTS.md.

Segueix les instruccions pas a pas:

---

## 1. Crea la llista de skills

Les skills són instruccions especialitzades per a tasques concretes. Crea el directori `.opencode/skills/` i els següents fitxers de skill:

### `.opencode/skills/web-dev.md` — Desenvolupament web amb Node.js/Express/SQLite

Aquesta skill defineix les convencions per desenvolupar el backend del servidor:

**Capçalera del fitxer de skill:**
```markdown
# Skill: web-dev
```

**Instruccions de la skill:**

- Tots els fitxers del backend van a `server/`
- Tots els fitxers estàtics (HTML, CSS, JS del client) van a `server/public/`
- El punt d'entrada de l'aplicació és `server/index.js`
- Express serveix fitxers estàtics des de `server/public/`
- SQLite es fa servir per a persistència (fitxer `server/data.db` o similar, crear el directori si no existeix)
- Les claus i contrasenyes es gestionen via variables d'entorn (fitxer `server/settings.env`)
- El hash MD5 es fa servir per emmagatzemar contrasenyes: només el hash, mai el text pla
- Utilitza el paquet `bcrypt` o `crypto` per al hash MD5
- Tota la configuració del servidor va a `server/settings.env`
- El fitxer `package.json` del projecte inclou totes les dependències: `express`, `sqlite3` (o `better-sqlite3`), `bcrypt` (o `crypto`), `dotenv`, `cors`
- Les rutes Express es defineixen a `server/routes/`
- La base de dades s'inicialitza amb un script de migració a `server/db/init.js`
- Els fitxers de la base de dades s'emmagatzemen a `server/data/`

### `.opencode/skills/frontend.md` — Interfície web amb HTML/CSS/JS vanilla

Aquesta skill defineix les convencions per al frontend:

**Capçalera del fitxer de skill:**
```markdown
# Skill: frontend
```

**Instruccions de la skill:**

- Utilitza HTML5 semàntic, CSS3 i JavaScript (vanilla, sense frameworks)
- Tots els fitxers van a `server/public/`
- Organització recomanada:
  - `server/public/index.html` — pàgina de login (`/`)
  - `server/public/admin.html` — espai d'administrador (`/admin`)
  - `server/public/admin-alumnes.html` — gestió d'alumnes (`/admin/alumnes`)
  - `server/public/admin-practiques.html` — gestió de pràctiques (`/admin/practiques`)
  - `server/public/admin-entregues.html` — consulta d'entregues (`/admin/entregues`)
  - `server/public/alumne.html` — espai principal de l'alumne (`/alumne`)
  - `server/public/alumne-entregues.html` — llista d'entregues (`/alumne/entregues`)
  - `server/public/alumne-enviar.html` — formulari d'entrega (`/alumne/enviar`)
- La navegació entre pàgines es fa amb redireccions del servidor o canvis de pàgina complets
- El JavaScript del client es fa servir per fer crides API (`fetch`) i actualitzar el DOM
- Les credencials d'autenticació es gestionen amb cookies o sessions al servidor
- Disseny responsive bàsic amb CSS
- Interfície en català

### `.opencode/skills/auth.md` — Autenticació i autorització

Aquesta skill defineix les convencions per a l'autenticació:

**Capçalera del fitxer de skill:**
```markdown
# Skill: auth
```

**Instruccions de la skill:**

- L'usuari administrador és `admin` amb la contrasenya definida a `SERVER_ADMIN_PWD` a `server/settings.env`
- L'autenticació es fa amb cookies de sessió (express-session o similar)
- Els alumnes fan login amb correu electrònic i contrasenya
- La contrasenya del client es compara amb el hash MD5 emmagatzemat a la BD
- L'administrador accedeix amb l'usuari `admin` i la contrasenya de `SERVER_ADMIN_PWD`
- Les rutes protegides verifiquen la sessió abans de processar la sol·licitud
- Les rutes d'API requereixen autenticació explícita

### `.opencode/skills/ai-agent.md` — Agent de valoració automàtica

Aquesta skill defineix com implementar l'agent que avalue les entregues:

**Capçalera del fitxer de skill:**
```markdown
# Skill: ai-agent
```

**Instruccions de la skill:**

- L'agent de valoració és un servidor web intern que s'inicia des de `server/index.js`
- Rebrà les instruccions, criteris d'acceptació i la URL del repositori de GitHub
- L'agent:
  1. Descarrega el repositori de GitHub en una carpeta temporal (`server/tmp/eval-<id>`)
  2. Analitza el contingut
  3. Valora segons els criteris d'acceptació definits pel professor
  4. Actualitza l'estat de l'entrega a la BD (acceptada/rebutjada + comentaris)
  5. Esborra tots els fitxers temporals
- L'agent s'activa de forma asíncrona quan l'alumne envia una nova entrega
- L'estat de la valoració es consulta via l'API

### `.opencode/skills/tests.md` — Tests i validació

Aquesta skill defineix les convencions per als tests:

**Capçalera del fitxer de skill:**
```markdown
# Skill: tests
```

**Instruccions de la skill:**

- Els tests es defineixen a `tests/`
- Utilitza l'MCP Playwright per als tests d'interfície web
- Els tests de backend es fan amb Node.js (mòduls natius o jest si s'afegeix com a dependència)
- Cada tasca a `tasks/tasks.md` defineix quins tests ha de superar
- Els tests de regressió s'executen abans de cada fase nova
- Els tests de Playwright validen el funcionament de les pàgines web

---

## 2. Crea el `PLAN.md`

Crea el fitxer `PLAN.md` a l'arrel del projecte amb la següent estructura:

**Contingut del PLAN.md:**

```markdown
# PLAN — RevisorDeures

## Objectiu

Desenvolupar un servidor web amb Node.js, Express i SQLite per gestionar la revisió de pràctiques i entregues d'alumnes, amb valoració automàtica via agents d'OpenCode.

## Estructura del projecte

```
RevisorDeures/
├── prompts/
│   ├── prompt-arnes.md
│   ├── prompt-tasques.md
│   └── prompt-implementa.md
├── tasks/
│   └── tasks.md
├── server/
│   ├── index.js
│   ├── settings.env
│   ├── routes/
│   ├── public/
│   ├── db/
│   └── data/
├── tests/
├── .opencode/
│   └── skills/
├── AGENTS.md
├── package.json
└── PLAN.md
```

## Fases de desenvolupament

### Fase 0: Configuració inicial

- [ ] Crear l'estructura de directoris
- [ ] Configurar package.json amb dependències
- [ ] Crear server/settings.env amb les variables necessàries
- [ ] Crear server/db/init.js per inicialitzar la base de dades
- [ ] Crear l'estructura bàsica de server/index.js
- [ ] Verificar que l'aplicació es pot iniciar

### Fase 1: Base de dades

- [ ] Definir l'esquema de la base de dades (taules: alumnes, practiques, entregues, valoracions)
- [ ] Implementar les crides a la BD per a cada entitat
- [ ] Tests de creació i consulta de taules

### Fase 2: Autenticació

- [ ] Endpoint de login per a l'administrador
- [ ] Endpoint de login per a alumnes
- [ ] Gestionar sessions amb cookies
- [ ] Middleware d'autorització per rutes protegides
- [ ] Endpoint de logout
- [ ] Pàgina de login (`/`)
- [ ] Redirecció automàtica segons el rol (admin / alumne)
- [ ] Tests de validació amb Playwright

### Fase 3: Gestió d'alumnes

- [ ] CRUD d'alumnes (nom, correu, contrasenya hash MD5)
- [ ] Llista d'alumnes amb paginació
- [ ] Veure entregues d'un alumne
- [ ] Pàgina /admin/alumnes amb interfície completa
- [ ] Tests de validació amb Playwright

### Fase 4: Gestió de pràctiques

- [ ] CRUD de pràctiques (títol, criteris d'acceptació)
- [ ] Llista de pràctiques
- [ ] Veure entregues d'una pràctica
- [ ] Pàgina /admin/practiques amb interfície completa
- [ ] Tests de validació amb Playwright

### Fase 5: Gestió d'entregues

- [ ] Creació d'entrega per l'alumne (pràctica + URL del repositori)
- [ ] Llista d'entreges de l'alumne
- [ ] Eliminació d'entregues no revisades per l'alumne
- [ ] Marcatge d'entrega com a revisada per l'admin
- [ ] Consulta d'entregues per alumne
- [ ] Consulta d'entregues per pràctica
- [ ] Pàgina /alumne/entregues
- [ ] Pàgina /alumne/enviar
- [ ] Pàgina /admin/entregues
- [ ] Tests de validació amb Playwright

### Fase 6: Valoració automàtica

- [ ] Implementar l'agent de valoració (skill ai-agent)
- [ ] Activar l'agent de forma asíncrona quan es crea una entrega
- [ ] Actualitzar l'estat de l'entrega amb el resultat
- [ ] Consultar l'estat i resultat de la valoració
- [ ] Tests de validació amb Playwright

### Fase 7: Espai personal de l'alumne

- [ ] Pàgina /alumne amb resum
- [ ] Integració de totes les funcionalitats de l'espai alumne
- [ ] Tests de validació amb Playwright

### Fase 8: Espai d'administrador

- [ ] Pàgina /admin amb resum
- [ ] Integració de totes les funcionalitats admin
- [ ] Tests de validació amb Playwright

### Fase 9: Poliment i integració final

- [ ] Millorar disseny i UX
- [ ] Tests integrals de regressió
- [ # TODO: Afegir la resta de línies quan es defineixin les tasques

## Regles de implementació

1. Executar `prompts/prompt-tasques.md` per generar les tasques detallades
2. Executar `prompts/prompt-implementa.md` per implementar pas a pas
3. Cada tasca s'implementa seguint el cicle:
   - Marcar com `implementant` a `tasks/tasks.md`
   - Implementar la funcionalitat
   - Executar els tests específics
   - Marcar com `revisant`
   - Revisar i corregir
   - Tornar a executar els tests
   - Marcar com `completada` només si tot passa
4. Al final de cada fase, fer un commit de fita amb el MCP GitHub
5. No avançar a la següent fase si hi ha errors

## Tests

- Cada tasca defineix els seus tests a `tasks/tasks.md`
- Els tests de Playwright validen les pàgines web
- Els tests de regressió s'executen abans de cada fase
```

---

## 3. Crea els agents

Crea el directori `.opencode/agents/` amb els següents agents:

### `.opencode/agents/coordinator.md` — Coordinador (primary)

**Capçalera:**
```markdown
# Agent: coordinator
# Mode: primary
```

**Instruccions de l'agent:**
```markdown
Soc el coordinador principal del projecte RevisorDeures.
Les meves responsabilitats són:
- Orquestrar el flux de desenvolupament
- Assignar tasques als agents especialitzats
- Supervisar l'estat de les fases
- Validar els resultats abans de fer commit
- Assegurar que cada tasca passa els tests abans de marcar-se com completada
- Fer servir els skills definits a .opencode/skills/
- Seguir el PLAN.md per l'ordre de les fases
```

### `.opencode/agents/backend-dev.md` — Desenvolupador backend (subagent)

**Capçalera:**
```markdown
# Agent: backend-dev
# Mode: subagent
```

**Instruccions de l'agent:**
```markdown
Soc l'agent de desenvolupament backend del projecte RevisorDeures.
Les meves responsabilitats són:
- Implementar rutes Express a server/routes/
- Crear i mantenir l'esquema de la base de dades SQLite
- Implementar la lògica de negoci
- Gestionar l'autenticació i sessions
- Crear els tests de backend necessaris
- Fer servir la skill web-dev per les convencions de codi
- Fer servir la skill auth per l'autenticació
- Fer servir la skill ai-agent per l'agent de valoració
- Tornar els resultats al coordinador
```

### `.opencode/agents/frontend-dev.md` — Desenvolupador frontend (subagent)

**Capçalera:**
```markdown
# Agent: frontend-dev
# Mode: subagent
```

**Instruccions de l'agent:**
```markdown
Soc l'agent de desenvolupament frontend del projecte RevisorDeures.
Les meves responsabilitats són:
- Crear les pàgines HTML a server/public/
- Implementar el CSS i JavaScript client
- Fer servir la skill frontend per les convencions de codi
- Assegurar que l'interfície és en català
- Fer servir les dades de l'API per actualitzar el DOM
- Assegurar que les pàgines responen correctament
- Tornar els resultats al coordinador
```

### `.opencode/agents/tester.md` — Proves i validació (subagent)

**Capçalera:**
```markdown
# Agent: tester
# Mode: subagent
```

**Instruccions de l'agent:**
```markdown
Soc l'agent de proves i validació del projecte RevisorDeures.
Les meves responsabilitats són:
- Executar els tests específics de cada tasca (segun tasks/tasks.md)
- Executar els tests de regressió abans de cada fase nova
- Fer servir l'MCP Playwright per validar les pàgines web
- Verificar que les pàgines es mostren correctament a les rutes indicades
- Verificar que els formularis funcionen
- Verificar que la navegació entre pàgines funciona
- Tornar els resultats al coordinador
- Reportar quins tests fallen i quins passen
```

### `.opencode/agents/ai-reviewer.md` — Agent de valoració automàtica (subagent)

**Capçalera:**
```markdown
# Agent: ai-reviewer
# Mode: subagent
```

**Instruccions de l'agent:**
```markdown
Soc l'agent especialitzat en la implementació de l'agent de valoració automàtica.
Les meves responsabilitats són:
- Implementar l'agent de valoració segons la skill ai-agent
- Implementar la lògica per descarregar repositoris de GitHub
- Implementar l'anàlisi del contingut segons els criteris d'acceptació
- Actualitzar l'estat de les entregues a la BD
- Gestionar l'execució asíncrona (fila de tasques)
- Assegurar que els fitxers temporals s'esborren després
- Fer servir la skill ai-agent per les convencions de codi
- Tornar els resultats al coordinador
```

---

## 4. Crea l'`AGENTS.md`

Crea el fitxer `AGENTS.md` a l'arrel del projecte amb la següent estructura:

**Contingut de l'AGENTS.md:**

```markdown
# AGENTS.md — RevisorDeures

## Agents disponibles

| Agent | Mode | Descripció |
|-------|------|------------|
| coordinator | primary | Coordinador principal. Orquestra el flux de desenvolupament. |
| backend-dev | subagent | Desenvolupament del backend (Express, SQLite, API) |
| frontend-dev | subagent | Desenvolupament del frontend (HTML, CSS, JS) |
| tester | subagent | Proves i validació amb Playwright |
| ai-reviewer | subagent | Implementació de l'agent de valoració automàtica |

## Skills disponibles

| Skill | Descripció |
|-------|------------|
| web-dev | Desenvolupament web amb Node.js/Express/SQLite |
| frontend | Interfície web amb HTML/CSS/JS vanilla |
| auth | Autenticació i autorització |
| ai-agent | Agent de valoració automàtica |
| tests | Tests i validació |

## Flux de treball

1. El coordinator llegeix PLAN.md i tasks/tasks.md
2. Assigna tasques als subagents corresponents
3. Els subagents implementen les tasques segons les seves skills
4. El tester executa els tests i valida els resultats
5. El coordinator marca les tasques com completades a tasks/tasks.md
6. Al final de cada fase, el coordinator fa un commit de fita amb el MCP GitHub

## Variables d'entorn necessàries

- `SERVER_ADMIN_PWD` — Contrasenya de l'administrador (a server/settings.env)
- `OPENCODE_ZEN_API_KEY` — Clau de l'API d'OpenCode
- `PROXY_AGENTS_BASE_URL` — URL del proxy d'agents
- `PROXY_AGENTS_KEY` — Clau del proxy d'agents
- `GITHUB_PERSONAL_ACCESS_TOKEN` — Token per al MCP GitHub
```

---

## 5. Verificació final

Després de crear tots els fitxers:

1. Executa:
   ```bash
   ls -R .opencode/
   ls PLAN.md AGENTS.md prompts/
   ```

2. Verifica que existeixen:
   - `.opencode/skills/web-dev.md`
   - `.opencode/skills/frontend.md`
   - `.opencode/skills/auth.md`
   - `.opencode/skills/ai-agent.md`
   - `.opencode/skills/tests.md`
   - `.opencode/agents/coordinator.md`
   - `.opencode/agents/backend-dev.md`
   - `.opencode/agents/frontend-dev.md`
   - `.opencode/agents/tester.md`
   - `.opencode/agents/ai-reviewer.md`
   - `PLAN.md`
   - `AGENTS.md`
   - `prompts/prompt-arnes.md` (aquest mateix arxiu)

3. Per a cada fitxer de skill i agent, verifica que la capçalera està ben formada:
   - Skills: `# Skill: <nom>`
   - Agents: `# Agent: <nom>` i `# Mode: <primary o subagent>`

4. No facis commits ni inicialis el repositori. Només crea els fitxers.
```

---

## Notes addicionals per a qui executa aquest prompt

- Utilitza el llenguatge català a tots els fitxers de contingut (els noms de fitxers poden ser en anglès)
- Les convencions de codi (indentació, noms de variables, etc.) segueixen les estàndards de Node.js i Express
- No cal generar codi de producció en aquesta fase — només l'arnès
- L'arxiu `prompt-tasques.md` es genera amb un altre prompt (veure `prompt-tasques.md`)
- L'arxiu `prompt-implementa.md` es genera amb un altre prompt (veure `prompt-implementa.md`)
