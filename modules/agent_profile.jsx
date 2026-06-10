// 代理后台 - 我的账户 P0-13
const PFUI = window.UI;

function AgentProfileModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const toast = PFUI.useToast();
  const me = window.useCurrentAgent();
  const [lang] = window.useAgentLang();
  const T = (k, fb) => window.t(k, fb);
  const [tab, setTab] = React.useState(() => {
    // v3.4.2 支持外部跳转预设初始 tab(如申请提款弹窗「编辑收款方式」跳来 → payment)
    const want = window.__AGENT_PROFILE_TAB;
    if (want) { window.__AGENT_PROFILE_TAB = null; return want; }
    return 'basic';
  });
  const [showPwd, setShowPwd] = React.useState(false);
  // v3.2.3 帐户被冻结时,「收款方式 → 编辑」和「安全设置 → 修改密码」改弹「帐户已被冻结」提示
  const [showFrozen, setShowFrozen] = React.useState(false);
  const [showSuspended, setShowSuspended] = React.useState(false);
  const isFrozen = me.status === 'frozen';
  const isSuspended = me.status === 'suspended';
  // v3.2.1 收款方式 tab 编辑态 + draft(与商户后台同步)
  const [payEditing, setPayEditing] = React.useState(false);
  const [payDraft, setPayDraft] = React.useState(null);

  // v3.1.11 從代理對象讀:分潤模式 / 權限 / 流量來源 / 收款方式
  // _comm 由商戶創建時烘入(agents.jsx v2.4.47);未烘入時給默認示例(週期資產變動分潤)
  const comm = me._comm || { kind:'weekly', weekday:1, monthday:1, plans:['revenue:RV-002'] };
  // v3.1.90 _perms 新 schema 与 agents.jsx(myAccount/codeManage/codeLimit/reportCode/reportPlayer/reportRevshare)对齐
  const perms = me._perms || {
    myAccount: true, codeManage: true, codeLimit: 20,
    reportCode: true, reportPlayer: true, reportRevshare: true,
  };
  // 流量來源 / 收款方式 從 _appData._formSnapshot 讀;預設用 me.name 生成 2 個示例(与商户后台「查看&配置」fallback 一致)
  // v3.1.91 优先读 me._traffic(商户后台烘入);其次 _formSnapshot.trafficUrls;最后才生成默认
  const snap = me._appData?._formSnapshot || {};
  const trafficUrls = (() => {
    if (me._traffic && me._traffic.length) {
      const cleaned = me._traffic.filter(Boolean);
      if (cleaned.length) return cleaned;
    }
    if (snap.trafficUrls && snap.trafficUrls.length) {
      const cleaned = snap.trafficUrls.filter(Boolean);
      if (cleaned.length) return cleaned;
    }
    const slug = (me.name || 'agent').toLowerCase().replace(/\s/g,'');
    return [
      'https://youtube.com/@' + slug,
      'https://t.me/' + slug + '_channel',
    ];
  })();
  // v3.1.12 收款方式 字段按截图扩展:method / IFSC / Account / Real Name / Email
  // v3.1.80 Email 仅取 payEmail / _payment.email,不再 fallback 到 联系方式 Email
  // v3.1.90 优先从 me._payment(商户后台烘入)读,其次 _formSnapshot 新 schema(ifsc/account/realName/payEmail)
  const payment = {
    method:   me._payment?.method   || snap.payMethod || 'UPI',
    ifsc:     me._payment?.ifsc     || snap.ifsc      || '',
    account:  me._payment?.account  || snap.account   || '',
    realName: me._payment?.realName || snap.realName  || snap.holder  || me.name || '',
    email:    me._payment?.email    || snap.payEmail  || '',
  };

  // v3.2.4 被停用 → 弹「帐户已停用」 点「我知道了」自动登出
  // v3.2.3 若帐户已被冻结,改弹「帐户已被冻结」提示
  const startEditPayment = () => {
    if (isSuspended) { setShowSuspended(true); return; }
    if (isFrozen) { setShowFrozen(true); return; }
    setPayDraft({...payment}); setPayEditing(true);
  };
  // 取消：清 draft + 退出编辑态
  const cancelEditPayment = () => { setPayDraft(null); setPayEditing(false); };
  // 保存：写回 APS_MERCHANT_AGENTS_STORE.list、追加一条操作日志，让商户后台「查看&配置」同步看到
  const savePayment = () => {
    if (!payDraft) return;
    const nowStr = new Date().toISOString().slice(0,19).replace('T',' ');
    const log = { at: nowStr, by: '代理:' + (me.name || me.id), type: 'edit', note: '代理自助修改:收款方式' };
    if (window.APS_MERCHANT_AGENTS_STORE && window.APS_MERCHANT_AGENTS_STORE.setList) {
      window.APS_MERCHANT_AGENTS_STORE.setList(list =>
        list.map(x => {
          if (x.id !== me.id) return x;
          return {
            ...x,
            _payment: { ...payDraft },
            _logs: [...(x._logs || []), log],
          };
        })
      );
    }
    toast(T('mp_prof.payment.saved','收款方式已保存'));
    setPayEditing(false);
    setPayDraft(null);
  };

  return (
    <div className="page">
      <PFUI.PageHead title={T('page.my_profile.title','我的账户')} subtitle={T('page.my_profile.sub','查看您的个人资料、合作方案、安全设置')}/>

      <div className="card">
        <PFUI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'basic',      label: T('mp_prof.tab.basic','基本资料')},
          {key:'commission', label: T('mp_prof.tab.commission','分润模式')},
          {key:'perms',      label: T('mp_prof.tab.perms','权限配置')},
          {key:'traffic',    label: T('mp_prof.tab.traffic','流量来源')},
          {key:'payment',    label: T('mp_prof.tab.payment','收款方式')},
          {key:'security',   label: T('mp_prof.tab.security','安全设置')},
        ]}/>

        {tab === 'basic' && (() => {
          // v3.1.8 字段与商户后台「查看&审核」弹窗的「基本资料」一致:
          //   代理创建方式 / 代理ID / 代理名称 / 登入帐号 / 登入密码 / 上级代理 / 创建时间 / 联系方式 / 备注
          //   不再显示「代理类型 / 帐户状态 / 申请理由」,也不再显示顶部「同步说明」蓝条
          const D = window.APS_DATA;
          const isApplied = (me._createWay || '') === '自行申请代理';
          const displayId = me._displayId || me.id;
          const createdRaw = isApplied
            ? (me._appData?.appliedAt || '2026-05-11 23:59:59')
            : me.created;
          const createdFmt = (() => {
            if (!createdRaw) return '—';
            const d = new Date(createdRaw);
            if (isNaN(d.getTime())) return String(createdRaw);
            return d.toISOString().slice(0,10) + ' ' + d.toTimeString().slice(0,8);
          })();
          const loginName = me._appData?.loginName || (me.name||'').replace(/[^A-Za-z]/g,'').toLowerCase() || 'agent';
          const parentLabel = me.parent
            ? me.parent + '-' + (D.agents.find(x=>x.id===me.parent)?.name || 'Agent')
            : 'AG000000-' + T('mp_prof.basic.parent.self','本商户');

          // 联系方式 — 与商户弹窗一致:从 _appData.contacts 逐项渲染(filter value)
          // 若代理没有 _appData(商户创建),给一组默认示例
          const contacts = (me._appData?.contacts && me._appData.contacts.length > 0)
            ? me._appData.contacts
            : [
                { type:'Email',    value: me.email || '' },
                { type:'手机',     dial:'+91', value: '' },
                { type:'Telegram', value: '' },
              ];
          const filledContacts = contacts.filter(c => c.value);

          return (
            <div className="mp-tab-body" style={{padding:'18px 22px 96px'}}>
              {/* 基本资料 — 与商户后台「查看&审核」弹窗布局一致(每行一列字段,左标签 右值) */}
              <div className="ad-section-title">{T('mp_prof.basic.title','基本资料')}</div>
              <div className="ad-info-card">
                <div className="ad-info-grid" style={{gridTemplateColumns:'1fr'}}>
                  <div><span className="ad-k">{T('mp_prof.basic.createWay','代理创建方式')}:</span><span className="ad-v">{
                    (me._createWay === '代理后台自行申请' || me._createWay === '自行申请代理')
                      ? T('mp_prof.basic.createWay.self','代理后台自行申请')
                      : T('mp_prof.basic.createWay.merchant','商户创建代理')
                  }</span></div>
                  <div><span className="ad-k">{T('mp_prof.basic.id','代理ID')}:</span><span className="ad-v text-mono">{displayId}</span></div>
                  <div><span className="ad-k">{T('mp_prof.basic.name','代理名称')}:</span><span className="ad-v">{me.name}</span></div>
                  <div><span className="ad-k">{T('mp_prof.basic.loginName','登入帐号')}:</span><span className="ad-v text-mono">{loginName}</span></div>
                  <div><span className="ad-k">{T('mp_prof.basic.password','登入密码')}:</span><span className="ad-v text-mono">••••••••</span></div>
                  <div><span className="ad-k">{T('mp_prof.basic.parent','上级代理')}:</span><span className="ad-v text-mono">{parentLabel}</span></div>
                  <div><span className="ad-k">{T('mp_prof.basic.created','创建时间')}:</span><span className="ad-v text-mono">{createdFmt}</span></div>
                </div>
              </div>

              {/* v3.1.15 帐户状态行 — 代理后台用户不可自行冻结/停用,只显示状态 pill */}
              <div className="ad-status-row">
                <div>
                  <span className="ad-k">{T('mp_prof.basic.status','帐户状态')}:</span>
                  <span style={{
                    marginLeft:4,
                    display:'inline-block',padding:'2px 10px',borderRadius:99,
                    fontSize:12,fontWeight:600,
                    background:'#dcfce7',color:'#15803d',border:'1px solid #86efac',
                  }}>{T('mp_prof.basic.status.active','已启用')}</span>
                </div>
              </div>

              <div className="ad-section-title mt-4">{T('mp_prof.basic.contacts','联系方式')}</div>
              <table className="ad-contact-tbl">
                <thead><tr><th style={{width:140}}>{T('mp_prof.basic.contact.type','联系类型')}</th><th>{T('mp_prof.basic.contact.value','联系资料')}</th></tr></thead>
                <tbody>
                  {filledContacts.length > 0
                    ? filledContacts.map((c, i) => (
                        <tr key={i}>
                          <td>{(c.type === 'Mobile' || c.type === '手机') ? T('mp_prof.contact.phone','手机') : c.type}</td>
                          <td className="text-mono">
                            {(c.type === 'Mobile' || c.type === '手机' || c.type === 'WhatsApp')
                              ? `${c.dial || '+91'} ${c.value}`
                              : c.value}
                          </td>
                        </tr>
                      ))
                    : <tr><td colSpan={2} style={{color:'var(--text-3)',textAlign:'center',padding:'16px'}}>—</td></tr>}
                </tbody>
              </table>
            </div>
          );
        })()}

        {tab === 'commission' && (() => {
          const v = comm || { kind:'weekly', plans:[], minCommission:200, maxCommission:'' };
          const D = window.RV_PLATFORM_DEFAULTS || { currency:'INR', symbol:'₹', minSettleAmount:200 };
          const planVal = (v.plans && v.plans[0]) || '';
          const detail = planVal ? window.resolvePlan(planVal) : null;
          const ratio = detail?.plan?.ratio;
          // v3.1.95 EN 模式下:方案名 + 計算口徑流程 全部走 i18n key,中文不动
          const isPeriodPlan = detail?.plan?.type === 'period';
          const planLabel = isPeriodPlan
            ? T('rv.plan.period', detail?.typeLabel || detail?.modeLabel || '—')
            : (detail?.typeLabel || detail?.modeLabel || '—');
          const formula = isPeriodPlan
            ? T('rv.formula.period', detail?.formula || '')
            : (detail?.formula || '');
          const cycleText = v.kind === 'weekly'
            ? T('mp_prof.comm.cycle.weekly','每周結算 · 每周一 00:00:00,結算上周一 00:00:00 ~ 周日 23:59:59')
            : T('mp_prof.comm.cycle.monthly','每月結算 · 每月1號 00:00:00,結算上月1號 00:00:00 ~ 月底 23:59:59');
          const minComm = v.minCommission != null && v.minCommission !== '' ? v.minCommission : D.minSettleAmount;
          const maxComm = v.maxCommission != null && v.maxCommission !== '' ? v.maxCommission : 1000000;
          const fmtMoney = (n) => `${D.symbol}${Number(n).toLocaleString()}`;

          const Row = ({ k, children }) => (
            <div className="mp-comm-row" style={{display:'flex',alignItems:'baseline',padding:'8px 0',fontSize:13.5,lineHeight:1.7}}>
              <div className="mp-comm-k" style={{width:160,flexShrink:0,color:'var(--text-2)'}}>{k}</div>
              <div className="mp-comm-v" style={{flex:1,color:'var(--text-0)'}}>{children}</div>
            </div>
          );

          return (
            <div className="mp-tab-body" style={{padding:'18px 22px 96px'}}>
              {/* v3.2.72 分潤方案 结算/变更规则说明弹窗 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
                <PFUI.FormulaHelp
                  buttonLabel={lang === 'en' ? 'Settlement & change rules' : '结算 / 变更规则'}
                  title={lang === 'en' ? 'Revenue Share Plan' : '分润方案说明'}
                  subtitle={lang === 'en' ? 'Plan settlement & change rules' : '分润方案结算与变更规则'}
                  sections={window.buildRevsharePlanRules(lang === 'en')} />
              </div>
              {/* —— 平台结算配置 —— */}
              <Row k={T('mp_prof.comm.cycle','結算周期')}>{cycleText}</Row>
              <Row k={T('mp_prof.comm.currency','結算幣種')}><b style={{fontWeight:500}}>{D.currency} ({D.symbol})</b></Row>
              <Row k={T('mp_prof.comm.minAmt','最低結算佣金金額')}><b style={{fontWeight:500}}>{fmtMoney(minComm)}</b> <span style={{color:'var(--text-3)',fontSize:12.5,marginLeft:4}}>{T('mp_prof.comm.minAmt.hint','(低于该金额顺延至下期)')}</span></Row>
              <Row k={T('mp_prof.comm.maxAmt','最高結算佣金上限')}><b style={{fontWeight:500}}>{fmtMoney(maxComm)}</b></Row>

              <div style={{height:1,background:'var(--line-soft)',margin:'14px 0'}}/>

              {/* —— 分润方案 —— */}
              <Row k={T('mp_prof.comm.plan','分潤方案')}>{planLabel}</Row>
              <Row k={T('mp_prof.comm.ratio','分潤比例')}>
                <span style={{fontFamily:'JetBrains Mono',fontWeight:600,color:'var(--brand)'}}>
                  {ratio != null ? `${(ratio*100).toFixed(ratio*100 % 1 === 0 ? 0 : 2)}%` : '—'}
                </span>
              </Row>

              {/* —— 计算口径流程 —— */}
              <div style={{padding:'10px 0 4px',fontSize:13.5,color:'var(--text-2)'}}>{T('mp_prof.comm.formula','計算口徑流程')}</div>
              {formula ? (
                <pre className="mp-comm-pre" style={{
                  margin:0, padding:0,
                  fontSize:12.5, lineHeight:1.85, color:'var(--text-1)',
                  fontFamily:'inherit', whiteSpace:'pre-wrap',
                  background:'transparent', border:'none',
                }}>{formula}</pre>
              ) : (
                <div style={{fontSize:13,color:'var(--text-3)'}}>—</div>
              )}
            </div>
          );
        })()}

        {tab === 'perms' && (
          <div className="mp-tab-body" style={{padding:'18px 22px 96px'}}>
            <div className="ad-section-title">{T('mp_prof.perms.title','權限範圍')}</div>
            <div style={{border:'1px solid var(--line)',borderRadius:8,padding:'18px 22px',background:'#fff'}}>
              {/* 运营 section */}
              <div style={{fontSize:13,color:'var(--text-2)',fontWeight:500,marginBottom:10}}>{T('mp_prof.perms.sec.ops','运营')}</div>
              <div style={{display:'flex',flexDirection:'column',gap:8,paddingLeft:8}}>
                <PermRow on={!!perms.myAccount} label={T('mp_prof.perms.myAccount','我的帐户')} sub={T('mp_prof.perms.sub.view','(查看)')}/>
                <PermRow on={!!perms.codeManage} label={T('mp_prof.perms.codeManage','Code 与链接管理')} sub={T('mp_prof.perms.sub.viewEdit','(查看/编辑)')}/>
                {perms.codeManage && (
                  <div style={{display:'flex',alignItems:'center',gap:12,paddingLeft:24,paddingTop:2,paddingBottom:4}}>
                    <span style={{fontSize:13,color:'var(--text-2)'}}>{T('mp_prof.perms.codeLimit','可创建邀请 Code 上限数量')}</span>
                    <span style={{fontSize:13,color:'var(--text-0)',fontFamily:'JetBrains Mono',fontWeight:500}}>{perms.codeLimit ?? 20}</span>
                  </div>
                )}
              </div>

              <div style={{borderTop:'1px dashed var(--line-soft)',margin:'14px 0'}}/>

              {/* 报表 section */}
              <div style={{fontSize:13,color:'var(--text-2)',fontWeight:500,marginBottom:10}}>{T('mp_prof.perms.sec.reports','报表')}</div>
              <div style={{display:'flex',flexDirection:'column',gap:8,paddingLeft:8}}>
                <PermRow on={!!perms.reportCode}     label={T('mp_prof.perms.reportCode','邀请 Code 与链接管理')} sub={T('mp_prof.perms.sub.view','(查看)')}/>
                <PermRow on={!!perms.reportPlayer}   label={T('mp_prof.perms.reportPlayer','玩家损益')} sub={T('mp_prof.perms.sub.view','(查看)')}/>
                <PermRow on={!!perms.reportRevshare} label={T('mp_prof.perms.reportRevshare','分润报表')} sub={T('mp_prof.perms.sub.view','(查看)')}/>
              </div>
            </div>
          </div>
        )}

        {tab === 'traffic' && (
          <div className="mp-tab-body" style={{padding:'18px 22px 96px'}}>
            <div className="ad-section-title">{T('mp_prof.traffic.title','流量来源链接')}</div>
            <div style={{fontSize:12.5,color:'var(--text-3)',marginBottom:12}}>{T('mp_prof.traffic.sub','您推广所使用的频道、平台账号或落地页(Youtube / Tiktok / Telegram / Facebook ...)')}</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {trafficUrls.length === 0 && (
                <div style={{padding:'14px',background:'#f8fafc',border:'1px dashed var(--line)',borderRadius:8,fontSize:13,color:'var(--text-3)',textAlign:'center'}}>{T('mp_prof.traffic.empty','(未填写流量来源)')}</div>
              )}
              {trafficUrls.map((u, i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:12,color:'var(--text-3)',width:24,textAlign:'right'}}>{i+1}.</span>
                  <input className="input" value={u} readOnly
                    style={{flex:1,background:'#f8fafc',fontFamily:'JetBrains Mono'}}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'payment' && (
          <div className="mp-tab-body" style={{padding:'18px 22px 96px'}}>
            <window.PaymentInfoView
              editing={payEditing}
              value={payEditing ? payDraft : payment}
              onChange={setPayDraft}
            />
            {/* v3.2.1 编辑 / 保存 / 取消 按钮 —— 样式与商户后台查看&配置一致
                v3.2.2 不复用 .agent-detail-foot 类(它带 border-top 会多出一条线),改用同样的 flex 内联样式 */}
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:14}}>
              {!payEditing && (
                <button className="btn sm" style={{borderColor:'var(--brand)',color:'var(--brand)'}} onClick={startEditPayment}>
                  <Icon name="edit" size={12}/> {T('mp_prof.payment.edit','编辑')}
                </button>
              )}
              {payEditing && (<>
                <button className="btn sm ghost" onClick={cancelEditPayment}>{T('mp_prof.payment.cancel','取消')}</button>
                <button className="btn sm primary" onClick={savePayment}>{T('mp_prof.payment.save','保存')}</button>
              </>)}
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="mp-tab-body" style={{padding:'18px 22px 96px'}}>
            <div className="ad-section-title">{T('mp_prof.security.title','登入安全')}</div>
            <SecurityRow icon="shield" title={T('mp_prof.security.pwd','登入密码')}
              desc={T('mp_prof.security.last','上次修改时间:') + new Date(Date.now()-30*86400000).toISOString().slice(0,10) + ' ' + new Date().toTimeString().slice(0,8)}
              action={<button className="btn sm" style={{borderColor:'var(--brand)',color:'var(--brand)'}} onClick={()=>{ if (isSuspended) { setShowSuspended(true); return; } if (isFrozen) { setShowFrozen(true); return; } setShowPwd(true); }}>{T('mp_prof.security.change','修改密码')}</button>}/>
          </div>
        )}
      </div>

      {/* v3.2.3 帐户已被冻结 弹窗 */}
      <window.FrozenAccountModal
        open={showFrozen}
        onClose={()=>setShowFrozen(false)}
        agentId={me._displayId || me.id}
        loginName={me.loginName}
        reason={me.frozenReason}
      />
      {/* v3.2.4 帐户已被停用 弹窗 — 關閉時自動登出 */}
      <window.SuspendedAccountModal
        open={showSuspended}
        onClose={()=>setShowSuspended(false)}
        agentId={me._displayId || me.id}
        loginName={me.loginName}
        reason={(me._appData && me._appData.suspendReason) || me.suspendReason}
      />

      {/* 修改密码 Modal */}
      <PFUI.Modal open={showPwd} onClose={()=>setShowPwd(false)} title={T('mp_prof.pwd.modal.title','修改登录密码')}
        footer={<><button className="btn ghost" onClick={()=>setShowPwd(false)}>{T('mp_prof.pwd.modal.cancel','取消')}</button><button className="btn primary" onClick={()=>{toast(T('mp_prof.pwd.toast','密码已修改'));setShowPwd(false);}}>{T('mp_prof.pwd.modal.ok','确认修改')}</button></>}>
        <div className="form-grid" style={{gridTemplateColumns:'1fr'}}>
          <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>{T('mp_prof.pwd.modal.current','当前密码')}</label><input className="input" type="password"/></div>
          <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>{T('mp_prof.pwd.modal.new','新密码 (至少 12 位,包含大小写 + 数字 + 符号)')}</label><input className="input" type="password"/></div>
          <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>{T('mp_prof.pwd.modal.confirm','确认新密码')}</label><input className="input" type="password"/></div>
        </div>
      </PFUI.Modal>
    </div>
  );
}

