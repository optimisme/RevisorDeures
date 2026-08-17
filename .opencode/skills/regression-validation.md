---
name: regression-validation
description: Defineix com comprovar que una implementació no trenca funcionalitats existents.
---

# Validació de Regressió

Aquest skill defineix com comprovar que una implementació no trenca funcionalitats ja completades.

## Procediment

Després de cada implementació:

1. Identifica funcionalitats relacionades
2. Comprova possibles regressions
3. Repeteix proves prèvies quan sigui necessari
4. Utilitza Puppeteer MCP quan siguin proves web
5. Comprova nous errors JavaScript
6. Informa de qualsevol regressió abans del **PASS**
