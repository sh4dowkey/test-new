/**
 * text.js
 * Text transformation operations
 */

const TextOperations = {
  // ========================================
  // Case Transformations
  // ========================================
  toUpper: {
    name: 'To Uppercase',
    category: 'text',
    icon: '🔠',
    description: 'Convert to uppercase',
    params: [],
    fn: (input) => String(input).toUpperCase()
  },

  toLower: {
    name: 'To Lowercase',
    category: 'text',
    icon: '🔡',
    description: 'Convert to lowercase',
    params: [],
    fn: (input) => String(input).toLowerCase()
  },

  toTitleCase: {
    name: 'To Title Case',
    category: 'text',
    icon: '🔤',
    description: 'Convert to title case',
    params: [],
    fn: (input) => {
      return String(input)
        .toLowerCase()
        .replace(/(?:^|\s)\w/g, match => match.toUpperCase());
    }
  },

  swapCase: {
    name: 'Swap Case',
    category: 'text',
    icon: '🔄',
    description: 'Swap uppercase and lowercase',
    params: [],
    fn: (input) => {
      return String(input)
        .split('')
        .map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())
        .join('');
    }
  },

  // ========================================
  // String Manipulations
  // ========================================
  reverse: {
    name: 'Reverse',
    category: 'text',
    icon: '↩️',
    description: 'Reverse text order',
    params: [],
    fn: (input) => String(input).split('').reverse().join('')
  },

  trim: {
    name: 'Trim Whitespace',
    category: 'text',
    icon: '✂️',
    description: 'Remove leading and trailing whitespace',
    params: [],
    fn: (input) => String(input).trim()
  },

  removeSpaces: {
    name: 'Remove Spaces',
    category: 'text',
    icon: '✂️',
    description: 'Remove all spaces',
    params: [],
    fn: (input) => String(input).replace(/\s+/g, '')
  },

  normalizeWhitespace: {
    name: 'Normalize Whitespace',
    category: 'text',
    icon: '📏',
    description: 'Replace multiple spaces with single space',
    params: [],
    fn: (input) => String(input).replace(/\s+/g, ' ').trim()
  },

  // ========================================
  // Advanced Text Operations
  // ========================================
  removeLineBreaks: {
    name: 'Remove Line Breaks',
    category: 'text',
    icon: '📄',
    description: 'Remove all line breaks',
    params: [],
    fn: (input) => String(input).replace(/[\r\n]+/g, ' ')
  },

  addLineNumbers: {
    name: 'Add Line Numbers',
    category: 'text',
    icon: '🔢',
    description: 'Add line numbers to text',
    params: [
      { name: 'start', label: 'Start From', type: 'number', default: '1' },
      { name: 'padding', label: 'Padding', type: 'number', default: '0' }
    ],
    fn: (input, params = {}) => {
      const start = parseInt(params.start) || 1;
      const padding = parseInt(params.padding) || 0;
      const lines = String(input).split('\n');
      return lines.map((line, i) => {
        const num = (start + i).toString().padStart(padding, '0');
        return `${num}. ${line}`;
      }).join('\n');
    }
  },

  sortLines: {
    name: 'Sort Lines',
    category: 'text',
    icon: '🔤',
    description: 'Sort lines alphabetically',
    params: [
      { name: 'order', label: 'Order', type: 'select', options: ['asc', 'desc'], default: 'asc' }
    ],
    fn: (input, params = {}) => {
      const lines = String(input).split('\n');
      lines.sort((a, b) => {
        const comparison = a.localeCompare(b);
        return params.order === 'desc' ? -comparison : comparison;
      });
      return lines.join('\n');
    }
  },

  removeDuplicateLines: {
    name: 'Remove Duplicate Lines',
    category: 'text',
    icon: '🗑️',
    description: 'Remove duplicate lines',
    params: [],
    fn: (input) => {
      const lines = String(input).split('\n');
      return [...new Set(lines)].join('\n');
    }
  },

  // ========================================
  // Find & Replace
  // ========================================
  findReplace: {
    name: 'Find & Replace',
    category: 'text',
    icon: '🔍',
    description: 'Find and replace text',
    params: [
      { name: 'find', label: 'Find', type: 'text', required: true },
      { name: 'replace', label: 'Replace With', type: 'text', default: '' },
      { name: 'caseSensitive', label: 'Case Sensitive', type: 'checkbox', default: false }
    ],
    fn: (input, params = {}) => {
      if (!params.find) throw new Error('Find parameter is required');
      const flags = params.caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(params.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      return String(input).replace(regex, params.replace || '');
    }
  },

  // ========================================
  // Character Operations
  // ========================================
  countCharacters: {
    name: 'Count Characters',
    category: 'text',
    icon: '📊',
    description: 'Count characters (returns JSON)',
    params: [],
    fn: (input) => {
      const text = String(input);
      const counts = {
        total: text.length,
        letters: (text.match(/[a-zA-Z]/g) || []).length,
        digits: (text.match(/\d/g) || []).length,
        spaces: (text.match(/\s/g) || []).length,
        words: text.trim().split(/\s+/).filter(w => w.length > 0).length,
        lines: text.split('\n').length
      };
      return JSON.stringify(counts, null, 2);
    }
  },

  extractEmails: {
    name: 'Extract Emails',
    category: 'text',
    icon: '📧',
    description: 'Extract email addresses',
    params: [],
    fn: (input) => {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = String(input).match(emailRegex) || [];
      return [...new Set(emails)].join('\n');
    }
  },

  extractUrls: {
    name: 'Extract URLs',
    category: 'text',
    icon: '🔗',
    description: 'Extract URLs from text',
    params: [],
    fn: (input) => {
      const urlRegex = /https?:\/\/[^\s]+/g;
      const urls = String(input).match(urlRegex) || [];
      return [...new Set(urls)].join('\n');
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextOperations;
}