function SecurityRow({ icon, title, desc, badge, action }) {
  return (
    <div className="mp-security-row" style={{padding:14,border:'1px solid var(--line)',borderRadius:8,display:'flex',alignItems:'center',gap:14}}>
      <div style={{width:36,height:36,borderRadius:6,background:'var(--bg-2)',display:'grid',placeItems:'center'}}>
        <Icon name={icon} size={18} style={{color:'var(--text-2)'}}/>
      </div>
      <div style={{flex:1}}>
        <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:3}}>
          <span style={{fontSize:13,fontWeight:600,color:'var(--text-0)'}}>{title}</span>
          {badge}
        </div>
        <div className="text-mute" style={{fontSize:11.5}}>{desc}</div>
      </div>
      {action}
    </div>
  );
}

// v3.1.11 权限行(代理后台「我的帐户 → 权限配置」只读展示用)
function PermRow({ on, label, sub }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13.5,lineHeight:1.6}}>
      {on
        ? <Icon name="check" size={14} style={{color:'#16a34a'}}/>
        : <Icon name="x" size={14} style={{color:'#dc2626'}}/>}
      <span style={{color: on?'var(--text-0)':'var(--text-3)'}}>{label}</span>
      {sub && <span style={{color:'var(--text-3)',fontSize:12.5}}>{sub}</span>}
    </div>
  );
}

window.AgentProfileModule = AgentProfileModule;
