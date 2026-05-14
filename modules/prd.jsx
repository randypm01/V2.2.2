// PRD 规划 — 优先级总览 + P0/P1/P2/P3 子功能详情
const PRDUI = window.UI;

// ============= 实现位置助手 =============
// mapping: [{ backend:'merchant'|'agent', mod:'<navKey>', path:'侧栏路径文字' }]
// 用于从 PRD feat 跳转到对应后台菜单,并在详情页 / 总览 chip 中渲染多归属
const SIDE_STYLE = {
  merchant: { label:'商户后台', bg:'#dbeafe', fg:'#1e40af' },
  agent:    { label:'代理后台', bg:'#fef3c7', fg:'#92400e' },
};
function uniqBackends(mapping) {
  if (!mapping || !mapping.length) return [];
  const out = []; const seen = new Set();
  mapping.forEach(m => { if (!seen.has(m.backend)) { seen.add(m.backend); out.push(m.backend); } });
  return out;
}

// ============= 各阶段子功能详情(按开发顺序) =============
const PRD_FEATURES = {
  P0: [
    { id:'P0-1', name:'代理账户管理', week:'W1', dev:8, status:'done',
      side:'商户后台',
      mapping:[
        { backend:'merchant', mod:'agents', path:'运营 → 代理账户管理' }
      ],
      why:'代理是平台一切的根 — 没有代理就没有 Code、玩家、CPA、分润、结算。整个数据模型必须先立起来',
      scope:['创建专业代理账号(账号/密码/类型/层级)','设定上级代理 / 国家 / 市场 / 币种','设定初始分润模式(CPA / RevShare / Hybrid)','是否允许创建下级代理','启用 / 停用 / 冻结 / 封禁状态机','代理详情(基本资料 / 登录信息 / 玩家数据 / 佣金数据)'],
      deps:['权限基础设施'] },
    { id:'P0-2', name:'代理权限配置', week:'W1', dev:3, status:'done',
      side:'商户后台',
      mapping:[
        { backend:'merchant', mod:'agents', path:'运营 → 代理账户管理(权限抽屉)' }
      ],
      why:'代理可见数据范围与可执行操作必须在创建后立刻确定,后续模块都依赖这个权限矩阵',
      scope:['是否可查看玩家列表 / 下级代理 / 风控名单','是否可创建下级代理 / 分享 Code','是否可申请提款 / 使用 API / 下载素材'],
      deps:['P0-1 代理账户'] },
    { id:'P0-3', name:'分享 Code 与推广链接', week:'W2', dev:5, status:'done',
      side:'共用',
      mapping:[
        { backend:'merchant', mod:'codes', path:'运营 → 分享 Code 与链接' },
        { backend:'agent', mod:'my_codes', path:'推广 → 分享 Code 与链接' }
      ],
      why:'代理拉玩家的入口 — 玩家归属、CPA 归因、分润计算全部依赖 Code',
      scope:['唯一 Code 生成与防撞','短链 / QR Code / Deep Link','UTM / Click ID / Sub ID 透传','启用 / 停用 / 设定有效时间','Code 报表(Clicks / 注册 / FTD / NGR / ROI)'],
      deps:['P0-1 代理账户'] },
    { id:'P0-4', name:'玩家管理', week:'W2-W3', dev:8, status:'done',
      side:'商户后台',
      mapping:[
        { backend:'merchant', mod:'players', path:'运营 → 玩家管理' },
        { backend:'agent', mod:'my_players', path:'推广 → 我的玩家' }
      ],
      why:'CPA 与分润必须有干净的玩家数据 — 归属、流水、状态都要可查',
      scope:['玩家列表 + 多维过滤(代理 / Code / VIP / 状态)','充提 / 投注 / NGR 时间线','归属代理与归属链路','玩家详情抽屉(注册信息 / 设备 / 支付方式)','是否计入 CPA / RevShare 标记'],
      deps:['P0-3 Code 与链接'] },
    { id:'P0-5', name:'CPA 方案配置', week:'W3', dev:5, status:'done',
      side:'商户后台',
      mapping:[
        { backend:'merchant', mod:'cpa', path:'收益 → CPA 管理' }
      ],
      why:'CPA 是最常见的代理结算模式 — 规则要先立,审核才能跑',
      scope:['CPA 金额 / 最低首存 / 流水倍数 / NGR 要求','留存条件(D1/D3) / 排除风控玩家','适用代理 / 市场 / 币种','CPA 有效条件(IP / 设备 / 支付方式)'],
      deps:['P0-1','P0-4'] },
    { id:'P0-6', name:'CPA 审核与报表', week:'W3-W4', dev:6, status:'done',
      side:'共用',
      mapping:[
        { backend:'merchant', mod:'cpa', path:'收益 → CPA 管理(审核 Tab)' },
        { backend:'agent', mod:'my_cpa', path:'收益 → CPA 报表' }
      ],
      why:'CPA 达标判定必须有人工把关,所有结果都要可追溯',
      scope:['有效 CPA 报表(代理/玩家/金额/状态)','审核队列(Pending / Approved / Rejected / Risk Hold)','批量通过 / 驳回 + 拒绝原因','CPA 拒绝原因报表(同 IP / 同设备 / 套利 ...)'],
      deps:['P0-5'] },
    { id:'P0-7', name:'分润合作模式', week:'W4', dev:6, status:'done',
      side:'共用',
      mapping:[
        { backend:'merchant', mod:'revshare', path:'收益 → 分润管理' },
        { backend:'agent', mod:'my_revshare', path:'收益 → 分润报表' }
      ],
      why:'CPA 之外的 RevShare / Hybrid 必须可配,代理在签约时就要确定',
      scope:['CPA / RevShare / Hybrid / 固定奖励 / 阶梯 / 下级抽成','分润周期 / 结算币种 / 最低结算金额','负盈利是否结转','代理分润方案(适用代理 / 层级 / 比例 / 封顶)'],
      deps:['P0-1'] },
    { id:'P0-8', name:'结算单生成与审核', week:'W4-W5', dev:10, status:'done',
      side:'代理后台',
      mapping:[
        { backend:'agent', mod:'my_settlement', path:'收益 → 结算单' }
      ],
      why:'代理收益最终落地的环节 — 财务安全的核心',
      scope:['结算单自动生成(按周期)','多级审核流(运营 → 财务 → 风控 → 商户确认)','佣金调整(增/减/补/冻/解冻)','结算单详情(CPA / RevShare / 下级 / 扣款明细)','拒绝结算 / 重新计算'],
      deps:['P0-6','P0-7'] },
    { id:'P0-9', name:'代理钱包与提款', week:'W5', dev:6, status:'done',
      side:'代理后台',
      mapping:[
        { backend:'agent', mod:'my_wallet', path:'收益 → 我的钱包 / 提款' }
      ],
      why:'代理可见的资金账户 — 余额 / 流水 / 提款一体化',
      scope:['可提款 / 待结算 / 冻结 / 提款中余额','钱包流水(入账 / 提款 / 调整 / 风控扣除)','提款申请(USDT / 银行 / PIX / UPI)','提款审核与付款执行','付款凭证留档'],
      deps:['P0-8 结算管理'] },
    { id:'P0-10', name:'风控玩家名单', week:'W5-W6', dev:8, status:'done',
      side:'共用',
      mapping:[
        { backend:'merchant', mod:'risk', path:'风控与配置 → 风控管理' }
      ],
      why:'防止套利与欺诈 — 平台生死线,P0 必须有最小可用风控',
      scope:['风控玩家列表(原因 / 等级 / 处理状态)','CPA 风控审核(同 IP / 同设备 / 多账号 / 投注 / 提款)','是否计入 CPA / RevShare / 是否冻结佣金','人工标注与申诉','加入黑名单'],
      deps:['P0-4 玩家管理'] },
    { id:'P0-11', name:'仪表盘', week:'W6', dev:5, status:'done',
      side:'共用',
      mapping:[
        { backend:'merchant', mod:'dashboard', path:'运营 → 仪表盘' }
      ],
      why:'前 10 项数据齐了才能做汇总 — 仪表盘放在 P0 末尾,基于真实数据',
      scope:['代理总览(注册数 / 新增下级 / Clicks / FTD / NGR)','转化漏斗 7 阶段','收益趋势(CPA / RevShare / Hybrid)','风控提醒 + 待处理事项'],
      deps:['P0-1 ~ P0-10'] },
    { id:'P0-12', name:'操作日志', week:'W6', dev:4, status:'removed',
      side:'已移除',
      mapping:[],
      why:'v2.4.48 简化版移除 — 商户后台侧栏已去掉「操作日志」入口,代理详情弹窗内仍保留「操作记录」tab 作为轻量版本',
      scope:[],
      deps:[] },
    { id:'P0-13', name:'代理我的账户', week:'W6', dev:4, status:'done',
      side:'代理后台',
      mapping:[
        { backend:'agent', mod:'my_profile', path:'我的账户 → 我的账户' }
      ],
      why:'代理登录后第一个看到的页面 — 基本信息 / 合作方案 / 安全设置',
      scope:['基本资料(ID / 名称 / 层级 / 国家)','登录安全(改密 / 2FA / 设备记录)','合作方案查看(CPA / RevShare / 周期 / 最低提款)','合作条款下载'],
      deps:['P0-1 代理账户'] },
    { id:'P0-14', name:'代理通知中心', week:'W6', dev:3, status:'done',
      side:'代理后台',
      mapping:[
        { backend:'agent', mod:'my_notify', path:'我的账户 → 通知中心' }
      ],
      why:'结算 / 风控 / 活动等关键事件需主动触达代理',
      scope:['通知列表(系统 / 结算 / 风控 / 活动)','通知详情(标题 / 内容 / 类型 / 已读)','站内信中心'],
      deps:['P0-8','P0-10'] },
  ],
};

