// Phone App用のQRスキャナーモジュール
(() => {
  'use strict';
  
  if (window.QRScanner) return; // 多重読み込みガード

  class QRScanner {
    constructor() {
      this.stream = null;
      this.trackList = [];
      this.deviceIds = [];
      this.currentIndex = 0;
      this.ticking = false;
      
      this.initElements();
      this.setupEventListeners();
    }

    initElements() {
      this.scannerEl = document.getElementById('qrScanner');
      this.videoEl = document.getElementById('qrVideo');
      this.canvasEl = document.getElementById('qrCanvas');
      this.overlayEl = document.getElementById('qrOverlay');
      this.stopBtn = document.getElementById('qrStopBtn');
      this.switchBtn = document.getElementById('qrSwitchBtn');
      this.idleEl = document.getElementById('qrIdle');
    }

    async enumerateCameras() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videos = devices.filter(d => d.kind === 'videoinput');
      this.deviceIds = videos.map(v => v.deviceId);
      
      // 背面カメラらしきデバイスを優先（environment）
      if (this.deviceIds.length > 1) {
        const envIdx = videos.findIndex(v => /back|environment/i.test(v.label));
        if (envIdx >= 0) this.currentIndex = envIdx;
      }
    }

    async warmup(constraints) {
      try {
        const s = await navigator.mediaDevices.getUserMedia(constraints);
        s.getTracks().forEach(t => t.stop()); // すぐ止める
        return true;
      } catch (e) {
        throw e;
      }
    }

    humanizeError(err) {
      const name = err && (err.name || err.code) || '';
      switch (name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          return 'カメラの使用がブロックされています。サイトの権限から「カメラを許可」に変更してください。';
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          return 'カメラデバイスが見つかりません。実機で、または外付けカメラ接続後に再試行してください。';
        case 'NotReadableError':
        case 'TrackStartError':
          return 'カメラを占有している別アプリがある可能性があります。ほかのアプリ/タブを閉じてください。';
        case 'OverconstrainedError':
        case 'ConstraintNotSatisfiedError':
          return '指定したカメラ制約に合致するデバイスがありません。カメラ切替でお試しください。';
        case 'SecurityError':
          return '安全なコンテキストが必要です。HTTPSでアクセスするか、ローカルは http://localhost を使用してください。';
        default:
          return `不明なエラーです（${name || 'no-name'}）。ページを再読込して再試行してください。`;
      }
    }

    async start() {
      try {
        await this.enumerateCameras();

        const tryOrders = [
          { audio: false, video: { facingMode: { ideal: 'environment' } } },
          this.deviceIds.length ? { audio: false, video: { deviceId: { exact: this.deviceIds[this.currentIndex] } } } : null
        ].filter(Boolean);

        let lastErr = null;
        for (const constraints of tryOrders) {
          try {
            await this.warmup(constraints);
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.trackList = this.stream.getVideoTracks();

            this.videoEl.srcObject = this.stream;
            await this.videoEl.play();

            this.videoEl.style.display = 'block';
            this.overlayEl.style.display = 'block';
            this.idleEl.style.display = 'none';

            this.ticking = true;
            this.tick();
            
            if (window.showNotification) {
              window.showNotification('スキャンを開始しました');
            }
            return;
          } catch (err) {
            lastErr = err;
            continue;
          }
        }

        throw lastErr || new Error('Unknown getUserMedia error');

      } catch (err) {
        const msg = this.humanizeError(err);
        if (window.showNotification) {
          window.showNotification(`カメラを起動できません: ${msg}`, 'error');
        }
        console.error('[QR] getUserMedia failed:', err);
      }
    }

    stop() {
      this.ticking = false;
      if (this.trackList) {
        this.trackList.forEach(t => t.stop());
      }
      this.stream = null;
      this.videoEl.srcObject = null;

      this.videoEl.style.display = 'none';
      this.overlayEl.style.display = 'none';
      this.idleEl.style.display = 'block';
    }

    async switchCamera() {
      if (!this.deviceIds.length) return;
      this.stop();
      this.currentIndex = (this.currentIndex + 1) % this.deviceIds.length;
      await this.start();
    }

    drawLine(ctx, begin, end) {
      ctx.beginPath();
      ctx.moveTo(begin.x, begin.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineWidth = 4;
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--qr-line') || '#00e676';
      ctx.stroke();
    }

    tick() {
      if (!this.ticking) return;

      if (this.videoEl.readyState === this.videoEl.HAVE_ENOUGH_DATA) {
        const width = this.videoEl.videoWidth;
        const height = this.videoEl.videoHeight;

        this.canvasEl.width = width;
        this.canvasEl.height = height;

        const ctx = this.canvasEl.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(this.videoEl, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        if (typeof jsQR !== 'undefined') {
          const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });

          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(this.videoEl, 0, 0, width, height);

          if (code) {
            this.drawLine(ctx, code.location.topLeftCorner, code.location.topRightCorner);
            this.drawLine(ctx, code.location.topRightCorner, code.location.bottomRightCorner);
            this.drawLine(ctx, code.location.bottomRightCorner, code.location.bottomLeftCorner);
            this.drawLine(ctx, code.location.bottomLeftCorner, code.location.topLeftCorner);

            this.handleResult(code.data);
            return;
          }
        }
      }
      requestAnimationFrame(() => this.tick());
    }

    handleResult(text) {
      this.stop();

      const userIdInput = document.querySelector('input[placeholder="ユーザーIDを入力"]');
      if (userIdInput) {
        userIdInput.value = text;
      }

      if (window.showNotification) {
        window.showNotification('QRコードを読み取りました');
      }

      // 自動で検索実行（任意）
      if (window.handleUserSearch) {
        window.handleUserSearch();
      }
    }

    setupEventListeners() {
      if (this.scannerEl) {
        this.scannerEl.addEventListener('click', (e) => {
          if (e.target === this.stopBtn || e.target === this.switchBtn) return;
          if (!this.stream) this.start();
        });
      }

      if (this.stopBtn) {
        this.stopBtn.addEventListener('click', () => this.stop());
      }

      if (this.switchBtn) {
        this.switchBtn.addEventListener('click', () => this.switchCamera());
      }

      // フォールバック: ファイルから読み取り
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.setupFileFallback();
      }
    }

    setupFileFallback() {
      const fallback = document.createElement('input');
      fallback.type = 'file';
      fallback.accept = 'image/*';
      fallback.capture = 'environment';
      fallback.style.marginTop = '8px';
      
      fallback.addEventListener('change', async (evt) => {
        const file = evt.target.files[0];
        if (!file) return;
        
        const img = new Image();
        img.onload = () => {
          this.canvasEl.width = img.width;
          this.canvasEl.height = img.height;
          const ctx = this.canvasEl.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          
          if (typeof jsQR !== 'undefined') {
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
              this.handleResult(code.data);
            } else {
              if (window.showNotification) {
                window.showNotification('QRを認識できませんでした', 'error');
              }
            }
          }
        };
        img.src = URL.createObjectURL(file);
      });
      
      if (this.scannerEl) {
        this.scannerEl.appendChild(fallback);
      }
    }
  }

  // グローバルに公開
  window.QRScanner = QRScanner;

  // 自動初期化
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('qrScanner')) {
      window.qrScannerInstance = new QRScanner();
    }
  });
})();