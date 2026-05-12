// 网站前台 — Indian-style dark recruit card + Apply modal (with EN/CN toggle)
const FE_UI = window.UI;

const FE_I18N = {
  en: {
    // Card
    tag: 'PARTNER PROGRAM · NOW RECRUITING',
    title_a: 'Become a ', title_b: 'BEANS', title_c: ' Pro Affiliate',
    lead: 'Turn your traffic into INR. Weekly payouts, dedicated manager.',
    lead_inr: 'INR',
    feat_1_l: 'High CPA', feat_1_h: 'Up to ₹2,000 / FTD',
    feat_2_l: 'Rev Share', feat_2_h: 'Lifetime · 45%',
    feat_3_l: '1V1 Manager', feat_3_h: 'Hindi · English',
    btn_talk: 'Talk to Manager',
    btn_apply: 'Apply Now',
    toast_call: 'Connecting you to a BEANS manager…',
    state_label: 'Status:', state_view: 'View ›',
    // Modal
    m_title: 'Pro Affiliate Application',
    m_subtitle: ['We will arrange staff to contact you immediately after submission'],
    m_warn: 'False information will result in a permanent ban.',
    m_cancel: 'Cancel', m_submit: 'Submit',
    ok_title: 'Application submitted',
    ok_desc: 'We have received your application. Reviewers will reply via Email / SMS within 1-3 business days.',
    ok_id_label: 'Application ID',
    ok_close: 'Confirm',
    m_current: 'Current status',
    // Alerts
    a_rej_t: 'Application rejected',
    a_rej_d: 'Information incomplete or conflicts with an existing affiliate. Please review and reapply.',
    a_sup_t: 'Additional documents required',
    a_sup_d: 'Please upload a clearer selfie holding your ID. Resubmit within 3 business days.',
    a_pas_t: 'Application approved 🎉',
    a_pas_d: 'Welcome to BEANS Pro. Login credentials sent via SMS — please update your password immediately.',
    // Fields
    f_name: 'Full Name', f_name_p: 'As shown on your government ID',
    f_contact: 'Contact', f_contact_h: 'At least 2 items',
    contact_types_l: 'Type', contact_value_l: 'Value',
    contact_types: ['Email', 'Mobile', 'Telegram', 'WhatsApp'],
    contact_type_p: 'Select …',
    contact_value_ph: { Email: 'e.g. 123@gmail.com', Mobile: '+91 ', Telegram: '@your_telegram', WhatsApp: '+91 98xxx xxxxx' },
    contact_add: '+ Add contact',
    f_region: 'Region', f_region_p: 'Select region …',
    f_referrer: 'Referrer (Upline ID)', f_referrer_h: 'Optional — auto-assigned if blank',
    f_referrer_p: 'e.g. AG10042',
    f_tier: 'Affiliate Type', f_tier_h: 'Reviewer may adjust the final type',
    tier_normal_l: 'Individual Affiliate', tier_normal_d: ['Suitable for personal promotion', '1,000+ social media followers'],
    tier_general_l: 'Team Affiliate', tier_general_d: ['Suitable for team streamers', '100,000+ social media followers'],
    tier_super_l: 'Master Agent', tier_super_d: ['Large-scale traffic resources', 'Can recruit sub-affiliates'],
    f_kyc: 'KYC Documents', f_kyc_h: 'Aadhaar / PAN / Passport · JPG or PNG · ≤ 5MB each',
    kyc_front: 'ID Front', kyc_back: 'ID Back', kyc_selfie: 'Selfie with ID',
    upload_done: 'Uploaded · click to remove', upload_idle: 'Click to upload',
    f_why: 'Why you / Your channels',
    f_why_h: 'e.g. Telegram channel 50k subs, IPL Tiktok page, regional cricket forum…',
    f_why_p: 'Describe your traffic sources, expected monthly FTDs, and how you plan to promote BEANS …',
    // Region options
    regions: ['India — North', 'India — South', 'India — East', 'India — West', 'India — Central / NE', 'Bangladesh', 'Nepal', 'Sri Lanka', 'Other'],
    // Admin demo
    admin_head: 'Reviewer view (Backend Demo)',
    admin_hint: 'Toggle to preview each status',
    btn_review: 'Under review', btn_approve: 'Approve',
    btn_reqdoc: 'Request more docs', btn_reject: 'Reject (with reason)', btn_reset: 'Reset',
    prompt_sup: 'Resubmission instructions:',
    prompt_rej: 'Rejection reason:',
    toast_review: 'Status set to "Under review"',
    toast_approve: 'Application approved',
    toast_supplement: 'Asked for additional docs',
    toast_reject: 'Application rejected',
    toast_submit: 'Application submitted — under review',
    // Status pill
    s_idle: 'Pending', s_review: 'Under review', s_sup: 'Docs requested', s_fail: 'Rejected', s_supd: 'Re-review', s_pass: 'Approved',
    s_result: 'Result',
    // Success modal
    ok2_reviewing_t: 'Application submitted',
    ok2_reviewing_d: 'We have received your application. Reviewers will reply via Email/SMS and your contact within 1-3 business days.',
    ok2_supplement_t: 'Additional documents required',
    ok2_supplemented_t: 'Documents resubmitted',
    ok2_supplemented_d: 'We have received your documents. Reviewers will reply via Email/SMS and your contact within 1-3 business days.',
    ok2_failed_t: 'Application rejected',
    ok2_failed_d: 'Application did not pass review. You must create a new agent ID to reapply.',
    ok2_passed_t: 'Application approved',
    ok2_passed_d: '· Your Pro Affiliate account has been created — please check your Email for the credentials\n· If you do not log in within 3 days of the notification, the account will be disabled and you will need to reapply\n· Contact your dedicated Pro Affiliate support if you have any questions',
    cta_confirm: 'Confirm',
    cta_goSupp: 'Submit documents ›',
    cta_reapply: 'Reapply ›',
    hint_supp: 'Reopens the application form — your previously filled data is preserved',
    hint_reapply: 'Reopens the application form — previously filled data will be cleared',
    live_support: 'Live Support',
    sum_progress: 'Status',
    sum_time: 'Updated',
    sum_appid: 'Application ID'
  },
  zh: {
    tag: '专业代理招募计画 · 招募中',
    title_a: '加入 ', title_b: 'BEANS', title_c: ' 专业代理',
    lead: '将你的流量变成现金。每周结算,专属客户经理。',
    lead_inr: '现金',
    feat_1_l: '高佣金', feat_1_h: '高达 ₹2,000 / FTD',
    feat_2_l: '高分润', feat_2_h: '终身 · 45%',
    feat_3_l: '1V1 服务', feat_3_h: '中英双语',
    btn_talk: '联系专员',
    btn_apply: '申请代理',
    toast_call: '已为您接入专属客服 …',
    state_label: '申请进度:', state_view: '查看详情 ›',
    m_title: '专业代理申请',
    m_subtitle: ['提交申请后我们会立即安排人员与您联系'],
    m_warn: '请确保提交的资料真实有效,虚假信息将被永久封禁',
    m_cancel: '取消', m_submit: '提交申请',
    ok_title: '申请提交成功',
    ok_desc: '我们已收到您的申请，审核结果将在 1-3 个工作日内以 Email / 短信 通知。',
    ok_id_label: '申请号',
    ok_close: '确认',
    m_current: '申请进度',
    a_rej_t: '申请未通过',
    a_rej_d: '资料不完整或与现有代理体系存在冲突,请核对后重新提交。',
    a_sup_t: '需要补件',
    a_sup_d: '请补充清晰的手持身份证照片(需露出五官与证件号),3 个工作日内重新提交。',
    a_pas_t: '申请已通过 🎉',
    a_pas_d: '我们已为您开通专业代理后台,登录账号已通过短信发送,请尽快登录修改初始密码。',
    f_name: '申请人姓名', f_name_p: '真实姓名(与证件一致)',
    f_contact: '联系方式', f_contact_h: '至少填写 2 项',
    contact_types_l: '联系类型', contact_value_l: '联系资料',
    contact_types: ['Email', 'Mobile', 'Telegram', 'WhatsApp'],
    contact_type_p: '请选择 …',
    contact_value_ph: { Email: '如：123@gmail.com', Mobile: '+91 ', Telegram: '@telegram_id', WhatsApp: '+91 98xxx xxxxx' },
    contact_add: '+ 新增联系方式',
    f_region: '所在地区', f_region_p: '请选择 …',
    f_referrer: '推荐人(上级代理 ID)', f_referrer_h: '选填,留空将由系统分配',
    f_referrer_p: '如 AG10042',
    f_tier: '申请代理类型', f_tier_h: '审核员可根据资源调整最终类型',
    tier_normal_l: '个人代理', tier_normal_d: ['适合个人推广', '社交媒体有1000+的用户关注'],
    tier_general_l: '团队代理', tier_general_d: ['适合有团队的主播', '社交媒体有100,000+的用户关注'],
    tier_super_l: '总代理', tier_super_d: ['适合有大量的引流资源', '可发展下级专业代理'],
    f_kyc: 'KYC 证件', f_kyc_h: 'Aadhaar / PAN / 护照 · JPG / PNG · 单张 ≤ 5MB',
    kyc_front: '证件正面', kyc_back: '证件反面', kyc_selfie: '手持证件照',
    upload_done: '已上传 · 点击移除', upload_idle: '点击上传',
    f_why: '申请理由 / 推广渠道说明',
    f_why_h: '例:Telegram 5w 粉丝群、IPL Tiktok 页面、本地板球论坛 …',
    f_why_p: '请描述您的资源情况、预计每月新增玩家数、主要推广渠道与方式 …',
    regions: ['印度 — 北部', '印度 — 南部', '印度 — 东部', '印度 — 西部', '印度 — 中部 / 东北', '孟加拉', '尼泊尔', '斯里兰卡', '其他'],
    admin_head: '审核员视角(后台 Demo)',
    admin_hint: '切换状态查看不同进度展示',
    btn_review: '审核中', btn_approve: '通过',
    btn_reqdoc: '要求补件', btn_supreview: '已补件', btn_reject: '拒绝(填原因)', btn_reset: '重置',
    prompt_sup: '请填写补件说明:',
    prompt_rej: '请填写拒绝原因:',
    toast_review: '已置为「审核中」',
    toast_approve: '已通过申请',
    toast_supplement: '已要求补件',
    toast_reject: '已拒绝申请',
    toast_submit: '申请已提交,审核中…',
    s_idle: '待申请', s_review: '审核中', s_sup: '要求补件', s_fail: '申请失败', s_supd: '已补件待审核', s_pass: '已通过',
    s_result: '审核结果',
    // 申请进度弹窗
    ok2_reviewing_t: '申请成功',
    ok2_reviewing_d: '我们已收到您的申请，审核结果将在 1-3 个工作日内以 Email/短信及您填写的联系方式 通知。',
    ok2_supplement_t: '要求补件',
    ok2_supplemented_t: '补件成功',
    ok2_supplemented_d: '我们已收到您的补件，审核结果将在 1-3 个工作日内以 Email/短信及您填写的联系方式 通知。',
    ok2_failed_t: '已拒绝',
    ok2_failed_d: '审核未通过，需重新创建代理ID申请',
    ok2_passed_t: '审核通过',
    ok2_passed_d: '· 系统已为您创建专业代理账户，请至您的 Email 查看账号密码\n· 从发送通知起算 3 天内未在专业代理平台登入启用账户，账户将被停用，需重新填表申请\n· 有任何问题请联繫您的专属专业代理线上支持人员',
    cta_confirm: '确认',
    cta_goSupp: '前往补件 ›',
    cta_reapply: '重新申请 ›',
    hint_supp: '点击弹出申请弹窗，之前已填写资料仍存在',
    hint_reapply: '点击弹出申请弹窗，之前已填写资料清除',
    live_support: '在线客服',
    sum_progress: '申请进度',
    sum_time: '更新时间',
    sum_appid: '申请代理ID'
  }
};

