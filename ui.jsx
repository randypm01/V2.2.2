// Shared UI primitives + Icon set
const { useState, useEffect, useRef, useContext, createContext } = React;

// ============= Icons (inline SVG, stroke-based) =============
const ICONS = {
  dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  users: 'M16 11a4 4 0 1 0-4-4M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 0c-2.7 0-8 1.3-8 4v3h16v-3c0-2.7-5.3-4-8-4zm8 0c-.5 0-1 .03-1.5.1 1.4 1 2.5 2.4 2.5 3.9v3h7v-3c0-2.7-5.3-4-8-4z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4 0-8 2-8 5v3h16v-3c0-3-4-5-8-5z',
  network: 'M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  link: 'M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
  pulse: 'M3 12h4l3-9 4 18 3-9h4',
  target: 'M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0M12 12m-5 0a5 5 0 1 0 10 0 5 5 0 1 0-10 0M12 12m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0',
  pie: 'M12 3v9l8 4A9 9 0 1 1 12 3z',
  file: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6zm0 0v6h6M9 14h6M9 18h6',
  wallet: 'M3 7v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2zm0 0a2 2 0 0 1 2-2h11M17 14h.01',
  shield: 'M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z',
  image: 'M21 15l-5-5L5 21M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm6 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
  flag: 'M4 21V4h13l-2 5 2 5H4',
  bell: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2l8 6 8-6',
  api: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  building: 'M3 21V7l9-4 9 4v14M3 21h18M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01',
  menu: 'M3 6h18M3 12h18M3 18h18',
  monitor: 'M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 21h8M12 17v4',
  smartphone: 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM12 18h.01',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 3',
  search: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1.3l2-1.6-2-3.5-2.4.8a7.4 7.4 0 0 0-2.3-1.3l-.4-2.5h-4l-.4 2.5a7.4 7.4 0 0 0-2.3 1.3l-2.4-.8-2 3.5 2 1.6a7.4 7.4 0 0 0 0 2.6l-2 1.6 2 3.5 2.4-.8a7.4 7.4 0 0 0 2.3 1.3l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 2.3-1.3l2.4.8 2-3.5-2-1.6c.07-.4.1-.85.1-1.3z',
  plus: 'M12 5v14M5 12h14',
  x: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12l5 5L20 7',
  download: 'M12 4v12m0 0l-5-5m5 5l5-5M4 20h16',
  upload: 'M12 20V8m0 0l-5 5m5-5l5 5M4 4h16',
  refresh: 'M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeOff: 'M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.84 19.84 0 0 1 5.06-5.94M9.9 4.24A10.93 10.93 0 0 1 12 4c7 0 11 8 11 8a19.84 19.84 0 0 1-3.17 4.19M1 1l22 22M14.12 14.12a3 3 0 1 1-4.24-4.24',
  lock: 'M5 11h14v10H5V11zm2 0V7a5 5 0 0 1 10 0v4',
  logOut: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z',
  copy: 'M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8l-4-4h-6a2 2 0 0 0-2 2zM16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2',
  alert: 'M12 9v4m0 4h.01M10.3 3.86l-8.7 15A2 2 0 0 0 3.34 22h17.32a2 2 0 0 0 1.74-3.14l-8.7-15a2 2 0 0 0-3.4 0z',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 11v6M12 7h.01',
  chevronDown: 'M6 9l6 6 6-6',
  chevronRight: 'M9 6l6 6-6 6',
  chevronLeft: 'M15 6l-6 6 6 6',
  arrowUp: 'M12 19V5m0 0l-7 7m7-7l7 7',
  arrowDown: 'M12 5v14m0 0l7-7m-7 7l-7-7',
  filter: 'M22 3H2l8 9.5V19l4 2v-8.5L22 3z',
  more: 'M5 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0zM11 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0zM17 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0z',
  sparkle: 'M9 3l1.5 4.5L15 9l-4.5 1.5L9 15l-1.5-4.5L3 9l4.5-1.5L9 3zM18 14l.7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14z',
  external: 'M14 3h7v7M10 14L21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5',
  qr: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h3v3h-3v-3zm5 0h2v2h-2v-2zm-2 5h2v2h-2v-2zm2-2h2v2h-2v-2zm0 4h2v0h-2v0z',
  pause: 'M10 4H6v16h4V4zm8 0h-4v16h4V4z',
  play: 'M5 3l14 9-14 9V3z',
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
  layers: 'M12 2L2 7l10 5 10-5-10-5zm-10 11l10 5 10-5M2 17l10 5 10-5',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z',
  phone: 'M5 4h14v16H5V4zm5 16h4',
  message: 'M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3a8.38 8.38 0 0 1 8.5 8.5z',
  whatsapp: 'M20.5 3.5A11 11 0 0 0 3.4 17.6L2 22l4.5-1.4A11 11 0 1 0 20.5 3.5zM8.3 7.4c.2 0 .4 0 .5.4l.8 1.9c.1.2 0 .4 0 .5l-.5.7c-.1.2-.2.3 0 .6a8 8 0 0 0 3.6 3.1c.3.1.4.1.6-.1l.6-.7c.2-.2.3-.2.5-.1l1.9.9c.2.1.4.2.4.4 0 .6-.3 1.6-1.4 1.9-1 .3-2.3.2-4.6-1a11 11 0 0 1-4.3-4.4c-.5-1-.7-2-.1-2.9.3-.4.7-.6 1-.6z',
  // v3.0.1 招募营销页用图标
  star: 'M12 2l3 7 7 .6-5.5 4.8 1.8 7.1L12 17l-6.3 4.5 1.8-7.1L2 9.6 9 9l3-7z',
  layout: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  code: 'M16 18l6-6-6-6M8 6l-6 6 6 6M14 4l-4 16',
  plug: 'M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0V8zm6 10v4',
  zap: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  userPlus: 'M14 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4 0-8 2-8 5v1h12M19 8v6M16 11h6'
};

