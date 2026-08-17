# Plan del Projecte: RevisorDeures

## Objectiu

Desenvolupar una aplicació web amb servidor Node.js que permeti a professors definir pràctiques amb múltiples criteris d'acceptació, i a estudiants entregar pràctiques indicant la URL pública del seu repositori GitHub. El sistema obtindrà temporalment els repositoris, els validarà individualment mitjançant criteris d'acceptació, executarà les validacions utilitzant un projecte OpenCode especialitzat en revisar entregues, i retornarà resultats estructurats (PASS, FAIL o NEEDS_REVIEW) amb evidències i feedback útil. El resultat global de l'entrega es calcularà automàticament a partir dels resultats individuals dels criteris.

L'aplicació seguirà les normes definides als skills `.opencode/skills/` per al disseny, gestió de tasques, execució atòmica, validació amb navegador, gestió de bugs i flux Git.

## Requisits funcionals

- **Gestió de pràctiques**: El professor podrà crear, llistar, editar i eliminar pràctiques.
- **Criteris d'acceptació**: Cada pràctica podrà associar múltiples criteris d'acceptació individualment definits.
- **Entregues**: L'estudiant podrà entregar una pràctica indicant la URL pública del seu repositori GitHub.
- **Repositoris GitHub públics**: El servidor acceptarà inicialment només repositoris públics accessibles per HTTPS a github.com.
- **Obtenció temporal del repositori**: El servidor clonarà el repositori en un directori temporal, el netejarà després de la validació.
- **Projecte OpenCode runtime de revisió**: L'aplicació inclourà un arnès OpenCode especialitzat en revisar entregues, amb configuració i agents propis.
- **Configuració independent del provider i model**: El model, provider, baseURL, límits i opcions es configuraran dins de l'arnès OpenCode runtime, no al servidor Node.js.
- **Invocació d'OpenCode des de Node.js**: El servidor invocarà OpenCode de manera no interactiva, seleccionant explícitament l'agent runtime.
- **Agent runtime especialitzat**: L'agent de revisió inspeccionarà el repositori, buscarà evidències i retornarà resultats estructurats.
- **Prompt específic per criteri**: Cada criteri s'enviarà amb context mínim i necessari.
- **Inspecció de fitxers per part de l'agent**: L'agent runtime llegirà exclusivament el necessari.
- **Resposta estructurada**: Contracte definit per al retorn de resultats (status, evidence, feedback).
- **Validació individual**: Cada criteri es validarà de forma independent.
- **Evidències**: S'emmagatzemaran les proves de cada revisió.
- **Feedback**: Es generarà text útil i concís per a cada criteri.
- **Resultat global**: Càlcul automàtic basat en els resultats individuals (FAIL si n'hi ha un, NEEDS_REVIEW si n'hi ha sense FAIL, PASS només si tots són PASS).
- **Persistència**: Pràctiques, criteris, entregues i resultats es persistiran a base de dades.
## Requisits no funcionals

- **Seguretat**: El repositori de l'estudiant es tractarà com a contingut no fiable. No s'executarà codi arbitrari sense un mecanisme explícit d'aïllament (planificat per futures fases).
- **Tractament de contingut no fiable i prompt injection**: Les instruccions contingudes dins del repositori que intentin alterar el procés de validació seran ignorades. L'agent runtime rebutjarà qualsevol intent de modificació.
- **Permisos restrictius de l'agent runtime**: L'agent només tindrà permisos de lectura sobre el repositori temporal i recursos limitats de l'arnès.
- **Gestió d'errors**: Erors de clonació, timeouts, processos fallits o respostes no estructurades seran tractats explícitament sense confondre'ls amb resultats funcionals.
- **Timeouts**: S'establiran límits de temps per a les invocacions d'OpenCode.
- **Processos OpenCode fallits**: S'emmagatzemaràn com a errors tècnics, no com a FAIL funcional.
- **Respostes incorrectes o no estructurades**: El servidor validarà el contracte de resposta i tractarà les invàlides com a errors tècnics.
- **Neteja dels directoris temporals**: Els directoris creats per a la revisió s'eliminaren completament després del seu ús.
- **Mantenibilitat**: Separació clara entre lògica de negoci del servidor i configuració/agents de l'arnès OpenCode runtime.
- **Desacoblament entre servidor i model**: El servidor no invocarà models directament ni condrà detalls del provider.
- **Accessibilitat**: La interfície seguirà les normes del skill `web-design`.
- **Usabilitat**: Experiència neta i professional.
- **Validació i regressions**: Segons els skills `browser-validation` i `regression-validation`.
## Arquitectura

L'aplicació seguirà una arquitectura modular i desacoblada:

