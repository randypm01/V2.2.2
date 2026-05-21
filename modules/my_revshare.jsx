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

// —— 构造一期玩家数据(数据风格与 my_players.jsx 对齐)——
// v3.1.7 佣金/基数重新计算:
//   预估佣金 = max(0, 充值 - 提款 - 余额)
//   分润基数(仅已结算期) = max(0, 上期未结算余额 + 上期佣金基数 + (本期充值 - 本期提款 - 本期结算余额))
//   结算佣金 = 分润基数 × 分润比例
function buildPeriodPlayers(agentId, seed) {
  // 用 seed 让不同期数据稍有不同(乘以 0.7 ~ 1.3 之间的系数)
  const factor = 0.7 + (((seed * 31) % 7) / 10);
  const fixedReg = ['2026/5/12 10:24:31','2026/5/05 16:08:54','2026/4/18 22:41:09','2026/5/14 09:15:42'];
  const make = (id, code, vip, dep, wd, wager, balance, isLoss, prevUnsettled, prevBase, regAt) => {
    const deposit  = Math.round(dep * factor);
    const withdraw = Math.round(wd * factor);
    const wagerV   = Math.round(wager * factor);
    const payout   = Math.round(wagerV * 0.92);
    const ggrSign  = isLoss ? -1 : 1;
    const ggr      = (wagerV - payout) * ggrSign;
    const rate     = 5;
    const balanceV = Math.round(balance * factor);
    // 分润基数(仅已结算期用):(上期未结算余额 + 上期佣金基数) + (本期充值 - 本期提款 - 本期结算余额)
    const baseRaw = (prevUnsettled || 0) + (prevBase || 0) + (deposit - withdraw - balanceV);
    const base    = Math.max(0, baseRaw);
    // 预估佣金(仅预估期用):max(0, 充值 - 提款 - 余额)
    const estComRaw = deposit - withdraw - balanceV;
    const estCom    = Math.max(0, estComRaw);
    // 结算佣金 = 分润基数 × 分润比例
    const settledCom = Math.round(base * rate / 100);
    return {
      id, agentId, code, vip,
      registered: regAt,
      deposit, withdraw, wager: wagerV, payout, ggr,
      balance: balanceV,
      rate,
      estCom,            // 预估佣金
      base,              // 分润基数(已 max(0))
      baseRaw,           // 原始分润基数(含负)— 预留以防未来需要
      prevUnsettled: prevUnsettled || 0,
      prevBase: prevBase || 0,
      settledCom,        // 结算佣金
      commission: settledCom, // 兼容原字段(KPI 总佣金用)
      isLoss,
    };
  };
  // 参数增加 prevUnsettled / prevBase — 模拟上期结转数据
  return [
    make('P12354531','RANDY01', 1, 10000, 10000, 10000, 10000, false,  200,  500, fixedReg[0]),
    make('P12354532','RANDY02', 1, 10000, 10000, 10000, 10000, false,  -100, 300, fixedReg[1]),
    make('P12354533','RANDY03', 1, 10000, 10000, 10000, 10000, true,   0,    0,   fixedReg[2]),
    make('P12354534','RANDY04', 1, 10000, 10000, 10000, 10000, true,   -800, 0,   fixedReg[3]),
  ];
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

  const money = (n) => '₹' + F.money(n||0);
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
      <div style={{ display: 'flex', gap: 0, marginBottom: 14, border: '1px solid var(--line)', borderRadius: 8, padding: 4, background: 'var(--bg-2)', width: 'fit-content' }}>
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
          {key:'rule',     label: MR_T('mr.tab.rule','分润规则')},
        ]}/>

        {/* —— 信息条 —— */}
        {tab === 'estimate' && (
          <div style={{
            padding:'12px 16px', margin:'14px 18px 0',
            border:'1px solid var(--line)', borderRadius:6,
            display:'flex',alignItems:'center',gap:32,fontSize:12.5
          }}>
            <InfoCell l={MR_T('mr.info.week','期號')} v={estimateInfo.week}/>
            <InfoCell l={MR_T('mr.info.status','結算狀態')} v={<span style={{color:'#f59e0b',fontWeight:600}}>{MR_T('mr.info.unsettled','未結算預估分潤')}</span>}/>
            <InfoCell l={MR_T('mr.info.period','週期')} v={<span className="text-mono">{estimateInfo.period}</span>}/>
          </div>
        )}

        {tab === 'settled' && (
          <div style={{padding:'14px 18px 0',position:'relative'}} ref={pickerRef}>
            <div
              onClick={()=>setPickerOpen(!pickerOpen)}
              style={{
                padding:'12px 16px',
                border:'1px solid var(--line)', borderRadius:6,
                display:'flex',alignItems:'center',gap:32,fontSize:12.5,
                cursor:'pointer', userSelect:'none',
                background:pickerOpen ? 'var(--bg-2)' : 'transparent'
              }}>
              <InfoCell l={MR_T('mr.info.week','期號')} v={selectedPeriod.week}/>
              <InfoCell l={MR_T('mr.info.period','週期')} v={<span className="text-mono">{selectedPeriod.start} - {selectedPeriod.end}</span>}/>
              <span style={{flex:1}}/>
              <Icon name={pickerOpen?'chevronDown':'chevronDown'} size={14} style={{color:'var(--text-2)',transform:pickerOpen?'rotate(180deg)':'none',transition:'transform .15s'}}/>
            </div>
            {pickerOpen && (
              <div style={{
                position:'absolute', left:18, right:18, top:'100%',
                background:'#fff', border:'1px solid var(--line)', borderRadius:6,
                boxShadow:'0 4px 16px rgba(0,0,0,0.08)', zIndex:20,
                marginTop:4, overflow:'hidden'
              }}>
                {settledList.map(p => (
                  <div
                    key={p.week}
                    onClick={()=>{setSelectedWeek(p.week);setPickerOpen(false);setPage(1);}}
                    style={{
                      padding:'10px 16px', cursor:'pointer', fontSize:12.5,
                      display:'flex',alignItems:'center',gap:32,
                      background:p.week===selectedWeek?'var(--bg-2)':'#fff',
                      borderBottom:'1px solid var(--line-soft)'
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-2)'}
                    onMouseLeave={e=>e.currentTarget.style.background=p.week===selectedWeek?'var(--bg-2)':'#fff'}>
                    <InfoCell l={MR_T('mr.info.week','期號')} v={p.week}/>
                    <InfoCell l={MR_T('mr.info.period','週期')} v={<span className="text-mono">{p.start} - {p.end}</span>}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* —— Tab 内容 —— */}
        {tab !== 'rule' && (
          <div style={{padding:'14px 18px 18px'}}>
            {/* KPI:9 个,5 列网格自动换行(5 + 4) */}
            <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
              {[
                [MR_T('mr.kpi.players','玩家總數'),  F.fmtNum(totalPlayers)],
                [MR_T('mr.kpi.deposit','總充值金額'),    money(totalDep)],
                [MR_T('mr.kpi.withdraw','總提款金額'),   money(totalWd)],
                [MR_T('mr.kpi.gap','充提差'),            fmtGap(totalGap), totalGap>=0?'up':'down'],
                [MR_T('mr.kpi.balance','總玩家餘額'),    money(totalBalance)],
                [MR_T('mr.kpi.wager','總投注'),          money(totalWager)],
                [MR_T('mr.kpi.payout','總派彩'),         money(totalPayout)],
                [MR_T('mr.kpi.ggr','GGR'),               fmtGap(totalGgr), totalGgr>=0?'up':'down'],
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
                      : MR_T('mr.col.settled_balance','结算余额')}
                  </th>
                  <th className="right">{MR_T('mr.col.wager','投注')}</th>
                  <th className="right">{MR_T('mr.col.payout','派彩')}</th>
                  <th className="right">GGR</th>
                  {tab === 'settled' && (
                    <th className="right">{MR_T('mr.col.base','分润基数')}</th>
                  )}
                  <th className="right">{MR_T('mr.col.rate','分润比例')}</th>
                  <th className="right" style={{color:'var(--brand)'}}>
                    {tab === 'estimate'
                      ? MR_T('mr.col.est_com','预估佣金')
                      : MR_T('mr.col.settled_com','结算佣金')}
                  </th>
                  <th>{MR_T('mr.col.user_status','用户状态')}</th>
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
                        <td className="right text-mono">{money(p.wager)}</td>
                        <td className="right text-mono">{money(p.payout)}</td>
                        <td className="right text-mono" style={{color: p.ggr>=0?'var(--success)':'var(--danger)'}}>{(p.ggr>=0?'+':'-')+'₹'+F.money(Math.abs(p.ggr||0))}</td>
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
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={tab === 'settled' ? 14 : 13} style={{textAlign:'center',padding:'40px 0',color:'var(--text-3)'}}>{MR_T('mr.empty','暂无数据')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12,fontSize:12,color:'var(--text-3)'}}>
              <span>{MR_T('mr.pagination.total','共')} {filtered.length} {MR_T('mr.pagination.items','条')} · {MR_T('mr.pagination.page','第')} 1/1 {MR_T('mr.pagination.page_unit','页')}</span>
            </div>
            </div>
          </div>
        )}

        {/* —— 分润规则 tab —— */}
        {tab === 'rule' && (
          <div style={{padding:'18px'}}>
            <div className="card-inner" style={{maxWidth:720,margin:'0 auto'}}>
              <div className="form-section-title" style={{marginTop:0}}>{MR_T('mr.rule.title','RevShare 方案')}</div>
              <table style={{width:'100%',fontSize:12.5}}>
                <tbody>
                  <RuleRow l={MR_T('mr.rule.rate','分润比例')} v="5% × GGR"/>
                  <RuleRow l={MR_T('mr.rule.ngr','分润计算公式')} v="GGR(投注 − 派彩) × 分润比例"/>
                  <RuleRow l={MR_T('mr.rule.cycle','结算周期')} v={MR_T('mr.rule.cycle_v','每周一结算上一周')}/>
                  <RuleRow l={MR_T('mr.rule.carry','负盈利结转')} v={MR_T('mr.rule.carry_v','是 · 上期负数计入下期,直至清偿')}/>
                  <RuleRow l={MR_T('mr.rule.currency','结算币种')} v="INR (₹)"/>
                  <RuleRow l={MR_T('mr.rule.min','最低结算金额')} v="₹200 (低于该金额顺延至下期)"/>
                  <RuleRow l={MR_T('mr.rule.hold','持有期')} v={MR_T('mr.rule.hold_v','结算后 7 天可申请提款')}/>
                </tbody>
              </table>
              <div className="form-section-title mt-3">{MR_T('mr.rule.tier','阶梯奖励 (达成额外奖励)')}</div>
              <div style={{display:'grid',gap:6,fontSize:12.5}}>
                {[
                  ['月 GGR ≥ ₹5,000', '+2%', '本月分润比例 → 7%'],
                  ['月 GGR ≥ ₹20,000', '+5%', '本月分润比例 → 10%'],
                  ['月 GGR ≥ ₹50,000', '+8% + 升级', '分润 → 13%,等级升白金'],
                  ['月 GGR ≥ ₹100,000', '一对一专属经理', '议价空间 + 加速结算'],
                ].map(([t, b, d], i) => (
                  <div key={i} style={{display:'flex',padding:'10px 14px',background:'var(--bg-2)',borderRadius:6,gap:12,alignItems:'center'}}>
                    <span style={{width:160,color:'var(--text-1)'}}>{t}</span>
                    <span className="badge b-success" style={{minWidth:80,textAlign:'center'}}>{b}</span>
                    <span className="text-mute" style={{fontSize:11.5,flex:1}}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
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
