/**
 * utils.js
 * Utility functions for file operations, detection, and helpers
 */

const CryptoUtils = (function() {
  'use strict';

  // ========================================
  // DOM Helpers
  // ========================================
  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => document.querySelectorAll(selector);

  // ========================================
  // Clipboard Operations
  // ========================================
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text || '');
      return true;
    } catch (error) {
      throw new Error('Failed to copy to clipboard');
    }
  }

  // ========================================
  // File Operations
  // ========================================
  function downloadText(content, filename = 'output.txt') {
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('Failed to download file');
    }
  }

  function downloadJSON(obj, filename = 'recipe.json') {
    try {
      const blob = new Blob([JSON.stringify(obj, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('Failed to save JSON');
    }
  }

  async function readJSONFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          resolve(JSON.parse(reader.result));
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // ========================================
  // Auto-Detection
  // ========================================
  function detectInputType(text) {
    if (!text || typeof text !== 'string') {
      return {
        detected: false,
        type: null,
        confidence: 'none',
        details: 'Input is empty or invalid',
        operation: null,
        analysis: {}
      };
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return {
        detected: false,
        type: null,
        confidence: 'none',
        details: 'Input is empty',
        operation: null,
        analysis: {}
      };
    }

    const cleaned = trimmed.replace(/\s+/g, '');
    const results = {
      detected: false,
      type: 'text',
      confidence: 'low',
      operation: null,
      details: '',
      analysis: {}
    };

    try {
      // URL Encoded Detection (Priority 1)
      const urlEncodedRegex = /%[0-9A-Fa-f]{2}/;
      const urlEncodedCount = (trimmed.match(/%[0-9A-Fa-f]{2}/g) || []).length;
      
      if (urlEncodedRegex.test(trimmed) && urlEncodedCount >= 2) {
        results.detected = true;
        results.type = 'URL-encoded';
        results.confidence = urlEncodedCount > 5 ? 'high' : 'medium';
        results.operation = 'urlDecode';
        results.details = `Found ${urlEncodedCount} URL-encoded sequences`;
        results.analysis = {
          'Format': 'URL Encoding',
          'Encoded Sequences': urlEncodedCount,
          'Total Length': trimmed.length + ' chars',
          'Confidence': results.confidence,
          'Action': 'URL Decode recommended'
        };
        return results;
      }

      // Base64 Detection (Priority 2)
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      const isValidBase64Format = base64Regex.test(cleaned) && 
                                   cleaned.length % 4 === 0 && 
                                   cleaned.length > 0 &&
                                   /[A-Za-z0-9+/]/.test(cleaned);

      if (isValidBase64Format && cleaned.length >= 4) {
        try {
          const decoded = atob(cleaned);
          const isPrintable = /^[\x20-\x7E\s]*$/.test(decoded);
          
          results.detected = true;
          results.type = 'Base64';
          results.confidence = isPrintable && decoded.length > 0 ? 'high' : 'medium';
          results.operation = 'fromBase64';
          results.details = `Valid Base64 encoding detected`;
          results.analysis = {
            'Format': 'Base64 Encoding',
            'Encoded Length': cleaned.length + ' chars',
            'Decoded Length': decoded.length + ' chars',
            'Printable Text': isPrintable ? 'Yes' : 'No',
            'Confidence': results.confidence,
            'Action': 'From Base64 recommended'
          };
          return results;
        } catch (e) {
          // Not valid base64 despite format match
        }
      }

      // Hex Detection (Priority 3)
      const hexRegex = /^[0-9a-fA-F]+$/;
      const isValidHex = hexRegex.test(cleaned) && 
                         cleaned.length % 2 === 0 && 
                         cleaned.length > 0;

      if (isValidHex && cleaned.length >= 8) {
        const byteCount = cleaned.length / 2;
        
        results.detected = true;
        results.type = 'Hexadecimal';
        results.confidence = cleaned.length >= 16 ? 'high' : 'medium';
        results.operation = 'fromHex';
        results.details = `Valid hexadecimal string detected`;
        results.analysis = {
          'Format': 'Hexadecimal',
          'Hex Length': cleaned.length + ' chars',
          'Byte Count': byteCount + ' bytes',
          'Confidence': results.confidence,
          'Action': 'From Hex recommended'
        };
        return results;
      }

      // Plain Text (Default)
      const lineCount = (trimmed.match(/\n/g) || []).length + 1;
      const wordCount = trimmed.split(/\s+/).length;
      
      results.detected = true;
      results.type = 'Plain Text';
      results.confidence = 'high';
      results.operation = null;
      results.details = 'Standard text input';
      results.analysis = {
        'Format': 'Plain Text',
        'Characters': trimmed.length,
        'Lines': lineCount,
        'Words': wordCount,
        'Alphanumeric Only': /^[a-zA-Z0-9\s]+$/.test(trimmed) ? 'Yes' : 'No'
      };
      
      return results;

    } catch (error) {
      results.details = 'Analysis failed: ' + error.message;
      return results;
    }
  }

  // ========================================
  // Character Counting
  // ========================================
  function formatCharCount(count) {
    return `${count.toLocaleString()} char${count !== 1 ? 's' : ''}`;
  }

  // ========================================
  // Time Formatting
  // ========================================
  function formatExecutionTime(ms) {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  // ========================================
  // Recipe Validation
  // ========================================
  function validateRecipe(recipe) {
    if (!Array.isArray(recipe)) {
      throw new Error('Recipe must be an array');
    }

    for (let i = 0; i < recipe.length; i++) {
      const step = recipe[i];
      if (!step.op) {
        throw new Error(`Step ${i + 1} is missing operation`);
      }
      const operation = CryptoOperations.get(step.op);
      if (!operation) {
        throw new Error(`Step ${i + 1}: Unknown operation "${step.op}"`);
      }
    }

    return true;
  }

  // ========================================
  // Public API
  // ========================================
  return {
    $,
    $$,
    copyToClipboard,
    downloadText,
    downloadJSON,
    readJSONFile,
    detectInputType,
    formatCharCount,
    formatExecutionTime,
    validateRecipe
  };
})();