window.Icon = function Icon({ name, size = 14, style, className, strokeWidth = 1.6 }) {
  const d = ICONS[name];
  if (!d) return null;
  const fill = name === 'pie' || name === 'sparkle' ? 'currentColor' : 'none';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }} className={className}>
      <path d={d} />
    </svg>);

};

// ============= Switch =============
window.Switch = function Switch({ on, onChange }) {
  const [v, setV] = useState(on);
  useEffect(() => setV(on), [on]);
  return <div className={'switch ' + (v ? 'on' : '')} onClick={() => {const n = !v;setV(n);onChange && onChange(n);}} />;
};

window.CheckBox = function CheckBox({ on, onChange }) {
  return (
    <div onClick={(e) => {e.stopPropagation();onChange && onChange(!on);}}
    style={{
      width: 14, height: 14, borderRadius: 3,
      border: on ? '1px solid var(--brand)' : '1px solid var(--line-strong)',
      background: on ? 'var(--brand)' : 'var(--bg-2)',
      display: 'inline-grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0
    }}>
      {on && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>}
    </div>);

};

// ============= Toast =============
const ToastCtx = createContext(null);
function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = (msg, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setItems((s) => [...s, { id, msg, type }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 3200);
  };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-stack">
        {items.map((i) => <div key={i.id} className={'toast ' + i.type}>{i.msg}</div>)}
      </div>
    </ToastCtx.Provider>);

}
const useToast = () => useContext(ToastCtx) || (() => {});

// ============= Page Head =============
function PageHead({ title, subtitle, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <div className="sub">{subtitle}</div>}
      </div>
      <div className="page-head-actions">{children}</div>
    </div>);

}

// ============= Tabs =============
function Tabs({ value, onChange, tabs }) {
  return (
    <div className="tabs">
      {tabs.map((t) =>
      <div key={t.key} className={'tab ' + (value === t.key ? 'active' : '')} onClick={() => onChange(t.key)}>
          {t.label}
          {typeof t.count === 'number' && <span className="count">{t.count}</span>}
        </div>
      )}
    </div>);

}

// ============= Status Badge =============
function StatusBadge({ status }) {
  const map = {
    active: ['b-success', '正常'],
    inactive: ['b-neutral', '未激活'],
    frozen: ['b-warning', '冻结'],
    banned: ['b-danger', '封禁'],
    pending: ['b-warning', '待审核'],
    pending_audit: ['b-warning', '待审核'],
    approved: ['b-info', '已通过'],
    rejected: ['b-danger', '已拒绝'],
    paid: ['b-success', '已付款'],
    settled: ['b-success', '已结算'],
    flagged: ['b-warning', '已标记'],
    confirmed: ['b-danger', '已确认风险'],
    released: ['b-success', '已释放'],
    success: ['b-success', '成功'],
    failed: ['b-danger', '失败'],
    proAgent: ['b-brand', '专业代理'],
    cpaTested: ['b-info', '测试中'],
    excluded: ['b-neutral', '已排除']
  };
  const [c, l] = map[status] || ['b-neutral', status];
  return <span className={'badge ' + c}><span className="dot" />{l}</span>;
}

// ============= Risk Badge =============
function RiskBadge({ level }) {
  const map = { low: '低', medium: '中', high: '高', critical: '紧急' };
  return <span className={'risk-' + level}>{map[level] || level}</span>;
}

