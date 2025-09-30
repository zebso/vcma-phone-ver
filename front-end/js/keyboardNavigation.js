// Keyboard Navigation Support for Desktop
(function() {
  'use strict';

  // キーボードナビゲーション設定
  var KeyboardNavigation = {
    currentFocus: 0,
    navItems: [],
    tabItems: [],
    isDesktop: false,

    init: function() {
      this.checkDesktopMode();
      if (this.isDesktop) {
        this.setupKeyboardSupport();
        this.updateNavItems();
        this.setupTabNavigation();
      }
      window.addEventListener('resize', this.handleResize.bind(this));
    },

    checkDesktopMode: function() {
      this.isDesktop = window.innerWidth >= 1024;
    },

    handleResize: function() {
      var wasDesktop = this.isDesktop;
      this.checkDesktopMode();
      
      if (wasDesktop !== this.isDesktop) {
        if (this.isDesktop) {
          this.setupKeyboardSupport();
          this.updateNavItems();
          this.setupTabNavigation();
        } else {
          this.removeKeyboardSupport();
        }
      }
    },

    setupKeyboardSupport: function() {
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
      
      // ナビゲーションアイテムにfocusableな属性を追加
      var navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(function(item, index) {
        item.setAttribute('tabindex', index === 0 ? '0' : '-1');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', item.querySelector('span').textContent + 'タブ');
        
        // フォーカススタイルを追加
        item.addEventListener('focus', function() {
          item.style.outline = '2px solid #1976d2';
          item.style.outlineOffset = '2px';
        });
        
        item.addEventListener('blur', function() {
          item.style.outline = 'none';
        });
      });
    },

    setupTabNavigation: function() {
      // タブコンテンツにaria属性を追加
      var tabContents = document.querySelectorAll('.tab-content');
      tabContents.forEach(function(content, index) {
        content.setAttribute('role', 'tabpanel');
        content.setAttribute('aria-labelledby', 'nav-item-' + index);
      });
      
      var navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(function(item, index) {
        item.setAttribute('id', 'nav-item-' + index);
        item.setAttribute('role', 'tab');
        item.setAttribute('aria-controls', 'tabpanel-' + index);
      });
    },

    removeKeyboardSupport: function() {
      document.removeEventListener('keydown', this.handleKeyDown.bind(this));
      
      var navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(function(item) {
        item.removeAttribute('tabindex');
        item.removeAttribute('role');
        item.removeAttribute('aria-label');
        item.style.outline = 'none';
      });
    },

    updateNavItems: function() {
      this.navItems = Array.from(document.querySelectorAll('.nav-item'));
      this.currentFocus = this.navItems.findIndex(function(item) {
        return item.classList.contains('active');
      });
      if (this.currentFocus === -1) this.currentFocus = 0;
    },

    handleKeyDown: function(event) {
      if (!this.isDesktop) return;
      
      var key = event.key;
      var handled = false;

      switch (key) {
        case 'ArrowUp':
          this.navigateUp();
          handled = true;
          break;
        case 'ArrowDown':
          this.navigateDown();
          handled = true;
          break;
        case 'Enter':
        case ' ':
          this.activateCurrentItem();
          handled = true;
          break;
        case 'Home':
          this.navigateToFirst();
          handled = true;
          break;
        case 'End':
          this.navigateToLast();
          handled = true;
          break;
        case 'Tab':
          // デフォルトのタブ動作を許可
          break;
        case 'Escape':
          this.clearFocus();
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    },

    navigateUp: function() {
      if (this.navItems.length === 0) return;
      
      this.currentFocus = this.currentFocus > 0 ? this.currentFocus - 1 : this.navItems.length - 1;
      this.focusCurrentItem();
    },

    navigateDown: function() {
      if (this.navItems.length === 0) return;
      
      this.currentFocus = this.currentFocus < this.navItems.length - 1 ? this.currentFocus + 1 : 0;
      this.focusCurrentItem();
    },

    navigateToFirst: function() {
      if (this.navItems.length === 0) return;
      
      this.currentFocus = 0;
      this.focusCurrentItem();
    },

    navigateToLast: function() {
      if (this.navItems.length === 0) return;
      
      this.currentFocus = this.navItems.length - 1;
      this.focusCurrentItem();
    },

    focusCurrentItem: function() {
      if (this.navItems[this.currentFocus]) {
        // 全てのアイテムのtabindexをリセット
        this.navItems.forEach(function(item) {
          item.setAttribute('tabindex', '-1');
        });
        
        // 現在のアイテムにフォーカス
        var currentItem = this.navItems[this.currentFocus];
        currentItem.setAttribute('tabindex', '0');
        currentItem.focus();
      }
    },

    activateCurrentItem: function() {
      if (this.navItems[this.currentFocus]) {
        this.navItems[this.currentFocus].click();
      }
    },

    clearFocus: function() {
      if (this.navItems[this.currentFocus]) {
        this.navItems[this.currentFocus].blur();
      }
    }
  };

  // マウスホバー効果の強化（デスクトップのみ）
  var EnhancedHover = {
    init: function() {
      this.setupHoverEffects();
      window.addEventListener('resize', this.handleResize.bind(this));
    },

    handleResize: function() {
      // レスポンシブ対応
      this.setupHoverEffects();
    },

    setupHoverEffects: function() {
      if (window.innerWidth < 1024) return; // デスクトップのみ

      var navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(function(item) {
        // マウスエンター時のアニメーション
        item.addEventListener('mouseenter', function() {
          if (!item.classList.contains('active')) {
            item.style.backgroundColor = 'rgba(25, 118, 210, 0.08)';
            item.style.transform = 'translateX(6px)';
            item.style.transition = 'all 0.2s ease';
          }
        });

        // マウスリーブ時のアニメーション
        item.addEventListener('mouseleave', function() {
          if (!item.classList.contains('active')) {
            item.style.backgroundColor = '';
            item.style.transform = '';
          }
        });
      });

      // その他のホバー効果
      var buttons = document.querySelectorAll('.btn, .btn-outline');
      buttons.forEach(function(button) {
        button.addEventListener('mouseenter', function() {
          if (window.innerWidth >= 1024) {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 6px 16px rgba(25, 118, 210, 0.3)';
          }
        });

        button.addEventListener('mouseleave', function() {
          button.style.transform = '';
          button.style.boxShadow = '';
        });
      });
    }
  };

  // ページ読み込み後に初期化
  document.addEventListener('DOMContentLoaded', function() {
    KeyboardNavigation.init();
    EnhancedHover.init();
  });

  // グローバルスコープに公開
  window.KeyboardNavigation = KeyboardNavigation;
  window.EnhancedHover = EnhancedHover;
})();