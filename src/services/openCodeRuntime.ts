import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface OpenCodeResult {
  status: 'PASS' | 'FAIL' | 'NEEDS_REVIEW';
  evidence: string[];
  feedback: string;
}

export class OpenCodeRuntimeService {
  async runReview(
    repoPath: string,
    criteriaText: string,
    practiceId: string,
    criteriaId: string
  ): Promise<OpenCodeResult> {
    try {
      const { stdout, stderr } = await execAsync(
        `opencode run --path ${repoPath} --agent runtime-reviewer --prompt "${criteriaText}"`,
        {
          cwd: repoPath,
          timeout: 60000,
        }
      );

      return {
        status: 'NEEDS_REVIEW',
        evidence: [stdout],
        feedback: 'Review pending',
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