function FrontendModule() {
  const toast = FE_UI.useToast();
  const [showApply, setShowApply] = React.useState(false);
  const [lang, setLang] = React.useState('en');
  const [applyTheme, setApplyTheme] = React.useState('dark');
  const t = FE_I18N[lang];

  // v2.3.14 不同用户 ID 独立维护申请状态（不共享）
  const [userStates, setUserStates] = React.useState({});
  const curState = userStates[currentUserId] || { applyState: 'idle', failReason: '', submittedAppId: '' };
  const applyState = curState.applyState;
  const failReason = curState.failReason;
  const submittedAppId = curState.submittedAppId;
  const patchUserState = (patch) => {
    if (!currentUserId) return;
    setUserStates((m) => ({ ...m, [currentUserId]: { ...(m[currentUserId] || { applyState: 'idle', failReason: '', submittedAppId: '' }), ...patch } }));
  };
  const setApplyState = (v) => patchUserState({ applyState: typeof v === 'function' ? v(applyState) : v });
  const setFailReason = (v) => patchUserState({ failReason: typeof v === 'function' ? v(failReason) : v });
  const setSubmittedAppId = (v) => patchUserState({ submittedAppId: typeof v === 'function' ? v(submittedAppId) : v });
  const [showSuccess, setShowSuccess] = React.useState(false);

  // v2.3.3 监听商户后台审核结果回写,自动同步前台卡片状态
  React.useEffect(() => {
    if (!window.APS_APPS_STORE) return;
    const sync = () => {
      const list = window.APS_APPS_STORE.list || [];
      // v2.3.19 优先按 submittedAppId 命中;否则按 currentUserId 找当前用户的最新非终态/有结果记录
      let rec = submittedAppId ? list.find((a) => a.id === submittedAppId) : null;
      if (!rec && currentUserId) {
        const mine = list.filter(a => a.userId === currentUserId);
        // 优先取最近一条(列表头部为最新)
        rec = mine[0];
      }
      if (!rec) return;
      // v2.3.21 无条件覆盖,避免缓存 state 不同步
      const patch = {};
      if (rec.id !== submittedAppId) patch.submittedAppId = rec.id;
      if ((rec.state || 'reviewing') !== applyState) patch.applyState = rec.state || 'reviewing';
      if ((rec.failReason || '') !== failReason) patch.failReason = rec.failReason || '';
      if (Object.keys(patch).length) patchUserState(patch);
    };
    sync();
    window.APS_APPS_STORE.listeners.add(sync);
    return () => window.APS_APPS_STORE.listeners.delete(sync);
  }, [submittedAppId, applyState, failReason, currentUserId]);

  const [form, setForm] = React.useState({
    name: '', contacts: [{ type: 'Email', value: '' }, { type: 'Mobile', value: '' }], region: '', referrer: '',
    level: 'normal', reason: '', channels: '',
    idFront: null, idBack: null, selfie: null
  });
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // v2.3.9 用户注册 / 自动登入(v2.3.11 不持久化 userList,刷新只剩 P001/P002)
  const [userList, setUserList] = React.useState(['P001', 'P002']);
  // v2.3.13 刷新页面清除登入态,初始回到注册页
  const [currentUserId, setCurrentUserId] = React.useState('');
  const generateUserId = () => {
    const max = userList.reduce((m, u) => {const n = parseInt(String(u).replace(/^P/, ''), 10);return Math.max(m, isNaN(n) ? 0 : n);}, 0);
    const next = 'P' + String(max + 1).padStart(3, '0');
    setUserList([...userList, next]);
    toast('已生成用户 ID:' + next, 'success');
  };
  const loginAs = (uid) => {setCurrentUserId(uid);};
  const logout = () => {setCurrentUserId('');};

  // 未登入 → 注册页
  if (!currentUserId) {
    return (
      <div className="fe-shell">
        <FeMandalaBg />
        <div className="fe-register-wrap">
          <div className="fe-reg-sub" style={{ fontSize: "20px" }}>使用已创建用户 ID 自动登入</div>
          <button className="fe-reg-genbtn" onClick={generateUserId}>
            <Icon name="plus" size={14} /> 生成新的用户 ID
          </button>
          <div className="fe-reg-list">
            {userList.length === 0 ?
            <div className="fe-reg-empty">请生成新的用户 ID</div> :

            userList.map((uid) =>
            <button key={uid} className="fe-reg-item" onClick={() => loginAs(uid)}>
                  <span className="fe-reg-item-id">{uid}</span>
                  <Icon name="chevronRight" size={14} />
                </button>
            )
            }
          </div>
        </div>
      </div>);

  }

  return (
    <div className="fe-shell">
      <FeMandalaBg />
      <div className="fe-recruit-wrap">
        <div className="fe-recruit-card">
          <FeMandalaCorner />

          <div className="fe-recruit-tag">
            <span className="dot" /> {t.tag}
          </div>

          <h2 className="fe-recruit-title">
            {t.title_a}<span>{t.title_b}</span>{t.title_c}
          </h2>

          <p className="fe-recruit-lead">
            {t.lead.replace(t.lead_inr, '__INR__').split('__INR__').map((s, i) =>
            i === 0 ? s : <React.Fragment key={i}><b>{t.lead_inr}</b>{s}</React.Fragment>
            )}
          </p>

          <div className="fe-recruit-feats">
            {[
            { ico: 'pie', l: t.feat_1_l, h: t.feat_1_h },
            { ico: 'refresh', l: t.feat_2_l, h: t.feat_2_h },
            { ico: 'users', l: t.feat_3_l, h: t.feat_3_h }].
            map((f, i) =>
            <div key={i} className="fe-recruit-feat">
                <div className="fe-recruit-feat-ico"><Icon name={f.ico} size={16} /></div>
                <div>
                  <div className="ft-l">{f.l}</div>
                  <div className="ft-h">{f.h}</div>
                </div>
              </div>
            )}
          </div>

          <div className="fe-recruit-actions">
            <button className="fe-recruit-btn ghost" onClick={() => toast(t.toast_call, 'info')}>
              <Icon name="phone" size={14} /> {t.btn_talk}
            </button>
            <button className="fe-recruit-btn primary" onClick={() => {
              // v2.3.17 兜底:从 store 反查当前用户最新申请记录,避免 userStates 槽未写入时误开申请表单
              let st = applyState;
              let appId = submittedAppId;
              // v2.3.20 每次点击都从 store 重拉最新状态,避免缓存的 reviewing 覆盖商户后台已改的 supplement/failed/passed
              if (window.APS_APPS_STORE && currentUserId) {
                const list = window.APS_APPS_STORE.list || [];
                const rec = (appId && list.find(a => a.id === appId)) || list.find(a => a.userId === currentUserId);
                if (rec) {
                  st = rec.state || st || 'reviewing';
                  appId = rec.id;
                  patchUserState({ applyState: st, submittedAppId: appId, failReason: rec.failReason || '' });
                }
              }
              if (st && st !== 'idle') { setShowSuccess(true); } else { setShowApply(true); }
            }}>
              {t.btn_apply} <Icon name="chevronRight" size={14} />
            </button>
          </div>

          </div>

        {/* 卡片下方语言切换 + 申请弹窗主题切换 + 用户ID/登出 */}
        <div className="fe-card-foot">
          <FeLangSwitch lang={lang} setLang={setLang} placement="card" />
          <div className="fe-theme-switch card" role="group" aria-label="主题切换">
            <svg className="fe-theme-lead" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5" /><circle cx="19" cy="12" r="2.5" /><circle cx="16.5" cy="17.5" r="2.5" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="5" cy="11" r="2.5" /><path d="M12 22a10 10 0 1 1 10-10c0 1.5-1 2-2.5 2H17a3 3 0 0 0-3 3v2.5c0 1.5-.5 2.5-2 2.5z" /></svg>
            <button
              className={'fe-theme-seg' + (applyTheme === 'light' ? ' active' : '')}
              onClick={() => setApplyTheme('light')}
              title="亮色主题" aria-label="亮色主题" aria-pressed={applyTheme === 'light'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
            </button>
            <button
              className={'fe-theme-seg' + (applyTheme === 'dark' ? ' active' : '')}
              onClick={() => setApplyTheme('dark')}
              title="暗色主题" aria-label="暗色主题" aria-pressed={applyTheme === 'dark'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            </button>
          </div>
          <div className="fe-user-box">
            <span className="fe-user-id">用户ID:<b>{currentUserId}</b></span>
            <button className="fe-user-logout" onClick={logout}><Icon name="logout" size={12} /> 登出</button>
          </div>
        </div>
      </div>

      {/* ============ Affiliate Application Modal (手机定制) ============ */}
      {showApply &&
      <div className="modal-mask" onClick={() => setShowApply(false)}>
        <div className={'apply-mobile-modal apply-theme-' + applyTheme} onClick={(e) => e.stopPropagation()}>
          {/* v2.3.2 审核员 Demo 移到右侧 */}
          <div className="apply-admin top apply-admin-rail">
            <div className="apply-admin-head">
              <Icon name="shield" size={13} />
              <span>{t.admin_head}</span>
            </div>
            <div className="apply-admin-hint">{t.admin_hint}</div>
            <div className="apply-admin-actions">
              <button className="btn" onClick={() => {setApplyState('reviewing');toast(t.toast_review, 'info');}}>
                <Icon name="history" size={12} /> {t.btn_review}
              </button>
              <button className="btn" style={{ borderColor: '#22c55e', color: '#15803d' }} onClick={() => {setApplyState('passed');setFailReason('');toast(t.toast_approve, 'success');}}>
                <Icon name="check" size={12} /> {t.btn_approve}
              </button>
              <button className="btn" style={{ borderColor: '#f59e0b', color: '#b45309' }} onClick={() => {const r = window.prompt(t.prompt_sup, t.a_sup_d);if (r === null) return;setFailReason(r);setApplyState('supplement');toast(t.toast_supplement, 'info');}}>
                <Icon name="edit" size={12} /> {t.btn_reqdoc}
              </button>
              <button className="btn" style={{ borderColor: '#f97316', color: '#c2410c' }} onClick={() => {setApplyState('supplemented');toast('已标记补件审核中', 'info');}}>
                <Icon name="check" size={12} /> {t.btn_supreview}
              </button>
              <button className="btn danger" onClick={() => {const r = window.prompt(t.prompt_rej, t.a_rej_d);if (r === null) return;setFailReason(r);setApplyState('failed');toast(t.toast_reject, 'danger');}}>
                <Icon name="x" size={12} /> {t.btn_reject}
              </button>
              <button className="btn ghost sm" onClick={() => {setApplyState('idle');setFailReason('');}}>{t.btn_reset}</button>
            </div>
            {/* v2.3.2 申请进度 4 状态展示 */}
            <div className="apply-progress-states">
              <div className="apply-progress-head">申请进度 · 4 种状态</div>
              {[
              { key: 'reviewing', label: '审核中', desc: '已提交,等待运营审核(1-3 工作日)', tone: 'info' },
              { key: 'supplement', label: '要求补件', desc: '资料不完整,运营要求补交或修正', tone: 'warn' },
              { key: 'supplemented', label: '已补件审核中', desc: '已补件再次提交,等待运营审核(1-3 工作日)', tone: 'reReview' },
              { key: 'passed', label: '已通过', desc: '审核通过,系统已创建专业代理账户', tone: 'success' },
              { key: 'failed', label: '已拒绝', desc: '审核未通过,需重新创建代理ID申请', tone: 'danger' }].
              map((s) =>
              <div key={s.key} className={'apply-progress-row tone-' + s.tone + (applyState === s.key ? ' active' : '')}>
                  <span className="apply-progress-dot"></span>
                  <span className="apply-progress-label">{s.label}</span>
                  <span className="apply-progress-desc">{s.desc}</span>
                </div>
              )}
            </div>
          </div>

          {/* 主弹窗 */}
          <div className="apply-mobile-body">
            <div className="apply-mobile-head">
              <h3>{t.m_title}</h3>
              <button className="close" onClick={() => setShowApply(false)}><Icon name="x" size={16} /></button>
            </div>
            <ul className="apply-mobile-sub">
              {(Array.isArray(t.m_subtitle) ? t.m_subtitle : [t.m_subtitle]).map((s, i) => <li key={i}>{s}</li>)}
            </ul>

        {applyState === 'failed' &&
            <div className="apply-alert danger">
            <Icon name="alert" size={14} />
            <div>
              <b>{t.a_rej_t}</b>
              <div style={{ marginTop: 4, color: 'var(--text-2)', fontSize: 12.5, lineHeight: 1.6 }}>
                {failReason || t.a_rej_d}
              </div>
            </div>
          </div>
            }
        {applyState === 'supplement' &&
            <div className="apply-alert warning">
            <Icon name="alert" size={14} />
            <div>
              <b>{t.a_sup_t}</b>
              <div style={{ marginTop: 4, color: 'var(--text-2)', fontSize: 12.5, lineHeight: 1.6 }}>
                {failReason || t.a_sup_d}
              </div>
            </div>
          </div>
            }
        {applyState === 'passed' &&
            <div className="apply-alert success">
            <Icon name="check" size={14} />
            <div>
              <b>{t.a_pas_t}</b>
              <div style={{ marginTop: 4, color: 'var(--text-2)', fontSize: 12.5, lineHeight: 1.6 }}>
                {t.a_pas_d}
              </div>
            </div>
          </div>
            }

        <div className={'apply-form ' + (applyState === 'reviewing' || applyState === 'supplemented' || applyState === 'passed' ? 'locked' : '')}>
          <FeField label={t.f_name} required>
            <input className="input" placeholder={t.f_name_p}
                value={form.name} onChange={(e) => setField('name', e.target.value)} />
          </FeField>

          <FeField label={t.f_contact} required hint={t.f_contact_h} hintInline stack>
            <div className="contact-list">
              <div className="contact-row contact-head">
                <div className="contact-cell-type">{t.contact_types_l}<span style={{ color: 'var(--danger)' }}>*</span></div>
                <div className="contact-cell-val">{t.contact_value_l}<span style={{ color: 'var(--danger)' }}>*</span></div>
                <div className="contact-cell-act" />
              </div>
              {form.contacts.map((c, idx) => {
                    const locked = idx < 2; // 前两项为 Email + 手机，不可删除/改类型
                    const isPhone = c.type === '手机' || c.type === 'Mobile' || c.type === 'WhatsApp';
                    return (
                      <div key={idx} className="contact-row">
                  <div className="contact-cell-type">
                    {locked ?
                          <div className="contact-type-locked">{c.type}</div> :

                          <select className="select" value={c.type}
                          onChange={(e) => {
                            const next = [...form.contacts];next[idx] = { ...next[idx], type: e.target.value, value: '' };
                            setField('contacts', next);
                          }}>
                        <option value="">{t.contact_type_p}</option>
                        {t.contact_types.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
                      </select>
                          }
                  </div>
                  <div className="contact-cell-val">
                    {isPhone ?
                          <div className="contact-phone-input">
                        <span className="contact-phone-prefix">+91</span>
                        <input className="input"
                            placeholder="98xxx xxxxx"
                            value={c.value}
                            onChange={(e) => {
                              const next = [...form.contacts];next[idx] = { ...next[idx], value: e.target.value };
                              setField('contacts', next);
                            }} />
                      </div> :

                          <input className="input"
                          placeholder={t.contact_value_ph[c.type] || ''}
                          value={c.value}
                          onChange={(e) => {
                            const next = [...form.contacts];next[idx] = { ...next[idx], value: e.target.value };
                            setField('contacts', next);
                          }} />
                          }
                  </div>
                  <div className="contact-cell-act">
                    {!locked &&
                          <button type="button" className="contact-remove" title="移除"
                          onClick={() => {
                            const next = form.contacts.filter((_, i) => i !== idx);
                            setField('contacts', next);
                          }}>−</button>
                          }
                  </div>
                </div>);

                  })}
              <button type="button" className="contact-add-btn"
                  onClick={() => setField('contacts', [...form.contacts, { type: '', value: '' }])}>
                {t.contact_add}
              </button>
            </div>
          </FeField>

          <FeField label={t.f_tier} required hint={t.f_tier_h}>
            <div className="apply-radio-group">
              {[
                  { v: 'normal', l: t.tier_normal_l, d: t.tier_normal_d },
                  { v: 'general', l: t.tier_general_l, d: t.tier_general_d },
                  { v: 'super', l: t.tier_super_l, d: t.tier_super_d }].
                  map((opt) =>
                  <div key={opt.v}
                  className={'apply-radio ' + (form.level === opt.v ? 'active' : '')}
                  onClick={() => setField('level', opt.v)}>
                  <div className="apply-radio-dot" />
                  <div>
                    <div className="apply-radio-l">{opt.l}</div>
                    <ul className="apply-radio-d">
                      {(Array.isArray(opt.d) ? opt.d : [opt.d]).map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
                  )}
            </div>
          </FeField>

          <FeField label={t.f_why} required hint={t.f_why_h} stack>
            <div className="apply-textarea-wrap">
              <textarea className="textarea apply-textarea" rows={3}
                  maxLength={500}
                  placeholder={t.f_why_p}
                  value={form.reason}
                  onInput={(e) => {e.target.style.height = 'auto';e.target.style.height = Math.min(e.target.scrollHeight, 320) + 'px';}}
                  onChange={(e) => setField('reason', e.target.value.slice(0, 500))} />
              <div className="apply-textarea-count">{(form.reason || '').length}/500</div>
            </div>
          </FeField>
        </div>

            <div className="apply-mobile-warn">
              <Icon name="alert" size={12} />
              <span>{t.m_warn}</span>
            </div>

            <div className="apply-mobile-foot">
              <button className="btn" onClick={() => setShowApply(false)}>{t.m_cancel}</button>
              <button className="btn primary" disabled={applyState === 'reviewing' || applyState === 'supplemented' || applyState === 'passed'} onClick={() => {
                // v2.3.0 提交申请 → 推送到商户后台「自行申请代理」列表
                const phone = (form.contacts || []).find((c) => c.type === '手机' || c.type === 'Mobile' || c.type === 'WhatsApp');
                const email = (form.contacts || []).find((c) => c.type === 'Email');
                const primary = phone ? '+91 ' + phone.value : email ? email.value : (form.contacts || [])[0]?.value || '';
                const channels = (form.contacts || []).map((c) => c.type).filter(Boolean).join(' · ');
                // v2.3.25 提交前从 store 实时读取最新状态,避免 React state 滞后导致补件重提走错分支
                let liveSt = applyState; let liveId = submittedAppId;
                if (window.APS_APPS_STORE && currentUserId) {
                  const list = window.APS_APPS_STORE.list || [];
                  const rec = (submittedAppId && list.find(a => a.id === submittedAppId)) || list.find(a => a.userId === currentUserId);
                  if (rec) { liveSt = rec.state || liveSt; liveId = rec.id; }
                }
                // v2.3.3 区分「首次提交」与「补件重提」
                if (liveSt === 'supplement' && liveId && window.APS_APPS_STORE) {
                  // 补件重提:更新原记录 state=supplemented,清空 failReason
                  const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
                  window.APS_APPS_STORE.list = window.APS_APPS_STORE.list.map((a) =>
                  a.id === liveId ? { ...a, state: 'supplemented', failReason: null, updatedAt: nowStr, contact: primary, reason: form.reason || a.reason, tier: form.level || a.tier, name: form.name || a.name, channels: channels || a.channels, _formSnapshot: { ...form } } : a
                  );
                  window.APS_APPS_STORE.listeners.forEach((fn) => fn());
                  patchUserState({ applyState: 'supplemented', submittedAppId: liveId, failReason: '' });
                } else {
                  // 首次提交
                  let created = null;
                  if (window.APS_addApplication) {
                    created = window.APS_addApplication({
                      name: form.name || '新申请人',
                      tier: form.level || 'normal',
                      userId: currentUserId,
                      contact: primary,
                      region: form.region || '',
                      reason: form.reason || '',
                      channels: channels,
                      _formSnapshot: { ...form }
                    });
                  }
                  // v2.3.15 保险丝:created 为空时 fallback 到 store 最新一条(刚 push 到头部)
                  const fallbackId = window.APS_APPS_STORE && window.APS_APPS_STORE.list && window.APS_APPS_STORE.list[0] ? window.APS_APPS_STORE.list[0].id : '';
                  patchUserState({ applyState: 'reviewing', submittedAppId: (created && created.id) || fallbackId || '', failReason: '' });
                }
                setShowApply(false);
                setShowSuccess(true);
              }}>
                <Icon name="upload" size={13} /> {t.m_submit}
              </button>
            </div>
          </div>
        </div>
      </div>
      }

      {/* v2.3.0 提交成功弹窗 */}
      {showSuccess &&
      <div className="modal-mask" onClick={() => setShowSuccess(false)}>
        <div className="apply-success-modal" onClick={(e) => e.stopPropagation()}>
          {(() => {const cfg = {
              reviewing: { icon: 'check', color: '#22c55e', progressColor: '#d97706', title: t.ok2_reviewing_t, progress: t.s_review, desc: t.ok2_reviewing_d, cta: t.cta_confirm, onCta: () => setShowSuccess(false) },
              supplement: { icon: 'alert', color: '#f59e0b', progressColor: '#7c3aed', title: t.ok2_supplement_t, progress: t.s_sup, desc: failReason || t.a_sup_d, cta: t.cta_goSupp, onCta: () => {
                // v2.3.23 从 store 回填上次提交的表单数据
                if (window.APS_APPS_STORE) {
                  const list = window.APS_APPS_STORE.list || [];
                  const rec = (submittedAppId && list.find(a => a.id === submittedAppId)) || list.find(a => a.userId === currentUserId);
                  if (rec) {
                    if (rec._formSnapshot) {
                      setForm(rec._formSnapshot);
                    } else {
                      // fallback:从扁平字段重建 contacts
                      const types = (rec.channels || '').split(' · ').filter(Boolean);
                      const contacts = types.length ? types.map((tp, i) => ({ type: tp, value: i === 0 ? String(rec.contact || '').replace(/^\+91\s*/, '') : '' })) : [{ type:'Email', value:'' },{ type:'Mobile', value:'' }];
                      setForm({ name: rec.name || '', contacts, region: rec.region || '', referrer: '', level: rec.tier || 'normal', reason: rec.reason || '', channels: rec.channels || '', idFront: null, idBack: null, selfie: null });
                    }
                  }
                }
                setShowSuccess(false); setShowApply(true);
              }, hint: t.hint_supp },
              supplemented: { icon: 'upload', color: '#f97316', progressColor: '#d97706', title: t.ok2_supplemented_t, progress: t.s_supd, desc: t.ok2_supplemented_d, cta: t.cta_confirm, onCta: () => setShowSuccess(false) },
              failed: { icon: 'x', color: '#ef4444', progressColor: '#dc2626', title: t.ok2_failed_t, progress: t.s_fail, desc: failReason || t.ok2_failed_d, cta: t.cta_reapply, onCta: () => {setShowSuccess(false);setApplyState('idle');setFailReason('');setForm({ name: '', contacts: [{ type: 'Email', value: '' }, { type: '手机', value: '' }], referrer: '', level: 'normal', reason: '', channels: '', idFront: null, idBack: null, selfie: null });setShowApply(true);}, hint: t.hint_reapply },
              passed: { icon: 'users', color: '#3b82f6', progressColor: '#16a34a', title: t.ok2_passed_t, progress: t.s_pass, desc: t.ok2_passed_d, cta: t.cta_confirm, onCta: () => setShowSuccess(false), extraBtn: { label: t.live_support, icon: 'phone' } }
            };
            // v2.3.21 直接从 store 实时读取最新 rec,避免 userStates 缓存陈旧
            let liveState = applyState; let liveReason = failReason; let liveAppId = submittedAppId;
            if (window.APS_APPS_STORE && currentUserId) {
              const list = window.APS_APPS_STORE.list || [];
              const rec = (submittedAppId && list.find(a => a.id === submittedAppId)) || list.find(a => a.userId === currentUserId);
              if (rec) { liveState = rec.state || liveState || 'reviewing'; liveReason = rec.failReason || ''; liveAppId = rec.id; }
            }
            cfg.supplement.desc = liveReason || t.a_sup_d;
            cfg.failed.desc = liveReason || t.ok2_failed_d;
            const c = cfg[liveState] || cfg.reviewing;return (
              <React.Fragment>
              <div className="apply-success-icon" style={{ background: c.color, boxShadow: `0 8px 24px ${c.color}55` }}>
                <Icon name={c.icon} size={28} />
              </div>
              <h3 className="apply-success-title">{c.title}</h3>
              <p className="apply-success-desc" style={{ whiteSpace: 'pre-line', textAlign: c.desc.includes('·') ? 'left' : 'center' }}>{c.desc}</p>
              {c.extraBtn && <button className="btn" style={{ margin: '0 auto 12px' }}><Icon name={c.extraBtn.icon} size={13} /> {c.extraBtn.label}</button>}
              <div className="apply-success-summary">
                <div className="ass-card">
                  <div className="ass-row"><span>{t.sum_progress}</span><span style={{ color: c.progressColor || c.color, fontWeight: 600 }}>· {c.progress || c.title}</span></div>
                  <div className="ass-row"><span>{t.sum_time}</span><span style={{ fontFamily: 'JetBrains Mono' }}>{new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 8)}</span></div>
                </div>
                <div className="ass-card">
                  <div className="ass-row"><span>{t.sum_appid}</span><span style={{ fontFamily: 'JetBrains Mono' }}>{submittedAppId || (window.APS_APPS_STORE && window.APS_APPS_STORE.list && window.APS_APPS_STORE.list[0] && window.APS_APPS_STORE.list[0].id) || '—'}</span></div>
                </div>
              </div>
              <button className="btn primary apply-success-btn" onClick={c.onCta}>{c.cta}</button>
              {/* v2.3.22 移除底部提示文案,仅保留按钮交互 */}
            </React.Fragment>);
          })()}
        </div>
      </div>
      }
    </div>);

}

// ── 中英文切换 ──
function FeLangSwitch({ lang, setLang, placement }) {
  return (
    <div className={'fe-lang-switch ' + (placement || '')}>
      <Icon name="globe" size={12} />
      <button
        className={lang === 'en' ? 'active' : ''}
        onClick={() => setLang('en')}>EN</button>
      <span className="fe-lang-div" />
      <button
        className={lang === 'zh' ? 'active' : ''}
        onClick={() => setLang('zh')}>中文</button>
    </div>);

}

// ── 印度风曼陀罗背景 ──
function FeMandalaBg() {
  return (
    <svg className="fe-mandala-bg" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="feBgG" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor="#FFB300" stopOpacity=".10" />
          <stop offset="1" stopColor="#FFB300" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="400" cy="400" r="380" fill="url(#feBgG)" />
      {[...Array(16)].map((_, i) => {
        const a = i * 22.5 * Math.PI / 180;
        return <line key={i}
        x1={400} y1={400}
        x2={400 + Math.cos(a) * 380} y2={400 + Math.sin(a) * 380}
        stroke="rgba(255,179,0,.10)" strokeWidth="1" />;
      })}
      {[60, 120, 180, 240, 320].map((r, i) =>
      <circle key={i} cx="400" cy="400" r={r}
      fill="none" stroke="rgba(255,179,0,.14)" strokeWidth=".8" strokeDasharray={i % 2 ? "3 4" : "1 6"} />
      )}
    </svg>);

}

// ── 卡片角落小曼陀罗 ──
function FeMandalaCorner() {
  return (
    <svg className="fe-mandala-corner" viewBox="0 0 120 120" aria-hidden="true">
      {[...Array(12)].map((_, i) => {
        const a = i * 30 * Math.PI / 180;
        return <line key={i}
        x1={60} y1={60}
        x2={60 + Math.cos(a) * 60} y2={60 + Math.sin(a) * 60}
        stroke="#FFD86E" strokeOpacity=".35" strokeWidth=".8" />;
      })}
      {[24, 40, 55].map((r, i) =>
      <circle key={i} cx="60" cy="60" r={r}
      fill="none" stroke="#FFD86E" strokeOpacity={.2 + i * .1} strokeWidth=".8" />
      )}
      {[...Array(8)].map((_, i) => {
        const a = i * 45 * Math.PI / 180;
        const x = 60 + Math.cos(a) * 32,y = 60 + Math.sin(a) * 32;
        return <ellipse key={i} cx={x} cy={y} rx="6" ry="3"
        transform={`rotate(${i * 45} ${x} ${y})`}
        fill="none" stroke="#FFD86E" strokeOpacity=".4" strokeWidth=".8" />;
      })}
    </svg>);

}

function FeStatePill({ state, large, t, theme }) {
  const map = theme === 'dark' ? {
    idle: { l: t ? t.s_idle : 'Pending', c: '#e2e8f0', bg: 'rgba(148,163,184,.22)' },
    reviewing: { l: t ? t.s_review : 'Under review', c: '#67e8f9', bg: 'rgba(6,182,212,.22)' },
    supplement: { l: t ? t.s_sup : 'Docs requested', c: '#fcd34d', bg: 'rgba(245,158,11,.25)' },
    supplemented: { l: t ? t.s_supd : 'Re-review', c: '#fdba74', bg: 'rgba(249,115,22,.25)' },
    failed: { l: t ? t.s_fail : 'Rejected', c: '#fca5a5', bg: 'rgba(239,68,68,.22)' },
    passed: { l: t ? t.s_pass : 'Approved', c: '#86efac', bg: 'rgba(34,197,94,.22)' }
  } : {
    idle: { l: t ? t.s_idle : 'Pending', c: '#64748b', bg: '#f1f5f9' },
    reviewing: { l: t ? t.s_review : 'Under review', c: '#0e7490', bg: 'rgba(6,182,212,.14)' },
    supplement: { l: t ? t.s_sup : 'Docs requested', c: '#b45309', bg: 'rgba(245,158,11,.16)' },
    supplemented: { l: t ? t.s_supd : 'Re-review', c: '#c2410c', bg: 'rgba(249,115,22,.14)' },
    failed: { l: t ? t.s_fail : 'Rejected', c: '#b91c1c', bg: 'rgba(239,68,68,.14)' },
    passed: { l: t ? t.s_pass : 'Approved', c: '#15803d', bg: 'rgba(34,197,94,.14)' }
  };
  const s = map[state] || map.idle;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: large ? '5px 12px' : '2px 8px',
      borderRadius: large ? 6 : 10,
      background: s.bg, color: s.c,
      fontSize: large ? 13 : 11.5, fontWeight: 600
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.c }} />
      {s.l}
    </span>);

}