// ============= Search Input =============
function SearchInput({ value, onChange, placeholder, width = 200 }) {
  return (
    <div className="search-input" style={{ width }}>
      <Icon name="search" size={12} style={{ color: 'var(--text-3)' }} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>);

}

// ============= Date Range =============
function DateRange({ value, onChange }) {
  const opts = [
  { v: 'today', l: '今日' },
  { v: '7d', l: '近 7 日' },
  { v: '30d', l: '近 30 日' },
  { v: 'mtd', l: '本月' },
  { v: 'custom', l: '自定义' }];

  const cur = opts.find((o) => o.v === value) || opts[1];
  return (
    <span className="dr">
      <Icon name="history" size={12} style={{ color: 'var(--text-3)' }} />
      {cur.l}
      <Icon name="chevronDown" size={11} style={{ color: 'var(--text-3)' }} />
    </span>);

}

// ============= Pagination =============
function Pagination({ page, pageSize, total, onPage }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const arr = [];
  const lo = Math.max(1, page - 2),hi = Math.min(totalPages, page + 2);
  for (let i = lo; i <= hi; i++) arr.push(i);
  // i18n: 简体中文 vs English 段落构造(window.t 优先,fallback 用 lang store)
  const lang = (typeof window !== 'undefined' && window.APS_LANG_STORE && window.APS_LANG_STORE.get && window.APS_LANG_STORE.get()) || 'zh';
  const totalStr = total.toLocaleString();
  const summary = lang === 'en'
    ? (<><b style={{ color: 'var(--text-1)' }}>{totalStr}</b> total · Page {page} / {totalPages}</>)
    : (<>共 <b style={{ color: 'var(--text-1)' }}>{totalStr}</b> 条 · 第 {page} / {totalPages} 页</>);
  return (
    <div className="pagination">
      <span>{summary}</span>
      <div className="pg-pages">
        <button disabled={page === 1} onClick={() => onPage(page - 1)}>‹</button>
        {lo > 1 && <><button onClick={() => onPage(1)}>1</button>{lo > 2 && <span style={{ padding: '0 4px', color: 'var(--text-3)' }}>…</span>}</>}
        {arr.map((p) => <button key={p} className={page === p ? 'active' : ''} onClick={() => onPage(p)}>{p}</button>)}
        {hi < totalPages && <><span style={{ padding: '0 4px', color: 'var(--text-3)' }}>…</span><button onClick={() => onPage(totalPages)}>{totalPages}</button></>}
        <button disabled={page === totalPages} onClick={() => onPage(page + 1)}>›</button>
      </div>
    </div>);

}

// ============= Avatar =============
function Avatar({ name, size = 24 }) {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ef4444'];
  const idx = (name || '').charCodeAt(0) % colors.length;
  const initial = (name || '?').charAt(0).toUpperCase();
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * .42,
      background: 'linear-gradient(135deg, ' + colors[idx] + ', ' + colors[(idx + 3) % colors.length] + ')' }}>
      {initial}
    </div>);

}

// ============= Drawer =============
function Drawer({ open, onClose, title, subtitle, children, footer, wide, hideHeader }) {
  if (!open) return null;
  return (
    <>
      <div className="drawer-mask" onClick={onClose} />
      <div className={'drawer ' + (wide ? 'wide' : '')}>
        {!hideHeader &&
        <div className="drawer-head">
            <div>
              <h3>{title}</h3>
              {subtitle && <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{subtitle}</div>}
            </div>
            <button className="close" onClick={onClose}><Icon name="x" size={14} /></button>
          </div>
        }
        <div className="drawer-body" style={hideHeader ? { padding: 0 } : undefined}>{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </div>
    </>);

}

// ============= Modal =============
function Modal({ open, onClose, title, subtitle, children, footer, width = 560, size }) {
  if (!open) return null;
  const w = size === 'lg' ? 720 : size === 'xl' ? 920 : width;
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" style={{ width: w }} onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button className="close" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px' }}>{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </div>
    </div>);

}