- **Servidor Node.js**: Gestiona la lògica de negoci (pràctiques, criteris, entregues, validació, persistència, interfície web). No implementa lògica agentica ni invoca models directament.
- **Organització funcional**: Capes separades per routes, controllers, services, models/DAO, i el servei de validació.
- **Interfície web**: Client lleuger amb estètica moderna segons `web-design`.
- **Persistència**: Base de dades relacional per a pràctiques, criteris, entregues i resultats.
- **Accés a GitHub**: Clonació temporal de repositoris públics via HTTPS.
- **Obtenció temporal dels repositoris**: Directori efímer creat per a cada revisió, eliminat immediatament després.
- **Servei responsable d'invocar OpenCode**: Mòdul que gestiona el procés no interactiu, timeouts, captura de sortida i validació del contracte.
- **Projecte OpenCode runtime**: Arne independent amb configuració pròpia, agents i instruccions específiques per a revisió d'entregues.
- **Configuració del provider/model dins d'OpenCode**: Tota configuració de model, provider, baseURL, límits i opcions resideix a l'arnès runtime.
- **Mecanisme per carregar externament la configuració de l'arnès runtime**: Utilitzarà `OPENCONFIG_CONFIG` o `OPENCODE_CONFIG_DIR` (o equivalent) per mantenir la configuració fora del repositori temporal de l'estudiant.
- **Agent runtime de revisió**: Agent específic amb permisos de només lectura, sense GitHub MCP ni accés a xarxa innecessari.
- **Contracte de resposta**: Format JSON/estructurat definit (status, evidence, feedback).
- **Validació**: Verificació del contracte de resposta per part del servidor.
- **Gestió d'errors**: Tractament explícit de timeouts, errors de procés, respostes invàlides i contingut no fiable.
## Estructura prevista del projecte

L'organització de carpetes i responsabilitats prevista:

```
RevisorDeures/
├── .opencode/           # Configuració de desenvolupament (agents, skills)
├── src/                 # Codi font del servidor Node.js
│   ├── routes/          # Rutes API
│   ├── controllers/     # Lògica de control
│   ├── services/        # Serveis de negoci (pràctiques, entregues, validació)
│   ├── models/          # Models de dades
│   ├── opencode/        # Gestor d'invocació d'OpenCode runtime
│   └── ...
├── runtime/             # Arne OpenCode de revisió d'entregues
│   ├── opencode.json    # Configuració runtime (provider, model, baseURL, límits)
│   ├── instructions.md  # Instruccions de revisió
│   ├── agents/          # Agent de revisió runtime
│   └── skills/          # Skills específics de revisió (si cal)
├── tests/               # Proves automàtiques
└── package.json
```

- `runtime/` conté exclusivament l'arnès OpenCode runtime de revisió, separat de `.opencode/` (desenvolupament).
- El servidor Node.js només invoca `runtime/` de manera no interactiva.
- El repositori temporal de l'estudiant es muntarà com a directori de treball, però la configuració runtime romandrà externa.
## Flux principal

1. El professor crea una pràctica amb criteris d'acceptació.
2. L'estudiant entrega la pràctica indicant la URL del repositori públic.
3. El servidor obté temporalment el repositori.
4. Per cada criteri:
   - Es construeix el context mínim.
   - S'invoca OpenCode no interactiu.
   - L'agent runtime inspecciona el repositori.
   - Es obté una resposta estructurada.
   - El servidor valides el contracte i persisteix el resultat.
5. Es calcula el resultat global.
6. Es retorna l'informe complet a la interfície.
## Flux d'una validació individual

1. Es selecciona un criteri d'acceptació.
2. Es construeix un prompt breu i específic amb: identificador de la pràctica, identificador del criteri, text del criteri i context mínim.
3. El servidor invoca OpenCode de manera no interactiva:
   - Estableix el directori de treball sobre el repositori temporal.
   - Selecciona explícitament l'agent runtime de revisió.
   - Utilitza la configuració externa de l'arnès runtime.
4. L'agent runtime inspecciona el repositori, busca evidències i genera la resposta.
5. El servidor rep la sortida, la valida respecte al contracte estructurat.
6. Si el contracte és vàlid, es persisteix el resultat (status, evidence, feedback).
7. Si el contracte és invàlid o hi ha un error tècnic, es registra com a error tècnic sense afetar el resultat funcional del criteri.
## Fases

### Fase 1: Configuració i estructura base
- **Objectiu**: Configurar el projecte Node.js, estructura de carpetes, base de dades i servei bàsic de persistència.
- **Resultat esperat**: Projecte compila i corre, base de dades inicialitzada, models bàsics persistents.
- **Dependències**: Cap.
- **Criteris de completud**: Arrenca el servidor, connexió a DB verificada, estructures de bases de dades creades.

### Fase 2: Gestió de pràctiques i criteris
- **Objectiu**: Implementar CRUD de pràctiques i criteris d'acceptació.
- **Resultat esperat**: API per crear, llistar, editar i eliminar pràctiques i criteris.
- **Dependències**: Fase 1.
- **Criteris de completud**: Operacions CRUD verificades amb proves i validació amb navegador.

### Fase 3: Gestió d'entregues i repositoris
- **Objectiu**: Implementar rebuda d'entregues i clonació temporal de repositoris públics.
- **Resultat esperat**: Endpoint per registrar entregues, clonació temporal neteja automàtica després.
- **Dependències**: Fase 2.
- **Criteris de completud**: Clonació i neteja verificades, validació de URLs públiques.

