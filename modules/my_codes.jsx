// 代理后台 - 邀请 Code 与链接 P0-3
// v3.0.86 按截图重做:
//   - 标题改「邀请 Code 与链接」
//   - KPI 扩到 10 个(2 行 × 5),含 充提差 / 玩家余额 / 充值转化率
//   - 表格列重构:邀请Code / 描述 / 备注 / 状态 / 累计注册人数 / 累计充值人数 / 累计充值金额 / 累计提款人数 / 累计提款金额 / 充值转化率 / 充提差 / 玩家余额 / 累计佣金 / 操作
//   - 操作改文字按钮:邀请链接&QR Code(蓝)/ 编辑 / 删除(红)
//   - 链接 + QR Code 合并为单弹窗(短链 + QR + 下载 PNG)
//   - 创建弹窗:Code 必填 + 校验提示(必填 / 最少 4 字符 / 4-10 字符仅字母大写 数字)
//   - 编辑弹窗:Code 与 创建时间 只读
//   - 状态 4 种:启用 / 冻结 / 暂停 / 停用
//   - 移除 Tabs(只剩列表)
const ACUI = window.UI;

function buildSampleCodes(agentId) {
  const days = (n) => Date.now() - n * 86400000;
  return [
    { id:'CD-S001', code:'RANDY01', desc:'Youtube专用', agent:agentId,
      shortUrl:'https://beans.ag/randy01', remark:'长期使用,不混其他渠道',
      regUsers:842, depositUsers:320, deposit:42100, withdrawUsers:165, withdraw:18200,
      playerBalance:23900, commission:14900,
      status:'active', createdAt:days(120) },
    { id:'CD-S002', code:'RANDY02', desc:'全渠道世界杯', agent:agentId,
      shortUrl:'https://beans.ag/randy02', remark:'只在世界杯期间使用',
      regUsers:1248, depositUsers:524, deposit:68400, withdrawUsers:241, withdraw:28900,
      playerBalance:39500, commission:22550,
      status:'frozen', createdAt:days(45) },
    { id:'CD-S003', code:'RANDY03', desc:'Telegram社群', agent:agentId,
      shortUrl:'https://beans.ag/randy03', remark:'TG所有社群共用这个Code',
      regUsers:412, depositUsers:158, deposit:21500, withdrawUsers:120, withdraw:22800,
      playerBalance:-1300, commission:8250,
      status:'paused', createdAt:days(95) },
    { id:'CD-S004', code:'RANDY04', desc:'Twitch专用', agent:agentId,
      shortUrl:'https://beans.ag/randy04', remark:'长期使用,不混其他渠道',
      regUsers:96, depositUsers:38, deposit:18200, withdrawUsers:42, withdraw:20100,
      playerBalance:-1900, commission:5700,
      status:'disabled', createdAt:days(180) },
  ];
}

// 状态徽标
function StatusBadge({ s }) {
  const map = {
    active:   { color:'var(--success)', t:'启用' },
    frozen:   { color:'var(--info)',    t:'冻结' },
    paused:   { color:'var(--warning)', t:'暂停' },
    disabled: { color:'var(--danger)',  t:'停用' },
  };
  const m = map[s] || map.disabled;
  return <span style={{color:m.color, fontSize:12.5, fontWeight:500}}>{m.t}</span>;
}

