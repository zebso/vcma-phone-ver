// Phone App Main Logic
(() => {
  'use strict';
  
  if (window.PhoneApp) return; // 多重読み込みガード

  class PhoneApp {
    constructor() {
      this.currentUserId = null;
      this.currentBalance = 0;
      this.isLoading = false;
      this.API_BASE = '/api';
      
      this.initializeApp();
    }

    initializeApp() {
      document.addEventListener('DOMContentLoaded', () => {
        this.initDarkMode();
        this.loadDashboard();
        this.setupEventListeners();
      });
    }

    // Dark mode functions
    initDarkMode() {
      const isDarkMode = localStorage.getItem('darkMode') === 'true';
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) toggle.checked = true;
      }
    }
    
    toggleDarkMode() {
      const isDarkMode = document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', isDarkMode);
      this.showNotification(isDarkMode ? 'ダークモードをオンにしました' : 'ライトモードをオンにしました');
    }

    // Utility functions
    showLoading(show) {
      this.isLoading = show;
      document.querySelectorAll('.btn').forEach(btn => {
        btn.disabled = show;
        btn.style.opacity = show ? '0.6' : '1';
      });
    }

    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#f44336' : '#4caf50'};
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }

    formatCurrency(amount) {
      return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        minimumFractionDigits: 0
      }).format(amount);
    }

    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString('ja-JP');
    }

    // API functions
    async apiCall(endpoint, options = {}) {
      try {
        this.showLoading(true);
        const response = await fetch(`${this.API_BASE}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'API error');
        }
        
        return data;
      } catch (error) {
        this.showNotification(error.message, 'error');
        throw error;
      } finally {
        this.showLoading(false);
      }
    }

    async getBalance(id) {
      return await this.apiCall(`/balance/${id}`);
    }

    async addMoney(id, amount, games = '', dealer = '') {
      return await this.apiCall('/add', {
        method: 'POST',
        body: JSON.stringify({ id, amount, games, dealer })
      });
    }

    async subtractMoney(id, amount, games = '', dealer = '') {
      return await this.apiCall('/subtract', {
        method: 'POST',
        body: JSON.stringify({ id, amount, games, dealer })
      });
    }

    async getHistory() {
      return await this.apiCall('/history');
    }

    async getRanking() {
      return await this.apiCall('/ranking');
    }

    async createUser(id = null, balance = 0) {
      const body = {};
      if (id) body.id = id;
      if (balance > 0) body.balance = balance;
      
      return await this.apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(body)
      });
    }

    async getDashboardStats() {
      return await this.apiCall('/dashboard-stats');
    }

    // UI Update functions
    updateBalanceDisplay(balance) {
      const balanceElement = document.querySelector('.balance-amount');
      if (balanceElement) {
        balanceElement.textContent = this.formatCurrency(balance);
      }
      this.currentBalance = balance;
    }

    async handleCreateUser() {
      const idInput = document.getElementById('newUserId');
      const balInput = document.getElementById('initialBalance');

      let id = (idInput?.value || '').trim();
      if (!id) {
        id = this.generateUserId();
        if (idInput) idInput.value = id;
      }

      const balance = Math.max(0, parseInt(balInput?.value || '0', 10) || 0);

      try {
        const res = await this.createUser(id, balance);
        const created = res.user;

        this.showNotification(`ユーザー ${created.id} を作成しました`);
        if (balInput) balInput.value = '';
      } catch (e) {
        // apiCall 側で通知済み
      } finally {
        this.loadDashboard();
      }
    }

    generateUserId() {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let suffix = '';
      for (let i = 0; i < 5; i++) {
        suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      return `CC-2025-${suffix}`;
    }

    updateRankingDisplay(ranking) {
      const container = document.getElementById('ranking');
      if (!container) return;

      container.innerHTML = `<h3 style="margin-bottom: 20px;">ユーザー</h3>
<div class="input-section">
  <h3 style="margin-bottom: 16px;">ユーザー追加</h3>

  <div class="input-group">
    <label>ユーザーID（任意。未入力なら自動生成）</label>
    <input type="text" class="input-field" id="newUserId" placeholder="例: CC-2025-XXXXX">
  </div>

  <div class="input-group">
    <label>初期残高</label>
    <input type="number" class="input-field" id="initialBalance" placeholder="0">
  </div>

  <button class="btn" id="createUserBtn">作成</button>
</div>`;
      
      ranking.forEach((user, index) => {
        const item = document.createElement('div');
        item.className = 'ranking-item';
        item.innerHTML = `
          <div class="ranking-number">${index + 1}</div>
          <div class="ranking-info">
            <div class="ranking-name">${user.id}</div>
            <div class="ranking-amount">${this.formatCurrency(user.balance)}</div>
          </div>
        `;
        container.appendChild(item);
      });

      const createBtn = document.getElementById('createUserBtn');
      if (createBtn) {
        createBtn.addEventListener('click', () => this.handleCreateUser());
      }
    }

    updateHistoryDisplay(history) {
      const container = document.getElementById('history');
      if (!container) return;

      const title = container.querySelector('h3');
      container.innerHTML = '';
      if (title) container.appendChild(title);
      
      if (history.length === 0) {
        const noData = document.createElement('div');
        noData.style.cssText = 'text-align: center; padding: 40px 20px; color: #666;';
        noData.innerHTML = '<i class="material-icons" style="font-size: 48px; margin-bottom: 16px;">history</i><div>取引履歴がありません</div>';
        container.appendChild(noData);
        return;
      }
      
      history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const typeText = {
          'add': '入金',
          'subtract': '出金',
          'generate': 'アカウント作成'
        }[item.type] || item.type;
        
        const amountClass = (item.type === 'add' || item.type === 'generate') ? 'positive' : 'negative';
        const amountText = (item.type === 'add' || item.type === 'generate') ? 
          `+${this.formatCurrency(Math.abs(item.amount))}` : 
          `-${this.formatCurrency(Math.abs(item.amount))}`;
        
        historyItem.innerHTML = `
          <div class="history-user">ユーザーID: ${item.id}</div>
          <div class="history-date">${this.formatDate(item.timestamp)}</div>
          <div class="history-description">${typeText}${item.games ? ` (${item.games})` : ''}</div>
          <div class="history-amount ${amountClass}">${amountText}</div>
        `;
        container.appendChild(historyItem);
      });
    }

    updateDashboardDisplay(stats) {
      const activeIds = document.getElementById('activeIds');
      const totalBalance = document.getElementById('totalBalance');
      const totalTransactions = document.getElementById('totalTransactions');
      
      if (activeIds) activeIds.textContent = stats.activeIds.toLocaleString();
      if (totalBalance) totalBalance.textContent = this.formatCurrency(stats.totalBalance);
      if (totalTransactions) totalTransactions.textContent = stats.totalTransactions.toLocaleString();
    }

    // Event handlers
    async handleUserSearch() {
      const userIdInput = document.querySelector('input[placeholder="ユーザーIDを入力"]');
      if (!userIdInput) return;

      const userId = userIdInput.value.trim();
      
      if (!userId) {
        this.showNotification('ユーザーIDを入力してください', 'error');
        return;
      }
      
      try {
        const userData = await this.getBalance(userId);
        this.currentUserId = userData.id;
        this.updateBalanceDisplay(userData.balance);
        this.showNotification(`ユーザー ${userId} を読み込みました`);
      } catch (error) {
        if (error.message.includes('not found')) {
          const createNew = confirm(`ユーザー ${userId} が見つかりません。新規作成しますか？`);
          if (createNew) {
            try {
              const newUser = await this.createUser(userId, 0);
              this.currentUserId = newUser.user.id;
              this.updateBalanceDisplay(newUser.user.balance);
              this.showNotification(`新規ユーザー ${userId} を作成しました`);
            } catch (createError) {
              // エラーは既にshowNotificationで表示される
            }
          }
        }
      }
    }

    async handleMoneyChange(isAdd) {
      if (!this.currentUserId) {
        this.showNotification('先にユーザーを選択してください', 'error');
        return;
      }
      
      const amountInput = document.querySelector('input[placeholder="金額を入力"]');
      const gameInput = document.getElementById('gameType');
      
      if (!amountInput) return;

      const amount = parseInt(amountInput.value);
      const games = (gameInput?.value || '').trim();
      
      if (!amount || amount <= 0) {
        this.showNotification('正しい金額を入力してください', 'error');
        return;
      }
      
      try {
        const result = isAdd 
          ? await this.addMoney(this.currentUserId, amount, games)
          : await this.subtractMoney(this.currentUserId, amount, games);
        
        this.updateBalanceDisplay(result.balance);
        amountInput.value = '';
        if (gameInput) gameInput.value = '';
        this.showNotification(`${isAdd ? '追加' : '減算'}が完了しました`);
      } catch (error) {
        // エラーは既にshowNotificationで表示される
      }
    }

    async loadRanking() {
      try {
        const ranking = await this.getRanking();
        this.updateRankingDisplay(ranking);
      } catch (error) {
        // エラーは既にshowNotificationで表示される
      }
    }

    async loadHistory() {
      try {
        const history = await this.getHistory();
        this.updateHistoryDisplay(history);
      } catch (error) {
        // エラーは既にshowNotificationで表示される
      }
    }

    async loadDashboard() {
      try {
        const stats = await this.getDashboardStats();
        this.updateDashboardDisplay(stats);
      } catch (error) {
        // エラーは既にshowNotificationで表示される
      }
    }

    switchTab(tabName, navItem) {
      // Hide all tab contents
      const tabContents = document.querySelectorAll('.tab-content');
      tabContents.forEach(content => content.classList.remove('active'));

      // Show selected tab
      const selectedTab = document.getElementById(tabName);
      if (selectedTab) selectedTab.classList.add('active');

      // Update navigation active state
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(item => item.classList.remove('active'));
      if (navItem) navItem.classList.add('active');

      // Update header title
      const titles = {
        'balance': '所持金管理',
        'dashboard': 'ダッシュボード',
        'ranking': 'ユーザー',
        'history': '取引履歴',
        'settings': '設定'
      };
      const headerTitle = document.getElementById('headerTitle');
      if (headerTitle) headerTitle.textContent = titles[tabName];

      // Load data when switching to certain tabs
      if (tabName === 'dashboard') {
        this.loadDashboard();
      } else if (tabName === 'ranking') {
        this.loadRanking();
      } else if (tabName === 'history') {
        this.loadHistory();
      }
    }

    setupEventListeners() {
      // Search button
      const searchBtn = document.querySelector('.input-section button.btn:not(#qrStopBtn):not(#qrSwitchBtn)');
      if (searchBtn) {
        searchBtn.addEventListener('click', () => this.handleUserSearch());
      }

      // Add/Subtract buttons - target the second input-section
      const inputSections = document.querySelectorAll('.input-section');
      if (inputSections.length > 1) {
        const addBtn = inputSections[1].querySelector('.btn');
        const subtractBtn = inputSections[1].querySelector('.btn-outline');
        
        if (addBtn) addBtn.addEventListener('click', () => this.handleMoneyChange(true));
        if (subtractBtn) subtractBtn.addEventListener('click', () => this.handleMoneyChange(false));
      }

      // Dark mode toggle
      const darkModeToggle = document.getElementById('darkModeToggle');
      if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => this.toggleDarkMode());
      }

      // Button interactions
      document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
          if (!this.disabled) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
              this.style.transform = 'scale(1)';
            }, 100);
          }
        });
      });

      // Tab navigation setup - setup once DOM is ready
      document.querySelectorAll('.nav-item').forEach(navItem => {
        if (!navItem.onclick) { // 既にonclickが設定されている場合はスキップ
          navItem.addEventListener('click', () => {
            const tabName = this.getTabNameFromNav(navItem);
            if (tabName) {
              this.switchTab(tabName, navItem);
            }
          });
        }
      });
    }

    getTabNameFromNav(navItem) {
      const span = navItem.querySelector('span');
      if (!span) return null;
      
      const tabMap = {
        '統計': 'dashboard',
        '残高': 'balance', 
        'ユーザー': 'ranking',
        '履歴': 'history',
        '設定': 'settings'
      };
      
      return tabMap[span.textContent] || null;
    }
  }

  // Export functions for QR Scanner and other modules
  window.showNotification = (message, type) => {
    if (window.phoneAppInstance) {
      window.phoneAppInstance.showNotification(message, type);
    }
  };

  window.handleUserSearch = () => {
    if (window.phoneAppInstance) {
      window.phoneAppInstance.handleUserSearch();
    }
  };

  // Global instance
  window.PhoneApp = PhoneApp;
  window.phoneAppInstance = new PhoneApp();

  // Legacy function support for inline onclick handlers
  window.switchTab = (tabName, navItem) => {
    if (window.phoneAppInstance) {
      window.phoneAppInstance.switchTab(tabName, navItem);
    }
  };
})();