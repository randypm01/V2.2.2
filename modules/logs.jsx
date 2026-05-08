// 操作日志
const LUI = window.UI;

function LogsModule() {
  const D = window.APS_DATA;
  const [logs] = React.useState(D.logs);
  const [q, setQ] = React.useState('');
  const [type, setType] = React.useState('all');
  const [page, setPage] = React.useState(1);

  const filtered = logs.filter(l => {
    if (type !== 'all' && l.action !== type) return false;
    if (q && !(l.target+l.operator+l.id).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const pageSize = 16;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  const actionMap = {
    create_agent: { color: '#22c55e', label: '创建代理' },
    modify_agent: { color: '#3b82f6', label: '修改代理' },
    modify_commission: { color: '#a855f7', label: '修改分润' },
    approve_cpa: { color: '#06b6d4', label: '审核CPA' },
    approve_settlement: { color: '#f59e0b', label: '审核结算' },
    freeze_commission: { color: '#ef4444', label: '冻结佣金' },
    approve_withdrawal: { color: '#22c55e', label: '审核提款' },
    risk_action: { color: '#ef4444', label: '风控处理' },
  };

  return (
    <div className="page">
      <LUI.PageHead title="操作日志" subtitle="后台代理系统所有操作记录与审计追溯">
        <button className="btn"><Icon name="download" size={13}/>导出日志</button>
      </LUI.PageHead>

      <div className="card">
        <div className="toolbar">
          <LUI.SearchInput value={q} onChange={setQ} placeholder="操作目标 / 操作人 / 日志ID" width={280}/>
          <select className="filter-select" value={type} onChange={e=>setType(e.target.value)}>
            <option value="all">全部操作类型</option>
            {Object.entries(actionMap).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="filter-select"><option>全部操作人</option><option>admin</option><option>finance.amy</option><option>risk.tom</option></select>
          <LUI.DateRange value="7d" onChange={()=>{}}/>
          <span style={{flex:1}}/>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>日志ID</th>
              <th>操作类型</th>
              <th>操作目标</th>
              <th>操作人</th>
              <th>设备</th>
              <th>IP 地址</th>
              <th>结果</th>
              <th>操作时间</th>
              <th style={{width:60}}>详情</th>
            </tr></thead>
            <tbody>
              {paged.map(l => (
                <tr key={l.id}>
                  <td className="id">{l.id}</td>
                  <td>
                    <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                      <span style={{width:6,height:6,borderRadius:'50%',background:actionMap[l.action]?.color || '#888'}}/>
                      {actionMap[l.action]?.label || l.action}
                    </span>
                  </td>
                  <td className="id" style={{color:'var(--brand)'}}>{l.target}</td>
                  <td>
                    <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                      <window.UI.Avatar name={l.operator}/>
                      <span style={{color:'var(--text-1)'}}>{l.operator}</span>
                    </span>
                  </td>
                  <td className="text-mute" style={{fontSize:11}}>{l.device}</td>
                  <td className="text-mono text-mute" style={{fontSize:11}}>{l.ip}</td>
                  <td><LUI.StatusBadge status={l.result}/></td>
                  <td className="text-mute" style={{fontSize:11}}>{new Date(l.at).toLocaleString('zh-CN')}</td>
                  <td><button className="btn sm ghost icon-only"><Icon name="eye" size={13}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <LUI.Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage}/>
      </div>
    </div>
  );
}

window.LogsModule = LogsModule;
