// Sample Data
const DATA = {
  overviewStats: {
    totalSpendYtd: 2847392,
    totalInvoices: 1247,
    documentsUploaded: 3891,
    averageInvoiceValue: 2283,
    spendGrowth: 12.5,
    invoiceGrowth: 8.3,
    documentsGrowth: 15.2,
    avgValueGrowth: 3.8
  },
  invoiceTrends: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
    invoiceCounts: [50, 65, 58, 72, 80, 75, 88, 95, 90, 102, 98],
    invoiceValues: [125, 168, 145, 198, 220, 195, 238, 255, 242, 275, 265]
  },
  topVendors: [
    { name: 'Acme Corp', spend: 385420 },
    { name: 'TechSupply Inc', spend: 312580 },
    { name: 'Global Services', spend: 287340 },
    { name: 'Premier Products', spend: 245680 },
    { name: 'Metro Supplies', spend: 198750 },
    { name: 'Innovate Solutions', spend: 176290 },
    { name: 'Quality Goods', spend: 152840 },
    { name: 'Swift Logistics', spend: 134560 },
    { name: 'Atlas Equipment', spend: 118920 },
    { name: 'Zenith Materials', spend: 95430 }
  ],
  categorySpend: [
    { category: 'IT & Software', amount: 892450, percentage: 31.3 },
    { category: 'Office Supplies', amount: 625380, percentage: 22.0 },
    { category: 'Professional Services', amount: 512290, percentage: 18.0 },
    { category: 'Equipment', amount: 398150, percentage: 14.0 },
    { category: 'Utilities', amount: 254730, percentage: 8.9 },
    { category: 'Other', amount: 164392, percentage: 5.8 }
  ],
  cashOutflowForecast: {
    months: ['Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026'],
    amounts: [245, 268, 252, 278, 265, 290]
  }
};

