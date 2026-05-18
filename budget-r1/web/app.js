// ======================================================
// CONFIG
// ======================================================

const CONFIG = {
  API_BASE_URL: '/api/transactions',
  FETCH_TIMEOUT: 10000,
  DEBUG: true,
};

// ======================================================
// GLOBAL STATE
// ======================================================

const state = {
  isSaving: false,
  transactions: [],
};

// ======================================================
// LOGGER
// DevOps-friendly structured logging
// ======================================================

const logger = {
  info(message, data = {}) {
    console.log(
      JSON.stringify({
        level: 'INFO',
        timestamp: new Date().toISOString(),
        message,
        ...data,
      }),
    );
  },

  error(message, error = {}) {
    console.error(
      JSON.stringify({
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        message,
        error,
      }),
    );
  },

  warn(message, data = {}) {
    console.warn(
      JSON.stringify({
        level: 'WARN',
        timestamp: new Date().toISOString(),
        message,
        ...data,
      }),
    );
  },
};

// ======================================================
// HELPERS
// ======================================================

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch {
    return '-';
  }
}

function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}

function setLoading(button, isLoading) {
  button.disabled = isLoading;
  button.innerText = isLoading ? 'Saving...' : 'Save';
}

// ======================================================
// FETCH WRAPPER
// Centralized API handler
// ======================================================

async function apiFetch(url, options = {}) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, CONFIG.FETCH_TIMEOUT);

  try {
    logger.info('API Request', {
      url,
      method: options.method || 'GET',
    });

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const text = await response.text();

    logger.info('API Response', {
      status: response.status,
      response: text,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return text ? JSON.parse(text) : null;
  } catch (err) {
    logger.error('API Fetch Failed', {
      url,
      error: err.message,
    });

    throw err;
  }
}

// ======================================================
// UI RENDERING
// ======================================================

function renderTransactions(data) {
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';

  let totalIncome = 0;
  let totalExpense = 0;

  data.forEach((tx, index) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
    }

    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${formatDate(tx.created_at)}</td>
      <td>${sanitizeHTML(tx.title)}</td>
      <td class="${tx.type === 'income' ? 'income-text' : 'expense-text'}">
        ${tx.type === 'expense' ? '-' : ''}${tx.amount}
      </td>
      <td>${tx.type}</td>
      <td>
        <button class="btn-edit" data-id="${tx.id}">
          Edit
        </button>

        <button class="btn-delete" data-id="${tx.id}">
          Delete
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });

  document.getElementById('total-income').innerText = totalIncome;
  document.getElementById('total-expense').innerText = totalExpense;
  document.getElementById('balance').innerText = totalIncome - totalExpense;
}

// ======================================================
// LOAD DATA
// ======================================================

async function loadData() {
  try {
    const data = await apiFetch(CONFIG.API_BASE_URL);

    state.transactions = data;

    renderTransactions(data);

    logger.info('Transactions Loaded', {
      count: data.length,
    });
  } catch (err) {
    alert('Failed to load transactions');

    logger.error('Load Data Failed', {
      error: err.message,
    });
  }
}

// ======================================================
// MODAL - TRANSACTION FORM
// ======================================================

function openModal() {
  document.getElementById('modal').style.display = 'block';

  document.getElementById('modal-title').innerText = 'Add Transaction';

  resetForm();
}

async function openModalVps() {
  try {
    document.getElementById('vps-modal').style.display = 'block';

    await loadVPSData();

    logger.info('VPS Modal Opened');
  } catch (err) {
    logger.error('Open VPS Modal Failed', {
      error: err.message,
    });

    alert('Failed to load VPS data');
  }
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';

  resetForm();
  logger.info('VPS Modal Closed');
}

function resetForm() {
  document.getElementById('tx-id').value = '';
  document.getElementById('title').value = '';
  document.getElementById('amount').value = '';
  document.getElementById('type').value = 'income';
}

// ======================================================
// MODAL - VPS DATA
// ======================================================
function openVPSModal() {
  document.getElementById('vps-modal').style.display = 'block';

  loadVPSData();
}

function closeVPSModal() {
  document.getElementById('vps-modal').style.display = 'none';
}

