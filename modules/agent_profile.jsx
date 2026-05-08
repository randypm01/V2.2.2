// 代理后台 - 我的账户 P0-13
const PFUI = window.UI;

function AgentProfileModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const toast = PFUI.useToast();
  const me = window.useCurrentAgent();
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
      <PFUI.PageHead title="我的账户" subtitle="基本资料 · 安全设置 · 合作方案">
        <button className="btn"><Icon name="download" size={13}/>下载合作协议</button>
      </PFUI.PageHead>

      <div className="card">
        <PFUI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'basic',    label:'基本资料'},
          {key:'security', label:'安全设置'},
          {key:'plan',     label:'合作方案'},
          {key:'payout',   label:'结算账户'},
        ]}/>

        {tab === 'basic' && (
          <div style={{padding:'18px 22px'}}>
            <div className="form-section-title" style={{marginTop:0}}>账号信息</div>
            <div className="form-grid">
              <div>
                <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>代理 ID</label>
                <input className="input" value={me.id} readOnly style={{background:'var(--bg-3)',fontFamily:'var(--font-mono)'}}/>
              </div>
              <div>
                <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>代理名称</label>
                <input className="input" defaultValue={me.name}/>
              </div>
              <div>
                <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>代理类型</label>
                <input className="input" value={D.LABELS.types[me.type] || me.type} readOnly style={{background:'var(--bg-3)'}}/>
              </div>
              <div>
                <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>代理等级</label>
                <input className="input" value={D.LABELS.tiers[me.tier] || me.tier} readOnly style={{background:'var(--bg-3)'}}/>
              </div>
              <div>
                <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>层级 / 上级</label>
                <input className="input" value={'L' + me.level + (me.parent ? ' · 上级 ' + me.parent : ' · 直属总代')} readOnly style={{background:'var(--bg-3)',fontFamily:'var(--font-mono)'}}/>
              </div>
              <div>
                <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>市场 / 国家</label>
                <input className="input" value={(D.LABELS.markets[me.market]||me.market) + ' / ' + (D.LABELS.countries[me.country]||me.country)} readOnly style={{background:'var(--bg-3)'}}/>
              </div>
              <div>
                <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>结算币种</label>
                <input className="input" value={me.currency} readOnly style={{background:'var(--bg-3)'}}/>
              </div>
              <div>
                <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>注册时间</label>
                <input className="input" value={new Date(me.created).toLocaleDateString('zh-CN')} readOnly style={{background:'var(--bg-3)'}}/>
              </div>
            </div>

            <div className="form-section-title mt-4">联系方式</div>
            <div className="form-grid">
              <div>
                <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>主要联系方式</label>
                <input className="input" defaultValue={me.contact}/>
              </div>
              <div>
                <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>Email</label>
                <input className="input" defaultValue={(me.name.toLowerCase().replace('_','.')) + '@aff.example.com'}/>
              </div>
              <div>
                <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>Telegram</label>
                <input className="input" defaultValue={'@' + me.name.toLowerCase().replace('_','')}/>
              </div>
              <div>
                <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>WhatsApp</label>
                <input className="input" defaultValue="+55 11 9 8765-4321"/>
              </div>
            </div>
            <div style={{marginTop:18,display:'flex',gap:10}}>
              <button className="btn primary" onClick={()=>toast('资料已保存')}><Icon name="check" size={13}/>保存修改</button>
              <button className="btn ghost">取消</button>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div style={{padding:'18px 22px'}}>
            <div className="form-section-title" style={{marginTop:0}}>登录安全</div>
            <div style={{display:'grid',gap:10}}>
              <SecurityRow icon="shield" title="登录密码" desc="上次修改:30 天前 · 建议每 90 天更换一次"
                action={<button className="btn sm" onClick={()=>setShowPwd(true)}>修改密码</button>}/>
              <SecurityRow icon="phone" title="二步验证 (2FA)" desc="使用 Google Authenticator 或 Authy 扫码绑定"
                badge={<span className="badge b-warning"><span className="dot"/>未启用</span>}
                action={<button className="btn sm primary" onClick={()=>setShow2FA(true)}>立即启用</button>}/>
              <SecurityRow icon="api" title="登录 IP 白名单" desc="仅允许 IP 白名单内的地址登录后台 (可选)"
                badge={<span className="badge b-neutral">未启用</span>}
                action={<button className="btn sm">配置</button>}/>
              <SecurityRow icon="bell" title="登录通知" desc="新设备 / 异地登录时发送 Email 与 Telegram 提醒"
                badge={<span className="badge b-success"><span className="dot"/>已启用</span>}
                action={<Switch on={true}/>}/>
            </div>

            <div className="form-section-title mt-4">登录设备记录</div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr>
                  <th>设备 / 浏览器</th><th>IP 地址</th><th>位置</th><th>最近活跃</th><th style={{width:120}}>操作</th>
                </tr></thead>
                <tbody>
                  {devices.map((d,i)=>(
                    <tr key={i}>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <Icon name="phone" size={14} style={{color:'var(--text-3)'}}/>
                          <span>{d.name}</span>
                          {d.cur && <span className="badge b-success" style={{fontSize:10}}>当前</span>}
                        </div>
                      </td>
                      <td className="text-mono">{d.ip}</td>
                      <td className="text-mute">{d.loc}</td>
                      <td className="text-mute" style={{fontSize:11}}>{d.cur ? '在线' : new Date(d.last).toLocaleString('zh-CN')}</td>
                      <td>
                        {!d.cur && <button className="btn sm danger" onClick={()=>toast('已踢出 ' + d.name)}>踢出</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

        {tab === 'payout' && (
          <div style={{padding:'18px 22px'}}>
            <div className="form-section-title" style={{marginTop:0}}>已绑定收款方式</div>
            <div style={{display:'grid',gap:10}}>
              {[
                { m:'USDT-TRC20', addr:'TXxxx...18jK9q', primary:true, verified:true, last: Date.now()-30*86400000 },
                { m:'PIX (CPF)',  addr:'***.456.789-01', primary:false, verified:true, last: Date.now()-90*86400000 },
                { m:'银行电汇',   addr:'Itaú · Ag 0001 · ****1234', primary:false, verified:false, last: null },
              ].map((p,i) => (
                <div key={i} style={{padding:14,border:'1px solid var(--line)',borderRadius:8,background:'var(--bg-1)',display:'flex',alignItems:'center',gap:14}}>
                  <div style={{width:36,height:36,borderRadius:6,background:'var(--bg-2)',display:'grid',placeItems:'center'}}>
                    <Icon name="wallet" size={18} style={{color:'var(--text-2)'}}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:3}}>
                      <span style={{fontSize:13,fontWeight:600,color:'var(--text-0)'}}>{p.m}</span>
                      {p.primary && <span className="badge b-brand" style={{fontSize:10}}>默认</span>}
                      {p.verified
                        ? <span className="badge b-success" style={{fontSize:10}}><span className="dot"/>已验证</span>
                        : <span className="badge b-warning" style={{fontSize:10}}><span className="dot"/>待验证</span>}
                    </div>
                    <div className="text-mono text-mute" style={{fontSize:11.5}}>{p.addr}</div>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    {!p.primary && <button className="btn sm">设为默认</button>}
                    <button className="btn sm ghost">编辑</button>
                    <button className="btn sm ghost danger">删除</button>
                  </div>
                </div>
              ))}
              <button className="btn" style={{alignSelf:'start',marginTop:6}}><Icon name="plus" size={13}/>添加收款方式</button>
            </div>

            <div className="form-section-title mt-4">合规材料</div>
            <div className="grid-2" style={{gap:10}}>
              {[
                { l:'KYC 身份证明', s:'已上传', v:true },
                { l:'地址证明', s:'已上传', v:true },
                { l:'银行账户证明', s:'未上传', v:false },
                { l:'税务申报表', s:'未上传', v:false },
              ].map(d => (
                <div key={d.l} style={{padding:'12px 14px',border:'1px solid var(--line)',borderRadius:6,display:'flex',alignItems:'center',gap:10}}>
                  <Icon name="file" size={16} style={{color: d.v?'var(--success)':'var(--text-3)'}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12.5,color:'var(--text-1)',fontWeight:500}}>{d.l}</div>
                    <div className="text-mute" style={{fontSize:11}}>{d.s}</div>
                  </div>
                  <button className="btn sm ghost">{d.v?'查看':'上传'}</button>
                </div>
              ))}
            </div>
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
