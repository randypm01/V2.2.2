// 专业代理后台 · 登入页 (v2.3.31 — 参考竟品)
// - 左侧:渐变背景 + 品牌 logo + 插图 + 标题 + 副标题(铺满)
// - 右侧:白底登入面板 + 顶栏语言切换 + 欢迎语 + 表单 + 大按钮
// - 已创建账户列表:右上「快速选择账户」按钮 → 展开下拉(只在有账户时显示)
(function () {
  if (!window.APS_AGENT_ACCOUNTS) {
    window.APS_AGENT_ACCOUNTS = {
      list: [],
      listeners: [],
      add(acc) {
        if (!acc || !acc.loginName) return;
        const i = this.list.findIndex((x) => x.loginName === acc.loginName);
        if (i >= 0) this.list[i] = { ...this.list[i], ...acc };else
        this.list = [acc, ...this.list];
        this.listeners.forEach((fn) => fn());
      },
      subscribe(fn) {
        this.listeners.push(fn);
        return () => {this.listeners = this.listeners.filter((f) => f !== fn);};
      }
    };
  }
})();

window.AgentLoginModule = function ({ onLogin }) {
  const { Icon } = window.UI;
  const [, force] = React.useReducer((x) => x + 1, 0);
  const [loginName, setLoginName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [error, setError] = React.useState('');
  const [lang, setLang] = React.useState('简体中文');
  const [langOpen, setLangOpen] = React.useState(false);
  const [accOpen, setAccOpen] = React.useState(false);
  const langRef = React.useRef(null);
  const accRef = React.useRef(null);

  React.useEffect(() => {
    const onDoc = (e) => {
      if (langOpen && langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (accOpen && accRef.current && !accRef.current.contains(e.target)) setAccOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [langOpen, accOpen]);

  React.useEffect(() => {
    const unsub = window.APS_AGENT_ACCOUNTS.subscribe(force);
    const saved = localStorage.getItem('APS_REMEMBER_LOGIN');
    if (saved) {setLoginName(saved);setRemember(true);}
    return unsub;
  }, []);

  const accounts = window.APS_AGENT_ACCOUNTS.list;

  const fillFromAcc = (acc) => {
    setLoginName(acc.loginName || '');
    setPassword(acc.password || '');
    setError('');
    setAccOpen(false);
  };

  const handleLogin = () => {
    if (!loginName || !password) {setError('请输入帐号与密码');return;}
    const acc = accounts.find((a) => a.loginName === loginName && a.password === password);
    if (!acc) {setError('帐号或密码错误');return;}
    if (remember) localStorage.setItem('APS_REMEMBER_LOGIN', loginName);else
    localStorage.removeItem('APS_REMEMBER_LOGIN');
    onLogin(acc);
  };

  return (
    <div className="al2-page">
      {/* 左:品牌区 */}
      <div className="al2-left">
        <div className="al2-illu">
          <svg width="380" height="240" viewBox="0 0 380 240" fill="none" preserveAspectRatio="xMidYMax meet">
            {/* 平台底座 */}
            <ellipse cx="190" cy="220" rx="150" ry="14" fill="#1e40af" opacity="0.18" />
            <path d="M50 200 L190 240 L330 200 L190 160 Z" fill="#3b82f6" />
            <path d="M50 200 L190 240 L190 248 L50 208 Z" fill="#1e40af" />
            <path d="M190 240 L330 200 L330 208 L190 248 Z" fill="#1e3a8a" />
            {/* 屏幕 */}
            <rect x="120" y="80" width="42" height="60" rx="3" fill="#60a5fa" />
            <rect x="170" y="65" width="50" height="70" rx="3" fill="#3b82f6" />
            <rect x="228" y="85" width="40" height="55" rx="3" fill="#60a5fa" />
            {/* 屏幕内图表 */}
            <polyline points="125,128 135,118 145,123 155,108" stroke="#fff" strokeWidth="2" fill="none" />
            <rect x="178" y="115" width="6" height="14" fill="#fff" />
            <rect x="188" y="105" width="6" height="24" fill="#fff" />
            <rect x="198" y="98" width="6" height="31" fill="#fff" />
            <rect x="208" y="88" width="6" height="41" fill="#fff" />
            <circle cx="248" cy="113" r="14" stroke="#fff" strokeWidth="2" fill="none" />
            <path d="M248 113 L262 113 A14 14 0 0 0 256 102 Z" fill="#fff" />
            {/* 人物 */}
            <circle cx="195" cy="55" r="10" fill="#1f2937" />
            <rect x="187" y="65" width="16" height="22" rx="3" fill="#a78bfa" />
            <path d="M187 75 L173 95 M203 75 L218 95" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
            {/* 装饰 */}
            <circle cx="80" cy="60" r="14" fill="#c4b5fd" />
            <path d="M68 60 Q80 50 92 60 Q80 70 68 60Z" fill="#a78bfa" />
            <circle cx="320" cy="100" r="6" fill="#fbbf24" />
            <circle cx="60" cy="160" r="4" fill="#34d399" />
            <circle cx="340" cy="180" r="5" fill="#f472b6" />
          </svg>

          <div className="al2-tagline">
            <div className="al2-tagline-title">专业代理管理系统</div>
            <div className="al2-tagline-sub">查看邀请玩家数据 · CPA / 分润报表 · 钱包提款</div>
          </div>
        </div>
      </div>

      {/* 右:登入面板 */}
      <div className="al2-right">
        <div className="al2-topbar">
          <div className="al2-lang" ref={langRef}>
            <button type="button" className="al2-lang-btn" onClick={() => setLangOpen((v) => !v)}>
              <Icon name="globe" size={14} />
              <span style={{ fontSize: "18px" }}>{lang}</span>
              <Icon name="chevronDown" size={11} />
            </button>
            {langOpen &&
            <div className="al2-lang-pop">
                {['简体中文', 'English'].map((l) =>
              <div
                key={l}
                className={'al2-lang-opt' + (l === lang ? ' active' : '')}
                onClick={() => {setLang(l);setLangOpen(false);}}>
                
                    <span>{l}</span>
                    {l === lang && <Icon name="check" size={12} />}
                  </div>
              )}
              </div>
            }
          </div>
        </div>

        <div className="al2-form-wrap">
          <div className="al2-logo">
            <div className="al2-logo-ring">
              <svg width="36" height="36" viewBox="0 0 36 36">
                <path d="M9 24 Q18 6 27 24 Q18 18 9 24 Z" fill="#1f2937" />
              </svg>
            </div>
            <div className="al2-logo-name" style={{ fontSize: "26px" }}>MM专业代理后台</div>
          </div>
          <div className="al2-welcome-sub al2-welcome-sub-only" style={{ fontSize: "18px" }}>请输入您的账户信息以开始管理您的代理业务</div>

          {/* 快速选择已创建账户 */}
          <div className="al2-quick" ref={accRef}>
            <button type="button" className="al2-quick-btn" onClick={() => setAccOpen((v) => !v)}>
              <Icon name="users" size={16} />
              <span>快速选择已创建账户</span>
              <span className="al2-quick-count">{accounts.length}</span>
              <Icon name="chevronDown" size={14} />
            </button>
            {accOpen &&
            <div className="al2-quick-pop">
                {accounts.length === 0 ?
              <div className="al2-quick-empty">
                    <div className="al2-quick-empty-ico"><Icon name="users" size={18} /></div>
                    <div>暂无账户</div>
                    <div className="al2-quick-empty-hint">商户审核通过 / 创建专业代理 后会显示在此</div>
                  </div> :
              accounts.map((acc, i) =>
              <div key={acc.loginName + i} className="al2-quick-row" onClick={() => fillFromAcc(acc)}>
                    <div className="al2-quick-avatar">AP</div>
                    <div className="al2-quick-info">
                      <div className="al2-quick-name">{acc.name || acc.loginName}</div>
                      <div className="al2-quick-uid mono">{acc.userId || '-'}</div>
                    </div>
                    <div className="al2-quick-cred">
                      <div><span className="al2-quick-label">账号:</span><span className="mono">{acc.loginName}</span></div>
                      <div><span className="al2-quick-label">密码:</span><span className="mono">{acc.password}</span></div>
                    </div>
                    <span className="al2-quick-fill">填入</span>
                  </div>
              )}
              </div>
            }
          </div>

          <div className="al2-form">
            <div className="al2-field">
              <input
                placeholder="账号"
                value={loginName}
                onChange={(e) => {setLoginName(e.target.value);setError('');}}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              
            </div>
            <div className="al2-field">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="密码"
                value={password}
                onChange={(e) => {setPassword(e.target.value);setError('');}}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              
              <button type="button" className="al2-eye" onClick={() => setShowPwd((v) => !v)} title={showPwd ? '隐藏密码' : '显示密码'}>
                <Icon name={showPwd ? 'eye' : 'eyeOff'} size={15} />
              </button>
            </div>

            <label className="al2-remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span className="al2-cbox">{remember && <Icon name="check" size={12} />}</span>
              <span>记住账号</span>
            </label>

            {error && <div className="al2-error">{error}</div>}
            <button className="al2-submit" onClick={handleLogin}>登入</button>
          </div>
        </div>

        <div className="al2-copyright" style={{ fontSize: "16px" }}>Copyright © 2024 MM</div>
      </div>
    </div>);

};