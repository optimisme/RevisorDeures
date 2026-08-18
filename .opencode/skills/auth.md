# Skill: auth

- L'usuari administrador és `admin` amb la contrasenya definida a `SERVER_ADMIN_PWD` a `server/settings.env`
- L'autenticació es fa amb cookies de sessió (express-session o similar)
- Els alumnes fan login amb correu electrònic i contrasenya
- La contrasenya del client es compara amb el hash MD5 emmagatzemat a la BD
- L'administrador accedeix amb l'usuari `admin` i la contrasenya de `SERVER_ADMIN_PWD`
- Les rutes protegides verifiquen la sessió abans de processar la sol·licitud
- Les rutes d'API requereixen autenticació explícita
