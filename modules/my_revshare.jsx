// 代理后台 - 分润报表 P0-7
// v3.1.3 按截图重做(用户提供 uploads/123456.png):
//   - 顶部扁平化 3 个 tab:本期预估分润 / 已结算分润 / 分润规则(取消 v3.1.2 的 segmented + 子 tab 双层结构)
//   - 本期预估分润:信息条「期號:W3 · 結算狀態:未結算預估分潤 · 週期:6/1 00:00:00 - 6/7 23:59:59」
//   - 已结算分润:期号下拉选择器(W2 / W1 历史期切换),信息条显示「期號 · 週期」
//   - 两种期 KPI 都是 9 个(2 行 × 5 + 1,跟玩家损益样式一致)
//   - 表格 13 列:玩家UID / 来源Code / VIP / 充值 / 提款 / 充提差 / [当前余额|结算余额] / 投注 / 派彩 / GGR / 分润比例 / [预估佣金|结算佣金] / 用户状态
//   - 用户状态 pill:盈利(绿) / 亏损(红)
//   - 工具栏:玩家UID/邀请Code 搜索 + 全部 VIP 下拉 + 全部用户状态 下拉
//   - 货币用 ₹(印度卢比,跟玩家损益对齐)

const MRUI = window.UI;
const MR_T = (k, fb) => window.t(k, fb);

// —— 构造一期玩家数据 v3.1.56 改为 5 笔示例,精心设计覆盖 5 种结算场景
// 公式口径:
//   预估佣金 = max(0, 本期充值 - 本期提现 - 本期期末余额)
//   本期佣金基数(已结算) = (上期期末余额 + 上期佣金基数) + (本期充值 - 本期提现 - 本期期末余额)
//   本期佣金 = max(0, 本期佣金基数) × 分润比例
// 约束:上期期末余额 ≥ 0,上期佣金基数 ≤ 0
function buildPeriodPlayers(agentId, seed) {
  const fixedReg = [
    '2026/5/12 10:24:31',
    '2026/5/05 16:08:54',
    '2026/4/18 22:41:09',
    '2026/5/14 09:15:42',
    '2026/4/28 13:07:18',
  ];
  // 五笔预设范例 — 每笔的 dep/wd/balance/wager/payout/prevUnsettled/prevBase 已手算好,
  // 落入 base 公式后正好覆盖:大盈利 / 小盈利 / 大亏损 / 小亏损 / 持平 5 种状态
  // seed 仅用于轻微缩放(±15%),且 prev* 与 dep/wd/balance 同步缩放 — 保证缩放后等式依然成立
  const k = 0.85 + (((Math.abs(seed) * 37) % 31) / 100); // 0.85 ~ 1.15
  const r = (n) => Math.round(n * k);
  const rate = 5;

  // 模板数据(k=1 时):
  //   #1 大盈利:dep 12000 - wd 4000 - bal 1500 = +6500 当期亏损;prev 500 + (-300) = +200 → base 6700
  //   #2 小盈利:dep 8000 - wd 3000 - bal 3500 = +1500;prev 200 + 0 = +200          → base 1700
  //   #3 大亏损:dep 5000 - wd 7000 - bal 3000 = -5000;prev 0 + (-500) = -500        → base -5500(不计)
  //   #4 小亏损:dep 6000 - wd 6000 - bal 800  = -800; prev 600 + (-200) = +400       → base -400(不计)
  //   #5 持  平:dep 4000 - wd 4000 - bal 0    = 0;    prev 0 + 0 = 0                → base 0(不计)
  const tpl = [
    { id:'P12354531', code:'RANDY01', vip:1, dep:12000, wd:4000, bal:1500, wager:35000, payout:28500, isLoss:false, prevU:500, prevB:-300 },
    { id:'P12354532', code:'RANDY02', vip:1, dep:8000,  wd:3000, bal:3500, wager:10000, payout:8500,  isLoss:false, prevU:200, prevB:0    },
    { id:'P12354533', code:'RANDY03', vip:1, dep:5000,  wd:7000, bal:3000, wager:15000, payout:20000, isLoss:true,  prevU:0,   prevB:-500 },
    { id:'P12354534', code:'RANDY04', vip:1, dep:6000,  wd:6000, bal:800,  wager:8000,  payout:8800,  isLoss:true,  prevU:600, prevB:-200 },
    { id:'P12354535', code:'RANDY05', vip:1, dep:4000,  wd:4000, bal:0,    wager:5000,  payout:5000,  isLoss:false, prevU:0,   prevB:0    },
  ];

  return tpl.map((t, i) => {
    const deposit  = r(t.dep);
    const withdraw = r(t.wd);
    const balanceV = r(t.bal);
    const wagerV   = r(t.wager);
    const payout   = r(t.payout);
    const ggrSign  = t.isLoss ? -1 : 1;
    const ggr      = (wagerV - payout) * ggrSign;
    const prevUnsettled = r(t.prevU);
    const prevBase      = r(t.prevB);
    // 公式严格按 CLAUDE.md 规则 — 缩放后整数化可能引入 ±1 误差,这不影响示例展示
    const baseRaw   = prevUnsettled + prevBase + (deposit - withdraw - balanceV);
    const base      = Math.max(0, baseRaw);
    const estComRaw = deposit - withdraw - balanceV;
    const estCom    = Math.max(0, estComRaw);
    const settledCom = Math.round(base * rate / 100);
    return {
      id: t.id, agentId, code: t.code, vip: t.vip,
      registered: fixedReg[i] || fixedReg[0],
      deposit, withdraw, wager: wagerV, payout, ggr,
      balance: balanceV,
      rate,
      estCom,
      base,
      baseRaw,
      prevUnsettled,
      prevBase,
      settledCom,
      commission: settledCom,
      isLoss: t.isLoss,
    };
  });
}

