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
