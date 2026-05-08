// Dashboard — 仪表盘
const { Modal: _M, StatusBadge: _SB, RiskBadge: _RB, Sparkline: _SP, LineChart: _LC, Donut: _DN, PageHead: _PH, DateRange: _DR } = window.UI;

function Dashboard() {
  const [range, setRange] = React.useState('today');
  const [trendMode, setTrendMode] = React.useState('day');
  const D = window.APS_DATA;
  const F = window.APS_FMT;

  const kpis = [
    { label: '今日代理注册', val: '127', delta: '+18.2%', dir: 'up', spark: D.trend.cpa.slice(-14) },
    { label: '新增下级代理', val: '342', delta: '+9.4%', dir: 'up', spark: D.trend.rev.slice(-14) },
    { label: '点击量 Clicks', val: '184,920', delta: '+24.1%', dir: 'up', spark: D.trend.ngr.slice(-14), color: '#06b6d4' },
    { label: '注册玩家', val: '12,408', delta: '+12.6%', dir: 'up', spark: D.trend.hybrid.slice(-14), color: '#a855f7' },
    { label: '首存玩家', val: '4,213', delta: '+5.3%', dir: 'up', spark: D.trend.cpa.slice(-14), color: '#22c55e' },
    { label: '有效 CPA', val: '2,884', delta: '-3.1%', dir: 'down', spark: D.trend.rev.slice(-14), color: '#f59e0b' },
    { label: '充值金额', val: '$1.24M', delta: '+15.7%', dir: 'up', spark: D.trend.ngr.slice(-14), color: '#22c55e' },
    { label: '提款金额', val: '$486K', delta: '+8.2%', dir: 'up', spark: D.trend.hybrid.slice(-14), color: '#ef4444' },
    { label: '投注金额', val: '$8.92M', delta: '+19.3%', dir: 'up', spark: D.trend.cpa.slice(-14), color: '#06b6d4' },
    { label: 'GGR', val: '$612K', delta: '+11.8%', dir: 'up', spark: D.trend.rev.slice(-14) },
    { label: 'NGR', val: '$524K', delta: '+10.4%', dir: 'up', spark: D.trend.ngr.slice(-14) },
    { label: '代理佣金', val: '$184.2K', delta: '+6.9%', dir: 'up', spark: D.trend.hybrid.slice(-14), color: '#a855f7' },
  ];

  const funnelStages = [
    { name: 'Clicks', value: 184920, pct: 1.0, color: '#3b82f6' },
    { name: '注册玩家', value: 12408, pct: 0.067, color: '#06b6d4' },
    { name: '首存玩家', value: 4213, pct: 0.34, color: '#22c55e' },
    { name: '有效 CPA', value: 2884, pct: 0.685, color: '#f59e0b' },
    { name: '二充玩家', value: 1462, pct: 0.507, color: '#a855f7' },
    { name: '有效投注', value: 1118, pct: 0.764, color: '#ec4899' },
    { name: 'D7 留存', value: 824, pct: 0.737, color: '#14b8a6' },
  ];
  const fmax = funnelStages[0].value;

  const trendSeries = [
    { name: 'CPA 收益', color: '#3b82f6', data: D.trend.cpa, fill: true },
    { name: 'RevShare', color: '#22c55e', data: D.trend.rev, fill: false },
    { name: 'Hybrid', color: '#f59e0b', data: D.trend.hybrid, fill: false },
    { name: 'NGR', color: '#a855f7', data: D.trend.ngr.map(d => ({...d, y: d.y/8})), fill: false },
  ];

  return (
    <div className="page">
      <_PH title="代理总览" subtitle="今日代理数据汇总 · 最后更新 14:32:08">
        <_DR value={range} onChange={setRange}/>
        <button className="btn ghost icon-only"><Icon name="refresh" size={14}/></button>
        <button className="btn"><Icon name="download" size={13}/>导出</button>
      </_PH>

      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <div key={i} className="kpi">
            <div className="label">{k.label}<span className="info-dot">i</span></div>
            <div className="val">{k.val}</div>
            <div className={'delta ' + (k.dir==='up'?'up':k.dir==='down'?'down':'flat')}>
              <Icon name={k.dir==='up'?'arrowUp':'arrowDown'} size={11} strokeWidth={2.4}/>
              {k.delta} <span className="text-mute">vs 昨日</span>
            </div>
            <div className="spark"><_SP data={k.spark} color={k.color || '#3b82f6'} height={22}/></div>
          </div>
        ))}
      </div>

      <div className="grid-2 mt-4" style={{gridTemplateColumns:'1fr 1fr'}}>
        <div className="card">
          <div className="card-head">
            <h3>代理转化漏斗 <span className="sub">· 今日</span></h3>
            <div className="seg">
              <button className="active">全部代理</button>
              <button>Top 10</button>
              <button>新代理</button>
            </div>
          </div>
          <div className="card-body">
            {funnelStages.map((s, i) => (
              <div key={s.name} className="funnel-row">
                <div style={{fontSize:12,color:'var(--text-1)'}}>{s.name}</div>
                <div className="funnel-bar">
                  <div style={{width: (s.value/fmax*100)+'%', background: s.color}}>
                    {F.fmtNum(s.value)}
                  </div>
                </div>
                <div className="text-mono" style={{textAlign:'right',fontSize:11,color:'var(--text-2)'}}>
                  {i === 0 ? '—' : F.fmtPct(s.pct)}
                </div>
                <div style={{fontSize:11,color: i>0 && s.pct < 0.2 ? '#fca5a5' : 'var(--text-3)',textAlign:'right'}}>
                  {i === 0 ? '入口' : (s.pct >= 0.5 ? '健康' : s.pct >= 0.2 ? '中等' : '偏低')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>风控提醒 <span className="sub">· 6 条待处理</span></h3>
            <button className="btn sm ghost">查看全部 <Icon name="chevronRight" size={12}/></button>
          </div>
          <div>
            {D.alerts.map((a, i) => (
              <div key={i} className="notice">
                <div className={'ico ' + a.icon}>
                  <Icon name={a.type==='danger'?'alert':a.type==='warning'?'alert':'info'} size={14}/>
                </div>
                <div className="body">
                  <div className="title">{a.title}</div>
                  <div className="meta">{a.meta}</div>
                </div>
                <Icon name="chevronRight" size={14} className="text-mute"/>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-head">
          <h3>代理收益趋势</h3>
          <div className="row gap-2">
            <div className="seg">
              <button className={trendMode==='day'?'active':''} onClick={()=>setTrendMode('day')}>日</button>
              <button className={trendMode==='week'?'active':''} onClick={()=>setTrendMode('week')}>周</button>
              <button className={trendMode==='month'?'active':''} onClick={()=>setTrendMode('month')}>月</button>
            </div>
            <button className="btn sm ghost icon-only"><Icon name="more" size={14}/></button>
          </div>
        </div>
        <div className="card-body">
          <_LC series={trendSeries} height={260} yFmt={(v)=> '$' + F.money(v)}/>
        </div>
      </div>

      <div className="grid-3 mt-4">
        <div className="card">
          <div className="card-head"><h3>Top 渠道 ROI</h3></div>
          <div className="card-body" style={{padding:0}}>
            {[
              { ch: 'Telegram', roi: 4.82, ngr: 168200, color: '#3b82f6' },
              { ch: 'TikTok', roi: 3.91, ngr: 124800, color: '#06b6d4' },
              { ch: 'WhatsApp', roi: 3.12, ngr: 98300, color: '#22c55e' },
              { ch: 'Instagram', roi: 2.45, ngr: 76400, color: '#f59e0b' },
              { ch: 'YouTube', roi: 1.88, ngr: 54100, color: '#a855f7' },
              { ch: 'Email', roi: 1.24, ngr: 28900, color: '#ef4444' },
            ].map(r => (
              <div key={r.ch} style={{padding:'9px 16px',borderBottom:'1px solid var(--line-soft)',display:'flex',alignItems:'center',gap:10}}>
                <span style={{width:6,height:18,background:r.color,borderRadius:2}}/>
                <span style={{flex:1,fontSize:12.5}}>{r.ch}</span>
                <span className="text-mono text-mute" style={{fontSize:11.5}}>${F.money(r.ngr)}</span>
                <span className="badge b-success" style={{minWidth:50,justifyContent:'center'}}>×{r.roi}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>分润模式分布</h3></div>
          <div className="card-body" style={{display:'flex',alignItems:'center',gap:18}}>
            <_DN data={[
              { value: 184, color: '#3b82f6' },
              { value: 96, color: '#22c55e' },
              { value: 48, color: '#f59e0b' },
              { value: 18, color: '#a855f7' },
            ]} size={130} label="代理"/>
            <div style={{flex:1,fontSize:12}}>
              {[
                { l: 'CPA 模式', v: 184, c: '#3b82f6', p: '52.8%' },
                { l: 'RevShare', v: 96, c: '#22c55e', p: '27.6%' },
                { l: 'Hybrid', v: 48, c: '#f59e0b', p: '13.8%' },
                { l: '阶梯/活动', v: 18, c: '#a855f7', p: '5.2%' },
              ].map(r => (
                <div key={r.l} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0'}}>
                  <span style={{width:8,height:8,borderRadius:2,background:r.c}}/>
                  <span style={{flex:1,color:'var(--text-1)'}}>{r.l}</span>
                  <span className="text-mono" style={{color:'var(--text-0)',fontWeight:500}}>{r.v}</span>
                  <span className="text-mute text-mono" style={{minWidth:40,textAlign:'right'}}>{r.p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>待处理事项</h3>
            <span className="badge b-danger"><span className="dot"/>17</span>
          </div>
          <div className="card-body" style={{padding:0}}>
            {[
              { l: '待审核结算单', v: 17, t: 'pending', alert: true },
              { l: '待审核 CPA', v: 84, t: 'pending' },
              { l: '待冻结佣金', v: 6, t: 'pending', alert: true },
              { l: '待审核提款', v: 23, t: 'pending' },
              { l: '风险代理待处理', v: 4, t: 'pending', alert: true },
              { l: '套利团队疑似', v: 2, t: 'pending', alert: true },
            ].map((r, i) => (
              <div key={i} style={{padding:'10px 16px',borderBottom:'1px solid var(--line-soft)',display:'flex',alignItems:'center',gap:10}}>
                <span style={{flex:1,fontSize:12.5}}>{r.l}</span>
                <span className="text-mono" style={{color: r.alert?'#fca5a5':'var(--text-0)',fontWeight:600,fontSize:13}}>{r.v}</span>
                <button className="btn sm">处理</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
