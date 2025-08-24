import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  parseModules,
  matchesModuleFilters,
  applyPagination,
  searchPartners
} from './search.js';

describe('Search Utilities', () => {
  describe('parseModules', () => {
    it('should parse comma-separated modules', () => {
      const result = parseModules('COMS3011,COMS3012,COMS3013');
      assert.deepStrictEqual(result, ['COMS3011', 'COMS3012', 'COMS3013']);
    });

    it('should handle single module', () => {
      const result = parseModules('COMS3011');
      assert.deepStrictEqual(result, ['COMS3011']);
    });

    it('should handle empty string', () => {
      const result = parseModules('');
      assert.deepStrictEqual(result, []);
    });

    it('should trim whitespace', () => {
      const result = parseModules(' COMS3011 , COMS3012 ');
      assert.deepStrictEqual(result, ['COMS3011', 'COMS3012']);
    });
  });

  describe('matchesModuleFilters', () => {
    const mockPartner = {
      modules: ['COMS3011', 'COMS3012', 'COMS3013']
    };

    it('should match single module filter', () => {
      const result = matchesModuleFilters(mockPartner, { module: 'COMS3011' });
      assert.strictEqual(result, true);
    });

    it('should not match non-existent module', () => {
      const result = matchesModuleFilters(mockPartner, { module: 'COMS9999' });
      assert.strictEqual(result, false);
    });

    it('should handle anti-search (notModule)', () => {
      const result = matchesModuleFilters(mockPartner, {
        notModule: 'COMS9999'
      });
      assert.strictEqual(result, true);
    });

    it('should not match anti-search when module exists', () => {
      const result = matchesModuleFilters(mockPartner, {
        notModule: 'COMS3011'
      });
      assert.strictEqual(result, false);
    });

    it('should match any of multiple modules', () => {
      const result = matchesModuleFilters(mockPartner, {
        modules: 'COMS3011,COMS9999'
      });
      assert.strictEqual(result, true);
    });

    it('should match all required modules', () => {
      const result = matchesModuleFilters(mockPartner, {
        modulesAll: 'COMS3011,COMS3012'
      });
      assert.strictEqual(result, true);
    });

    it('should not match all required modules when missing one', () => {
      const result = matchesModuleFilters(mockPartner, {
        modulesAll: 'COMS3011,COMS9999'
      });
      assert.strictEqual(result, false);
    });
  });

  describe('applyPagination', () => {
    const mockResults = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

    it('should apply pagination correctly', () => {
      const result = applyPagination(mockResults, 2, 10);
      assert.strictEqual(result.pagination.page, 2);
      assert.strictEqual(result.pagination.limit, 10);
      assert.strictEqual(result.pagination.total, 25);
      assert.strictEqual(result.pagination.totalPages, 3);
      assert.strictEqual(result.pagination.hasNext, true);
      assert.strictEqual(result.pagination.hasPrev, true);
      assert.strictEqual(result.results.length, 10);
    });

    it('should handle first page', () => {
      const result = applyPagination(mockResults, 1, 10);
      assert.strictEqual(result.pagination.page, 1);
      assert.strictEqual(result.pagination.hasPrev, false);
      assert.strictEqual(result.pagination.hasNext, true);
    });

    it('should handle last page', () => {
      const result = applyPagination(mockResults, 3, 10);
      assert.strictEqual(result.pagination.page, 3);
      assert.strictEqual(result.pagination.hasPrev, true);
      assert.strictEqual(result.pagination.hasNext, false);
    });
  });

  describe('searchPartners', () => {
    const mockPartners = [
      { id: 1, modules: ['COMS3011'] },
      { id: 2, modules: ['COMS3012'] },
      { id: 3, modules: ['COMS3011', 'COMS3012'] }
    ];

    it('should filter and paginate results', () => {
      const result = searchPartners(mockPartners, {
        module: 'COMS3011',
        page: 1,
        limit: 2
      });
      assert.strictEqual(result.pagination.total, 2);
      assert.strictEqual(result.results.length, 2);
    });

    it('should handle empty filters', () => {
      const result = searchPartners(mockPartners);
      assert.strictEqual(result.pagination.total, 3);
      assert.strictEqual(result.pagination.page, 1);
      assert.strictEqual(result.pagination.limit, 10);
    });
  });
});
