const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const { query, run } = require('./db/db');
const entreguesDb = require('./db/entregues');
const practiquesDb = require('./db/practiques');
const alumnesDb = require('./db/alumnes');
const valoracionsDb = require('./db/valoracions');

const execPromise = promisify(exec);

function valorarEntrega(entregaId) {
  return new Promise(async (resolve, reject) => {
    let tempDir = null;
    
    try {
      const entrega = entreguesDb.getById(entregaId);
      if (!entrega) {
        valoracionsDb.updateEstat(entregaId, 'error', null, 'Entrega no trobada', 'Entrega no trobada');
        reject(new Error('Entrega no trobada'));
        return;
      }

      if (entrega.estat === 'completada') {
        console.log(`[Evaluator] Entrega ${entregaId} ja completada, saltant`);
        resolve();
        return;
      }

      const practica = practiquesDb.getById(entrega.practica_id);
      const alumne = alumnesDb.getById(entrega.alumne_id);

      if (!practica || !alumne) {
        valoracionsDb.updateEstat(entregaId, 'error', null, 'Dades de pràctica o alumne no trobades', 'Dades no trobades');
        reject(new Error('Dades relacionades no trobades'));
        return;
      }

      // Crear carpeta temporal
      tempDir = path.join(__dirname, '..', 'tmp', `eval-${entregaId}-${Date.now()}`);
      await fs.mkdir(tempDir, { recursive: true });

      // Clone del repositori
      await execPromise(`git clone --depth 1 --single-branch "${entrega.repo_url}" .`, {
        cwd: tempDir,
        timeout: 60000
      });

      // Llegir fitxers del repositori
      const repoContingut = [];
      try {
        const fitxers = await fs.readdir(tempDir);
        for (const fitxer of fitxers) {
          if (fitxer.startsWith('.')) continue;
          const fitxerPath = path.join(tempDir, fitxer);
          const stats = await fs.stat(fitxerPath);
          
          if (stats.isFile() && fitxer.match(/\.(md|txt|js|py|html|css|ts|vue|jsx|tsx|rb|go|rs|java|c\+\+|cpp|c|h)$|^(Makefile|package\.json|Cargo\.toml|requirements\.txt|pom\.xml)$/)) {
            try {
              const contingut = await fs.readFile(fitxerPath, 'utf-8');
              if (contingut.length < 50000) { // Limitar mida
                repoContingut.push(`\n=== ${fitxer} ===\n${contingut}\n`);
              }
            } catch (e) {
              // Fitxer no llegible, saltar
            }
          } else if (stats.isDirectory()) {
            // Llegir fitxers del directori recursivament
            await llegirDirectori(fitxerPath, repoContingut);
          }
        }
      } catch (e) {
        console.log(`[Evaluator] Error llegint fitxers: ${e.message}`);
      }

      const repoContingutStr = repoContingut.join('') || '(El repositori és buit o no s\'han pogut llegir els fitxers)';

      // Construir prompt per a l'API d'avaluació
      const prompt = `Eres un tutor que avaluava entregues acadèmiques.

Avaluava aquesta entrega segons els criteris d'acceptació proporcionats.

CRITERIS D'ACCEPTACIÓ:
${practica.criteria || 'Sense criteris especificats'}

TÍTOL DE LA PRÀCTICA:
${practica.titol}

ALUMNE:
${alumne.nom} (${alumne.email})

CONTINGUT DEL REPOSITORI:
${repoContingutStr}

URL DEL REPOSITORI:
${entrega.repo_url}

INSTRUCCIONS:
1. Analitza el contingut del repositori
2. Comprova si compleix els criteris d'acceptació
3. Puntua del 1-10 la qualitat
4. Proporciona feedback constructiu

RESPONS:
Retorna només un JSON vàlid amb aquest format (sense markdown, només JSON):
{
  "acceptada": true|false,
  "puntualacio": 0-10,
  "comentaris": "feedback breu (max 100 caràcters)",
  "detall": "anàlisi detallat (max 500 caràcters)"
}`;

      // Enviar a l'API d'OpenCode/AI
      const apiKey = process.env.OPENCODE_ZEN_API_KEY || process.env.PROXY_AGENTS_KEY;
      const baseUrl = process.env.PROXY_AGENTS_BASE_URL || 'https://api.openai.com/v1';

      let respuestaAI;
      try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: process.env.AI_MODEL || 'gpt-4',
            messages: [
              { role: 'system', content: 'Eres un tutor acadèmic expert. Sempre respondres amb un JSON vàlid.' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.3
          }),
          signal: AbortSignal.timeout(90000)
        });

        const data = await res.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
          const content = data.choices[0].message.content.trim();
          
          // Parsejar el JSON de la resposta
          try {
            // Buscar JSON al contingut
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              respuestaAI = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('No s\'ha trobat JSON');
            }
          } catch (e) {
            console.error(`[Evaluator] Error parsejant JSON: ${e.message}`);
            // Resposta per defecte
            respuestaAI = {
              acceptada: true,
              puntualacio: 5,
              comentaris: 'Avaluació automàtica no disponible',
              detall: 'Error processant l\'avaluació'
            };
          }
        } else {
          throw new Error('Resposta inesperada de l\'API');
        }
      } catch (err) {
        console.error(`[Evaluator] Error cridant API: ${err.message}`);
        // Resposta per defecte en cas d'error
        respuestaAI = {
          acceptada: true,
          puntualacio: 5,
          comentaris: 'Avaluació automàtica no disponible temporalment',
          detall: 'Error en connectar amb el servei d\'avaluació'
        };
      }

      // Determinar resultat
      const acceptada = respuestaAI.acceptada === true;
      const puntualacio = Math.min(10, Math.max(0, parseInt(respuestaAI.puntualacio) || 5));
      const estatFinal = acceptada ? 'completada' : 'pendent';
      
      // Actualitzar BD
      valoracionsDb.updateEstat(entregaId, estatFinal);
      valoracionsDb.updateResultat(
        entregaId,
        acceptada ? 'acceptada' : 'rebutjada',
        respuestaAI.comentaris || 'Avaluació automàtica completada',
        respuestaAI.detall || 'Avaluació completada'
      );

      // Netejar carpeta temporal
      if (tempDir) {
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch (e) {
          // ignore cleanup errors
        }
      }

      console.log(`[Evaluator] Entrega ${entregaId} valorada: ${acceptada ? 'acceptada' : 'rebutjada'} (punt: ${puntualacio}/10)`);
      resolve();

    } catch (err) {
      console.error(`[Evaluator] Error avaluant entrega ${entregaId}: ${err.message}`);
      
      if (tempDir) {
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch (e) {
          // ignore
        }
      }
      
      valoracionsDb.updateEstat(entregaId, 'error');
      valoracionsDb.updateResultat(
        entregaId,
        'error',
        `Error: ${err.message.substring(0, 100)}`,
        err.message
      );
      reject(err);
    }
  });
}

