// 专业代理后台 - 共用工具与组件
// 当前登录代理身份(模拟)
window.CURRENT_AGENT_ID = 'AG100007';

// ============ v3.0.8 全局语言状态(招募营销页 + 登入后页面共享) ============
(function() {
  if (window.APS_LANG_STORE) return;
  const LS_KEY = 'APS_LANDING_LANG';
  let cur;
  try { cur = localStorage.getItem(LS_KEY) || 'zh'; } catch(e){ cur = 'zh'; }
  const listeners = new Set();
  window.APS_LANG_STORE = {
    get() { return cur; },
    set(l) {
      if (l !== 'zh' && l !== 'en') return;
      if (l === cur) return;
      cur = l;
      try { localStorage.setItem(LS_KEY, l); } catch(e){}
      listeners.forEach(fn => { try { fn(l); } catch(e){} });
    },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
  // React hook
  window.useAgentLang = function() {
    const [l, setL] = React.useState(window.APS_LANG_STORE.get());
    React.useEffect(() => window.APS_LANG_STORE.subscribe(setL), []);
    return [l, (nv) => window.APS_LANG_STORE.set(nv)];
  };
  // 翻译表(逐步累加)
  window.APS_I18N = window.APS_I18N || {};
  window.t = function(key, fallback) {
    const lang = window.APS_LANG_STORE.get();
    const dict = window.APS_I18N[lang] || {};
    return dict[key] != null ? dict[key] : (fallback != null ? fallback : key);
  };
})();

// ============ v3.0.8 后台/通用 i18n 字典 ============
(function() {
  const ZH = window.APS_I18N.zh = window.APS_I18N.zh || {};
  const EN = window.APS_I18N.en = window.APS_I18N.en || {};

  const add = (k, zh, en) => { ZH[k] = zh; EN[k] = en; };

  // 顶栏
  add('top.brand', '專業代理後台', 'Pro Affiliate Portal');
  add('top.search.ph', '搜索代理、玩家、Code、结算单...', 'Search agents, players, codes, settlements...');
  add('top.logout', '登出', 'Log Out');

  // 侧栏 sections + items
  add('nav.sec.account', '我的账户', 'My Account');
  add('nav.sec.ops', '运营', 'Operations');
  add('nav.sec.reports', '报表', 'Reports');
  add('nav.sec.promote_earn', '推广&收益', 'Promotion & Earnings');
  add('nav.item.my_profile', '我的账户', 'My Account');
  add('nav.item.my_codes', '邀请Code与链接', 'Codes & Links');
  add('nav.item.my_codes_mgmt', 'Code 与链接管理', 'Code & Link Management');
  add('nav.item.my_players', '玩家损益', 'Player P&L');
  add('nav.item.my_revshare', '分润报表', 'RevShare Report');
  add('nav.item.my_cpa', 'CPA 报表', 'CPA Report');
  add('nav.item.my_settlement', '结算单', 'Settlements');
  add('nav.item.my_wallet', '我的钱包', 'My Wallet');
  add('nav.item.my_notify', '通知中心', 'Notifications');
  add('nav.prd_home', 'PRD首页', 'PRD Home');

  // Dashboard
  add('home.hello', '你好,', 'Hello, ');
  add('home.welcome_back', '欢迎回来 · 上次登录', 'Welcome back · Last login');
  add('home.notify_center', '通知中心', 'Notifications');
  add('home.create_code', '创建 Code', 'New Code');
  add('home.kpi.commission', '本月佣金 (USD)', 'This Month (USD)');
  add('home.kpi.commission.sub', '已结算 3 张 · 待付款', 'Settled 3 · Pending');
  add('home.kpi.cpa', '有效 CPA 数', 'Valid CPA');
  add('home.kpi.cpa.delta', '本月', 'this month');
  add('home.kpi.cpa.sub', '通过率', 'Approval');
  add('home.kpi.ngr', '累计 NGR', 'Cumulative NGR');
  add('home.kpi.ngr.delta.win', '盈利', 'Profit');
  add('home.kpi.ngr.delta.loss', '负盈利', 'Negative');
  add('home.kpi.ngr.sub', '分润预估', 'Est. RevShare');
  add('home.kpi.players', '我的玩家', 'My Players');
  add('home.kpi.players.delta_a', '已首存', 'FTDs');
  add('home.kpi.players.sub_vip', 'VIP', 'VIP');
  add('home.chart.title', '近 30 天佣金趋势', 'Commission · Last 30 Days');
  add('home.chart.sub', '每日佣金累计 (CPA + RevShare)', 'Daily total (CPA + RevShare)');

  // AgentHero
  add('hero.normal', '正常', 'Active');
  add('hero.players', '玩家', 'Players');
  add('hero.valid_cpa', '有效 CPA', 'Valid CPA');
  add('hero.ngr_total', '累计 NGR', 'NGR Total');
  add('hero.commission_month', '本月佣金', 'This Month');

  // PageHead 通用 — 各模块标题/副标题
  add('page.my_profile.title', '我的账户', 'My Account');
  add('page.my_profile.sub', '管理您的个人资料、安全设置与合作方案', 'Manage your profile, security and partnership terms');
  add('page.my_codes.title', '邀请Code与链接', 'Invite Codes & Links');
  add('page.my_codes.sub', '查看各 Code 推广链接累计数据', 'View accumulated stats per code');
  // my_codes 页 KPI / 表头 / 筛选 / 空态
  add('mc.kpi.codes_total', 'Code 总数量', 'Total Codes');
  add('mc.kpi.reg', '总注册人数', 'Total Registrations');
  add('mc.kpi.dep_users', '总充值人数', 'Depositors');
  add('mc.kpi.dep_amt', '总充值金额', 'Total Deposits');
  add('mc.kpi.wd_users', '总提款人数', 'Withdrawers');
  add('mc.kpi.wd_amt', '总提款金额', 'Total Withdrawals');
  add('mc.kpi.cvr', '充值转化率', 'Deposit CVR');
  add('mc.kpi.gap', '充提差', 'Deposit − Withdraw');
  add('mc.kpi.balance', '玩家余额', 'Player Balance');
  add('mc.kpi.commission', '总佣金', 'Total Commission');
  add('mc.col.code', '邀请 Code', 'Invite Code');
  add('mc.col.desc', '描述', 'Description');
  add('mc.col.reg', '注册人数', 'Registrations');
  add('mc.col.dep_users', '充值人数', 'Depositors');
  add('mc.col.dep_amt', '充值金额', 'Deposit Amount');
  add('mc.col.wd_users', '提款人数', 'Withdrawers');
  add('mc.col.wd_amt', '提款金额', 'Withdraw Amount');
  add('mc.col.cvr', '充值转化率', 'CVR');
  add('mc.col.gap', '充提差', 'Net');
  add('mc.col.balance', '玩家余额', 'Player Balance');
  add('mc.col.commission', '佣金', 'Commission');
  add('mc.filter.ph', '邀请 Code', 'Invite Code');
  add('mc.filter.all', '全部状态', 'All Status');
  add('mc.status.active', '启用', 'Active');
  add('mc.status.frozen', '冻结', 'Frozen');
  add('mc.status.paused', '暂停', 'Paused');
  add('mc.status.disabled', '停用', 'Disabled');
  add('mc.empty', '暂无邀请 Code,请去「运营 → Code 与链接管理」创建', 'No invite codes. Create one at OPERATIONS → Code & Link Management.');
  add('mc.tr.7d',  '近 7 日',  'Last 7 Days');
  add('mc.tr.14d', '近 14 日', 'Last 14 Days');
  add('mc.tr.30d', '近 30 日', 'Last 30 Days');

  // ===== 玩家损益 (mp.*) =====
  add('page.my_players.title', '玩家损益', 'Player P&L');
  add('page.my_players.sub',   '查看邀请玩家的清单', 'View list of invited players');
  add('mp.kpi.total_players',  '玩家总数',     'Total Players');
  add('mp.kpi.ftd_users',      '总首存人数',   'FTD Users');
  add('mp.kpi.ftd_amt',        '总首存金额',   'Total FTD');
  add('mp.kpi.deposit',        '总充值金额',   'Total Deposits');
  add('mp.kpi.withdraw',       '总提款金额',   'Total Withdrawals');
  add('mp.kpi.gap',            '充提差',       'Net');
  add('mp.kpi.balance',        '总玩家余额',   'Total Player Balance');
  add('mp.kpi.wager',          '总投注',       'Total Wager');
  add('mp.kpi.payout',         '总派彩',       'Total Payout');
  add('mp.kpi.ggr',            'GGR',          'GGR');
  add('mp.kpi.commission',     '总佣金',       'Total Commission');
  add('mp.col.uid',            '玩家 UID',     'Player UID');
  add('mp.col.source_code',    '来源 Code',    'Source Code');
  add('mp.col.vip',            'VIP 等级',     'VIP Level');
  add('mp.col.ftd_amt',        '首次存款金额', 'First Deposit');
  add('mp.col.deposit',        '充值金额',     'Deposit');
  add('mp.col.withdraw',       '提款金额',     'Withdraw');
  add('mp.col.gap',            '充提差',       'Net');
  add('mp.col.balance',        '玩家余额',     'Player Balance');
  add('mp.col.wager',          '投注',         'Wager');
  add('mp.col.payout',         '派彩',         'Payout');
  add('mp.col.ggr',            'GGR',          'GGR');
  add('mp.col.commission',     '佣金',         'Commission');
  add('mp.filter.search_ph',   '玩家 UID / 邀请 Code', 'Player UID / Invite Code');
  add('mp.filter.all_vip',     '全部 VIP',     'All VIP');
  add('mp.empty',              '暂无玩家数据', 'No player data');

  // ===== Code 与链接管理 页 (mcm.*) =====
  add('page.my_codes_mgmt.title', 'Code 与链接管理', 'Code & Link Management');
  add('page.my_codes_mgmt.sub', '创建与管理您的专属邀请 Code 和推广链接', 'Create and manage your invite codes and tracking links');
  add('mcm.btn.create', '创建 邀请 Code', 'Create Invite Code');
  add('mcm.col.code', '邀请 Code', 'Invite Code');
  add('mcm.col.short_url', '邀请短链接', 'Invite Short Link');
  add('mcm.col.qr', 'QR Code', 'QR Code');
  add('mcm.col.desc', '描述', 'Description');
  add('mcm.col.remark', '备注', 'Remark');
  add('mcm.col.status', '状态', 'Status');
  add('mcm.col.actions', '操作', 'Actions');
  add('mcm.action.edit', '编辑', 'Edit');
  add('mcm.action.delete', '删除', 'Delete');
  add('mcm.action.download_png', '下载 PNG', 'Download PNG');
  add('mcm.status.active', '启用', 'Active');
  add('mcm.status.disabled', '停用', 'Disabled');
  add('mcm.filter.all', '全部状态', 'All Status');
  add('mcm.empty', '暂无邀请 Code,点击「创建 邀请 Code」开始', 'No invite codes. Click "Create Invite Code" to start.');
  add('mcm.create.title', '创建 邀请 Code', 'Create Invite Code');
  add('mcm.create.sub', '为新推广场景创建专属 Code', 'Create a dedicated code for a new promotion');
  add('mcm.edit.title', '编辑 邀请 Code', 'Edit Invite Code');
  add('mcm.edit.sub', '修改 Code 信息与使用状态', 'Update code info and status');
  add('mcm.form.code', '自定义 Code', 'Custom Code');
  add('mcm.form.code.ph', '如:AGlatam', 'e.g. AGlatam');
  add('mcm.form.code.req', '请填写此栏位', 'Required');
  add('mcm.form.code.min', '最少 4 个字符', 'At least 4 characters');
  add('mcm.form.code.pattern', 'Code 必须包含 4-10 个字符,仅字母大写、数字', 'Must be 4-10 chars, uppercase letters and digits only');
  add('mcm.form.code.dup', '该 Code 已存在,请更换', 'This code already exists');
  add('mcm.form.created', '创建时间', 'Created At');
  add('mcm.form.short_url', '邀请短链接', 'Invite Short Link');
  add('mcm.form.desc', '描述', 'Description');
  add('mcm.form.desc.ph_create', '如:Youtube专用、世界杯活动', 'e.g. Youtube only, World Cup campaign');
  add('mcm.form.desc.ph_edit', '如:Twitch专用', 'e.g. Twitch only');
  add('mcm.form.remark', '备注 (选填)', 'Remark (Optional)');
  add('mcm.form.remark.ph_create', '如:长期使用,不限推广地方', 'e.g. Long-term use, any channel');
  add('mcm.form.remark.ph_edit', '使用场景说明', 'Usage notes');
  add('mcm.form.qr_code', 'QR Code', 'QR Code');
  add('mcm.form.code_status', 'Code 使用状态', 'Code Status');
  add('mcm.form.current_status', '当前状态:', 'Current:');
  add('mcm.btn.disable', '停用', 'Disable');
  add('mcm.btn.reenable', '再次启用', 'Re-enable');
  add('mcm.btn.cancel', '取消', 'Cancel');
  add('mcm.btn.save', '保存', 'Save');
  add('mcm.btn.create_submit', '创建', 'Create');
  add('mcm.del.title', '确认删除邀请 Code', 'Confirm Delete Invite Code');
  add('mcm.del.sub', '删除后该 Code 的统计数据保留,但新点击将不再计入', 'Stats will be preserved, but no new clicks will be counted');
  add('mcm.del.body_a', '将删除邀请 Code', 'About to delete invite code');
  add('mcm.del.body_b', ',确定继续吗?', '. Continue?');
  add('mcm.del.confirm', '确认删除', 'Confirm Delete');
  add('mcm.toast.copied_code', '已复制', 'copied');
  add('mcm.toast.copied_link', '短链已复制', 'Link copied');
  add('mcm.toast.png_downloaded', 'PNG 已下载', 'PNG downloaded');
  add('mcm.toast.created', '创建成功', 'created');
  add('mcm.toast.updated', '已更新', 'updated');
  add('mcm.toast.deleted', '已删除', 'deleted');
  add('mcm.tip.copy_code', '复制 Code', 'Copy Code');
  add('mcm.tip.copy_link', '复制短链', 'Copy link');
  add('mcm.tip.copy', '复制', 'Copy');

  // 通用面包屑 / 框架
  add('crumb.home', '首页', 'Home');
  add('crumb.prd_home', 'PRD首页', 'PRD Home');
  add('crumb.prd_overview', '规划优先级', 'PRD Roadmap');
  add('crumb.version', '版本', 'Version');
  add('pg.summary', '共 {total} 条 · 第 {page} / {totalPages} 页', '{total} total · Page {page} / {totalPages}');
  add('page.my_players.title', '玩家损益', 'Player P&L');
  add('page.my_players.sub',   '查看邀请玩家的清单', 'View list of invited players');
  add('page.my_revshare.title', '分润报表', 'RevShare Report');
  add('page.my_revshare.sub', '按周期查看您的 RevShare 收益与计算明细', 'View your RevShare earnings and calculation details');

  // 登入弹窗
  add('login.title', '专业代理后台', 'Pro Affiliate Portal');
  add('login.sub', '输入账号信息以开始管理您的代理业务', 'Enter your credentials to manage your affiliate business');
  add('login.quick.label', '快速选择已创建账户', 'Quick-pick a created account');
  add('login.quick.empty', '暂无账户 · 商户审核通过 / 创建专业代理 后会显示在此', 'No accounts yet · created agents will appear here');
  add('login.username.ph', '账号', 'Username');
  add('login.password.ph', '密码', 'Password');
  add('login.remember', '记住账号', 'Remember me');
  add('login.submit', '登入', 'Log In');
  add('login.err.empty', '请输入帐号与密码', 'Please enter username and password');
  add('login.err.wrong', '帐号或密码错误', 'Incorrect username or password');
  add('login.foot.q', '还不是合作伙伴?', 'Not a partner yet?');
  add('login.foot.apply', '立即申请', 'Apply now');
  add('login.eye.show', '显示密码', 'Show password');
  add('login.eye.hide', '隐藏密码', 'Hide password');
  add('login.fill', '填入', 'Use');
  add('login.close', '关闭', 'Close');

  // 注册弹窗
  add('reg.title', '注册', 'Register');
  add('reg.foot.q', '已经有账户?', 'Already have an account?');
  add('reg.foot.login', '立即登入', 'Log in');

  // Step 1
  add('reg.s1.welcome', '欢迎加入!请告诉我们如何称呼您,以及怎么联络您?', 'Welcome aboard! Please tell us your name and how to contact you.');
  add('reg.s1.applyName', '申请人姓名', 'Applicant Name');
  add('reg.s1.applyName.ph', '真实姓名(与证件一致)', 'Full name (matches ID)');
  add('reg.s1.contacts', '联系方式', 'Contact Methods');
  add('reg.s1.contacts.hint', '· 至少填写 2 项', '· At least 2 entries');
  add('reg.s1.contacts.type', '联系类型', 'Type');
  add('reg.s1.contacts.value', '联系资料', 'Value');
  add('reg.s1.contacts.choose', '请选择 …', 'Select …');
  add('reg.s1.contacts.add', '+ 新增联系方式', '+ Add Contact');
  add('reg.s1.next', '下一页', 'Next');
  add('reg.s1.remove', '移除', 'Remove');

  // Step 2
  add('reg.s2.welcome', '请简单介绍一下你的流量。请选择你觉得方便的付款方式', 'Tell us about your traffic. Choose your preferred payment method.');
  add('reg.s2.url', '流量来源链接', 'Traffic Source URL');
  add('reg.s2.url.ph', 'https://domain.com', 'https://domain.com');
  add('reg.s2.pay', '偏好付款方式', 'Preferred Payment');
  add('reg.s2.payEmail', '电子邮箱', 'Payment Email');
  add('reg.s2.payEmail.ph', '电子邮箱', 'Payment email');
  add('reg.s2.next', '下一页', 'Next');

  // Step 3
  add('reg.s3.welcome_a', '', '');
  add('reg.s3.welcome_b', ',就快完成了!现在请输入帐户登入资讯', ', almost done! Now create your login credentials.');
  add('reg.s3.you', '你', 'you');
  add('reg.s3.username', '用户名', 'Username');
  add('reg.s3.password', '密码', 'Password');
  add('reg.s3.password2', '重新输入密码', 'Confirm Password');
  add('reg.s3.pw.fill', '请填写此栏位', 'Required');
  add('reg.s3.pw.min', '最少 8 个字元', 'At least 8 characters');
  add('reg.s3.pw.pattern', '密码必须包含 8-50 个字元,并包含字母大小寫、数字', 'Must be 8-50 chars, including upper+lower letters and numbers');
  add('reg.s3.pw.strong', '强密码', 'Strong password');
  add('reg.s3.pw.match', '密码已确认', 'Passwords match');
  add('reg.s3.pw.mismatch', '两次输入不一致', "Passwords don't match");
  add('reg.s3.agree.terms_a', '我同意本公司的', 'I agree to the ');
  add('reg.s3.agree.terms_b', '条款和条件', 'Terms & Conditions');
  add('reg.s3.agree.terms_c', '与', ' and ');
  add('reg.s3.agree.privacy', '隐私权政策', 'Privacy Policy');
  add('reg.s3.agree.news_a', '我同意收到 ', 'I agree to receive ');
  add('reg.s3.agree.news_b', ' 联盟计画的新讯息', ' affiliate program news');
  add('reg.s3.complete', 'Complete', 'Complete');

  // Step 4 (成功)
  add('reg.s4.title', '很高兴你加入我们!', 'Glad to have you with us!');
  add('reg.s4.p1', '你的账户正在审查', 'Your account is under review');
  add('reg.s4.p2', '我们将在 24 小时内寄电子邮件通知验证结果', "We'll email you the result within 24 hours");
  add('reg.s4.p3', '订阅我们的 Telegram 频道,了解最新讯息', 'Subscribe to our Telegram channel for updates');
  add('reg.s4.subscribe', '订阅', 'Subscribe');
})();

// ============ v3.0.9 LangSwitch 下拉按钮(全局共用) ============
function ensureLangSwitchStyle() {
  if (document.getElementById('aps-lang-style')) return;
  const s = document.createElement('style');
  s.id = 'aps-lang-style';
  s.textContent = `
.aps-lang-wrap { position:relative; display:inline-block; }
.aps-lang-btn { display:inline-flex; align-items:center; gap:6px; padding:5px 10px; border-radius:99px; background:#fff; border:1px solid #e5e7eb; color:#1e293b; font-size:13px; font-weight:600; cursor:pointer; transition:.15s; font-family:inherit; line-height:1; }
.aps-lang-btn > svg { display:block; flex-shrink:0; }
.aps-lang-btn > span { display:inline-block; line-height:1; }
.aps-lang-btn:hover { border-color:#3b82f6; color:#1e40af; background:#f8fafc; }
.aps-lang-btn.dark { background:rgba(255,255,255,.15); border-color:rgba(255,255,255,.25); color:#fff; backdrop-filter:blur(4px); }
.aps-lang-btn.dark:hover { background:rgba(255,255,255,.25); border-color:rgba(255,255,255,.4); color:#fff; }
.aps-lang-btn .chev { transition:transform .15s; }
.aps-lang-btn.open .chev { transform:rotate(180deg); }
.aps-lang-pop { position:absolute; top:calc(100% + 6px); right:0; min-width:148px; background:#fff; border:1px solid #e5e7eb; border-radius:10px; box-shadow:0 12px 32px -8px rgba(15,23,42,.18); padding:6px; z-index:1000; animation:apsLangFade .12s ease; }
@keyframes apsLangFade { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
.aps-lang-opt { display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:6px; font-size:13.5px; color:#1e293b; cursor:pointer; transition:.1s; }
.aps-lang-opt:hover { background:#f1f5f9; }
.aps-lang-opt.active { background:#eff6ff; color:#1e40af; font-weight:600; }
.aps-lang-opt .check { margin-left:auto; color:#3b82f6; }
.aps-lang-mask { position:fixed; inset:0; z-index:999; }
`;
  document.head.appendChild(s);
}

const APS_LANG_LABELS = {
  zh: { short: '中', long: '简体中文' },
  en: { short: 'EN', long: 'English' },
};

window.AgentLangSwitch = function AgentLangSwitch({ variant }) {
  const [lang, setLang] = window.useAgentLang();
  const [open, setOpen] = React.useState(false);
  const { Icon } = window.UI;
  React.useEffect(() => { ensureLangSwitchStyle(); }, []);
  const cur = APS_LANG_LABELS[lang] || APS_LANG_LABELS.zh;
  const pick = (l) => { setLang(l); setOpen(false); };
  return (
    <div className="aps-lang-wrap">
      <button
        className={'aps-lang-btn ' + (variant === 'dark' ? 'dark ' : '') + (open ? 'open' : '')}
        onClick={() => setOpen(v => !v)}
        aria-label="Language"
      >
        <Icon name="globe" size={14}/>
        <span>{cur.short}</span>
        <Icon name="chevronDown" size={11} className="chev"/>
      </button>
      {open && (
        <>
          <div className="aps-lang-mask" onClick={() => setOpen(false)}/>
          <div className="aps-lang-pop">
            {['en', 'zh'].map(l => (
              <div key={l} className={'aps-lang-opt ' + (lang === l ? 'active' : '')} onClick={() => pick(l)}>
                <span>{APS_LANG_LABELS[l].long}</span>
                {lang === l && <Icon name="check" size={13} className="check"/>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// 拿到当前代理对象 / 玩家 / Code / CPA / 结算等
window.useCurrentAgent = function() {
  const D = window.APS_DATA;
  // v2.5.6 优先从商户后台 store 拿同一条代理记录,确保「专业代理后台 / 我的账户」与「商户后台 / 代理账户管理」基本资料同步
  const store = window.APS_MERCHANT_AGENTS_STORE;
  const id = window.CURRENT_AGENT_ID;
  if (store) {
    const list = store.list || [];
    const hit = list.find(a => a.id === id || a._displayId === id);
    if (hit) {
      const base = D.agents.find(a => a.id === id) || D.agents[0];
      // v2.5.12 防御:已登入的代理 status 强制 active(即便 store 还未及时更新)
      const loggedSet = window.APS_LOGGED_IN_AGENTS && window.APS_LOGGED_IN_AGENTS.set;
      const merged = { ...base, ...hit };
      if (loggedSet && hit.status === 'pending') {
        const mid = hit._displayId || hit.id;
        if (loggedSet.has(mid) || loggedSet.has(hit.id)) merged.status = 'active';
      }
      return merged;
    }
  }
  return D.agents.find(a => a.id === id) || D.agents[0];
};

// 代理后台:页面顶部代理身份卡(常驻在每个模块顶部)
window.AgentHero = function AgentHero({ icon='dashboard', tone='#3b82f6' }) {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const me = window.useCurrentAgent();
  const [, ] = window.useAgentLang();
  const T = (k, fb) => window.t(k, fb);

  // 我的玩家 / Code / 结算 数量
  const myPlayers = D.players.filter(p => p.agentId === me.id);
  const myCodes = D.codes.filter(c => c.agent === me.id);
  const myCpa = D.cpaRecords.filter(c => c.agentId === me.id);
  const mySettle = D.settlements.filter(s => s.agentId === me.id);
  const validCpa = myCpa.filter(c => c.status === 'approved').length;
  const pendingCpa = myCpa.filter(c => c.status === 'pending').length;
  const ngr = myPlayers.reduce((a, p) => a + (p.ngr || 0), 0);
  const commissionThisMonth = mySettle.filter(s => s.period.includes('2026-W')).reduce((a, s) => a + (s.total || 0), 0);

  return (
    <div className="agent-hero" style={{
      background:'linear-gradient(135deg,'+tone+'12, transparent 60%), var(--bg-1)',
      border:'1px solid var(--line)',
      borderRadius:8,
      padding:'16px 20px',
      marginBottom:14,
      display:'flex',
      alignItems:'center',
      gap:18,
    }}>
      <div style={{
        width:48,height:48,borderRadius:12,
        background:'linear-gradient(135deg,'+tone+','+tone+'aa)',
        display:'grid',placeItems:'center',color:'#fff',fontSize:20,fontWeight:600,flexShrink:0
      }}>
        {me.name[0]}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:4}}>
          <span style={{fontSize:15,fontWeight:600,color:'var(--text-0)'}}>{me.name}</span>
          <span className="badge b-brand">{D.LABELS.tiers[me.tier] || me.tier}</span>
          <span className="badge b-neutral">{D.LABELS.types[me.type] || me.type}</span>
          <span className="badge b-success"><span className="dot"/>{T('hero.normal','正常')}</span>
        </div>
        <div style={{fontSize:11.5,color:'var(--text-3)',fontFamily:'var(--font-mono)'}}>
          {me.id} · L{me.level} · {D.LABELS.markets[me.market]} / {D.LABELS.countries[me.country]} · {me.currency}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,auto)',gap:24,flexShrink:0}}>
        {[
          [T('hero.players','玩家'), F.fmtNum(myPlayers.length)],
          [T('hero.valid_cpa','有效 CPA'), F.fmtNum(validCpa) + (pendingCpa ? ' / +' + pendingCpa : '')],
          [T('hero.ngr_total','累计 NGR'), '$' + F.money(ngr)],
          [T('hero.commission_month','本月佣金'), '$' + F.money(commissionThisMonth)],
        ].map(([l, v]) => (
          <div key={l} style={{textAlign:'right'}}>
            <div className="text-mute" style={{fontSize:11}}>{l}</div>
            <div className="text-mono" style={{fontSize:16,color:'var(--text-0)',fontWeight:600,marginTop:2}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
