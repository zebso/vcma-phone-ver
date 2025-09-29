// Phone App用のイベントハンドラー
(() => {
  'use strict';

  // ES2017以降版（コメント化）
  // class EventHandlers {
  //   constructor(apiService, uiManager) {
  //     this.apiService = apiService;
  //     this.uiManager = uiManager;
  //     this.currentUserId = null;
  //     this.isLoading = false;
  //   }
  // }

  // ES2017以前版
  function EventHandlers(apiService, uiManager) {
    this.apiService = apiService;
    this.uiManager = uiManager;
    this.currentUserId = null;
    this.isLoading = false;
  }

  // ES2017以降版（コメント化）
  // async withLoading(callback) {
  //   try {
  //     this.isLoading = true;
  //     this.uiManager.showLoading(true);
  //     return await callback();
  //   } catch (error) {
  //     Utils.showNotification(error.message, 'error');
  //     throw error;
  //   } finally {
  //     this.isLoading = false;
  //     this.uiManager.showLoading(false);
  //   }
  // }

  // ES2017以前版
  EventHandlers.prototype.withLoading = function(callback) {
    var self = this;
    
    return new Promise(function(resolve, reject) {
      try {
        self.isLoading = true;
        self.uiManager.showLoading(true);
        
        var result = callback();
        
        // callbackが Promise を返す場合とそうでない場合をハンドリング
        if (result && typeof result.then === 'function') {
          result
            .then(function(data) {
              self.isLoading = false;
              self.uiManager.showLoading(false);
              resolve(data);
            })
            .catch(function(error) {
              self.isLoading = false;
              self.uiManager.showLoading(false);
              Utils.showNotification(error.message, 'error');
              reject(error);
            });
        } else {
          self.isLoading = false;
          self.uiManager.showLoading(false);
          resolve(result);
        }
      } catch (error) {
        self.isLoading = false;
        self.uiManager.showLoading(false);
        Utils.showNotification(error.message, 'error');
        reject(error);
      }
    });
  };

  // ES2017以降版（コメント化）
  // async loadDashboard() {
  //   await this.withLoading(async () => {
  //     const stats = await this.apiService.getDashboardStats();
  //     this.uiManager.updateDashboardDisplay(stats);
  //   });
  // }

  // ES2017以前版
  EventHandlers.prototype.loadDashboard = function() {
    var self = this;
    return this.withLoading(function() {
      return self.apiService.getDashboardStats()
        .then(function(stats) {
          self.uiManager.updateDashboardDisplay(stats);
          return stats;
        });
    });
  };

  // ES2017以降版（コメント化）
  // handleTabSwitch(tabName, navItem) {
  //   this.uiManager.switchTab(tabName, navItem, (tabName) => {
  //     // 特定のタブに切り替える際にデータを読み込む
  //     if (tabName === 'dashboard') {
  //       this.loadDashboard();
  //     } else if (tabName === 'ranking') {
  //       this.loadRanking();
  //     } else if (tabName === 'history') {
  //       this.loadHistory();
  //     }
  //   });
  // }

  // ES2017以前版
  EventHandlers.prototype.handleTabSwitch = function(tabName, navItem) {
    var self = this;
    this.uiManager.switchTab(tabName, navItem, function(tabName) {
      // 特定のタブに切り替える際にデータを読み込む
      if (tabName === 'dashboard') {
        self.loadDashboard();
      } else if (tabName === 'ranking') {
        // self.loadRanking(); // ダッシュボード以外は現在の実装を維持
      } else if (tabName === 'history') {
        // self.loadHistory(); // ダッシュボード以外は現在の実装を維持
      }
    });
  };

  // 他のメソッドは元のまま維持（ダッシュボード関連以外）
  EventHandlers.prototype.handleUserSearch = function() {
    // 実装は既存のまま
  };

  EventHandlers.prototype.handleMoneyChange = function(isAdd) {
    // 実装は既存のまま
  };

  EventHandlers.prototype.handleCreateUser = function() {
    // 実装は既存のまま
  };

  EventHandlers.prototype.loadRanking = function() {
    // 実装は既存のまま
  };

  EventHandlers.prototype.loadHistory = function() {
    // 実装は既存のまま
  };

  EventHandlers.prototype.setupEventListeners = function() {
    // 実装は既存のまま
  };

  // グローバルエクスポート
  window.EventHandlers = EventHandlers;
})();