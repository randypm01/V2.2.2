// 专业代理后台 · 招募营销页 + 登入弹窗 (v3.0.1)
// - 整页改为单页营销 landing(顶栏 / Hero / 费用 / 工具 / 仪表板预览 / 4 步骤 / FAQ / Footer)
// - 右上角「登入」按钮 → 弹出登入弹窗(原登入表单完整搬到弹窗内,逻辑不变)
// - 「立即申请」按钮 → 同样弹出登入弹窗,顶部加一句「已有账户?请登入」(暂用同一弹窗占位)
(function () {
  if (!window.APS_AGENT_ACCOUNTS) {
    window.APS_AGENT_ACCOUNTS = {
      list: [],
      listeners: [],
      add(acc) {
        if (!acc || !acc.loginName) return;
        const i = this.list.findIndex((x) => x.loginName === acc.loginName);
        if (i >= 0) this.list[i] = { ...this.list[i], ...acc };
        else this.list = [acc, ...this.list];
        this.listeners.forEach((fn) => fn());
      },
      subscribe(fn) {
        this.listeners.push(fn);
        return () => { this.listeners = this.listeners.filter((f) => f !== fn); };
      },
    };
  }
  if (!window.APS_LOGGED_IN_AGENTS) {
    const LS_KEY = 'APS_LOGGED_IN_AGENTS';
    let initial = [];
    try { initial = JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) {}
    window.APS_LOGGED_IN_AGENTS = {
      set: new Set(initial),
      listeners: new Set(),
      has(id) { return this.set.has(id); },
      mark(id) {
        if (!id || this.set.has(id)) return;
        this.set.add(id);
        try { localStorage.setItem(LS_KEY, JSON.stringify([...this.set])); } catch (e) {}
        this.listeners.forEach((fn) => fn(id));
      },
      subscribe(fn) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
      },
    };
  }
})();