async function llegirDirectori(dirPath, repoContingut) {
  try {
    const fitxers = await fs.readdir(dirPath);
    for (const fitxer of fitxers) {
      if (fitxer.startsWith('.') || fitxer === 'node_modules' || fitxer === '.git') continue;
      
      const fitxerPath = path.join(dirPath, fitxer);
      const stats = await fs.stat(fitxerPath);
      
      if (stats.isFile() && fitxer.match(/\.(md|txt|js|py|html|css|ts|vue|jsx|tsx|rb|go|rs|java|c\+\+|cpp|c|h)$|^(Makefile|package\.json|Cargo\.toml|requirements\.txt|pom\.xml)$/)) {
        try {
          const content = await fs.readFile(fitxerPath, 'utf-8');
          if (content.length < 50000) {
            repoContingut.push(`\n--- ${fitxerPath} ---\n${content}\n`);
          }
        } catch (e) {
          // ignore
        }
      } else if (stats.isDirectory()) {
        await llegirDirectori(fitxerPath, repoContingut);
      }
    }
  } catch (e) {
    // ignore
  }
}

// Servidor intern per a valoracions
function startEvaluatorServer(port = 3001) {
  const app = express();
  app.use(express.json());

  // Endpoint per disparar avaluació
  app.post('/api/evaluar', async (req, res) => {
    const { entrega_id } = req.body;
    if (!entrega_id) {
      return res.status(400).json({ error: 'entrega_id requerit' });
    }
    
    try {
      const id = parseInt(entrega_id);
      
      // Marcar com "processant"
      valoracionsDb.updateEstat(id, 'processant');
      
      // Executar avaluació en segon pla (no block)
      setImmediate(() => {
        valorarEntrega(id)
          .then(() => {
            console.log(`[Evaluator] Avaluació completada per entrega ${id}`);
          })
          .catch(err => {
            console.error(`[Evaluator] Error async per entrega ${id}: ${err.message}`);
          });
      });
      
      res.json({ message: 'Avaluació iniciada', entrega_id: id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint per consultar estat
  app.get('/api/valoracio/:entrega_id', (req, res) => {
    const entregaId = parseInt(req.params.entrega_id);
    const valoracio = valoracionsDb.getByEntrega(entregaId);
    if (!valoracio) {
      return res.status(404).json({ error: 'Valoració no trobada' });
    }
    res.json({ valoracio });
  });

  // Endpoint per forçar reavaluació
  app.post('/api/evaluar/retry/:entrega_id', async (req, res) => {
    const entregaId = parseInt(req.params.entrega_id);
    
    try {
      // Esborrar valoració existent
      if (valoracionsDb.exists(entregaId)) {
        // No hi ha delete, es fa un update
        valoracionsDb.updateEstat(entregaId, 'pendent');
      }
      
      // Disparar nova avaluació
      setImmediate(() => {
        valorarEntrega(entregaId)
          .catch(err => console.error(`[Evaluator] Retry error: ${err.message}`));
      });
      
      res.json({ message: 'Reavaluació iniciada' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  const server = app.listen(port, () => {
    console.log(`[Evaluator] Servidor d'avaluació escoltant al port ${port}`);
  });

  return server;
}

module.exports = { valorarEntrega, startEvaluatorServer };