async function loadVPSData() {
  try {
    const data = await apiFetch('/api/system');

    document.getElementById('vps-status').innerText = data.server_status;

    document.getElementById('vps-cpu').innerText =
      `${data.cpu_percent.toFixed(2)} %`;

    document.getElementById('vps-memory-used').innerText =
      `${data.memory_used_mb} MB`;

    document.getElementById('vps-memory-total').innerText =
      `${data.memory_total_mb} MB`;

    document.getElementById('vps-goroutines').innerText = data.goroutines;
  } catch (err) {
    logger.error('Failed Load VPS Data', {
      error: err.message,
    });
  }
}

async function refreshVPSData() {
  try {
    await loadVPSData();

    await apiFetch('/api/system/save', {
      method: 'POST',
    });

    logger.info('VPS Data Saved');

    alert('VPS monitoring data saved');
  } catch (err) {
    logger.error('Refresh VPS Failed', {
      error: err.message,
    });
  }
}

// ======================================================
// EDIT
// ======================================================

function editTx(id) {
  const tx = state.transactions.find((item) => item.id == id);

  if (!tx) {
    logger.warn('Transaction not found', { id });
    return;
  }

  openModal();

  document.getElementById('modal-title').innerText = 'Edit Transaction';

  document.getElementById('tx-id').value = tx.id;
  document.getElementById('title').value = tx.title;
  document.getElementById('amount').value = tx.amount;
  document.getElementById('type').value = tx.type;
}

// ======================================================
// SAVE TRANSACTION
// ======================================================

async function saveTransaction() {
  if (state.isSaving) {
    logger.warn('Prevent duplicate save request');
    return;
  }

  const saveBtn = document.getElementById('saveBtn');

  try {
    state.isSaving = true;

    setLoading(saveBtn, true);

    const id = document.getElementById('tx-id').value;
    const title = document.getElementById('title').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);

    const type = document.getElementById('type').value;

    if (!title || Number.isNaN(amount)) {
      alert('Invalid input');
      return;
    }

    const payload = {
      title,
      amount,
      type,
    };

    if (id) {
      await apiFetch(`${CONFIG.API_BASE_URL}?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      logger.info('Transaction Updated', { id });
    } else {
      await apiFetch(CONFIG.API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      logger.info('Transaction Created');
    }

    closeModal();

    await loadData();
  } catch (err) {
    alert('Failed to save transaction');

    logger.error('Save Transaction Failed', {
      error: err.message,
    });
  } finally {
    state.isSaving = false;

    setLoading(saveBtn, false);
  }
}

// ======================================================
// DELETE
// ======================================================

async function deleteTx(id) {
  const confirmed = confirm('Delete this data?');

  if (!confirmed) return;

  try {
    await apiFetch(`${CONFIG.API_BASE_URL}?id=${id}`, {
      method: 'DELETE',
    });

    logger.info('Transaction Deleted', { id });

    await loadData();
  } catch (err) {
    alert('Delete failed');

    logger.error('Delete Transaction Failed', {
      id,
      error: err.message,
    });
  }
}

// ======================================================
// EVENT BINDING
// Avoid inline onclick
// ======================================================
function bindEvents() {
  // Save Button - Centralized event listener for form submission
  const saveBtn = document.getElementById('saveBtn');

  if (saveBtn) {
    saveBtn.addEventListener('click', saveTransaction);
  }

  // Table Actions - Event delegation for Edit/Delete buttons
  const tableBody = document.getElementById('table-body');

  if (tableBody) {
    tableBody.addEventListener('click', (event) => {
      const editBtn = event.target.closest('.btn-edit');

      const deleteBtn = event.target.closest('.btn-delete');

      if (editBtn) {
        editTx(editBtn.dataset.id);
      }

      if (deleteBtn) {
        deleteTx(deleteBtn.dataset.id);
      }
    });
  }

  // VPS Modal Buttons - Centralized event listeners for VPS modal actions
  const refreshBtn = document.getElementById('refresh-vps');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshVPSData);
  }

  // Devops concern: Add DOM debug logging => to verify elements are present and events are bound correctly
  //logger.info('Events Bound Successfully');
  logger.info('Checking DOM Elements', {
    saveBtn: !!document.getElementById('saveBtn'),
    tableBody: !!document.getElementById('table-body'),
    refreshBtn: !!document.getElementById('refresh-vps'),
  });
}

// ======================================================
// INIT
// ======================================================

async function initApp() {
  try {
    logger.info('Application Started');

    bindEvents();

    await loadData();

    logger.info('Application Ready');
  } catch (err) {
    logger.error('Init App Failed', {
      error: err.message,
    });
  }
}

window.addEventListener('DOMContentLoaded', initApp);
