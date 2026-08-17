---
name: atomic-task-execution
description: Defineix com executar una tasca atòmica segons el flux ATD.
---

# Execució de Tasques Atòmiques

Aquest skill defineix com executar una tasca atòmica dins del flux de treball ATD.

## Principis d'Execució

L'agent ha de:

- Treballar **exclusivament** sobre la GitHub Issue assignada
- Llegir-ne completament objectiu, dependències i criteris
- Fer els canvis **mínims necessaris**
- Evitar **scope creep**
- No implementar funcionalitats de futures issues
- Respectar **PLAN.md**
- No considerar la tasca completada fins que hagi estat validada

## Regla de Validació

Una issue amb estat `In Progress` pot passar a `Done` **únicament** després d'una validació amb resultat **PASS**.