function FeStateStepper({ state, t }) {
  const last = state === 'failed' ? t ? t.s_fail : 'Rejected' :
  state === 'supplement' ? t ? t.s_sup : 'Docs requested' :
  state === 'passed' ? t ? t.s_pass : 'Approved' :
  t ? t.s_result : 'Result';
  const steps = [
  { l: t ? t.s_idle : 'Pending' },
  { l: t ? t.s_review : 'Under review' },
  { l: last }];

  const idx = state === 'idle' ? 0 : state === 'reviewing' ? 1 : 2;
  const tone = state === 'failed' ? '#ef4444' : state === 'supplement' ? '#f59e0b' : state === 'passed' ? '#22c55e' : 'var(--brand)';
  return (
    <div className="apply-stepper">
      {steps.map((s, i) =>
      <React.Fragment key={i}>
          <div className="apply-step">
            <div className="apply-step-dot" style={{
            background: i <= idx ? tone : 'var(--bg-3)',
            color: i <= idx ? '#fff' : 'var(--text-3)',
            borderColor: i <= idx ? tone : 'var(--line)'
          }}>
              {i < idx ? <Icon name="check" size={10} /> : i + 1}
            </div>
            <div className="apply-step-l" style={{
            color: i <= idx ? 'var(--text-0)' : 'var(--text-3)',
            fontWeight: i === idx ? 600 : 500
          }}>{s.l}</div>
          </div>
          {i < steps.length - 1 && <div className="apply-step-line" style={{
          background: i < idx ? tone : 'var(--line)'
        }} />}
        </React.Fragment>
      )}
    </div>);

}

function FeField({ label, required, hint, hintInline, children, stack }) {
  return (
    <div className={'apply-field ' + (stack ? 'stack' : '')}>
      <div className="apply-field-l" style={hint && hintInline ? { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 } : undefined}>
        <span>{label}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}</span>
        {hint && <span className="apply-field-h" style={hintInline ? { marginLeft: 'auto', textAlign: 'right' } : undefined}>{hint}</span>}
      </div>
      {children}
    </div>);

}

window.FrontendModule = FrontendModule;