const PHASES = [
  { key:'P0', label:'MVP 上线', color:'#22c55e', tone:'b-success', timeline:'W1 – W6',
    goal:'商户后台跑通 创建代理 → 拉玩家 → 算 CPA / 分润 → 出结算 → 提款 全链路',
    status:'已完成', pct:100 },
];

// ============= 子页面:规划优先级总览 =============
function PRDOverview({ onSelect }) {
  return (
    <div className="page">
      <PRDUI.PageHead title="规划优先级" subtitle="APS-WS 代理推广分润系统 · P0 ~ P3 阶段路线图">
        <span className="badge b-info">v2.6.0</span>
        <button className="btn"><Icon name="download" size={13}/>导出 PRD</button>
      </PRDUI.PageHead>

      {/* 时间轴 */}
      <div className="card" style={{padding:'18px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:0,position:'relative'}}>
          {PHASES.map((p, i) => (
            <React.Fragment key={p.key}>
              <div style={{flex:1,textAlign:'center'}}>
                <div style={{
                  width:36,height:36,borderRadius:'50%',background:p.color,
                  display:'inline-flex',alignItems:'center',justifyContent:'center',
                  color:'#fff',fontWeight:700,fontSize:13,boxShadow:`0 0 0 4px ${p.color}22`
                }}>{p.key}</div>
                <div style={{marginTop:8,fontSize:12.5,fontWeight:600,color:'var(--text-0)'}}>{p.label}</div>
                <div className="text-mute" style={{fontSize:11,marginTop:2}}>{p.timeline}</div>
                <div style={{marginTop:6}}>
                  <span className={'badge ' + p.tone} style={{fontSize:10.5}}>{p.status}</span>
                </div>
              </div>
              {i < PHASES.length-1 && (
                <div style={{flex:'0 0 40px',height:2,background:'var(--line-soft)',marginTop:-46,position:'relative',top:18}}/>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 各阶段详情 */}
      {PHASES.map(p => {
        const items = PRD_FEATURES[p.key] || [];
        return (
        <div key={p.key} className="card mt-4">
          <div className="card-head">
            <h3 style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{
                background:p.color,color:'#fff',padding:'2px 8px',borderRadius:4,
                fontSize:11,fontWeight:700,letterSpacing:0.4
              }}>{p.key}</span>
              {p.label}
              <span className="sub" style={{fontWeight:400}}>· {p.timeline}</span>
            </h3>
            <div className="row gap-2" style={{alignItems:'center'}}>
              <span className="text-mute" style={{fontSize:12}}>{items.length} 个模块</span>
              <span className={'badge ' + p.tone}>{p.status}</span>
            </div>
          </div>
          <div className="card-body" style={{padding:'14px 20px 18px'}}>
            <div style={{
              padding:'10px 12px',background:'var(--bg-2)',borderRadius:6,marginBottom:14,
              borderLeft:`3px solid ${p.color}`,fontSize:12.5,color:'var(--text-1)'
            }}>
              <span className="text-mute" style={{fontSize:11,marginRight:8}}>目标</span>{p.goal}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:10}}>
              {items.map((it, idx) => (
                <div key={it.id}
                  onClick={()=> onSelect && onSelect('prd_'+it.id)}
                  style={{
                  display:'flex',gap:10,padding:'10px 12px',
                  border:'1px solid var(--line-soft)',borderRadius:6,
                  background:'var(--bg-1)',cursor:'pointer',
                  transition:'border-color .15s, background .15s'
                }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=p.color;e.currentTarget.style.background='var(--bg-2)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--line-soft)';e.currentTarget.style.background='var(--bg-1)';}}
                >
                  <div style={{
                    width:24,height:24,borderRadius:4,flexShrink:0,
                    background:p.color+'18',color:p.color,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontWeight:700,fontSize:11,fontFamily:'JetBrains Mono'
                  }}>{idx+1}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12.5,fontWeight:600,color:'var(--text-0)',marginBottom:2,display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                      <span className="text-mono" style={{fontSize:10.5,color:p.color,fontWeight:700}}>{it.id}</span>
                      {it.name}
                      {uniqBackends(it.mapping).map(b => {
                        const st = SIDE_STYLE[b];
                        return (
                          <span key={b} style={{
                            fontSize:9.5,padding:'1px 6px',borderRadius:3,
                            background:st.bg,color:st.fg,
                            fontWeight:600,letterSpacing:0.2
                          }}>{st.label}</span>
                        );
                      })}
                    </div>
                    <div className="text-mute" style={{fontSize:11.5,lineHeight:1.5}}>{it.scope[0]}{it.scope.length>1?' 等 '+it.scope.length+' 项':''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}

// ============= 子页面:单个功能详情 =============
function PRDFeatureDetail({ feature, phase, onJump }) {
  const f = feature;
  const p = phase;
  const statusMap = {
    done:     { label:'已完成', color:'#22c55e', tone:'b-success' },
    next:     { label:'即将启动', color:'#3b82f6', tone:'b-info' },
    planning: { label:'规划中', color:'#a855f7', tone:'b-info' },
  };
  const s = statusMap[f.status] || statusMap.planning;
  const backends = uniqBackends(f.mapping);

  return (
    <div className="page">
      <PRDUI.PageHead title={`${f.id}_${f.name}`} subtitle={`${p.key} ${p.label} · ${p.timeline} · 预计 ${f.dev} 人日`}>
        <span className={'badge ' + s.tone}>{s.label}</span>
        <span className="badge">{f.week}</span>
        {backends.map(b => {
          const st = SIDE_STYLE[b];
          return (
            <span key={b} style={{
              fontSize:11,padding:'3px 9px',borderRadius:3,
              background:st.bg,color:st.fg,fontWeight:600,letterSpacing:0.2
            }}>{st.label}</span>
          );
        })}
      </PRDUI.PageHead>

      <div className="grid-3" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
        <div className="card" style={{padding:'14px 16px'}}>
          <div className="text-mute" style={{fontSize:11,marginBottom:6}}>开发优先级</div>
          <div style={{fontSize:22,fontWeight:700,color:'var(--text-0)',fontFamily:'JetBrains Mono'}}>{f.id}</div>
          <div className="text-mute" style={{fontSize:11.5,marginTop:4}}>{p.key} 阶段子项</div>
        </div>
        <div className="card" style={{padding:'14px 16px'}}>
          <div className="text-mute" style={{fontSize:11,marginBottom:6}}>排期</div>
          <div style={{fontSize:22,fontWeight:700,color:'var(--text-0)',fontFamily:'JetBrains Mono'}}>{f.week}</div>
          <div className="text-mute" style={{fontSize:11.5,marginTop:4}}>预计 {f.dev} 人日</div>
        </div>
        <div className="card" style={{padding:'14px 16px'}}>
          <div className="text-mute" style={{fontSize:11,marginBottom:6}}>状态</div>
          <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.label}</div>
          <div className="text-mute" style={{fontSize:11.5,marginTop:4}}>{f.status==='done'?'已交付上线':f.status==='next'?'P0 上线后立即启动':'按阶段排期推进'}</div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-head"><h3>为什么做这个</h3></div>
        <div className="card-body" style={{fontSize:13,lineHeight:1.7,color:'var(--text-1)'}}>
          {f.why}
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-head">
          <h3>功能范围</h3>
          <span className="text-mute" style={{fontSize:12}}>共 {f.scope.length} 项</span>
        </div>
        <div className="card-body" style={{padding:0}}>
          {f.scope.map((sc, i) => (
            <div key={i} style={{
              padding:'12px 20px',borderBottom: i<f.scope.length-1?'1px solid var(--line-soft)':'none',
              display:'flex',alignItems:'flex-start',gap:12
            }}>
              <span style={{
                width:22,height:22,borderRadius:4,flexShrink:0,
                background:p.color+'18',color:p.color,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontWeight:700,fontSize:11,fontFamily:'JetBrains Mono'
              }}>{i+1}</span>
              <div style={{flex:1,fontSize:13,color:'var(--text-1)',lineHeight:1.6}}>{sc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-head"><h3>依赖模块</h3></div>
        <div className="card-body" style={{display:'flex',flexWrap:'wrap',gap:8}}>
          {f.deps.map(d => (
            <span key={d} className="badge" style={{padding:'4px 10px',fontSize:12}}>
              <Icon name="link" size={11}/>{d}
            </span>
          ))}
        </div>
      </div>

      {f.mapping && f.mapping.length > 0 && (
        <div className="card mt-4">
          <div className="card-head">
            <h3>实现位置</h3>
            <span className="text-mute" style={{fontSize:12}}>该 PRD 在哪些后台菜单落地 · 点击跳转</span>
          </div>
          <div className="card-body" style={{padding:0}}>
            {f.mapping.map((m, i) => {
              const st = SIDE_STYLE[m.backend];
              return (
                <div key={i}
                  onClick={()=> onJump && onJump(m.backend, 'mod:'+m.mod)}
                  style={{
                    padding:'12px 20px',
                    borderBottom: i<f.mapping.length-1?'1px solid var(--line-soft)':'none',
                    display:'flex',alignItems:'center',gap:12,cursor:'pointer',
                    transition:'background .15s'
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-2)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}
                >
                  <span style={{
                    fontSize:11,padding:'3px 9px',borderRadius:3,
                    background:st.bg,color:st.fg,fontWeight:600,
                    flexShrink:0,minWidth:64,textAlign:'center'
                  }}>{st.label}</span>
                  <span style={{flex:1,fontSize:13,color:'var(--text-1)'}}>{m.path}</span>
                  <span style={{
                    fontSize:11.5,color:p.color,fontWeight:600,
                    display:'inline-flex',alignItems:'center',gap:4
                  }}>
                    跳转 <Icon name="chevronRight" size={11}/>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

window.PRDOverview = PRDOverview;
window.PRDFeatureDetail = PRDFeatureDetail;
window.PRD_FEATURES = PRD_FEATURES;
window.PRD_PHASES = PHASES;