// ============ 样式注入(只插入一次) ============
function ensureLandingStyle() {
  if (document.getElementById('aglp-style')) return;
  const s = document.createElement('style');
  s.id = 'aglp-style';
  s.textContent = `
.aglp { background:#fff; color:#0f172a; font-family:Inter, "Noto Sans SC", system-ui, sans-serif; min-height:100vh; }
.aglp * { box-sizing:border-box; }
.aglp-wrap { max-width:1200px; margin:0 auto; padding:0 32px; }

/* 顶栏 — sticky 在父级滚动容器内固定 */
.aglp-nav { position:sticky; top:0; z-index:50; background:rgba(255,255,255,.92); backdrop-filter:blur(10px); border-bottom:1px solid #e5e7eb; }
.aglp-nav-inner { max-width:none; margin:0; padding:14px 40px; display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:32px; }
.aglp-brand { display:flex; align-items:center; gap:10px; font-weight:700; font-size:18px; }
.aglp-brand-mark { width:38px; height:38px; border-radius:0; background:transparent; display:grid; place-items:center; }
.aglp-brand-mark img { width:100%; height:100%; object-fit:contain; display:block; }
.aglp-brand-wordmark { height:24px; width:auto; display:block; }
/* v3.0.32 手机 navbar: 隐藏 BEANS 文字logo / 保留 Log In + Become a Partner 在顶栏 / 汉堡到右边 / 语言切换仍在下拉 */
@media (max-width: 767px) {
  .aglp-brand-mark { display:grid !important; }
  .aglp-brand-mark { width:34px; height:34px; }
  .aglp-brand-wordmark { display:none !important; }
  /* 顶栏隐藏语言切换(进菜单);Log In + Become a Partner 保留在顶栏,缩小 */
  .aglp-nav-actions > .aps-lang-wrap { display: none !important; }
  .aglp-nav-actions .aglp-btn {
    display: inline-flex !important;
    padding: 6px 10px !important;
    font-size: 12px !important;
  }
  /* v3.0.33 顶栏紧凑:取消 grid 中间 1fr 留空(改成 flex justify-content space-between),buttons 真正贴右 */
  .aglp-nav-inner {
    display: flex !important;
    justify-content: space-between !important;
    padding: 10px 12px !important;
    gap: 0 !important;
  }
  .aglp-nav-links { display:none !important; }
  .aglp-nav-actions { gap: 6px !important; margin-left: auto; }
  .aglp-burger { width:34px; height:34px; margin-left: 4px; }
}

/* v3.0.34 注册 / 登录弹窗 手机模式 — 强制全屏 sheet,覆盖内联 max-width:680px / 480px */
@media (max-width: 767px) {
  /* v3.0.36 让整个 mask 滚动,而不是 modal 内部滚动 — 修复 iframe 内手指滑不动 */
  .aglp-mask {
    padding: 0 !important;
    place-items: stretch !important;
    align-items: flex-start !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
  }
  .aglp-modal,
  .aglp-modal[style] {
    max-width: 100vw !important;
    width: 100vw !important;
    min-height: auto !important;
    height: auto !important;
    border-radius: 0 !important;
    padding: 16px 14px 80px !important;  /* 底部留 80 给 fixed footer 不挡 */
    overflow: visible !important;
    box-sizing: border-box !important;
    position: relative;
  }
  /* v3.0.37 关闭按钮 sticky 在 modal 右上角,跟随滚动始终可点击 */
  .aglp-modal-close {
    position: fixed !important;
    top: 12px !important;
    right: 12px !important;
    z-index: 10 !important;
    background: rgba(255,255,255,.95) !important;
    box-shadow: 0 2px 8px rgba(0,0,0,.1);
  }
  /* v3.0.35 弹窗内所有元素强制 box-sizing 兜底,所有 input/select/textarea 强制 100% 宽度 */
  .aglp-modal * { box-sizing: border-box !important; }
  .aglp-modal input,
  .aglp-modal select,
  .aglp-modal textarea {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }
  /* 联系方式 grid: 130|1fr|32 → 86|1fr|26 */
  .aglp-modal .contact-row {
    grid-template-columns: 86px 1fr 26px !important;
    gap: 6px !important;
  }
  /* 步骤指示器圆圈不再固定宽度 */
  .aglp-modal > div[style*="text-align:center"] > div[style*="display:flex"] > div { min-width: 0 !important; }

  /* v3.0.35 复选框 — 强制 16×16 标准方框,避免被 input 全局样式吃掉 */
  .aglp-modal input[type="checkbox"] {
    width: 16px !important;
    height: 16px !important;
    appearance: auto !important;
    -webkit-appearance: checkbox !important;
    flex-shrink: 0;
    accent-color: #3b82f6;
  }

  /* v3.0.35 step3 同意条款两栏 1fr 1fr → 单栏堆叠 */
  .aglp-modal div[style*="grid-template-columns: 1fr 1fr"],
  .aglp-modal div[style*="grid-template-columns:1fr 1fr"],
  .aglp-modal div[style*="gridTemplateColumns:'1fr 1fr'"] {
    grid-template-columns: 1fr !important;
  }
}
.aglp-nav-links { display:flex; gap:32px; justify-content:center; }
.aglp-nav-link { color:#475569; font-size:14px; cursor:pointer; padding:6px 0; border-bottom:2px solid transparent; transition:.15s; }
.aglp-nav-link:hover { color:#1e40af; border-bottom-color:#3b82f6; }
/* v3.0.26 手机汉堡按钮 + 下拉菜单 */
.aglp-burger { display:none; appearance:none; border:1px solid #e2e8f0; background:#fff; width:36px; height:36px; border-radius:8px; align-items:center; justify-content:center; cursor:pointer; color:#1e293b; transition:.15s; padding:0; }
.aglp-burger:hover { border-color:#3b82f6; color:#1e40af; }
.aglp-burger.open { background:#eff6ff; border-color:#3b82f6; color:#1e40af; }
.aglp-mobile-menu { position:absolute; top:100%; right:16px; margin-top:8px; min-width:200px; background:#fff; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 16px 40px -8px rgba(15,23,42,.2); padding:8px; z-index:100; animation:aglpMenuFade .15s ease; }
@keyframes aglpMenuFade { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
.aglp-mobile-menu-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; color:#1e293b; font-size:14px; font-weight:500; cursor:pointer; transition:.1s; }
.aglp-mobile-menu-item:hover { background:#f1f5f9; color:#1e40af; }
.aglp-mobile-menu-divider { height:1px; background:#e5e7eb; margin:6px 4px; }
.aglp-mobile-menu-lang { padding:6px 10px; display:flex; justify-content:center; }
.aglp-nav-actions { display:flex; gap:10px; align-items:center; }
.aglp-btn { padding:9px 18px; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer; border:1px solid transparent; transition:.15s; display:inline-flex; align-items:center; gap:6px; }
.aglp-btn.ghost { background:transparent; border-color:#cbd5e1; color:#1e293b; }
.aglp-btn.ghost:hover { border-color:#3b82f6; color:#1e40af; }
.aglp-btn.primary { background:#3b82f6; color:#fff; }
.aglp-btn.primary:hover { background:#1e40af; }
.aglp-btn.gold { background:linear-gradient(135deg,#fbbf24,#f59e0b); color:#1f2937; border:none; font-weight:700; box-shadow:0 2px 8px -2px rgba(245,158,11,.4); }
.aglp-btn.gold:hover { filter:brightness(1.05); transform:translateY(-1px); box-shadow:0 8px 20px -4px rgba(245,158,11,.55); }
.aglp-btn.lg { padding:13px 28px; font-size:15px; }

/* Hero */
.aglp-hero { position:relative; background:linear-gradient(135deg,#2563eb 0%,#3b82f6 45%,#60a5fa 100%); color:#fff; overflow:hidden; padding:84px 0 100px; }
.aglp-hero::before { content:''; position:absolute; inset:0; background-image:radial-gradient(ellipse 80% 60% at 70% 50%, rgba(255,255,255,.18), transparent 60%), radial-gradient(circle at 15% 20%, rgba(186,230,253,.25), transparent 50%); pointer-events:none; }
.aglp-hero::after { content:''; position:absolute; inset:0; background-image:repeating-conic-gradient(from 0deg at 75% 55%, rgba(255,255,255,.06) 0deg, transparent 1deg 4deg, rgba(255,255,255,.04) 5deg, transparent 6deg 10deg); pointer-events:none; mask-image:radial-gradient(ellipse 80% 90% at 75% 55%, #000 30%, transparent 75%); -webkit-mask-image:radial-gradient(ellipse 80% 90% at 75% 55%, #000 30%, transparent 75%); }
.aglp-hero-grid { position:relative; display:grid; grid-template-columns:1.1fr 1fr; gap:48px; align-items:center; }
.aglp-hero-eyebrow { display:inline-flex; align-items:center; gap:8px; padding:6px 14px; border:1px solid rgba(255,255,255,.3); background:rgba(255,255,255,.15); color:#fff; border-radius:99px; font-size:12.5px; font-weight:600; letter-spacing:0.3px; margin-bottom:20px; backdrop-filter:blur(4px); }
.aglp-hero-title { font-size:54px; font-weight:800; line-height:1.1; letter-spacing:-1px; margin:0 0 20px; }
.aglp-hero-title em { color:#fef3c7; font-style:normal; text-shadow:0 2px 16px rgba(254,243,199,.4); }
.aglp-hero-sub { font-size:18px; line-height:1.6; color:rgba(255,255,255,.88); margin:0 0 32px; max-width:520px; }
.aglp-hero-actions { display:flex; gap:14px; margin-bottom:48px; flex-wrap:wrap; }
.aglp-hero-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; padding-top:32px; border-top:1px solid rgba(255,255,255,.2); }
.aglp-stat { display:flex; flex-direction:column; gap:4px; }
.aglp-stat-val { font-size:30px; font-weight:800; color:#fff; letter-spacing:-0.5px; line-height:1; font-family:Inter, sans-serif; }
.aglp-stat-val .small { font-size:18px; color:rgba(255,255,255,.7); margin-left:4px; }
.aglp-stat-lbl { font-size:13px; color:rgba(255,255,255,.75); }

/* Hero 右侧可视化 */
.aglp-hero-viz { position:relative; aspect-ratio:1/1; width:100%; max-width:440px; min-width:340px; margin-left:auto; }
.aglp-viz-card { position:absolute; background:#fff; color:#0f172a; border-radius:14px; padding:14px 16px; box-shadow:0 24px 48px -12px rgba(0,0,0,.4); min-width:180px; white-space:nowrap; }
.aglp-viz-card.c1 { top:8%; left:0; width:60%; }
.aglp-viz-card.c2 { top:38%; right:0; width:58%; }
.aglp-viz-card.c3 { bottom:0; left:20%; width:64%; }
.aglp-viz-card-label { font-size:11.5px; color:#64748b; margin-bottom:6px; }
.aglp-viz-card-val { font-size:24px; font-weight:800; color:#0f172a; line-height:1; font-family:'JetBrains Mono', monospace; letter-spacing:-0.5px; }
.aglp-viz-card-val .accent { color:#3b82f6; }
.aglp-viz-card-val .gold { color:#f59e0b; }
.aglp-viz-card-delta { display:inline-flex; align-items:center; gap:3px; margin-top:6px; padding:2px 7px; background:#dcfce7; color:#15803d; border-radius:99px; font-size:11px; font-weight:600; }
.aglp-viz-bars { display:flex; align-items:flex-end; gap:4px; height:32px; margin-top:8px; }
.aglp-viz-bars span { flex:1; background:linear-gradient(to top,#3b82f6,#60a5fa); border-radius:2px 2px 0 0; }


.aglp-lang { display:inline-flex; align-items:center; gap:4px; padding:4px 8px; border-radius:99px; background:#f1f5f9; border:1px solid #e5e7eb; }
.aglp-lang button { background:transparent; border:0; cursor:pointer; padding:3px 10px; border-radius:99px; font-size:12px; font-weight:600; color:#64748b; letter-spacing:0.3px; transition:.15s; }
.aglp-lang button.active { background:#fff; color:#1e40af; box-shadow:0 1px 3px rgba(0,0,0,.08); }
.aglp-lang button:not(.active):hover { color:#1e293b; }
.aglp-lang .div { width:1px; height:12px; background:#e5e7eb; }

/* 通用 Section */
.aglp-section { padding:80px 0; }
.aglp-section.alt { background:#f8fafc; }
.aglp-eyebrow { color:#3b82f6; font-size:13px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; margin-bottom:10px; }
.aglp-section-title { font-size:38px; font-weight:800; color:#0f172a; letter-spacing:-0.6px; margin:0 0 14px; line-height:1.15; }
.aglp-section-sub { font-size:16px; color:#64748b; max-width:640px; margin:0 0 48px; line-height:1.6; }

/* 费用 */
.aglp-comm-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
.aglp-comm-card { padding:32px 28px; border-radius:14px; border:1px solid #e5e7eb; background:#fff; position:relative; transition:.2s; cursor:default; }
.aglp-comm-card.featured { background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%); color:#fff; border-color:transparent; transform:scale(1.02); box-shadow:0 30px 60px -20px rgba(37,99,235,.45); }
.aglp-comm-card:not(.featured):hover { border-color:#3b82f6; transform:translateY(-2px); box-shadow:0 18px 36px -16px rgba(59,130,246,.25); }
.aglp-comm-badge { position:absolute; top:-12px; left:28px; padding:4px 12px; background:#fff; color:#1e40af; border-radius:99px; font-size:11.5px; font-weight:700; letter-spacing:0.4px; box-shadow:0 6px 14px -3px rgba(30,64,175,.3); }
.aglp-comm-name { font-size:16px; font-weight:700; margin-bottom:8px; opacity:.9; }
.aglp-comm-rate { font-size:48px; font-weight:800; letter-spacing:-1.5px; line-height:1; margin-bottom:6px; }
.aglp-comm-rate .unit { font-size:20px; font-weight:600; margin-left:2px; opacity:.7; }
.aglp-comm-card.featured .aglp-comm-rate { color:#fff; }
.aglp-comm-hint { font-size:13.5px; opacity:.7; margin-bottom:24px; line-height:1.5; }
.aglp-comm-list { list-style:none; padding:0; margin:0 0 24px; font-size:14px; line-height:1.9; }
.aglp-comm-list li { display:flex; gap:8px; align-items:flex-start; }
.aglp-comm-list li::before { content:''; flex-shrink:0; width:16px; height:16px; margin-top:3px; border-radius:50%; background:#dbeafe url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M3 8 L7 12 L13 4' stroke='%233b82f6' stroke-width='2.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/12px no-repeat; }
.aglp-comm-card.featured .aglp-comm-list li::before { background:rgba(251,191,36,.2) url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M3 8 L7 12 L13 4' stroke='%23fbbf24' stroke-width='2.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/12px no-repeat; }
.aglp-comm-cta { width:100%; padding:12px; border-radius:8px; border:1px solid #cbd5e1; background:transparent; font-size:14px; font-weight:600; color:#1e293b; cursor:pointer; transition:.15s; }
.aglp-comm-cta:hover { background:#3b82f6; color:#fff; border-color:#3b82f6; }
.aglp-comm-card.featured .aglp-comm-cta { background:#fff; color:#1e40af; border-color:#fff; }
.aglp-comm-card.featured .aglp-comm-cta:hover { background:#eff6ff; color:#1e40af; }

/* 工具 */
.aglp-tools { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; }
.aglp-tool { padding:24px 18px; border-radius:12px; background:#fff; border:1px solid #e5e7eb; transition:.2s; cursor:default; }
.aglp-tool:hover { border-color:#3b82f6; transform:translateY(-3px); box-shadow:0 18px 32px -16px rgba(59,130,246,.3); }
.aglp-tool-ic { width:44px; height:44px; border-radius:10px; background:linear-gradient(135deg,#dbeafe,#bfdbfe); color:#1e40af; display:grid; place-items:center; margin-bottom:14px; }
.aglp-tool-name { font-size:15px; font-weight:700; color:#0f172a; margin-bottom:6px; }
.aglp-tool-desc { font-size:13px; color:#64748b; line-height:1.5; }

/* 仪表板预览 */
.aglp-dash { display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center; }
.aglp-dash-features { display:flex; flex-direction:column; gap:22px; }
.aglp-dash-feat { display:flex; gap:16px; }
.aglp-dash-feat-ic { width:46px; height:46px; flex-shrink:0; border-radius:10px; background:linear-gradient(135deg,#3b82f6,#1e40af); color:#fff; display:grid; place-items:center; }
.aglp-dash-feat-t { font-size:16px; font-weight:700; color:#0f172a; margin-bottom:4px; }
.aglp-dash-feat-d { font-size:13.5px; color:#64748b; line-height:1.55; }
.aglp-dash-preview { aspect-ratio:4/3; background:#fff; border-radius:14px; box-shadow:0 30px 60px -20px rgba(15,23,42,.2); border:1px solid #e5e7eb; padding:14px; display:flex; flex-direction:column; gap:10px; overflow:hidden; }
.aglp-dash-bar { display:flex; gap:6px; }
.aglp-dash-bar span { width:9px; height:9px; border-radius:50%; }
.aglp-dash-kpis { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.aglp-dash-kpi { padding:12px; background:#f8fafc; border-radius:8px; }
.aglp-dash-kpi-l { font-size:10px; color:#64748b; margin-bottom:3px; }
.aglp-dash-kpi-v { font-size:18px; font-weight:800; color:#0f172a; font-family:'JetBrains Mono'; letter-spacing:-0.4px; }
.aglp-dash-kpi-v.accent { color:#3b82f6; }
.aglp-dash-kpi-v.gold { color:#f59e0b; }
.aglp-dash-chart { flex:1; background:linear-gradient(135deg,#eff6ff,#dbeafe); border-radius:8px; padding:12px; position:relative; overflow:hidden; }
.aglp-dash-chart svg { width:100%; height:100%; }

/* 4 步骤 */
.aglp-steps { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; position:relative; }
.aglp-step { padding:28px 20px; border-radius:12px; border:1px solid #e5e7eb; background:#fff; position:relative; }
.aglp-step-num { position:absolute; top:-14px; left:20px; width:28px; height:28px; border-radius:8px; background:linear-gradient(135deg,#3b82f6,#1e40af); color:#fff; font-weight:800; font-size:13px; display:grid; place-items:center; box-shadow:0 6px 14px -4px rgba(59,130,246,.5); }
.aglp-step-ic { color:#3b82f6; margin:8px 0 14px; }
.aglp-step-t { font-size:16px; font-weight:700; color:#0f172a; margin-bottom:6px; }
.aglp-step-d { font-size:13.5px; color:#64748b; line-height:1.55; }

/* 联系我们 v3.2.27 */
.aglp-contact-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.aglp-contact-card { padding:30px 24px; border-radius:12px; border:1px solid #e5e7eb; background:#fff; text-align:center; transition:border-color .15s, box-shadow .15s, transform .15s; display:flex; flex-direction:column; align-items:center; }
.aglp-contact-foot { margin-top:auto; padding-top:14px; width:100%; display:flex; flex-direction:column; align-items:center; }
.aglp-contact-card:hover { border-color:#bfdbfe; box-shadow:0 8px 24px rgba(59,130,246,.1); transform:translateY(-2px); }
.aglp-contact-ic { width:52px; height:52px; margin:0 auto 16px; border-radius:12px; display:grid; place-items:center; color:#3b82f6; background:rgba(59,130,246,.1); }
.aglp-contact-t { font-size:15px; font-weight:700; color:#0f172a; margin-bottom:6px; }
.aglp-contact-d { font-size:15px; font-weight:600; color:#3b82f6; margin-bottom:0; font-family:var(--font-mono,monospace); }
.aglp-contact-note { font-size:12.5px; color:#94a3b8; }
.aglp-contact-btn { margin-top:0; padding:8px 28px; border:none; border-radius:8px; background:#3b82f6; color:#fff; font-size:13.5px; font-weight:600; cursor:pointer; transition:background .15s, transform .1s; }
.aglp-contact-btn:hover { background:#2563eb; transform:translateY(-1px); }
.aglp-contact-btn:active { transform:translateY(0); }

/* CTA 大区 */
.aglp-cta { padding:80px 0; background:linear-gradient(135deg,#2563eb 0%,#3b82f6 50%,#60a5fa 100%); color:#fff; text-align:center; position:relative; overflow:hidden; }
.aglp-cta::before { content:''; position:absolute; inset:0; background-image:radial-gradient(ellipse 80% 60% at 30% 50%, rgba(255,255,255,.18), transparent 60%), radial-gradient(circle at 80% 80%, rgba(186,230,253,.2), transparent 50%); pointer-events:none; }
.aglp-cta::after { content:''; position:absolute; inset:0; background-image:repeating-conic-gradient(from 0deg at 25% 50%, rgba(255,255,255,.05) 0deg, transparent 1deg 4deg, rgba(255,255,255,.03) 5deg, transparent 6deg 10deg); pointer-events:none; mask-image:radial-gradient(ellipse 80% 90% at 25% 50%, #000 30%, transparent 75%); -webkit-mask-image:radial-gradient(ellipse 80% 90% at 25% 50%, #000 30%, transparent 75%); }
.aglp-cta-title { position:relative; font-size:36px; font-weight:800; letter-spacing:-0.5px; margin:0 0 16px; }
.aglp-cta-sub { position:relative; font-size:16px; color:rgba(255,255,255,.88); margin:0 0 32px; }

/* Footer */
.aglp-footer { padding:32px 0; background:#1e293b; color:rgba(255,255,255,.55); font-size:13px; }
.aglp-footer-inner { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }

/* 登入弹窗 */
.aglp-mask { position:fixed; inset:0; background:rgba(15,23,42,.55); backdrop-filter:blur(4px); display:grid; place-items:center; z-index:1000; padding:20px; animation:aglpFadeIn .2s ease; }
@keyframes aglpFadeIn { from{opacity:0} to{opacity:1} }
.aglp-modal { width:100%; max-width:420px; background:#fff; border-radius:16px; box-shadow:0 30px 80px -20px rgba(0,0,0,.4); padding:32px; position:relative; animation:aglpSlideIn .25s ease; }
@keyframes aglpSlideIn { from{transform:translateY(20px); opacity:0} to{transform:translateY(0); opacity:1} }
.aglp-modal-close { position:absolute; top:14px; right:14px; width:32px; height:32px; border-radius:8px; border:none; background:transparent; color:#64748b; cursor:pointer; display:grid; place-items:center; transition:.15s; }
.aglp-modal-close:hover { background:#f1f5f9; color:#0f172a; }
.aglp-modal-logo { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
.aglp-modal-logo .mark { width:36px; height:36px; border-radius:9px; background:linear-gradient(135deg,#3b82f6,#1e40af); color:#fff; display:grid; place-items:center; font-weight:800; font-size:14px; }
.aglp-modal-logo .name { font-size:18px; font-weight:700; color:#0f172a; }
.aglp-modal-sub { font-size:13.5px; color:#64748b; margin:0 0 22px; line-height:1.5; }
.aglp-mfield { position:relative; margin-bottom:12px; }
.aglp-mfield input { width:100%; padding:13px 16px; border-radius:8px; border:1px solid #e5e7eb; background:#f8fafc; font-size:14px; transition:.15s; outline:none; }
.aglp-mfield input:focus { border-color:#3b82f6; background:#fff; box-shadow:0 0 0 3px rgba(59,130,246,.15); }
.aglp-mfield .eye { position:absolute; right:10px; top:50%; transform:translateY(-50%); width:30px; height:30px; border-radius:6px; border:none; background:transparent; cursor:pointer; color:#64748b; display:grid; place-items:center; }
.aglp-mfield .eye:hover { background:#f1f5f9; }
.aglp-quick { margin-bottom:12px; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; }
.aglp-quick-btn { width:100%; padding:11px 14px; background:#f8fafc; border:none; cursor:pointer; display:flex; align-items:center; gap:8px; font-size:13.5px; color:#1e293b; }
.aglp-quick-btn:hover { background:#eff6ff; }
.aglp-quick-btn .count { margin-left:auto; padding:1px 8px; border-radius:99px; background:#3b82f6; color:#fff; font-size:11px; font-weight:600; min-width:22px; text-align:center; }
.aglp-quick-list { max-height:240px; overflow-y:auto; border-top:1px solid #e5e7eb; }
.aglp-quick-row { display:flex; align-items:center; gap:10px; padding:10px 14px; cursor:pointer; border-bottom:1px solid #f1f5f9; transition:.15s; }
.aglp-quick-row:hover { background:#f8fafc; }
.aglp-quick-row:last-child { border-bottom:none; }
.aglp-quick-row .av { width:30px; height:30px; border-radius:6px; color:#fff; display:grid; place-items:center; font-size:10.5px; font-weight:700; flex-shrink:0; }
.aglp-quick-row .info { flex:1; min-width:0; }
.aglp-quick-row .nm { font-size:13px; font-weight:600; color:#0f172a; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.aglp-quick-row .id { font-size:11px; color:#64748b; font-family:'JetBrains Mono'; }
.aglp-quick-row .fill { font-size:11.5px; font-weight:600; color:#3b82f6; padding:3px 10px; border-radius:99px; background:#dbeafe; }
.aglp-quick-empty { padding:18px; text-align:center; font-size:12.5px; color:#94a3b8; }
.aglp-mremember { display:flex; align-items:center; gap:8px; font-size:13px; color:#475569; cursor:pointer; padding:6px 0; margin-bottom:14px; user-select:none; }
.aglp-mremember input { display:none; }
.aglp-mcbox { width:16px; height:16px; border-radius:4px; border:1.5px solid #cbd5e1; display:grid; place-items:center; transition:.15s; }
.aglp-mremember input:checked + .aglp-mcbox { background:#3b82f6; border-color:#3b82f6; color:#fff; }
.aglp-merror { padding:10px 12px; background:#fef2f2; color:#b91c1c; border-radius:6px; font-size:13px; margin-bottom:12px; }
.aglp-msubmit { width:100%; padding:13px; border-radius:8px; border:none; background:linear-gradient(135deg,#3b82f6,#1e40af); color:#fff; font-size:15px; font-weight:600; cursor:pointer; transition:.15s; }
.aglp-msubmit:hover { filter:brightness(1.08); box-shadow:0 8px 20px -6px rgba(59,130,246,.5); }
.aglp-modal-foot { margin-top:16px; padding-top:16px; border-top:1px solid #f1f5f9; text-align:center; font-size:12.5px; color:#94a3b8; }
.aglp-modal-foot a { color:#3b82f6; cursor:pointer; font-weight:600; }

/* 自适应 */
@media (max-width:1180px) {
  .aglp-hero-viz { min-width:300px; max-width:380px; }
  .aglp-viz-card { min-width:160px; padding:12px 14px; }
  .aglp-viz-card-val { font-size:20px; }
}
@media (max-width:980px) {
  .aglp-nav-inner { padding:12px 20px; }
  .aglp-hero-grid { grid-template-columns:1fr; }
  .aglp-hero-viz { display:none; }
  .aglp-hero-title { font-size:38px; }
  .aglp-hero-stats { grid-template-columns:repeat(2,1fr); }
  .aglp-comm-grid { grid-template-columns:1fr; }
  .aglp-tools { grid-template-columns:repeat(2,1fr); }
  .aglp-steps { grid-template-columns:repeat(2,1fr); }
  .aglp-contact-grid { grid-template-columns:1fr; }
  .aglp-dash { grid-template-columns:1fr; }
  .aglp-nav-links { display:none; }
  .aglp-burger { display:inline-flex; }
  /* 手机模式下只保留 语言切换 + 汉堡菜单 — 隐藏 Log In / Become a Partner 按钮(进菜单) */
  .aglp-nav-actions .aglp-btn { display:none; }
  .aglp-section { padding:56px 0; }
  .aglp-section-title { font-size:28px; }
}
/* v3.6.27 联系我们弹窗 渠道行 手机适配:窄屏改纵向 — 图标+标题/副标题一组,按钮整宽另起一行 */
@media (max-width:560px) {
  .csm-row {
    display:grid !important;
    grid-template-columns:auto 1fr;
    grid-template-areas:"ic body" "btn btn";
    align-items:center;
    gap:6px 14px !important;
  }
  .csm-row .csm-ic { grid-area:ic; }
  .csm-row .csm-body { grid-area:body; min-width:0; }
  .csm-row .csm-btn { grid-area:btn; width:100%; margin-top:6px; }
}
`;
  document.head.appendChild(s);
}

