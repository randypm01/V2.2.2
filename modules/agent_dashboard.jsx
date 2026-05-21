// 代理后台 - 首页 / Dashboard
// v3.1.73 精简为登入后默认欢迎页(图):仅显示 你好,XXX + 欢迎回来 · 上次登录 时间
const ADUI = window.UI;

function AgentDashboardModule({ onNav }) {
  const me = window.useCurrentAgent();
  const [lang] = window.useAgentLang();
  const T = (k, fb) => window.t(k, fb);
  const [copied, setCopied] = React.useState(false);

  // v3.1.75 首页按图重做 — 显示 代理名称 + 大圆头像 + 代理ID + 复制
  const agentName = me?.name || me?._appData?.loginName || me?.loginName || '';
  const agentId   = me?._displayId || me?.id || '';

  // 头像首字母 — 用 AC 前缀
  const avatarText = (agentId && agentId.slice(0, 2)) || 'AC';

  // 上次登录时间(模拟)— 2 小时前
  const lastLogin = React.useMemo(() => {
    const d = new Date(Date.now() - 2 * 3600 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }, []);

  const copyId = () => {
    if (!agentId) return;
    try {
      navigator.clipboard.writeText(agentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {}
  };

  return (
    <div className="page">
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 28, padding: '60px 20px 40px',
      }}>
        {/* —— 你好,代理名称 —— */}
        <h1 style={{
          fontSize: 36, fontWeight: 600, color: 'var(--text-0)',
          margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em',
        }}>
          {T('home.hello', '你好,')}{agentName}
        </h1>

        {/* —— 大圆头像 AC —— */}
        <div style={{
          width: 168, height: 168, borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.18)',
          border: '4px solid #f59e0b',
          display: 'grid', placeItems: 'center',
          fontSize: 56, fontWeight: 700, color: '#f59e0b',
          letterSpacing: '0.04em',
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        }}>{avatarText}</div>

        {/* —— 代理ID + 复制 —— */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 28, fontWeight: 500, color: 'var(--text-0)',
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          letterSpacing: '0.02em',
        }}>
          <span>{agentId}</span>
          <button
            onClick={copyId}
            title={copied ? '已复制' : '复制代理ID'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, display: 'inline-flex', alignItems: 'center',
              color: copied ? 'var(--success)' : 'var(--text-2)',
            }}
          >
            <Icon name={copied ? 'check' : 'copy'} size={20}/>
          </button>
        </div>

        {/* —— 欢迎回来 + 上次登录 —— */}
        <div style={{
          fontSize: 15, color: 'var(--text-2)', textAlign: 'center',
        }}>
          {T('home.welcome_back', '欢迎回来')} · {T('home.last_login', '上次登录')}{' '}
          <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-1)' }}>{lastLogin}</span>
        </div>
      </div>
    </div>
  );
}

window.AgentDashboardModule = AgentDashboardModule;
