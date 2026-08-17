import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

export interface OpenCodeResult {
  status: 'PASS' | 'FAIL' | 'NEEDS_REVIEW';
  evidence: string[];
  feedback: string;
}

export interface OpenCodeConfig {
  provider: string;
  model: string;
  baseURL: string;
  context: number;
  output: number;
  reasoning: boolean;
  timeout: number;
  maxRetries: number;
}

export class OpenCodeRuntimeService {
  private config: OpenCodeConfig;
  private configPath: string;

  constructor() {
    this.configPath = join(__dirname, '..', '..', 'runtime', 'opencode.json');
    this.config = this.loadConfig();
  }

  private loadConfig(): OpenCodeConfig {
    if (existsSync(this.configPath)) {
      return JSON.parse(readFileSync(this.configPath, 'utf-8'));
    }
    return {
      provider: 'openai',
      model: 'gpt-4',
      baseURL: '',
      context: 65536,
      output: 8192,
      reasoning: false,
      timeout: 300000,
      maxRetries: 2,
    };
  }

  async runReview(
    repoPath: string,
    criteriaText: string,
    practiceId: string,
    criteriaId: string,
    attempt: number = 0
  ): Promise<OpenCodeResult> {
    try {
      const prompt = [
        `Practica: ${practiceId}`,
        `Criteri: ${criteriaId}`,
        `Criteri: ${criteriaText}`,
        '',
        'Valora si el repositori compleix aquest criteri. Retorna només el JSON de resultat.',
      ].join('\n');

      const { stdout, stderr } = await execAsync(
        `opencode eval --prompt "${prompt}" --path ${repoPath}`,
        {
          cwd: repoPath,
          timeout: this.config.timeout,
        }
      );

      try {
        const parsed = JSON.parse(stdout);
        if (parsed.status && ['PASS', 'FAIL', 'NEEDS_REVIEW'].includes(parsed.status)) {
          return parsed as OpenCodeResult;
        }
      } catch {
        // Parse error
      }

      return {
        status: 'NEEDS_REVIEW',
        evidence: [stdout],
        feedback: 'Review incomplete',
      };
    } catch (err: any) {
      if (attempt < this.config.maxRetries) {
        return this.runReview(repoPath, criteriaText, practiceId, criteriaId, attempt + 1);
      }

      return {
        status: 'NEEDS_REVIEW',
        evidence: [err.message || 'Unknown error'],
        feedback: 'Review failed',
      };
    }
  }
}

export const openCodeRuntimeService = new OpenCodeRuntimeService();
