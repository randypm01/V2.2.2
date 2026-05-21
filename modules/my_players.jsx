// 代理后台 - 玩家损益 P0-4
// v3.0.102 按截图重做:
//   - 副标题改「查看邀请玩家的清单」
//   - KPI 由 6 个改为 11 个(玩家总数 / 总首存人数 / 总首存金额 / 总充值金额 / 累计提款金额 / 充提差 / 总玩家余额 / 总投注 / 总派彩 / GGR / 总佣金)
//   - 工具栏:玩家UID / 邀请Code 搜索 + 全部 VIP 下拉 + 时间维度(复用 my_codes 的 TimeRange)
//   - 表格 12 列:UID / 来源 Code / VIP 等级 / 首次存款金额 / 充值金额 / 提款金额 / 充提差 / 玩家余额 / 累计投注 / 累计派彩 / GGR / 佣金
//   - 移除 tabs / CPA / 风控 / 注册 / 首存 / 国家 列
const APUI = window.UI;
const MP_T = (k, fb) => window.t(k, fb);

// v3.0.102 5 条固定示例玩家 — 字段配合新表格列(增加 ftdAmt / playerBalance / payout / commission)
function buildSamplePlayers(agentId) {
  const days = (n) => Date.now() - n * 86400000;
  const fmtTs = (n) => {
    const d = new Date(days(n));
    const pad = (x) => String(x).padStart(2,'0');
    return d.getFullYear()+'/'+pad(d.getMonth()+1)+'/'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
  };
  const make = (id, code, vip, ftdAmt, dep, wd, wager, balance, regDays) => {
    const payout = Math.round(wager * 0.92);  // 玩家累计赢回(派彩)≈ 投注 × 92%
    const ggr = wager - payout;                 // 平台毛利 = 投注 − 派彩
    const commission = Math.round(ggr * 0.30);  // 代理佣金 ≈ GGR × 30%
    return { id, agentId, code, vip, ftdAmt, deposit:dep, withdraw:wd, wager, payout, ggr, balance, commission, registered: fmtTs(regDays) };
  };
  return [
    make('P12354531','RANDY01',1, 100,   1200,  350,   8400,  730,  3),
    make('P12354532','RANDY02',3, 500,   5800,  2100, 48000, 2150, 12),
    make('P12354533','RANDY03',5, 2000, 18500,  7200,124000, 4100, 45),
    make('P12354534','RANDY01',0, 50,    240,   0,    980,   240,  1),
    make('P12354535','RANDY04',2, 300,   3200,  1500, 21000, 980,  28),
  ];
}

