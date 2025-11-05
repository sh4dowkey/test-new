/**
 * cipher.js
 * Classical and modern cipher operations
 */

const CipherOperations = {
  // ========================================
  // ROT Ciphers
  // ========================================
  rot13: {
    name: 'ROT13',
    category: 'cipher',
    icon: '🔄',
    description: 'ROT13 cipher transformation',
    params: [],
    fn: (input) => {
      return String(input).replace(/[a-zA-Z]/g, c => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(
          base + ((c.charCodeAt(0) - base + 13) % 26)
        );
      });
    }
  },

  caesar: {
    name: 'Caesar Cipher',
    category: 'cipher',
    icon: '🏛️',
    description: 'Caesar shift cipher',
    params: [
      { name: 'shift', label: 'Shift Amount', type: 'number', default: '3', min: 1, max: 25, required: true }
    ],
    fn: (input, params = {}) => {
      const shift = parseInt(params.shift) || 3;
      if (shift < 1 || shift > 25) {
        throw new Error('Shift must be between 1 and 25');
      }
      
      return String(input).replace(/[a-zA-Z]/g, c => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(
          base + ((c.charCodeAt(0) - base + shift) % 26)
        );
      });
    }
  },

  caesarDecrypt: {
    name: 'Caesar Decrypt',
    category: 'cipher',
    icon: '🏛️',
    description: 'Caesar shift cipher decryption',
    params: [
      { name: 'shift', label: 'Shift Amount', type: 'number', default: '3', min: 1, max: 25, required: true }
    ],
    fn: (input, params = {}) => {
      const shift = parseInt(params.shift) || 3;
      if (shift < 1 || shift > 25) {
        throw new Error('Shift must be between 1 and 25');
      }
      
      return String(input).replace(/[a-zA-Z]/g, c => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(
          base + ((c.charCodeAt(0) - base - shift + 26) % 26)
        );
      });
    }
  },

  // ========================================
  // Substitution Ciphers
  // ========================================
  atbash: {
    name: 'Atbash Cipher',
    category: 'cipher',
    icon: '🔀',
    description: 'Atbash substitution cipher',
    params: [],
    fn: (input) => {
      return String(input).replace(/[a-zA-Z]/g, c => {
        if (c >= 'a' && c <= 'z') {
          return String.fromCharCode(219 - c.charCodeAt(0)); // 'z' + 'a' = 219
        } else if (c >= 'A' && c <= 'Z') {
          return String.fromCharCode(155 - c.charCodeAt(0)); // 'Z' + 'A' = 155
        }
        return c;
      });
    }
  },

  vigenere: {
    name: 'Vigenère Cipher',
    category: 'cipher',
    icon: '🗝️',
    description: 'Vigenère polyalphabetic cipher',
    params: [
      { name: 'key', label: 'Key', type: 'text', required: true, placeholder: 'Enter cipher key' }
    ],
    fn: (input, params = {}) => {
      if (!params.key) throw new Error('Key is required');
      
      const key = String(params.key).toUpperCase().replace(/[^A-Z]/g, '');
      if (key.length === 0) throw new Error('Key must contain at least one letter');
      
      const text = String(input);
      let result = '';
      let keyIndex = 0;
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (/[a-zA-Z]/.test(char)) {
          const base = char <= 'Z' ? 65 : 97;
          const shift = key.charCodeAt(keyIndex % key.length) - 65;
          result += String.fromCharCode(
            base + ((char.charCodeAt(0) - base + shift) % 26)
          );
          keyIndex++;
        } else {
          result += char;
        }
      }
      
      return result;
    }
  },

  vigenereDecrypt: {
    name: 'Vigenère Decrypt',
    category: 'cipher',
    icon: '🗝️',
    description: 'Vigenère cipher decryption',
    params: [
      { name: 'key', label: 'Key', type: 'text', required: true, placeholder: 'Enter cipher key' }
    ],
    fn: (input, params = {}) => {
      if (!params.key) throw new Error('Key is required');
      
      const key = String(params.key).toUpperCase().replace(/[^A-Z]/g, '');
      if (key.length === 0) throw new Error('Key must contain at least one letter');
      
      const text = String(input);
      let result = '';
      let keyIndex = 0;
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (/[a-zA-Z]/.test(char)) {
          const base = char <= 'Z' ? 65 : 97;
          const shift = key.charCodeAt(keyIndex % key.length) - 65;
          result += String.fromCharCode(
            base + ((char.charCodeAt(0) - base - shift + 26) % 26)
          );
          keyIndex++;
        } else {
          result += char;
        }
      }
      
      return result;
    }
  },

  // ========================================
  // Rail Fence Cipher
  // ========================================
  railFence: {
    name: 'Rail Fence Cipher',
    category: 'cipher',
    icon: '🚂',
    description: 'Rail fence transposition cipher',
    params: [
      { name: 'rails', label: 'Number of Rails', type: 'number', default: '3', min: 2, max: 10, required: true }
    ],
    fn: (input, params = {}) => {
      const rails = parseInt(params.rails) || 3;
      if (rails < 2 || rails > 10) {
        throw new Error('Number of rails must be between 2 and 10');
      }
      
      const text = String(input);
      if (text.length < rails) return text;
      
      const fence = Array.from({ length: rails }, () => []);
      let rail = 0;
      let direction = 1;
      
      for (let char of text) {
        fence[rail].push(char);
        rail += direction;
        if (rail === 0 || rail === rails - 1) {
          direction = -direction;
        }
      }
      
      return fence.flat().join('');
    }
  },

  railFenceDecrypt: {
    name: 'Rail Fence Decrypt',
    category: 'cipher',
    icon: '🚂',
    description: 'Rail fence cipher decryption',
    params: [
      { name: 'rails', label: 'Number of Rails', type: 'number', default: '3', min: 2, max: 10, required: true }
    ],
    fn: (input, params = {}) => {
      const rails = parseInt(params.rails) || 3;
      if (rails < 2 || rails > 10) {
        throw new Error('Number of rails must be between 2 and 10');
      }
      
      const text = String(input);
      if (text.length < rails) return text;
      
      // Calculate pattern
      const fence = Array.from({ length: rails }, () => []);
      const pattern = [];
      let rail = 0;
      let direction = 1;
      
      for (let i = 0; i < text.length; i++) {
        pattern.push(rail);
        rail += direction;
        if (rail === 0 || rail === rails - 1) {
          direction = -direction;
        }
      }
      
      // Fill fence with characters
      let index = 0;
      for (let r = 0; r < rails; r++) {
        for (let i = 0; i < pattern.length; i++) {
          if (pattern[i] === r) {
            fence[r].push(text[index++]);
          }
        }
      }
      
      // Read fence
      let result = '';
      rail = 0;
      direction = 1;
      const railIndices = Array(rails).fill(0);
      
      for (let i = 0; i < text.length; i++) {
        result += fence[rail][railIndices[rail]++];
        rail += direction;
        if (rail === 0 || rail === rails - 1) {
          direction = -direction;
        }
      }
      
      return result;
    }
  },

  // ========================================
  // XOR Cipher
  // ========================================
  xorCipher: {
    name: 'XOR Cipher',
    category: 'cipher',
    icon: '⚡',
    description: 'XOR encryption/decryption',
    params: [
      { name: 'key', label: 'Key', type: 'text', required: true, placeholder: 'Enter key' }
    ],
    fn: (input, params = {}) => {
      if (!params.key) throw new Error('Key is required');
      
      const text = String(input);
      const key = String(params.key);
      let result = '';
      
      for (let i = 0; i < text.length; i++) {
        const textChar = text.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        result += String.fromCharCode(textChar ^ keyChar);
      }
      
      return result;
    }
  },

  // ========================================
  // Substitution with Custom Alphabet
  // ========================================
  substitution: {
    name: 'Substitution Cipher',
    category: 'cipher',
    icon: '🔤',
    description: 'Custom alphabet substitution',
    params: [
      { name: 'alphabet', label: 'Substitution Alphabet', type: 'text', required: true, placeholder: '26 unique letters' }
    ],
    fn: (input, params = {}) => {
      if (!params.alphabet) throw new Error('Substitution alphabet is required');
      
      const alphabet = String(params.alphabet).toUpperCase();
      if (alphabet.length !== 26 || new Set(alphabet).size !== 26) {
        throw new Error('Alphabet must contain exactly 26 unique letters');
      }
      
      const normalAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const text = String(input);
      let result = '';
      
      for (let char of text) {
        if (/[a-z]/.test(char)) {
          const index = char.toUpperCase().charCodeAt(0) - 65;
          result += alphabet[index].toLowerCase();
        } else if (/[A-Z]/.test(char)) {
          const index = char.charCodeAt(0) - 65;
          result += alphabet[index];
        } else {
          result += char;
        }
      }
      
      return result;
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CipherOperations;
}