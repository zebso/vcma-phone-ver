// Phone App用のユーティリティ
(() => {
  'use strict';

  // ES2017以降版（コメント化）
  // class Utils {
  //   static showNotification(message, type = 'info') {
  //     const notification = document.createElement('div');
  //     notification.style.cssText = `
  //       position: fixed;
  //       top: 20px;
  //       left: 50%;
  //       transform: translateX(-50%);
  //       background: ${type === 'error' ? '#f44336' : '#4caf50'};
  //       color: white;
  //       padding: 12px 24px;
  //       border-radius: 4px;
  //       z-index: 1000;
  //       box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  //     `;
  //     notification.textContent = message;
  //     document.body.appendChild(notification);
  //     setTimeout(() => {
  //       notification.remove();
  //     }, 3000);
  //   }
  // 
  //   static initDarkMode() {
  //     const isDarkMode = localStorage.getItem('darkMode') === 'true';
  //     if (isDarkMode) {
  //       document.body.classList.add('dark-mode');
  //       const toggle = document.getElementById('darkModeToggle');
  //       if (toggle) toggle.checked = true;
  //     }
  //   }
  // 
  //   static toggleDarkMode() {
  //     const isDarkMode = document.body.classList.toggle('dark-mode');
  //     localStorage.setItem('darkMode', isDarkMode);
  //     Utils.showNotification(isDarkMode ? 'ダークモードをオンにしました' : 'ライトモードをオンにしました');
  //   }
  // 
  //   static setupButtonInteractions() {
  //     // ボタンインタラクション
  //     document.querySelectorAll('.btn').forEach(btn => {
  //       btn.addEventListener('click', function () {
  //         if (!this.disabled) {
  //           this.style.transform = 'scale(0.95)';
  //           setTimeout(() => {
  //             this.style.transform = 'scale(1)';
  //           }, 100);
  //         }
  //       });
  //     });
  //   }
  // }

  // ES2017以前版
  var Utils = {
    showNotification: function(message, type) {
      if (typeof type === 'undefined') type = 'info';
      
      var notification = document.createElement('div');
      var backgroundColor = type === 'error' ? '#f44336' : '#4caf50';
      
      notification.style.cssText = 
        'position: fixed;' +
        'top: 20px;' +
        'left: 50%;' +
        'transform: translateX(-50%);' +
        'background: ' + backgroundColor + ';' +
        'color: white;' +
        'padding: 12px 24px;' +
        'border-radius: 4px;' +
        'z-index: 1000;' +
        'box-shadow: 0 2px 8px rgba(0,0,0,0.3);';
      
      notification.textContent = message;
      document.body.appendChild(notification);

      setTimeout(function() {
        notification.remove();
      }, 3000);
    },

    initDarkMode: function() {
      var isDarkMode = localStorage.getItem('darkMode') === 'true';
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
        var toggle = document.getElementById('darkModeToggle');
        if (toggle) toggle.checked = true;
      }
    },

    toggleDarkMode: function() {
      var isDarkMode = document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', isDarkMode);
      Utils.showNotification(isDarkMode ? 'ダークモードをオンにしました' : 'ライトモードをオンにしました');
    },

    setupButtonInteractions: function() {
      // ボタンインタラクション
      var buttons = document.querySelectorAll('.btn');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function () {
          if (!this.disabled) {
            var self = this;
            this.style.transform = 'scale(0.95)';
            setTimeout(function() {
              self.style.transform = 'scale(1)';
            }, 100);
          }
        });
      }
    }
  };

  // グローバルエクスポート
  window.Utils = Utils;

  // レガシーグローバル関数サポート
  window.showNotification = Utils.showNotification;
})();