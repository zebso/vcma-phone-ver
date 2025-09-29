// Event Handlers for Phone App
(() => {
  'use strict';

  class EventHandlers {
    constructor(apiService, uiManager) {
      this.apiService = apiService;
      this.uiManager = uiManager;
      this.currentUserId = null;
      this.isLoading = false;
    }

    async withLoading(callback) {
      try {
        this.isLoading = true;
        this.uiManager.showLoading(true);
        return await callback();
      } catch (error) {
        Utils.showNotification(error.message, 'error');
        throw error;
      } finally {
        this.isLoading = false;
        this.uiManager.showLoading(false);
      }
    }

    async handleUserSearch() {
      const userIdInput = document.querySelector('input[placeholder="ユーザーIDを入力"]');
      if (!userIdInput) return;

      const userId = userIdInput.value.trim();

      if (!userId) {
        Utils.showNotification('ユーザーIDを入力してください', 'error');
        return;
      }

      await this.withLoading(async () => {
        try {
          const userData = await this.apiService.getBalance(userId);
          this.currentUserId = userData.id;
          this.uiManager.updateBalanceDisplay(userData.balance);
          Utils.showNotification(`ユーザー ${userId} を読み込みました`);
        } catch (error) {
          if (error.message.includes('not found')) {
            const createNew = confirm(`ユーザー ${userId} が見つかりません。新規作成しますか？`);
            if (createNew) {
              const newUser = await this.apiService.createUser(userId, 0);
              this.currentUserId = newUser.user.id;
              this.uiManager.updateBalanceDisplay(newUser.user.balance);
              Utils.showNotification(`新規ユーザー ${userId} を作成しました`);
            }
          } else {
            throw error;
          }
        }
      });
    }

    async handleMoneyChange(isAdd) {
      if (!this.currentUserId) {
        Utils.showNotification('先にユーザーを選択してください', 'error');
        return;
      }

      const amountInput = document.querySelector('input[placeholder="金額を入力"]');
      const gameInput = document.getElementById('gameType');

      if (!amountInput) return;

      const amount = parseInt(amountInput.value);
      const games = (gameInput?.value || '').trim();

      if (!amount || amount <= 0) {
        Utils.showNotification('正しい金額を入力してください', 'error');
        return;
      }

      await this.withLoading(async () => {
        const result = isAdd
          ? await this.apiService.addMoney(this.currentUserId, amount, games)
          : await this.apiService.subtractMoney(this.currentUserId, amount, games);

        this.uiManager.updateBalanceDisplay(result.balance);
        amountInput.value = '';
        if (gameInput) gameInput.value = '';
        Utils.showNotification(`${isAdd ? '追加' : '減算'}が完了しました`);
      });
    }

    async handleCreateUser() {
      const idInput = document.getElementById('newUserId');
      const balInput = document.getElementById('initialBalance');

      let id = (idInput?.value || '').trim();
      if (!id) {
        id = this.uiManager.generateUserId();
        if (idInput) idInput.value = id;
      }

      const balance = Math.max(0, parseInt(balInput?.value || '0', 10) || 0);

      await this.withLoading(async () => {
        const res = await this.apiService.createUser(id, balance);
        const created = res.user;

        Utils.showNotification(`ユーザー ${created.id} を作成しました`);
        if (balInput) balInput.value = '';
      });
    }

    async loadRanking() {
      await this.withLoading(async () => {
        const ranking = await this.apiService.getRanking();
        this.uiManager.updateRankingDisplay(ranking, () => this.handleCreateUser());
      });
    }

    async loadHistory() {
      await this.withLoading(async () => {
        const history = await this.apiService.getHistory();
        this.uiManager.updateHistoryDisplay(history);
      });
    }

    async loadDashboard() {
      await this.withLoading(async () => {
        const stats = await this.apiService.getDashboardStats();
        this.uiManager.updateDashboardDisplay(stats);
      });
    }

    handleTabSwitch(tabName, navItem) {
      this.uiManager.switchTab(tabName, navItem, (tabName) => {
        // Load data when switching to certain tabs
        if (tabName === 'dashboard') {
          this.loadDashboard();
        } else if (tabName === 'ranking') {
          this.loadRanking();
        } else if (tabName === 'history') {
          this.loadHistory();
        }
      });
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
        darkModeToggle.addEventListener('change', () => Utils.toggleDarkMode());
      }

      // Tab navigation setup
      document.querySelectorAll('.nav-item').forEach(navItem => {
        if (!navItem.onclick) { // 既にonclickが設定されている場合はスキップ
          navItem.addEventListener('click', () => {
            const tabName = this.uiManager.getTabNameFromNav(navItem);
            if (tabName) {
              this.handleTabSwitch(tabName, navItem);
            }
          });
        }
      });

      // Setup button interactions
      Utils.setupButtonInteractions();
    }
  }

  // Global export
  window.EventHandlers = EventHandlers;
})();