function MyPlayersModule() {
  const me = window.useCurrentAgent();
  const F = window.APS_FMT;
  const [q, setQ] = React.useState('');
  const [timeRange, setTimeRange] = React.useState(() => {
    const end = new Date(); end.setHours(23,59,59,0);
    const start = new Date(end); start.setDate(end.getDate() - 6); start.setHours(0,0,0,0);
    return { preset:'7d', start, end };
  });
  const [page, setPage] = React.useState(1);

  const players = React.useMemo(() => buildSamplePlayers(me.id), [me.id]);

  const filtered = players.filter(p => {
    if (q && !(p.id + p.code).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const pageSize = 14;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  // KPI 合计
  const sum = (k) => players.reduce((a,p)=>a+(p[k]||0),0);
  const totalFtdUsers = players.length;  // 全部都已首存
  const totalFtdAmt   = sum('ftdAmt');
  const totalDep      = sum('deposit');
  const totalWd       = sum('withdraw');
  const totalGap      = totalDep - totalWd;
  const totalBalance  = sum('balance');
  const totalWager    = sum('wager');
  const totalPayout   = sum('payout');
  const totalGgr      = sum('ggr');
  const totalCom      = sum('commission');

  const money = (n) => '₹' + F.money(n||0);
  const fmtGap = (n) => (n>=0?'+':'-') + '₹' + F.money(Math.abs(n||0));

  return (
    <div className="page">
      <APUI.PageHead
        title={MP_T('page.my_players.title','玩家损益')}
        subtitle={MP_T('page.my_players.sub','查看邀请玩家的清单')}
      />

      {/* KPI:2 行 × 5 + 1 个 = 11 个;用 5 列网格自动换行 */}
      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {[
          [MP_T('mp.kpi.total_players','玩家总数'),  F.fmtNum(players.length)],
          [MP_T('mp.kpi.ftd_users','总首存人数'),    F.fmtNum(totalFtdUsers)],
          [MP_T('mp.kpi.ftd_amt','总首存金额'),      money(totalFtdAmt)],
          [MP_T('mp.kpi.deposit','总充值金额'),      money(totalDep)],
          [MP_T('mp.kpi.withdraw','总提款金额'),     money(totalWd)],
          [MP_T('mp.kpi.gap','充提差'),              fmtGap(totalGap), totalGap>=0?'up':'down'],
          [MP_T('mp.kpi.wager','总投注'),            money(totalWager)],
          [MP_T('mp.kpi.payout','总派彩'),           money(totalPayout)],
          [MP_T('mp.kpi.ggr','GGR'),                 fmtGap(totalGgr), totalGgr>=0?'up':'down'],
        ].map(([l,v,delta]) => (
          <div key={l} className="kpi">
            <div className="label">{l}</div>
            <div className="val" style={delta==='up'?{color:'var(--success)'}:delta==='down'?{color:'var(--danger)'}:undefined}>{v}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="toolbar">
          <APUI.SearchInput value={q} onChange={setQ} placeholder={MP_T('mp.filter.search_ph','玩家 UID / 邀请 Code')} width={220}/>
          {window.TimeRange && <window.TimeRange value={timeRange} onChange={(v)=>{setTimeRange(v);setPage(1);}}/>}
          <span style={{flex:1}}/>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>{MP_T('mp.col.uid','玩家 UID')}</th>
              <th>{MP_T('mp.col.source_code','邀请 Code')}</th>
              <th>{MP_T('mp.col.registered','注册时间')}</th>
              <th className="right">{MP_T('mp.col.ftd_amt','首次存款金额')}</th>
              <th className="right">{MP_T('mp.col.deposit','充值金额')}</th>
              <th className="right">{MP_T('mp.col.withdraw','提款金额')}</th>
              <th className="right">{MP_T('mp.col.gap','充提差')}</th>
              <th className="right">{MP_T('mp.col.wager','投注')}</th>
              <th className="right">{MP_T('mp.col.payout','派彩')}</th>
              <th className="right">{MP_T('mp.col.ggr','GGR')}</th>
            </tr></thead>
            <tbody>
              {paged.map(p => {
                const gap = (p.deposit||0) - (p.withdraw||0);
                return (
                  <tr key={p.id}>
                    <td className="text-mono" style={{color:'var(--text-0)',fontSize:12,fontWeight:600}}>{p.id}</td>
                    <td className="text-mono" style={{color:'var(--brand)',fontSize:11.5}}>{p.code}</td>
                    <td className="text-mono" style={{color:'var(--text-2)',fontSize:11.5}}>{p.registered}</td>
                    <td className="right text-mono">{money(p.ftdAmt)}</td>
                    <td className="right text-mono">{money(p.deposit)}</td>
                    <td className="right text-mono">{money(p.withdraw)}</td>
                    <td className="right text-mono" style={{color: gap>=0?'var(--success)':'var(--danger)'}}>{fmtGap(gap)}</td>
                    <td className="right text-mono">{money(p.wager)}</td>
                    <td className="right text-mono">{money(p.payout)}</td>
                    <td className="right text-mono" style={{color: p.ggr>=0?'var(--success)':'var(--danger)'}}>{(p.ggr>=0?'+':'-')+'₹'+F.money(Math.abs(p.ggr||0))}</td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr><td colSpan={10} style={{textAlign:'center',padding:'40px 0',color:'var(--text-3)'}}>{MP_T('mp.empty','暂无玩家数据')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <APUI.Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage}/>
      </div>
    </div>
  );
}

window.MyPlayersModule = MyPlayersModule;
