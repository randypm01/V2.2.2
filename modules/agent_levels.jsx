// v2.4.40 代理等级管理(占位)
function AgentLevelsModule() {
  const APH = window.UI.PageHead;
  const Icon = window.Icon;
  const LEVELS = [
    { k:'LV-1', name:'入门代理', minPlayers:0,    minNgr:0,        cpaBonus:'+0%',  revBonus:'+0%',  color:'#94a3b8', count:24 },
    { k:'LV-2', name:'进阶代理', minPlayers:50,   minNgr:5000,     cpaBonus:'+5%',  revBonus:'+3%',  color:'#0ea5e9', count:18 },
    { k:'LV-3', name:'高级代理', minPlayers:200,  minNgr:25000,    cpaBonus:'+10%', revBonus:'+5%',  color:'#8b5cf6', count:12 },
    { k:'LV-4', name:'金牌代理', minPlayers:500,  minNgr:80000,    cpaBonus:'+15%', revBonus:'+8%',  color:'#f59e0b', count:6 },
    { k:'LV-5', name:'钻石代理', minPlayers:1500, minNgr:300000,   cpaBonus:'+25%', revBonus:'+12%', color:'#16a34a', count:2 },
  ];

  return (
    <div className="page">
      <APH title="代理等级管理" subtitle="按业绩自动晋级,等级越高 CPA / RevShare 加成越高"/>

      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <button className="btn primary"><Icon name="plus" size={13}/>新增等级</button>
        <button className="btn"><Icon name="settings" size={13}/>晋级规则配置</button>
        <span style={{flex:1}}/>
        <button className="btn ghost"><Icon name="info" size={13}/>说明</button>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{width:80}}>等级</th>
                <th>等级名称</th>
                <th>最低玩家数</th>
                <th>最低 NGR</th>
                <th>CPA 加成</th>
                <th>RevShare 加成</th>
                <th className="right">代理数</th>
                <th style={{width:120}}>操作</th>
              </tr>
            </thead>
            <tbody>
              {LEVELS.map(lv => (
                <tr key={lv.k}>
                  <td>
                    <span style={{
                      display:'inline-block',padding:'2px 10px',borderRadius:12,
                      border:'1px solid '+lv.color,color:lv.color,
                      background: lv.color+'22',
                      fontWeight:600,fontSize:12,fontFamily:'JetBrains Mono'
                    }}>{lv.k}</span>
                  </td>
                  <td style={{color:'var(--text-0)',fontWeight:500}}>{lv.name}</td>
                  <td className="text-mono">{lv.minPlayers}</td>
                  <td className="text-mono">${lv.minNgr.toLocaleString()}</td>
                  <td className="text-mono" style={{color:'#16a34a',fontWeight:600}}>{lv.cpaBonus}</td>
                  <td className="text-mono" style={{color:'#16a34a',fontWeight:600}}>{lv.revBonus}</td>
                  <td className="right text-mono">{lv.count}</td>
                  <td>
                    <a style={{color:'var(--brand)',cursor:'pointer',fontSize:13,marginRight:12}}>编辑</a>
                    <a style={{color:'var(--text-2)',cursor:'pointer',fontSize:13}}>查看代理</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{marginTop:16,padding:14,background:'#f8fafc',border:'1px solid var(--line)',borderRadius:8,fontSize:12.5,color:'var(--text-2)',lineHeight:1.7}}>
        <div style={{fontWeight:600,color:'var(--text-0)',marginBottom:4}}>晋级规则</div>
        系统每日 00:00 自动统计代理近 30 天数据,同时满足「最低玩家数」与「最低 NGR」条件即自动晋级;不满足条件连续 30 天自动降级。CPA / RevShare 加成在晋级生效次日开始计入。
      </div>
    </div>
  );
}

window.AgentLevelsModule = AgentLevelsModule;