// ============= Mini chart components =============
function Sparkline({ data, height = 28, color = 'var(--brand)' }) {
  if (!data || !data.length) return null;
  const nums = data.map((d) => typeof d === 'number' ? d : d.y ?? d.value ?? 0);
  const w = 100,h = height;
  const max = Math.max(...nums),min = Math.min(...nums);
  const range = max - min || 1;
  const pts = nums.map((v, i) => [
  i / (nums.length - 1) * w,
  h - (v - min) / range * (h - 2) - 1]
  );
  const line = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const fillId = 'spark' + Math.random().toString(36).slice(2, 8);
  const fill = line + ' L' + w + ',' + h + ' L0,' + h + ' Z';
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs><linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity=".4" /><stop offset="1" stopColor={color} stopOpacity="0" />
      </linearGradient></defs>
      <path d={fill} fill={`url(#${fillId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.4" />
    </svg>);

}

function LineChart({ series, data, height = 220, color = 'var(--brand)', yFmt }) {
  // Backward compat: simple data[] mode + accept {x,y} objects
  const norm = (s) => ({ ...s, data: s.data.map((d) => typeof d === 'number' ? d : d.y ?? d.value ?? 0) });
  const list = (series ? series : data ? [{ name: '', data, color }] : []).map(norm);
  if (!list.length) return null;
  const w = 800,h = height,padL = 44,padB = 24,padT = 10,padR = 12;
  const innerW = w - padL - padR,innerH = h - padT - padB;
  const allVals = list.flatMap((s) => s.data);
  const max = Math.max(...allVals),min = Math.min(0, ...allVals);
  const range = max - min || 1;
  const len = list[0].data.length;
  const xAt = (i) => padL + i / (len - 1) * innerW;
  const yAt = (v) => padT + innerH - (v - min) / range * innerH;
  const fmt = yFmt || ((v) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v);

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }).map((_, i) => min + range * i / ticks);

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {yTicks.map((v, i) =>
      <g key={i}>
          <line x1={padL} y1={yAt(v)} x2={w - padR} y2={yAt(v)} stroke="var(--line-soft)" strokeDasharray="2 4" />
          <text x={padL - 8} y={yAt(v) + 3} textAnchor="end" fill="var(--text-3)" fontSize="10" fontFamily="var(--font-mono)">{fmt(v)}</text>
        </g>
      )}
      {list.map((s, si) => {
        const pts = s.data.map((v, i) => [xAt(i), yAt(v)]);
        const line = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
        const c = s.color || ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7'][si % 4];
        const fillId = 'lc' + si + Math.random().toString(36).slice(2, 5);
        const fill = line + ` L${w - padR},${h - padB} L${padL},${h - padB} Z`;
        return (
          <g key={si}>
            <defs><linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c} stopOpacity=".25" /><stop offset="1" stopColor={c} stopOpacity="0" />
            </linearGradient></defs>
            {si === 0 && <path d={fill} fill={`url(#${fillId})`} />}
            <path d={line} fill="none" stroke={c} strokeWidth="1.8" />
          </g>);

      })}
      {list.length > 1 &&
      <g transform={`translate(${padL + 8},${padT + 4})`}>
          {list.map((s, si) =>
        <g key={si} transform={`translate(${si * 100},0)`}>
              <rect width="10" height="3" y="5" fill={s.color || ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7'][si % 4]} rx="1" />
              <text x="14" y="9" fill="var(--text-2)" fontSize="11">{s.name}</text>
            </g>
        )}
        </g>
      }
    </svg>);

}

function Donut({ data, size = 120, label }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const r = size / 2 - 8,cx = size / 2,cy = size / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-3)" strokeWidth="14" />
      {data.map((d, i) => {
        const len = d.value / total * C;
        const seg = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth="14"
        strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`} />;
        offset += len;
        return seg;
      })}
      <text x={cx} y={cy - 2} textAnchor="middle" fill="var(--text-0)" fontSize="18" fontWeight="600" fontFamily="var(--font-mono)">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-3)" fontSize="10">{label}</text>
    </svg>);

}

function BarChart({ data, height = 80, labels }) {
  const w = 100,h = height;
  const max = Math.max(...data) || 1;
  const bw = w / data.length * 0.6;
  const gap = w / data.length * 0.4;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="chart-bar">
      {data.map((v, i) => {
        const bh = v / max * (h - 4);
        return <rect key={i} x={i * (bw + gap) + gap / 2} y={h - bh} width={bw} height={bh} rx="1" />;
      })}
    </svg>);

}

function Field({ label, required, children, hint }) {
  return (
    <label className="field" style={{ display: 'block', marginBottom: 12 }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
      </div>
      {children}
      {hint && <div className="text-mute" style={{ fontSize: 10.5, marginTop: 4 }}>{hint}</div>}
    </label>);

}

window.UI = {
  Icon: window.Icon, Switch: window.Switch,
  ToastProvider, useToast,
  PageHead, Tabs, StatusBadge, RiskBadge, SearchInput, DateRange,
  Pagination, Avatar, Drawer, Modal, LineChart, BarChart, Sparkline, Donut,
  Field
};