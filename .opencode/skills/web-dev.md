# Skill: web-dev

- Tots els fitxers del backend van a `server/`
- Tots els fitxers estàtics (HTML, CSS, JS del client) van a `server/public/`
- El punt d'entrada de l'aplicació és `server/index.js`
- Express serveix fitxers estàtics des de `server/public/`
- SQLite es fa servir per a persistència (fitxer `server/data.db` o similar, crear el directori si no existeix)
- Les claus i contrasenyes es gestionen via variables d'entorn (fitxer `server/settings.env`)
- El hash MD5 es fa servir per emmagatzemar contrasenyes: només el hash, mai el text pla
- Utilitza el paquet `bcrypt` o `crypto` per al hash MD5
- Toda la configuració del servidor va a `server/settings.env`
- El fitxer `package.json` del projecte inclou totes les dependències: `express`, `sqlite3` (o `better-sqlite3`), `bcrypt` (o `crypto`), `dotenv`, `cors`
- Les rutes Express es defineixen a `server/routes/`
- La base de dades s'inicialitza amb un script de migració a `server/db/init.js`
- Els fitxers de la base de dades s'emmagatzemen a `server/data/`
