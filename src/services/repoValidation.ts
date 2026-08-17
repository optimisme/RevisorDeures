import { z } from 'zod';

export const repoUrlSchema = z.object({
  repositoryUrl: z.string().url().refine((url) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') return false;
      if (parsed.hostname !== 'github.com') return false;
      return true;
    } catch {
      return false;
    }
  }, { message: 'Invalid GitHub repository URL' }),
});

export class RepoValidationService {
  async validateUrl(url: string): Promise<boolean> {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') return false;
      if (parsed.hostname !== 'github.com') return false;
      return true;
    } catch {
      return false;
    }
  }
}

export const repoValidationService = new RepoValidationService();
