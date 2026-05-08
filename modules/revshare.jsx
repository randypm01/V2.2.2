// 分润管理
const RUI = window.UI;

function RevShareModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const [tab, setTab] = React.useState('plans');
  const toast = RUI.useToast();

  return (
    <div className="page">
      <RUI.PageHead title="分润管理" subtitle="CPA / RevShare / Hybrid 三种分润模式与下级抽成">
        <button className="btn primary"><Icon name="plus" size={13}/>新建分润方案</button>
      </RUI.PageHead>

      <div className="card">
        <RUI.Tabs value={tab} onChange={setTab} tabs={[
          {key:'plans',label:'分润方案'},
          {key:'cpa',label:'CPA 模式'},
          {key:'rev',label:'RevShare 模式'},
          {key:'hybrid',label:'Hybrid 模式'},
          {key:'sub',label:'下级分润'},
        ]}/>

        {tab === 'plans' && (
          <div style={{padding:14}}>
            <div className="grid-3" style={{gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))'}}>
              {[
                {n:'LATAM 标准 CPA',m:'CPA',a:'$50/CPA',ag:24,c:'#3b82f6'},
                {n:'APAC RevShare 35%',m:'RevShare',a:'NGR × 35%',ag:18,c:'#22c55e'},
                {n:'BR Hybrid 顶级',m:'Hybrid',a:'$30 + 20%',ag:6,c:'#f59e0b'},
                {n:'阶梯分润 LATAM',m:'Tiered',a:'15-45%',ag:12,c:'#a855f7'},
                {n:'网赚渠道 CPA',m:'CPA',a:'$25/CPA',ag:48,c:'#3b82f6'},
                {n:'VIP 高净值 Hybrid',m:'Hybrid',a:'$150 + 25%',ag:3,c:'#f59e0b'},
              ].map(p => (
                <div key={p.n} style={{background:'var(--bg-2)',border:'1px solid var(--line)',borderRadius:8,padding:16}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{padding:'2px 8px',background:p.c+'20',color:p.c,borderRadius:10,fontSize:10.5,fontWeight:600,letterSpacing:.5}}>{p.m}</span>
                    <RUI.StatusBadge status="active"/>
                  </div>
                  <div style={{fontSize:14,fontWeight:600,color:'var(--text-0)',marginTop:8}}>{p.n}</div>
                  <div style={{fontSize:22,fontWeight:600,color:'var(--brand)',fontFamily:'var(--font-mono)',marginTop:8}}>{p.a}</div>
                  <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>适用代理 <b style={{color:'var(--text-1)'}}>{p.ag}</b> · 下级抽成 5%/3%/1%</div>
                  <div style={{display:'flex',gap:6,marginTop:12}}>
                    <button className="btn sm" style={{flex:1}}>编辑</button>
                    <button className="btn sm">复制</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'cpa' && (
          <div style={{padding:18,maxWidth:720}}>
            <div className="form-section-title" style={{marginTop:0}}>CPA 模式配置</div>
            {[
              ['CPA 固定金额','$50'],
              ['最低首存金额','$20'],
              ['最低流水倍数','×5'],
              ['最低 NGR','$30'],
              ['有效天数','7 天'],
              ['是否需要 D1 留存','开启'],
              ['是否排除风控玩家','开启'],
              ['是否排除提款过快玩家','开启'],
            ].map(([l,v]) => (
              <div key={l} className="form-row"><label>{l}</label><div>{typeof v === 'string' ? <input className="input" style={{maxWidth:240}} defaultValue={v}/> : v}</div></div>
            ))}
          </div>
        )}

        {tab === 'rev' && <RevShareConfig/>}
        {tab === 'hybrid' && <HybridConfig/>}
        {tab === 'sub' && <SubAffConfig/>}
      </div>
    </div>
  );
}

function RevShareConfig() {
  return (
    <div style={{padding:18}}>
      <div className="grid-2">
        <div>
          <div className="form-section-title" style={{marginTop:0}}>RevShare 规则配置</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 24px'}}>
            {[
              ['NGR 计算口径', 'wager - GGR - bonus'],
              ['代理分成比例', '35%'],
              ['封顶金额', '$50,000/月'],
            ].map(([l,v]) => (
              <div key={l} style={{gridColumn:'span 2',display:'grid',gridTemplateColumns:'160px 1fr',padding:'8px 0',alignItems:'center',borderBottom:'1px solid var(--line-soft)'}}>
                <span style={{fontSize:12,color:'var(--text-2)'}}>{l}</span>
                <input className="input" defaultValue={v}/>
              </div>
            ))}
            {[
              ['扣除 Bonus 成本',true],
              ['扣除返水',true],
              ['扣除支付费',false],
              ['扣除税费',true],
              ['扣除风控扣款',true],
              ['负盈利结转',true],
            ].map(([l,d]) => (
              <div key={l} style={{display:'flex',padding:'8px 0',borderBottom:'1px solid var(--line-soft)',alignItems:'center'}}>
                <span style={{flex:1,fontSize:12.5}}>{l}</span>
                <Switch on={d}/>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="form-section-title" style={{marginTop:0}}>RevShare 报表预览</div>
          <table className="tbl" style={{fontSize:11.5}}>
            <thead><tr><th>代理</th><th className="right">NGR</th><th className="right">分成</th><th className="right">收益</th></tr></thead>
            <tbody>
              {[
                ['AG100002', 124800, '35%', 43680],
                ['AG100008', 98300, '35%', 34405],
                ['AG100012', 76400, '32%', 24448],
                ['AG100023', 54100, '28%', 15148],
                ['AG100034', 28900, '25%', 7225],
                ['AG100045', -8200, '35%', -2870],
              ].map((r,i) => (
                <tr key={i}>
                  <td className="id">{r[0]}</td>
                  <td className="right">${window.APS_FMT.fmtNum(r[1])}</td>
                  <td className="right text-mute">{r[2]}</td>
                  <td className="right" style={{color: r[3]>0?'#6ee7a8':'#fca5a5',fontWeight:600}}>${window.APS_FMT.fmtNum(r[3])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function HybridConfig() {
  return (
    <div style={{padding:18,maxWidth:680}}>
      <div className="form-section-title" style={{marginTop:0}}>Hybrid 规则配置</div>
      <div className="form-row"><label>CPA 固定金额</label><input className="input" style={{maxWidth:240}} defaultValue="$30"/></div>
      <div className="form-row"><label>RevShare 比例</label><input className="input" style={{maxWidth:240}} defaultValue="20%"/></div>
      <div className="form-row"><label>CPA 是否先审核</label><Switch on={true}/></div>
      <div className="form-row"><label>RevShare 是否月结</label><Switch on={true}/></div>
      <div className="form-row"><label>共享风控条件</label><Switch on={true}/></div>
      <div className="form-row"><label>同时生效</label><Switch on={true}/></div>
    </div>
  );
}

function SubAffConfig() {
  return (
    <div style={{padding:18,maxWidth:720}}>
      <div className="form-section-title" style={{marginTop:0}}>下级代理分润比例</div>
      <div className="grid-3">
        {[
          {l:'L1 一级下级',v:'5%',c:'#3b82f6'},
          {l:'L2 二级下级',v:'3%',c:'#06b6d4'},
          {l:'L3 三级下级',v:'1%',c:'#22c55e'},
        ].map(s => (
          <div key={s.l} style={{padding:16,background:'var(--bg-2)',border:'1px solid var(--line)',borderRadius:8}}>
            <div style={{fontSize:11,color:'var(--text-3)'}}>{s.l}</div>
            <div style={{fontSize:24,fontWeight:600,color:s.c,fontFamily:'var(--font-mono)',marginTop:6}}>{s.v}</div>
          </div>
        ))}
      </div>
      <div className="form-section-title mt-4">下钻规则</div>
      <div className="form-row"><label>最大分润层级</label><select className="select" style={{maxWidth:240}}><option>3 层</option><option>5 层</option><option>无限制</option></select></div>
      <div className="form-row"><label>启用动态压缩</label><Switch on={true}/></div>
      <div className="form-row"><label>无效上级跳过</label><Switch on={true}/></div>
      <div className="form-row"><label>允许覆盖下级</label><Switch on={false}/></div>
    </div>
  );
}

window.RevShareModule = RevShareModule;
