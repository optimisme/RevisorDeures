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
