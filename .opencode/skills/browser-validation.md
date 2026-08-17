---
name: browser-validation
description: Defineix la validació funcional mitjançant Puppeteer MCP.
---

# Validació amb Puppeteer MCP

Aquest skill defineix la validació funcional mitjançant Puppeteer MCP.

## Ús Obligatori

Sempre que una funcionalitat sigui observable des del navegador, **Puppeteer MCP s'ha d'utilitzar per validar-la**.

## Comprovacions

Quan correspongui, comprova:

- Càrrega de pàgines
- Existència i visibilitat dels elements
- Formularis
- Botons
- Enllaços
- Fluxos d'usuari
- Navegació
- Resultats mostrats
- Persistència després de recarregar
- Errors JavaScript a la consola
- Diferents amplades de pantalla
- Navegació amb teclat
- Focus visible
- Criteris rellevants de **web-design**

## Principi

Les validacions han de comprovar **comportament observable** i no limitar-se a inspeccionar el codi.
