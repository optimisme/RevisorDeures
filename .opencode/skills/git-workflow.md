---
name: git-workflow
description: Defineix el flux de treball Git del desenvolupament.
---

# Flux Git

Aquest skill defineix el flux de treball Git del desenvolupament.

## Principi

Cada GitHub Issue completada i validada ha de correspondre a un **únic commit lògic**.

## Flux

1. La issue passa a **In Progress**
2. S'implementa
3. Es valida
4. Si retorna **FAIL**, **no** es crea cap commit final de tasca
5. Es corregeix i torna a validar
6. Després de **PASS**, es crea el commit corresponent
7. Només després que el commit s'hagi creat correctament, s'actualitza la issue a **Done**

El commit ha d'incloure **exclusivament** els canvis relacionats amb aquella tasca.

## Format de Commit

Format recomanat:

```
TASK-NNN: descripció breu
```

O per a bugs:

```
BUG-NNN: descripció breu
```

Quan sigui útil, refere també el número de GitHub Issue.

## Regles

- **No** agrupis diverses tasques independents en un mateix commit
- **No** incloguis canvis aliens a la tasca
