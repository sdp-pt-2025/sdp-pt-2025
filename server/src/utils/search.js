/**
 * Search utility functions for partners
 */

/**
 * Parse comma-separated module string into array
 * @param {string} modulesStr - Comma-separated modules string
 * @returns {string[]} Array of trimmed, uppercase modules
 */
export const parseModules = modulesStr => {
  if (!modulesStr) return [];
  return modulesStr
    .split(',')
    .map(m => m.trim().toUpperCase())
    .filter(Boolean);
};

/**
 * Check if a partner matches module filters
 * @param {Object} partner - Partner object with modules array
 * @param {Object} filters - Filter object
 * @returns {boolean} Whether partner matches filters
 */
export const matchesModuleFilters = (partner, filters) => {
  const partnerModules = partner.modules || [];

  // Single module filter
  if (filters.module) {
    const targetModule = filters.module.trim().toUpperCase();
    if (!partnerModules.includes(targetModule)) {
      return false;
    }
  }

  // Anti-search: exclude partners with specific module
  if (filters.notModule) {
    const excludeModule = filters.notModule.trim().toUpperCase();
    if (partnerModules.includes(excludeModule)) {
      return false;
    }
  }

  // Multiple modules: any match
  if (filters.modules) {
    const targetModules = parseModules(filters.modules);
    if (targetModules.length > 0) {
      const hasAnyMatch = targetModules.some(target =>
        partnerModules.includes(target)
      );
      if (!hasAnyMatch) {
        return false;
      }
    }
  }

  // Multiple modules: must match all
  if (filters.modulesAll) {
    const targetModules = parseModules(filters.modulesAll);
    if (targetModules.length > 0) {
      const hasAllMatches = targetModules.every(target =>
        partnerModules.includes(target)
      );
      if (!hasAllMatches) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Apply pagination to results
 * @param {Array} results - Array of results
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @returns {Object} Paginated results with metadata
 */
export const applyPagination = (results, page = 1, limit = 10) => {
  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedResults = results.slice(startIndex, endIndex);

  return {
    results: paginatedResults,
    pagination: {
      page: currentPage,
      limit,
      total,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    }
  };
};

/**
 * Search and filter partners with all options
 * @param {Array} partners - Array of all partners
 * @param {Object} filters - Filter object
 * @returns {Object} Filtered and paginated results
 */
export const searchPartners = (partners, filters = {}) => {
  // Apply module filters
  const filteredPartners = partners.filter(partner =>
    matchesModuleFilters(partner, filters)
  );

  // Apply pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;

  return applyPagination(filteredPartners, page, limit);
};

/**
 * Get search summary for debugging/logging
 * @param {Object} filters - Applied filters
 * @param {Object} pagination - Pagination info
 * @returns {Object} Search summary
 */
export const getSearchSummary = (filters, pagination) => {
  return {
    filters: {
      module: filters.module || null,
      notModule: filters.notModule || null,
      modules: filters.modules || null,
      modulesAll: filters.modulesAll || null,
      page: parseInt(filters.page) || 1,
      limit: parseInt(filters.limit) || 10
    },
    pagination,
    timestamp: new Date().toISOString()
  };
};
