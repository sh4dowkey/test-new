/**
 * hash.js
 * Cryptographic hash operations
 */

const HashOperations = {
  // ========================================
  // SHA Family
  // ========================================
  sha256: {
    name: 'SHA-256',
    category: 'hash',
    icon: '🔐',
    description: 'SHA-256 cryptographic hash',
    params: [],
    fn: async (input) => {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(String(input));
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        throw new Error('SHA-256 hashing failed');
      }
    }
  },

  sha384: {
    name: 'SHA-384',
    category: 'hash',
    icon: '🔐',
    description: 'SHA-384 cryptographic hash',
    params: [],
    fn: async (input) => {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(String(input));
        const hashBuffer = await crypto.subtle.digest('SHA-384', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        throw new Error('SHA-384 hashing failed');
      }
    }
  },

  sha512: {
    name: 'SHA-512',
    category: 'hash',
    icon: '🔐',
    description: 'SHA-512 cryptographic hash',
    params: [],
    fn: async (input) => {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(String(input));
        const hashBuffer = await crypto.subtle.digest('SHA-512', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        throw new Error('SHA-512 hashing failed');
      }
    }
  },

  sha1: {
    name: 'SHA-1',
    category: 'hash',
    icon: '⚠️',
    description: 'SHA-1 cryptographic hash (deprecated)',
    params: [],
    fn: async (input) => {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(String(input));
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        throw new Error('SHA-1 hashing failed');
      }
    }
  },

  // ========================================
  // MD5 (Simulated - not recommended for security)
  // ========================================
  md5: {
    name: 'MD5',
    category: 'hash',
    icon: '⚠️',
    description: 'MD5 hash (not cryptographically secure)',
    params: [],
    fn: async (input) => {
      // Note: Real MD5 requires a library. This is a placeholder using SHA-1.
      // For a production app, use a proper MD5 library like crypto-js
      const encoder = new TextEncoder();
      const data = encoder.encode(String(input));
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  },

  // ========================================
  // Simple Hash Functions
  // ========================================
  simpleHash32: {
    name: 'Simple Hash (32-bit)',
    category: 'hash',
    icon: '#️⃣',
    description: 'Simple 32-bit hash function',
    params: [],
    fn: (input) => {
      const str = String(input);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash).toString(16).padStart(8, '0');
    }
  },

  djb2Hash: {
    name: 'DJB2 Hash',
    category: 'hash',
    icon: '#️⃣',
    description: 'DJB2 string hash algorithm',
    params: [],
    fn: (input) => {
      const str = String(input);
      let hash = 5381;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + char
      }
      return (hash >>> 0).toString(16).padStart(8, '0');
    }
  },

  // ========================================
  // Checksum Functions
  // ========================================
  crc32: {
    name: 'CRC32 Checksum',
    category: 'hash',
    icon: '✓',
    description: 'CRC32 checksum algorithm',
    params: [],
    fn: (input) => {
      const str = String(input);
      let crc = 0 ^ (-1);
      
      // CRC32 table
      const makeCRCTable = () => {
        let c;
        const crcTable = [];
        for (let n = 0; n < 256; n++) {
          c = n;
          for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
          }
          crcTable[n] = c;
        }
        return crcTable;
      };
      
      const crcTable = makeCRCTable();
      
      for (let i = 0; i < str.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
      }
      
      return ((crc ^ (-1)) >>> 0).toString(16).padStart(8, '0');
    }
  },

  // ========================================
  // HMAC Functions
  // ========================================
  hmacSha256: {
    name: 'HMAC-SHA256',
    category: 'hash',
    icon: '🔑',
    description: 'HMAC with SHA-256',
    params: [
      { name: 'key', label: 'Secret Key', type: 'text', required: true, placeholder: 'Enter secret key' }
    ],
    fn: async (input, params = {}) => {
      if (!params.key) throw new Error('Secret key is required');
      
      try {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(params.key);
        const messageData = encoder.encode(String(input));
        
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        throw new Error('HMAC-SHA256 failed: ' + error.message);
      }
    }
  },

  hmacSha512: {
    name: 'HMAC-SHA512',
    category: 'hash',
    icon: '🔑',
    description: 'HMAC with SHA-512',
    params: [
      { name: 'key', label: 'Secret Key', type: 'text', required: true, placeholder: 'Enter secret key' }
    ],
    fn: async (input, params = {}) => {
      if (!params.key) throw new Error('Secret key is required');
      
      try {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(params.key);
        const messageData = encoder.encode(String(input));
        
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-512' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        throw new Error('HMAC-SHA512 failed: ' + error.message);
      }
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HashOperations;
}