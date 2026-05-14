// 分润管理 v2.4.41 — 按 PRD 重做:單付費分潤 / 收益分潤 两个 tab
const { Modal: RVM, PageHead: RVPH, Tabs: RVTABS, useToast: RVTOAST } = window.UI;

// v2.4.43 全局 plan store — 供「创建代理账户 / 分润模式」弹窗读取分润方案下拉选项
// 后续如方案数据需持久化,改用 useReducer + 写回 window 即可
function buildPlanStore(single, revenue) {
  return {
    single,
    revenue,
    // 扁平化为下拉用的 options:[{key, modeLabel, name, label}]
    // v2.4.46 收益分潤格式:分潤模式 · 方案類型 · 方案名稱(單付費分潤無子類型,保持两段)
    flatOptions: [
      ...single.map(p => ({
        key: 'single:' + p.id,
        modeLabel: '單付費分潤方案',
        name: p.name,
        label: '單付費分潤方案 · ' + p.name,
      })),
      ...revenue.map(p => {
        const t = REV_TYPES.find(x => x.key === p.type);
        const typeLabel = t ? t.label : '';
        return {
          key: 'revenue:' + p.id,
          modeLabel: '收益分潤方案',
          typeLabel,
          name: p.name,
          label: '收益分潤方案 · ' + (typeLabel ? typeLabel + ' · ' : '') + p.name,
        };
      }),
    ],
  };
}

const LinkBtn = ({ danger, onClick, children }) => (
  <span onClick={onClick} style={{
    cursor:'pointer',color: danger ? 'var(--danger)' : 'var(--brand)',
    fontSize:12.5,userSelect:'none'
  }} onMouseOver={e=>e.currentTarget.style.textDecoration='underline'}
     onMouseOut={e=>e.currentTarget.style.textDecoration='none'}>{children}</span>
);

const TypeTag = ({ type, label }) => (
  <span style={{
    display:'inline-block',padding:'2px 8px',borderRadius:10,fontSize:11,fontWeight:500,
    background: type==='loss' ? '#dbeafe' : '#fef3c7',
    color:    type==='loss' ? '#1e40af' : '#92400e'
  }}>{label}</span>
);

// =================== 假数据 ===================
const SEED_SINGLE = [
  {
    id: 'SP-001',
    name: '方案1_有效首次存款',
    minDeposit: 300,
    minTurnover: 5,
    minNGR: -100,
    validDays: 3,
    needRetain: true,
    retainDays: 3,
    excludeWithdrawn: true,
    remark: '此方案為與 XXX 談過的合作內容,經上級批准配置的',
  },
  {
    id: 'SP-002',
    name: '方案2_新用戶激活',
    minDeposit: 200,
    minTurnover: 3,
    minNGR: -50,
    validDays: 5,
    needRetain: false,
    retainDays: 1,
    excludeWithdrawn: false,
    remark: '網賺渠道專用',
  },
];

const FORMULA_LOSS_BASE = `Step1 計算本期用戶損失基數:
    上期損失用戶基數 + (本期充值 - 本期提現) = 本期用戶損失基數

Step2 發佣金校驗:
    2-1 本期結算餘額 < 本期用戶損失基數,平台盈利,接 STEP-3~5 計算佣金及結算本期剩餘用戶損失基數(帶入下期)
    2-2 本期結算餘額 ≥ 本期用戶損失基數,平台虧損,不計算佣金,接 STEP-5 結算本期剩餘用戶損失基數(帶入下期)

Step3 計算平台實際盈利的本期平台盈利金額:
    本期用戶損失基數 - 本期結算餘額 = 本期平台盈利金額

Step4 計算本期佣金金額:
    本期平台盈利金額 × 代理分潤比例 = 本期佣金金額

Step5 結算本期剩餘損失基數:
    本期用戶損失基數 - 本期平台盈利金額 = 本期剩餘用戶損失基數,本期剩餘用戶損失基數到下一期結算時成為上期用戶損失基數`;

