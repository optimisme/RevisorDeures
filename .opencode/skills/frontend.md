# Skill: frontend

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
