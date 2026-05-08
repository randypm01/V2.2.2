// 网站前台 — Indian-style dark recruit card + Apply modal (with EN/CN toggle)
const FE_UI = window.UI;

const FE_I18N = {
  en: {
    // Card
    tag: 'PARTNER PROGRAM · NOW RECRUITING',
    title_a: 'Become a ', title_b: 'BEANS', title_c: ' Pro Affiliate',
    lead: 'Turn your traffic into INR. Weekly payouts, dedicated manager.',
    lead_inr: 'INR',
    feat_1_l: 'High CPA',     feat_1_h: 'Up to ₹2,000 / FTD',
    feat_2_l: 'Rev Share',    feat_2_h: 'Lifetime · 45%',
    feat_3_l: '1V1 Manager',  feat_3_h: 'Hindi · English',
    btn_talk: 'Talk to Manager',
    btn_apply: 'Apply Now',
    toast_call: 'Connecting you to a BEANS manager…',
    state_label: 'Status:', state_view: 'View ›',
    // Modal
    m_title: 'Pro Affiliate Application',
    m_subtitle: ['Reviewed by our risk team within 1-3 business days'],
    m_warn: 'False information will result in a permanent ban.',
    m_cancel: 'Cancel', m_submit: 'Submit',
    m_current: 'Current status',
    // Alerts
    a_rej_t: 'Application rejected',
    a_rej_d: 'Information incomplete or conflicts with an existing affiliate. Please review and reapply.',
    a_sup_t: 'Additional documents required',
    a_sup_d: 'Please upload a clearer selfie holding your ID. Resubmit within 3 business days.',
    a_pas_t: 'Application approved 🎉',
    a_pas_d: 'Welcome to BEANS Pro. Login credentials sent via SMS — please update your password immediately.',
    // Fields
    f_name: 'Full Name',         f_name_p: 'As shown on your government ID',
    f_contact: 'Contact',        f_contact_h: 'Mobile / Telegram / WhatsApp',
    f_contact_p: '+91 98xxx xxxxx or @your_telegram',
    f_region: 'Region',          f_region_p: 'Select region …',
    f_referrer: 'Referrer (Upline ID)', f_referrer_h: 'Optional — auto-assigned if blank',
    f_referrer_p: 'e.g. AG10042',
    f_tier: 'Affiliate Tier',    f_tier_h: 'Reviewer may adjust the final tier',
    tier_normal_l: 'Individual Affiliate',  tier_normal_d: ['Suitable for personal promotion', '1,000+ social media followers'],
    tier_general_l: 'Team Affiliate',         tier_general_d: ['Suitable for team streamers', '100,000+ social media followers'],
    tier_super_l: 'Master Agent',             tier_super_d: ['Large-scale traffic resources', 'Can recruit sub-affiliates'],
    f_kyc: 'KYC Documents',      f_kyc_h: 'Aadhaar / PAN / Passport · JPG or PNG · ≤ 5MB each',
    kyc_front: 'ID Front', kyc_back: 'ID Back', kyc_selfie: 'Selfie with ID',
    upload_done: 'Uploaded · click to remove', upload_idle: 'Click to upload',
    f_why: 'Why you / Your channels',
    f_why_h: 'e.g. Telegram channel 50k subs, IPL Tiktok page, regional cricket forum…',
    f_why_p: 'Describe your traffic sources, expected monthly FTDs, and how you plan to promote BEANS …',
    // Region options
    regions: ['India — North','India — South','India — East','India — West','India — Central / NE','Bangladesh','Nepal','Sri Lanka','Other'],
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
    s_idle: 'Pending', s_review: 'Under review', s_sup: 'Docs requested', s_fail: 'Rejected', s_pass: 'Approved',
    s_result: 'Result',
  },
  zh: {
    tag: '专业代理招募计画 · 招募中',
    title_a: '加入 ', title_b: 'BEANS', title_c: ' 专业代理',
    lead: '将你的流量变成现金。每周结算,专属客户经理。',
    lead_inr: '现金',
    feat_1_l: '高佣金',    feat_1_h: '高达 ₹2,000 / FTD',
    feat_2_l: '高分润',    feat_2_h: '终身 · 45%',
    feat_3_l: '1V1 服务',  feat_3_h: '中英双语',
    btn_talk: '联系专员',
    btn_apply: '申请代理',
    toast_call: '已为您接入专属客服 …',
    state_label: '当前进度:', state_view: '查看详情 ›',
    m_title: '专业代理申请',
    m_subtitle: ['提交申请后 1-3 个工作日内审核完成'],
    m_warn: '请确保提交的资料真实有效,虚假信息将被永久封禁',
    m_cancel: '取消', m_submit: '提交申请',
    m_current: '当前进度',
    a_rej_t: '申请未通过',
    a_rej_d: '资料不完整或与现有代理体系存在冲突,请核对后重新提交。',
    a_sup_t: '需要补件',
    a_sup_d: '请补充清晰的手持身份证照片(需露出五官与证件号),3 个工作日内重新提交。',
    a_pas_t: '申请已通过 🎉',
    a_pas_d: '我们已为您开通专业代理后台,登录账号已通过短信发送,请尽快登录修改初始密码。',
    f_name: '申请人姓名',   f_name_p: '真实姓名(与证件一致)',
    f_contact: '联系方式',  f_contact_h: '手机 / Telegram / WhatsApp',
    f_contact_p: '如 +91 98xxx xxxxx 或 @telegram_id',
    f_region: '所在地区',   f_region_p: '请选择 …',
    f_referrer: '推荐人(上级代理 ID)', f_referrer_h: '选填,留空将由系统分配',
    f_referrer_p: '如 AG10042',
    f_tier: '申请等级',     f_tier_h: '审核员可根据资源调整最终等级',
    tier_normal_l: '个人代理',  tier_normal_d: ['适合个人推广', '社交媒体有1000+的用户关注'],
    tier_general_l: '团队代理', tier_general_d: ['适合有团队的主播', '社交媒体有100,000+的用户关注'],
    tier_super_l: '总代理',       tier_super_d: ['适合有大量的引流资源', '可发展下级专业代理'],
    f_kyc: 'KYC 证件',      f_kyc_h: 'Aadhaar / PAN / 护照 · JPG / PNG · 单张 ≤ 5MB',
    kyc_front: '证件正面', kyc_back: '证件反面', kyc_selfie: '手持证件照',
    upload_done: '已上传 · 点击移除', upload_idle: '点击上传',
    f_why: '申请理由 / 推广渠道说明',
    f_why_h: '例:Telegram 5w 粉丝群、IPL Tiktok 页面、本地板球论坛 …',
    f_why_p: '请描述您的资源情况、预计每月新增玩家数、主要推广渠道与方式 …',
    regions: ['印度 — 北部','印度 — 南部','印度 — 东部','印度 — 西部','印度 — 中部 / 东北','孟加拉','尼泊尔','斯里兰卡','其他'],
    admin_head: '审核员视角(后台 Demo)',
    admin_hint: '切换状态查看不同进度展示',
    btn_review: '审核中', btn_approve: '通过',
    btn_reqdoc: '要求补件', btn_reject: '拒绝(填原因)', btn_reset: '重置',
    prompt_sup: '请填写补件说明:',
    prompt_rej: '请填写拒绝原因:',
    toast_review: '已置为「审核中」',
    toast_approve: '已通过申请',
    toast_supplement: '已要求补件',
    toast_reject: '已拒绝申请',
    toast_submit: '申请已提交,审核中…',
    s_idle: '待申请', s_review: '审核中', s_sup: '要求补件', s_fail: '申请失败', s_pass: '已通过',
    s_result: '审核结果',
  },
};

