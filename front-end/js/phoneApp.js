// Phone App メインロジック（ES2017以前版）
(function() {
  'use strict';

  if (window.PhoneApp) return; // 多重読み込みガード

  // ES2017以降版（コメント化）
  // class PhoneApp {
  //   constructor() {
  //     this.apiService = new ApiService();
  //     this.uiManager = new UiManager();
  //     this.eventHandlers = new EventHandlers(this.apiService, this.uiManager);
  //     this.initializeApp();
  //   }
  // 
  //   initializeApp() {
  //     document.addEventListener('DOMContentLoaded', () => {
  //       Utils.initDarkMode();
  //       this.eventHandlers.loadDashboard();
  //       this.eventHandlers.setupEventListeners();
  //     });
  //   }
  // }

  // ES2017以前版
  function PhoneApp() {
    // サービスクラスを初期化
    this.apiService = new ApiService();
    this.uiManager = new UiManager();
    this.eventHandlers = new EventHandlers(this.apiService, this.uiManager);

    this.initializeApp();
  }

  PhoneApp.prototype.initializeApp = function() {
    var self = this;
    document.addEventListener('DOMContentLoaded', function() {
      Utils.initDarkMode();
      self.eventHandlers.loadDashboard();
      self.eventHandlers.setupEventListeners();
    });
  };

  // 下位互換性のためのレガシーメソッド
  PhoneApp.prototype.showNotification = function(message, type) {
    Utils.showNotification(message, type);
  };

  PhoneApp.prototype.handleUserSearch = function() {
    return this.eventHandlers.handleUserSearch();
  };

  PhoneApp.prototype.switchTab = function(tabName, navItem) {
    return this.eventHandlers.handleTabSwitch(tabName, navItem);
  };

  PhoneApp.prototype.updateBalanceDisplay = function(balance) {
    return this.uiManager.updateBalanceDisplay(balance);
  };

  // QRスキャナーやその他のモジュール用のエクスポート関数
  window.showNotification = function(message, type) {
    Utils.showNotification(message, type);
  };

  window.handleUserSearch = function() {
    if (window.phoneAppInstance) {
      window.phoneAppInstance.handleUserSearch();
    }
  };

  // グローバルインスタンス
  window.PhoneApp = PhoneApp;
  window.phoneAppInstance = new PhoneApp();

  // インラインonclickハンドラー用のレガシー関数サポート
  window.switchTab = function(tabName, navItem) {
    if (window.phoneAppInstance) {
      window.phoneAppInstance.switchTab(tabName, navItem);
    }
  };
})();