// v3.0.46 申请进度状态弹窗 — 用户用注册时的账号密码登入,但申请还未通过时显示
function ApplicationProgressModal({ app, onClose, onSupplement }) {
  const { Icon } = window.UI;
  const STATE_META = {
    reviewing:    { icon:'history',  iconBg:'#fef3c7',  iconColor:'#d97706', title:'申请审核中', desc:'您的代理申请已提交,正在等待商户审核。审核通过后即可使用此账号登入代理后台。', tip:'通常 1-3 个工作日内完成审核,请耐心等待。', accent:'#d97706' },
    supplement:   { icon:'alert',    iconBg:'#faf5ff',  iconColor:'#7c3aed', title:'需要补充材料', desc:'商户审核后认为您的申请资料不完整,需要您补充相关材料后重新提交。', tip:'', accent:'#7c3aed' },
    supplemented: { icon:'check',    iconBg:'#fff7ed',  iconColor:'#ea580c', title:'已补件,等待复核', desc:'您已成功补件,商户将尽快复核您的申请。', tip:'复核通过后您即可登入代理后台,请耐心等待。', accent:'#ea580c' },
    failed:       { icon:'x',        iconBg:'#fef2f2',  iconColor:'#dc2626', title:'申请未通过', desc:'很遗憾,您的代理申请未通过审核。', tip:'您可以重新提交申请,但需要使用不同的账号信息。', accent:'#dc2626' },
    passed:       { icon:'check',    iconBg:'#dcfce7',  iconColor:'#16a34a', title:'申请已通过', desc:'您的申请已通过审核!但代理账户尚未正式启用,请稍后再试或联系客服。', tip:'账户启用后您即可正常登入。', accent:'#16a34a' },
  };
  const meta = STATE_META[app.state] || STATE_META.reviewing;
  const isSupplement = app.state === 'supplement';
  return (
    <div className="aglp-mask" style={{zIndex:1100}} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="aglp-modal" style={{maxWidth:440, padding:'32px 28px'}}>
        <button className="aglp-modal-close" onClick={onClose} title="关闭"><Icon name="x" size={16}/></button>
        <div style={{textAlign:'center'}}>
          <div style={{
            width:72, height:72, margin:'0 auto 18px', borderRadius:'50%',
            background: meta.iconBg, color: meta.iconColor,
            display:'grid', placeItems:'center',
          }}><Icon name={meta.icon} size={36}/></div>
          <h2 style={{margin:'0 0 10px', fontSize:22, fontWeight:700, color:'#0f172a'}}>{meta.title}</h2>
          <p style={{margin:'0 0 6px', fontSize:13.5, color:'#475569', lineHeight:1.65}}>{meta.desc}</p>
          {app.failReason && (isSupplement || app.state === 'failed') && (
            <div style={{margin:'14px 0', padding:'10px 12px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:6, fontSize:13, lineHeight:1.55, color:'#991b1b', textAlign:'left'}}>
              <div style={{fontSize:11, fontWeight:600, color:'#dc2626', marginBottom:4}}>{app.state === 'failed' ? '拒绝原因' : '补件说明'}</div>
              {app.failReason}
            </div>
          )}
          {meta.tip && <p style={{margin:'14px 0 20px', fontSize:12.5, color:'#94a3b8', lineHeight:1.6}}>{meta.tip}</p>}
          <div style={{display:'flex', flexDirection:'column', gap:8, padding:'14px 16px', background:'#f8fafc', borderRadius:8, fontSize:12.5, textAlign:'left', marginTop: meta.tip ? 0 : 14}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#64748b'}}>申请编号</span><span style={{color:'#0f172a', fontFamily:'JetBrains Mono', fontWeight:600}}>{app.id}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#64748b'}}>申请名称</span><span style={{color:'#0f172a', fontWeight:500}}>{app.name}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#64748b'}}>提交时间</span><span style={{color:'#0f172a', fontFamily:'JetBrains Mono'}}>{app.createdAt}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#64748b'}}>更新时间</span><span style={{color:'#0f172a', fontFamily:'JetBrains Mono'}}>{app.updatedAt}</span></div>
          </div>
          <button onClick={() => {
            if (isSupplement && onSupplement) { onSupplement(app); }
            else { onClose(); }
          }} style={{
            marginTop:18, width:'100%', padding:12, borderRadius:8, border:'none',
            background: meta.accent, color:'#fff', fontSize:14.5, fontWeight:600, cursor:'pointer',
          }}>{isSupplement ? '立即补件' : '我知道了'}</button>
        </div>
      </div>
    </div>
  );
}

// ============ 登入弹窗(原表单完整搬到这里) ============
function LoginModal({ onClose, onLogin, onSwitchRegister, onSupplement }) {
  const { Icon } = window.UI;
  const [, force] = React.useReducer((x) => x + 1, 0);
  const [lang] = window.useAgentLang();
  const T = (k) => window.t(k);
  const [loginName, setLoginName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [error, setError] = React.useState('');
  const [accOpen, setAccOpen] = React.useState(false);
  // v3.0.46 申请进度状态弹窗(账号密码匹配「代理后台自行申请」未通过的记录时显示)
  const [progressApp, setProgressApp] = React.useState(null);

  React.useEffect(() => {
    // v3.1.94 主动触发商户已创建代理 store 初始化 — 否则首次进入登录页时 ACSamples
    //         尚未推送到 APS_AGENT_ACCOUNTS,快捷填入只能看到 4 个 reviewing 申请;
    //         必须先去「商户后台 → 代理账户管理」走一遍才能凑齐 12 个
    if (typeof window.APS_ensureMerchantAgentsStore === 'function') {
      window.APS_ensureMerchantAgentsStore();
    }
    const unsub = window.APS_AGENT_ACCOUNTS.subscribe(force);
    const saved = localStorage.getItem('APS_REMEMBER_LOGIN');
    if (saved) { setLoginName(saved); setRemember(true); }
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => { unsub(); document.removeEventListener('keydown', onEsc); };
  }, [onClose]);

  const accounts = window.APS_AGENT_ACCOUNTS.list;
  // v3.0.53 快选列表同时包含「代理后台自行申请」注册记录(未通过也能填入账号密码快速测试进度弹窗)
  const pendingApps = (window.APS_APPS_STORE && window.APS_APPS_STORE.list || [])
    .filter(a => a._channel === 'agentportal' && a.loginName && a.password)
    .map(a => ({
      _pendingApp: true,
      agentId: a.id,
      loginName: a.loginName,
      password: a.password,
      name: a.name,
      state: a.state,
    }));
  const quickList = [...accounts, ...pendingApps];
  const fillFromAcc = (acc) => {
    setLoginName(acc.loginName || '');
    setPassword(acc.password || '');
    setError('');
    setAccOpen(false);
  };

  // v3.0.74 帐户已停用提示弹窗
  const [suspendedAcc, setSuspendedAcc] = React.useState(null);

  const handleLogin = () => {
    if (!loginName || !password) { setError(T('login.err.empty')); return; }
    // 1) 优先匹配正式账户(已审核通过 / 商户创建)
    const acc = accounts.find((a) => a.loginName === loginName && a.password === password);
    if (acc) {
      // v3.0.74 校验 已创建代理 列表里的账户状态;status==='suspended' 弹「已停用」提示,禁止进入
      const allAgents = (window.APS_MERCHANT_AGENTS_STORE && window.APS_MERCHANT_AGENTS_STORE.list) || [];
      const agentRec = allAgents.find(a => a.id === acc.agentId || a._displayId === acc.agentId);
      if (agentRec && agentRec.status === 'suspended') {
        setSuspendedAcc({ ...acc, suspendReason: agentRec._appData?.suspendReason || '账户已被停用' });
        return;
      }
      if (remember) localStorage.setItem('APS_REMEMBER_LOGIN', loginName);
      else localStorage.removeItem('APS_REMEMBER_LOGIN');
      onLogin(acc);
      return;
    }
    // v3.0.46 2) 匹配代理后台自行申请的记录
    const apps = (window.APS_APPS_STORE && window.APS_APPS_STORE.list) || [];
    const pending = apps.find(a =>
      a._channel === 'agentportal' &&
      a.loginName === loginName &&
      a.password === password
    );
    if (pending) {
      // v3.0.65 已通过审核(passed)→ 自动建立正式账户 + 跳过进度弹窗直接登入
      if (pending.state === 'passed') {
        const newAcc = {
          agentId: pending.id,
          userId: pending.userId || '',
          name: pending.name,
          loginName: pending.loginName,
          password: pending.password,
          tier: pending.tier || 'normal',
          createdAt: pending.createdAt,
        };
        if (window.APS_AGENT_ACCOUNTS && window.APS_AGENT_ACCOUNTS.add) {
          window.APS_AGENT_ACCOUNTS.add(newAcc);
        }
        if (remember) localStorage.setItem('APS_REMEMBER_LOGIN', loginName);
        else localStorage.removeItem('APS_REMEMBER_LOGIN');
        onLogin(newAcc);
        return;
      }
      // 其他未通过状态 → 弹申请进度弹窗
      setProgressApp(pending);
      return;
    }
    setError(T('login.err.wrong'));
  };

  return (
    <div className="aglp-mask" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="aglp-modal">
        <button className="aglp-modal-close" onClick={onClose} title={T('login.close')}><Icon name="x" size={16}/></button>

        <div className="aglp-modal-logo">
          <div className="mark">MM</div>
          <div className="name">{T('login.title')}</div>
        </div>
        <p className="aglp-modal-sub">{T('login.sub')}</p>

        <div className="aglp-quick">
          <button type="button" className="aglp-quick-btn" onClick={() => setAccOpen((v) => !v)}>
            <Icon name="users" size={14}/>
            <span>{T('login.quick.label')}</span>
            <span className="count">{quickList.length}</span>
            <Icon name="chevronDown" size={12} style={{ marginLeft:4, transform: accOpen ? 'rotate(180deg)' : 'none', transition:'.15s' }}/>
          </button>
          {accOpen && (
            <div className="aglp-quick-list">
              {quickList.length === 0 ? (
                <div className="aglp-quick-empty">{T('login.quick.empty')}</div>
              ) : quickList.map((acc, i) => {
                const isAp = String(acc.agentId || '').startsWith('AP');
                const isAc = String(acc.agentId || '').startsWith('AC');
                const stateMeta = {
                  reviewing: { label:'审核中', color:'#d97706', bg:'#fef3c7' },
                  supplement: { label:'待补件', color:'#7c3aed', bg:'#f3e8ff' },
                  supplemented: { label:'待复核', color:'#ea580c', bg:'#fed7aa' },
                  failed: { label:'已拒绝', color:'#dc2626', bg:'#fee2e2' },
                  passed: { label:'已通过', color:'#16a34a', bg:'#dcfce7' },
                };
                const stm = acc._pendingApp && stateMeta[acc.state];
                return (
                  <div key={acc.loginName + i} className="aglp-quick-row" onClick={() => fillFromAcc(acc)}>
                    <div className="av" style={{ background: isAc ? '#f59e0b' : isAp ? '#10b981' : '#3b82f6' }}>{isAc ? 'AC' : isAp ? 'AP' : 'AG'}</div>
                    <div className="info">
                      <div className="nm" style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{acc.name || acc.loginName}</span>
                        {stm && <span style={{flexShrink:0,fontSize:10,fontWeight:600,padding:'1px 6px',borderRadius:3,color:stm.color,background:stm.bg}}>{stm.label}</span>}
                      </div>
                      <div className="id">{acc.agentId || acc.userId || '-'} · {acc.loginName} / {acc.password}</div>
                    </div>
                    <span className="fill">{T('login.fill')}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="aglp-mfield">
          <input
            placeholder={T('login.username.ph')}
            value={loginName}
            onChange={(e) => { setLoginName(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>
        <div className="aglp-mfield">
          <input
            type={showPwd ? 'text' : 'password'}
            placeholder={T('login.password.ph')}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{ paddingRight:42 }}
          />
          <button type="button" className="eye" onClick={() => setShowPwd((v) => !v)} title={showPwd ? T('login.eye.hide') : T('login.eye.show')}>
            <Icon name={showPwd ? 'eye' : 'eyeOff'} size={14}/>
          </button>
        </div>

        <label className="aglp-mremember">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}/>
          <span className="aglp-mcbox">{remember && <Icon name="check" size={11}/>}</span>
          <span>{T('login.remember')}</span>
        </label>

        {error && <div className="aglp-merror">{error}</div>}

        <button className="aglp-msubmit" onClick={handleLogin}>{T('login.submit')}</button>

        <div className="aglp-modal-foot">{T('login.foot.q')} <a onClick={() => { onClose(); onSwitchRegister && onSwitchRegister(); }}>{T('login.foot.apply')}</a></div>
      </div>
      {progressApp && <ApplicationProgressModal
        app={progressApp}
        onClose={() => setProgressApp(null)}
        onSupplement={(app) => {
          setProgressApp(null);
          onClose();
          if (onSupplement) onSupplement(app);
        }}
      />}
      {suspendedAcc && (
        <div className="aglp-mask" style={{zIndex:1100}} onMouseDown={(e) => { if (e.target === e.currentTarget) setSuspendedAcc(null); }}>
          <div className="aglp-modal" style={{maxWidth:420, padding:'32px 28px'}}>
            <button className="aglp-modal-close" onClick={() => setSuspendedAcc(null)}><Icon name="x" size={16}/></button>
            <div style={{textAlign:'center'}}>
              <div style={{
                width:72, height:72, margin:'0 auto 18px', borderRadius:'50%',
                background:'#fef2f2', color:'#dc2626',
                display:'grid', placeItems:'center',
              }}><Icon name="x" size={36}/></div>
              <h2 style={{margin:'0 0 10px', fontSize:22, fontWeight:700, color:'#0f172a'}}>帐户已停用</h2>
              <p style={{margin:'0 0 6px', fontSize:13.5, color:'#475569', lineHeight:1.65}}>您的代理帐户已被商户停用,无法登入专业代理后台。</p>
              <div style={{margin:'14px 0', padding:'10px 12px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:6, fontSize:13, lineHeight:1.55, color:'#991b1b', textAlign:'left'}}>
                <div style={{fontSize:11, fontWeight:600, color:'#dc2626', marginBottom:4}}>停用原因</div>
                {suspendedAcc.suspendReason}
              </div>
              <p style={{margin:'14px 0 20px', fontSize:12.5, color:'#94a3b8', lineHeight:1.6}}>如有疑问,请联系商户客服处理</p>
              <div style={{display:'flex', flexDirection:'column', gap:8, padding:'14px 16px', background:'#f8fafc', borderRadius:8, fontSize:12.5, textAlign:'left'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#64748b'}}>代理ID</span><span style={{color:'#0f172a', fontFamily:'JetBrains Mono', fontWeight:600}}>{suspendedAcc.agentId}</span></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#64748b'}}>登录账号</span><span style={{color:'#0f172a', fontFamily:'JetBrains Mono'}}>{suspendedAcc.loginName}</span></div>
              </div>
              <button onClick={() => setSuspendedAcc(null)} style={{
                marginTop:18, width:'100%', padding:12, borderRadius:8, border:'none',
                background:'#dc2626', color:'#fff', fontSize:14.5, fontWeight:600, cursor:'pointer',
              }}>我知道了</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ 注册弹窗(3 步骤 + 成功页) ============
const REG_COUNTRIES = [
  { code:'+86', flag:'🇨🇳', name:'中国' },
  { code:'+886', flag:'🇹🇼', name:'台湾' },
  { code:'+852', flag:'🇭🇰', name:'香港' },
  { code:'+81', flag:'🇯🇵', name:'日本' },
  { code:'+82', flag:'🇰🇷', name:'韩国' },
  { code:'+65', flag:'🇸🇬', name:'新加坡' },
  { code:'+60', flag:'🇲🇾', name:'马来西亚' },
  { code:'+66', flag:'🇹🇭', name:'泰国' },
  { code:'+84', flag:'🇻🇳', name:'越南' },
  { code:'+62', flag:'🇮🇩', name:'印尼' },
  { code:'+63', flag:'🇵🇭', name:'菲律宾' },
  { code:'+91', flag:'🇮🇳', name:'印度' },
  { code:'+1', flag:'🇺🇸', name:'美国' },
];
const REG_CONTACT_TYPES = ['Email','Mobile','Telegram','WhatsApp'];
const REG_CONTACT_PH = { Email:'如：123@gmail.com', Mobile:'98xxx xxxxx', Telegram:'@telegram_id', WhatsApp:'98xxx xxxxx' };
const REG_DIAL_CODES = [
  { code:'+86', name:'中国' },
  { code:'+886', name:'台湾' },
  { code:'+852', name:'香港' },
  { code:'+91', name:'印度' },
  { code:'+81', name:'日本' },
  { code:'+82', name:'韩国' },
  { code:'+65', name:'新加坡' },
  { code:'+60', name:'马来西亚' },
  { code:'+66', name:'泰国' },
  { code:'+84', name:'越南' },
  { code:'+62', name:'印尼' },
  { code:'+63', name:'菲律宾' },
  { code:'+1', name:'美国' },
];

const REG_LANGS = ['繁体中文','简体中文','English','日本語','한국어','Bahasa Indonesia','Tiếng Việt','ภาษาไทย'];
const REG_MESSENGERS = ['Telegram','WhatsApp','Skype','LINE','WeChat','Viber','Signal'];
const REG_PAY = ['Skrill USD','Skrill EUR','Neteller USD','Neteller EUR','Neteller RUB','USDT (TRC20)','USDT (ERC20)','银行转账','支付宝','微信支付'];

function RegStep({ cur, labels }) {
  const { Icon } = window.UI;
  return (
    <div style={{ margin:'8px 0 18px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0 }}>
        {[1,2,3].map((n, i) => (
          <React.Fragment key={n}>
            <div style={{
              width:22, height:22, borderRadius:'50%',
              background: n < cur ? '#3b82f6' : n === cur ? '#fff' : '#fff',
              border: n === cur ? '2px solid #3b82f6' : n < cur ? '2px solid #3b82f6' : '2px solid #cbd5e1',
              display:'grid', placeItems:'center',
              color: n < cur ? '#fff' : n === cur ? '#3b82f6' : '#cbd5e1',
              fontSize:11, fontWeight:700,
              flexShrink:0,
            }}>{n < cur ? <Icon name="check" size={11}/> : null}</div>
            {i < 2 && <div style={{ width:60, height:2, background: n < cur ? '#3b82f6' : '#e5e7eb' }}/>}
          </React.Fragment>
        ))}
      </div>
      {labels && (
        <div style={{ display:'flex', justifyContent:'center', gap:0, marginTop:6 }}>
          {labels.map((lbl, i) => (
            <React.Fragment key={i}>
              <div style={{
                width:82, textAlign:'center',
                fontSize:11.5, fontWeight: i === cur - 1 ? 600 : 500,
                color: i < cur - 1 ? '#3b82f6' : i === cur - 1 ? '#0f172a' : '#94a3b8',
                lineHeight:1.3,
              }}>{lbl}</div>
              {i < labels.length - 1 && <div style={{ width:0 }}/>}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

function RegField({ label, hint, children, full }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto', display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize:11.5, color:'#94a3b8' }}>{hint}</div>}
    </div>
  );
}

function RegInput(props) {
  return <input {...props} style={{
    width:'100%', padding:'11px 14px', borderRadius:8,
    border:'1px solid #e5e7eb', background:'#f8fafc',
    fontSize:13.5, outline:'none', transition:'.15s', ...(props.style || {}),
  }}
  onFocus={(e) => { e.target.style.borderColor='#3b82f6'; e.target.style.background='#fff'; e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,.15)'; }}
  onBlur={(e) => { e.target.style.borderColor='#e5e7eb'; e.target.style.background='#f8fafc'; e.target.style.boxShadow='none'; }}
  />;
}

// v3.0.49 带眼睛图标的密码输入框 — 用于注册第 3 步
function RegPasswordInput({ value, onChange, placeholder }) {
  const { Icon } = window.UI;
  const [show, setShow] = React.useState(false);
  return (
    <div style={{ position:'relative' }}>
      <RegInput type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder || '請輸入'} style={{ paddingRight:42 }}/>
      <button type="button" onClick={() => setShow(s => !s)} style={{
        position:'absolute', top:'50%', right:10, transform:'translateY(-50%)',
        width:28, height:28, border:'none', background:'transparent',
        display:'grid', placeItems:'center', cursor:'pointer', color:'#94a3b8',
      }} title={show ? '隐藏密码' : '显示密码'} aria-label={show ? '隐藏密码' : '显示密码'}>
        <Icon name={show ? 'eyeOff' : 'eye'} size={16}/>
      </button>
    </div>
  );
}

function RegSelect({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={onChange} style={{
      width:'100%', padding:'11px 14px', borderRadius:8,
      border:'1px solid #e5e7eb', background:'#f8fafc',
      fontSize:13.5, outline:'none', cursor:'pointer',
      appearance:'none',
      backgroundImage:`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>")`,
      backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center', backgroundSize:'14px',
      paddingRight:36,
    }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>{typeof o === 'string' ? o : o.label}</option>)}
    </select>
  );
}

function RegisterModal({ onClose, onSwitchLogin, prefill }) {
  const { Icon } = window.UI;
  const [lang] = window.useAgentLang();
  const T = (k) => window.t(k);
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState({
    applyName:'',
    contacts:[
      { type:'Email', value:'' },
      { type:'Mobile', value:'', dial:'+86' },
    ],
    trafficUrls:[''],
    payMethod:'UPI',
    loginName:'', password:'', password2:'',
    agreeTerms:false, agreeNews:false,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updateContact = (idx, key, val) => setForm((f) => {
    const cs = [...f.contacts];
    cs[idx] = { ...cs[idx], [key]: val };
    return { ...f, contacts:cs };
  });
  const addContact = () => setForm((f) => ({ ...f, contacts:[...f.contacts, { type:'', value:'' }] }));
  const removeContact = (idx) => setForm((f) => ({ ...f, contacts: f.contacts.filter((_,i)=>i!==idx) }));
  // v3.0.13 流量来源链接 — 多个
  const updateTraffic = (idx, val) => setForm((f) => {
    const t = [...f.trafficUrls]; t[idx] = val; return { ...f, trafficUrls:t };
  });
  const addTraffic = () => setForm((f) => ({ ...f, trafficUrls:[...f.trafficUrls, ''] }));
  const removeTraffic = (idx) => setForm((f) => ({ ...f, trafficUrls: f.trafficUrls.filter((_,i)=>i!==idx) }));

  React.useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [onClose]);

  // v3.0.54 补件重提:从 prefill.formSnapshot 回填整个表单(密码也复用,用户可改)
  React.useEffect(() => {
    if (prefill && prefill.formSnapshot) {
      setForm(f => ({ ...f, ...prefill.formSnapshot }));
      // v3.0.81 补件重提:跳过第 1 步「基本资料」,直接到第 2 步「流量来源与收款」
      setStep(2);
    }
  }, [prefill]);

  const isSupplement = !!(prefill && prefill.appId);

  // v3.0.79 校验:登入帐号、Email、手机号码 唯一性 + 格式
  const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RX = /^\d{8,15}$/;
  const existingApps = (window.APS_APPS_STORE && window.APS_APPS_STORE.list) || [];
  const existingAccounts = (window.APS_AGENT_ACCOUNTS && window.APS_AGENT_ACCOUNTS.list) || [];
  // 取出已存在的 loginName / email / phone(排除当前补件中的同一记录)
  const skipAppId = prefill && prefill.appId;
  const usedLoginNames = new Set();
  const usedEmails = new Set();
  const usedPhones = new Set();
  existingApps.forEach(a => {
    if (a.id === skipAppId) return;
    if (a.loginName) usedLoginNames.add(String(a.loginName).toLowerCase());
    const snap = a._formSnapshot;
    if (snap && snap.contacts) {
      snap.contacts.forEach(c => {
        const v = String(c.value || '').trim().toLowerCase();
        if (!v) return;
        if (c.type === 'Email') usedEmails.add(v);
        if (c.type === 'Mobile' || c.type === '手机' || c.type === 'WhatsApp') usedPhones.add(v);
      });
    } else {
      const ct = String(a.contact || '').toLowerCase();
      if (EMAIL_RX.test(ct)) usedEmails.add(ct);
      else if (PHONE_RX.test(ct.replace(/\D/g,''))) usedPhones.add(ct.replace(/\D/g,''));
    }
  });
  existingAccounts.forEach(a => { if (a.loginName) usedLoginNames.add(String(a.loginName).toLowerCase()); });

  const emailContact = form.contacts.find(c => c.type === 'Email');
  const phoneContact = form.contacts.find(c => c.type === 'Mobile' || c.type === '手机' || c.type === 'WhatsApp');
  const emailVal = (emailContact?.value || '').trim();
  const phoneVal = (phoneContact?.value || '').trim();

  const emailValid = emailVal && EMAIL_RX.test(emailVal);
  const phoneValid = phoneVal && PHONE_RX.test(phoneVal);
  const emailDup = emailValid && usedEmails.has(emailVal.toLowerCase());
  const phoneDup = phoneValid && usedPhones.has(phoneVal.toLowerCase());
  const loginNameDup = form.loginName && usedLoginNames.has(String(form.loginName).toLowerCase());
  const step1Valid = form.applyName.trim() && form.contacts[0]?.value && form.contacts[1]?.value
    && emailValid && phoneValid && !emailDup && !phoneDup;
  const step2Valid = true; // v3.0.12 仅保留 UPI 收款 + 流量来源选填，始终可以下一页
  const passChecks = {
    notEmpty: form.password.length > 0,
    minLen: form.password.length >= 8,
    // v3.0.14 密码规则:8-50 字元 + 字母大小写 + 数字
    pattern: form.password.length >= 8 && form.password.length <= 50 && /[A-Z]/.test(form.password) && /[a-z]/.test(form.password) && /[0-9]/.test(form.password),
  };
  const passMatch = form.password && form.password === form.password2;
  const step3Valid = form.loginName && !loginNameDup && form.applyName && passChecks.notEmpty && passChecks.minLen && passChecks.pattern && passMatch && form.agreeTerms;

  const phoneOpts = REG_COUNTRIES.map((c) => ({ value:c.code, label:`${c.flag} ${c.code}` }));
  const countryOpts = REG_COUNTRIES.map((c) => c.name);

  return (
    <div className="aglp-mask" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="aglp-modal" style={{ maxWidth: step === 4 ? 480 : 680, padding:'28px 32px' }}>
        <button className="aglp-modal-close" onClick={onClose} title="关闭"><Icon name="x" size={16}/></button>

        {step < 4 ? (
          <>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              {step > 1 && !isSupplement && (
                <button onClick={() => setStep((s) => s - 1)} style={{
                  position:'absolute', left:0, background:'transparent', border:'none', cursor:'pointer',
                  color:'#64748b', padding:4, display:'grid', placeItems:'center',
                }} title="上一步"><Icon name="chevronLeft" size={20}/></button>
              )}
              <h2 style={{ margin:0, fontSize:22, fontWeight:700, color:'#0f172a' }}>{isSupplement ? '要求补件' : T('reg.title')}</h2>
            </div>

            {/* v3.0.11 副标题移到标题下方 / 步骤之上 */}
            <div style={{ textAlign:'center', fontSize:13, color:'#64748b', marginTop:8, marginBottom:4, minHeight:18 }}>
              {isSupplement ? '请根据商户审核反馈,补充或修改流量来源与收款资料后重新提交' : (<>
                {step === 1 && T('reg.s1.welcome')}
                {step === 2 && T('reg.s2.welcome')}
                {step === 3 && ((form.applyName || T('reg.s3.you')) + T('reg.s3.welcome_b'))}
              </>)}
            </div>

            {!isSupplement && <RegStep cur={step} labels={[T('reg.step.basic'), T('reg.step.traffic'), T('reg.step.account')]}/>}

            {!isSupplement && step === 1 && (
              <>
                <div style={{ marginBottom:18 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:'#1e293b', display:'block', marginBottom:6 }}>{T('reg.s1.applyName')} <span style={{ color:'#ef4444' }}>*</span></label>
                  <RegInput placeholder={T('reg.s1.applyName.ph')} value={form.applyName} onChange={(e)=>set('applyName', e.target.value)}/>
                </div>

                {/* v3.0.79 联系方式 — Email + 手机 强制格式 + 唯一性校验,错误提示在弹框下方 */}
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:18 }}>
                  {form.contacts.map((c, idx) => {
                    const locked = idx < 2;
                    const isPhone = c.type === 'Mobile' || c.type === 'WhatsApp' || c.type === '手机';
                    const isEmail = c.type === 'Email';
                    const v = String(c.value || '').trim();
                    let err = '';
                    if (isEmail && v && !EMAIL_RX.test(v)) err = 'Email 格式不正确';
                    else if (isPhone && v && !PHONE_RX.test(v)) err = '手机号码格式不正确(8-15 位数字)';
                    else if (isEmail && v && usedEmails.has(v.toLowerCase())) err = 'Email 已被使用';
                    else if (isPhone && v && usedPhones.has(v.toLowerCase())) err = '手机号码已被使用';

                    return (
                      <div key={idx}>
                        <div className="contact-row" style={{ display:'grid', gridTemplateColumns:'130px 1fr 32px', gap:10, alignItems:'center' }}>
                        <div className="contact-cell-type">
                          {locked ? (
                            <div style={{
                              padding:'8px 12px', background:'#f3f4f6', border:'1px solid #e5e7eb',
                              borderRadius:6, fontSize:13, fontWeight:600, color:'#1e293b',
                            }}>{c.type}</div>
                          ) : (
                            <select value={c.type} onChange={(e)=>updateContact(idx,'type',e.target.value)} style={{
                              width:'100%', padding:'8px 28px 8px 12px', borderRadius:6,
                              border:'1px solid #e5e7eb', background:'#f8fafc', fontSize:13, outline:'none',
                              appearance:'none', cursor:'pointer',
                              backgroundImage:`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>")`,
                              backgroundRepeat:'no-repeat', backgroundPosition:'right 8px center', backgroundSize:'12px',
                            }}>
                              <option value="">{T('reg.s1.contacts.choose')}</option>
                              {REG_CONTACT_TYPES.filter(tp => tp !== 'Email' && tp !== 'Mobile').map(tp => <option key={tp} value={tp}>{tp}</option>)}
                            </select>
                          )}
                        </div>
                        <div className="contact-cell-val">
                          {isPhone ? (
                            <div style={{ display:'flex', alignItems:'stretch', border:'1px solid #e5e7eb', borderRadius:6, overflow:'hidden', background:'#f8fafc' }}>
                              <span style={{
                                padding:'0 12px', background:'#f1f5f9', borderRight:'1px solid #e5e7eb',
                                display:'flex', alignItems:'center', fontSize:13, fontWeight:600,
                                color:'#1e293b', fontFamily:"'JetBrains Mono', monospace",
                              }}>+91</span>
                              <input placeholder={REG_CONTACT_PH[c.type] || ''} value={c.value} onChange={(e)=>updateContact(idx,'value',e.target.value)} style={{ flex:1, padding:'8px 12px', border:'none', outline:'none', background:'transparent', fontSize:13 }}/>
                            </div>
                          ) : (
                            <input placeholder={REG_CONTACT_PH[c.type] || (lang === 'en' ? 'Enter value' : '请输入')} value={c.value} onChange={(e)=>updateContact(idx,'value',e.target.value)} style={{
                              width:'100%', padding:'8px 12px', borderRadius:6,
                              border:'1px solid #e5e7eb', background:'#f8fafc', fontSize:13, outline:'none',
                            }}/>
                          )}
                        </div>
                        <div className="contact-cell-act" style={{ display:'flex', justifyContent:'center' }}>
                          {!locked && <button type="button" className="contact-remove" title={T('reg.s1.remove')} onClick={()=>removeContact(idx)}>−</button>}
                        </div>
                        </div>
                        {err && <div style={{fontSize:11.5,color:'#dc2626',marginTop:4,marginLeft:140}}>× {err}</div>}
                      </div>
                    );
                  })}
                  <button type="button" className="contact-add-btn" onClick={addContact} style={{ marginTop:4 }}>{T('reg.s1.contacts.add')}</button>
                </div>

                <button onClick={() => setStep(2)} disabled={!step1Valid} style={{
                  width:'100%', padding:13, borderRadius:8, border:'none',
                  background: step1Valid ? 'linear-gradient(135deg,#3b82f6,#1e40af)' : '#e5e7eb',
                  color: step1Valid ? '#fff' : '#94a3b8',
                  fontSize:15, fontWeight:600, cursor: step1Valid ? 'pointer' : 'not-allowed', transition:'.15s',
                }}>{T('reg.s1.next')}</button>
              </>
            )}

            {step === 2 && (
              <>
                <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:18 }}>
                  <div>
                    <label style={{ fontSize:13, fontWeight:600, color:'#1e293b', display:'block', marginBottom:6 }}>
                      {T('reg.s2.url')}
                      <span style={{ marginLeft:8, fontSize:12, fontWeight:500, color:'#94a3b8' }}>{T('reg.s2.url.channels','Youtube、Tiktok、Telegram、Facebook...')}</span>
                    </label>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {form.trafficUrls.map((u, idx) => (
                        <div key={idx} style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ flex:1 }}>
                            <RegInput placeholder={T('reg.s2.url.ph','https://domain.com')} value={u} onChange={(e)=>updateTraffic(idx, e.target.value)}/>
                          </div>
                          {form.trafficUrls.length > 1 && (
                            <button type="button" className="contact-remove" title="移除" onClick={()=>removeTraffic(idx)}>−</button>
                          )}
                        </div>
                      ))}
                      <button type="button" className="contact-add-btn" onClick={addTraffic} style={{ marginTop:4 }}>{T('reg.s2.url.add','+ 新增流量来源链接')}</button>
                    </div>
                  </div>
                  <RegField label={T('reg.s2.payway','收款方式')}>
                    <div style={{
                      padding:'11px 14px', borderRadius:8,
                      border:'1px solid #e5e7eb', background:'#f3f4f6',
                      fontSize:13.5, fontWeight:600, color:'#1e293b',
                    }}>UPI</div>
                  </RegField>
                </div>
                <button onClick={() => {
                  if (isSupplement) {
                    // v3.0.81 补件模式 — 直接提交 UPSERT
                    const primaryContact = (form.contacts.find(c => c.value)?.value) || '';
                    const contactList = form.contacts.filter(c => c.value).map(c => c.type).join(' · ');
                    const trafficList = (form.trafficUrls || []).filter(Boolean).join(' · ');
                    if (window.APS_APPS_STORE) {
                      const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
                      window.APS_APPS_STORE.list = window.APS_APPS_STORE.list.map(a =>
                        a.id === prefill.appId
                          ? {
                              ...a,
                              contact: primaryContact || a.contact,
                              channels: trafficList || contactList || a.channels,
                              _formSnapshot: { ...form },
                              state: 'supplemented',
                              failReason: null,
                              updatedAt: nowStr,
                              _logs: [...(a._logs || []), { at: nowStr, by: '用户:' + (a.loginName || a.name || '-'), type:'supplemented', note:'用户已补件,资料重新提交' }],
                            }
                          : a
                      );
                      window.APS_APPS_STORE.listeners.forEach(fn => fn());
                    }
                    setStep(4);
                    return;
                  }
                  setStep(3);
                }} disabled={!step2Valid} style={{
                  width:'100%', padding:13, borderRadius:8, border:'none',
                  background: step2Valid ? 'linear-gradient(135deg,#3b82f6,#1e40af)' : '#e5e7eb',
                  color: step2Valid ? '#fff' : '#94a3b8',
                  fontSize:15, fontWeight:600, cursor: step2Valid ? 'pointer' : 'not-allowed', transition:'.15s',
                }}>{isSupplement ? '提交补件' : T('reg.s2.next')}</button>
              </>
            )}

            {step === 3 && (
              <>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:'#1e293b', display:'block', marginBottom:6 }}>登入帐号 <span style={{ color:'#ef4444' }}>*</span></label>
                  <RegInput placeholder="请输入登入帐号(英文/数字)" value={form.loginName||''} onChange={(e)=>set('loginName',e.target.value.replace(/\s/g,''))}/>
                  {loginNameDup && <div style={{fontSize:11.5,color:'#dc2626',marginTop:4}}>× 登入帐号已被使用,请换一个</div>}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  <RegField label={T('reg.s3.password')}>
                    <RegPasswordInput value={form.password} onChange={(e)=>set('password',e.target.value)}/>
                  </RegField>
                  <RegField label={T('reg.s3.password2')}>
                    <RegPasswordInput value={form.password2} onChange={(e)=>set('password2',e.target.value)}/>
                  </RegField>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18, fontSize:12, color:'#94a3b8' }}>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {[
                      { ok: passChecks.notEmpty, t: T('reg.s3.pw.fill') },
                      { ok: passChecks.minLen, t: T('reg.s3.pw.min') },
                      { ok: passChecks.pattern, t: T('reg.s3.pw.pattern') },
                    ].map((c, i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:6, color: c.ok ? '#22c55e' : '#94a3b8' }}>
                        <Icon name={c.ok ? 'check' : 'x'} size={11}/>
                        <span>{c.t}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, color: passMatch ? '#22c55e' : '#94a3b8' }}>
                      <Icon name={passMatch ? 'check' : 'x'} size={11}/>
                      <span>{form.password2 ? (passMatch ? T('reg.s3.pw.match') : T('reg.s3.pw.mismatch')) : T('reg.s3.pw.fill')}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom:18 }}>
                  <label style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:12.5, color:'#475569', cursor:'pointer' }}>
                    <input type="checkbox" checked={form.agreeTerms} onChange={(e)=>set('agreeTerms',e.target.checked)} style={{ marginTop:2 }}/>
                    <span>{T('reg.s3.agree.terms_a')}<a style={{ color:'#3b82f6', textDecoration:'underline' }}>{T('reg.s3.agree.terms_b')}</a>{T('reg.s3.agree.terms_c')}<a style={{ color:'#3b82f6', textDecoration:'underline' }}>{T('reg.s3.agree.privacy')}</a></span>
                  </label>
                </div>

                <button onClick={() => {
                  // v3.0.39 提交注册申请 → 推送到商户后台「自行申请代理」store
                  // v3.0.54 若 prefill.appId 存在(补件重提)→ 直接 UPSERT 原申请记录,state='supplemented'
                  const primaryContact = (form.contacts.find(c => c.value)?.value) || '';
                  const contactList = form.contacts.filter(c => c.value).map(c => c.type).join(' · ');
                  const trafficList = (form.trafficUrls || []).filter(Boolean).join(' · ');
                  if (prefill && prefill.appId && window.APS_APPS_STORE) {
                    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
                    window.APS_APPS_STORE.list = window.APS_APPS_STORE.list.map(a =>
                      a.id === prefill.appId
                        ? {
                            ...a,
                            name: form.applyName || a.name,
                            contact: primaryContact || a.contact,
                            channels: trafficList || contactList || a.channels,
                            loginName: form.loginName,
                            password: form.password,
                            _formSnapshot: { ...form },
                            state: 'supplemented',
                            failReason: null,
                            updatedAt: nowStr,
                            _logs: [...(a._logs || []), { at: nowStr, by: '用户:' + (a.userId || a.loginName || '-'), type:'supplemented', note:'用户已补件,资料重新提交' }],
                          }
                        : a
                    );
                    window.APS_APPS_STORE.listeners.forEach(fn => fn());
                  } else if (window.APS_addApplication) {
                    const created = window.APS_addApplication({
                      _channel: 'agentportal',
                      name: form.applyName || '新申请人',
                      tier: 'normal',
                      contact: primaryContact,
                      region: '',
                      reason: '通过专业代理后台直接注册申请',
                      channels: trafficList || contactList,
                      loginName: form.loginName,
                      password: form.password,
                      _formSnapshot: { ...form },
                    });
                    try {
                      localStorage.setItem('APS_AGENTPORTAL_LAST_REG', JSON.stringify({
                        loginName: form.loginName,
                        appId: created?.id || '',
                      }));
                    } catch (e) {}
                  }
                  setStep(4);
                }} disabled={!step3Valid} style={{
                  width:'100%', padding:13, borderRadius:8, border:'none',
                  background: step3Valid ? 'linear-gradient(135deg,#3b82f6,#1e40af)' : '#e5e7eb',
                  color: step3Valid ? '#fff' : '#94a3b8',
                  fontSize:15, fontWeight:600, cursor: step3Valid ? 'pointer' : 'not-allowed', transition:'.15s',
                }}>{T('reg.s3.complete')}</button>
              </>
            )}

            <div className="aglp-modal-foot">{T('reg.foot.q')} <a onClick={() => { onClose(); onSwitchLogin && onSwitchLogin(); }}>{T('reg.foot.login')}</a></div>
          </>
        ) : (
          // Step 4: 成功页
          <div style={{ textAlign:'center', padding:'8px 4px 4px' }}>
            {prefill && prefill.appId ? (
              // v3.0.56 补件重提成功 — 显示「已补件待审核」状态
              <>
                <div style={{
                  width:64, height:64, margin:'0 auto 18px', borderRadius:'50%',
                  background:'#fff7ed', color:'#ea580c',
                  display:'grid', placeItems:'center',
                }}><Icon name="check" size={32}/></div>
                <h2 style={{ margin:'0 0 14px', fontSize:24, fontWeight:700, color:'#0f172a' }}>已补件,等待复核</h2>
                <p style={{ margin:'0 0 6px', fontSize:13.5, color:'#475569' }}>您已成功补件,资料已重新提交。</p>
                <p style={{ margin:'0 0 6px', fontSize:13.5, color:'#475569' }}>商户将尽快复核您的申请。</p>
                <p style={{ margin:'0 0 22px', fontSize:13.5, color:'#475569' }}>复核通过后您即可登入代理后台,请耐心等待。</p>
                <button style={{
                  padding:'12px 36px', borderRadius:8, border:'none',
                  background:'#ea580c', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer',
                }} onClick={onClose}>我知道了</button>
              </>
            ) : (
              <>
                <div style={{
                  width:64, height:64, margin:'0 auto 18px', borderRadius:'50%',
                  background:'linear-gradient(135deg,#dcfce7,#bbf7d0)', color:'#16a34a',
                  display:'grid', placeItems:'center',
                }}><Icon name="check" size={32}/></div>
                <h2 style={{ margin:'0 0 14px', fontSize:24, fontWeight:700, color:'#0f172a' }}>{T('reg.s4.title')}</h2>
                <p style={{ margin:'0 0 6px', fontSize:13.5, color:'#475569' }}>{T('reg.s4.p1')}</p>
                <p style={{ margin:'0 0 6px', fontSize:13.5, color:'#475569' }}>{T('reg.s4.p2')}</p>
                <p style={{ margin:'0 0 22px', fontSize:13.5, color:'#475569' }}>{T('reg.s4.p3')}</p>
                <button style={{
                  padding:'12px 36px', borderRadius:8, border:'none',
                  background:'linear-gradient(135deg,#3b82f6,#1e40af)',
                  color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer',
                  display:'inline-flex', alignItems:'center', gap:8,
                }} onClick={onClose}>
                  <Icon name="send" size={15}/>
                  {T('reg.s4.subscribe')}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// i18n keys for reg.step labels added in v3.0.11
(function() {
  const ZH = window.APS_I18N && window.APS_I18N.zh;
  const EN = window.APS_I18N && window.APS_I18N.en;
  if (ZH && !ZH['reg.step.basic']) {
    ZH['reg.step.basic'] = '基本资料';
    ZH['reg.step.traffic'] = '流量来源与收款';
    ZH['reg.step.account'] = '创建账户';
  }
  if (EN && !EN['reg.step.basic']) {
    EN['reg.step.basic'] = 'Basic Info';
    EN['reg.step.traffic'] = 'Traffic & Payment';
    EN['reg.step.account'] = 'Create Account';
  }
  // v3.0.12 收款方式 / 流量来源 调整
  if (ZH) {
    ZH['reg.s2.payway'] = '收款方式';
    ZH['reg.s2.url'] = '流量来源链接(选填)';
    ZH['reg.s2.url.ph'] = '如 https://www.youtube.com/beans....';
    ZH['reg.s2.url.channels'] = 'Youtube、Tiktok、Telegram、Facebook...';
    ZH['reg.s2.url.add'] = '+ 新增流量来源链接';
  }
  if (EN) {
    EN['reg.s2.payway'] = 'Payment Method';
    EN['reg.s2.url'] = 'Traffic Source URL (optional)';
    EN['reg.s2.url.ph'] = 'e.g. https://www.youtube.com/beans...';
    EN['reg.s2.url.channels'] = 'Youtube, Tiktok, Telegram, Facebook...';
    EN['reg.s2.url.add'] = '+ Add Traffic Source';
  }
})();
const LANDING_I18N = {
  zh: {
    nav: { fees:'分润方案', tools:'工具', dashboard:'仪表板', how:'合作流程', contact:'联系我们', login:'登入', join:'成为合作伙伴' },
    hero: {
      eyebrow:'专业代理联盟计划',
      title_a:'每周最高赚取', title_b:'', title_em:'₹1,000,000+', title_c:'轻松到手',
      sub_a:'推荐玩家即可获得长期收益。RevShare 最高', sub_b:',支援 UPI / 银行转账快速结算。',
      join:'成为合作伙伴', how:'如何运作?',
      stats:[
        { v:'40', s:'%', l:'最高收益分成' },
        { v:'1VS1', s:'', l:'专属客服' },
        { v:'24H', s:'', l:'平均审核时间' },
        { v:'UPI', s:'', l:'快速提款' },
      ],
      viz:{ c1:'本月佣金', c2:'推介玩家', c3:'营收分享 · 当前等级', c3hint:'距离 40% 上限还差 5%' },
    },
    benefits: {
      eyebrow:'核心优势',
      title:'快速、透明、容易开始',
      sub:'从申请、推广到第一次结算,所有流程清楚可追踪。',
      items:[
        { ic:'zap', t:'快速注册', d:'简化申请流程,审核通过后即可开始推广。' },
        { ic:'users', t:'指导与支持', d:'专属客户经理提供推广策略、素材与问题协助。' },
        { ic:'image', t:'推广素材', d:'提供 Banner、短视频、社群文案与落地页。' },
        { ic:'wallet', t:'快速付款', d:'支援 UPI、Bank Transfer、USDT 等方式。' },
        { ic:'shield', t:'透明数据', d:'实时统计 + 详细报告,所有数据公开可查,无任何隐藏条款。' },
      ],
    },
    fees: {
      eyebrow:'分润方案', title:'三种合作模式',
      sub:'依照不同推广策略选择最适合的合作方案。',
      badge:'最受欢迎',
      cards:[
        { n:'CPA · 单付费分润', r:'$50', u:'起', h:'推介客户完成首存或达到指定条件时一次性获得佣金', f:['按用户行为结算,见效快','多档单价,达标自动结算','不依赖玩家长期表现'], cta:'联系我们' },
        { n:'营收分享 · RevShare', r:'40', u:'%', h:'每位推介客户的终身净收入分润,起步 25%', f:['终身佣金,玩家不流失就一直分','5 级阶梯,玩家越多比例越高','用户损失基数 / 周期资产变动 两种计算口径'], cta:'加入我们' },
        { n:'混合型 · Hybrid', r:'CPA', u:' + RevShare', h:'同时结合两种类型,稳定 + 长期双重收益', f:['新玩家立即拿 CPA','同时享受终身分润','按协议定制比例'], cta:'申请方案' },
      ],
    },
    tools: {
      eyebrow:'工具', title:'用户友好的行销工具',
      sub:'从横幅到 S2S 整合,五大推广工具开箱即用,助你最大化转化。',
      items:[
        { ic:'image', t:'横幅 & 落地页', d:'定期更新的素材库,适配各种推广场景' },
        { ic:'link', t:'Smart Link', d:'所有最佳优惠集中在一个链接里' },
        { ic:'send', t:'JSON 推送', d:'从我们的服务器直接获取最佳产品' },
        { ic:'code', t:'促销代码', d:'为你的受众提供独一无二的兑换码' },
        { ic:'plug', t:'S2S 整合', d:'集成任何热门追踪器,转化数据实时回传' },
      ],
    },
    dash: {
      eyebrow:'联盟仪表板', title:'所有信息 · 集中一处',
      sub:'登入后立即看到完整的代理控制台 — 业绩、玩家、佣金、提款,一目了然。',
      feats:[
        { ic:'layout', t:'我的账户', d:'实用的联盟仪表板,方便存取所有所需信息。' },
        { ic:'bell', t:'实时统计', d:'关注每分钟更新的数据流,跟踪每位玩家的注册与首存。' },
        { ic:'pie', t:'详细报告', d:'新建并查看一系列详细报表 — CPA、分润、玩家损益、结算单。' },
      ],
      kpis:{ commission:'本月佣金', cpa:'有效 CPA', players:'活跃玩家' },
    },
    how: {
      eyebrow:'合作流程', title:'4 步骤 · 让你赚大钱',
      sub:'从申请到提款,整个流程不超过 7 天 — 高效、透明、稳定。',
      steps:[
        { ic:'userPlus', t:'注册', d:'快速注册,商户审核后即可激活账户' },
        { ic:'send', t:'发布广告', d:'在平台发布带有你专属代理链接的素材' },
        { ic:'users', t:'推介新顾客', d:'通过你的链接注册的玩家永久归属于你' },
        { ic:'wallet', t:'提款', d:'每月固定结算,200+ 种付款方式可选' },
      ],
    },
    cta: {
      title:'与身边值得信赖的合作伙伴一起赚钱',
      sub:'现在就申请,享受业内顶级条款 · 全球已有 10 万 + 联盟代理与我们合作',
      btn:'成为合作伙伴',
    },
    contact: {
      eyebrow:'联系我们', title:'随时为你服务',
      sub:'7×24 小时专属代理客服 · 申请、对账、提款任何问题都能快速响应。',
      channels:[
        { ic:'send',    t:'Telegram', d:'', note:'最快响应 · 平均 5 分钟', action:'contact', btn:'联系' },
        { ic:'whatsapp',t:'WhatsApp', d:'', note:'+91 97300 44004', action:'whatsapp', btn:'联系' },
        { ic:'mail',    t:'邮箱',     d:'partners@beans.gg', note:'对账 / 合约相关' },
        { ic:'bell',    t:'在线客服', d:'', note:'7×24 在线', action:'livechat', btn:'联系' },
      ],
      btn:'成为合作伙伴',
    },
    footer: { copy:'© 2026 Partners-MM · 专业代理后台 v3.0.0', links:['隐私权政策','条款与条件','联系我们'] },
  },
  en: {
    nav: { fees:'Commission Plans', tools:'Tools', dashboard:'Dashboard', how:'How it Works', contact:'Contact Us', login:'Log In', join:'Become a Partner' },
    hero: {
      eyebrow:'Pro Affiliate Program',
      title_a:'EARN UP TO', title_b:'', title_em:'₹1,000,000+', title_c:'EVERY WEEK',
      sub_a:'Refer players and earn long-term revenue. Up to', sub_b:' RevShare, with fast UPI / bank-transfer settlement.',
      join:'Become a Partner', how:'How it works?',
      stats:[
        { v:'40', s:'%', l:'Max revenue share' },
        { v:'1VS1', s:'', l:'Dedicated support' },
        { v:'24H', s:'', l:'Avg. review time' },
        { v:'UPI', s:'', l:'Fast withdrawal' },
      ],
      viz:{ c1:'This Month', c2:'Referrals', c3:'RevShare · Current Tier', c3hint:'5% to reach 40% cap' },
    },
    benefits: {
      eyebrow:'Core Advantages',
      title:'Fast, Transparent, Easy to Start',
      sub:'From application and promotion to your first settlement — every step is clear and trackable.',
      items:[
        { ic:'zap', t:'Quick Sign-Up', d:'Streamlined application — start promoting as soon as you\u2019re approved.' },
        { ic:'users', t:'Guidance & Support', d:'A dedicated manager provides promo strategy, creatives and issue support.' },
        { ic:'image', t:'Promo Creatives', d:'Banners, short videos, social copy and landing pages provided.' },
        { ic:'wallet', t:'Fast Payouts', d:'Supports UPI, Bank Transfer, USDT and more.' },
        { ic:'shield', t:'Transparent Data', d:'Real-time stats + detailed reports, all open and audit-ready.' },
      ],
    },
    fees: {
      eyebrow:'Commission Plans', title:'Three Partnership Models',
      sub:'Choose the model that best fits your promotion strategy.',
      badge:'Most Popular',
      cards:[
        { n:'CPA · Per-Player', r:'$50', u:'+', h:'One-off commission when a referral makes their first deposit or hits a target.', f:['Per-action payout, fast results','Tiered rates, auto-settled','No long-term retention risk'], cta:'Contact Us' },
        { n:'RevShare', r:'40', u:'%', h:'Lifetime net revenue share per referral, starting from 25%.', f:['Lifetime commission as long as players stay','5-tier ladder, more players = higher rate','Loss-based or asset-change calculation'], cta:'Join Us' },
        { n:'Hybrid', r:'CPA', u:' + RevShare', h:'Combine both — instant payout plus long-term residual.', f:['Instant CPA on new players','Plus lifetime revenue share','Custom split by agreement'], cta:'Apply Now' },
      ],
    },
    tools: {
      eyebrow:'Tools', title:'User-Friendly Marketing Toolkit',
      sub:'From banners to S2S integration — five tools, ready to plug in.',
      items:[
        { ic:'image', t:'Banners & Landings', d:'Regularly updated creatives for every scenario.' },
        { ic:'link', t:'Smart Link', d:'All best offers behind a single link.' },
        { ic:'send', t:'JSON Push', d:'Pull the best products straight from our server.' },
        { ic:'code', t:'Promo Codes', d:'Unique redeemable codes for your audience.' },
        { ic:'plug', t:'S2S Integration', d:'Connect any popular tracker, real-time postbacks.' },
      ],
    },
    dash: {
      eyebrow:'Affiliate Dashboard', title:'Everything · In One Place',
      sub:'Log in for the full control panel — performance, players, commissions, payouts at a glance.',
      feats:[
        { ic:'layout', t:'My Account', d:'A practical dashboard with everything you need to access.' },
        { ic:'bell', t:'Real-Time Stats', d:'Watch live data flow and track every signup and first deposit.' },
        { ic:'pie', t:'Detailed Reports', d:'Build CPA, RevShare, player P&L and settlement reports.' },
      ],
      kpis:{ commission:'This Month', cpa:'Valid CPA', players:'Active Players' },
    },
    how: {
      eyebrow:'How it Works', title:'4 Steps · To Big Earnings',
      sub:'From application to payout, the whole flow takes no more than 7 days.',
      steps:[
        { ic:'userPlus', t:'Register', d:'Quick signup, account activated after merchant review.' },
        { ic:'send', t:'Publish Ads', d:'Publish your unique referral link with our creatives.' },
        { ic:'users', t:'Refer Players', d:'Anyone signing up via your link is yours for life.' },
        { ic:'wallet', t:'Cash Out', d:'Monthly settlements, 200+ payment methods to choose from.' },
      ],
    },
    cta: {
      title:'Earn with a trusted partner by your side',
      sub:'Apply today and enjoy industry-leading terms · 100k+ affiliates already with us',
      btn:'Become a Partner',
    },
    contact: {
      eyebrow:'Contact Us', title:'We\u2019re Here to Help',
      sub:'24/7 dedicated affiliate support \u00b7 fast answers on applications, reconciliation and payouts.',
      channels:[
        { ic:'send', t:'Telegram', d:'', note:'Fastest \u00b7 avg. 5 min reply', action:'contact', btn:'Contact' },
        { ic:'whatsapp', t:'WhatsApp', d:'', note:'+91 97300 44004', action:'whatsapp', btn:'Contact' },
        { ic:'mail', t:'Email',    d:'partners@beans.gg', note:'Reconciliation / contracts' },
        { ic:'bell', t:'Live Chat', d:'', note:'24/7 online', action:'livechat', btn:'Contact' },
      ],
      btn:'Become a Partner',
    },
    footer: { copy:'© 2026 Partners-MM · Affiliate Portal v3.0.0', links:['Privacy Policy','Terms & Conditions','Contact Us'] },
  },
};

// ============ v3.2.16 全局注册弹窗 store — 切换后台分页不关闭弹窗 ============
if (!window.__APS_REG_STORE) {
  window.__APS_REG_STORE = {
    open: false,
    prefill: null,
    listeners: new Set(),
  };
  window.APS_openRegister = (prefill) => {
    window.__APS_REG_STORE.open = true;
    window.__APS_REG_STORE.prefill = prefill || null;
    window.__APS_REG_STORE.listeners.forEach(fn => fn());
  };
  window.APS_closeRegister = () => {
    window.__APS_REG_STORE.open = false;
    window.__APS_REG_STORE.prefill = null;
    window.__APS_REG_STORE.listeners.forEach(fn => fn());
  };
}

window.RegisterModalHost = function RegisterModalHost() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    window.__APS_REG_STORE.listeners.add(force);
    return () => window.__APS_REG_STORE.listeners.delete(force);
  }, []);
  const s = window.__APS_REG_STORE;
  if (!s.open) return null;
  return <RegisterModal
    onClose={() => window.APS_closeRegister()}
    onSwitchLogin={() => {
      // 如果在代理后台且有 setShowLogin 可用,调用它;否则仅关阅注册
      window.APS_closeRegister();
      if (window.APS_openLogin) window.APS_openLogin();
    }}
    prefill={s.prefill}
  />;
};

// ============ 招募营销页主模块 ============
window.AgentLoginModule = function ({ onLogin }) {
  const { Icon } = window.UI;
  const [showLogin, setShowLogin] = React.useState(false);
  // v3.2.16 注册弹窗改走全局 store(setShowRegister 作为兼容别名)
  const setShowRegister = (open, prefill) => {
    if (open) window.APS_openRegister(prefill);
    else window.APS_closeRegister();
  };
  // 暴露登入弹窗 opener,供 RegisterModalHost 在其他分页点 「立即登陆」 调用
  React.useEffect(() => {
    window.APS_openLogin = () => setShowLogin(true);
    return () => { delete window.APS_openLogin; };
  }, []);
  const [registerPrefill, setRegisterPrefill] = React.useState(null); // v3.0.54 补件重提交预填数据
  const [mobileMenu, setMobileMenu] = React.useState(false);
  const [showContact, setShowContact] = React.useState(false);
  const [lang, setLang] = window.useAgentLang();
  const t = LANDING_I18N[lang];

  React.useEffect(() => { ensureLandingStyle(); }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
    setMobileMenu(false);
  };

  return (
    <div className="aglp">
      {/* 顶栏 */}
      <header className="aglp-nav">
        <div className="aglp-nav-inner">
          <div className="aglp-brand">
            <div className="aglp-brand-mark"><img src="assets/beans-logo.png" alt="BEANS"/></div>
            <img className="aglp-brand-wordmark" src="assets/beans-wordmark.png" alt="BEANS"/>
          </div>
          <nav className="aglp-nav-links">
            <span className="aglp-nav-link" onClick={() => scrollTo('commissions')}>{t.nav.fees}</span>
            <span className="aglp-nav-link" onClick={() => scrollTo('tools')}>{t.nav.tools}</span>
            <span className="aglp-nav-link" onClick={() => scrollTo('dashboard')}>{t.nav.dashboard}</span>
            <span className="aglp-nav-link" onClick={() => scrollTo('how-it-works')}>{t.nav.how}</span>
            <span className="aglp-nav-link" onClick={() => setShowContact(true)}>{t.nav.contact}</span>
          </nav>
          <div className="aglp-nav-actions">
            <window.AgentLangSwitch/>
            <button className="aglp-btn ghost" onClick={() => setShowLogin(true)}>{t.nav.login}</button>
            <button className="aglp-btn gold" onClick={() => setShowRegister(true)}>{t.nav.join}</button>
            <button className={'aglp-burger ' + (mobileMenu ? 'open' : '')} onClick={() => setMobileMenu(v => !v)} aria-label="Menu">
              <Icon name={mobileMenu ? 'x' : 'menu'} size={18}/>
            </button>
          </div>
          {mobileMenu && (
            <>
              <div style={{position:'fixed', inset:0, zIndex:90}} onClick={() => setMobileMenu(false)}/>
              <div className="aglp-mobile-menu">
                <div className="aglp-mobile-menu-item" onClick={() => scrollTo('commissions')}>{t.nav.fees}</div>
                <div className="aglp-mobile-menu-item" onClick={() => scrollTo('tools')}>{t.nav.tools}</div>
                <div className="aglp-mobile-menu-item" onClick={() => scrollTo('dashboard')}>{t.nav.dashboard}</div>
                <div className="aglp-mobile-menu-item" onClick={() => scrollTo('how-it-works')}>{t.nav.how}</div>
                <div className="aglp-mobile-menu-item" onClick={() => { setMobileMenu(false); setShowContact(true); }}>{t.nav.contact}</div>
                <div className="aglp-mobile-menu-divider"/>
                {/* v3.0.32 语言切换 (Log In / Become a Partner 已在顶栏可见,不再重复) */}
                <div className="aglp-mobile-menu-lang" onClick={(e) => e.stopPropagation()}>
                  <window.AgentLangSwitch/>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="aglp-hero">
        <div className="aglp-wrap aglp-hero-grid">
          <div>
            <div className="aglp-hero-eyebrow">
              <Icon name="star" size={12}/>
              <span>{t.hero.eyebrow}</span>
            </div>
            <h1 className="aglp-hero-title">
              {t.hero.title_a}<br/>
              <em>{t.hero.title_em}</em>
              {t.hero.title_c ? <React.Fragment><br/>{t.hero.title_c}</React.Fragment> : null}
            </h1>
            <p className="aglp-hero-sub">
              {t.hero.sub_a} <strong style={{ color:'#fef3c7' }}>40%</strong>{t.hero.sub_b}
            </p>
            <div className="aglp-hero-actions">
              <button className="aglp-btn gold lg" onClick={() => setShowRegister(true)}>{t.hero.join}</button>
              <button className="aglp-btn lg" style={{ background:'rgba(255,255,255,.1)', color:'#fff', border:'1px solid rgba(255,255,255,.2)' }} onClick={() => scrollTo('how-it-works')}>
                {t.hero.how}
              </button>
            </div>
            <div className="aglp-hero-stats">
              {t.hero.stats.map((s, i) => (
                <div key={i} className="aglp-stat">
                  <div className="aglp-stat-val">{s.v}<span className="small">{s.s}</span></div>
                  <div className="aglp-stat-lbl">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero 右侧 — 模拟仪表板浮层卡片 */}
          <div className="aglp-hero-viz">
            <div className="aglp-viz-card c1">
              <div className="aglp-viz-card-label">{t.hero.viz.c1}</div>
              <div className="aglp-viz-card-val">$<span className="gold">12,847</span></div>
              <div className="aglp-viz-card-delta">+18.4% MoM</div>
            </div>
            <div className="aglp-viz-card c2">
              <div className="aglp-viz-card-label">{t.hero.viz.c2}</div>
              <div className="aglp-viz-card-val"><span className="accent">1,284</span></div>
              <div className="aglp-viz-bars">
                {[40,65,50,80,72,90,68,55,75,88,60,95].map((h,i)=>(
                  <span key={i} style={{ height:h+'%' }}/>
                ))}
              </div>
            </div>
            <div className="aglp-viz-card c3">
              <div className="aglp-viz-card-label">{t.hero.viz.c3}</div>
              <div className="aglp-viz-card-val">35<span style={{ color:'#94a3b8', fontWeight:600 }}>%</span></div>
              <div style={{ marginTop:8, height:4, background:'#e2e8f0', borderRadius:99, overflow:'hidden' }}>
                <div style={{ width:'87%', height:'100%', background:'linear-gradient(90deg,#3b82f6,#fbbf24)' }}/>
              </div>
              <div style={{ marginTop:6, fontSize:11, color:'#64748b' }}>{t.hero.viz.c3hint}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 福利 */}
      <section className="aglp-section">
        <div className="aglp-wrap">
          <div className="aglp-eyebrow">{t.benefits.eyebrow}</div>
          <h2 className="aglp-section-title">{t.benefits.title}</h2>
          <p className="aglp-section-sub">{t.benefits.sub}</p>
          <div className="aglp-tools">
            {t.benefits.items.map((b, i) => (
              <div key={i} className="aglp-tool">
                <div className="aglp-tool-ic"><Icon name={b.ic} size={20}/></div>
                <div className="aglp-tool-name">{b.t}</div>
                <div className="aglp-tool-desc">{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 费用 */}
      <section className="aglp-section alt" id="commissions">
        <div className="aglp-wrap">
          <div className="aglp-eyebrow">{t.fees.eyebrow}</div>
          <h2 className="aglp-section-title">{t.fees.title}</h2>
          <p className="aglp-section-sub">{t.fees.sub}</p>
          <div className="aglp-comm-grid">
            {t.fees.cards.map((c, i) => (
              <div key={i} className={'aglp-comm-card' + (i === 1 ? ' featured' : '')}>
                {i === 1 && <div className="aglp-comm-badge">{t.fees.badge}</div>}
                <div className="aglp-comm-name">{c.n}</div>
                <div className="aglp-comm-rate">{c.r}<span className="unit">{c.u}</span></div>
                <p className="aglp-comm-hint">{c.h}</p>
                <ul className="aglp-comm-list">
                  {c.f.map((line, j) => <li key={j}>{line}</li>)}
                </ul>
                <button className="aglp-comm-cta" onClick={() => setShowRegister(true)}>{c.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 工具 */}
      <section className="aglp-section" id="tools">
        <div className="aglp-wrap">
          <div className="aglp-eyebrow">{t.tools.eyebrow}</div>
          <h2 className="aglp-section-title">{t.tools.title}</h2>
          <p className="aglp-section-sub">{t.tools.sub}</p>
          <div className="aglp-tools">
            {t.tools.items.map((b, i) => (
              <div key={i} className="aglp-tool">
                <div className="aglp-tool-ic"><Icon name={b.ic} size={20}/></div>
                <div className="aglp-tool-name">{b.t}</div>
                <div className="aglp-tool-desc">{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 联盟仪表板 */}
      <section className="aglp-section alt" id="dashboard">
        <div className="aglp-wrap aglp-dash">
          <div>
            <div className="aglp-eyebrow">{t.dash.eyebrow}</div>
            <h2 className="aglp-section-title">{t.dash.title}</h2>
            <p className="aglp-section-sub">{t.dash.sub}</p>
            <div className="aglp-dash-features">
              {t.dash.feats.map((b, i) => (
                <div key={i} className="aglp-dash-feat">
                  <div className="aglp-dash-feat-ic"><Icon name={b.ic} size={20}/></div>
                  <div>
                    <div className="aglp-dash-feat-t">{b.t}</div>
                    <div className="aglp-dash-feat-d">{b.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 仪表板预览 */}
          <div className="aglp-dash-preview">
            <div className="aglp-dash-bar">
              <span style={{ background:'#ef4444' }}/><span style={{ background:'#f59e0b' }}/><span style={{ background:'#22c55e' }}/>
              <div style={{ marginLeft:'auto', fontSize:10.5, color:'#94a3b8' }}>my.partners-mm.com</div>
            </div>
            <div className="aglp-dash-kpis">
              <div className="aglp-dash-kpi">
                <div className="aglp-dash-kpi-l">{t.dash.kpis.commission}</div>
                <div className="aglp-dash-kpi-v gold">$12,847</div>
              </div>
              <div className="aglp-dash-kpi">
                <div className="aglp-dash-kpi-l">{t.dash.kpis.cpa}</div>
                <div className="aglp-dash-kpi-v accent">284</div>
              </div>
              <div className="aglp-dash-kpi">
                <div className="aglp-dash-kpi-l">{t.dash.kpis.players}</div>
                <div className="aglp-dash-kpi-v">1,284</div>
              </div>
            </div>
            <div className="aglp-dash-chart">
              <svg viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="aglp-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,80 L25,65 L50,72 L75,55 L100,60 L125,42 L150,48 L175,30 L200,38 L225,22 L250,28 L275,15 L300,20 L300,100 L0,100 Z" fill="url(#aglp-grad)"/>
                <path d="M0,80 L25,65 L50,72 L75,55 L100,60 L125,42 L150,48 L175,30 L200,38 L225,22 L250,28 L275,15 L300,20" stroke="#3b82f6" strokeWidth="2" fill="none"/>
                <circle cx="275" cy="15" r="4" fill="#fbbf24" stroke="#fff" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* 如何运作 */}
      <section className="aglp-section" id="how-it-works">
        <div className="aglp-wrap">
          <div className="aglp-eyebrow">{t.how.eyebrow}</div>
          <h2 className="aglp-section-title">{t.how.title}</h2>
          <p className="aglp-section-sub">{t.how.sub}</p>
          <div className="aglp-steps">
            {t.how.steps.map((b, i) => (
              <div key={i} className="aglp-step">
                <div className="aglp-step-num">{i + 1}</div>
                <div className="aglp-step-ic"><Icon name={b.ic} size={28}/></div>
                <div className="aglp-step-t">{b.t}</div>
                <div className="aglp-step-d">{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 联系我们 v3.2.44 改为弹窗(ContactModal),不再占用页面区块 */}

      {/* CTA */}
      <section className="aglp-cta">
        <div className="aglp-wrap">
          <h2 className="aglp-cta-title">{t.cta.title}</h2>
          <p className="aglp-cta-sub">{t.cta.sub}</p>
          <button className="aglp-btn gold lg" onClick={() => setShowRegister(true)}>{t.cta.btn}</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="aglp-footer">
        <div className="aglp-wrap aglp-footer-inner">
          <div>{t.footer.copy}</div>
          <div style={{ display:'flex', gap:18 }}>
            {t.footer.links.map((l, i) => <span key={i} style={{ cursor:'pointer' }}>{l}</span>)}
          </div>
        </div>
      </footer>

      {showLogin && <LoginModal
        onClose={() => setShowLogin(false)}
        onLogin={onLogin}
        onSwitchRegister={() => { setRegisterPrefill(null); window.APS_openRegister(null); }}
        onSupplement={(app) => {
          // v3.0.55 供 LoginModal 「立即补件」按钮调用:预填原注册表单(优先 _formSnapshot,缺失时根据 app 字段重建)
          const snap = app._formSnapshot || (() => {
            const contact = String(app.contact || '');
            const isEmail = /@/.test(contact);
            return {
              applyName: app.name || '',
              contacts: [
                { type:'Email',  value: isEmail ? contact : '' },
                { type:'Mobile', value: !isEmail ? contact.replace(/^\+?\d{1,3}\s*/, '') : '', dial: '+91' },
              ],
              trafficUrls: String(app.channels || '').split(/\s*·\s*|\s*,\s*/).filter(Boolean).length
                ? String(app.channels || '').split(/\s*·\s*|\s*,\s*/).filter(Boolean)
                : [''],
              payMethod: 'UPI',
              password: app.password || '',
              password2: app.password || '',
              agreeTerms: true,
              agreeNews: false,
            };
          })();
          setRegisterPrefill({ appId: app.id, formSnapshot: snap });
          window.APS_openRegister({ appId: app.id, formSnapshot: snap });
        }}
      />}
      {/* v3.2.16 RegisterModal 现由 RegisterModalHost 全局渲染,不受本模块 unmount 影响 */}
      {showContact && <ContactModal onClose={() => setShowContact(false)} onLiveChat={() => { setShowContact(false); window.APS_openLiveChat && window.APS_openLiveChat(); }}/>}
      {window.AgentLiveChat && <window.AgentLiveChat/>}
    </div>
  );
};

// v3.2.44 联系我们 弹窗 — 由顶栏「聯絡我們」触发,纵向渠道列表
// v3.2.46 自取 i18n + 导出 window.AgentContactModal,供着陆页与已登入后台共用
function ContactModal({ onClose, onLiveChat }) {
  const { Icon } = window.UI;
  const [lang] = window.useAgentLang ? window.useAgentLang() : ['zh'];
  const t = LANDING_I18N[lang] || LANDING_I18N.zh;
  const doLiveChat = onLiveChat || (() => { onClose(); window.APS_openLiveChat && window.APS_openLiveChat(); });
  // v3.2.51 订阅商户后台「客服管理」配置,实时同步
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    if (window.APS_CS_STORE) return window.APS_CS_STORE.subscribe(force);
  }, []);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  // v3.2.51 数据源 = 商户后台 客服管理(window.APS_CS_STORE),按 sort 升序
  const CS_ICON = { 'Live Chat':'bell', 'Telegram':'send', 'WhatsApp':'whatsapp', 'Email':'mail' };
  const cfg = (window.APS_CS_STORE && window.APS_CS_STORE.list) || [];
  const rows = [...cfg].sort((a, b) => (a.sort || 0) - (b.sort || 0));
  const handle = (c) => {
    if (c.type === 'Live Chat') doLiveChat();
    else if (c.btnLink) window.open(c.btnLink, '_blank');
  };
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9500, display:'grid', placeItems:'center',
      background:'rgba(15,23,42,.45)', backdropFilter:'blur(2px)', padding:20,
    }} onClick={onClose}>
      <div onClick={(e)=>e.stopPropagation()} style={{
        width:520, maxWidth:'calc(100vw - 40px)', maxHeight:'calc(100vh - 80px)', overflowY:'auto',
        background:'#fff', borderRadius:16, boxShadow:'0 24px 60px -12px rgba(15,23,42,.35)',
        animation:'alcUp .2s ease',
      }}>
        {/* 头部 */}
        <div style={{ padding:'26px 28px 18px', borderBottom:'1px solid #f1f5f9', position:'relative' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#3b82f6', letterSpacing:.5, marginBottom:8 }}>{t.contact.eyebrow}</div>
          <h2 style={{ fontSize:26, fontWeight:800, color:'#0f172a', margin:0, lineHeight:1.2 }}>{t.contact.title}</h2>
          <p style={{ fontSize:13.5, color:'#64748b', margin:'8px 0 0', lineHeight:1.6 }}>{t.contact.sub}</p>
          <button onClick={onClose} aria-label="关闭" style={{
            position:'absolute', top:22, right:22, width:34, height:34, borderRadius:8,
            border:'none', background:'transparent', color:'#94a3b8', cursor:'pointer',
            display:'grid', placeItems:'center',
          }}
          onMouseOver={(e)=>{e.currentTarget.style.background='#f1f5f9';e.currentTarget.style.color='#475569';}}
          onMouseOut={(e)=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#94a3b8';}}>
            <Icon name="x" size={18}/>
          </button>
        </div>
        {/* 渠道列表 */}
        <div style={{ padding:'18px 28px 28px', display:'flex', flexDirection:'column', gap:12 }}>
          {rows.map((c, i) => {
            const isMono = c.type === 'Email' || c.type === 'WhatsApp';
            return (
            <div key={c.id != null ? c.id : i} className="csm-row" style={{
              display:'flex', alignItems:'center', gap:16,
              border:'1px solid #e5e7eb', borderRadius:12, padding:'16px 18px',
            }}>
              <div className="csm-ic" style={{
                width:48, height:48, flex:'none', borderRadius:10, background:'#eff6ff',
                color:'#3b82f6', display:'grid', placeItems:'center',
              }}>
                <Icon name={CS_ICON[c.type] || 'message'} size={22}/>
              </div>
              <div className="csm-body" style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:15.5, fontWeight:700, color:'#0f172a' }}>{c.title}</div>
                <div style={{ fontSize:isMono?13:12.5, color:'#94a3b8', marginTop:3, wordBreak:'break-all', fontFamily: isMono ? 'JetBrains Mono, monospace' : 'inherit' }}>{c.subtitle}</div>
              </div>
              {c.hasBtn && c.btnText && (
                <button onClick={() => handle(c)} className="csm-btn" style={{
                  flex:'none', padding:'9px 24px', border:'none', borderRadius:8,
                  background:'#3b82f6', color:'#fff', fontSize:13.5, fontWeight:600, cursor:'pointer',
                  transition:'background .15s',
                }}
                onMouseOver={(e)=>e.currentTarget.style.background='#2563eb'}
                onMouseOut={(e)=>e.currentTarget.style.background='#3b82f6'}>
                  {c.btnText}
                </button>
              )}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
window.AgentContactModal = ContactModal;