### Fase 4: Arne runtime OpenCode
- **Objectiu**: Crear l'arnès OpenCode runtime amb configuració, instruccions, agent de revisió i contracte de resposta.
- **Resultat esperat**: Arne funcional, configurable via `OPENCONFIG_CONFIG`/`OPENCODE_CONFIG_DIR`, agent amb permisos restrictius.
- **Dependències**: Cap (independent del servidor).
- **Criteris de completud**: Execució no interactiva manual amb resultat estructurat vàlid.

### Fase 5: Integració i invocació d'OpenCode
- **Objectiu**: Servici Node.js que invoqui OpenCode no interactiu per cada criteri.
- **Resultat esperat**: Pipeline de validació amb timeouts, captura de sortida, validació del contracte, persistència de resultats.
- **Dependències**: Fase 3, Fase 4.
- **Criteris de completud**: Validació completa de criteri verificada, persistència correcta.

### Fase 6: Resultat global i interfície
- **Objectiu**: Càlcul del resultat global i interfície web per a professors i estudiants.
- **Resultat esperat**: Càlcul FAIL/NEEDS_REVIEW/PASS, interfície funcional segons `web-design`.
- **Dependències**: Fase 5.
- **Criteris de completud**: Flux complet de ponta a punta verificat.

### Fase 7: Validació, regressió i poliment
- **Objectiu**: Proves completes, validació amb Puppeteer MCP, correcció de bugs i regressions.
- **Resultat esperat**: Aplicació estable, sense regressions, validació automàtica aprovada.
- **Dependències**: Fase 6.
- **Criteris de completud**: Totes les proves passen, validacions visuals aprovades, sense bugs oberts.
## Estratègia de validació

- **Validació individual de funcionalitats**: Cada mòdul es validarà de manera aïllada.
- **Proves de la invocació d'OpenCode**: Simulació de respostes vàlides, invàlides i timeouts.
- **Proves del contracte estructurat**: Verificació automàtica del format de sortida.
- **Proves d'errors i timeouts**: Simulació de processos fallits i límits de temps.
- **Proves de contingut no fiable**: Repositoris amb instruccions enganyoses o intents de prompt injection.
- **Ús de Puppeteer MCP**: Validació completa de la interfície web segons `browser-validation`.
- **Proves de regressió**: Verificació de funcionalitats prèviament completes després de cada canvi segons `regression-validation`.
- **Validació de fase**: Cada fase es considerarà completada només si supera les seves validacions específiques.
- **Validació global final**: Flux ponta a punta amb dades reals verificat.
## Estratègia GitHub

- **PLAN.md defineix el pla estable**: Arquitectura, requisits i fases.
- **GitHub Issues representaran les tasques ATD**: Tasques atòmiques segons `github-task-management`.
- **Projecte operatiu existent**: ProjecteDeures, vinculat a RevisorDeures, gestionarà l'estat operacional mitjançant els seus camps (Status, Type, Phase, Order, Priority).
- **Bugs i tasques utilitzaran el mateix flux**: Segons `bug-management` i `git-workflow`.
- **L'estat de desenvolupament no es duplicarà dins de PLAN.md**: No s'inclouran checkboxes o estat operacional.
## Criteris globals de finalització

- El servidor invoca OpenCode i no el model directament per fer les revisions.
- L'arnès runtime és independent dels agents de desenvolupament.
- Cada criteri produeix una resposta estructurada validada pel servidor.
- El canvi de provider o model es pot realitzar principalment des de la configuració OpenCode sense modificar la lògica de negoci del servidor.
- La configuració i els agents de l'arnès runtime es mantenen separats del repositori temporal de l'estudiant encara que aquest sigui el directori de treball d'OpenCode.
- El repositori de l'estudiant es tracta com a contingut no fiable.
- No queden processos ni directoris temporals abandonats després de la validació.
- El resultat global es calcula correctament segons les regles definides (FAIL > NEEDS_REVIEW > PASS).
- Totes les fases s'han validat segons les seves criteris específics.
- No hi ha bugs oberts ni regressions.
## Revisió final

- **Coherència arquitectònica**: Separació clara entre servidor Node.js, arnès runtime i base de dades.
- **Separació clara entre OpenCode de desenvolupament i OpenCode runtime**: `.opencode/` per desenvolupament, `runtime/` per revisió.
- **Dependències entre fases**: L'ordre permet construcció incremental sense blocs.
- **Cobertura de tots els requisits**: Funcionals i no funcionals contemplats.
- **Absència de contradiccions**: No hi ha conflictres entre mòduls o fluxos.
- **Absència d'una integració directa servidor → model**: Tota validació passa per OpenCode.
- **Possibilitat de transformar cada fase en tasques ATD petites**: Cada fase es pot descomposar en GitHub Issues atòmiques.
- **Verificabilitat dels resultats**: Cada pas té criteris de validació mesurables.
- **Absència de tasques operacionals duplicades**: L'estat es gestiona exclusivament via GitHub Project, no es duplica a fitxers locals.