const FORMULA_PERIOD_ASSET = `STEP-1:計算用戶本期行為判斷平台是否虧損的基數
    (上期未結算餘額 + (上期佣金基數)) + (本期充值 - 本期提現 - 本期結算餘額) = 本期佣金基數
    · 上期結算餘額 ≥ 0,不計入本期計算
    · 上期佣金基數為 0 < 0,不帶入本期計算

STEP-2:校驗本期是否虧損
    2-1 本期佣金基數 ≤ 0,代表平台虧損或持平,不計算佣金,本期佣金基數帶入下期
    2-2 本期佣金基數 > 0,代表平台盈利,計算佣金,本期佣金基數不帶入下期
    (佣金計算公式 = 本期佣金基數 × 佣金分潤比例)

STEP-3:本期結算餘額,始終帶入下期`;

const REV_TYPES = [
  { key: 'loss',   label: '用戶損失基數分潤', formula: FORMULA_LOSS_BASE },
  { key: 'period', label: '週期資產變動分潤', formula: FORMULA_PERIOD_ASSET },
];

const SEED_REVENUE = [
  { id: 'RV-001', type: 'loss',   name: '建議個人代理適用', ratio: 0.05, cap: 100000, remark: '此方案為與 XXX 談過的合作內容,經上級批准配置的' },
  { id: 'RV-002', type: 'period', name: '團隊代理適用',     ratio: 0.05, cap: 100000, remark: '此方案為與 XXX 談過的合作內容,經上級批准配置的' },
];

// =================== 主模块 ===================
function RevShareModule() {
  const [tab, setTab] = React.useState('single');
  return (
    <div className="page">
      <RVPH title="分润管理" subtitle="管理 分潤模式 與 方案 — 單付費分潤 / 收益分潤" />
      <div className="card">
        <RVTABS value={tab} onChange={setTab} tabs={[
          { key: 'single',  label: '單付費分潤' },
          { key: 'revenue', label: '收益分潤' },
        ]}/>
        {tab === 'single'  && <SinglePayPanel/>}
        {tab === 'revenue' && <RevenuePanel/>}
      </div>
    </div>
  );
}

// =================== 單付費分潤 ===================
function SinglePayPanel() {
  const toast = RVTOAST();
  const [rows, setRows] = React.useState(SEED_SINGLE);
  const [editing, setEditing] = React.useState(null);  // {mode:'create'|'edit', data?}
  const [delTarget, setDelTarget] = React.useState(null);

  const onSave = (data) => {
    if (editing.mode === 'create') {
      const id = 'SP-' + String(rows.length + 1).padStart(3, '0');
      setRows([...rows, { ...data, id }]);
      toast('已新增單付費分潤方案');
    } else {
      setRows(rows.map(r => r.id === editing.data.id ? { ...r, ...data } : r));
      toast('已更新方案');
    }
    setEditing(null);
  };

  return (
    <div style={{padding:14}}>
      <button className="btn primary" style={{marginBottom:12}} onClick={()=>setEditing({mode:'create'})}>
        <Icon name="plus" size={13}/>新增 單付費分潤
      </button>
      <div style={{overflowX:'auto'}}>
        <table className="tbl">
          <thead>
            <tr>
              <th>方案名稱</th>
              <th className="right">最低首存金額</th>
              <th className="right">最低流水倍數</th>
              <th className="right">最低 NGR (可用水位替代)</th>
              <th className="right">有效天數內完成 <span style={{color:'var(--danger)'}}>*</span></th>
              <th>是否需要活躍留存</th>
              <th className="right">活躍留存天數</th>
              <th>是否排除提款過玩家</th>
              <th>備註</th>
              <th style={{width:100}}>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td style={{fontWeight:500,color:'var(--text-0)'}}>{r.name}</td>
                <td className="right" style={{fontFamily:'var(--font-mono)'}}>{r.minDeposit}</td>
                <td className="right" style={{fontFamily:'var(--font-mono)'}}>{r.minTurnover}</td>
                <td className="right" style={{fontFamily:'var(--font-mono)',color:r.minNGR<0?'var(--danger)':undefined}}>{r.minNGR}</td>
                <td className="right" style={{fontFamily:'var(--font-mono)'}}>{r.validDays}</td>
                <td><window.Switch on={r.needRetain} onChange={()=>{}}/></td>
                <td className="right" style={{fontFamily:'var(--font-mono)',color:r.needRetain?undefined:'var(--text-3)'}}>{r.needRetain ? r.retainDays : '—'}</td>
                <td><window.Switch on={r.excludeWithdrawn} onChange={()=>{}}/></td>
                <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--text-2)'}} title={r.remark}>{r.remark}</td>
                <td>
                  <div style={{display:'flex',gap:10}}>
                    <LinkBtn onClick={()=>setEditing({mode:'edit', data:r})}>編輯</LinkBtn>
                    <LinkBtn danger onClick={()=>setDelTarget(r)}>刪除</LinkBtn>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={10} style={{textAlign:'center',padding:'40px 0',color:'var(--text-3)'}}>暫無方案,點擊「新增 單付費分潤」開始配置</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && <SinglePayModal mode={editing.mode} data={editing.data} onClose={()=>setEditing(null)} onSave={onSave}/>}
      <ConfirmDelete target={delTarget} onCancel={()=>setDelTarget(null)} onOk={()=>{
        setRows(rows.filter(r=>r.id!==delTarget.id));
        toast('已刪除');
        setDelTarget(null);
      }}/>
    </div>
  );
}

