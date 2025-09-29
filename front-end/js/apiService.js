// Phone App用のAPIサービス
(() => {
  'use strict';

  class ApiService {
    constructor() {
      this.API_BASE = '/api';
    }

    async apiCall(endpoint, options = {}) {
      try {
        // ローディング状態は呼び出し元で管理
        const response = await fetch(`${this.API_BASE}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'API error');
        }

        return data;
      } catch (error) {
        throw error; // エラーハンドリングは呼び出し元で行う
      }
    }

    async getBalance(id) {
      return await this.apiCall(`/balance/${id}`);
    }

    async addMoney(id, amount, games = '', dealer = '') {
      return await this.apiCall('/add', {
        method: 'POST',
        body: JSON.stringify({ id, amount, games, dealer })
      });
    }

    async subtractMoney(id, amount, games = '', dealer = '') {
      return await this.apiCall('/subtract', {
        method: 'POST',
        body: JSON.stringify({ id, amount, games, dealer })
      });
    }

    async getHistory() {
      return await this.apiCall('/history');
    }

    async getRanking() {
      return await this.apiCall('/ranking');
    }

    async createUser(id = null, balance = 0) {
      const body = {};
      if (id) body.id = id;
      if (balance > 0) body.balance = balance;

      return await this.apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(body)
      });
    }

    async getDashboardStats() {
      return await this.apiCall('/dashboard-stats');
    }
  }

  // グローバルエクスポート
  window.ApiService = ApiService;
})();