/**
 * encoding.js
 * Encoding/Decoding operations
 */

const EncodingOperations = {
  // ========================================
  // Base64
  // ========================================
  toBase64: {
    name: 'To Base64',
    category: 'encoding',
    icon: '📋',
    description: 'Encode text to Base64 format',
    params: [],
    fn: (input) => {
      try {
        return btoa(unescape(encodeURIComponent(String(input))));
      } catch (error) {
        throw new Error('Invalid input for Base64 encoding');
      }
    }
  },

  fromBase64: {
    name: 'From Base64',
    category: 'encoding',
    icon: '📋',
    description: 'Decode Base64 to text',
    params: [],
    fn: (input) => {
      try {
        const cleaned = String(input).replace(/\s+/g, '');
        return decodeURIComponent(escape(atob(cleaned)));
      } catch (error) {
        throw new Error('Invalid Base64 string');
      }
    }
  },

  // ========================================
  // Base32
  // ========================================
  toBase32: {
    name: 'To Base32',
    category: 'encoding',
    icon: '🔢',
    description: 'Encode text to Base32 format',
    params: [],
    fn: (input) => {
      const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      const bytes = new TextEncoder().encode(String(input));
      let bits = '';
      
      for (let byte of bytes) {
        bits += byte.toString(2).padStart(8, '0');
      }
      
      let result = '';
      for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.slice(i, i + 5).padEnd(5, '0');
        result += base32chars[parseInt(chunk, 2)];
      }
      
      // Add padding
      while (result.length % 8 !== 0) {
        result += '=';
      }
      
      return result;
    }
  },

  fromBase32: {
    name: 'From Base32',
    category: 'encoding',
    icon: '🔢',
    description: 'Decode Base32 to text',
    params: [],
    fn: (input) => {
      const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      const cleaned = String(input).replace(/=+$/, '').toUpperCase();
      let bits = '';
      
      for (let char of cleaned) {
        const index = base32chars.indexOf(char);
        if (index === -1) throw new Error('Invalid Base32 character');
        bits += index.toString(2).padStart(5, '0');
      }
      
      const bytes = [];
      for (let i = 0; i < bits.length; i += 8) {
        if (i + 8 <= bits.length) {
          bytes.push(parseInt(bits.slice(i, i + 8), 2));
        }
      }
      
      return new TextDecoder().decode(new Uint8Array(bytes));
    }
  },

  // ========================================
  // Hexadecimal
  // ========================================
  toHex: {
    name: 'To Hex',
    category: 'encoding',
    icon: '🔢',
    description: 'Convert text to hexadecimal',
    params: [
      { name: 'separator', label: 'Separator', type: 'text', default: '', placeholder: 'e.g., " " or ":"' }
    ],
    fn: (input, params = {}) => {
      try {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(String(input));
        const separator = params.separator || '';
        return Array.from(bytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join(separator);
      } catch (error) {
        throw new Error('Hex encoding failed');
      }
    }
  },

  fromHex: {
    name: 'From Hex',
    category: 'encoding',
    icon: '🔢',
    description: 'Convert hexadecimal to text',
    params: [],
    fn: (input) => {
      try {
        const cleaned = String(input).replace(/[\s:,-]/g, '');
        if (cleaned.length % 2 !== 0) {
          throw new Error('Hex string length must be even');
        }
        const bytes = cleaned.match(/.{1,2}/g).map(h => parseInt(h, 16));
        if (bytes.some(isNaN)) {
          throw new Error('Invalid hex characters');
        }
        const decoder = new TextDecoder();
        return decoder.decode(new Uint8Array(bytes));
      } catch (error) {
        throw new Error('Invalid hex string: ' + error.message);
      }
    }
  },

  // ========================================
  // URL Encoding
  // ========================================
  urlEncode: {
    name: 'URL Encode',
    category: 'encoding',
    icon: '🌐',
    description: 'Encode text for URLs',
    params: [],
    fn: (input) => encodeURIComponent(String(input))
  },

  urlDecode: {
    name: 'URL Decode',
    category: 'encoding',
    icon: '🌐',
    description: 'Decode URL-encoded text',
    params: [],
    fn: (input) => {
      try {
        return decodeURIComponent(String(input));
      } catch (error) {
        throw new Error('Invalid URL encoding');
      }
    }
  },

  // ========================================
  // Binary
  // ========================================
  toBinary: {
    name: 'To Binary',
    category: 'encoding',
    icon: '💻',
    description: 'Convert text to binary',
    params: [
      { name: 'separator', label: 'Separator', type: 'text', default: ' ', placeholder: 'e.g., " " or ""' }
    ],
    fn: (input, params = {}) => {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(String(input));
      const separator = params.separator !== undefined ? params.separator : ' ';
      return Array.from(bytes)
        .map(b => b.toString(2).padStart(8, '0'))
        .join(separator);
    }
  },

  fromBinary: {
    name: 'From Binary',
    category: 'encoding',
    icon: '💻',
    description: 'Convert binary to text',
    params: [],
    fn: (input) => {
      try {
        const cleaned = String(input).replace(/[^01]/g, '');
        if (cleaned.length % 8 !== 0) {
          throw new Error('Binary string length must be multiple of 8');
        }
        const bytes = cleaned.match(/.{8}/g).map(b => parseInt(b, 2));
        const decoder = new TextDecoder();
        return decoder.decode(new Uint8Array(bytes));
      } catch (error) {
        throw new Error('Invalid binary string: ' + error.message);
      }
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EncodingOperations;
}