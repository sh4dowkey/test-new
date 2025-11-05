/**
 * app.js
 * Main application controller with enhanced features
 */

(function() {
  'use strict';

  const { $, $$, copyToClipboard, downloadText, downloadJSON, readJSONFile, 
          detectInputType, formatExecutionTime, validateRecipe } = CryptoUtils;
  
  const { Logger, updateCharCount, renderOperations, renderRecipe, 
          filterOperations, searchOperations, displayAutoDetect, 
          displayExecutionResults, displayStepExecution, updateExecutionTime, 
          clearExecutionTime } = CryptoUI;

  // ========================================
  // Application State
  // ========================================
  let recipe = [];
  let currentStepIndex = 0;
  let logIsOpen = false; // Track log panel state

  // ========================================
  // Recipe Management
  // ========================================
  function addOperation(opKey) {
    const operation = CryptoOperations.get(opKey);
    if (!operation) {
      Logger.error(`Unknown operation: ${opKey}`);
      return;
    }

    const params = {};
    // Initialize default parameters
    if (operation.params && operation.params.length > 0) {
      operation.params.forEach(param => {
        params[param.name] = param.default || '';
      });
    }

    recipe.push({ op: opKey, params });
    renderRecipe(recipe);
    Logger.success(`Added: ${operation.name}`);
  }

  function removeOperation(index) {
    if (index < 0 || index >= recipe.length) return;
    
    const operation = CryptoOperations.get(recipe[index].op);
    recipe.splice(index, 1);
    renderRecipe(recipe);
    Logger.info(`Removed: ${operation?.name || 'Unknown'}`);
  }

  function updateOperation(index, params) {
    if (index < 0 || index >= recipe.length) return;
    
    recipe[index].params = params;
    renderRecipe(recipe);
    Logger.success('Parameters updated');
  }

  function moveOperation(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= recipe.length) return;
    if (toIndex < 0 || toIndex >= recipe.length) return;
    if (fromIndex === toIndex) return;

    const [movedItem] = recipe.splice(fromIndex, 1);
    recipe.splice(toIndex, 0, movedItem);
    renderRecipe(recipe);
    Logger.info('Step reordered');
  }

  function clearRecipe() {
    if (recipe.length === 0) {
      Logger.info('Recipe is already empty');
      return;
    }
    
    recipe = [];
    currentStepIndex = 0;
    renderRecipe(recipe);
    Logger.success('Recipe cleared');
  }

  // ========================================
  // Recipe Execution
  // ========================================
  async function executeRecipe() {
    const inputEl = $('input');
    const outputEl = $('output');

    if (!inputEl || !outputEl) return;

    const input = inputEl.value;
    
    if (!input) {
      Logger.error('Input is empty');
      Logger.open();
      return;
    }

    if (recipe.length === 0) {
      Logger.error('Recipe is empty. Add operations first.');
      Logger.open();
      return;
    }

    Logger.info('Starting execution...');
    Logger.open();

    const startTime = performance.now();
    let result = input;
    const executionLog = [];

    try {
      for (let i = 0; i < recipe.length; i++) {
        const step = recipe[i];
        const stepStart = performance.now();

        try {
          result = await CryptoOperations.execute(step.op, result, step.params || {});
          const stepTime = performance.now() - stepStart;
          const operation = CryptoOperations.get(step.op);
          
          executionLog.push({
            step: i + 1,
            name: operation.name,
            time: formatExecutionTime(stepTime),
            success: true
          });

          Logger.info(`Step ${i + 1}: ${operation.name} completed in ${formatExecutionTime(stepTime)}`);
        } catch (error) {
          throw new Error(`Step ${i + 1}: ${error.message}`);
        }
      }

      outputEl.value = result;
      updateCharCount(outputEl, document.querySelector('.output-char-count'));

      const totalTime = performance.now() - startTime;
      const formattedTime = formatExecutionTime(totalTime);
      updateExecutionTime(formattedTime);

      displayExecutionResults({
        totalTime: formattedTime,
        steps: executionLog,
        inputSize: input.length,
        outputSize: result.length,
        success: true
      });

      Logger.success(`✓ Execution completed in ${formattedTime}`);

    } catch (error) {
      Logger.error(error.message);
      outputEl.value = `Error: ${error.message}`;
      displayExecutionResults({
        success: false,
        error: error.message
      });
    }
  }

  // ========================================
  // Step-by-Step Execution
  // ========================================
  async function executeStepByStep() {
    const inputEl = $('input');
    const outputEl = $('output');

    if (!inputEl || !outputEl) return;

    if (recipe.length === 0) {
      Logger.error('Recipe is empty. Add operations first.');
      Logger.open();
      return;
    }

    // Initialize on first call
    if (currentStepIndex === 0) {
      const input = inputEl.value;
      if (!input) {
        Logger.error('Input is empty');
        Logger.open();
        return;
      }
      outputEl.value = input;
      Logger.info('Starting step-by-step execution...');
      Logger.open();
    }

    if (currentStepIndex >= recipe.length) {
      Logger.success('All steps completed!');
      currentStepIndex = 0;
      return;
    }

    const step = recipe[currentStepIndex];
    const input = outputEl.value;

    try {
      const stepStart = performance.now();
      const result = await CryptoOperations.execute(step.op, input, step.params || {});
      const stepTime = performance.now() - stepStart;
      const operation = CryptoOperations.get(step.op);

      outputEl.value = result;
      updateCharCount(outputEl, document.querySelector('.output-char-count'));
      updateExecutionTime(formatExecutionTime(stepTime));

      displayStepExecution(
        currentStepIndex + 1,
        operation.name,
        result,
        formatExecutionTime(stepTime)
      );

      Logger.success(`✓ Step ${currentStepIndex + 1}: ${operation.name} completed`);

      currentStepIndex++;

      if (currentStepIndex >= recipe.length) {
        Logger.success('All steps completed!');
        setTimeout(() => {
          currentStepIndex = 0;
        }, 2000);
      }

    } catch (error) {
      Logger.error(`Step ${currentStepIndex + 1} failed: ${error.message}`);
      outputEl.value = `Error: ${error.message}`;
      currentStepIndex = 0;
    }
  }

  // ========================================
  // File Operations
  // ========================================
  function saveRecipe() {
    if (recipe.length === 0) {
      Logger.error('Recipe is empty');
      Logger.open();
      return;
    }

    try {
      downloadJSON(recipe, 'cryptosuite-recipe.json');
      Logger.success('Recipe saved successfully');
    } catch (error) {
      Logger.error('Failed to save recipe: ' + error.message);
      Logger.open();
    }
  }

  async function loadRecipe(file) {
    try {
      const data = await readJSONFile(file);
      validateRecipe(data);
      
      recipe = data;
      currentStepIndex = 0;
      renderRecipe(recipe);
      Logger.success(`Loaded recipe: ${file.name} (${data.length} steps)`);
    } catch (error) {
      Logger.error('Failed to load recipe: ' + error.message);
      Logger.open();
    }
  }

  // ========================================
  // Auto-Detect
  // ========================================
  function autoDetect() {
    const inputEl = $('input');
    if (!inputEl) return;

    const input = inputEl.value;
    if (!input) {
      Logger.error('Input is empty');
      Logger.open();
      return;
    }

    Logger.info('Analyzing input...');
    Logger.open();

    const detection = detectInputType(input);
    displayAutoDetect(detection);

    if (detection.operation) {
      addOperation(detection.operation);
    }
  }

  // ========================================
  // Event Handlers Setup
  // ========================================
  function setupEventHandlers() {
    // Input character count
    const inputEl = $('input');
    const inputCountEl = document.querySelector('.char-count');
    if (inputEl && inputCountEl) {
      inputEl.addEventListener('input', () => {
        updateCharCount(inputEl, inputCountEl);
        // Reset step counter when input changes
        currentStepIndex = 0;
      });
      // Initialize counter
      updateCharCount(inputEl, inputCountEl);
    }

    // Clear input
    const clearInputBtn = $('clear-input');
    if (clearInputBtn && inputEl) {
      clearInputBtn.addEventListener('click', () => {
        inputEl.value = '';
        updateCharCount(inputEl, inputCountEl);
        currentStepIndex = 0;
        Logger.info('Input cleared');
      });
    }

    // Paste to input
    const pasteInputBtn = $('paste-input');
    if (pasteInputBtn && inputEl) {
      pasteInputBtn.addEventListener('click', async () => {
        try {
          const text = await navigator.clipboard.readText();
          inputEl.value = text;
          updateCharCount(inputEl, inputCountEl);
          currentStepIndex = 0;
          Logger.success('Text pasted from clipboard');
        } catch (error) {
          Logger.error('Failed to paste: ' + error.message);
          Logger.open();
        }
      });
    }

    // Auto-detect
    const autoDetectBtn = $('auto-detect');
    if (autoDetectBtn) {
      autoDetectBtn.addEventListener('click', autoDetect);
    }

    // Clear output
    const clearOutputBtn = $('clear-output');
    const outputEl = $('output');
    if (clearOutputBtn && outputEl) {
      clearOutputBtn.addEventListener('click', () => {
        outputEl.value = '';
        updateCharCount(outputEl, document.querySelector('.output-char-count'));
        clearExecutionTime();
        currentStepIndex = 0;
        Logger.info('Output cleared');
      });
    }

    // Copy output
    const copyBtn = $('copy-output');
    if (copyBtn && outputEl) {
      copyBtn.addEventListener('click', async () => {
        if (!outputEl.value) {
          Logger.error('Output is empty');
          Logger.open();
          return;
        }
        try {
          await copyToClipboard(outputEl.value);
          Logger.success('Copied to clipboard');
        } catch (error) {
          Logger.error('Failed to copy: ' + error.message);
          Logger.open();
        }
      });
    }

    // Download output
    const downloadBtn = $('download-output');
    if (downloadBtn && outputEl) {
      downloadBtn.addEventListener('click', () => {
        if (!outputEl.value) {
          Logger.error('Output is empty');
          Logger.open();
          return;
        }
        try {
          downloadText(outputEl.value, 'cryptosuite-output.txt');
          Logger.success('Output downloaded');
        } catch (error) {
          Logger.error('Failed to download: ' + error.message);
          Logger.open();
        }
      });
    }

    // Save recipe
    const saveBtn = $('save-recipe');
    if (saveBtn) {
      saveBtn.addEventListener('click', saveRecipe);
    }

    // Load recipe
    const loadBtn = $('load-recipe');
    const loadInput = $('load-recipe-input');
    if (loadBtn && loadInput) {
      loadBtn.addEventListener('click', () => loadInput.click());
      loadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          loadRecipe(file);
        }
        loadInput.value = '';
      });
    }

    // Clear recipe
    const clearRecipeBtn = $('clear-recipe');
    if (clearRecipeBtn) {
      clearRecipeBtn.addEventListener('click', clearRecipe);
    }

    // Bake all
    const bakeBtn = $('bake-recipe');
    if (bakeBtn) {
      bakeBtn.addEventListener('click', executeRecipe);
    }

    // Step by step
    const stepBtn = $('step-recipe');
    if (stepBtn) {
      stepBtn.addEventListener('click', executeStepByStep);
    }

    // ========================================
    // FIXED: Toggle log - toggle behavior instead of always opening
    // ========================================
    const toggleLogBtn = $('toggle-log');
    const logPanel = $('log-panel');
    if (toggleLogBtn && logPanel) {
      toggleLogBtn.addEventListener('click', () => {
        logIsOpen = !logIsOpen;
        if (logIsOpen) {
          logPanel.classList.add('active');
        } else {
          logPanel.classList.remove('active');
        }
      });
    }

    // Close log
    const closeLogBtn = $('close-log');
    if (closeLogBtn && logPanel) {
      closeLogBtn.addEventListener('click', () => {
        logIsOpen = false;
        logPanel.classList.remove('active');
      });
    }

    // Clear log
    const clearLogBtn = $('clear-log');
    if (clearLogBtn) {
      clearLogBtn.addEventListener('click', () => {
        Logger.clear();
        Logger.info('Log cleared');
      });
    }

    // Category tabs
    const categoryTabs = $$('.category-tab');
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        filterOperations(tab.dataset.category);
      });
    });

    // Search operations
    const searchInput = $('operation-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchOperations(e.target.value);
      });
    }

    // Operation click handlers (delegated)
    const operationList = $('operation-list');
    if (operationList) {
      operationList.addEventListener('click', (e) => {
        const item = e.target.closest('.operation-item');
        if (item) {
          addOperation(item.dataset.operation);
        }
      });
    }

    // Recipe step handlers (delegated)
    const recipeSteps = $('recipe-steps');
    if (recipeSteps) {
      // Edit step
      recipeSteps.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.btn-edit-step');
        if (editBtn) {
          const step = editBtn.closest('.recipe-step');
          const editForm = step.querySelector('.step-edit-form');
          if (editForm) {
            editForm.style.display = 'block';
          }
        }

        // Remove step
        const removeBtn = e.target.closest('.btn-remove-step');
        if (removeBtn) {
          const step = removeBtn.closest('.recipe-step');
          const index = parseInt(step.dataset.index);
          removeOperation(index);
        }

        // Save edit
        const saveBtn = e.target.closest('.btn-save-edit');
        if (saveBtn) {
          const step = saveBtn.closest('.recipe-step');
          const index = parseInt(step.dataset.index);
          const paramInputs = step.querySelectorAll('.param-input');
          const params = {};
          
          paramInputs.forEach(input => {
            const paramName = input.dataset.param;
            let value = input.value.trim();
            
            // Handle different input types
            if (input.type === 'checkbox') {
              value = input.checked;
            } else if (input.type === 'number') {
              value = value ? parseFloat(value) : '';
            }
            
            params[paramName] = value;
          });
          
          updateOperation(index, params);
          const editForm = step.querySelector('.step-edit-form');
          if (editForm) editForm.style.display = 'none';
        }

        // Cancel edit
        const cancelBtn = e.target.closest('.btn-cancel-edit');
        if (cancelBtn) {
          const step = cancelBtn.closest('.recipe-step');
          const editForm = step.querySelector('.step-edit-form');
          if (editForm) editForm.style.display = 'none';
        }
      });

      // Drag and drop
      recipeSteps.addEventListener('dragstart', (e) => {
        const step = e.target.closest('.recipe-step');
        if (step) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', step.dataset.index);
          step.classList.add('dragging');
        }
      });

      recipeSteps.addEventListener('dragend', (e) => {
        const step = e.target.closest('.recipe-step');
        if (step) {
          step.classList.remove('dragging');
        }
      });

      recipeSteps.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      recipeSteps.addEventListener('drop', (e) => {
        e.preventDefault();
        const step = e.target.closest('.recipe-step');
        if (step) {
          const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
          const toIndex = parseInt(step.dataset.index);
          moveOperation(fromIndex, toIndex);
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Enter: Execute recipe
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        executeRecipe();
      }

      // Ctrl/Cmd + Shift + S: Save recipe
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        saveRecipe();
      }

      // Escape: Close log panel
      if (e.key === 'Escape' && logIsOpen) {
        logIsOpen = false;
        if (logPanel) logPanel.classList.remove('active');
      }

      // Ctrl/Cmd + D: Auto-detect
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        autoDetect();
      }
    });
  }

  // ========================================
  // Initialization
  // ========================================
  function init() {
    renderOperations();
    renderRecipe(recipe);
    setupEventHandlers();
    Logger.info('CryptoSuite initialized');
    Logger.info('Press Ctrl+Enter to execute recipe, Ctrl+D for auto-detect');
    
    // Update operation count
    const countEl = $('operation-count');
    if (countEl) {
      countEl.textContent = CryptoOperations.count();
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();