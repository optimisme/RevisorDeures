import { describe, expect, it } from '@jest/globals';
import { repoValidationService } from '../../src/services/repoValidation';

describe('RepoValidationService', () => {
  describe('validateUrl', () => {
    it('should accept valid GitHub URLs', async () => {
      const validUrl = 'https://github.com/owner/repo';
      const result = await repoValidationService.validateUrl(validUrl);
      expect(result).toBe(true);
    });

    it('should reject non-GitHub URLs', async () => {
      const invalidUrl = 'https://gitlab.com/owner/repo';
      const result = await repoValidationService.validateUrl(invalidUrl);
      expect(result).toBe(false);
    });

    it('should reject HTTP URLs', async () => {
      const invalidUrl = 'http://github.com/owner/repo';
      const result = await repoValidationService.validateUrl(invalidUrl);
      expect(result).toBe(false);
    });

    it('should reject invalid URLs', async () => {
      const invalidUrl = 'not-a-url';
      const result = await repoValidationService.validateUrl(invalidUrl);
      expect(result).toBe(false);
    });
  });
});
