// ============================================================
// 共享单据链 store — 分润期号 → CS → WR → FS → PO
// 商户后台(代理佣金结算单 / 提款审核)与 代理后台(佣金结算单 / 提款审核进度)
// 共读同一份数据,任一端操作即时同步。
//
// 单号规则(完全照 PRD 落地):
//   分润期号  W26054 / M2605
//   佣金结算单 CS  CSW26054000001   = CS + 期号 + 6位流水
//   提款申请单 WR  WR20260603000001 = WR + 申请日期(YYYYMMDD) + 6位流水
//   财务核算单 FS  FS20260604000001 = FS + 建立日期 + 6位流水
//   付款单    PO  PO20260605000001 = PO + 付款日期 + 6位流水
//
// 币种统一 ₹ (INR),最低提款门槛 ₹1000。
// ============================================================
(function () {
  'use strict';

  const THRESHOLD = 1000;             // 最低提款门槛
  const CUR = '₹';                    // 币种符号

  // —— 5 个周结分润期号(与「分润报表 → 已结算分润」对齐)——
  const PERIODS = [
    { code: 'W26054', range: '2026/5/25 ~ 2026/5/31', endTs: new Date('2026/5/31').getTime() },
    { code: 'W26053', range: '2026/5/18 ~ 2026/5/24', endTs: new Date('2026/5/24').getTime() },
    { code: 'W26052', range: '2026/5/11 ~ 2026/5/17', endTs: new Date('2026/5/17').getTime() },
    { code: 'W26051', range: '2026/5/4 ~ 2026/5/10',  endTs: new Date('2026/5/10').getTime() },
    { code: 'W26044', range: '2026/4/27 ~ 2026/5/3',  endTs: new Date('2026/5/3').getTime() },
  ];

  // —— 确定性伪随机(按 agent 序号 seed,保证刷新稳定)——
  function mk(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647) / 2147483647; }

  const pad6 = (n) => String(n).padStart(6, '0');
  const ymd = (ts) => { const d = new Date(ts); return '' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };

  // v3.7.3 代理名称统一从「商户后台 已创建代理 store」解析(与 useCurrentAgent 同源),
  //        避免 billing 用 data.js 随机名(如 Sara_Network)导致商户/代理两端 AC100006 名字对不上。
  function resolveAgentName(id, fallback) {
    const s = window.APS_MERCHANT_AGENTS_STORE;
    if (s && s.list) { const h = s.list.find((x) => x.id === id || x._displayId === id); if (h && h.name) return h.name; }
    return fallback;
  }

  // —— 收款方式池 ——
  const METHODS = [
    { method: 'USDT-TRC20', acct: 'TXk9...18jK9q', fee: 1 },
    { method: 'USDT-ERC20', acct: '0x7a...4F2b', fee: 6 },
    { method: 'PIX', acct: '***.456.789-01', fee: 0 },
    { method: '银行电汇', acct: 'Itaú ****1234', fee: 15 },
  ];

  // ====================== store ======================
  const store = {
    cs: [],   // 佣金结算单
    wr: [],   // 提款申请单
    fs: [],   // 财务核算单
    po: [],   // 付款单
    cf: [],   // 财务转结单(carry-forward,记 待抵扣/已抵扣)
    _inited: false,
    _subs: new Set(),
    _seq: { wr: 0, fs: 0, po: 0, cf: 0 },
    subscribe(fn) { this._subs.add(fn); return () => this._subs.delete(fn); },
    _notify() { this._subs.forEach((fn) => { try { fn(); } catch (e) {} }); },
    CUR, THRESHOLD, PERIODS,
  };

  // —— FS 核算扣款计算 ——
  // payable = 申请金额 - 行政费 - 税金 - 违规扣款 - 风控扣款 + 人工调整 - 保留款 - 转结金额
  function calcPayable(fs) {
    return Math.round(
      fs.applyAmount - fs.adminFee - fs.tax - fs.violationDeduct - fs.riskDeduct
      + fs.manualAdjust - fs.reserve - fs.carryOut + (fs.carryIn || 0)
    );
  }
  store.calcPayable = calcPayable;

  // —— 为一批 CS 生成一条提款子链(WR[+FS[+PO]])。stage:'auditing'(审核中+FS核算中)/ 'complete'(已提款+FS已付款+PO)。
  function buildBatchDoc(agent, idx, batch, stage) {
    if (!batch.length) return;
    const applyAmount = batch.reduce((a, c) => a + c.totalCommission, 0);
    const m = METHODS[(idx + (stage === 'complete' ? 0 : 1)) % METHODS.length];
    const reqTs = batch[0].settledAt + 86400000;
    const wr = {
      id: 'WR' + ymd(reqTs) + pad6(++store._seq.wr),
      agentId: agent.id, agentName: agent.name, requestAt: reqTs,
      csIds: batch.map((c) => c.id), csCount: batch.length, amount: applyAmount,
      method: m.method, account: m.acct, reviewer: 'ops.lily', reviewAt: reqTs + 3 * 3600000,
      status: 'reviewing', rejectReason: null, fsId: null,
    };
    batch.forEach((c) => { c.status = 'reviewing'; c.wrId = wr.id; });
    store.wr.push(wr);
    // stage 'rejected':商户审核未通过 → WR 已拒绝,CS 退回「已拒绝」(可重新申请),不生成 FS
    if (stage === 'rejected') {
      wr.status = 'rejected';
      wr.rejectReason = '收款信息与实名不一致,请更新收款方式后重新申请';
      wr.reviewer = 'ops.lily'; wr.reviewAt = reqTs + 3 * 3600000;
      batch.forEach((c) => { c.status = 'rejected'; c.rejectReason = wr.rejectReason; c.statusAt = wr.reviewAt; });
      return;
    }
    const fsTs = reqTs + 86400000;
    const fs = {
      id: 'FS' + ymd(fsTs) + pad6(++store._seq.fs), wrId: wr.id,
      agentId: agent.id, agentName: agent.name, applyAmount,
      adminFee: Math.round(applyAmount * 0.01), tax: 0,
      violationDeduct: 0, riskDeduct: 0, manualAdjust: 0, reserve: 0, carryOut: 0,
      payable: 0, auditor: 'finance.amy', auditAt: fsTs + 2 * 3600000,
      status: 'auditing', statusAt: fsTs + 2 * 3600000, createdAt: fsTs, poId: null,
    };
    fs.payable = calcPayable(fs);
    wr.fsId = fs.id;
    store.fs.push(fs);
    if (stage === 'auditing') return;
    const poTs = fs.auditAt + 2 * 3600000;
    const po = {
      id: 'PO' + ymd(poTs) + pad6(++store._seq.po), fsId: fs.id, wrId: wr.id,
      agentId: agent.id, agentName: agent.name, amount: fs.payable,
      method: m.method, account: m.acct,
      txid: 'TX' + ymd(poTs) + pad6(idx * 7 + (stage === 'complete' ? 3 : 9)).slice(-6),
      paidAt: poTs, status: 'success',
    };
    fs.poId = po.id; fs.status = 'paid'; fs.statusAt = poTs;
    wr.status = 'paid';
    batch.forEach((c) => { c.status = 'paid'; c.statusAt = poTs; });
    store.po.push(po);
  }

  // —— 登入代理专用演示数据 ——
  // 需求(按设计图):仅「最新一期」可为待提款;更早各期必定已进入下游状态。
  // 因为代理每次申请提款都会把「所有」待提款单一并打包,故旧期不可能停留在待提款。
  // 覆盖顺序(新→旧):待提款 / 转结下期 / 审核中 / 付款中 / 已拒绝·待提款 / 已付款 ×3
  // 按设计图:进度列表 8 行,一行一态,新→旧依次
  // 审核中 / 已拒绝 / 核算中 / 已驳回 / 已转结 / 付款中 / 付款失败 / 付款成功
  // 另保留 待提款(withdrawable)/ 已转结(carried)两期供「佣金结算单」页演示(不生成 WR,不进度列表)
  const RICH_PERIODS = [
    { code: 'W26064', serial: 1,  range: '2026/6/22 ~ 2026/6/28', end: '2026/6/28', cur: 4880,  carriedIn: 0,   fromId: null, stage: 'withdrawable' },
    { code: 'W26063', serial: 17, range: '2026/6/15 ~ 2026/6/21', end: '2026/6/21', cur: 680,   carriedIn: 0,   fromId: null, stage: 'withdrawable' },
    { code: 'W26062', serial: 2,  range: '2026/6/8 ~ 2026/6/14',  end: '2026/6/14', cur: 5400,  carriedIn: 0,   fromId: null, stage: 'reviewing' },
    { code: 'W26061', serial: 9,  range: '2026/6/1 ~ 2026/6/7',   end: '2026/6/7',  cur: 3100,  carriedIn: 0,   fromId: null, stage: 'rejected' },
    { code: 'W26054', serial: 16, range: '2026/5/25 ~ 2026/5/31', end: '2026/5/31', cur: 7250,  carriedIn: 0,   fromId: null, stage: 'auditing' },
    { code: 'W26053', serial: 2,  range: '2026/5/18 ~ 2026/5/24', end: '2026/5/24', cur: 2900,  carriedIn: 0,   fromId: null, stage: 'fsRejected' },
    { code: 'W26052', serial: 5,  range: '2026/5/11 ~ 2026/5/17', end: '2026/5/17', cur: 4600,  carriedIn: 0,   fromId: null, stage: 'fsCarried' },
    { code: 'W26051', serial: 32, range: '2026/5/4 ~ 2026/5/10',  end: '2026/5/10', cur: 8100,  carriedIn: 0,   fromId: null, stage: 'paying' },
    { code: 'W26044', serial: 12, range: '2026/4/27 ~ 2026/5/3',  end: '2026/5/3',  cur: 3700,  carriedIn: 0,   fromId: null, stage: 'payFailed' },
    { code: 'W26043', serial: 7,  range: '2026/4/20 ~ 2026/4/26', end: '2026/4/26', cur: 5950,  carriedIn: 0,   fromId: null, stage: 'paid', mergeGroup: 'paidBatch' },
    { code: 'W26042', serial: 5,  range: '2026/4/13 ~ 2026/4/19', end: '2026/4/19', cur: 4350,  carriedIn: 0,   fromId: null, stage: 'paid', mergeGroup: 'paidBatch' },
    { code: 'W26041', serial: 3,  range: '2026/4/6 ~ 2026/4/12',  end: '2026/4/12', cur: 6800,  carriedIn: 0,   fromId: null, stage: 'paid', mergeGroup: 'paidBatch' },
  ];

  // 为单张 CS 生成其下游单据链,并把 CS 设到目标状态
  function buildSingleChain(agent, idx, cs, stage) {
    const applyAmount = cs.totalCommission;
    const m = METHODS[idx % METHODS.length];
    const reqTs = cs.settledAt + 86400000;
    const wr = {
      id: 'WR' + ymd(reqTs) + pad6(++store._seq.wr),
      agentId: agent.id, agentName: agent.name, requestAt: reqTs,
      csIds: [cs.id], csCount: 1, amount: applyAmount,
      method: m.method, account: m.acct, reviewer: null, reviewAt: null,
      status: 'reviewing', rejectReason: null, fsId: null,
    };
    cs.wrId = wr.id;
    store.wr.push(wr);

    // 审核中:WR 待商户审核,无 FS
    if (stage === 'reviewing') { cs.status = 'reviewing'; cs.statusAt = reqTs; return; }

    // 已拒绝:商户审核未通过 → CS 退回「已拒绝·待提款」,可重新申请
    if (stage === 'rejected') {
      wr.status = 'rejected'; wr.reviewer = 'ops.lily'; wr.reviewAt = reqTs + 3 * 3600000;
      wr.rejectReason = '收款信息与实名不一致,请更新收款方式后重新申请';
      cs.status = 'rejected'; cs.rejectReason = wr.rejectReason; cs.statusAt = wr.reviewAt;
      return;
    }

    // 商户通过 → 生成 FS(核算)
    wr.reviewer = 'ops.lily'; wr.reviewAt = reqTs + 3 * 3600000;
    const fsTs = reqTs + 86400000;
    const fs = {
      id: 'FS' + ymd(fsTs) + pad6(++store._seq.fs), wrId: wr.id,
      agentId: agent.id, agentName: agent.name, applyAmount,
      adminFee: Math.round(applyAmount * 0.01), tax: 0,
      violationDeduct: 0, riskDeduct: 0, manualAdjust: 0, reserve: 0, carryOut: 0,
      payable: 0, auditor: 'finance.amy', auditAt: fsTs + 2 * 3600000,
      status: 'auditing', statusAt: fsTs + 2 * 3600000, createdAt: fsTs, poId: null,
    };
    fs.payable = calcPayable(fs);
    wr.fsId = fs.id;
    store.fs.push(fs);

    // 核算中:FS 停在核算中,尚无付款(WR 已通过)—— CS 状态 auditing(独立于提款审核「审核中」)
    if (stage === 'auditing') {
      cs.status = 'auditing'; cs.statusAt = fs.statusAt;
      return;
    }

    // 已驳回:财务核算驳回 → 退回待提款,可重新申请
    if (stage === 'fsRejected') {
      fs.status = 'rejected'; fs.statusAt = fs.auditAt + 3600000;
      fs.rejectReason = '核算发现收款信息异常,已驳回本次提款,请核实后重新申请';
      cs.status = 'auditRejected'; cs.rejectReason = fs.rejectReason; cs.statusAt = fs.statusAt;
      return;
    }

    // 财务转结:扣款后应付 ≤ 0,本期欠款转结下期 —— CS 状态 auditCarried(区别于结算门槛的 carried)
    if (stage === 'fsCarried') {
      // 扣款合计 > 申请额 → 应付0,差额(扣款−申请)转结下期
      // 转结金额取实际差额,刻意与申请额(4600)不同,避免混淆
      fs.violationDeduct = 3300;
      fs.riskDeduct = 3000;
      const _deduct = fs.adminFee + fs.tax + fs.violationDeduct + fs.riskDeduct + fs.reserve - fs.manualAdjust;
      fs.carryOut = _deduct - applyAmount;   // = 1746,差额转结,≠ 申请额
      fs.payable = 0;                          // 应付0,本期不付款,差额转下期
      fs.status = 'carried'; fs.statusAt = fs.auditAt + 3600000;
      cs.status = 'auditCarried'; cs.statusAt = fs.statusAt;
      // 生成财务转结单(金额=负的转结额,待抵扣)
      const cf52 = {
        id: 'CF' + ymd(fs.statusAt) + pad6(++store._seq.cf),
        agentId: agent.id, agentName: agent.name,
        amount: -fs.carryOut, sourceFsId: fs.id, sourceWrId: wr.id,
        status: 'pending', createdAt: fs.statusAt, consumedFsId: null, consumedAt: null,
      };
      fs.carryCfId = cf52.id;
      store.cf.push(cf52);
      return;
    }

    // 付款失败:核算完成进入付款但失败 —— CS 退回「付款失败·待提款」，可重新申请
    if (stage === 'payFailed') {
      fs.status = 'payFailed'; fs.statusAt = fs.auditAt + 3600000;
      cs.status = 'payFailed'; cs.statusAt = fs.statusAt;
      return;
    }

    // 付款中:核算完成进入付款,尚未生成 PO,CS 显示「付款中」
    if (stage === 'paying') {
      fs.status = 'paying'; fs.statusAt = fs.auditAt + 3600000;
      cs.status = 'paying'; cs.statusAt = fs.statusAt;
      return;
    }

    // 已付款:生成 PO,全链完成
    const poTs = fs.auditAt + 2 * 3600000;
    const po = {
      id: 'PO' + ymd(poTs) + pad6(++store._seq.po), fsId: fs.id, wrId: wr.id,
      agentId: agent.id, agentName: agent.name, amount: fs.payable,
      method: m.method, account: m.acct,
      txid: 'TX' + ymd(poTs) + pad6(idx * 7 + 3).slice(-6), paidAt: poTs, status: 'success',
    };
    fs.poId = po.id; fs.status = 'paid'; fs.statusAt = poTs;
    wr.status = 'paid';
    cs.status = 'paid'; cs.statusAt = poTs;
    store.po.push(po);
  }

  function buildRichDemo(agent) {
    const mergeBuckets = {};
    RICH_PERIODS.forEach((p, i) => {
      const endTs = new Date(p.end).getTime();
      const settledAt = endTs + 2 * 86400000;
      const total = p.cur + p.carriedIn;
      const cpa = Math.round(p.cur * 0.5);
      const revShare = p.cur - cpa;
      const cs = {
        id: 'CS' + p.code + pad6(p.serial),
        agentId: agent.id, agentName: agent.name,
        period: p.code, periodType: 'W', periodRange: p.range,
        settledAt,
        cpa, revShare, adjust: 0,
        curCommission: p.cur, carriedIn: p.carriedIn, carriedFromId: p.fromId,
        totalCommission: total,
        threshold: THRESHOLD,
        withdrawable: total,
        status: 'withdrawable', statusAt: settledAt, wrId: null,
      };
      store.cs.push(cs);
      if (p.stage === 'withdrawable') return;           // 待提款,保持
      // 合并组:多张 CS 打包到「一张」提款申请单(同一 WR/FS/PO)
      if (p.mergeGroup) { (mergeBuckets[p.mergeGroup] = mergeBuckets[p.mergeGroup] || []).push({ cs, i }); return; }
      buildSingleChain(agent, i, cs, p.stage);
    });
    // 逐个合并组生成一条「付款成功」的合并链
    Object.values(mergeBuckets).forEach((items) => buildMergedPaidChain(agent, items));
    // A2 演示:财务转结闭环链(整笔转入 + 不够开新单)
    buildCarryDemo(agent);
  }

  // —— A2 演示:财务转结闭环 —— 周期A 应付 -5000 → 转结 CF_A;周期B 申请2000 转入 CF_A → 应付 -3000 → 转结 CF_B
  function buildCarryDemo(agent) {
    const M = METHODS[0];
    function makeCarriedPeriod(opts) {
      const settledAt = opts.endTs + 2 * 86400000;
      const apply = opts.apply;
      const cs = {
        id: 'CS' + opts.code + pad6(opts.serial),
        agentId: agent.id, agentName: agent.name,
        period: opts.code, periodType: 'W', periodRange: opts.range,
        settledAt, cpa: Math.round(apply * 0.5), revShare: apply - Math.round(apply * 0.5), adjust: 0,
        curCommission: apply, carriedIn: 0, carriedFromId: null,
        totalCommission: apply, threshold: THRESHOLD, withdrawable: apply,
        status: 'auditCarried', statusAt: settledAt, wrId: null,
      };
      store.cs.push(cs);
      const reqTs = settledAt + 86400000;
      const wr = {
        id: 'WR' + ymd(reqTs) + pad6(++store._seq.wr),
        agentId: agent.id, agentName: agent.name, requestAt: reqTs,
        csIds: [cs.id], csCount: 1, amount: apply,
        method: M.method, account: M.acct,
        reviewer: 'ops.lily', reviewAt: reqTs + 3 * 3600000,
        status: 'carried', rejectReason: null, fsId: null,
      };
      cs.wrId = wr.id;
      store.wr.push(wr);
      const fsTs = reqTs + 86400000;
      const fs = {
        id: 'FS' + ymd(fsTs) + pad6(++store._seq.fs), wrId: wr.id,
        agentId: agent.id, agentName: agent.name, applyAmount: apply,
        adminFee: 0, tax: 0, violationDeduct: opts.viol || 0, riskDeduct: opts.risk || 0,
        manualAdjust: 0, reserve: 0, carryOut: 0, carryIn: 0, carryInCfId: null,
        payable: 0, auditor: 'finance.amy', auditAt: fsTs + 2 * 3600000,
        status: 'carried', statusAt: fsTs + 3 * 3600000, createdAt: fsTs, poId: null,
      };
      if (opts.carryInCf) {
        fs.carryIn = opts.carryInCf.amount;          // 负值,整笔转入
        fs.carryInCfId = opts.carryInCf.id;
        opts.carryInCf.status = 'consumed';
        opts.carryInCf.consumedFsId = fs.id;
        opts.carryInCf.consumedAt = fs.statusAt;
      }
      fs.payable = calcPayable(fs);                  // 负值
      wr.fsId = fs.id;
      store.fs.push(fs);
      const cf = {
        id: 'CF' + ymd(fs.statusAt) + pad6(++store._seq.cf),
        agentId: agent.id, agentName: agent.name,
        amount: fs.payable, sourceFsId: fs.id, sourceWrId: wr.id,
        status: 'pending', createdAt: fs.statusAt, consumedFsId: null, consumedAt: null,
      };
      fs.carryCfId = cf.id;
      store.cf.push(cf);
      return { cs, wr, fs, cf };
    }
    // 周期A:申请4000,违规6000,风控3000 → 应付 -5000 → CF_A(-5000)
    const A = makeCarriedPeriod({ code: 'W26032', serial: 3, range: '2026/3/9 ~ 2026/3/15', endTs: new Date('2026/3/15').getTime(), apply: 4000, viol: 6000, risk: 3000 });
    // 周期B:申请2000,转入 CF_A(-5000) → 应付 -3000 → CF_B(-3000)
    makeCarriedPeriod({ code: 'W26033', serial: 4, range: '2026/3/16 ~ 2026/3/22', endTs: new Date('2026/3/22').getTime(), apply: 2000, carryInCf: A.cf });
  }

  // —— 多张 CS 合并到「一张」提款申请单,并走完整付款成功链(WR/FS/PO 各一)——
  function buildMergedPaidChain(agent, items) {
    const csList = items.map((x) => x.cs);   // 列表第一条 = 最新一期
    const idx = items[0].i;
    const m = METHODS[idx % METHODS.length];
    const applyAmount = csList.reduce((a, c) => a + c.totalCommission, 0);
    const reqTs = csList[0].settledAt + 86400000;
    const wr = {
      id: 'WR' + ymd(reqTs) + pad6(++store._seq.wr),
      agentId: agent.id, agentName: agent.name, requestAt: reqTs,
      csIds: csList.map((c) => c.id), csCount: csList.length, amount: applyAmount,
      method: m.method, account: m.acct,
      reviewer: 'ops.lily', reviewAt: reqTs + 3 * 3600000,
      status: 'paid', rejectReason: null, fsId: null,
    };
    csList.forEach((c) => { c.wrId = wr.id; });
    store.wr.push(wr);

    const fsTs = reqTs + 86400000;
    const fs = {
      id: 'FS' + ymd(fsTs) + pad6(++store._seq.fs), wrId: wr.id,
      agentId: agent.id, agentName: agent.name, applyAmount,
      adminFee: Math.round(applyAmount * 0.01), tax: 0,
      violationDeduct: 0, riskDeduct: 0, manualAdjust: 0, reserve: 0, carryOut: 0,
      payable: 0, auditor: 'finance.amy', auditAt: fsTs + 2 * 3600000,
      status: 'paid', statusAt: fsTs + 2 * 3600000, createdAt: fsTs, poId: null,
    };
    fs.payable = calcPayable(fs);
    wr.fsId = fs.id;
    store.fs.push(fs);

    const poTs = fs.auditAt + 2 * 3600000;
    const po = {
      id: 'PO' + ymd(poTs) + pad6(++store._seq.po), fsId: fs.id, wrId: wr.id,
      agentId: agent.id, agentName: agent.name, amount: fs.payable,
      method: m.method, account: m.acct,
      txid: 'TX' + ymd(poTs) + pad6(idx * 7 + 3).slice(-6), paidAt: poTs, status: 'success',
    };
    fs.poId = po.id; fs.statusAt = poTs;
    csList.forEach((c) => { c.status = 'paid'; c.statusAt = poTs; });
    store.po.push(po);
  }

  // —— 生成单个代理的整条单据链 ——
  // pattern 决定该代理整体处于哪个阶段,覆盖全部状态组合
  function buildAgentChain(agent, idx, rich) {
    if (rich) { buildRichDemo(agent); return; }
    const rnd = mk(1000 + idx * 37);
    const pattern = idx % 7;
    const csList = [];

    // 每个代理在 5 期里取若干期生成 CS
    let carriedIn = 0;
    PERIODS.forEach((p, pi) => {
      // 期号流水(每个代理在该期 1 张)
      const serial = (idx % 90) + 1;
      const cpa = Math.round(rnd() * 4500 + (pi === 4 ? 0 : 600));
      const revShare = Math.round(rnd() * 5200);
      const adjust = rnd() > 0.78 ? Math.round((rnd() - 0.55) * 600) : 0;
      const curCommission = cpa + revShare + adjust;        // 本期佣金
      const totalCommission = curCommission + carriedIn;    // 本期总佣金
      const withdrawable = totalCommission;

      const cs = {
        id: 'CS' + p.code + pad6(serial),
        agentId: agent.id, agentName: agent.name,
        period: p.code, periodType: 'W', periodRange: p.range,
        settledAt: p.endTs + 2 * 86400000,
        cpa, revShare, adjust,
        curCommission, carriedIn, totalCommission,
        threshold: THRESHOLD, withdrawable,
        status: 'withdrawable',   // 默认待提款,稍后按 pattern 流转
        statusAt: p.endTs + 2 * 86400000,
        wrId: null,
      };

      // v3.7.42 取消「结算门槛转结」:一律待提款,门槛改到提款申请时校验
      carriedIn = 0;
      csList.push(cs);
    });

    store.cs.push(...csList);

    // 可提款的 CS(达门槛、未转结)
    const ready = csList.filter((c) => c.status === 'withdrawable');
    if (ready.length === 0) return;

    // 焦点代理(登入代理):保证一条完整链 + 一条进行中链,其余待提款,时间轴可演示
    if (rich) {
      buildBatchDoc(agent, idx, ready.slice(0, 1), 'complete');
      if (ready.length >= 2) buildBatchDoc(agent, idx, ready.slice(1, 2), 'auditing');
      if (ready.length >= 3) buildBatchDoc(agent, idx, ready.slice(2, 3), 'rejected');
      return;
    }

    // pattern 0:全部停留待提款(不发起提款)
    if (pattern === 0) return;

    // 其余 pattern:把最早的 1~2 张达门槛 CS 打包成一次提款
    const batch = ready.slice(Math.max(0, ready.length - 2));
    const applyAmount = batch.reduce((a, c) => a + c.totalCommission, 0);
    const m = METHODS[idx % METHODS.length];
    const reqTs = batch[0].settledAt + 86400000;

    const wr = {
      id: 'WR' + ymd(reqTs) + pad6(++store._seq.wr),
      agentId: agent.id, agentName: agent.name,
      requestAt: reqTs,
      csIds: batch.map((c) => c.id),
      csCount: batch.length,
      amount: applyAmount,
      method: m.method, account: m.acct,
      reviewer: null, reviewAt: null,
      status: 'reviewing',      // 审核中
      rejectReason: null,
      fsId: null,
    };
    batch.forEach((c) => { c.status = 'reviewing'; c.wrId = wr.id; });
    store.wr.push(wr);

    // pattern 1:WR 审核中,商户尚未通过(无 FS)
    if (pattern === 1) return;

    // 商户通过 → 生成 FS
    wr.reviewer = 'ops.lily'; wr.reviewAt = reqTs + 3 * 3600000;
    const fsTs = reqTs + 86400000;
    const adminFee = Math.round(applyAmount * 0.01);
    const tax = 0;
    const riskDeduct = pattern === 6 ? Math.round(applyAmount * 1.1) : (rnd() > 0.7 ? Math.round(rnd() * 300) : 0);
    const violationDeduct = 0;
    const fs = {
      id: 'FS' + ymd(fsTs) + pad6(++store._seq.fs),
      wrId: wr.id,
      agentId: agent.id, agentName: agent.name,
      applyAmount,
      adminFee, tax, violationDeduct, riskDeduct,
      manualAdjust: 0, reserve: 0, carryOut: 0,
      payable: 0,
      auditor: null, auditAt: null,
      status: 'pending',        // 待核算
      statusAt: fsTs,
      createdAt: fsTs,
      poId: null,
    };
    wr.fsId = fs.id;
    store.fs.push(fs);
    // 商户通过、进入财务核算 → CS 状态 auditing(下游 pattern 会再覆盖为转结/付款失败/已付款)
    batch.forEach((c) => { c.status = 'auditing'; c.statusAt = fs.statusAt; });

    // pattern 2:FS 待核算
    if (pattern === 2) { fs.payable = calcPayable(fs); return; }

    // 进入核算中
    fs.auditor = 'finance.amy'; fs.auditAt = fsTs + 2 * 3600000; fs.status = 'auditing'; fs.statusAt = fs.auditAt;

    // pattern 6:扣款后应付 ≤ 0 → 财务转结
    if (pattern === 6) {
      fs.payable = calcPayable(fs);
      if (fs.payable <= 0) {
        fs.carryOut = applyAmount;     // 全部转结下期财务调整
        fs.payable = calcPayable(fs);
        fs.status = 'carried';         // FS 已转结
        wr.status = 'reviewing';
        batch.forEach((c) => { c.status = 'auditCarried'; c.statusAt = fs.statusAt; });
        return;
      }
    }
    fs.payable = calcPayable(fs);

    // pattern 3:核算中
    if (pattern === 3) return;

    // 核算完成 → 付款中
    fs.status = 'paying'; fs.statusAt = fs.auditAt + 3600000;

    // pattern 5:付款失败 → CS 退回「付款失败·待提款」可重新申请
    if (pattern === 5) { fs.status = 'payFailed'; batch.forEach((c) => { c.status = 'payFailed'; c.statusAt = fs.statusAt; }); return; }

    // pattern 4:付款成功 → PO,FS 已付款,WR 已提款,CS 已付款
    const poTs = fs.auditAt + 2 * 3600000;
    const po = {
      id: 'PO' + ymd(poTs) + pad6(++store._seq.po),
      fsId: fs.id, wrId: wr.id,
      agentId: agent.id, agentName: agent.name,
      amount: fs.payable,
      method: m.method, account: m.acct,
      txid: 'TX' + ymd(poTs) + pad6(idx * 7 + 11).slice(-6),
      paidAt: poTs,
      status: 'success',       // 付款成功
    };
    fs.poId = po.id; fs.status = 'paid'; fs.statusAt = poTs;
    wr.status = 'paid';        // 已提款
    batch.forEach((c) => { c.status = 'paid'; c.statusAt = poTs; });
    store.po.push(po);
  }

  // ====================== 初始化 ======================
  store.init = function () {
    if (this._inited) return;
    const D = window.APS_DATA;
    if (!D) return;
    // v3.7.3 先确保「商户已创建代理 store」就绪,代理名称才能取到 curated 名(AC範例x),与代理后台对得上
    if (!window.APS_MERCHANT_AGENTS_STORE && typeof window.APS_ensureMerchantAgentsStore === 'function') {
      try { window.APS_ensureMerchantAgentsStore(); } catch (e) {}
    }

    // 参与单据链的代理:当前登入代理 + 若干活跃代理(有玩家)
    const meId = window.CURRENT_AGENT_ID;
    const me = D.agents.find((a) => a.id === meId) || D.agents[1];
    const others = D.agents.filter((a) => a.status === 'active' && a.players > 0 && a.id !== me.id).slice(0, 22);
    // 名称对齐 curated store(AC範例x),与代理后台 useCurrentAgent 一致
    const agents = [me, ...others].map((a) => ({ ...a, name: resolveAgentName(a.id, a.name) }));

    agents.forEach((a, i) => buildAgentChain(a, i, i === 0));
    if (!this._richSet) this._richSet = new Set();
    this._richSet.add(me.id);
    this._meId = me.id;
    this._inited = true;
  };

  // 确保“当前/登入代理”拥有丰富单据链(含完成+进行中),让「提款审核进度」开箱可演示。
  // 只在首次遇到该代理时重建(清掉其原生成单据后重建为 rich 链),不重复。
  store.focusAgent = function (agentId) {
    if (!agentId || !this._inited) return;
    if (!this._richSet) this._richSet = new Set();
    if (this._richSet.has(agentId)) return;
    // v3.7.48 只有 AC100006(全状态演示账户)建满血单据链;其余账户当作「新开、零数据」
    this.cs = this.cs.filter((c) => c.agentId !== agentId);
    this.wr = this.wr.filter((w) => w.agentId !== agentId);
    this.fs = this.fs.filter((f) => f.agentId !== agentId);
    this.po = this.po.filter((p) => p.agentId !== agentId);
    this.cf = this.cf.filter((c) => c.agentId !== agentId);
    if (agentId === 'AC100006') {
      const D = window.APS_DATA;
      const found = (D && D.agents.find((a) => a.id === agentId)) || { id: agentId, name: agentId };
      const agent = { ...found, name: resolveAgentName(agentId, found.name) };
      buildAgentChain(agent, 0, true);
    }
    this._richSet.add(agentId);
  };

  // ====================== 查询 ======================
  store.csOf = function (agentId) { return this.cs.filter((c) => c.agentId === agentId); };
  store.wrOf = function (agentId) { return this.wr.filter((w) => w.agentId === agentId); };
  store.fsById = function (id) { return this.fs.find((f) => f.id === id) || null; };
  store.wrById = function (id) { return this.wr.find((w) => w.id === id) || null; };
  store.poById = function (id) { return this.po.find((p) => p.id === id) || null; };
  store.csByIds = function (ids) { return this.cs.filter((c) => ids.includes(c.id)); };
  store.cfById = function (id) { return this.cf.find((c) => c.id === id) || null; };
  store.cfOf = function (agentId) { return this.cf.filter((c) => c.agentId === agentId); };

  // —— 单据备注(商户后台用,按单号 WR/FS 存;跨页保留,刷新重置)——
  store.getNote = function (id) { return (this._notes && this._notes[id]) || []; };
  store.setNote = function (id, list) { if (!this._notes) this._notes = {}; this._notes[id] = list; this._notify(); };

  // ====================== 流转 action ======================

  // 代理发起提款:勾选待提款 CS → 生成 WR(审核中),CS 转审核中
  store.createWithdraw = function (agentId, csIds, method, account) {
    const _meBase = window.APS_DATA.agents.find((a) => a.id === agentId) || { id: agentId, name: agentId };
    const me = { ..._meBase, name: resolveAgentName(agentId, _meBase.name) };
    // 待提款 + 已拒绝 + 付款失败(均可重新申请)均可发起提款
    const list = this.csByIds(csIds).filter((c) => c.agentId === agentId && (c.status === 'withdrawable' || c.status === 'rejected' || c.status === 'auditRejected' || c.status === 'payFailed'));
    if (list.length === 0) return null;
    const amount = list.reduce((a, c) => a + c.totalCommission, 0);
    const ts = Date.now();
    const wr = {
      id: 'WR' + ymd(ts) + pad6(++this._seq.wr),
      agentId, agentName: me.name,
      requestAt: ts,
      csIds: list.map((c) => c.id), csCount: list.length,
      amount, method, account,
      reviewer: null, reviewAt: null,
      status: 'reviewing', rejectReason: null, fsId: null,
    };
    list.forEach((c) => { c.status = 'reviewing'; c.wrId = wr.id; c.rejectReason = null; c.statusAt = ts; });
    this.wr.unshift(wr);
    this._notify();
    return wr;
  };

  // 商户通过提款申请 → 生成 FS(待核算)
  store.approveWR = function (wrId, reviewer = 'ops.lily') {
    const wr = this.wrById(wrId); if (!wr || wr.status !== 'reviewing' || wr.fsId) return;
    wr.reviewer = reviewer; wr.reviewAt = Date.now();
    const ts = Date.now();
    const fs = {
      id: 'FS' + ymd(ts) + pad6(++this._seq.fs),
      wrId: wr.id, agentId: wr.agentId, agentName: wr.agentName,
      applyAmount: wr.amount,
      adminFee: Math.round(wr.amount * 0.01), tax: 0,
      violationDeduct: 0, riskDeduct: 0, manualAdjust: 0, reserve: 0, carryOut: 0,
      payable: 0, auditor: 'finance.amy', auditAt: ts,
      status: 'auditing', statusAt: ts, createdAt: ts, poId: null,
    };
    fs.payable = calcPayable(fs);
    wr.fsId = fs.id;
    this.fs.unshift(fs);
    // 商户通过 → 进入财务核算,CS 状态 auditing(核算中,独立于提款审核「审核中」)
    this.csByIds(wr.csIds).forEach((c) => { c.status = 'auditing'; c.statusAt = Date.now(); });
    this._notify();
    return fs;
  };

  // 商户拒绝提款申请 → WR 已拒绝,CS 退回待提款
  store.rejectWR = function (wrId, reason) {
    const wr = this.wrById(wrId); if (!wr || wr.status !== 'reviewing') return;
    wr.status = 'rejected'; wr.rejectReason = reason; wr.reviewAt = Date.now();
    // CS 退回「已拒绝」状态(保留 wrId 以便明细回溯被拒提款单),可重新申请提款
    this.csByIds(wr.csIds).forEach((c) => { c.status = 'rejected'; c.rejectReason = reason; c.statusAt = Date.now(); });
    this._notify();
  };

  // 财务:进入核算中
  store.startAudit = function (fsId, auditor = 'finance.amy') {
    const fs = this.fsById(fsId); if (!fs || fs.status !== 'pending') return;
    fs.status = 'auditing'; fs.auditor = auditor; fs.auditAt = Date.now(); fs.statusAt = fs.auditAt;
    this._notify();
  };

  // 财务:保存核算扣款项(实时算应付)
  store.updateFSDeduction = function (fsId, patch) {
    const fs = this.fsById(fsId); if (!fs) return;
    Object.assign(fs, patch);
    fs.payable = calcPayable(fs);
    this._notify();
  };

  // 财务:核算完成 → 应付>0 进付款中;应付≤0 全部转结(已转结)
  store.finishAudit = function (fsId) {
    const fs = this.fsById(fsId); if (!fs || fs.status !== 'auditing') return;
    fs.payable = calcPayable(fs);
    if (fs.payable > 0) {
      fs.status = 'paying'; fs.statusAt = Date.now();
    } else {
      fs.carryOut = fs.applyAmount; fs.payable = calcPayable(fs);
      fs.status = 'carried'; fs.statusAt = Date.now();
      // 财务转结:本次不付款,转结至下期财务调整 —— CS 状态 auditCarried
      const wr = this.wrById(fs.wrId);
      if (wr) { this.csByIds(wr.csIds).forEach((c) => { c.status = 'auditCarried'; c.statusAt = Date.now(); }); }
    }
    this._notify();
  };

  // 财务:转结下期(应付正负皆可,m0089/m0090)→ FS 已转结,生成财务转结单(金额=应付,带符号),CS 财务转结
  store.carryFS = function (fsId) {
    const fs = this.fsById(fsId); if (!fs || fs.status !== 'auditing') return;
    fs.payable = calcPayable(fs);
    fs.carryOut = 0; // 新模型:转结额=应付(带符号),不用旧 carryOut
    fs.status = 'carried'; fs.statusAt = Date.now();
    const wr = this.wrById(fs.wrId);
    if (wr) { this.csByIds(wr.csIds).forEach((c) => { c.status = 'auditCarried'; c.statusAt = Date.now(); }); }
    const cf = {
      id: 'CF' + ymd(fs.statusAt) + pad6(++this._seq.cf),
      agentId: fs.agentId, agentName: fs.agentName,
      amount: fs.payable, sourceFsId: fs.id, sourceWrId: fs.wrId,
      status: 'pending', createdAt: fs.statusAt, consumedFsId: null, consumedAt: null,
    };
    fs.carryCfId = cf.id;
    this.cf.push(cf);
    this._notify();
  };

  // 财务:核算驳回 → FS 已驳回,WR 已拒绝,CS 退回待提款
  store.rejectFS = function (fsId, reason) {
    const fs = this.fsById(fsId); if (!fs || (fs.status !== 'pending' && fs.status !== 'auditing')) return;
    fs.status = 'rejected'; fs.rejectReason = reason; fs.statusAt = Date.now();
    const wr = this.wrById(fs.wrId);
    if (wr) {
      wr.status = 'rejected'; wr.rejectReason = '财务核算驳回:' + reason;
      this.csByIds(wr.csIds).forEach((c) => { c.status = 'auditRejected'; c.rejectReason = '财务核算驳回:' + reason; c.statusAt = Date.now(); });
    }
    this._notify();
  };

  // 财务:执行付款 → 成功生成 PO,FS 已付款,WR 已提款,CS 已付款
  store.pay = function (fsId) {
    const fs = this.fsById(fsId); if (!fs || (fs.status !== 'paying' && fs.status !== 'payFailed')) return;
    const wr = this.wrById(fs.wrId);
    const m = METHODS.find((x) => x.method === (wr && wr.method)) || METHODS[0];
    const ts = Date.now();
    const po = {
      id: 'PO' + ymd(ts) + pad6(++this._seq.po),
      fsId: fs.id, wrId: fs.wrId,
      agentId: fs.agentId, agentName: fs.agentName,
      amount: fs.payable, method: wr ? wr.method : m.method, account: wr ? wr.account : m.acct,
      txid: 'TX' + ymd(ts) + pad6(this._seq.po * 13 + 7).slice(-6),
      paidAt: ts, status: 'success',
    };
    fs.poId = po.id; fs.status = 'paid'; fs.statusAt = ts;
    if (wr) { wr.status = 'paid'; this.csByIds(wr.csIds).forEach((c) => { c.status = 'paid'; c.statusAt = ts; }); }
    this.po.unshift(po);
    this._notify();
    return po;
  };

  // 财务:标记付款失败 → FS 付款失败,CS 退回「付款失败·待提款」可重新申请
  store.payFail = function (fsId) {
    const fs = this.fsById(fsId); if (!fs || fs.status !== 'paying') return;
    fs.status = 'payFailed'; fs.statusAt = Date.now();
    const wr = this.wrById(fs.wrId);
    if (wr) { this.csByIds(wr.csIds).forEach((c) => { c.status = 'payFailed'; c.statusAt = Date.now(); }); }
    this._notify();
  };

  window.APS_BILLING = store;

  // ====================== React 订阅 hook ======================
  // 用法:const B = useBilling();  → 任何 store 变更触发重渲染
  window.useBilling = function () {
    const React = window.React;
    if (!store._inited) store.init();
    store.focusAgent(window.CURRENT_AGENT_ID);
    const [, force] = React.useState(0);
    React.useEffect(() => store.subscribe(() => force((n) => n + 1)), []);
    return store;
  };

  // ====================== 状态标签字典 ======================
  window.BILLING_LABELS = {
    cs: {
      withdrawable: { label: '待提款', tone: 'b-brand' },
      carried:      { label: '转结下期', tone: 'b-purple' },
      reviewing:    { label: '审核中', tone: 'b-warning' },
      auditing:     { label: '核算中', tone: 'b-info' },
      auditCarried: { label: '财务转结', tone: 'b-orange' },
      paying:       { label: '付款中', tone: 'b-magenta' },
      payFailed:    { label: '付款失败·待提款', tone: 'b-danger' },
      paid:         { label: '付款成功', tone: 'b-success' },
      rejected:     { label: '已拒绝·待提款', tone: 'b-danger' },
      auditRejected:{ label: '已驳回·待提款', tone: 'b-danger' },
    },
    wr: {
      reviewing: { label: '审核中', tone: 'b-warning' },
      paid:      { label: '已提款', tone: 'b-success' },
      rejected:  { label: '已拒绝', tone: 'b-danger' },
    },
    fs: {
      pending:   { label: '待核算', tone: 'b-warning' },
      rejected:  { label: '已驳回', tone: 'b-danger' },
      auditing:  { label: '核算中', tone: 'b-info' },
      paying:    { label: '付款中', tone: 'b-brand' },
      payFailed: { label: '付款失败', tone: 'b-danger' },
      paid:      { label: '已付款', tone: 'b-success' },
      carried:   { label: '已转结', tone: 'b-neutral' },
    },
    po: {
      success: { label: '付款成功', tone: 'b-success' },
    },
  };
})();
