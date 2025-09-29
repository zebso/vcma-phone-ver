// Phone App メインロジック
(() => {
  'use strict';

  if (window.PhoneApp) return; // 多重読み込みガード

  class PhoneApp {
    constructor() {
      // サービスクラスを初期化
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

    // 下位互換性のためのレガシーメソッド
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

  // QRスキャナーやその他のモジュール用のエクスポート関数
  window.showNotification = (message, type) => {
    Utils.showNotification(message, type);
  };

  window.handleUserSearch = () => {
    if (window.phoneAppInstance) {
      window.phoneAppInstance.handleUserSearch();
    }
  };

  // グローバルインスタンス
  window.PhoneApp = PhoneApp;
  window.phoneAppInstance = new PhoneApp();

  // インラインonclickハンドラー用のレガシー関数サポート
  window.switchTab = (tabName, navItem) => {
    if (window.phoneAppInstance) {
      window.phoneAppInstance.switchTab(tabName, navItem);
    }
  };
})();