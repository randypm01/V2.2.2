// 商户后台 - 通知管理 P0-14
// 商户运营向代理推送结算/风控/活动/系统通知
const NTUI = window.UI;

function NotificationsModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const toast = NTUI.useToast();
  const [tab, setTab] = React.useState('list');
  const [filter, setFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [showCompose, setShowCompose] = React.useState(false);

  const TYPES = {
    system:    { l:'系统通知', c:'#64748b', bg:'#f1f5f9' },
    settle:    { l:'结算通知', c:'#1e40af', bg:'#dbeafe' },
    risk:      { l:'风控告警', c:'#b91c1c', bg:'#fee2e2' },
    campaign:  { l:'活动通知', c:'#92400e', bg:'#fef3c7' },
    cpa:       { l:'CPA 通知', c:'#166534', bg:'#dcfce7' },
  };

  // 模拟通知数据
  const notifications = React.useMemo(() => Array.from({length: 28}).map((_, i) => {
    const types = ['system','settle','risk','campaign','cpa'];
    const t = types[i % types.length];
    const samples = {
      system:   ['系统维护通知 · 5/15 凌晨 02:00 - 04:00','后台 v2.6 升级,新增 Hybrid 分润配置','登录策略更新,新增 IP 白名单'],
      settle:   ['本周结算单已生成 · 待审核 17 张','本月结算已完成,共发放 $284K','结算周期调整通知 · 改为双周结算'],
      risk:     ['代理 AG100023 异常 CPA 率告警','发现疑似套利团队,已暂扣佣金 $2,150','5 名玩家 FTD 后 24h 提款,触发风控'],
      campaign: ['BR 世界杯活动上线 · 5/20 - 6/15','VIP CashBack 活动延期至月底','新春活动结算奖励已发放'],
      cpa:      ['本月 CPA 拒绝率 14.3%,环比 -1.2pp','CPA-LATAM-V2 方案配置已更新','APAC CPA $40 方案已停用'],
    };
    return {
      id: 'NTF-' + String(80000 + i).padStart(6,'0'),
      type: t,
      title: samples[t][i % samples[t].length],
      content: '详细内容:' + samples[t][i % samples[t].length] + ' — 请登录后台查看完整信息或联系运营对接人。',
      audience: i % 4 === 0 ? '全部代理' : i % 4 === 1 ? 'LATAM 市场' : i % 4 === 2 ? '钻石/白金' : 'AG100007, AG100012',
      sender: ['admin','ops.lily','risk.tom','finance.amy'][i % 4],
      sentAt: Date.now() - (i * 4 + 2) * 3600 * 1000,
      readRate: Math.floor(40 + Math.random() * 55),
      total: 80 + Math.floor(Math.random()*200),
      status: i < 3 ? 'sending' : 'sent',
    };
  }), []);

  const counts = {
    all: notifications.length,
    system: notifications.filter(n=>n.type==='system').length,
    settle: notifications.filter(n=>n.type==='settle').length,
    risk: notifications.filter(n=>n.type==='risk').length,
    campaign: notifications.filter(n=>n.type==='campaign').length,
    cpa: notifications.filter(n=>n.type==='cpa').length,
  };

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);
  const pageSize = 12;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div className="page">
      <NTUI.PageHead title="通知管理" subtitle="向代理推送结算 / 风控 / 活动 / 系统通知">
        <button className="btn"><Icon name="settings" size={13}/>通知模板</button>
        <button className="btn primary" onClick={()=>setShowCompose(true)}><Icon name="plus" size={13}/>新建通知</button>
      </NTUI.PageHead>

      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {[
          ['本月发送', F.fmtNum(notifications.length * 28), '+12.4%', 'up'],
          ['平均阅读率', '67.4%', '+3.1pp', 'up'],
          ['待发送', '2 条', '', 'flat'],
          ['失败投递', '0.8%', '-0.2pp', 'up'],
          ['活跃订阅代理', '78', '+4', 'up'],
        ].map(([l,v,d,dir]) => (
          <div key={l} className="kpi">
            <div className="label">{l}</div>
            <div className="val">{v}</div>
            {d && <div className={'delta '+dir}>{d}</div>}
          </div>
        ))}
      </div>

      <div className="card">
        <NTUI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'list',  label:'通知列表', count: counts.all},
          {key:'template', label:'通知模板'},
          {key:'channels', label:'触达渠道'},
        ]}/>

        {tab === 'list' && (
          <>
            <div className="toolbar">
              <div className="seg">
                {[
                  {v:'all', l:'全部', c: counts.all},
                  {v:'system', l:'系统', c: counts.system},
                  {v:'settle', l:'结算', c: counts.settle},
                  {v:'risk', l:'风控', c: counts.risk},
                  {v:'campaign', l:'活动', c: counts.campaign},
                  {v:'cpa', l:'CPA', c: counts.cpa},
                ].map(s => (
                  <button key={s.v} className={filter===s.v?'active':''} onClick={()=>{setFilter(s.v);setPage(1);}}>
                    {s.l}<span className="text-mono text-mute" style={{marginLeft:4}}>({s.c})</span>
                  </button>
                ))}
              </div>
              <NTUI.SearchInput value="" onChange={()=>{}} placeholder="标题 / 编号" width={220}/>
              <NTUI.DateRange value="30d" onChange={()=>{}}/>
              <span style={{flex:1}}/>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr>
                  <th>编号</th><th>类型</th><th style={{minWidth:280}}>标题</th>
                  <th>受众</th><th>发送人</th>
                  <th className="right">送达</th>
                  <th className="right">阅读率</th>
                  <th>状态</th><th>发送时间</th><th style={{width:90}}>操作</th>
                </tr></thead>
                <tbody>
                  {paged.map(n => {
                    const t = TYPES[n.type];
                    return (
                      <tr key={n.id}>
                        <td className="id" style={{color:'var(--brand)',fontFamily:'var(--font-mono)',fontSize:11.5}}>{n.id}</td>
                        <td><span style={{
                          fontSize:11, padding:'2px 8px', borderRadius:3,
                          background: t.bg, color: t.c, fontWeight:600
                        }}>{t.l}</span></td>
                        <td style={{maxWidth:380}}>
                          <div style={{color:'var(--text-0)',fontWeight:500,fontSize:13}}>{n.title}</div>
                          <div className="text-mute" style={{fontSize:11,marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:380}}>{n.content}</div>
                        </td>
                        <td className="text-mute" style={{fontSize:11.5}}>{n.audience}</td>
                        <td className="text-mute" style={{fontSize:11.5}}>{n.sender}</td>
                        <td className="right text-mono">{F.fmtNum(n.total)}</td>
                        <td className="right">
                          <div style={{display:'inline-flex',alignItems:'center',gap:6}}>
                            <div style={{width:60,height:5,background:'var(--bg-3)',borderRadius:3,overflow:'hidden'}}>
                              <div style={{width:n.readRate+'%',height:'100%',background: n.readRate>60?'#22c55e':n.readRate>40?'#f59e0b':'#ef4444'}}/>
                            </div>
                            <span className="text-mono" style={{fontSize:11,minWidth:38,textAlign:'right'}}>{n.readRate}%</span>
                          </div>
                        </td>
                        <td>
                          {n.status === 'sending'
                            ? <span className="badge b-warning"><span className="dot"/>发送中</span>
                            : <span className="badge b-success"><span className="dot"/>已送达</span>}
                        </td>
                        <td className="text-mute" style={{fontSize:11}}>{new Date(n.sentAt).toLocaleString('zh-CN')}</td>
                        <td>
                          <div style={{display:'flex',gap:4}}>
                            <button className="btn sm ghost icon-only"><Icon name="eye" size={13}/></button>
                            <button className="btn sm ghost icon-only"><Icon name="copy" size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <NTUI.Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage}/>
          </>
        )}

        {tab === 'template' && (
          <div style={{padding:18}}>
            <div className="grid-3" style={{gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
              {[
                {t:'结算单生成', tp:'settle', d:'本周结算单已生成,金额 ${amount},请尽快查看'},
                {t:'结算单已通过', tp:'settle', d:'结算单 ${id} 已通过审核,即将发起付款'},
                {t:'提款已处理', tp:'settle', d:'您的提款 ${id} 金额 ${amount} 已成功打款'},
                {t:'CPA 拒绝通知', tp:'cpa', d:'CPA ${id} 因 ${reason} 已拒绝,可申请复核'},
                {t:'风控冻结', tp:'risk', d:'代理账户出现风险信号,已临时冻结部分佣金'},
                {t:'活动上线', tp:'campaign', d:'${campaign} 活动已上线,达成条件可获奖励'},
                {t:'每日报表', tp:'system', d:'昨日数据 · Clicks ${clicks} · FTD ${ftds} · 佣金 ${commission}'},
                {t:'登录异常', tp:'system', d:'账户在 ${city} 异常登录,如非本人请立即修改密码'},
              ].map((x,i) => {
                const t = TYPES[x.tp];
                return (
                  <div key={i} style={{background:'var(--bg-2)',border:'1px solid var(--line)',borderRadius:8,padding:14}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <span style={{fontSize:11,padding:'2px 8px',borderRadius:3,background:t.bg,color:t.c,fontWeight:600}}>{t.l}</span>
                      <span className="badge b-success">已启用</span>
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--text-0)',marginBottom:6}}>{x.t}</div>
                    <div className="text-mute" style={{fontSize:11.5,lineHeight:1.6,fontFamily:'var(--font-mono)',padding:8,background:'var(--bg-1)',borderRadius:4,minHeight:48}}>{x.d}</div>
                    <div style={{display:'flex',gap:6,marginTop:10}}>
                      <button className="btn sm" style={{flex:1}}>编辑</button>
                      <button className="btn sm ghost icon-only"><Icon name="copy" size={13}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'channels' && (
          <div style={{padding:18}}>
            <div className="grid-2" style={{gap:14}}>
              {[
                {n:'站内信',d:'代理后台通知中心 / 红点提醒',on:true,delivery:'实时',cov:'100%'},
                {n:'Email',d:'通过 SendGrid 推送 · 每日上限 10000',on:true,delivery:'<5 min',cov:'92%'},
                {n:'Telegram Bot',d:'代理可绑定 TG 账号接收推送',on:true,delivery:'<10 sec',cov:'68%'},
                {n:'WhatsApp Business',d:'仅限重要通知 · 结算 / 风控',on:false,delivery:'<30 sec',cov:'0%'},
                {n:'SMS 短信',d:'紧急通知备用渠道',on:false,delivery:'<1 min',cov:'0%'},
                {n:'Webhook',d:'推送至代理自有 API · 适用渠道联盟',on:true,delivery:'实时',cov:'24%'},
              ].map((c,i) => (
                <div key={i} style={{padding:16,border:'1px solid var(--line)',borderRadius:8,background:'var(--bg-1)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                    <div style={{width:36,height:36,borderRadius:6,background:c.on?'var(--brand-soft)':'var(--bg-3)',display:'grid',placeItems:'center'}}>
                      <Icon name="bell" size={18} style={{color:c.on?'var(--brand)':'var(--text-3)'}}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13.5,fontWeight:600,color:'var(--text-0)'}}>{c.n}</div>
                      <div className="text-mute" style={{fontSize:11.5,marginTop:2}}>{c.d}</div>
                    </div>
                    <Switch on={c.on}/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,paddingTop:10,borderTop:'1px solid var(--line-soft)',fontSize:11.5}}>
                    <div><span className="text-mute">投递时延</span> <span className="text-mono" style={{color:'var(--text-1)'}}>{c.delivery}</span></div>
                    <div><span className="text-mute">绑定覆盖</span> <span className="text-mono" style={{color:'var(--text-1)'}}>{c.cov}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 新建通知 */}
      <NTUI.Modal open={showCompose} onClose={()=>setShowCompose(false)} size="lg" title="新建通知"
        subtitle="向指定代理推送通知,支持多渠道触达"
        footer={<>
          <button className="btn ghost" onClick={()=>setShowCompose(false)}>取消</button>
          <button className="btn">保存草稿</button>
          <button className="btn primary" onClick={()=>{toast('通知已发送');setShowCompose(false);}}><Icon name="check" size={13}/>立即发送</button>
        </>}>
        <div className="form-section-title" style={{marginTop:0}}>基本信息</div>
        <div className="form-grid">
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>通知类型</label>
            <select className="select">
              <option>系统通知</option><option>结算通知</option><option>风控告警</option><option>活动通知</option><option>CPA 通知</option>
            </select>
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>套用模板</label>
            <select className="select">
              <option>不使用模板</option><option>结算单生成</option><option>活动上线</option>
            </select>
          </div>
          <div className="full">
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>标题</label>
            <input className="input" placeholder="如:本周结算单已生成"/>
          </div>
          <div className="full">
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>正文内容</label>
            <textarea className="textarea" rows="4" placeholder="支持 ${变量} 占位符,如 ${amount} ${id} ${reason}"/>
          </div>
        </div>

        <div className="form-section-title mt-4">触达对象</div>
        <div className="form-grid">
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>受众范围</label>
            <select className="select">
              <option>全部代理</option><option>按市场</option><option>按等级</option><option>按代理类型</option><option>指定代理</option>
            </select>
          </div>
          <div>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>具体筛选</label>
            <select className="select">
              <option>不限</option><option>LATAM</option><option>APAC</option><option>钻石 + 白金</option>
            </select>
          </div>
        </div>

        <div className="form-section-title mt-4">触达渠道</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          {[['站内信',true],['Email',true],['Telegram',false],['WhatsApp',false],['SMS',false],['Webhook',false]].map(([l,d]) => (
            <label key={l} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'var(--bg-2)',borderRadius:6,fontSize:12.5,cursor:'pointer'}}>
              <CheckBox on={d}/>{l}
            </label>
          ))}
        </div>

        <div className="form-section-title mt-4">发送时机</div>
        <div style={{display:'flex',gap:14,fontSize:12.5}}>
          <label style={{display:'flex',alignItems:'center',gap:6}}><input type="radio" name="when" defaultChecked/>立即发送</label>
          <label style={{display:'flex',alignItems:'center',gap:6}}><input type="radio" name="when"/>定时发送</label>
        </div>
      </NTUI.Modal>
    </div>
  );
}

window.NotificationsModule = NotificationsModule;