function SinglePayModal({ mode, data, onClose, onSave }) {
  const init = data || { name:'', minDeposit:'', minTurnover:'', minNGR:'', validDays:'', needRetain:true, retainDays:1, excludeWithdrawn:true, remark:'' };
  const [f, setF] = React.useState(init);
  const set = (k, v) => setF(prev => ({...prev, [k]:v}));
  const canSubmit = f.name && f.minDeposit !== '' && f.minNGR !== '' && f.validDays !== '';

  return (
    <RVM open={true} onClose={onClose} size="lg"
      title={`${mode==='create'?'新增':'編輯'} 單付費分潤方案`}
      subtitle="一次性佣金,僅按首次存款計算"
      footer={<>
        <button className="btn ghost" onClick={onClose}>取消</button>
        <button className="btn primary" disabled={!canSubmit} onClick={()=>onSave(f)}>確定</button>
      </>}>
      <div style={{display:'grid',gap:14}}>
        <Field label="方案名稱" required>
          <input className="input" value={f.name} onChange={e=>set('name', e.target.value)} placeholder="請輸入"/>
        </Field>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <Field label="最低首存金額" required hint="佣金僅計算首次存款">
            <input className="input" type="number" value={f.minDeposit} onChange={e=>set('minDeposit', e.target.value)} placeholder="請輸入"/>
          </Field>
          <Field label="最低流水倍數">
            <input className="input" type="number" value={f.minTurnover} onChange={e=>set('minTurnover', e.target.value)} placeholder="請輸入"/>
          </Field>
          <Field label="最低 NGR" required hint="可用水位替代,可為負值">
            <input className="input" type="number" value={f.minNGR} onChange={e=>set('minNGR', e.target.value)} placeholder="請輸入"/>
          </Field>
          <Field label="有效天數內完成" required>
            <select className="select" value={f.validDays} onChange={e=>set('validDays', e.target.value)}>
              <option value="">請選擇天數</option>
              {[1,2,3,4,5,7,14,30].map(d => <option key={d} value={d}>{d} 天</option>)}
            </select>
          </Field>
        </div>

        <div style={{borderTop:'1px solid var(--line-soft)',paddingTop:14}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:f.needRetain?12:0}}>
            <window.Switch on={f.needRetain} onChange={v=>set('needRetain', v)}/>
            <span style={{fontSize:13}}>是否需要活躍留存</span>
          </div>
          {f.needRetain && (
            <Field label="活躍留存天數">
              <select className="select" style={{maxWidth:280}} value={f.retainDays} onChange={e=>set('retainDays', Number(e.target.value))}>
                {[1,2,3,4,5,7,14].map(d => <option key={d} value={d}>{d} 天</option>)}
              </select>
            </Field>
          )}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <window.Switch on={f.excludeWithdrawn} onChange={v=>set('excludeWithdrawn', v)}/>
          <span style={{fontSize:13}}>是否排除提款過玩家</span>
        </div>

        <Field label="備註" hint="選填">
          <textarea className="textarea" rows={3} value={f.remark} onChange={e=>set('remark', e.target.value)} placeholder="請輸入合作背景、批准人等"/>
        </Field>
      </div>
    </RVM>
  );
}

