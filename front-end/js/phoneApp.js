// Phone App Main Logic
(() => {
  'use strict';

  if (window.PhoneApp) return; // 多重読み込みガード

  class PhoneApp {
    constructor() {
      // Initialize service classes
      this.apiService = new ApiService();
      this.uiManager = new UiManager();
      this.eventHandlers = new EventHandlers(this.apiService, this.uiManager);

      this.initializeApp();
    }

    initializeApp() {
      document.addEventListener('DOMContentLoaded', () => {
        Utils.initDarkMode();
        this.eventHandlers.loadDashboard();
        this.eventHandlers.setupEventListeners();
      });
    }

    // Legacy methods for backward compatibility
    showNotification(message, type) {
      Utils.showNotification(message, type);
    }

    handleUserSearch() {
      return this.eventHandlers.handleUserSearch();
    }

    switchTab(tabName, navItem) {
      return this.eventHandlers.handleTabSwitch(tabName, navItem);
    }

    updateBalanceDisplay(balance) {
      return this.uiManager.updateBalanceDisplay(balance);
    }
  }

  // Export functions for QR Scanner and other modules
  window.showNotification = (message, type) => {
    Utils.showNotification(message, type);
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