// Generate sample invoice data
function generateInvoices() {
  const vendors = [
    'Acme Corp', 'TechSupply Inc', 'Global Services', 'Premier Products',
    'Metro Supplies', 'Innovate Solutions', 'Quality Goods', 'Swift Logistics',
    'Atlas Equipment', 'Zenith Materials', 'Office Depot', 'Tech Solutions',
    'Business Partners', 'Supply Chain Co', 'Enterprise Services'
  ];
  const statuses = ['Paid', 'Paid', 'Paid', 'Paid', 'Paid', 'Paid', 'Pending', 'Pending', 'Processing', 'Processing', 'Processing', 'Overdue'];
  const invoices = [];

  for (let i = 0; i < 50; i++) {
    const month = Math.floor(Math.random() * 11) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const date = `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const amount = (Math.random() * 49500 + 500).toFixed(2);
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    invoices.push({
      invoice_number: `INV-2025-${String(1200 + i).padStart(4, '0')}`,
      vendor: vendor,
      date: date,
      amount: parseFloat(amount),
      status: status
    });
  }

  return invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
}

const INVOICES = generateInvoices();

// State management
const state = {
  currentView: 'dashboard',
  invoices: INVOICES,
  filteredInvoices: INVOICES,
  currentPage: 1,
  rowsPerPage: 10,
  sortColumn: null,
  sortDirection: 'asc',
  searchQuery: '',
  chatMessages: []
};

// Utility Functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

// Navigation
function switchView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  if (viewName === 'dashboard') {
    document.getElementById('dashboard-view').classList.add('active');
    document.querySelector('[data-view="dashboard"]').classList.add('active');
  } else if (viewName === 'chat') {
    document.getElementById('chat-view').classList.add('active');
    document.querySelector('[data-view="chat"]').classList.add('active');
  }

  state.currentView = viewName;
}

// Initialize Charts
let charts = {};

function initCharts() {
  // Invoice Volume & Value Trend Chart
  const trendCtx = document.getElementById('trendChart').getContext('2d');
  charts.trend = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: DATA.invoiceTrends.months,
      datasets: [
        {
          label: 'Invoice Count',
          data: DATA.invoiceTrends.invoiceCounts,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y',
          tension: 0.4
        },
        {
          label: 'Invoice Value ($K)',
          data: DATA.invoiceTrends.invoiceValues,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          yAxisID: 'y1',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Invoice Count'
          }
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Value ($K)'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  });

  // Top 10 Vendors Chart
  const vendorCtx = document.getElementById('vendorChart').getContext('2d');
  charts.vendor = new Chart(vendorCtx, {
    type: 'bar',
    data: {
      labels: DATA.topVendors.map(v => v.name),
      datasets: [{
        label: 'Spend ($)',
        data: DATA.topVendors.map(v => v.spend),
        backgroundColor: '#1FB8CD',
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: {
            callback: function(value) {
              return '$' + (value / 1000).toFixed(0) + 'K';
            }
          }
        }
      }
    }
  });

  // Spend by Category Chart
  const categoryCtx = document.getElementById('categoryChart').getContext('2d');
  charts.category = new Chart(categoryCtx, {
    type: 'pie',
    data: {
      labels: DATA.categorySpend.map(c => c.category),
      datasets: [{
        data: DATA.categorySpend.map(c => c.amount),
        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = formatCurrency(context.parsed);
              const percentage = DATA.categorySpend[context.dataIndex].percentage;
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });

  // Cash Outflow Forecast Chart
  const forecastCtx = document.getElementById('forecastChart').getContext('2d');
  charts.forecast = new Chart(forecastCtx, {
    type: 'bar',
    data: {
      labels: DATA.cashOutflowForecast.months,
      datasets: [{
        label: 'Cash Outflow ($K)',
        data: DATA.cashOutflowForecast.amounts,
        backgroundColor: '#8B5CF6',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              return '$' + value + 'K';
            }
          }
        }
      }
    }
  });
}

// Table Functions
function filterInvoices() {
  const query = state.searchQuery.toLowerCase();
  state.filteredInvoices = state.invoices.filter(inv => {
    return (
      inv.invoice_number.toLowerCase().includes(query) ||
      inv.vendor.toLowerCase().includes(query) ||
      inv.date.includes(query) ||
      inv.amount.toString().includes(query) ||
      inv.status.toLowerCase().includes(query)
    );
  });
  state.currentPage = 1;
  renderTable();
}

function sortInvoices(column) {
  if (state.sortColumn === column) {
    state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    state.sortColumn = column;
    state.sortDirection = 'asc';
  }

  state.filteredInvoices.sort((a, b) => {
    let aVal = a[column];
    let bVal = b[column];

    if (column === 'amount') {
      aVal = parseFloat(aVal);
      bVal = parseFloat(bVal);
    } else if (column === 'date') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else {
      aVal = aVal.toString().toLowerCase();
      bVal = bVal.toString().toLowerCase();
    }

    if (aVal < bVal) return state.sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return state.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  renderTable();
  updateSortIcons();
}

function updateSortIcons() {
  document.querySelectorAll('.sort-icon').forEach(icon => {
    icon.className = 'sort-icon';
  });

  if (state.sortColumn) {
    const th = document.querySelector(`th[data-sort="${state.sortColumn}"]`);
    if (th) {
      const icon = th.querySelector('.sort-icon');
      icon.classList.add(state.sortDirection);
    }
  }
}

function renderTable() {
  const tbody = document.getElementById('invoiceTableBody');
  const start = (state.currentPage - 1) * state.rowsPerPage;
  const end = start + state.rowsPerPage;
  const pageData = state.filteredInvoices.slice(start, end);

  tbody.innerHTML = pageData.map(inv => `
    <tr>
      <td>${inv.invoice_number}</td>
      <td>${inv.vendor}</td>
      <td>${inv.date}</td>
      <td>${formatCurrency(inv.amount)}</td>
      <td><span class="status-badge status-badge--${inv.status.toLowerCase()}">${inv.status}</span></td>
    </tr>
  `).join('');

  updateTableInfo();
  updatePagination();
}

function updateTableInfo() {
  const start = (state.currentPage - 1) * state.rowsPerPage + 1;
  const end = Math.min(start + state.rowsPerPage - 1, state.filteredInvoices.length);
  const total = state.filteredInvoices.length;
  document.getElementById('tableCount').textContent = `Showing ${start}-${end} of ${total} invoices`;
}

function updatePagination() {
  const totalPages = Math.ceil(state.filteredInvoices.length / state.rowsPerPage);
  document.getElementById('pageInfo').textContent = `Page ${state.currentPage} of ${totalPages}`;
  document.getElementById('prevPage').disabled = state.currentPage === 1;
  document.getElementById('nextPage').disabled = state.currentPage === totalPages;
}

function changePage(direction) {
  const totalPages = Math.ceil(state.filteredInvoices.length / state.rowsPerPage);
  if (direction === 'prev' && state.currentPage > 1) {
    state.currentPage--;
  } else if (direction === 'next' && state.currentPage < totalPages) {
    state.currentPage++;
  }
  renderTable();
}

// Chat Functions
function addChatMessage(role, content) {
  state.chatMessages.push({ role, content });
  const messagesContainer = document.getElementById('chatMessages');
  
  // Remove welcome screen if it exists
  const welcome = messagesContainer.querySelector('.chat-welcome');
  if (welcome) {
    welcome.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message chat-message--${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  if (role === 'user') {
    bubble.textContent = content;
  } else {
    bubble.innerHTML = content;
  }

  messageDiv.appendChild(bubble);
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showLoading() {
  const messagesContainer = document.getElementById('chatMessages');
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'chat-message chat-message--assistant';
  loadingDiv.id = 'loadingMessage';
  loadingDiv.innerHTML = `
    <div class="loading-indicator">
      <div class="loading-dots">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    </div>
  `;
  messagesContainer.appendChild(loadingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideLoading() {
  const loading = document.getElementById('loadingMessage');
  if (loading) loading.remove();
}

function handleChatQuery(query) {
  const lowerQuery = query.toLowerCase();
  let response = '';

  if (lowerQuery.includes('last 90 days') || lowerQuery.includes('90 days')) {
    // Calculate last 90 days spend
    const today = new Date();
    const ninetyDaysAgo = new Date(today.setDate(today.getDate() - 90));
    const recentInvoices = state.invoices.filter(inv => new Date(inv.date) >= ninetyDaysAgo);
    const totalSpend = recentInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    response = `
      <div class="message-text">Based on the data, here's the total spend for the last 90 days:</div>
      <div class="message-sql">
        <div class="sql-header">
          <span class="sql-label">SQL Query</span>
          <button class="copy-btn" onclick="copyToClipboard(this)">Copy</button>
        </div>
        <pre class="sql-code">SELECT SUM(amount) as total_spend
FROM invoices
WHERE invoice_date >= CURRENT_DATE - INTERVAL '90 days'</pre>
      </div>
      <div class="message-table">
        <table class="result-table">
          <thead><tr><th>total_spend</th></tr></thead>
          <tbody><tr><td>${formatCurrency(totalSpend)}</td></tr></tbody>
        </table>
      </div>
    `;
  } else if (lowerQuery.includes('top 5 vendors') || lowerQuery.includes('top vendors')) {
    const top5 = DATA.topVendors.slice(0, 5);
    response = `
      <div class="message-text">Here are the top 5 vendors by total spend:</div>
      <div class="message-sql">
        <div class="sql-header">
          <span class="sql-label">SQL Query</span>
          <button class="copy-btn" onclick="copyToClipboard(this)">Copy</button>
        </div>
        <pre class="sql-code">SELECT vendor_name, SUM(amount) as total_spend
FROM invoices
GROUP BY vendor_name
ORDER BY total_spend DESC
LIMIT 5</pre>
      </div>
      <div class="message-table">
        <table class="result-table">
          <thead><tr><th>vendor_name</th><th>total_spend</th></tr></thead>
          <tbody>
            ${top5.map(v => `<tr><td>${v.name}</td><td>${formatCurrency(v.spend)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="message-chart">
        <canvas id="chatChart${Date.now()}"></canvas>
      </div>
    `;

    setTimeout(() => {
      const canvasId = document.querySelector('.message-chart canvas:last-of-type').id;
      const ctx = document.getElementById(canvasId).getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: top5.map(v => v.name),
          datasets: [{
            label: 'Spend ($)',
            data: top5.map(v => v.spend),
            backgroundColor: '#1FB8CD'
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }, 100);
  } else if (lowerQuery.includes('overdue')) {
    const overdueInvoices = state.invoices.filter(inv => inv.status === 'Overdue');
    response = `
      <div class="message-text">Found ${overdueInvoices.length} overdue invoices:</div>
      <div class="message-sql">
        <div class="sql-header">
          <span class="sql-label">SQL Query</span>
          <button class="copy-btn" onclick="copyToClipboard(this)">Copy</button>
        </div>
        <pre class="sql-code">SELECT invoice_number, vendor_name, due_date, amount, status
FROM invoices
WHERE status = 'Overdue' AND due_date < CURRENT_DATE
ORDER BY due_date ASC</pre>
      </div>
      <div class="message-table">
        <table class="result-table">
          <thead>
            <tr>
              <th>invoice_number</th>
              <th>vendor_name</th>
              <th>date</th>
              <th>amount</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            ${overdueInvoices.map(inv => `
              <tr>
                <td>${inv.invoice_number}</td>
                <td>${inv.vendor}</td>
                <td>${inv.date}</td>
                <td>${formatCurrency(inv.amount)}</td>
                <td><span class="status-badge status-badge--overdue">${inv.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    response = `
      <div class="message-text">I understand you're asking about: "${query}"</div>
      <div class="message-text">Here are some questions I can help with:</div>
      <ul>
        <li>What's the total spend in the last 90 days?</li>
        <li>List top 5 vendors by spend</li>
        <li>Show overdue invoices as of today</li>
      </ul>
    `;
  }

  return response;
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const query = input.value.trim();
  
  if (!query) return;

  // Disable input
  input.disabled = true;
  document.getElementById('sendButton').disabled = true;

  // Add user message
  addChatMessage('user', query);
  input.value = '';

  // Show loading
  showLoading();

  // Simulate API delay
  setTimeout(() => {
    hideLoading();
    const response = handleChatQuery(query);
    addChatMessage('assistant', response);

    // Re-enable input
    input.disabled = false;
    document.getElementById('sendButton').disabled = false;
    input.focus();
  }, 800);
}

function copyToClipboard(button) {
  const sqlCode = button.closest('.message-sql').querySelector('.sql-code').textContent;
  navigator.clipboard.writeText(sqlCode).then(() => {
    button.textContent = 'Copied!';
    setTimeout(() => {
      button.textContent = 'Copy';
    }, 2000);
  });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      switchView(view);
    });
  });

  // Initialize charts
  initCharts();

  // Table search
  document.getElementById('searchInput').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    filterInvoices();
  });

  // Table sorting
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      sortInvoices(th.dataset.sort);
    });
  });

  // Pagination
  document.getElementById('prevPage').addEventListener('click', () => changePage('prev'));
  document.getElementById('nextPage').addEventListener('click', () => changePage('next'));
  document.getElementById('rowsPerPage').addEventListener('change', (e) => {
    state.rowsPerPage = parseInt(e.target.value);
    state.currentPage = 1;
    renderTable();
  });

  // Chat
  document.getElementById('sendButton').addEventListener('click', sendChatMessage);
  document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  document.querySelectorAll('.example-question').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('chatInput').value = btn.dataset.question;
      sendChatMessage();
    });
  });

  // Initial render
  renderTable();
});