function FrontendModule() {
  const toast = FE_UI.useToast();
  const [showApply, setShowApply] = React.useState(false);
  const [lang, setLang] = React.useState('en');
  const t = FE_I18N[lang];

  const [applyState, setApplyState] = React.useState('idle');
  const [failReason, setFailReason] = React.useState('');

  const [form, setForm] = React.useState({
    name: '', contact: '', region: '', referrer: '',
    level: 'normal', reason: '', channels: '',
    idFront: null, idBack: null, selfie: null,
  });
  const setField = (k, v) => setForm(f => ({...f, [k]: v}));

  return (
    <div className="fe-shell">
      <FeMandalaBg/>
      <div className="fe-recruit-wrap">
        <div className="fe-recruit-card">
          <FeMandalaCorner/>

          <div className="fe-recruit-tag">
            <span className="dot"/> {t.tag}
          </div>

          <h2 className="fe-recruit-title">
            {t.title_a}<span>{t.title_b}</span>{t.title_c}
          </h2>

          <p className="fe-recruit-lead">
            {t.lead.replace(t.lead_inr, '__INR__').split('__INR__').map((s,i)=>
              i === 0 ? s : <React.Fragment key={i}><b>{t.lead_inr}</b>{s}</React.Fragment>
            )}
          </p>

          <div className="fe-recruit-feats">
            {[
              {ico:'pie',     l:t.feat_1_l, h:t.feat_1_h},
              {ico:'refresh', l:t.feat_2_l, h:t.feat_2_h},
              {ico:'users',   l:t.feat_3_l, h:t.feat_3_h},
            ].map((f,i)=>(
              <div key={i} className="fe-recruit-feat">
                <div className="fe-recruit-feat-ico"><Icon name={f.ico} size={16}/></div>
                <div>
                  <div className="ft-l">{f.l}</div>
                  <div className="ft-h">{f.h}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="fe-recruit-actions">
            <button className="fe-recruit-btn ghost" onClick={()=>toast(t.toast_call,'info')}>
              <Icon name="phone" size={14}/> {t.btn_talk}
            </button>
            <button className="fe-recruit-btn primary" onClick={()=>setShowApply(true)}>
              {t.btn_apply} <Icon name="chevronRight" size={14}/>
            </button>
          </div>

          </div>

        {/* 卡片下方语言切换 */}
        <FeLangSwitch lang={lang} setLang={setLang} placement="card"/>
      </div>

      {/* ============ Affiliate Application Modal (手机定制) ============ */}
      {showApply && (
      <div className="modal-mask" onClick={()=>setShowApply(false)}>
        <div className="apply-mobile-modal" onClick={e=>e.stopPropagation()}>
          {/* 审核员 Demo (置顶) */}
          <div className="apply-admin top">
            <div className="apply-admin-head">
              <Icon name="shield" size={13}/>
              <span>{t.admin_head}</span>
            </div>
            <div className="apply-admin-hint">{t.admin_hint}</div>
            <div className="apply-admin-actions">
              <button className="btn" onClick={()=>{ setApplyState('reviewing'); toast(t.toast_review,'info'); }}>
                <Icon name="history" size={12}/> {t.btn_review}
              </button>
              <button className="btn" style={{borderColor:'#22c55e',color:'#15803d'}} onClick={()=>{ setApplyState('passed'); setFailReason(''); toast(t.toast_approve,'success'); }}>
                <Icon name="check" size={12}/> {t.btn_approve}
              </button>
              <button className="btn" style={{borderColor:'#f59e0b',color:'#b45309'}} onClick={()=>{ const r = window.prompt(t.prompt_sup, t.a_sup_d); if (r === null) return; setFailReason(r); setApplyState('supplement'); toast(t.toast_supplement,'info'); }}>
                <Icon name="edit" size={12}/> {t.btn_reqdoc}
              </button>
              <button className="btn danger" onClick={()=>{ const r = window.prompt(t.prompt_rej, t.a_rej_d); if (r === null) return; setFailReason(r); setApplyState('failed'); toast(t.toast_reject,'danger'); }}>
                <Icon name="x" size={12}/> {t.btn_reject}
              </button>
              <button className="btn ghost sm" onClick={()=>{ setApplyState('idle'); setFailReason(''); }}>{t.btn_reset}</button>
            </div>
          </div>

          {/* 主弹窗 */}
          <div className="apply-mobile-body">
            <div className="apply-mobile-head">
              <h3>{t.m_title}</h3>
              <button className="close" onClick={()=>setShowApply(false)}><Icon name="x" size={16}/></button>
            </div>
            <ul className="apply-mobile-sub">
              {(Array.isArray(t.m_subtitle) ? t.m_subtitle : [t.m_subtitle]).map((s,i)=><li key={i}>{s}</li>)}
            </ul>

            <div className="apply-state-bar">
              <span className="apply-state-label">{t.m_current}</span>
              <FeStatePill state={applyState} t={t} large/>
            </div>

        {applyState === 'failed' && (
          <div className="apply-alert danger">
            <Icon name="alert" size={14}/>
            <div>
              <b>{t.a_rej_t}</b>
              <div style={{marginTop:4,color:'var(--text-2)',fontSize:12.5,lineHeight:1.6}}>
                {failReason || t.a_rej_d}
              </div>
            </div>
          </div>
        )}
        {applyState === 'supplement' && (
          <div className="apply-alert warning">
            <Icon name="alert" size={14}/>
            <div>
              <b>{t.a_sup_t}</b>
              <div style={{marginTop:4,color:'var(--text-2)',fontSize:12.5,lineHeight:1.6}}>
                {failReason || t.a_sup_d}
              </div>
            </div>
          </div>
        )}
        {applyState === 'passed' && (
          <div className="apply-alert success">
            <Icon name="check" size={14}/>
            <div>
              <b>{t.a_pas_t}</b>
              <div style={{marginTop:4,color:'var(--text-2)',fontSize:12.5,lineHeight:1.6}}>
                {t.a_pas_d}
              </div>
            </div>
          </div>
        )}

        <div className="apply-form">
          <div className="apply-row">
            <FeField label={t.f_name} required>
              <input className="input" placeholder={t.f_name_p}
                value={form.name} onChange={e=>setField('name', e.target.value)}/>
            </FeField>
            <FeField label={t.f_contact} required hint={t.f_contact_h}>
              <input className="input" placeholder={t.f_contact_p}
                value={form.contact} onChange={e=>setField('contact', e.target.value)}/>
            </FeField>
          </div>

          <div className="apply-row">
            <FeField label={t.f_region} required>
              <select className="select" value={form.region} onChange={e=>setField('region', e.target.value)}>
                <option value="">{t.f_region_p}</option>
                {t.regions.map((r,i)=><option key={i}>{r}</option>)}
              </select>
            </FeField>
            <FeField label={t.f_referrer} hint={t.f_referrer_h}>
              <input className="input" placeholder={t.f_referrer_p}
                value={form.referrer} onChange={e=>setField('referrer', e.target.value)}/>
            </FeField>
          </div>

          <FeField label={t.f_tier} required hint={t.f_tier_h}>
            <div className="apply-radio-group">
              {[
                {v:'normal',  l:t.tier_normal_l,  d:t.tier_normal_d},
                {v:'general', l:t.tier_general_l, d:t.tier_general_d},
                {v:'super',   l:t.tier_super_l,   d:t.tier_super_d},
              ].map(opt => (
                <div key={opt.v}
                  className={'apply-radio ' + (form.level===opt.v?'active':'')}
                  onClick={()=>setField('level', opt.v)}>
                  <div className="apply-radio-dot"/>
                  <div>
                    <div className="apply-radio-l">{opt.l}</div>
                    <ul className="apply-radio-d">
                      {(Array.isArray(opt.d) ? opt.d : [opt.d]).map((s,i)=><li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </FeField>

          <FeField label={t.f_kyc} required hint={t.f_kyc_h}>
            <div className="apply-uploads">
              {[
                {k:'idFront', l:t.kyc_front,  icon:'image'},
                {k:'idBack',  l:t.kyc_back,   icon:'image'},
                {k:'selfie',  l:t.kyc_selfie, icon:'user'},
              ].map(u => (
                <div key={u.k}
                  className={'apply-upload ' + (form[u.k]?'filled':'')}
                  onClick={()=>setField(u.k, form[u.k] ? null : 'mock-' + u.k + '.jpg')}>
                  <Icon name={form[u.k]?'check':u.icon} size={20}/>
                  <div className="apply-upload-l">{u.l}</div>
                  <div className="apply-upload-h">
                    {form[u.k] ? t.upload_done : t.upload_idle}
                  </div>
                </div>
              ))}
            </div>
          </FeField>

          <FeField label={t.f_why} required hint={t.f_why_h} stack>
            <div className="apply-textarea-wrap">
              <textarea className="textarea apply-textarea" rows={3}
                maxLength={500}
                placeholder={t.f_why_p}
                value={form.reason}
                onInput={e=>{ e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight, 320)+'px'; }}
                onChange={e=>setField('reason', e.target.value.slice(0,500))}/>
              <div className="apply-textarea-count">{(form.reason||'').length}/500</div>
            </div>
          </FeField>
        </div>

            <div className="apply-mobile-warn">
              <Icon name="alert" size={12}/>
              <span>{t.m_warn}</span>
            </div>

            <div className="apply-mobile-foot">
              <button className="btn" onClick={()=>setShowApply(false)}>{t.m_cancel}</button>
              <button className="btn primary" onClick={()=>{ setApplyState('reviewing'); toast(t.toast_submit,'success'); }}>
                <Icon name="upload" size={13}/> {t.m_submit}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

// ── 中英文切换 ──
function FeLangSwitch({ lang, setLang, placement }) {
  return (
    <div className={'fe-lang-switch ' + (placement || '')}>
      <Icon name="globe" size={12}/>
      <button
        className={lang === 'en' ? 'active' : ''}
        onClick={()=>setLang('en')}>EN</button>
      <span className="fe-lang-div"/>
      <button
        className={lang === 'zh' ? 'active' : ''}
        onClick={()=>setLang('zh')}>中文</button>
    </div>
  );
}

// ── 印度风曼陀罗背景 ──
function FeMandalaBg() {
  return (
    <svg className="fe-mandala-bg" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="feBgG" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor="#FFB300" stopOpacity=".10"/>
          <stop offset="1" stopColor="#FFB300" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="400" cy="400" r="380" fill="url(#feBgG)"/>
      {[...Array(16)].map((_,i)=>{
        const a = (i*22.5)*Math.PI/180;
        return <line key={i}
          x1={400} y1={400}
          x2={400+Math.cos(a)*380} y2={400+Math.sin(a)*380}
          stroke="rgba(255,179,0,.10)" strokeWidth="1"/>;
      })}
      {[60,120,180,240,320].map((r,i)=>(
        <circle key={i} cx="400" cy="400" r={r}
          fill="none" stroke="rgba(255,179,0,.14)" strokeWidth=".8" strokeDasharray={i%2?"3 4":"1 6"}/>
      ))}
    </svg>
  );
}

// ── 卡片角落小曼陀罗 ──
function FeMandalaCorner() {
  return (
    <svg className="fe-mandala-corner" viewBox="0 0 120 120" aria-hidden="true">
      {[...Array(12)].map((_,i)=>{
        const a = (i*30)*Math.PI/180;
        return <line key={i}
          x1={60} y1={60}
          x2={60+Math.cos(a)*60} y2={60+Math.sin(a)*60}
          stroke="#FFD86E" strokeOpacity=".35" strokeWidth=".8"/>;
      })}
      {[24,40,55].map((r,i)=>(
        <circle key={i} cx="60" cy="60" r={r}
          fill="none" stroke="#FFD86E" strokeOpacity={.2 + i*.1} strokeWidth=".8"/>
      ))}
      {[...Array(8)].map((_,i)=>{
        const a = (i*45)*Math.PI/180;
        const x = 60 + Math.cos(a)*32, y = 60 + Math.sin(a)*32;
        return <ellipse key={i} cx={x} cy={y} rx="6" ry="3"
          transform={`rotate(${i*45} ${x} ${y})`}
          fill="none" stroke="#FFD86E" strokeOpacity=".4" strokeWidth=".8"/>;
      })}
    </svg>
  );
}

function FeStatePill({ state, large, t }) {
  const map = {
    idle:       { l: t ? t.s_idle   : 'Pending',        c:'#64748b', bg:'#f1f5f9' },
    reviewing:  { l: t ? t.s_review : 'Under review',   c:'#0e7490', bg:'rgba(6,182,212,.14)' },
    supplement: { l: t ? t.s_sup    : 'Docs requested', c:'#b45309', bg:'rgba(245,158,11,.16)' },
    failed:     { l: t ? t.s_fail   : 'Rejected',       c:'#b91c1c', bg:'rgba(239,68,68,.14)' },
    passed:     { l: t ? t.s_pass   : 'Approved',       c:'#15803d', bg:'rgba(34,197,94,.14)' },
  };
  const s = map[state] || map.idle;
  return (
    <span style={{
      display:'inline-flex',alignItems:'center',gap:6,
      padding: large ? '5px 12px' : '2px 8px',
      borderRadius: large ? 6 : 10,
      background: s.bg, color: s.c,
      fontSize: large ? 13 : 11.5, fontWeight: 600,
    }}>
      <span style={{width:6,height:6,borderRadius:'50%',background:s.c}}/>
      {s.l}
    </span>
  );
}

function FeStateStepper({ state, t }) {
  const last = state==='failed' ? (t?t.s_fail:'Rejected')
             : state==='supplement' ? (t?t.s_sup:'Docs requested')
             : state==='passed' ? (t?t.s_pass:'Approved')
             : (t?t.s_result:'Result');
  const steps = [
    { l: t ? t.s_idle : 'Pending' },
    { l: t ? t.s_review : 'Under review' },
    { l: last },
  ];
  const idx = state==='idle' ? 0 : state==='reviewing' ? 1 : 2;
  const tone = state==='failed' ? '#ef4444' : state==='supplement' ? '#f59e0b' : state==='passed' ? '#22c55e' : 'var(--brand)';
  return (
    <div className="apply-stepper">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="apply-step">
            <div className="apply-step-dot" style={{
              background: i <= idx ? tone : 'var(--bg-3)',
              color: i <= idx ? '#fff' : 'var(--text-3)',
              borderColor: i <= idx ? tone : 'var(--line)',
            }}>
              {i < idx ? <Icon name="check" size={10}/> : (i+1)}
            </div>
            <div className="apply-step-l" style={{
              color: i <= idx ? 'var(--text-0)' : 'var(--text-3)',
              fontWeight: i === idx ? 600 : 500,
            }}>{s.l}</div>
          </div>
          {i < steps.length-1 && <div className="apply-step-line" style={{
            background: i < idx ? tone : 'var(--line)'
          }}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

function FeField({ label, required, hint, children, stack }) {
  return (
    <div className={'apply-field ' + (stack ? 'stack' : '')}>
      <div className="apply-field-l">
        <span>{label}{required && <span style={{color:'#ef4444',marginLeft:3}}>*</span>}</span>
        {hint && <span className="apply-field-h">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

window.FrontendModule = FrontendModule;
