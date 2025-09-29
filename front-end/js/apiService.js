// Phone App用のAPIサービス
(() => {
  'use strict';

  // ES2017以降版（コメント化）
  // class ApiService {
  //   constructor() {
  //     this.API_BASE = '/api';
  //   }
  // }

  // ES2017以前版
  function ApiService() {
    this.API_BASE = '/api';
  }

  // ES2017以降版（コメント化）
  // async apiCall(endpoint, options = {}) {
  //   try {
  //     // ローディング状態は呼び出し元で管理
  //     const response = await fetch(`${this.API_BASE}${endpoint}`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         ...options.headers
  //       },
  //       ...options
  //     });
  // 
  //     const data = await response.json();
  // 
  //     if (!response.ok) {
  //       throw new Error(data.error || 'API error');
  //     }
  // 
  //     return data;
  //   } catch (error) {
  //     throw error; // エラーハンドリングは呼び出し元で行う
  //   }
  // }

  // ES2017以前版
  ApiService.prototype.apiCall = function(endpoint, options) {
    var self = this;
    if (typeof options === 'undefined') {
      options = {};
    }
    
    return new Promise(function(resolve, reject) {
      // ローディング状態は呼び出し元で管理
      var headers = {
        'Content-Type': 'application/json'
      };
      
      if (options.headers) {
        for (var key in options.headers) {
          if (options.headers.hasOwnProperty(key)) {
            headers[key] = options.headers[key];
          }
        }
      }
      
      var fetchOptions = {
        headers: headers
      };
      
      for (var prop in options) {
        if (options.hasOwnProperty(prop) && prop !== 'headers') {
          fetchOptions[prop] = options[prop];
        }
      }
      
      fetch(self.API_BASE + endpoint, fetchOptions)
        .then(function(response) {
          return response.json().then(function(data) {
            if (!response.ok) {
              var error = new Error(data.error || 'API error');
              throw error;
            }
            return data;
          });
        })
        .then(function(data) {
          resolve(data);
        })
        .catch(function(error) {
          reject(error); // エラーハンドリングは呼び出し元で行う
        });
    });
  };

  // ES2017以降版（コメント化）
  // async getBalance(id) {
  //   return await this.apiCall(`/balance/${id}`);
  // }

  // ES2017以前版
  ApiService.prototype.getBalance = function(id) {
    return this.apiCall('/balance/' + id);
  };

  // ES2017以降版（コメント化）
  // async addMoney(id, amount, games = '', dealer = '') {
  //   return await this.apiCall('/add', {
  //     method: 'POST',
  //     body: JSON.stringify({ id, amount, games, dealer })
  //   });
  // }

  // ES2017以前版
  ApiService.prototype.addMoney = function(id, amount, games, dealer) {
    if (typeof games === 'undefined') games = '';
    if (typeof dealer === 'undefined') dealer = '';
    
    var body = {
      id: id,
      amount: amount,
      games: games,
      dealer: dealer
    };
    
    return this.apiCall('/add', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  };

  // ES2017以降版（コメント化）
  // async subtractMoney(id, amount, games = '', dealer = '') {
  //   return await this.apiCall('/subtract', {
  //     method: 'POST',
  //     body: JSON.stringify({ id, amount, games, dealer })
  //   });
  // }

  // ES2017以前版
  ApiService.prototype.subtractMoney = function(id, amount, games, dealer) {
    if (typeof games === 'undefined') games = '';
    if (typeof dealer === 'undefined') dealer = '';
    
    var body = {
      id: id,
      amount: amount,
      games: games,
      dealer: dealer
    };
    
    return this.apiCall('/subtract', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  };

  // ES2017以降版（コメント化）
  // async getHistory() {
  //   return await this.apiCall('/history');
  // }

  // ES2017以前版
  ApiService.prototype.getHistory = function() {
    return this.apiCall('/history');
  };

  // ES2017以降版（コメント化）
  // async getRanking() {
  //   return await this.apiCall('/ranking');
  // }

  // ES2017以前版
  ApiService.prototype.getRanking = function() {
    return this.apiCall('/ranking');
  };

  // ES2017以降版（コメント化）
  // async createUser(id = null, balance = 0) {
  //   const body = {};
  //   if (id) body.id = id;
  //   if (balance > 0) body.balance = balance;
  // 
  //   return await this.apiCall('/users', {
  //     method: 'POST',
  //     body: JSON.stringify(body)
  //   });
  // }

  // ES2017以前版
  ApiService.prototype.createUser = function(id, balance) {
    if (typeof id === 'undefined') id = null;
    if (typeof balance === 'undefined') balance = 0;
    
    var body = {};
    if (id) body.id = id;
    if (balance > 0) body.balance = balance;

    return this.apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  };

  // ES2017以降版（コメント化）
  // async getDashboardStats() {
  //   return await this.apiCall('/dashboard-stats');
  // }

  // ES2017以前版
  ApiService.prototype.getDashboardStats = function() {
    return this.apiCall('/dashboard-stats');
  };

  // グローバルエクスポート
  window.ApiService = ApiService;
})();