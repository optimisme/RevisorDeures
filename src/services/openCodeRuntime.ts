import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

export interface OpenCodeResult {
  status: 'PASS' | 'FAIL' | 'NEEDS_REVIEW';
  evidence: string[];
  feedback: string;
}

export class OpenCodeRuntimeService {
  private configPath: string;

  constructor() {
    this.configPath = join(__dirname, '..', '..', 'runtime', 'opencode.json');
  }

  async runReview(
    repoPath: string,
    criteriaText: string,
    practiceId: string,
    criteriaId: string
  ): Promise<OpenCodeResult> {
    try {
      const config = JSON.parse(readFileSync(this.configPath, 'utf-8'));

      const prompt = [
        `Pràctica: ${practiceId}`,
        `Criteri: ${criteriaId}`,
        `Criteri: ${criteriaText}`,
        '',
        'Valora si el repositori compleix aquest criteri. Retorna només el JSON de resultat.',
      ].join('\n');

      const { stdout, stderr } = await execAsync(
        `opencode eval --prompt "${prompt}" --path ${repoPath}`,
        {
          cwd: repoPath,
          timeout: config.timeout || 300000,
        }
      );

      try {
        const parsed = JSON.parse(stdout);
        if (parsed.status && ['PASS', 'FAIL', 'NEEDS_REVIEW'].includes(parsed.status)) {
          return parsed as OpenCodeResult;
        }
      } catch {
        // Parse error, return fallback
      }

      return {
        status: 'NEEDS_REVIEW',
        evidence: [stdout],
        feedback: 'Review incomplete',
      };
    } catch (err: any) {
      return {
        status: 'NEEDS_REVIEW',
        evidence: [err.message || 'Unknown error'],
        feedback: 'Review failed',
      };
    }
  }
}

export const openCodeRuntimeService = new OpenCodeRuntimeService();