// —— 期次列表(已结算) v3.1.46 按结算周期拆分为 周 / 月 两套
function buildSettledPeriodList(cycleType) {
  if (cycleType === 'monthly') {
    return [
      { week:'M2605', start:'2026/5/1 00:00:00', end:'2026/5/31 23:59:59', seed: 25 },
      { week:'M2604', start:'2026/4/1 00:00:00', end:'2026/4/30 23:59:59', seed: 24 },
    ];
  }
  return [
    { week:'W26054', start:'2026/5/25 00:00:00', end:'2026/5/31 23:59:59', seed: 2 },
    { week:'W26053', start:'2026/5/18 00:00:00', end:'2026/5/24 23:59:59', seed: 1 },
  ];
}
// v3.1.92 隐藏日期后面的时间 — '2026/6/1 00:00:00' → '2026/6/1'
const _stripTime = (s) => String(s || '').replace(/\s+\d{1,2}:\d{2}(:\d{2})?\s*$/, '');

const MR_ESTIMATE_INFO = {
  weekly:  { week: 'W26061', period: '2026/6/1 00:00:00 - 2026/6/7 23:59:59',  seed: 3  },
  monthly: { week: 'M2606',  period: '2026/6/1 00:00:00 - 2026/6/30 23:59:59', seed: 26 },
};