// =================== 收益分潤 ===================
function RevenuePanel() {
  const toast = RVTOAST();
  const [rows, setRows] = React.useState(SEED_REVENUE);
  const [editing, setEditing] = React.useState(null);  // null | {mode:'create'|'edit', data?}
  const [delTarget, setDelTarget] = React.useState(null);
  const [viewFormula, setViewFormula] = React.useState(null);

  const onSave = (data) => {
    if (editing.mode === 'create') {
      const id = 'RV-' + String(rows.length + 1).padStart(3, '0');
      setRows([...rows, { ...data, id }]);
      toast('已新增收益分潤方案');
    } else {
      setRows(rows.map(r => r.id === editing.data.id ? { ...r, ...data } : r));
      toast('已更新方案');
    }
    setEditing(null);
  };

  return (
    <div style={{padding:14}}>
      <button className="btn primary" style={{marginBottom:12}} onClick={()=>setEditing({mode:'create'})}>
        <Icon name="plus" size={13}/>新增 收益分潤
      </button>
      <div style={{overflowX:'auto'}}>
        <table className="tbl">
          <thead>
            <tr>
              <th>方案類型</th>
              <th>方案名稱</th>
              <th className="right">代理分成比例</th>
              <th>計算口徑流程</th>
              <th className="right">封頂金額</th>
              <th>備註</th>
              <th style={{width:100}}>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const t = REV_TYPES.find(x => x.key === r.type);
              return (
                <tr key={r.id}>
                  <td><TypeTag type={r.type} label={t.label}/></td>
                  <td style={{fontWeight:500,color:'var(--text-0)'}}>{r.name}</td>
                  <td className="right" style={{fontFamily:'var(--font-mono)'}}>{(r.ratio*100).toFixed(0)}%</td>
                  <td><LinkBtn onClick={()=>setViewFormula(t)}>查看</LinkBtn></td>
                  <td className="right" style={{fontFamily:'var(--font-mono)'}}>{r.cap.toLocaleString()}</td>
                  <td style={{maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--text-2)'}} title={r.remark}>{r.remark}</td>
                  <td>
                    <div style={{display:'flex',gap:10}}>
                      <LinkBtn onClick={()=>setEditing({mode:'edit', data:r})}>編輯</LinkBtn>
                      <LinkBtn danger onClick={()=>setDelTarget(r)}>刪除</LinkBtn>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={7} style={{textAlign:'center',padding:'40px 0',color:'var(--text-3)'}}>暫無方案,點擊「新增 收益分潤」開始配置</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && <RevenueFormModal mode={editing.mode} data={editing.data} onClose={()=>setEditing(null)} onSave={onSave}/>}
      {viewFormula && <FormulaViewModal type={viewFormula} onClose={()=>setViewFormula(null)}/>}
      <ConfirmDelete target={delTarget} onCancel={()=>setDelTarget(null)} onOk={()=>{
        setRows(rows.filter(r=>r.id!==delTarget.id));
        toast('已刪除');
        setDelTarget(null);
      }}/>
    </div>
  );
}

function RevenueFormModal({ mode, data, onClose, onSave }) {
  const isEdit = mode === 'edit';
  const init = data || { type:'', name:'', ratio:'', cap:'', remark:'' };
  const [f, setF] = React.useState({
    type: init.type || '',
    name: init.name || '',
    ratio: init.ratio !== undefined && init.ratio !== '' ? String(init.ratio) : '',
    cap: init.cap !== undefined && init.cap !== '' ? String(init.cap) : '',
    remark: init.remark || '',
  });
  const set = (k, v) => setF(prev => ({...prev, [k]:v}));
  const t = REV_TYPES.find(x => x.key === f.type);
  const canSubmit = f.type && f.name && f.ratio !== '' && f.cap !== '';

  const handleSave = () => {
    onSave({ type:f.type, name:f.name, ratio:Number(f.ratio), cap:Number(f.cap), remark:f.remark });
  };

  return (
    <RVM open={true} onClose={onClose} size="lg"
      title={`${isEdit?'編輯':'新增'} 收益分潤方案`}
      subtitle="選擇方案類型後,將自動帶出對應的計算口徑流程"
      footer={<>
        <button className="btn ghost" onClick={onClose}>取消</button>
        <button className="btn primary" disabled={!canSubmit} onClick={handleSave}>確定</button>
      </>}>
      <div style={{display:'grid',gap:14}}>
        <Field label="方案類型" required>
          <select className="select"
            value={f.type}
            onChange={e=>set('type', e.target.value)}
            disabled={isEdit}
            style={isEdit?{background:'var(--bg-2)',color:'var(--text-1)',cursor:'not-allowed'}:undefined}>
            <option value="">請選擇</option>
            {REV_TYPES.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
          </select>
        </Field>
        <Field label="方案名稱" required>
          <input className="input" value={f.name} onChange={e=>set('name', e.target.value)} placeholder="請輸入"/>
        </Field>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <Field label="代理分潤比例" required hint="例:輸入 0.01 = 1%">
            <input className="input" type="number" step="0.01" value={f.ratio} onChange={e=>set('ratio', e.target.value)} placeholder="例:輸入 0.01=1%"/>
          </Field>
          <Field label="封頂金額" required>
            <input className="input" type="number" value={f.cap} onChange={e=>set('cap', e.target.value)} placeholder="請輸入"/>
          </Field>
        </div>

        <Field label="計算口徑流程" hint={!f.type ? '請先選擇方案類型' : '依方案類型自動帶出,不可編輯'}>
          <pre style={{
            margin:0,padding:14,
            background:'var(--bg-2)',border:'1px solid var(--line-soft)',
            borderRadius:6,fontSize:12,lineHeight:1.85,
            color: f.type ? 'var(--text-1)' : 'var(--text-3)',
            fontFamily:'var(--font-mono)',whiteSpace:'pre-wrap',
            maxHeight:280,overflowY:'auto',
            minHeight: f.type ? undefined : 80,
            display: f.type ? undefined : 'flex',
            alignItems: f.type ? undefined : 'center',
            justifyContent: f.type ? undefined : 'center',
          }}>
            {f.type ? t.formula : '選擇方案類型後,此處會帶出對應的計算公式'}
          </pre>
        </Field>

        <Field label="備註" hint="選填">
          <textarea className="textarea" rows={3} value={f.remark} onChange={e=>set('remark', e.target.value)} placeholder="此方案為與 XXX 談過的合作內容,經上級批准配置的"/>
        </Field>
      </div>
    </RVM>
  );
}

function FormulaViewModal({ type, onClose }) {
  return (
    <RVM open={true} onClose={onClose} size="lg"
      title={`計算口徑 · ${type.label}`}
      subtitle="該分潤方案的佣金計算邏輯"
      footer={<button className="btn primary" onClick={onClose}>我知道了</button>}>
      <pre style={{
        margin:0,padding:16,background:'var(--bg-2)',border:'1px solid var(--line-soft)',
        borderRadius:6,fontSize:12.5,lineHeight:1.9,color:'var(--text-1)',
        fontFamily:'var(--font-mono)',whiteSpace:'pre-wrap'
      }}>{type.formula}</pre>
    </RVM>
  );
}

// =================== 共享:删除确认 ===================
function ConfirmDelete({ target, onCancel, onOk }) {
  if (!target) return null;
  return (
    <RVM open={true} onClose={onCancel} width={420}
      title="確認刪除方案"
      subtitle="刪除後將不可恢復"
      footer={<>
        <button className="btn ghost" onClick={onCancel}>取消</button>
        <button className="btn danger" onClick={onOk}>確認刪除</button>
      </>}>
      <div style={{fontSize:13,lineHeight:1.7,color:'var(--text-1)'}}>
        將刪除方案 <b>「{target.name}」</b>,正在使用此方案的代理需重新指派,確定繼續嗎?
      </div>
    </RVM>
  );
}

// =================== 共享:表单 Field ===================
function Field({ label, required, hint, children }) {
  return (
    <div>
      <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:6}}>
        <label style={{fontSize:12.5,color:'var(--text-1)',fontWeight:500}}>
          {label}{required && <span style={{color:'var(--danger)',marginLeft:2}}>*</span>}
        </label>
        {hint && <span style={{fontSize:11.5,color:'var(--text-3)'}}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// v2.4.43 初次挂载到 window,供创建代理弹窗下拉读取
window.RV_PLANS = buildPlanStore(SEED_SINGLE, SEED_REVENUE);

window.RevShareModule = RevShareModule;

// =================== 共享:创建代理 / 编辑分润模式 表单组件 ===================
// v2.4.43 props: value = {kind, weekday, monthday, plans:[key]}; onChange(next); onJumpPlanMgr?: ()=>跳到分润管理页
window.CommissionModeForm = function CommissionModeForm({ value, onChange, onJumpPlanMgr, compact }) {
  const store = window.RV_PLANS || { flatOptions: [] };
  const opts = store.flatOptions;
  const v = value || { kind:'weekly', weekday:1, monthday:1, plans:[''] };
  const set = (patch) => onChange({ ...v, ...patch });
  const setPlan = (idx, key) => {
    const next = v.plans.slice();
    next[idx] = key;
    set({ plans: next });
  };
  const addPlan = () => set({ plans: [...(v.plans||[]), ''] });
  const delPlan = (idx) => {
    const next = v.plans.filter((_, i) => i !== idx);
    set({ plans: next.length ? next : [''] });
  };

  const WD = ['每周一','每周二','每周三','每周四','每周五','每周六','每周日'];
  const MD = Array.from({length:31}, (_,i)=>`每月${i+1}號`);
  const wdLabel = WD[(v.weekday||1)-1];
  const mdLabel = `每月${v.monthday||1}號`;

  const gap = compact ? 14 : 18;
  const radioRow = (active, label, sub) => (
    <div style={{display:'flex',alignItems:'flex-start',gap:10,paddingBottom:8}}>
      <div style={{width:16,height:16,borderRadius:'50%',marginTop:2,
        border:'1.5px solid '+(active?'var(--brand)':'#cbd5e1'),
        display:'grid',placeItems:'center',flexShrink:0}}>
        {active && <div style={{width:8,height:8,background:'var(--brand)',borderRadius:'50%'}}/>}
      </div>
      <div style={{fontSize:13.5,color:'var(--text-0)',lineHeight:1.5}}>
        <span style={{fontWeight:500}}>{label}</span>
        {sub && <span style={{color:'var(--text-3)',fontSize:12.5,marginLeft:6}}>{sub}</span>}
      </div>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',gap}}>
      {/* —— 结算/分润时间 —— */}
      <div>
        <div style={{fontSize:13,color:'var(--text-0)',fontWeight:500,marginBottom:10}}>
          結算/分潤時間 <span style={{color:'var(--danger)'}}>*</span>
          <span style={{color:'var(--text-3)',fontWeight:400,marginLeft:6}}>(2選1)</span>
        </div>
        <div style={{border:'1px solid var(--line)',borderRadius:8,padding:'14px 16px',background:'#f1f5f9'}}>
          {/* 每周 */}
          <div onClick={()=>set({kind:'weekly'})} style={{cursor:'pointer'}}>
            {radioRow(
              v.kind==='weekly',
              '每周固定結算時間',
              `:${wdLabel} 00:00:00,結算上周一 00:00:00 ~ 周日 23:59:59`
            )}
          </div>
          <div style={{paddingLeft:26,paddingBottom:14,opacity:v.kind==='weekly'?1:.45,pointerEvents:v.kind==='weekly'?'auto':'none'}}>
            <div style={{fontSize:12,color:'var(--text-2)',marginBottom:6}}>
              每周固定星期分潤時間 00:00:00~23:59:59 <span style={{color:'var(--danger)'}}>*</span>
            </div>
            <select className="select" value={v.weekday||1} onChange={e=>set({weekday:Number(e.target.value)})}>
              {WD.map((w,i)=><option key={i} value={i+1}>{w}</option>)}
            </select>
          </div>

          <div style={{borderTop:'1px dashed var(--line-soft)'}}/>

          {/* 每月 */}
          <div onClick={()=>set({kind:'monthly'})} style={{cursor:'pointer',marginTop:14}}>
            {radioRow(
              v.kind==='monthly',
              '每月固定結算時間',
              `:${mdLabel} 00:00:00,結算上周一 00:00:00 ~ 周日 23:59:59`
            )}
          </div>
          <div style={{paddingLeft:26,opacity:v.kind==='monthly'?1:.45,pointerEvents:v.kind==='monthly'?'auto':'none'}}>
            <div style={{fontSize:12,color:'var(--text-2)',marginBottom:6}}>
              每月固定日分潤時間 00:00:00~23:59:59 <span style={{color:'var(--danger)'}}>*</span>
            </div>
            <select className="select" value={v.monthday||1} onChange={e=>set({monthday:Number(e.target.value)})}>
              {MD.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* —— 分润方案类型 —— */}
      <div>
        <div style={{display:'flex',alignItems:'center',marginBottom:10}}>
          <div style={{fontSize:13,color:'var(--text-0)',fontWeight:500,flex:1}}>
            分潤方案類型 <span style={{color:'var(--danger)'}}>*</span>
            <span style={{color:'var(--text-3)',fontWeight:400,marginLeft:6}}>(最少配置 1 種方案類型)</span>
          </div>
          {onJumpPlanMgr && (
            <span onClick={onJumpPlanMgr} style={{
              fontSize:12.5,color:'var(--brand)',cursor:'pointer',userSelect:'none'
            }} onMouseOver={e=>e.currentTarget.style.textDecoration='underline'}
               onMouseOut={e=>e.currentTarget.style.textDecoration='none'}>分潤管理</span>
          )}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {(v.plans||['']).map((pk, idx) => (
            <div key={idx} style={{display:'flex',alignItems:'center',gap:8}}>
              <select className="select" style={{flex:1}} value={pk} onChange={e=>setPlan(idx, e.target.value)}>
                <option value="">請選擇</option>
                {opts
                  .filter(o => o.key === pk || !(v.plans||[]).includes(o.key))
                  .map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
              <button
                onClick={()=>delPlan(idx)}
                disabled={(v.plans||[]).length<=1}
                title={(v.plans||[]).length<=1 ? '至少保留 1 項' : '刪除'}
                style={{
                  width:28,height:28,borderRadius:'50%',
                  border:'none',
                  background:(v.plans||[]).length<=1 ? '#fecaca' : '#ef4444',
                  color:'#fff',cursor:(v.plans||[]).length<=1?'not-allowed':'pointer',
                  display:'grid',placeItems:'center',flexShrink:0,fontSize:14,fontWeight:600,lineHeight:1
                }}>−</button>
            </div>
          ))}
        </div>

        <button onClick={addPlan} style={{
          marginTop:10,width:'100%',padding:'10px 0',
          border:'1.5px dashed #93c5fd',background:'#eff6ff',
          color:'var(--brand)',borderRadius:6,fontSize:13,cursor:'pointer',
          fontWeight:500
        }}>+ 新增分潤方案</button>
      </div>
    </div>
  );
};

// 把 plan key 解析成中文标签(供 detail / 摘要展示)
window.resolvePlanLabels = function(planKeys) {
  const opts = (window.RV_PLANS || { flatOptions: [] }).flatOptions;
  return (planKeys||[])
    .map(k => opts.find(o => o.key === k))
    .filter(Boolean)
    .map(o => o.label);
};
