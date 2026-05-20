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
  const [show2FA, setShow2FA] = React.useState(false);
  const [showPwd, setShowPwd] = React.useState(false);

  // 合作方案 (从代理对象推断)
  const plan = {
    type: ['CPA','RevShare','Hybrid'][me.level % 3],
    cpa: 50,
    revShare: 35,
    cycle: '周结(每周一)',
    minWithdraw: 200,
    currency: me.currency,
    negativeCarry: true,
    holdDays: 7,
  };

  // 登录设备记录
  const devices = [
    { name:'MacBook Pro · Chrome 124', ip:'203.74.201.18', loc:'巴西 圣保罗', last: Date.now()-2*3600*1000, cur: true },
    { name:'iPhone 15 Pro · Safari', ip:'203.74.201.18', loc:'巴西 圣保罗', last: Date.now()-1*86400000, cur: false },
    { name:'iPad Air · Safari', ip:'45.211.93.42', loc:'巴西 里约', last: Date.now()-5*86400000, cur: false },
    { name:'Windows 11 · Edge', ip:'185.221.17.84', loc:'葡萄牙 里斯本', last: Date.now()-12*86400000, cur: false },
  ];

  return (
    <div className="page">
      <PFUI.PageHead title={T('page.my_profile.title','我的账户')} subtitle={T('page.my_profile.sub','基本资料 · 合作方案 · 安全设置')}>
        <button className="btn"><Icon name="download" size={13}/>下载合作协议</button>
      </PFUI.PageHead>

      <div className="card">
        <PFUI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'basic',    label:'基本资料'},
          {key:'plan',     label:'合作方案'},
          {key:'security', label:'安全设置'},
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

              <div className="ad-section-title mt-4">备注</div>
              <div style={{padding:'10px 14px',background:'#f8fafc',border:'1px solid var(--line)',borderRadius:6,fontSize:13,color: me.note ? 'var(--text-1)' : 'var(--text-3)',lineHeight:1.6,whiteSpace:'pre-wrap'}}>
                {me.note || '(未填写备注)'}
              </div>
            </div>
          );
        })()}

        {tab === 'security' && (
          <div style={{padding:'18px 22px'}}>
            <div className="form-section-title" style={{marginTop:0}}>登录安全</div>
            <div style={{display:'grid',gap:10}}>
              <SecurityRow icon="shield" title="登录密码" desc="上次修改:30 天前 · 建议每 90 天更换一次"
                action={<button className="btn sm" onClick={()=>setShowPwd(true)}>修改密码</button>}/>
              <SecurityRow icon="phone" title="二步验证 (2FA)" desc="使用 Google Authenticator 或 Authy 扫码绑定"
                badge={<span className="badge b-warning"><span className="dot"/>未启用</span>}
                action={<button className="btn sm primary" onClick={()=>setShow2FA(true)}>立即启用</button>}/>
            </div>
          </div>
        )}

        {tab === 'plan' && (
          <div style={{padding:'18px 22px'}}>
            <div style={{
              padding:20,
              background:'linear-gradient(135deg,#3b82f612,transparent)',
              border:'1px solid var(--brand-line)',
              borderRadius:8,
              display:'flex',alignItems:'center',gap:24,
              marginBottom:18
            }}>
              <div style={{width:56,height:56,borderRadius:14,background:'var(--brand-soft)',display:'grid',placeItems:'center'}}>
                <Icon name="pie" size={28} style={{color:'var(--brand)'}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:'var(--text-3)'}}>当前合作方案</div>
                <div style={{fontSize:22,fontWeight:600,color:'var(--text-0)',marginTop:4}}>{plan.type} · CPA $50 + RevShare 35%</div>
                <div className="text-mute" style={{fontSize:12,marginTop:4}}>方案版本 v2.6 · 由商户运营 ops.lily 配置 · 锁定至 2026-12-31</div>
              </div>
              <button className="btn">下载方案文件</button>
            </div>

            <div className="grid-2" style={{gap:14}}>
              <div className="card-inner">
                <div className="form-section-title" style={{marginTop:0}}>CPA 设置</div>
                <PlanRow label="CPA 金额" value="$50 / per CPA"/>
                <PlanRow label="最低首存" value="$20"/>
                <PlanRow label="最低流水倍数" value="×5"/>
                <PlanRow label="最低 NGR" value="$30"/>
                <PlanRow label="留存条件" value="D3 留存"/>
                <PlanRow label="人工复核高额 CPA" value="≥ $100 复核"/>
              </div>
              <div className="card-inner">
                <div className="form-section-title" style={{marginTop:0}}>RevShare 设置</div>
                <PlanRow label="分润比例" value="35% NGR" highlight/>
                <PlanRow label="NGR 计算口径" value="GGR - Bonus - 返水"/>
                <PlanRow label="负盈利结转" value={plan.negativeCarry ? '是 · 上月负数计入下月' : '否'}/>
                <PlanRow label="结算周期" value={plan.cycle}/>
                <PlanRow label="结算币种" value={plan.currency}/>
                <PlanRow label="最低结算金额" value={'$' + plan.minWithdraw}/>
              </div>
            </div>

            <div className="form-section-title mt-4">权限范围</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'6px 24px'}}>
              {[
                ['查看玩家列表', true], ['查看下级代理', true],
                ['创建分享 Code', true], ['创建下级代理', true],
                ['申请提款', true], ['查看 CPA 报表', true],
                ['查看 RevShare 报表', true], ['下载素材', true],
                ['使用 API / Postback', false], ['查看跨层数据', false],
              ].map(([p,on]) => (
                <div key={p} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderBottom:'1px solid var(--line-soft)',fontSize:12.5}}>
                  {on
                    ? <Icon name="check" size={13} style={{color:'var(--success)'}}/>
                    : <Icon name="x" size={13} style={{color:'var(--text-3)'}}/>}
                  <span style={{color: on?'var(--text-1)':'var(--text-3)'}}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'payout' && null /* v2.5.8 removed */}
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

      {/* 2FA Modal */}
      <PFUI.Modal open={show2FA} onClose={()=>setShow2FA(false)} title="启用二步验证 (2FA)"
        subtitle="使用 Google Authenticator 或 Authy 扫描下方二维码"
        footer={<><button className="btn ghost" onClick={()=>setShow2FA(false)}>稍后</button><button className="btn primary" onClick={()=>{toast('2FA 已启用');setShow2FA(false);}}>完成绑定</button></>}>
        <div style={{textAlign:'center',padding:'10px 20px'}}>
          <div style={{width:180,height:180,margin:'0 auto',padding:14,background:'#fff',borderRadius:8,border:'1px solid var(--line)'}}>
            <svg viewBox="0 0 21 21" style={{width:'100%',height:'100%'}}>
              {Array.from({length:21}).map((_,r)=>Array.from({length:21}).map((_,c)=>{
                const seed = (r*13 + c*7 + 3) % 7;
                return seed > 3 ? <rect key={r+'-'+c} x={c} y={r} width="1" height="1" fill="#000"/> : null;
              }))}
            </svg>
          </div>
          <div style={{margin:'14px 0 8px',fontSize:11,color:'var(--text-3)'}}>或手动输入密钥:</div>
          <div className="text-mono" style={{fontSize:13,letterSpacing:1.5,color:'var(--brand)',background:'var(--bg-2)',padding:'8px 14px',display:'inline-block',borderRadius:4}}>
            JBSW Y3DP EHPK 3PXP
          </div>
          <div style={{marginTop:18}}>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6,textAlign:'left'}}>输入 6 位验证码</label>
            <input className="input" placeholder="000000" maxLength="6" style={{textAlign:'center',fontFamily:'var(--font-mono)',fontSize:18,letterSpacing:6}}/>
          </div>
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

function PlanRow({ label, value, highlight }) {
  return (
    <div style={{display:'flex',padding:'8px 0',borderBottom:'1px solid var(--line-soft)',fontSize:12.5}}>
      <span className="text-mute" style={{flex:1}}>{label}</span>
      <span className="text-mono" style={{color: highlight?'var(--brand)':'var(--text-0)',fontWeight: highlight?600:500}}>{value}</span>
    </div>
  );
}

window.AgentProfileModule = AgentProfileModule;
