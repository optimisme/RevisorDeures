---
name: bug-management
description: Defineix com gestionar defectes trobats durant el desenvolupament.
---

# Gestió de Bugs

Aquest skill defineix com gestionar defectes trobats durant el desenvolupament.

## Error de la Tasca Actual

Si el problema forma part de la funcionalitat que s'està implementant:

- **No** creïs una nova issue
- El validator retorna **FAIL**
- La mateixa tasca torna a l'executor

## Regressió o Bug en Funcionalitat Completada

Si es detecta un defecte en funcionalitat anterior:

1. Comprova amb GitHub MCP que **no** existeixi ja una issue equivalent
2. Crea una GitHub Issue de tipus **Bug**
3. Assigna-li identificador `BUG-NNN`
4. Documenta reproducció, resultat esperat, resultat observat i evidències
5. Defineix dependències, fase, ordre i prioritat
6. Incorpora-la al GitHub Project **ProjecteDeures** mitjançant GitHub MCP

El bug passa després pel mateix flux:

```
orchestrator → executor → validator
```

> **Important:** No implementis un bug directament només perquè existeixi una incidència informal: ha d'existir una issue executable incorporada al GitHub Project **ProjecteDeures**.
