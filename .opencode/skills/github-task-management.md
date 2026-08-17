---
name: github-task-management
description: Defineix GitHub com a sistema d'execució i seguiment de les tasques ATD.
---

# Gestió de Tasques amb GitHub

Aquest skill defineix GitHub com a sistema d'execució i seguiment de les tasques ATD.

## Sistema de Seguiment

El projecte utilitza:

- **PLAN.md** com a pla estable i arquitectura de desenvolupament
- **GitHub Issues** com a tasques atòmiques
- **GitHub Project** com a font d'autoritat de l'estat operacional

> **Important:** No s'han de crear fitxers `tasks/*.md`.

## Projecte GitHub Obligatori

El seguiment operacional s'ha de fer exclusivament al GitHub Project **ProjecteDeures**, vinculat al repositori **RevisorDeures**.

### Procediment

Quan un agent necessiti consultar o modificar l'estat de desenvolupament:

1. Utilitza GitHub MCP per localitzar **ProjecteDeures**
2. Comprova que correspon al projecte vinculat a **RevisorDeures**
3. Utilitza els camps del Project per llegir i actualitzar `Status`, `Type`, `Phase`, `Order` i `Priority`
4. **No** utilitzis labels com a substitut dels camps del Project
5. **No** creïs cap Project nou ni cap sistema paral·lel de seguiment
6. Si GitHub MCP no permet localitzar o modificar ProjecteDeures, informa de la limitació i no inventis cap actualització

Cada tasca executable ha de correspondre a una **GitHub Issue**.

### Estructura de les Issues

Les issues han de tenir, quan sigui possible:

- Identificador estable `TASK-NNN` o `BUG-NNN`
- Objectiu únic
- Descripció
- Implementació esperada
- Criteris de validació
- Dependències
- Fase
- Ordre
- Prioritat
- Tipus

## Camps del GitHub Project

El GitHub Project **ProjecteDeures** ha d'utilitzar aquests camps com a font d'autoritat operacional. Els agents hi han d'accedir mitjançant GitHub MCP i no han de crear cap Project alternatiu.

### Status

| Valor     | Descripció                     |
|-----------|--------------------------------|
| Todo      | Tasca pendent d'execució       |
| In Progress | Tasca en execució            |
| Done      | Tasca completada i validada    |

### Type

| Valor | Descripció          |
|-------|---------------------|
| Task  | Talla de tasca      |
| Bug   | Talla de bug        |

### Phase

Fase definida a **PLAN.md**.

### Order

Valor numèric que defineix l'ordre normal de desenvolupament.

Utilitza preferentment increments de 10: `10`, `20`, `30`, ... per permetre inserir posteriorment tasques intermèdies.

### Priority

| Valor  | Descripció |
|--------|------------|
| Urgent | Crític, cal resol·locar immediatament |
| High   | Important  |
| Medium | Normal     |
| Low    | Baixa prioritat |

La prioritat no substitueix les dependències ni l'ordre. Priority és principalment informativa i no altera l'ordre normal de desenvolupament, excepte per als bugs Urgent, especialment quan siguin bloquejants.

### Selecció de la Següent Tasca

Per seleccionar la següent tasca:

1. Considera només items amb `Status` = **Todo**
2. Descarta els que tinguin dependències pendents
3. Prioritza bugs amb `Priority` = **Urgent**
4. En la resta de casos, utilitza el valor `Order` executable més baix

> **Important:** No mantinguis una còpia local de l'estat de les tasques.
