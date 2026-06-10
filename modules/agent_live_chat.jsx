// 专业代理后台 - Live Chat 悬浮客服组件  v3.2.42
// 未登入着陆页 + 已登入后台 右下角悬浮图标,点击展开简易客服面板
// 全局开关:window.APS_openLiveChat() / window.APS_closeLiveChat()

(function () {
  const POS_KEY = 'aps_livechat_pos';
  const FAB = 56, MARGIN = 8;
  function loadPos() {
    try { const p = JSON.parse(localStorage.getItem(POS_KEY)); if (p && typeof p.right === 'number' && typeof p.bottom === 'number') return p; } catch (e) {}
    return { right: 24, bottom: 24 };
  }
  function AgentLiveChat() {
    const [open, setOpen] = React.useState(false);
    const [msg, setMsg] = React.useState('');
    const [pos, setPos] = React.useState(loadPos);
    const movedRef = React.useRef(false);
    const [thread, setThread] = React.useState([
      { from: 'cs', text: '您好!我是 Beans 专属代理客服,请问有什么可以帮您?' },
    ]);
    const bodyRef = React.useRef(null);

    // 悬浮图标可拖动:拖动重新定位(localStorage 持久化),未拖动则视为点击开关
    const onFabDown = (e) => {
      e.preventDefault();
      const startX = e.clientX, startY = e.clientY;
      const start = { ...pos };
      let cur = { ...start };
      movedRef.current = false;
      const onMove = (ev) => {
        const dx = ev.clientX - startX, dy = ev.clientY - startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true;
        let right = start.right - dx;
        let bottom = start.bottom - dy;
        right = Math.max(MARGIN, Math.min(window.innerWidth - FAB - MARGIN, right));
        bottom = Math.max(MARGIN, Math.min(window.innerHeight - FAB - MARGIN, bottom));
        cur = { right, bottom };
        setPos(cur);
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        if (movedRef.current) {
          try { localStorage.setItem(POS_KEY, JSON.stringify(cur)); } catch (e) {}
        } else {
          setOpen(o => !o);
        }
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    };

    React.useEffect(() => {
      window.APS_openLiveChat = () => setOpen(true);
      window.APS_closeLiveChat = () => setOpen(false);
      return () => { delete window.APS_openLiveChat; delete window.APS_closeLiveChat; };
    }, []);

    React.useEffect(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }, [thread, open]);

    const send = () => {
      const v = msg.trim();
      if (!v) return;
      setThread(t => [...t, { from: 'me', text: v }]);
      setMsg('');
      setTimeout(() => {
        setThread(t => [...t, { from: 'cs', text: '已收到您的咨询,客服将尽快为您处理(原型示意)。' }]);
      }, 700);
    };

    return (
      <div className="alc-root" style={{ right: pos.right, bottom: pos.bottom }}>
        {open && (
          <div className="alc-panel">
            <div className="alc-head">
              <div className="alc-head-info">
                <span className="alc-avatar"><Icon name="message" size={16}/></span>
                <div>
                  <div className="alc-head-title">在线客服</div>
                  <div className="alc-head-sub"><span className="alc-dot"/>7×24 在线</div>
                </div>
              </div>
              <button className="alc-close" onClick={() => setOpen(false)} aria-label="关闭"><Icon name="x" size={15}/></button>
            </div>
            <div className="alc-body" ref={bodyRef}>
              {thread.map((m, i) => (
                <div key={i} className={'alc-msg ' + (m.from === 'me' ? 'me' : 'cs')}>
                  <div className="alc-bubble">{m.text}</div>
                </div>
              ))}
            </div>
            <div className="alc-input">
              <input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') send(); }}
                placeholder="输入消息…"
              />
              <button onClick={send} disabled={!msg.trim()}><Icon name="send" size={15}/></button>
            </div>
          </div>
        )}
        <button className={'alc-fab' + (open ? ' open' : '')} onPointerDown={onFabDown} aria-label="在线客服">
          <Icon name={open ? 'x' : 'message'} size={24}/>
        </button>
      </div>
    );
  }

  // 注入样式
  if (!document.getElementById('alc-styles')) {
    const css = `
.alc-root { position:fixed; right:24px; bottom:24px; z-index:9000; display:flex; flex-direction:column; align-items:flex-end; gap:14px; font-family:inherit; }
.alc-fab { width:56px; height:56px; border-radius:50%; border:none; background:#3b82f6; color:#fff; cursor:grab; touch-action:none; box-shadow:0 8px 24px rgba(59,130,246,.4); display:grid; place-items:center; transition:transform .15s, background .15s; }
.alc-fab:active { cursor:grabbing; }
.alc-fab:hover { background:#2563eb; transform:translateY(-2px); }
.alc-fab.open { background:#64748b; }
.alc-fab.open:hover { background:#475569; }
.alc-panel { width:340px; max-width:calc(100vw - 48px); height:440px; max-height:calc(100vh - 120px); background:#fff; border-radius:16px; box-shadow:0 24px 60px -12px rgba(15,23,42,.35); display:flex; flex-direction:column; overflow:hidden; animation:alcUp .2s ease; }
@keyframes alcUp { from{opacity:0; transform:translateY(12px)} to{opacity:1; transform:translateY(0)} }
.alc-head { background:linear-gradient(135deg,#3b82f6,#1e40af); color:#fff; padding:14px 16px; display:flex; align-items:center; justify-content:space-between; }
.alc-head-info { display:flex; align-items:center; gap:10px; }
.alc-avatar { width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,.2); display:grid; place-items:center; }
.alc-head-title { font-size:14.5px; font-weight:700; }
.alc-head-sub { font-size:11.5px; opacity:.9; display:flex; align-items:center; gap:5px; margin-top:2px; }
.alc-dot { width:7px; height:7px; border-radius:50%; background:#4ade80; box-shadow:0 0 0 2px rgba(74,222,128,.3); }
.alc-close { background:transparent; border:none; color:#fff; cursor:pointer; opacity:.85; display:grid; place-items:center; padding:4px; border-radius:6px; }
.alc-close:hover { opacity:1; background:rgba(255,255,255,.15); }
.alc-body { flex:1; overflow-y:auto; padding:16px; background:#f8fafc; display:flex; flex-direction:column; gap:10px; }
.alc-msg { display:flex; }
.alc-msg.me { justify-content:flex-end; }
.alc-bubble { max-width:78%; padding:9px 13px; border-radius:12px; font-size:13px; line-height:1.5; }
.alc-msg.cs .alc-bubble { background:#fff; border:1px solid #e5e7eb; color:#1e293b; border-top-left-radius:3px; }
.alc-msg.me .alc-bubble { background:#3b82f6; color:#fff; border-top-right-radius:3px; }
.alc-input { display:flex; gap:8px; padding:12px; border-top:1px solid #e5e7eb; background:#fff; }
.alc-input input { flex:1; border:1px solid #e5e7eb; border-radius:8px; padding:9px 12px; font-size:13px; outline:none; transition:border-color .15s; }
.alc-input input:focus { border-color:#3b82f6; }
.alc-input button { width:38px; border:none; border-radius:8px; background:#3b82f6; color:#fff; cursor:pointer; display:grid; place-items:center; transition:background .15s; }
.alc-input button:hover:not(:disabled) { background:#2563eb; }
.alc-input button:disabled { background:#cbd5e1; cursor:not-allowed; }
`;
    const el = document.createElement('style');
    el.id = 'alc-styles';
    el.textContent = css;
    document.head.appendChild(el);
  }

  window.AgentLiveChat = AgentLiveChat;
})();
