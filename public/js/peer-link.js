/**
 * PeerLink - Tầng truyền P2P (V4)
 * Kết nối trực tiếp 2 trình duyệt bằng WebRTC DataChannel.
 * Signaling THỦ CÔNG: người dùng copy "mã mời" / "mã trả lời" gửi cho nhau (Zalo, chat...).
 * Không có server trung gian nào chuyển tiếp dữ liệu: sau khi kết nối, tắt hết server vẫn truyền được.
 */
(function () {
  // Cùng máy / cùng LAN chỉ cần host candidate. STUN chỉ giúp thêm nếu có Internet, không bắt buộc.
  const RTC_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  const ICE_GATHER_TIMEOUT_MS = 3000;

  // Mã hoá SDP thành chuỗi gọn để copy
  function encode(obj) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  }
  function decode(code) {
    return JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
  }

  // Chờ thu thập ICE xong (không trickle) để gói toàn bộ địa chỉ vào 1 mã duy nhất
  function waitIceComplete(pc) {
    if (pc.iceGatheringState === 'complete') return Promise.resolve();
    return new Promise(resolve => {
      const done = () => { pc.removeEventListener('icegatheringstatechange', check); resolve(); };
      const check = () => { if (pc.iceGatheringState === 'complete') done(); };
      pc.addEventListener('icegatheringstatechange', check);
      setTimeout(done, ICE_GATHER_TIMEOUT_MS);
    });
  }

  class PeerLink {
    constructor() {
      this.pc = null;
      this.channel = null;
      this.onMessage = () => {};
      this.onStateChange = () => {};
    }

    get isOpen() {
      return !!this.channel && this.channel.readyState === 'open';
    }

    _newConnection() {
      this.close();
      this.pc = new RTCPeerConnection(RTC_CONFIG);
      this.pc.addEventListener('connectionstatechange', () => {
        this.onStateChange(this.pc.connectionState);
      });
      // Phía trả lời nhận kênh do phía mời tạo
      this.pc.addEventListener('datachannel', e => this._bindChannel(e.channel));
    }

    _bindChannel(channel) {
      this.channel = channel;
      channel.addEventListener('open', () => this.onStateChange('open'));
      channel.addEventListener('close', () => this.onStateChange('closed'));
      channel.addEventListener('message', e => {
        try { this.onMessage(JSON.parse(e.data)); }
        catch (err) { console.error('Tin nhắn P2P lỗi:', err); }
      });
    }

    // Bước 1 (máy A): tạo mã mời
    async createOffer() {
      this._newConnection();
      this._bindChannel(this.pc.createDataChannel('tasks', { ordered: true }));
      await this.pc.setLocalDescription(await this.pc.createOffer());
      await waitIceComplete(this.pc);
      return encode({ kind: 'offer', sdp: this.pc.localDescription });
    }

    // Bước 2 (máy B): nhận mã mời, sinh mã trả lời
    async acceptOffer(desc) {
      this._newConnection();
      await this.pc.setRemoteDescription(desc);
      await this.pc.setLocalDescription(await this.pc.createAnswer());
      await waitIceComplete(this.pc);
      return encode({ kind: 'answer', sdp: this.pc.localDescription });
    }

    // Bước 3 (máy A): nhận mã trả lời -> kết nối
    async acceptAnswer(desc) {
      if (!this.pc) throw new Error('Chưa tạo mã mời trên máy này.');
      await this.pc.setRemoteDescription(desc);
    }

    // Tự nhận biết mã dán vào là mời hay trả lời. Trả về mã cần gửi lại (nếu có).
    async handlePastedCode(code) {
      const data = decode(code);
      if (data.kind === 'offer') return this.acceptOffer(data.sdp);
      if (data.kind === 'answer') { await this.acceptAnswer(data.sdp); return null; }
      throw new Error('Mã không hợp lệ.');
    }

    send(msg) {
      if (!this.isOpen) return false;
      this.channel.send(JSON.stringify(msg));
      return true;
    }

    close() {
      if (this.channel) this.channel.close();
      if (this.pc) this.pc.close();
      this.channel = null;
      this.pc = null;
    }
  }

  window.PeerLink = PeerLink;
})();
