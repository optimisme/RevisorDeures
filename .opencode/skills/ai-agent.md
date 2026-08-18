# Skill: ai-agent

- L'agent de valoració és un servidor web intern que s'inicia des de `server/index.js`
- Rebrà les instruccions, criteris d'acceptació i la URL del repositori de GitHub
- L'agent:
  1. Descarrega el repositori de GitHub en una carpeta temporal (`server/tmp/eval-<id>`)
  2. Analitza el contingut
  3. Valora segons els criteris d'acceptació definits pel professor
  4. Actualitza l'estat de l'entrega a la BD (acceptada/rebutjada + comentaris)
  5. Esborra tots els fitxers temporals
- L'agent s'activa de forma asíncrona quan l'alumne envia una nova entrega
- L'estat de la valoració es consulta via l'API