// 时间维度选择器 — 文本显示 + 3 个快选按钮(近7日 / 近14日 / 近30日)+ 点击展开自定义
function TimeRange({ value, onChange }) {
  const T2 = (k, fb) => window.t(k, fb);
  const lang = (window.APS_LANG_STORE && window.APS_LANG_STORE.get && window.APS_LANG_STORE.get()) || 'zh';
  const [open, setOpen] = React.useState(false);
  const [popPos, setPopPos] = React.useState({ left:0, top:0 });
  const ref = React.useRef(null);
  const triggerRef = React.useRef(null);
  const popRef = React.useRef(null);

  // 算 popover 位置(用 fixed 避开 .card overflow:hidden 截断)
  // v3.1.99 POP_W 按视口宽度裁剪以避免手机溢出
  const recomputePos = React.useCallback(() => {
    const t = triggerRef.current;
    if (!t) return;
    const r = t.getBoundingClientRect();
    const POP_W = Math.min(560, window.innerWidth - 16);
    const left = Math.max(8, Math.min(window.innerWidth - POP_W - 8, r.left));
    const top = r.bottom + 6;
    setPopPos({ left, top });
  }, []);

  React.useEffect(() => {
    if (!open) return;
    recomputePos();
    const onDoc = (e) => {
      if (popRef.current && popRef.current.contains(e.target)) return;
      if (ref.current && ref.current.contains(e.target)) return;
      setOpen(false);
    };
    const onScroll = () => recomputePos();
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, recomputePos]);

  const pad = (n) => String(n).padStart(2,'0');
  const fmt = (d) => `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  // v3.1.99 手机端只显示日期(不含时间)
  const fmtDateOnly = (d) => `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;

  const setPreset = (preset) => {
    const end = new Date();
    end.setHours(23,59,59,0);
    const start = new Date(end);
    const days = preset === '7d' ? 6 : preset === '14d' ? 13 : 29;
    start.setDate(end.getDate() - days);
    start.setHours(0,0,0,0);
    onChange({ preset, start, end });
  };

  const presets = [
    { k:'7d',  l: T2('mc.tr.7d',  '近 7 日') },
    { k:'14d', l: T2('mc.tr.14d', '近 14 日') },
    { k:'30d', l: T2('mc.tr.30d', '近 30 日') },
  ];

  return (
    <div className="time-range-wrap" style={{display:'flex', gap:8, alignItems:'center'}} ref={ref}>
      <div
        ref={triggerRef}
        className="time-range-trigger"
        onClick={()=>setOpen(o=>!o)}
        style={{
          display:'inline-flex', alignItems:'center', gap:8,
          padding:'0 12px', height:32,
          border:'1px solid var(--line)', borderRadius:6, background:'#fff',
          fontSize:12, color:'var(--text-1)', cursor:'pointer', minWidth:300,
          fontFamily:'var(--font-mono)',
        }}>
        <span style={{flex:1,minWidth:0}}>
          {/* v3.1.99 桌面显示完整日期+时间；手机(<768px)只显示日期，两个 span CSS 互斥 */}
          <span className="tr-full">{fmt(value.start)} - {fmt(value.end)}</span>
          <span className="tr-short">{fmtDateOnly(value.start)} - {fmtDateOnly(value.end)}</span>
        </span>
        <Icon name="chevronDown" size={11} style={{color:'var(--text-3)'}}/>
      </div>
      {open && ReactDOM.createPortal(
        <div ref={popRef} style={{
          position:'fixed', top: popPos.top, left: popPos.left, zIndex:1000,
          background:'#fff', border:'1px solid var(--line)', borderRadius:8,
          boxShadow:'0 12px 28px rgba(15,23,42,.10)',
          fontFamily:'var(--font-sans)',
        }}>
          <RangeCalendar
            lang={lang}
            value={value}
            onChange={(v)=>onChange({ preset:'custom', start:v.start, end:v.end })}
            onClose={()=>setOpen(false)}
          />
        </div>,
        document.body
      )}
      {presets.map(p => (
        <button key={p.k}
          className="time-range-preset"
          onClick={()=>setPreset(p.k)}
          style={{
            padding:'0 14px', height:32,
            border:'1px solid ' + (value.preset===p.k ? 'var(--brand)' : 'var(--line)'),
            background: value.preset===p.k ? 'var(--brand-soft)' : '#fff',
            color: value.preset===p.k ? 'var(--brand)' : 'var(--text-1)',
            borderRadius:6, fontSize:12, fontWeight:500, cursor:'pointer',
          }}>
          {p.l}
        </button>
      ))}
    </div>
  );
}

