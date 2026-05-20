// 代理后台 - 我的账户 P0-13
const PFUI = window.UI;

function AgentProfileModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const toast = PFUI.useToast();
  const me = window.useCurrentAgent();
  const [lang] = window.useAgentLang();
  const T = (k, fb) => window.t(k, fb);
  const [tab, setTab] = React.useState('basic');
  const [showPwd, setShowPwd] = React.useState(false);

  // v3.1.11 從代理對象讀:分潤模式 / 權限 / 流量來源 / 收款方式
  // _comm 由商戶創建時烘入(agents.jsx v2.4.47);未烘入時給默認示例(週期資產變動分潤)
  const comm = me._comm || { kind:'weekly', weekday:1, monthday:1, plans:['revenue:RV-002'] };
  // _perms 同上
  const perms = me._perms || {
    shareCode:true, viewRisk:false, viewPlayers:true, applyWithdraw:true,
    viewCommission:true, createSubAgent:false, useApi:false, viewSubAgent:true,
    downloadMaterial:true, viewCrossLayer:false,
  };
  // 流量來源 / 收款方式 從 _appData._formSnapshot 讀;預設用 me.name 生成 2 個示例(与商户后台「查看&配置」fallback 一致)
  const snap = me._appData?._formSnapshot || {};
  const trafficUrls = (() => {
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
  const payment = {
    method: snap.payMethod || 'UPI',
    ifsc:   snap.ifsc      || '123123',
    account:snap.account   || '123123',
    realName: snap.holder  || me._payment?.holder || me.name || 'Nick An',
    email:  snap.email     || (me._appData?.contacts?.find(c => c.type === 'Email')?.value) || me.email || '123@gmail.com',
  };

  return (
    <div className="page">
      <PFUI.PageHead title={T('page.my_profile.title','我的账户')} subtitle={T('page.my_profile.sub','基本资料 · 合作方案 · 安全设置')}>
        <button className="btn"><Icon name="download" size={13}/>下载合作协议</button>
      </PFUI.PageHead>

      <div className="card">
        <PFUI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'basic',      label:'基本资料'},
          {key:'commission', label:'分润模式'},
          {key:'perms',      label:'权限配置'},
          {key:'traffic',    label:'流量来源'},
          {key:'payment',    label:'收款方式'},
          {key:'security',   label:'安全设置'},
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
            : 'AG000000-本商户';

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
            <div style={{padding:'18px 22px'}}>
              {/* 基本资料 — 与商户后台「查看&审核」弹窗布局一致(每行一列字段,左标签 右值) */}
              <div className="ad-section-title">基本资料</div>
              <div className="ad-info-card">
                <div className="ad-info-grid" style={{gridTemplateColumns:'1fr'}}>
                  <div><span className="ad-k">代理创建方式:</span><span className="ad-v">{me._createWay || '商户创建代理'}</span></div>
                  <div><span className="ad-k">代理ID:</span><span className="ad-v text-mono">{displayId}</span></div>
                  <div><span className="ad-k">代理名称:</span><span className="ad-v">{me.name}</span></div>
                  <div><span className="ad-k">登入帐号:</span><span className="ad-v text-mono">{loginName}</span></div>
                  <div><span className="ad-k">登入密码:</span><span className="ad-v text-mono">••••••••</span></div>
                  <div><span className="ad-k">上级代理:</span><span className="ad-v text-mono">{parentLabel}</span></div>
                  <div><span className="ad-k">创建时间:</span><span className="ad-v text-mono">{createdFmt}</span></div>
                </div>
              </div>

              {/* v3.1.15 帐户状态行 — 代理后台用户不可自行冻结/停用,只显示状态 pill */}
              <div className="ad-status-row">
                <div>
                  <span className="ad-k">帐户状态:</span>
                  <span style={{
                    marginLeft:4,
                    display:'inline-block',padding:'2px 10px',borderRadius:99,
                    fontSize:12,fontWeight:600,
                    background:'#dcfce7',color:'#15803d',border:'1px solid #86efac',
                  }}>已启用</span>
                </div>
              </div>

              <div className="ad-section-title mt-4">联系方式</div>
              <table className="ad-contact-tbl">
                <thead><tr><th style={{width:140}}>联系类型</th><th>联系资料</th></tr></thead>
                <tbody>
                  {filledContacts.length > 0
                    ? filledContacts.map((c, i) => (
                        <tr key={i}>
                          <td>{c.type === 'Mobile' ? '手机' : c.type}</td>
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

        {tab === 'commission' && (
          <div style={{padding:'18px 22px'}}>
            <div className="ad-section-title">分润规则</div>
            <window.CommissionReadOnly value={comm} hideHeader={true}/>
          </div>
        )}

        {tab === 'perms' && (
          <div style={{padding:'18px 22px'}}>
            <div className="ad-section-title">权限范围</div>
            <div style={{border:'1px solid var(--line)',borderRadius:8,padding:'18px 22px',background:'#fff'}}>
              {/* 运营 section */}
              <div style={{fontSize:13,color:'var(--text-2)',fontWeight:500,marginBottom:10}}>运营</div>
              <div style={{display:'flex',flexDirection:'column',gap:8,paddingLeft:8}}>
                <PermRow on={true} label="我的帐户" sub="(查看)"/>
                <PermRow on={perms.shareCode} label="Code 与链接管理" sub="(查看/编辑)"/>
                {perms.shareCode && (
                  <div style={{display:'flex',alignItems:'center',gap:12,paddingLeft:24,paddingTop:2,paddingBottom:4}}>
                    <span style={{fontSize:13,color:'var(--text-2)'}}>可创建邀请 Code 上限数量</span>
                    <span style={{fontSize:13,color:'var(--text-0)',fontFamily:'JetBrains Mono',fontWeight:500}}>20</span>
                  </div>
                )}
              </div>

              <div style={{borderTop:'1px dashed var(--line-soft)',margin:'14px 0'}}/>

              {/* 报表 section */}
              <div style={{fontSize:13,color:'var(--text-2)',fontWeight:500,marginBottom:10}}>报表</div>
              <div style={{display:'flex',flexDirection:'column',gap:8,paddingLeft:8}}>
                <PermRow on={perms.shareCode} label="邀请 Code 与链接管理" sub="(查看)"/>
                <PermRow on={perms.viewPlayers} label="玩家损益" sub="(查看)"/>
                <PermRow on={perms.viewCommission} label="分润报表" sub="(查看)"/>
              </div>
            </div>
          </div>
        )}

        {tab === 'traffic' && (
          <div style={{padding:'18px 22px'}}>
            <div className="ad-section-title">流量来源链接</div>
            <div style={{fontSize:12.5,color:'var(--text-3)',marginBottom:12}}>您推广所使用的频道、平台账号或落地页(Youtube / Tiktok / Telegram / Facebook ...)</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {trafficUrls.length === 0 && (
                <div style={{padding:'14px',background:'#f8fafc',border:'1px dashed var(--line)',borderRadius:8,fontSize:13,color:'var(--text-3)',textAlign:'center'}}>(未填写流量来源)</div>
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
          <div style={{padding:'18px 22px'}}>
            <div className="ad-section-title">收款方式</div>
            <div className="ad-info-card">
              <div className="ad-info-grid" style={{gridTemplateColumns:'1fr'}}>
                <div><span className="ad-k">收款方式:</span><span className="ad-v">{payment.method}</span></div>
                <div><span className="ad-k">IFSC:</span><span className="ad-v text-mono">{payment.ifsc || '-'}</span></div>
                <div><span className="ad-k">Account:</span><span className="ad-v text-mono">{payment.account || '-'}</span></div>
                <div><span className="ad-k">Real Name:</span><span className="ad-v">{payment.realName || '-'}</span></div>
                <div><span className="ad-k">Email:</span><span className="ad-v text-mono">{payment.email || '-'}</span></div>
              </div>
            </div>
            <div style={{marginTop:12,padding:'10px 14px',background:'#fef3c7',border:'1px solid #fcd34d',borderRadius:6,fontSize:12.5,color:'#92400e',lineHeight:1.6}}>
              <Icon name="info" size={12}/> 如需修改收款方式,请联系商户运营
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div style={{padding:'18px 22px'}}>
            <div className="ad-section-title">登入安全</div>
            <SecurityRow icon="shield" title="登入密码"
              desc={'上次修改时间:' + new Date(Date.now()-30*86400000).toISOString().slice(0,10) + ' ' + new Date().toTimeString().slice(0,8)}
              action={<button className="btn sm" style={{borderColor:'var(--brand)',color:'var(--brand)'}} onClick={()=>setShowPwd(true)}>修改密码</button>}/>
          </div>
        )}
      </div>

      {/* 修改密码 Modal */}
      <PFUI.Modal open={showPwd} onClose={()=>setShowPwd(false)} title="修改登录密码"
        footer={<><button className="btn ghost" onClick={()=>setShowPwd(false)}>取消</button><button className="btn primary" onClick={()=>{toast('密码已修改');setShowPwd(false);}}>确认修改</button></>}>
        <div className="form-grid" style={{gridTemplateColumns:'1fr'}}>
          <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>当前密码</label><input className="input" type="password"/></div>
          <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>新密码 (至少 12 位,包含大小写 + 数字 + 符号)</label><input className="input" type="password"/></div>
          <div><label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>确认新密码</label><input className="input" type="password"/></div>
        </div>
      </PFUI.Modal>
    </div>
  );
}

function SecurityRow({ icon, title, desc, badge, action }) {
  return (
    <div style={{padding:14,border:'1px solid var(--line)',borderRadius:8,display:'flex',alignItems:'center',gap:14}}>
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
