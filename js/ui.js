/**
 * ui.js
 * UI management, rendering, and activity logger
 */

const CryptoUI = (function() {
  'use strict';

  const { $, $$, formatCharCount } = CryptoUtils;

  // ========================================
  // Activity Logger
  // ========================================
  const Logger = {
    log(message, type = 'info') {
      const logContent = $('log-content');
      if (!logContent) return;

      // Remove placeholder if exists
      const placeholder = logContent.querySelector('.log-placeholder');
      if (placeholder) {
        placeholder.remove();
      }

      const entry = document.createElement('div');
      entry.className = `log-entry log-${type}`;
      
      const timestamp = new Date().toLocaleTimeString();
      entry.innerHTML = `
        <span class="log-time">${timestamp}</span>
        <span class="log-message">${message}</span>
      `;
      
      logContent.appendChild(entry);
      logContent.scrollTop = logContent.scrollHeight;
    },

    info(message) {
      this.log(message, 'info');
    },

    success(message) {
      this.log('✓ ' + message, 'success');
    },

    error(message) {
      this.log('✗ ' + message, 'error');
    },

    warning(message) {
      this.log('⚠ ' + message, 'warning');
    },

    clear() {
      const logContent = $('log-content');
      if (!logContent) return;
      
      logContent.innerHTML = `
        <div class="log-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p>Activity logs will appear here</p>
        </div>
      `;
    },

    // Note: toggle(), open(), close() removed - now handled in app.js
  };

  // ========================================
  // Character Counter
  // ========================================
  function updateCharCount(textarea, countElement) {
    if (!textarea || !countElement) return;
    const count = textarea.value.length;
    countElement.textContent = formatCharCount(count);
  }

  // ========================================
  // Operations List Renderer
  // ========================================
  function renderOperations() {
    const list = $('operation-list');
    if (!list) return;

    list.innerHTML = '';
    const operations = CryptoOperations.getAll();

    Object.entries(operations).forEach(([key, op]) => {
      const item = document.createElement('div');
      item.className = 'operation-item';
      
      const icon = op.icon ? `<span class="operation-icon">${op.icon}</span>` : '';
      item.innerHTML = `${icon} ${op.name}`;
      
      item.dataset.operation = key;
      item.dataset.category = op.category;
      item.title = op.description;
      list.appendChild(item);
    });
  }

  // ========================================
  // Recipe Renderer with Enhanced Parameters
  // ========================================
  function renderRecipe(recipe) {
    const container = $('recipe-steps');
    const template = $('step-template');
    const countEl = $('recipe-count');

    if (!container || !template) return;

    // Update count
    if (countEl) countEl.textContent = recipe.length;

    // Clear container
    container.innerHTML = '';

    // Show empty state
    if (recipe.length === 0) {
      container.innerHTML = `
        <div class="empty-recipe">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <p>Click operations from the left to add steps</p>
          <p class="empty-recipe-hint">Build your transformation pipeline</p>
        </div>
      `;
      return;
    }

    // Render each step
    recipe.forEach((step, index) => {
      const clone = template.content.cloneNode(true);
      const stepEl = clone.querySelector('.recipe-step');
      const operation = CryptoOperations.get(step.op);

      if (!operation) return;

      stepEl.dataset.index = index;

      // Set step number and name
      const numberEl = clone.querySelector('.step-number');
      const nameEl = clone.querySelector('.step-name');
      const paramsEl = clone.querySelector('.step-params');

      if (numberEl) numberEl.textContent = index + 1;
      if (nameEl) {
        nameEl.textContent = operation.name;
      }
      
      // Display current parameters
      if (paramsEl && step.params && operation.params && operation.params.length > 0) {
        const paramStrings = [];
        operation.params.forEach(paramDef => {
          const value = step.params[paramDef.name];
          if (value !== undefined && value !== '') {
            paramStrings.push(`${paramDef.label}: ${value}`);
          }
        });
        
        if (paramStrings.length > 0) {
          paramsEl.textContent = paramStrings.join(', ');
        } else {
          paramsEl.textContent = '';
        }
      }

      // Generate parameter inputs in edit form
      const paramInputsContainer = clone.querySelector('.param-inputs');
      if (paramInputsContainer && operation.params && operation.params.length > 0) {
        operation.params.forEach(paramDef => {
          const inputWrapper = document.createElement('div');
          inputWrapper.className = 'param-input-wrapper';
          
          const label = document.createElement('label');
          label.textContent = paramDef.label;
          label.style.fontSize = '0.75rem';
          label.style.color = 'var(--color-text-secondary)';
          label.style.display = 'block';
          label.style.marginBottom = '0.25rem';
          
          inputWrapper.appendChild(label);
          
          let input;
          const currentValue = step.params[paramDef.name];
          
          if (paramDef.type === 'select') {
            // Dropdown select
            input = document.createElement('select');
            input.className = 'param-input';
            paramDef.options.forEach(opt => {
              const option = document.createElement('option');
              option.value = opt;
              option.textContent = opt;
              if (opt === currentValue) option.selected = true;
              input.appendChild(option);
            });
          } else if (paramDef.type === 'checkbox') {
            // Checkbox
            input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = currentValue === true || currentValue === 'true';
            input.style.width = 'auto';
            input.style.marginTop = '0.25rem';
          } else if (paramDef.type === 'number') {
            // Number input
            input = document.createElement('input');
            input.type = 'number';
            input.className = 'param-input';
            input.value = currentValue !== undefined ? currentValue : (paramDef.default || '');
            if (paramDef.min !== undefined) input.min = paramDef.min;
            if (paramDef.max !== undefined) input.max = paramDef.max;
            if (paramDef.placeholder) input.placeholder = paramDef.placeholder;
          } else {
            // Text input (default)
            input = document.createElement('input');
            input.type = 'text';
            input.className = 'param-input';
            input.value = currentValue !== undefined ? currentValue : (paramDef.default || '');
            if (paramDef.placeholder) input.placeholder = paramDef.placeholder;
          }
          
          input.dataset.param = paramDef.name;
          if (paramDef.required) {
            input.required = true;
            label.innerHTML += ' <span style="color: var(--color-danger);">*</span>';
          }
          
          inputWrapper.appendChild(input);
          paramInputsContainer.appendChild(inputWrapper);
        });
      }

      container.appendChild(clone);
    });
  }

  // ========================================
  // Category Filter
  // ========================================
  function filterOperations(category) {
    const items = $$('.operation-item');
    items.forEach(item => {
      if (category === 'all' || item.dataset.category === category) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  }

  // ========================================
  // Search Operations
  // ========================================
  function searchOperations(query) {
    const items = $$('.operation-item');
    const searchTerm = query.toLowerCase();
    
    if (!searchTerm) {
      // Show all if search is empty
      items.forEach(item => item.classList.remove('hidden'));
      return;
    }
    
    items.forEach(item => {
      const name = item.textContent.toLowerCase();
      if (name.includes(searchTerm)) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  }

  // ========================================
  // Auto-Detect Display
  // ========================================
  function displayAutoDetect(detection) {
    if (!detection.detected || !detection.analysis) {
      Logger.warning('Could not detect input format');
      Logger.info(detection.details || 'Unknown format');
      return;
    }

    Logger.success(`Detected: ${detection.type}`);
    Logger.info(`Confidence: ${detection.confidence}`);
    
    Object.entries(detection.analysis).forEach(([key, value]) => {
      Logger.info(`${key}: ${value}`);
    });

    if (detection.operation) {
      const op = CryptoOperations.get(detection.operation);
      Logger.success(`Recommended: ${op?.name || detection.operation}`);
    }
  }

  // ========================================
  // Execution Results Display
  // ========================================
  function displayExecutionResults(results) {
    const { totalTime, steps, inputSize, outputSize, success } = results;

    if (success) {
      Logger.success(`✓ Recipe completed in ${totalTime}`);
      Logger.info(`Input: ${inputSize.toLocaleString()} chars → Output: ${outputSize.toLocaleString()} chars`);
      
      if (steps && steps.length > 0) {
        Logger.info(`Executed ${steps.length} step(s):`);
        steps.forEach((step) => {
          Logger.info(`  ${step.step}. ${step.name} (${step.time})`);
        });
      }
    } else {
      Logger.error('✗ Execution failed');
      if (results.error) {
        Logger.error(results.error);
      }
    }
  }

  // ========================================
  // Step-by-Step Execution Display
  // ========================================
  function displayStepExecution(stepNum, stepName, result, time) {
    Logger.info(`Step ${stepNum}: ${stepName}`);
    Logger.success(`✓ Completed in ${time}`);
    Logger.info(`Output: ${result.length.toLocaleString()} chars`);
  }

  // ========================================
  // Update Execution Time Badge
  // ========================================
  function updateExecutionTime(time) {
    const badge = $('execution-time');
    if (badge) {
      badge.textContent = time;
    }
  }

  // ========================================
  // Clear Execution Time
  // ========================================
  function clearExecutionTime() {
    const badge = $('execution-time');
    if (badge) {
      badge.textContent = '';
    }
  }

  // ========================================
  // Public API
  // ========================================
  return {
    Logger,
    updateCharCount,
    renderOperations,
    renderRecipe,
    filterOperations,
    searchOperations,
    displayAutoDetect,
    displayExecutionResults,
    displayStepExecution,
    updateExecutionTime,
    clearExecutionTime
  };
})();