// 自绘 双月历日期范围选择器 — 完全控制 i18n + 宽度,绕开浏览器原生 input[type=date]
function RangeCalendar({ lang, value, onChange, onClose }) {
  const T3 = (k, fb) => window.t(k, fb);
  const [view, setView] = React.useState(() => {
    const d = value.start ? new Date(value.start) : new Date();
    d.setDate(1); d.setHours(0,0,0,0);
    return d;
  });
  const [picking, setPicking] = React.useState('start'); // 下一次点击设置的是 start 还是 end
  const [hover, setHover] = React.useState(null);

  const monthNames = lang === 'en'
    ? ['January','February','March','April','May','June','July','August','September','October','November','December']
    : ['1 月','2 月','3 月','4 月','5 月','6 月','7 月','8 月','9 月','10 月','11 月','12 月'];
  const weekdays = lang === 'en'
    ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    : ['日','一','二','三','四','五','六'];

  const sameDay = (a, b) => a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();

  const buildCells = (refMonth) => {
    const y = refMonth.getFullYear(), m = refMonth.getMonth();
    const first = new Date(y, m, 1);
    const startDow = first.getDay();
    const prevMonthEnd = new Date(y, m, 0).getDate();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDow; i++) {
      cells.push({ date: new Date(y, m-1, prevMonthEnd - startDow + i + 1), other:true });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ date: new Date(y, m, i), other:false });
    }
    while (cells.length < 42) {
      const idx = cells.length - startDow - daysInMonth + 1;
      cells.push({ date: new Date(y, m+1, idx), other:true });
    }
    return cells;
  };

  const pickDate = (date) => {
    const start = value.start && new Date(value.start);
    if (picking === 'start' || !start) {
      const s = new Date(date); s.setHours(0,0,0,0);
      const e = value.end && new Date(value.end);
      onChange({ start:s, end: (!e || s > e) ? new Date(s.getFullYear(), s.getMonth(), s.getDate(), 23,59,59) : e });
      setPicking('end');
    } else {
      const e = new Date(date); e.setHours(23,59,59,0);
      if (e < start) {
        // 反过来:把 e 当作新的 start
        const ns = new Date(date); ns.setHours(0,0,0,0);
        onChange({ start: ns, end: start });
      } else {
        onChange({ start, end: e });
      }
      setPicking('start');
    }
  };

  const inRange = (d) => {
    if (!value.start || !value.end) return false;
    return d > value.start && d < value.end;
  };

  const nextMonth = new Date(view.getFullYear(), view.getMonth()+1, 1);

  const renderMonth = (refMonth) => {
    const cells = buildCells(refMonth);
    return (
      <div style={{padding:'8px 4px', flex:1}}>
        <div style={{textAlign:'center', fontSize:13, fontWeight:600, color:'var(--text-0)', marginBottom:8}}>
          {refMonth.getFullYear()} {monthNames[refMonth.getMonth()]}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1, marginBottom:4}}>
          {weekdays.map(w => (
            <div key={w} style={{textAlign:'center', fontSize:11, color:'var(--text-3)', padding:'4px 0'}}>{w}</div>
          ))}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1}}>
          {cells.map((c, i) => {
            const isStart = sameDay(c.date, value.start);
            const isEnd = sameDay(c.date, value.end);
            const between = inRange(c.date);
            const inHoverRange = !isStart && !isEnd && !between && hover && value.start && picking==='end' && c.date > value.start && c.date <= hover;
            return (
              <button key={i}
                onClick={()=>pickDate(c.date)}
                onMouseEnter={()=>setHover(c.date)}
                onMouseLeave={()=>setHover(null)}
                style={{
                  padding:'7px 0', fontSize:12,
                  border:'none',
                  background: (isStart || isEnd) ? 'var(--brand)' : (between || inHoverRange) ? 'var(--brand-soft)' : 'transparent',
                  color: (isStart || isEnd) ? '#fff' : c.other ? 'var(--text-4, #cbd5e1)' : 'var(--text-1)',
                  cursor:'pointer', borderRadius:4,
                  fontWeight: (isStart || isEnd) ? 600 : 400,
                }}>
                {c.date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const arrowBtn = {
    width:28, height:28, display:'inline-flex', alignItems:'center', justifyContent:'center',
    border:'1px solid var(--line)', borderRadius:6, background:'#fff', cursor:'pointer',
    color:'var(--text-2)',
  };

  return (
    <div className="time-range-cal" style={{padding:14, width: 560}}>
      <div className="trc-head" style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6, gap:8}}>
        <div style={{display:'flex', gap:4}}>
          <button onClick={()=>setView(new Date(view.getFullYear()-1, view.getMonth(), 1))} style={arrowBtn} title={lang==='en'?'Previous year':'上一年'}>«</button>
          <button onClick={()=>setView(new Date(view.getFullYear(), view.getMonth()-1, 1))} style={arrowBtn} title={lang==='en'?'Previous month':'上个月'}>‹</button>
        </div>
        <span style={{fontSize:11.5, color:'var(--text-3)', flex:1, textAlign:'center'}}>
          {picking === 'start' ? T3('mc.tr.pick_start', lang==='en'?'Pick start date':'选择开始日期') : T3('mc.tr.pick_end', lang==='en'?'Pick end date':'选择结束日期')}
        </span>
        <div style={{display:'flex', gap:4}}>
          <button onClick={()=>setView(new Date(view.getFullYear(), view.getMonth()+1, 1))} style={arrowBtn} title={lang==='en'?'Next month':'下个月'}>›</button>
          <button onClick={()=>setView(new Date(view.getFullYear()+1, view.getMonth(), 1))} style={arrowBtn} title={lang==='en'?'Next year':'下一年'}>»</button>
        </div>
      </div>
      <div className="trc-months" style={{display:'flex', gap:14}}>
        {renderMonth(view)}
        <div className="trc-divider" style={{width:1, background:'var(--line)'}}/>
        {renderMonth(nextMonth)}
      </div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10, paddingTop:10, borderTop:'1px solid var(--line)'}}>
        <button onClick={()=>{
          const end = new Date(); end.setHours(23,59,59,0);
          const start = new Date(end); start.setDate(end.getDate()-6); start.setHours(0,0,0,0);
          onChange({ start, end });
          setPicking('start');
          onClose && onClose();
        }} style={{padding:'6px 12px', fontSize:12, background:'transparent', border:'none', color:'var(--brand)', cursor:'pointer'}}>
          {T3('mc.tr.today', lang==='en'?'Today':'今天')}
        </button>
        <button onClick={()=>onClose && onClose()} style={{padding:'6px 14px', fontSize:12, background:'var(--brand)', border:'none', color:'#fff', borderRadius:6, cursor:'pointer'}}>
          {T3('mc.tr.confirm', lang==='en'?'Confirm':'确定')}
        </button>
      </div>
    </div>
  );
}

