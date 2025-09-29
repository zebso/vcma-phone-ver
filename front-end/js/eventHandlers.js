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
        self.loadRanking();
      } else if (tabName === 'history') {
        self.loadHistory();
      }
    });
  };

  // ES2017以降版（コメント化）
  // async handleUserSearch() {
  //   const userIdInput = document.querySelector('input[placeholder="ユーザーIDを入力"]');
  //   if (!userIdInput) return;
  //   const userId = userIdInput.value.trim();
  //   if (!userId) {
  //     Utils.showNotification('ユーザーIDを入力してください', 'error');
  //     return;
  //   }
  //   await this.withLoading(async () => {
  //     try {
  //       const userData = await this.apiService.getBalance(userId);
  //       this.currentUserId = userData.id;
  //       this.uiManager.updateBalanceDisplay(userData.balance);
  //       Utils.showNotification(`ユーザー ${userId} を読み込みました`);
  //     } catch (error) {
  //       if (error.message.includes('not found')) {
  //         const createNew = confirm(`ユーザー ${userId} が見つかりません。新規作成しますか？`);
  //         if (createNew) {
  //           const newUser = await this.apiService.createUser(userId, 0);
  //           this.currentUserId = newUser.user.id;
  //           this.uiManager.updateBalanceDisplay(newUser.user.balance);
  //           Utils.showNotification(`新規ユーザー ${userId} を作成しました`);
  //         }
  //       } else {
  //         throw error;
  //       }
  //     }
  //   });
  // }

  // ES2017以前版
  EventHandlers.prototype.handleUserSearch = function() {
    var self = this;
    var userIdInput = document.querySelector('input[placeholder="ユーザーIDを入力"]');
    if (!userIdInput) return;

    var userId = userIdInput.value.trim();

    if (!userId) {
      Utils.showNotification('ユーザーIDを入力してください', 'error');
      return;
    }

    return this.withLoading(function() {
      return self.apiService.getBalance(userId)
        .then(function(userData) {
          self.currentUserId = userData.id;
          self.uiManager.updateBalanceDisplay(userData.balance);
          Utils.showNotification('ユーザー ' + userId + ' を読み込みました');
          return userData;
        })
        .catch(function(error) {
          if (error.message.indexOf('not found') !== -1) {
            var createNew = confirm('ユーザー ' + userId + ' が見つかりません。新規作成しますか？');
            if (createNew) {
              return self.apiService.createUser(userId, 0)
                .then(function(newUser) {
                  self.currentUserId = newUser.user.id;
                  self.uiManager.updateBalanceDisplay(newUser.user.balance);
                  Utils.showNotification('新規ユーザー ' + userId + ' を作成しました');
                  return newUser;
                });
            }
          } else {
            throw error;
          }
        });
    });
  };

  // ES2017以降版（コメント化）
  // async handleMoneyChange(isAdd) {
  //   if (!this.currentUserId) {
  //     Utils.showNotification('先にユーザーを選択してください', 'error');
  //     return;
  //   }
  //   const amountInput = document.querySelector('input[placeholder="金額を入力"]');
  //   const gameInput = document.getElementById('gameType');
  //   if (!amountInput) return;
  //   const amount = parseInt(amountInput.value);
  //   const games = (gameInput?.value || '').trim();
  //   if (!amount || amount <= 0) {
  //     Utils.showNotification('正しい金額を入力してください', 'error');
  //     return;
  //   }
  //   await this.withLoading(async () => {
  //     const result = isAdd
  //       ? await this.apiService.addMoney(this.currentUserId, amount, games)
  //       : await this.apiService.subtractMoney(this.currentUserId, amount, games);
  //     this.uiManager.updateBalanceDisplay(result.balance);
  //     amountInput.value = '';
  //     if (gameInput) gameInput.value = '';
  //     Utils.showNotification(`${isAdd ? '追加' : '減算'}が完了しました`);
  //   });
  // }

  // ES2017以前版
  EventHandlers.prototype.handleMoneyChange = function(isAdd) {
    var self = this;
    
    if (!this.currentUserId) {
      Utils.showNotification('先にユーザーを選択してください', 'error');
      return;
    }

    var amountInput = document.querySelector('input[placeholder="金額を入力"]');
    var gameInput = document.getElementById('gameType');

    if (!amountInput) return;

    var amount = parseInt(amountInput.value);
    var games = gameInput && gameInput.value ? gameInput.value.trim() : '';

    if (!amount || amount <= 0) {
      Utils.showNotification('正しい金額を入力してください', 'error');
      return;
    }

    return this.withLoading(function() {
      var apiCall = isAdd 
        ? self.apiService.addMoney(self.currentUserId, amount, games)
        : self.apiService.subtractMoney(self.currentUserId, amount, games);
      
      return apiCall.then(function(result) {
        self.uiManager.updateBalanceDisplay(result.balance);
        amountInput.value = '';
        if (gameInput) gameInput.value = '';
        Utils.showNotification(isAdd ? '追加が完了しました' : '減算が完了しました');
        return result;
      });
    });
  };

  // ES2017以降版（コメント化）
  // async handleCreateUser() {
  //   const idInput = document.getElementById('newUserId');
  //   const balInput = document.getElementById('initialBalance');
  //   let id = (idInput?.value || '').trim();
  //   if (!id) {
  //     id = this.uiManager.generateUserId();
  //     if (idInput) idInput.value = id;
  //   }
  //   const balance = Math.max(0, parseInt(balInput?.value || '0', 10) || 0);
  //   await this.withLoading(async () => {
  //     const res = await this.apiService.createUser(id, balance);
  //     const created = res.user;
  //     Utils.showNotification(`ユーザー ${created.id} を作成しました`);
  //     if (balInput) balInput.value = '';
  //   });
  // }

  // ES2017以前版
  EventHandlers.prototype.handleCreateUser = function() {
    var self = this;
    var idInput = document.getElementById('newUserId');
    var balInput = document.getElementById('initialBalance');

    var id = idInput && idInput.value ? idInput.value.trim() : '';
    if (!id) {
      id = this.uiManager.generateUserId();
      if (idInput) idInput.value = id;
    }

    var balance = Math.max(0, parseInt(balInput && balInput.value ? balInput.value : '0', 10) || 0);

    return this.withLoading(function() {
      return self.apiService.createUser(id, balance)
        .then(function(res) {
          var created = res.user;
          Utils.showNotification('ユーザー ' + created.id + ' を作成しました');
          if (balInput) balInput.value = '';
          return res;
        });
    });
  };

  // ES2017以降版（コメント化）
  // async loadRanking() {
  //   await this.withLoading(async () => {
  //     const ranking = await this.apiService.getRanking();
  //     this.uiManager.updateRankingDisplay(ranking, () => this.handleCreateUser());
  //   });
  // }

  // ES2017以前版
  EventHandlers.prototype.loadRanking = function() {
    var self = this;
    return this.withLoading(function() {
      return self.apiService.getRanking()
        .then(function(ranking) {
          self.uiManager.updateRankingDisplay(ranking, function() {
            return self.handleCreateUser();
          });
          return ranking;
        });
    });
  };

  // ES2017以降版（コメント化）
  // async loadHistory() {
  //   await this.withLoading(async () => {
  //     const history = await this.apiService.getHistory();
  //     this.uiManager.updateHistoryDisplay(history);
  //   });
  // }

  // ES2017以前版
  EventHandlers.prototype.loadHistory = function() {
    var self = this;
    return this.withLoading(function() {
      return self.apiService.getHistory()
        .then(function(history) {
          self.uiManager.updateHistoryDisplay(history);
          return history;
        });
    });
  };

  // ES2017以降版（コメント化）
  // setupEventListeners() {
  //   // 検索ボタン
  //   const searchBtn = document.querySelector('.input-section button.btn:not(#qrStopBtn):not(#qrSwitchBtn)');
  //   if (searchBtn) {
  //     searchBtn.addEventListener('click', () => this.handleUserSearch());
  //   }
  //   // 追加/減算ボタン - 2番目のinput-sectionをターゲット
  //   const inputSections = document.querySelectorAll('.input-section');
  //   if (inputSections.length > 1) {
  //     const addBtn = inputSections[1].querySelector('.btn');
  //     const subtractBtn = inputSections[1].querySelector('.btn-outline');
  //     if (addBtn) addBtn.addEventListener('click', () => this.handleMoneyChange(true));
  //     if (subtractBtn) subtractBtn.addEventListener('click', () => this.handleMoneyChange(false));
  //   }
  //   // ダークモード切り替え
  //   const darkModeToggle = document.getElementById('darkModeToggle');
  //   if (darkModeToggle) {
  //     darkModeToggle.addEventListener('change', () => Utils.toggleDarkMode());
  //   }
  //   // タブナビゲーション設定
  //   document.querySelectorAll('.nav-item').forEach(navItem => {
  //     if (!navItem.onclick) {
  //       navItem.addEventListener('click', () => {
  //         const tabName = this.uiManager.getTabNameFromNav(navItem);
  //         if (tabName) {
  //           this.handleTabSwitch(tabName, navItem);
  //         }
  //       });
  //     }
  //   });
  //   // ボタンインタラクション設定
  //   Utils.setupButtonInteractions();
  // }

  // ES2017以前版
  EventHandlers.prototype.setupEventListeners = function() {
    var self = this;
    
    // 検索ボタン
    var searchBtn = document.querySelector('.input-section button.btn:not(#qrStopBtn):not(#qrSwitchBtn)');
    if (searchBtn) {
      searchBtn.addEventListener('click', function() {
        self.handleUserSearch();
      });
    }

    // 追加/減算ボタン - 2番目のinput-sectionをターゲット
    var inputSections = document.querySelectorAll('.input-section');
    if (inputSections.length > 1) {
      var addBtn = inputSections[1].querySelector('.btn');
      var subtractBtn = inputSections[1].querySelector('.btn-outline');

      if (addBtn) {
        addBtn.addEventListener('click', function() {
          self.handleMoneyChange(true);
        });
      }
      if (subtractBtn) {
        subtractBtn.addEventListener('click', function() {
          self.handleMoneyChange(false);
        });
      }
    }

    // ダークモード切り替え
    var darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('change', function() {
        Utils.toggleDarkMode();
      });
    }

    // タブナビゲーション設定
    var navItems = document.querySelectorAll('.nav-item');
    for (var i = 0; i < navItems.length; i++) {
      var navItem = navItems[i];
      if (!navItem.onclick) { // 既にonclickが設定されている場合はスキップ
        (function(item) {
          item.addEventListener('click', function() {
            var tabName = self.uiManager.getTabNameFromNav(item);
            if (tabName) {
              self.handleTabSwitch(tabName, item);
            }
          });
        })(navItem);
      }
    }

    // ボタンインタラクション設定
    Utils.setupButtonInteractions();
  };

  // グローバルエクスポート
  window.EventHandlers = EventHandlers;
})();