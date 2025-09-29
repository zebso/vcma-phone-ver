// Phone App用のUIマネージャー
(() => {
  'use strict';

  // ES2017以降版（コメント化）
  // class UiManager {
  //   constructor() {
  //     this.currentBalance = 0;
  //   }
  // }

  // ES2017以前版
  function UiManager() {
    this.currentBalance = 0;
  }

  // ES2017以降版（コメント化）
  // formatCurrency(amount) {
  //   return new Intl.NumberFormat('ja-JP', {
  //     style: 'currency',
  //     currency: 'JPY',
  //     minimumFractionDigits: 0
  //   }).format(amount);
  // }

  // ES2017以前版
  UiManager.prototype.formatCurrency = function(amount) {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // ES2017以降版（コメント化）
  // formatDate(timestamp) {
  //   return new Date(timestamp).toLocaleString('ja-JP');
  // }

  // ES2017以前版
  UiManager.prototype.formatDate = function(timestamp) {
    return new Date(timestamp).toLocaleString('ja-JP');
  };

  // ES2017以降版（コメント化）
  // generateUserId() {
  //   const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  //   let suffix = '';
  //   for (let i = 0; i < 5; i++) {
  //     suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  //   }
  //   return `CC-2025-${suffix}`;
  // }

  // ES2017以前版
  UiManager.prototype.generateUserId = function() {
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var suffix = '';
    for (var i = 0; i < 5; i++) {
      suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return 'CC-2025-' + suffix;
  };

  // ES2017以降版（コメント化）
  // updateBalanceDisplay(balance) {
  //   const balanceElement = document.querySelector('.balance-amount');
  //   if (balanceElement) {
  //     balanceElement.textContent = this.formatCurrency(balance);
  //   }
  //   this.currentBalance = balance;
  // }

  // ES2017以前版
  UiManager.prototype.updateBalanceDisplay = function(balance) {
    var balanceElement = document.querySelector('.balance-amount');
    if (balanceElement) {
      balanceElement.textContent = this.formatCurrency(balance);
    }
    this.currentBalance = balance;
  };

  // ES2017以降版（コメント化）
  // updateRankingDisplay(ranking, createUserCallback) {
  //   const container = document.getElementById('ranking');
  //   if (!container) return;
  //   container.innerHTML = `
  //     <h3 style="margin-bottom: 20px;">ユーザー</h3>
  //     <div class="input-section">
  //       <h3 style="margin-bottom: 16px;">ユーザー追加</h3>
  //       <div class="input-group">
  //         <label>ユーザーID（任意。未入力なら自動生成）</label>
  //         <input type="text" class="input-field" id="newUserId" placeholder="例: CC-2025-XXXXX">
  //       </div>
  //       <div class="input-group">
  //         <label>初期残高</label>
  //         <input type="number" class="input-field" id="initialBalance" placeholder="0">
  //       </div>
  //       <button class="btn" id="createUserBtn">作成</button>
  //     </div>
  //   `;
  //   ranking.forEach((user, index) => {
  //     const item = document.createElement('div');
  //     item.className = 'ranking-item';
  //     item.innerHTML = `
  //       <div class="ranking-number">${index + 1}</div>
  //       <div class="ranking-info">
  //         <div class="ranking-name">${user.id}</div>
  //         <div class="ranking-amount">${this.formatCurrency(user.balance)}</div>
  //       </div>
  //     `;
  //     container.appendChild(item);
  //   });
  //   const createBtn = document.getElementById('createUserBtn');
  //   if (createBtn && createUserCallback) {
  //     createBtn.addEventListener('click', createUserCallback);
  //   }
  // }

  // ES2017以前版
  UiManager.prototype.updateRankingDisplay = function(ranking, createUserCallback) {
    var container = document.getElementById('ranking');
    if (!container) return;

    container.innerHTML = 
      '<h3 style="margin-bottom: 20px;">ユーザー</h3>' +
      '<div class="input-section">' +
        '<h3 style="margin-bottom: 16px;">ユーザー追加</h3>' +
        '<div class="input-group">' +
          '<label>ユーザーID（任意。未入力なら自動生成）</label>' +
          '<input type="text" class="input-field" id="newUserId" placeholder="例: CC-2025-XXXXX">' +
        '</div>' +
        '<div class="input-group">' +
          '<label>初期残高</label>' +
          '<input type="number" class="input-field" id="initialBalance" placeholder="0">' +
        '</div>' +
        '<button class="btn" id="createUserBtn">作成</button>' +
      '</div>';

    for (var i = 0; i < ranking.length; i++) {
      var user = ranking[i];
      var item = document.createElement('div');
      item.className = 'ranking-item';
      item.innerHTML = 
        '<div class="ranking-number">' + (i + 1) + '</div>' +
        '<div class="ranking-info">' +
          '<div class="ranking-name">' + user.id + '</div>' +
          '<div class="ranking-amount">' + this.formatCurrency(user.balance) + '</div>' +
        '</div>';
      container.appendChild(item);
    }

    var createBtn = document.getElementById('createUserBtn');
    if (createBtn && createUserCallback) {
      createBtn.addEventListener('click', createUserCallback);
    }
  };

  // ES2017以降版（コメント化）
  // updateHistoryDisplay(history) {
  //   const container = document.getElementById('history');
  //   if (!container) return;
  //   const title = container.querySelector('h3');
  //   container.innerHTML = '';
  //   if (title) container.appendChild(title);
  //   if (history.length === 0) {
  //     const noData = document.createElement('div');
  //     noData.style.cssText = 'text-align: center; padding: 40px 20px; color: #666;';
  //     noData.innerHTML = '<i class="material-icons" style="font-size: 48px; margin-bottom: 16px;">history</i><div>取引履歴がありません</div>';
  //     container.appendChild(noData);
  //     return;
  //   }
  //   history.forEach(item => {
  //     const historyItem = document.createElement('div');
  //     historyItem.className = 'history-item';
  //     const typeText = {
  //       'add': '入金',
  //       'subtract': '出金',
  //       'generate': 'アカウント作成'
  //     }[item.type] || item.type;
  //     const amountClass = (item.type === 'add' || item.type === 'generate') ? 'positive' : 'negative';
  //     const amountText = (item.type === 'add' || item.type === 'generate') ?
  //       `+${this.formatCurrency(Math.abs(item.amount))}` :
  //       `-${this.formatCurrency(Math.abs(item.amount))}`;
  //     historyItem.innerHTML = `
  //       <div class="history-user">ユーザーID: ${item.id}</div>
  //       <div class="history-date">${this.formatDate(item.timestamp)}</div>
  //       <div class="history-description">${typeText}${item.games ? ` (${item.games})` : ''}</div>
  //       <div class="history-amount ${amountClass}">${amountText}</div>
  //     `;
  //     container.appendChild(historyItem);
  //   });
  // }

  // ES2017以前版
  UiManager.prototype.updateHistoryDisplay = function(history) {
    var container = document.getElementById('history');
    if (!container) return;

    var title = container.querySelector('h3');
    container.innerHTML = '';
    if (title) container.appendChild(title);

    if (history.length === 0) {
      var noData = document.createElement('div');
      noData.style.cssText = 'text-align: center; padding: 40px 20px; color: #666;';
      noData.innerHTML = '<i class="material-icons" style="font-size: 48px; margin-bottom: 16px;">history</i><div>取引履歴がありません</div>';
      container.appendChild(noData);
      return;
    }

    for (var i = 0; i < history.length; i++) {
      var item = history[i];
      var historyItem = document.createElement('div');
      historyItem.className = 'history-item';

      var typeText;
      switch (item.type) {
        case 'add':
          typeText = '入金';
          break;
        case 'subtract':
          typeText = '出金';
          break;
        case 'generate':
          typeText = 'アカウント作成';
          break;
        default:
          typeText = item.type;
      }

      var amountClass = (item.type === 'add' || item.type === 'generate') ? 'positive' : 'negative';
      var amountText = (item.type === 'add' || item.type === 'generate') ?
        '+' + this.formatCurrency(Math.abs(item.amount)) :
        '-' + this.formatCurrency(Math.abs(item.amount));

      historyItem.innerHTML = 
        '<div class="history-user">ユーザーID: ' + item.id + '</div>' +
        '<div class="history-date">' + this.formatDate(item.timestamp) + '</div>' +
        '<div class="history-description">' + typeText + (item.games ? ' (' + item.games + ')' : '') + '</div>' +
        '<div class="history-amount ' + amountClass + '">' + amountText + '</div>';
      
      container.appendChild(historyItem);
    }
  };

  // ES2017以降版（コメント化）
  // updateDashboardDisplay(stats) {
  //   const activeIds = document.getElementById('activeIds');
  //   const totalBalance = document.getElementById('totalBalance');
  //   const totalTransactions = document.getElementById('totalTransactions');
  //   if (activeIds) activeIds.textContent = stats.activeIds.toLocaleString();
  //   if (totalBalance) totalBalance.textContent = this.formatCurrency(stats.totalBalance);
  //   if (totalTransactions) totalTransactions.textContent = stats.totalTransactions.toLocaleString();
  // }

  // ES2017以前版
  UiManager.prototype.updateDashboardDisplay = function(stats) {
    var activeIds = document.getElementById('activeIds');
    var totalBalance = document.getElementById('totalBalance');
    var totalTransactions = document.getElementById('totalTransactions');

    if (activeIds) activeIds.textContent = stats.activeIds.toLocaleString();
    if (totalBalance) totalBalance.textContent = this.formatCurrency(stats.totalBalance);
    if (totalTransactions) totalTransactions.textContent = stats.totalTransactions.toLocaleString();
  };

  // ES2017以降版（コメント化）
  // switchTab(tabName, navItem, loadDataCallback) {
  //   // すべてのタブコンテンツを非表示にする
  //   const tabContents = document.querySelectorAll('.tab-content');
  //   tabContents.forEach(content => content.classList.remove('active'));
  //   // 選択されたタブを表示する
  //   const selectedTab = document.getElementById(tabName);
  //   if (selectedTab) selectedTab.classList.add('active');
  //   // ナビゲーションのアクティブ状態を更新する
  //   const navItems = document.querySelectorAll('.nav-item');
  //   navItems.forEach(item => item.classList.remove('active'));
  //   if (navItem) navItem.classList.add('active');
  //   // ヘッダータイトルを更新する
  //   const titles = {
  //     'balance': '所持金管理',
  //     'dashboard': 'ダッシュボード',
  //     'ranking': 'ユーザー',
  //     'history': '取引履歴',
  //     'settings': '設定'
  //   };
  //   const headerTitle = document.getElementById('headerTitle');
  //   if (headerTitle) headerTitle.textContent = titles[tabName];
  //   // データ読み込みコールバック
  //   if (loadDataCallback) {
  //     loadDataCallback(tabName);
  //   }
  // }

  // ES2017以前版
  UiManager.prototype.switchTab = function(tabName, navItem, loadDataCallback) {
    // すべてのタブコンテンツを非表示にする
    var tabContents = document.querySelectorAll('.tab-content');
    for (var i = 0; i < tabContents.length; i++) {
      tabContents[i].classList.remove('active');
    }

    // 選択されたタブを表示する
    var selectedTab = document.getElementById(tabName);
    if (selectedTab) selectedTab.classList.add('active');

    // ナビゲーションのアクティブ状態を更新する
    var navItems = document.querySelectorAll('.nav-item');
    for (var j = 0; j < navItems.length; j++) {
      navItems[j].classList.remove('active');
    }
    if (navItem) navItem.classList.add('active');

    // ヘッダータイトルを更新する
    var titles = {
      'balance': '所持金管理',
      'dashboard': 'ダッシュボード',
      'ranking': 'ユーザー',
      'history': '取引履歴',
      'settings': '設定'
    };
    var headerTitle = document.getElementById('headerTitle');
    if (headerTitle) headerTitle.textContent = titles[tabName];

    // データ読み込みコールバック
    if (loadDataCallback) {
      loadDataCallback(tabName);
    }
  };

  // ES2017以降版（コメント化）
  // getTabNameFromNav(navItem) {
  //   const span = navItem.querySelector('span');
  //   if (!span) return null;
  //   const tabMap = {
  //     '統計': 'dashboard',
  //     '残高': 'balance',
  //     'ユーザー': 'ranking',
  //     '履歴': 'history',
  //     '設定': 'settings'
  //   };
  //   return tabMap[span.textContent] || null;
  // }

  // ES2017以前版
  UiManager.prototype.getTabNameFromNav = function(navItem) {
    var span = navItem.querySelector('span');
    if (!span) return null;

    var tabMap = {
      '統計': 'dashboard',
      '残高': 'balance',
      'ユーザー': 'ranking',
      '履歴': 'history',
      '設定': 'settings'
    };

    return tabMap[span.textContent] || null;
  };

  // ES2017以降版（コメント化）
  // showLoading(show) {
  //   document.querySelectorAll('.btn').forEach(btn => {
  //     btn.disabled = show;
  //     btn.style.opacity = show ? '0.6' : '1';
  //   });
  // }

  // ES2017以前版
  UiManager.prototype.showLoading = function(show) {
    var buttons = document.querySelectorAll('.btn');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      btn.disabled = show;
      btn.style.opacity = show ? '0.6' : '1';
    }
  };

  // グローバルエクスポート
  window.UiManager = UiManager;
})();