function MyCodesModule() {
  const D = window.APS_DATA;
  const F = window.APS_FMT;
  const T = (k, fb) => window.t(k, fb);
  const [lang] = window.useAgentLang();   // v3.2.67 说明弹窗双语
  const EN = lang === 'en';
  const toast = ACUI.useToast();
  const me = window.useCurrentAgent();
  const [q, setQ] = React.useState('');
  // 时间范围 — 默认 近 7 日
  const [timeRange, setTimeRange] = React.useState(() => {
    const end = new Date(); end.setHours(23,59,59,0);
    const start = new Date(end); start.setDate(end.getDate() - 6); start.setHours(0,0,0,0);
    return { preset:'7d', start, end };
  });
  const [page, setPage] = React.useState(1);
  const [showCreate, setShowCreate] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(null);
  const [showLinkQR, setShowLinkQR] = React.useState(null); // 合并 链接 + QR
  const [delTarget, setDelTarget] = React.useState(null);

  const [codes, setCodes] = React.useState(() => {
    const real = (D.codes || []).filter(c => c.agent === me.id).map(c => ({
      ...c,
      desc: c.desc || c.name || '未命名',
      regUsers: c.regUsers || c.regs || 0,
      depositUsers: c.depositUsers || Math.round((c.regs||0)*0.38),
      withdrawUsers: c.withdrawUsers || Math.round((c.regs||0)*0.15),
      playerBalance: c.playerBalance || ((c.deposit||0) - (c.withdraw||0)),
    }));
    return [...buildSampleCodes(me.id), ...real];
  });

  // 筛选
  const filtered = codes.filter(c => {
    if (q && !(c.code + c.desc).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const [pageSize, setPageSize] = React.useState(20);
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  // 顶部 KPI 合计 — 与商户后台一致:上方总计 = 当前搜索+筛选命中的结果总计(搜索时随之变化)
  const sum = (k) => filtered.reduce((a,c)=>a+(c[k]||0),0);
  const totalReg = sum('regUsers');
  const totalDepUsers = sum('depositUsers');
  const totalDeposit = sum('deposit');
  const totalWdUsers = sum('withdrawUsers');
  const totalWithdraw = sum('withdraw');
  const totalCvr = totalReg ? (totalDepUsers/totalReg*100) : 0;
  const totalGap = totalDeposit - totalWithdraw;
  const totalPlayerBal = sum('playerBalance');
  const totalComm = sum('commission');

  // 操作
  const removeCode = (c) => {
    setCodes(codes.filter(x => x.id !== c.id));
    toast('邀请 Code ' + c.code + ' 已删除');
    setDelTarget(null);
  };
  const submitCreate = (form) => {
    const id = 'CD-' + String(codes.length + 1).padStart(4, '0');
    const finalCode = form.code.toUpperCase();
    const newCode = {
      id, code: finalCode, desc: form.desc, agent: me.id,
      shortUrl: 'https://beans.ag/' + finalCode.toLowerCase(),
      remark: form.remark || '',
      regUsers:0, depositUsers:0, deposit:0, withdrawUsers:0, withdraw:0,
      playerBalance:0, commission:0,
      status:'active', createdAt: Date.now(),
    };
    setCodes([newCode, ...codes]);
    toast('邀请 Code ' + newCode.code + ' 创建成功');
    setShowCreate(false);
  };
  const submitEdit = (form) => {
    setCodes(codes.map(x => x.id === showEdit.id ? { ...x, desc: form.desc, remark: form.remark } : x));
    toast('邀请 Code ' + showEdit.code + ' 已更新');
    setShowEdit(null);
  };

  const moneyCell = (n, color) => (
    <span className="text-mono" style={color?{color}:undefined}>₹{F.money(n||0)}</span>
  );

  return (
    <div className="page">
      <ACUI.PageHead title={T('page.my_codes.title','邀请Code与链接')} subtitle={T('page.my_codes.sub','查看各 Code 推广链接累计数据')}>
        <ACUI.FormulaHelp
          buttonLabel={EN ? 'Help' : '说明'}
          title={EN ? 'Invite Codes & Links · Field Calculations' : '邀请Code与链接 · 字段计算说明'}
          subtitle={EN ? 'Search scope & how each top-total field is computed' : '搜索范围与上方总计各字段口径'}
          sections={EN ? [
            { heading: 'Search scope', desc: 'Keyed by Code. Searching syncs the top totals with the list below — only matched Code rows are counted.', items: [
              { name: 'Invite Code / description', note: 'Fuzzy match on Code or description; top totals change with the match' },
            ] },
            { heading: 'Top-total field formulas', desc: 'All items below aggregate the Code rows matched by the current search.', items: [
              { name: 'Total codes', formula: '= matched Code row count' },
              { name: 'Total registrations', formula: '= Σ registrations per Code' },
              { name: 'Total depositors', formula: '= Σ depositors per Code' },
              { name: 'Total deposit', formula: '= Σ deposit per Code' },
              { name: 'Total withdrawers', formula: '= Σ withdrawers per Code' },
              { name: 'Total withdrawal', formula: '= Σ withdrawal per Code' },
              { name: 'Deposit conversion', formula: '= total depositors ÷ total registrations × 100%' },
              { name: 'Net deposit', formula: '= total deposit − total withdrawal' },
              { name: 'Player balance', formula: '= Σ player balance per Code' },
              { name: 'Total commission', formula: '= Σ commission per Code' },
            ] },
          ] : [
            { heading: '搜索范围', desc: '以「Code」为主维度,搜索时上方总计与下方列表同步,只统计命中的 Code 行。', items: [
              { name: '邀请Code / 描述', note: '模糊匹配邀请Code 或描述;命中后上方总计随之变化' },
            ] },
            { heading: '上方总计字段公式', desc: '以下各项均对「当前搜索命中的 Code 行」汇总。', items: [
              { name: 'Code 总数量', formula: '= 命中结果的 Code 行数' },
              { name: '总注册人数', formula: '= Σ 各 Code 注册人数' },
              { name: '总充值人数', formula: '= Σ 各 Code 充值人数' },
              { name: '总充值金额', formula: '= Σ 各 Code 充值金额' },
              { name: '总提款人数', formula: '= Σ 各 Code 提款人数' },
              { name: '总提款金额', formula: '= Σ 各 Code 提款金额' },
              { name: '充值转化率', formula: '= 总充值人数 ÷ 总注册人数 × 100%' },
              { name: '充提差', formula: '= 总充值金额 − 总提款金额' },
              { name: '玩家余额', formula: '= Σ 各 Code 玩家余额' },
              { name: '总佣金', formula: '= Σ 各 Code 佣金' },
            ] },
          ]} />
      </ACUI.PageHead>

      {/* KPI:2 行 × 5 */}
      <div className="kpi-grid mb-4" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {[
          [T('mc.kpi.codes_total','Code 总数量'), F.fmtNum(filtered.length)],
          [T('mc.kpi.reg','总注册人数'), F.fmtNum(totalReg)],
          [T('mc.kpi.dep_users','总充值人数'), F.fmtNum(totalDepUsers)],
          [T('mc.kpi.dep_amt','总充值金额'), '₹' + F.money(totalDeposit)],
          [T('mc.kpi.wd_users','总提款人数'), F.fmtNum(totalWdUsers)],
          [T('mc.kpi.wd_amt','总提款金额'), '₹' + F.money(totalWithdraw)],
          [T('mc.kpi.cvr','充值转化率'), totalCvr.toFixed(1) + '%'],
          [T('mc.kpi.gap','充提差'), (totalGap>=0?'+':'') + '₹' + F.money(Math.abs(totalGap)), totalGap>=0?'up':'down', 'green'],
        ].map(([l,v,delta,flag]) => (
          <div key={l} className="kpi" style={flag==='green'?{
            borderColor:'rgba(34,197,94,.35)', background:'rgba(34,197,94,.07)'
          }:undefined}>
            <div className="label">{l}</div>
            <div className="val" style={delta==='up'?{color:'var(--success)'}:delta==='down'?{color:'var(--danger)'}:undefined}>{v}</div>
          </div>
        ))}
      </div>

      {/* 纯查看页 — 不再从该页创建 Code(去 运营 / Code 与链接管理) */}

      <div className="card">
        <div className="toolbar">
          <ACUI.SearchInput value={q} onChange={setQ} placeholder={T('mc.filter.ph','邀请 Code')} width={220}/>
          <TimeRange value={timeRange} onChange={(v)=>{setTimeRange(v);setPage(1);}}/>
          <span style={{flex:1}}/>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>{T('mc.col.code','邀请 Code')}</th>
              <th>{T('mc.col.desc','描述')}</th>
              <th className="right">{T('mc.col.reg','注册人数')}</th>
              <th className="right">{T('mc.col.dep_users','充值人数')}</th>
              <th className="right">{T('mc.col.dep_amt','充值金额')}</th>
              <th className="right">{T('mc.col.wd_users','提款人数')}</th>
              <th className="right">{T('mc.col.wd_amt','提款金额')}</th>
              <th className="right">{T('mc.col.cvr','充值转化率')}</th>
              <th className="right">{T('mc.col.gap','充提差')}</th>
            </tr></thead>
            <tbody>
              {paged.map(c => {
                const cvr = c.regUsers ? (c.depositUsers/c.regUsers*100) : 0;
                const gap = (c.deposit||0) - (c.withdraw||0);
                return (
                  <tr key={c.id}>
                    <td>
                      <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                        <span className="text-mono" style={{color:'var(--text-0)',fontWeight:600,fontSize:12}}>{c.code}</span>
                        <button className="btn sm ghost icon-only" title="复制 Code" onClick={()=>toast('Code ' + c.code + ' 已复制')}><Icon name="copy" size={11}/></button>
                      </span>
                    </td>
                    <td style={{color:'var(--text-1)',fontSize:12.5,maxWidth:120,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} title={c.desc}>{c.desc}</td>
                    <td className="right text-mono">{F.fmtNum(c.regUsers||0)}</td>
                    <td className="right text-mono">{F.fmtNum(c.depositUsers||0)}</td>
                    <td className="right">{moneyCell(c.deposit)}</td>
                    <td className="right text-mono">{F.fmtNum(c.withdrawUsers||0)}</td>
                    <td className="right">{moneyCell(c.withdraw)}</td>
                    <td className="right text-mono" style={{color: cvr>=30?'var(--success)':'var(--text-1)'}}>{cvr.toFixed(1)}%</td>
                    <td className="right">
                      <span className="text-mono" style={{color: gap>=0?'var(--success)':'var(--danger)'}}>
                        {(gap>=0?'+':'-')}₹{F.money(Math.abs(gap))}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr><td colSpan={9} style={{textAlign:'center',padding:'40px 0',color:'var(--text-3)'}}>{T('mc.empty','暂无邀请 Code，请去「运营 → Code 与链接管理」创建')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <ACUI.Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1); }}/>
      </div>

      {/* 创建 邀请 Code */}
      {showCreate && <CodeForm
        mode="create"
        existingCodes={codes.map(c=>c.code)}
        onClose={()=>setShowCreate(false)}
        onSubmit={submitCreate}
      />}

      {/* 编辑 邀请 Code */}
      {showEdit && <CodeForm
        mode="edit"
        data={showEdit}
        onClose={()=>setShowEdit(null)}
        onSubmit={submitEdit}
      />}

      {/* 邀请链接 & QR Code (合并) */}
      <ACUI.Modal open={!!showLinkQR} onClose={()=>setShowLinkQR(null)}
        title="邀请链接 & QR Code"
        subtitle="直达网站自动带入你的邀请 Code"
        width={460}>
        {showLinkQR && (
          <div style={{display:'grid',gap:18,padding:'4px 2px 8px'}}>
            <div>
              <div style={{fontSize:12,color:'var(--text-2)',marginBottom:6}}>邀请短链接</div>
              <div style={{display:'flex',gap:6}}>
                <input className="input text-mono" value={showLinkQR.shortUrl} readOnly style={{flex:1,fontSize:12}}/>
                <button className="btn ghost icon-only" onClick={()=>toast('短链已复制')} title="复制"><Icon name="copy" size={13}/></button>
              </div>
            </div>
            <div>
              <div style={{fontSize:12,color:'var(--text-2)',marginBottom:8}}>QR Code</div>
              <div style={{width:140,height:140,padding:10,background:'#fff',borderRadius:6,border:'1px solid var(--line)'}}>
                <svg viewBox="0 0 21 21" style={{width:'100%',height:'100%'}}>
                  {Array.from({length:21}).map((_,r)=>Array.from({length:21}).map((_,c)=>{
                    const seed = (r*13 + c*7 + showLinkQR.code.length) % 7;
                    return seed > 3 ? <rect key={r+'-'+c} x={c} y={r} width="1" height="1" fill="#000"/> : null;
                  }))}
                </svg>
              </div>
            </div>
            <div>
              <button className="btn primary" onClick={()=>toast('PNG 已下载')}>
                <Icon name="download" size={13}/>下载 PNG
              </button>
            </div>
          </div>
        )}
      </ACUI.Modal>

      {/* 删除确认 */}
      <ACUI.Modal open={!!delTarget} onClose={()=>setDelTarget(null)} width={420}
        title="确认删除邀请 Code"
        subtitle="删除后该 Code 的统计数据保留,但新点击将不再计入"
        footer={<>
          <button className="btn ghost" onClick={()=>setDelTarget(null)}>取消</button>
          <button className="btn danger" onClick={()=>removeCode(delTarget)}>确认删除</button>
        </>}>
        {delTarget && (
          <div style={{fontSize:13,lineHeight:1.7}}>
            将删除邀请 Code <b style={{color:'var(--text-0)'}}>{delTarget.code}</b>(<span className="text-mute">{delTarget.desc}</span>),确定继续吗?
          </div>
        )}
      </ACUI.Modal>
    </div>
  );
}

// —— 创建 / 编辑 表单弹窗 ——
function CodeForm({ mode, existingCodes, data, onClose, onSubmit }) {
  const isEdit = mode === 'edit';
  const [f, setF] = React.useState({
    code: isEdit ? data.code : '',
    desc: isEdit ? (data.desc || '') : '',
    remark: isEdit ? (data.remark || '') : '',
  });
  const [touched, setTouched] = React.useState({ code:false, desc:false });
  const set = (k, v) => setF(prev => ({...prev, [k]:v}));

  // Code 校验规则(创建模式才需要)
  const codeReq = !!f.code;
  const codeLen = f.code.length >= 4;
  const codeFmt = /^[A-Z0-9]{4,10}$/.test(f.code.toUpperCase());
  const codeDup = !isEdit && existingCodes && existingCodes.includes(f.code.toUpperCase());
  const codeOk = isEdit || (codeReq && codeLen && codeFmt && !codeDup);
  const descOk = !!f.desc;
  const canSubmit = codeOk && descOk;

  const formatCreatedAt = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    const p = (n) => String(n).padStart(2,'0');
    return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());
  };

  // 校验项小图标行
  const checkLine = (ok, text) => (
    <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11.5,color: ok?'#22c55e':'#94a3b8',marginTop:4}}>
      <Icon name={ok ? 'check' : 'x'} size={11}/>
      <span>{text}</span>
    </div>
  );

  return (
    <window.UI.Modal open={true} onClose={onClose}
      title={isEdit ? '编辑 邀请 Code' : '创建 邀请 Code'}
      subtitle={isEdit ? '修改 描述 / 备注(Code 与 创建时间 不可修改)' : '为新推广场景创建专属 Code'}
      width={680}
      footer={<>
        <button className="btn ghost" onClick={onClose}>取消</button>
        <button className="btn primary" disabled={!canSubmit} onClick={()=>onSubmit({...f, code:f.code.toUpperCase()})}>{isEdit?'保存':'创建'}</button>
      </>}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 18px'}}>
        <div>
          <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>
            自定义 Code <span style={{color:'var(--danger)'}}>*</span>
          </label>
          <input className="input"
            value={f.code}
            onChange={e=>set('code', e.target.value.toUpperCase())}
            onBlur={()=>setTouched(t=>({...t,code:true}))}
            placeholder="如:AGlatam"
            disabled={isEdit}
            maxLength={10}
            style={{textTransform:'uppercase', ...(isEdit?{background:'var(--bg-3)',cursor:'not-allowed'}:{})}}/>
          {!isEdit && (
            <div style={{marginTop:6}}>
              {checkLine(codeReq, '请填写此栏位')}
              {checkLine(codeLen, '最少 4 个字符')}
              {checkLine(codeFmt, 'Code 必须包含 4-10 个字符,仅字母大写、数字')}
              {codeDup && checkLine(false, '该 Code 已存在,请更换')}
            </div>
          )}
        </div>
        <div>
          <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>
            {isEdit ? '创建时间' : '描述'} {!isEdit && <span style={{color:'var(--danger)'}}>*</span>}
          </label>
          {isEdit ? (
            <input className="input text-mono" value={formatCreatedAt(data.createdAt)} readOnly
              style={{background:'var(--bg-3)',cursor:'not-allowed'}}/>
          ) : (
            <input className="input" value={f.desc} onChange={e=>set('desc', e.target.value)}
              onBlur={()=>setTouched(t=>({...t,desc:true}))}
              placeholder="如:Youtube专用、世界杯活动"/>
          )}
        </div>

        {isEdit && (
          <div style={{gridColumn:'1 / -1'}}>
            <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>
              描述 <span style={{color:'var(--danger)'}}>*</span>
            </label>
            <input className="input" value={f.desc} onChange={e=>set('desc', e.target.value)}
              placeholder="如:Youtube专用、世界杯活动"/>
          </div>
        )}

        <div style={{gridColumn:'1 / -1'}}>
          <label className="text-soft" style={{fontSize:12,display:'block',marginBottom:6}}>备注 (选填)</label>
          <textarea className="textarea" rows={3} value={f.remark} onChange={e=>set('remark', e.target.value)}
            placeholder="如:长期使用,不限推广地方"/>
        </div>
      </div>
    </window.UI.Modal>
  );
}

window.MyCodesModule = MyCodesModule;
window.TimeRange = TimeRange;
window.RangeCalendar = RangeCalendar;