function MyRevshareModule() {
  const F = window.APS_FMT;
  const me = window.useCurrentAgent();

  // v3.1.45 结算周期 segmented (每周 / 每月)
  const [cycleType, setCycleType] = React.useState('weekly');

  // 3 个 tab
  const [tab, setTab] = React.useState('estimate'); // estimate | settled | rule

  // 工具栏筛选(两期共用)
  const [q, setQ] = React.useState('');
  const [statusF, setStatusF] = React.useState('all'); // all | profit | loss
  const [page, setPage] = React.useState(1);
  // v3.1.57 已结算记录查询 弹窗
  const [historyRow, setHistoryRow] = React.useState(null);

  // 已结算期 选中哪一期 — 随 cycleType 重算
  const settledList = React.useMemo(() => buildSettledPeriodList(cycleType), [cycleType]);
  const [selectedWeek, setSelectedWeek] = React.useState(settledList[0].week);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  // 切换 周/月 后,如果选中期不在新列表中,重置为新列表首期
  React.useEffect(() => {
    if (!settledList.find(p => p.week === selectedWeek)) {
      setSelectedWeek(settledList[0].week);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleType]);

  const selectedPeriod = settledList.find(p => p.week === selectedWeek) || settledList[0];
  const estimateInfo = MR_ESTIMATE_INFO[cycleType];

  // 关闭下拉:外部点击
  const pickerRef = React.useRef(null);
  React.useEffect(() => {
    if (!pickerOpen) return;
    const h = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [pickerOpen]);

  // 当前期数据 — 随 cycleType 重算(不同 seed 产生不同范例)
  const estimatePlayers = React.useMemo(() => buildPeriodPlayers(me.id, estimateInfo.seed), [me.id, estimateInfo.seed]);
  const settledPlayers  = React.useMemo(() => buildPeriodPlayers(me.id, selectedPeriod.seed), [me.id, selectedPeriod.seed]);
  const players = tab === 'estimate' ? estimatePlayers : settledPlayers;

  const filtered = players.filter(p => {
    if (q && !(p.id + p.code).toLowerCase().includes(q.toLowerCase())) return false;
    if (statusF === 'profit' && p.isLoss) return false;
    if (statusF === 'loss' && !p.isLoss) return false;
    return true;
  });

  // KPI 合计(按当前期所有玩家算)
  const sum = (arr, k) => arr.reduce((a,p)=>a+(p[k]||0),0);
  const totalPlayers   = players.length;
  const totalDep       = sum(players,'deposit');
  const totalWd        = sum(players,'withdraw');
  const totalGap       = totalDep - totalWd;
  const totalBalance   = sum(players,'balance');
  const totalWager     = sum(players,'wager');
  const totalPayout    = sum(players,'payout');
  const totalGgr       = sum(players,'ggr');
  const totalCom       = sum(players,'commission');

  const money = (n) => (n < 0 ? '-₹' : '₹') + F.money(Math.abs(n||0));
  const fmtGap = (n) => (n>=0?'+':'-') + '₹' + F.money(Math.abs(n||0));

  // 重置筛选(切 tab 时)
  const switchTab = (k) => { setTab(k); setPage(1); };

  return (
    <div className="page">
      <MRUI.PageHead
        title={MR_T('page.my_revshare.title','分润报表')}
        subtitle={MR_T('page.my_revshare.sub','查看本期预估分润与历史结算')}
      />

      {/* v3.1.45 结算周期 segmented (每周 / 每月) */}
      <div className="mr-cycle-seg" style={{ display: 'flex', gap: 0, marginBottom: 14, border: '1px solid var(--line)', borderRadius: 8, padding: 4, background: 'var(--bg-2)', width: 'fit-content' }}>
        {[
          { k: 'weekly',  l: MR_T('mr.cycle.weekly','每周结算') },
          { k: 'monthly', l: MR_T('mr.cycle.monthly','每月结算') },
        ].map(c => (
          <div key={c.k}
            onClick={() => { setCycleType(c.k); setPage(1); }}
            style={{
              padding: '8px 22px', fontSize: 13.5, cursor: 'pointer', userSelect: 'none',
              borderRadius: 6, fontWeight: cycleType === c.k ? 600 : 500,
              background: cycleType === c.k ? '#fff' : 'transparent',
              color: cycleType === c.k ? 'var(--brand)' : 'var(--text-2)',
              boxShadow: cycleType === c.k ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              border: cycleType === c.k ? '1px solid var(--brand)' : '1px solid transparent',
              transition: 'all .15s',
            }}>
            {c.l}
          </div>
        ))}
      </div>

      {/* 3 个 tab */}
      <div className="card" style={{padding:0,overflow:'visible'}}>
        <MRUI.Tabs value={tab} onChange={switchTab} tabs={[
          {key:'estimate', label: MR_T('mr.tab.estimate','本期预估分润')},
          {key:'settled',  label: MR_T('mr.tab.settled','已结算分润')},
        ]}/>

        {/* —— 信息条 v3.1.50 与商户后台样式统一(灰色外层 + 白底内层) —— */}
        {tab === 'estimate' && (
          <div className="mr-info-outer" style={{
            padding:'14px 18px',
            background:'var(--bg-2)',
            borderTop:'1px solid var(--line)',
            borderBottom:'1px solid var(--line)',
          }}>
            <div className="mr-info-inner" style={{
              padding:'14px 18px',
              background:'#fff',
              border:'1px solid var(--line)', borderRadius:8,
              boxShadow:'0 1px 2px rgba(15,23,42,0.04)',
              display:'flex',flexDirection:'column',alignItems:'flex-start',gap:8,fontSize:12.5,
            }}>
              {/* v3.1.92 期号 + 状态 一行；周期 另起一行；周期隐藏时间
                  v3.1.97 加 flexWrap 让手机窄屏下「狀態」自动换行,不会被截断 */}
              <div style={{display:'flex',alignItems:'center',gap:32,flexWrap:'wrap',rowGap:8}}>
                <InfoCell l={MR_T('mr.info.week','期號')} v={estimateInfo.week}/>
                <InfoCell l={MR_T('mr.info.status','結算狀態')} v={<span style={{color:'#f59e0b',fontWeight:600}}>{MR_T('mr.info.unsettled','未結算預估分潤')}</span>}/>
              </div>
              <InfoCell l={MR_T('mr.info.period','週期')} v={<span className="text-mono">{_stripTime(estimateInfo.period.split(' - ')[0])} - {_stripTime(estimateInfo.period.split(' - ')[1])}</span>}/>
            </div>
          </div>
        )}

        {tab === 'settled' && (
          <div className="mr-info-outer" style={{
            padding:'14px 18px',
            background:'var(--bg-2)',
            borderTop:'1px solid var(--line)',
            borderBottom:'1px solid var(--line)',
            position:'relative',
          }} ref={pickerRef}>
            <div
              className="mr-settled-bar"
              onClick={()=>setPickerOpen(!pickerOpen)}
              style={{
                padding:'14px 18px',
                background: pickerOpen ? '#eff6ff' : '#fff',
                border:'1.5px solid ' + (pickerOpen ? 'var(--brand)' : '#93c5fd'),
                borderRadius:8,
                boxShadow: pickerOpen ? '0 0 0 3px rgba(59,130,246,0.12)' : '0 1px 3px rgba(59,130,246,0.08)',
                display:'flex',alignItems:'center',gap:18,fontSize:12.5,
                cursor:'pointer', userSelect:'none', transition:'all .15s',
              }}>
              {/* v3.1.92 期號 / 周期 拆为两行，周期隐藏时间 */}
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:8,flex:1,minWidth:0}}>
                <InfoCell l={MR_T('mr.info.week','期號')} v={selectedPeriod.week}/>
                <InfoCell l={MR_T('mr.info.period','週期')} v={<span className="text-mono">{_stripTime(selectedPeriod.start)} - {_stripTime(selectedPeriod.end)}</span>}/>
              </div>
              <span className="mr-switch-btn" style={{
                display:'inline-flex',alignItems:'center',gap:6,
                padding:'6px 12px',borderRadius:6,
                background:'var(--brand)',color:'#fff',
                fontSize:12,fontWeight:600,flexShrink:0,
              }}>
                {MR_T('mr.info.switch','切換期號')}
                <Icon name="chevronDown" size={14} style={{transform:pickerOpen?'rotate(180deg)':'none',transition:'transform .15s'}}/>
              </span>
            </div>
            {pickerOpen && (
              <div className="mr-picker-pop" style={{
                position:'absolute', left:18, right:18, top:'calc(100% - 2px)',
                background:'#fff', border:'1px solid var(--line)', borderRadius:8,
                boxShadow:'0 8px 24px rgba(0,0,0,0.10)', zIndex:20,
                marginTop:4, overflow:'hidden'
              }}>
                {settledList.map(p => (
                  <div
                    key={p.week}
                    className="mr-picker-item"
                    onClick={()=>{setSelectedWeek(p.week);setPickerOpen(false);setPage(1);}}
                    style={{
                      padding:'10px 16px', cursor:'pointer', fontSize:12.5,
                      display:'flex',flexDirection:'column',alignItems:'flex-start',gap:6,
                      background:p.week===selectedWeek?'var(--bg-2)':'#fff',
                      borderBottom:'1px solid var(--line-soft)'
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-2)'}
                    onMouseLeave={e=>e.currentTarget.style.background=p.week===selectedWeek?'var(--bg-2)':'#fff'}>
                    {/* v3.1.92 下拉项 期號 / 周期 也拆两行，周期只显示日期 */}
                    <InfoCell l={MR_T('mr.info.week','期號')} v={p.week}/>
                    <InfoCell l={MR_T('mr.info.period','週期')} v={<span className="text-mono">{_stripTime(p.start)} - {_stripTime(p.end)}</span>}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* —— Tab 内容 —— */}
        {tab !== 'rule' && (
          <div style={{padding:'14px 18px 18px'}}>
            {/* v3.1.86 KPI:6 个 — 移除 总投注 / 总派彩 / GGR */}
            <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(6,1fr)'}}>
              {[
                [MR_T('mr.kpi.players','玩家總數'),  F.fmtNum(totalPlayers)],
                [MR_T('mr.kpi.deposit','總充值金額'),    money(totalDep)],
                [MR_T('mr.kpi.withdraw','總提款金額'),   money(totalWd)],
                [MR_T('mr.kpi.gap','充提差'),            fmtGap(totalGap), totalGap>=0?'up':'down'],
                [MR_T('mr.kpi.balance','總玩家餘額'),    money(totalBalance)],
                [MR_T('mr.kpi.commission','總佣金'),     money(totalCom)],
              ].map(([l,v,delta]) => (
                <div key={l} className="kpi">
                  <div className="label">{l}</div>
                  <div className="val" style={delta==='up'?{color:'var(--success)'}:delta==='down'?{color:'var(--danger)'}:undefined}>{v}</div>
                </div>
              ))}
            </div>

            {/* v3.1.47 工具栏 + 表格 + 分页 用一层 card 包起来 */}
            <div style={{ border:'1px solid var(--line)', borderRadius:8, background:'#fff', padding:'14px 16px' }}>
            {/* 工具栏 */}
            <div className="toolbar" style={{padding:'0 0 12px'}}>
              <MRUI.SearchInput value={q} onChange={(v)=>{setQ(v);setPage(1);}} placeholder={MR_T('mr.filter.search_ph','玩家UID / 邀请Code')} width={220}/>
              <select className="filter-select" value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1);}}>
                <option value="all">{MR_T('mr.filter.all_status','全部用户状态')}</option>
                <option value="profit">{MR_T('mr.status.profit','盈利')}</option>
                <option value="loss">{MR_T('mr.status.loss','亏损')}</option>
              </select>
              <span style={{flex:1}}/>
            </div>

            {/* 表格 13 列 */}
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr>
                  <th>{MR_T('mr.col.uid','玩家 UID')}</th>
                  <th>{MR_T('mr.col.source_code','邀请 Code')}</th>
                  <th>{MR_T('mr.col.registered','注册时间')}</th>
                  <th className="right">{MR_T('mr.col.deposit','充值金额')}</th>
                  <th className="right">{MR_T('mr.col.withdraw','提款金额')}</th>
                  <th className="right">{MR_T('mr.col.gap','充提差')}</th>
                  <th className="right" style={{color:'var(--brand)'}}>
                    {tab === 'estimate'
                      ? MR_T('mr.col.cur_balance','当前余额')
                      : MR_T('mr.col.end_balance','期末余额')}
                  </th>
                  {tab === 'settled' && (
                    <th className="right">{MR_T('mr.col.prev_balance','上期期末余额')}</th>
                  )}
                  {/* v3.1.86 删除 投注 / 派彩 / GGR 三列 */}
                  {tab === 'settled' && (
                    <th className="right">{MR_T('mr.col.prev_base','上期佣金基数')}</th>
                  )}
                  {tab === 'settled' && (
                    <th className="right">{MR_T('mr.col.base','佣金基数')}</th>
                  )}
                  <th className="right">{MR_T('mr.col.rate','分润比例')}</th>
                  <th className="right" style={{color:'var(--brand)'}}>
                    {tab === 'estimate'
                      ? MR_T('mr.col.est_com','预估佣金')
                      : MR_T('mr.col.settled_com','结算佣金')}
                  </th>
                  <th>{MR_T('mr.col.user_status','用户状态')}</th>
                  {tab === 'settled' && (
                    <th>{MR_T('mr.col.history','结算记录')}</th>
                  )}
                </tr></thead>
                <tbody>
                  {filtered.map(p => {
                    const gap = (p.deposit||0) - (p.withdraw||0);
                    return (
                      <tr key={p.id}>
                        <td className="text-mono" style={{color:'var(--text-0)',fontSize:12,fontWeight:600}}>{p.id}</td>
                        <td className="text-mono" style={{color:'var(--brand)',fontSize:11.5}}>{p.code}</td>
                        <td className="text-mono" style={{color:'var(--text-2)',fontSize:11.5}}>{p.registered}</td>
                        <td className="right text-mono">{money(p.deposit)}</td>
                        <td className="right text-mono">{money(p.withdraw)}</td>
                        <td className="right text-mono" style={{color: gap>=0?'var(--success)':'var(--danger)'}}>{fmtGap(gap)}</td>
                        <td className="right text-mono">{money(p.balance)}</td>
                        {tab === 'settled' && (
                          <td className="right text-mono" style={{color:'var(--text-2)'}}>{money(p.prevUnsettled || 0)}</td>
                        )}
                        {/* v3.1.86 删除 投注 / 派彩 / GGR 三列 */}
                        {tab === 'settled' && (
                          <td className="right text-mono" style={{color: (p.prevBase||0) < 0 ? 'var(--danger)' : 'var(--text-2)'}}>{money(p.prevBase || 0)}</td>
                        )}
                        {tab === 'settled' && (
                          <td className="right text-mono">{money(p.base)}</td>
                        )}
                        <td className="right text-mono">{p.rate}%</td>
                        <td className="right text-mono">{money(tab === 'estimate' ? p.estCom : p.settledCom)}</td>
                        <td>
                          {p.isLoss
                            ? <span className="badge b-danger">{MR_T('mr.status.loss','亏损')}</span>
                            : <span className="badge b-success">{MR_T('mr.status.profit','盈利')}</span>}
                        </td>
                        {tab === 'settled' && (
                          <td>
                            <button
                              onClick={() => setHistoryRow(p)}
                              style={{
                                background:'none', border:'none', cursor:'pointer',
                                color:'var(--brand)', fontSize:12.5, fontWeight:500, padding:0,
                              }}
                            >{MR_T('mr.action.query','查询')}</button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={tab === 'settled' ? 14 : 10} style={{textAlign:'center',padding:'40px 0',color:'var(--text-3)'}}>{MR_T('mr.empty','暂无数据')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12,fontSize:12,color:'var(--text-3)'}}>
              <span>{(window.t('pg.summary','共 {total} 条 · 第 {page} / {totalPages} 页') || '').replace('{total}', filtered.length).replace('{page}', 1).replace('{totalPages}', 1)}</span>
            </div>
            </div>
          </div>
        )}

        {/* v3.1.86 删除「分润规则」tab —— 内容由商户后台「分润管理」配置统一展示 */}
      </div>

      {/* v3.1.57 已结算记录查询 */}
      {window.SettlementHistoryModal && (
        <window.SettlementHistoryModal
          open={!!historyRow}
          onClose={() => setHistoryRow(null)}
          agentId={me?._displayId || me?.id}
          agentName={me?.name}
          code={historyRow?.code}
          uid={historyRow?.id}
        />
      )}
    </div>
  );
}

// —— 信息条单元 ——
function InfoCell({l, v}) {
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:8}}>
      <span style={{color:'var(--text-2)'}}>{l}:</span>
      <span style={{color:'var(--text-0)',fontWeight:500}}>{v}</span>
    </span>
  );
}

function RuleRow({l,v}) {
  return (
    <tr>
      <td style={{padding:'8px 0',color:'var(--text-3)',width:160,borderBottom:'1px solid var(--line-soft)'}}>{l}</td>
      <td style={{padding:'8px 0',color:'var(--text-1)',borderBottom:'1px solid var(--line-soft)'}}>{v}</td>
    </tr>
  );
}

window.MyRevshareModule = MyRevshareModule;
