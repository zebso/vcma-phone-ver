// Phone App用のQRスキャナーモジュール（ES2017以前版）
(function() {
  'use strict';
  
  if (window.QRScanner) return; // 多重読み込みガード

  // ES2017以降版（コメント化）
  // class QRScanner {
  //   constructor() {
  //     this.stream = null;
  //     this.trackList = [];
  //     this.deviceIds = [];
  //     this.currentIndex = 0;
  //     this.ticking = false;
  //     this.initElements();
  //     this.setupEventListeners();
  //   }
  // }

  // ES2017以前版
  function QRScanner() {
    this.stream = null;
    this.trackList = [];
    this.deviceIds = [];
    this.currentIndex = 0;
    this.ticking = false;
    
    this.initElements();
    this.setupEventListeners();
  }

  QRScanner.prototype.initElements = function() {
    this.scannerEl = document.getElementById('qrScanner');
    this.videoEl = document.getElementById('qrVideo');
    this.canvasEl = document.getElementById('qrCanvas');
    this.overlayEl = document.getElementById('qrOverlay');
    this.stopBtn = document.getElementById('qrStopBtn');
    this.switchBtn = document.getElementById('qrSwitchBtn');
    this.idleEl = document.getElementById('qrIdle');
  };

  QRScanner.prototype.enumerateCameras = function() {
    var self = this;
    return navigator.mediaDevices.enumerateDevices()
      .then(function(devices) {
        var videos = devices.filter(function(d) { return d.kind === 'videoinput'; });
        self.deviceIds = videos.map(function(v) { return v.deviceId; });
        
        // 背面カメラらしきデバイスを優先（environment）
        if (self.deviceIds.length > 1) {
          var envIdx = -1;
          for (var i = 0; i < videos.length; i++) {
            if (/back|environment/i.test(videos[i].label)) {
              envIdx = i;
              break;
            }
          }
          if (envIdx >= 0) self.currentIndex = envIdx;
        }
      });
  };

  QRScanner.prototype.warmup = function(constraints) {
    return navigator.mediaDevices.getUserMedia(constraints)
      .then(function(s) {
        var tracks = s.getTracks();
        for (var i = 0; i < tracks.length; i++) {
          tracks[i].stop(); // すぐ止める
        }
        return true;
      })
      .catch(function(e) {
        throw e;
      });
  };

  QRScanner.prototype.humanizeError = function(err) {
    var name = err && (err.name || err.code) || '';
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
        return '不明なエラーです（' + (name || 'no-name') + '）。ページを再読込して再試行してください。';
    }
  };

  QRScanner.prototype.start = function() {
    var self = this;
    
    return this.enumerateCameras()
      .then(function() {
        var tryOrders = [
          { audio: false, video: { facingMode: { ideal: 'environment' } } }
        ];
        
        if (self.deviceIds.length) {
          tryOrders.push({
            audio: false,
            video: { deviceId: { exact: self.deviceIds[self.currentIndex] } }
          });
        }

        var lastErr = null;
        
        function tryNextConstraint(index) {
          if (index >= tryOrders.length) {
            throw lastErr || new Error('Unknown getUserMedia error');
          }
          
          var constraints = tryOrders[index];
          return self.warmup(constraints)
            .then(function() {
              return navigator.mediaDevices.getUserMedia(constraints);
            })
            .then(function(stream) {
              self.stream = stream;
              self.trackList = stream.getVideoTracks();

              self.videoEl.srcObject = stream;
              return new Promise(function(resolve, reject) {
                self.videoEl.onloadedmetadata = function() {
                  self.videoEl.play()
                    .then(resolve)
                    .catch(reject);
                };
              });
            })
            .then(function() {
              self.videoEl.style.display = 'block';
              self.canvasEl.style.display = 'block';
              self.overlayEl.style.display = 'block';
              self.idleEl.style.display = 'none';

              self.ticking = true;
              self.tick();
              
              if (window.showNotification) {
                window.showNotification('スキャンを開始しました');
              }
            })
            .catch(function(err) {
              lastErr = err;
              return tryNextConstraint(index + 1);
            });
        }
        
        return tryNextConstraint(0);
      })
      .catch(function(err) {
        var msg = self.humanizeError(err);
        if (window.showNotification) {
          window.showNotification('カメラを起動できません: ' + msg, 'error');
        }
        console.error('[QR] getUserMedia failed:', err);
      });
  };

  QRScanner.prototype.stop = function() {
    this.ticking = false;
    if (this.trackList) {
      for (var i = 0; i < this.trackList.length; i++) {
        this.trackList[i].stop();
      }
    }
    this.stream = null;
    this.videoEl.srcObject = null;

    this.videoEl.style.display = 'none';
    this.canvasEl.style.display = 'none';
    this.overlayEl.style.display = 'none';
    this.idleEl.style.display = 'block';
  };

  QRScanner.prototype.switchCamera = function() {
    var self = this;
    if (!this.deviceIds.length) return Promise.resolve();
    
    this.stop();
    this.currentIndex = (this.currentIndex + 1) % this.deviceIds.length;
    return this.start();
  };

  QRScanner.prototype.drawLine = function(ctx, begin, end) {
    ctx.beginPath();
    ctx.moveTo(begin.x, begin.y);
    ctx.lineTo(end.x, end.y);
    ctx.lineWidth = 4;
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--qr-line') || '#00e676';
    ctx.stroke();
  };

  QRScanner.prototype.tick = function() {
    var self = this;
    if (!this.ticking) return;

    if (this.videoEl.readyState === this.videoEl.HAVE_ENOUGH_DATA) {
      var width = this.videoEl.videoWidth;
      var height = this.videoEl.videoHeight;

      this.canvasEl.width = width;
      this.canvasEl.height = height;

      var ctx = this.canvasEl.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(this.videoEl, 0, 0, width, height);
      var imageData = ctx.getImageData(0, 0, width, height);

      if (typeof jsQR !== 'undefined') {
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(this.videoEl, 0, 0, width, height);

        if (code) {
          console.log('QRコード検出成功:', code.data);
          this.drawLine(ctx, code.location.topLeftCorner, code.location.topRightCorner);
          this.drawLine(ctx, code.location.topRightCorner, code.location.bottomRightCorner);
          this.drawLine(ctx, code.location.bottomRightCorner, code.location.bottomLeftCorner);
          this.drawLine(ctx, code.location.bottomLeftCorner, code.location.topLeftCorner);

          this.handleResult(code.data);
          return;
        }
      }
    }
    requestAnimationFrame(function() { self.tick(); });
  };

  QRScanner.prototype.handleResult = function(text) {
    this.stop();

    var userIdInput = document.querySelector('input[placeholder="ユーザーIDを入力"]');
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
  };

  QRScanner.prototype.setupEventListeners = function() {
    var self = this;
    
    if (this.scannerEl) {
      this.scannerEl.addEventListener('click', function(e) {
        if (e.target === self.stopBtn || e.target === self.switchBtn) return;
        if (!self.stream) self.start();
      });
    }

    if (this.stopBtn) {
      this.stopBtn.addEventListener('click', function() { self.stop(); });
    }

    if (this.switchBtn) {
      this.switchBtn.addEventListener('click', function() { self.switchCamera(); });
    }

    // フォールバック: ファイルから読み取り
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.setupFileFallback();
    }
  };

  QRScanner.prototype.setupFileFallback = function() {
    var self = this;
    var fallback = document.createElement('input');
    fallback.type = 'file';
    fallback.accept = 'image/*';
    fallback.capture = 'environment';
    fallback.style.marginTop = '8px';
    
    fallback.addEventListener('change', function(evt) {
      var file = evt.target.files[0];
      if (!file) return;
      
      var img = new Image();
      img.onload = function() {
        self.canvasEl.width = img.width;
        self.canvasEl.height = img.height;
        var ctx = self.canvasEl.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        var imageData = ctx.getImageData(0, 0, img.width, img.height);
        
        if (typeof jsQR !== 'undefined') {
          var code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            self.handleResult(code.data);
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
  };

  // グローバルに公開
  window.QRScanner = QRScanner;

  // 自動初期化
  document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('qrScanner')) {
      window.qrScannerInstance = new QRScanner();
    }
  });
})();