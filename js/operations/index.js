/**
 * index.js
 * Combines all operation modules into a single registry
 */

const CryptoOperations = (function() {
  'use strict';

  // Combine all operation modules
  const operations = {
    ...EncodingOperations,
    ...TextOperations,
    ...HashOperations,
    ...CipherOperations
  };

  // Public API
  return {
    /**
     * Get all operations
     */
    getAll: () => operations,

    /**
     * Get a specific operation by key
     */
    get: (key) => operations[key],

    /**
     * Execute an operation
     */
    execute: async (key, input, params = {}) => {
      const op = operations[key];
      if (!op) {
        throw new Error(`Unknown operation: ${key}`);
      }

      // Validate required parameters
      if (op.params && op.params.length > 0) {
        for (const param of op.params) {
          if (param.required && !params[param.name]) {
            throw new Error(`Parameter "${param.label}" is required`);
          }
        }
      }

      return await op.fn(input, params);
    },

    /**
     * Get operations by category
     */
    getByCategory: (category) => {
      return Object.entries(operations)
        .filter(([_, op]) => op.category === category)
        .reduce((acc, [key, op]) => {
          acc[key] = op;
          return acc;
        }, {});
    },

    /**
     * Get all categories
     */
    getCategories: () => {
      const categories = new Set();
      Object.values(operations).forEach(op => {
        categories.add(op.category);
      });
      return Array.from(categories);
    },

    /**
     * Search operations by name or description
     */
    search: (query) => {
      const lowerQuery = query.toLowerCase();
      return Object.entries(operations)
        .filter(([_, op]) => 
          op.name.toLowerCase().includes(lowerQuery) ||
          op.description.toLowerCase().includes(lowerQuery)
        )
        .reduce((acc, [key, op]) => {
          acc[key] = op;
          return acc;
        }, {});
    },

    /**
     * Get operation count
     */
    count: () => Object.keys(operations).length
  };
})();