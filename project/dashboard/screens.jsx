/* === Screens === */
const { useState: uS, useMemo: uM, useEffect: uE } = React;

// ===== OVERVIEW =====
function OverviewScreen({ ctx, navigate }) {
  const { data, role } = ctx;
  const visibleIncidents = filterByRole(data.incidents, role);
  const total = visibleIncidents.length;

  const themeRows = data.THEMES.map(([ar, en, _, key]) => {
    const v = visibleIncidents.filter((i) => i.themeId === key).length;
    return { label: ar, value: v, key, color: themeColor(key) };
  }).sort((a, b) => b.value - a.value);

  const serviceRows = data.SERVICES.map(([name, _, id]) => ({
    label: name,
    value: visibleIncidents.filter((i) => i.serviceId === id).length,
    id,
  }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const breached = visibleIncidents.filter((i) => i.slaStatus === "breached").length;
  const atRisk = visibleIncidents.filter((i) => i.slaStatus === "at-risk").length;
  const open = visibleIncidents.filter((i) => i.status !== "resolved").length;
  const resolved = visibleIncidents.filter((i) => i.status === "resolved").length;
  const avgFR = mean(visibleIncidents.map((i) => i.firstResponseHrs));
  const avgRes = mean(visibleIncidents.filter((i) => i.resolutionHrs).map((i) => i.resolutionHrs));

  const trendsScaled = data.MONTHLY_TRENDS.map((m) => ({ ...m, total: role === "manager" ? Math.round(m.total * 0.42) : role === "analyst" ? m.total : m.total }));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>نظرة عامة · حوادث تجربة المستخدم</h1>
          <div className="sub">{data.meta.month} · {scopeLabel(role)} · آخر مزامنة: {data.meta.lastSync}</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="refresh" size={16} />تحديث</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi feature">
          <div className="label">إجمالي الحوادث</div>
          <div className="value">{total}<span className="unit">حادثة</span></div>
          <div className="delta up">▲ ‎+5.9% مقارنة بمارس</div>
          <div className="spark"><Sparkline data={trendsScaled.map((m) => m.total)} color="#F35E2C" /></div>
        </div>
        <div className="kpi">
          <div className="label">حوادث متجاوزة لاتفاقية الخدمة</div>
          <div className="value" style={{color:"var(--red)"}}>{breached}</div>
          <div className="delta up">▲ ‎+12 عن مارس</div>
          <div className="spark"><Sparkline data={[18,22,26,31,29,breached]} color="#dc2626" /></div>
        </div>
        <div className="kpi">
          <div className="label">متوسط زمن الاستجابة الأولى</div>
          <div className="value">{avgFR.toFixed(1)}<span className="unit">ساعة</span></div>
          <div className="delta down">▼ ‎−2.1 ساعة</div>
          <div className="spark"><Sparkline data={[19,18,17.5,16,15.2,avgFR]} color="#1F8A5B" /></div>
        </div>
        <div className="kpi">
          <div className="label">متوسط زمن الحل</div>
          <div className="value">{avgRes.toFixed(0)}<span className="unit">ساعة</span></div>
          <div className="delta flat">— ثابت تقريباً</div>
          <div className="spark"><Sparkline data={[42,44,40,38,39,avgRes]} color="#1A6BD9" /></div>
        </div>
      </div>

      <div className="row-2">
        <div className="panel">
          <div className="panel-head">
            <h2>الاتجاه الشهري · آخر 6 أشهر</h2>
            <div className="meta">إجمالي الحوادث المُبلَّغة شهرياً</div>
          </div>
          <div className="panel-body">
            <TrendChart months={trendsScaled} />
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <h2>توزيع الحالة</h2>
            <div className="meta">{total} حادثة</div>
          </div>
          <div className="panel-body" style={{display:"flex",alignItems:"center",gap:18}}>
            <Donut
              segments={[
                { value: open, color: "#dc2626" },
                { value: visibleIncidents.filter((i) => i.status === "in-progress").length, color: "#1A6BD9" },
                { value: resolved, color: "#1F8A5B" },
              ]}
              size={170}
              center={{ value: `${Math.round((resolved / total) * 100)}٪`, label: "تم الحل" }}
            />
            <div style={{flex:1, fontSize:13}}>
              <LegendRow color="#dc2626" label="مفتوح" v={visibleIncidents.filter((i) => i.status === "open").length} />
              <LegendRow color="#1A6BD9" label="قيد المعالجة" v={visibleIncidents.filter((i) => i.status === "in-progress").length} />
              <LegendRow color="#1F8A5B" label="تم الحل" v={resolved} />
            </div>
          </div>
        </div>
      </div>

      <div className="row-2">
        <div className="panel">
          <div className="panel-head">
            <h2>أكثر الخدمات تأثراً</h2>
            <div className="meta">انقر للتوسع</div>
          </div>
          <div className="panel-body">
            <HBars rows={serviceRows.map((r) => ({ ...r, color: "#0B1838" }))} onRowClick={(r) => navigate(`#/service/${r.id}`)} />
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <h2>المحاور الأكثر تكراراً</h2>
            <div className="meta">9 محاور</div>
          </div>
          <div className="panel-body">
            <HBars rows={themeRows} onRowClick={(r) => navigate(`#/theme/${r.key}`)} />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>الخدمة × المحور · خريطة حرارية</h2>
          <div className="meta">انقر على أي خانة لرؤية الحوادث</div>
        </div>
        <div className="panel-body">
          <Heatmap data={data} incidents={visibleIncidents} navigate={navigate} />
        </div>
      </div>

      <div className="panel" style={{marginTop:16}}>
        <div className="panel-head">
          <h2>أحدث الحوادث</h2>
          <button className="btn" onClick={() => navigate("#/incidents")}>عرض الكل ←</button>
        </div>
        <IncidentTable incidents={visibleIncidents.slice(0, 8)} navigate={navigate} compact />
      </div>
    </div>
  );
}

const LegendRow = ({ color, label, v }) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--line)"}}>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{width:10,height:10,borderRadius:3,background:color,display:"inline-block"}}/>
      {label}
    </div>
    <span style={{fontWeight:600, fontVariantNumeric:"tabular-nums"}}>{v}</span>
  </div>
);

// ===== HEATMAP =====
function Heatmap({ data, incidents, navigate }) {
  const topServices = data.SERVICES.slice(0, 8);
  const themes = data.THEMES;
  const max = 38;
  const cellColor = (v) => {
    if (v === 0) return "#f7f4ee";
    const a = Math.min(0.95, 0.08 + (v / max) * 0.85);
    return `rgba(243, 94, 44, ${a})`;
  };
  return (
    <div style={{overflowX:"auto"}}>
      <table className="heatmap">
        <thead>
          <tr>
            <th></th>
            {themes.map((t) => <th key={t[3]} style={{minWidth:90}}>{t[1]}</th>)}
          </tr>
        </thead>
        <tbody>
          {topServices.map(([name, _, sid]) => (
            <tr key={sid}>
              <th>{name}</th>
              {themes.map((t) => {
                const v = incidents.filter((i) => i.serviceId === sid && i.themeId === t[3]).length;
                const dark = v > max * 0.55;
                return (
                  <td
                    key={t[3]}
                    style={{ background: cellColor(v), color: dark ? "#fff" : "var(--navy)" }}
                    onClick={() => v > 0 && navigate(`#/incidents?service=${sid}&theme=${t[3]}`)}
                  >
                    {v || "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== INCIDENT TABLE =====
function IncidentTable({ incidents, navigate, compact }) {
  return (
    <div className="table-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th style={{width:110}}>الرقم</th>
            <th>العنوان</th>
            <th style={{width:160}}>الخدمة</th>
            {!compact && <th style={{width:160}}>المحور</th>}
            <th style={{width:100}}>الخطورة</th>
            <th style={{width:120}}>الحالة</th>
            <th style={{width:140}}>اتفاقية الخدمة</th>
            {!compact && <th style={{width:120}}>التاريخ</th>}
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc) => (
            <tr key={inc.id} style={{cursor:"default"}}>
              <td><span className="id">{inc.id}</span></td>
              <td style={{maxWidth:380}}>
                <div style={{fontWeight:500}}>{inc.title}</div>
                {!compact && <div style={{fontSize:12,color:"var(--muted)",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{inc.description}</div>}
              </td>
              <td>{inc.service}</td>
              {!compact && <td><span className="pill theme">{inc.themeAr}</span></td>}
              <td><SeverityPill sev={inc.severity} /></td>
              <td><StatusPill status={inc.status} /></td>
              <td><SlaPill s={inc.slaStatus} /></td>
              {!compact && <td style={{color:"var(--muted)",fontSize:12,fontVariantNumeric:"tabular-nums"}}>{formatDate(inc.createdAt)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== INCIDENTS LIST =====
function IncidentsScreen({ ctx, navigate, params }) {
  const { data, role } = ctx;
  const all = filterByRole(data.incidents, role);

  const [filters, setFilters] = uS({
    service: params.service || "all",
    theme: params.theme || "all",
    severity: "all",
    status: "all",
    sla: "all",
    q: "",
  });
  const [sortKey, setSortKey] = uS("createdAt");
  const [sortDir, setSortDir] = uS("desc");

  uE(() => {
    setFilters((f) => ({ ...f, service: params.service || "all", theme: params.theme || "all" }));
  }, [params.service, params.theme]);

  const filtered = uM(() => {
    let r = all;
    if (filters.service !== "all") r = r.filter((i) => i.serviceId === filters.service);
    if (filters.theme !== "all") r = r.filter((i) => i.themeId === filters.theme);
    if (filters.severity !== "all") r = r.filter((i) => i.severity === filters.severity);
    if (filters.status !== "all") r = r.filter((i) => i.status === filters.status);
    if (filters.sla !== "all") r = r.filter((i) => i.slaStatus === filters.sla);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      r = r.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
    }
    r = [...r].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const c = av > bv ? 1 : av < bv ? -1 : 0;
      return sortDir === "asc" ? c : -c;
    });
    return r;
  }, [all, filters, sortKey, sortDir]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>الحوادث</h1>
          <div className="sub">{filtered.length} من أصل {all.length} حادثة · {scopeLabel(role)}</div>
        </div>
        <div className="page-actions">
          <button className="btn primary"><Icon name="filter" size={16} />فلترة متقدمة</button>
        </div>
      </div>

      <div className="filterbar">
        <div className="search" style={{width:280}}>
          <Icon name="search" size={16} />
          <input placeholder="ابحث في العنوان أو الوصف أو الرقم…" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        </div>
        <SelectFilter label="الخدمة" value={filters.service} onChange={(v) => setFilters({ ...filters, service: v })}
          options={[["all", "جميع الخدمات"], ...data.SERVICES.map((s) => [s[2], s[0]])]} />
        <SelectFilter label="المحور" value={filters.theme} onChange={(v) => setFilters({ ...filters, theme: v })}
          options={[["all", "جميع المحاور"], ...data.THEMES.map((t) => [t[3], t[0]])]} />
        <SelectFilter label="الخطورة" value={filters.severity} onChange={(v) => setFilters({ ...filters, severity: v })}
          options={[["all", "جميع المستويات"], ["P1", "P1 — حرج"], ["P2", "P2 — مرتفع"], ["P3", "P3 — متوسط"]]} />
        <SelectFilter label="الحالة" value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })}
          options={[["all", "جميع الحالات"], ["open", "مفتوح"], ["in-progress", "قيد المعالجة"], ["resolved", "تم الحل"]]} />
        <SelectFilter label="اتفاقية الخدمة" value={filters.sla} onChange={(v) => setFilters({ ...filters, sla: v })}
          options={[["all", "كل الحالات"], ["on-track", "ضمن النطاق"], ["at-risk", "وشيك التجاوز"], ["breached", "متجاوز"]]} />
      </div>

      <div className="panel">
        <IncidentTable incidents={filtered.slice(0, 50)} navigate={navigate} />
        {filtered.length > 50 && (
          <div className="empty" style={{borderTop:"1px solid var(--line)"}}>
            عرض 50 من {filtered.length}
          </div>
        )}
        {filtered.length === 0 && <div className="empty">لا توجد حوادث مطابقة للفلاتر المحددة.</div>}
      </div>
    </div>
  );
}

const SelectFilter = ({ label, value, onChange, options }) => (
  <div style={{display:"flex",alignItems:"center",gap:6}}>
    <span className="label-tiny">{label}:</span>
    <select className="select-styled" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  </div>
);

// ===== INCIDENT DETAIL =====
function IncidentDetailScreen({ ctx, navigate, params }) {
  const { data } = ctx;
  const inc = data.incidents.find((i) => i.id === params.id);
  if (!inc) return <div className="page"><div className="empty">حادثة غير موجودة</div></div>;

  return (
    <div className="page">
      <div style={{marginBottom:16}}>
        <button className="btn" onClick={() => history.back()}><Icon name="arrow" size={14} />رجوع</button>
      </div>

      <div className="page-head">
        <div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
            <span className="id" style={{fontFamily:"ui-monospace",fontSize:14,color:"var(--muted)"}}>{inc.id}</span>
            <SeverityPill sev={inc.severity} />
            <StatusPill status={inc.status} />
            <SlaPill s={inc.slaStatus} />
          </div>
          <h1 style={{maxWidth:900}}>{inc.title}</h1>
          <div className="sub">
            <span className="pill theme" style={{marginLeft:8}}>{inc.themeAr}</span>
            في خدمة <strong style={{color:"var(--navy)"}}>{inc.service}</strong>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="flag" size={16} />تصعيد</button>
          <button className="btn primary"><Icon name="check" size={16} />تحديث الحالة</button>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <div className="panel" style={{marginBottom:16}}>
            <div className="panel-head"><h2>الوصف</h2></div>
            <div className="panel-body" style={{lineHeight:1.7,color:"var(--ink-soft)"}}>{inc.description}</div>
          </div>

          <div className="panel" style={{marginBottom:16}}>
            <div className="panel-head"><h2>المسار الزمني</h2></div>
            <div className="panel-body">
              <div className="timeline">
                <div className="tl-item done">
                  <div className="when">{formatDateTime(inc.createdAt)}</div>
                  <div className="what">تم الإبلاغ عن الحادثة</div>
                  <div className="who">بواسطة {inc.reporter}</div>
                </div>
                <div className="tl-item done">
                  <div className="when">{formatDateTime(inc.firstResponseAt)} <span style={{marginRight:6,color:inc.firstResponseHrs>24?"var(--red)":"var(--green)"}}>· بعد {inc.firstResponseHrs} ساعة</span></div>
                  <div className="what">أول استجابة من الفريق</div>
                  <div className="who">{inc.assignee}</div>
                </div>
                {inc.resolvedAt ? (
                  <div className="tl-item done">
                    <div className="when">{formatDateTime(inc.resolvedAt)} <span style={{marginRight:6,color:inc.resolutionHrs>inc.slaResolutionHrs?"var(--red)":"var(--green)"}}>· بعد {inc.resolutionHrs} ساعة</span></div>
                    <div className="what">تم حل الحادثة</div>
                    <div className="who">{inc.assignee}</div>
                  </div>
                ) : (
                  <div className="tl-item now">
                    <div className="when">الآن</div>
                    <div className="what">قيد المعالجة</div>
                    <div className="who">{inc.assignee}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h2>التعليقات والنشاط</h2></div>
            <div className="panel-body">
              <div style={{display:"flex",gap:12,marginBottom:18}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:"var(--purple)",color:"white",display:"grid",placeItems:"center",fontSize:13,fontWeight:600,flexShrink:0}}>ر.م</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500}}>ريم المطيري <span style={{color:"var(--muted)",fontWeight:400,marginRight:8}}>· مدير المنتج · منذ 3 ساعات</span></div>
                  <div style={{fontSize:14,marginTop:6,color:"var(--ink-soft)",lineHeight:1.6}}>تم إعادة إنتاج المشكلة على الجوال (iOS 17). نتجه لمراجعة تدفق OTP في الـ24 ساعة القادمة.</div>
                </div>
              </div>
              <div style={{display:"flex",gap:12,marginBottom:18}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:"var(--blue)",color:"white",display:"grid",placeItems:"center",fontSize:13,fontWeight:600,flexShrink:0}}>خ.ع</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500}}>خالد العنزي <span style={{color:"var(--muted)",fontWeight:400,marginRight:8}}>· مهندس واجهة · منذ ساعة</span></div>
                  <div style={{fontSize:14,marginTop:6,color:"var(--ink-soft)",lineHeight:1.6}}>السبب الجذري المرجّح: انتهاء صلاحية الجلسة قبل وصول الـOTP. جاري إعداد إصلاح.</div>
                </div>
              </div>
              <div style={{borderTop:"1px solid var(--line)",paddingTop:14,display:"flex",gap:10}}>
                <input placeholder="اكتب تعليقاً…" style={{flex:1,border:"1px solid var(--line)",borderRadius:8,padding:"10px 14px",fontFamily:"inherit",fontSize:14}} />
                <button className="btn primary">إرسال</button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="panel" style={{marginBottom:16}}>
            <div className="panel-head"><h2>التفاصيل</h2></div>
            <div className="panel-body">
              <dl className="kv">
                <dt>المُبلِّغ</dt><dd>{inc.reporter}</dd>
                <dt>المُكلَّف</dt><dd>{inc.assignee}</dd>
                <dt>المستخدمون المتأثرون</dt><dd>{inc.usersAffected.toLocaleString("ar-SA")} مستخدم</dd>
                <dt>تاريخ الإنشاء</dt><dd>{formatDateTime(inc.createdAt)}</dd>
                <dt>أول استجابة</dt><dd>{inc.firstResponseHrs} ساعة</dd>
                {inc.resolutionHrs && <><dt>زمن الحل</dt><dd>{inc.resolutionHrs} ساعة</dd></>}
                <dt>اتفاقية الاستجابة</dt><dd>≤ {inc.slaFirstResponseHrs} ساعة</dd>
                <dt>اتفاقية الحل</dt><dd>≤ {inc.slaResolutionHrs} ساعة</dd>
              </dl>
            </div>
          </div>

          <div className="panel" style={{marginBottom:16}}>
            <div className="panel-head"><h2>الروابط</h2></div>
            <div className="panel-body" style={{display:"flex",flexDirection:"column",gap:8}}>
              <a className="chip-soft"><Icon name="file" size={14}/> Jira: ELM-{Math.floor(Math.random()*9000+1000)}</a>
              <a className="chip-soft"><Icon name="file" size={14}/> سجل المراقبة (Datadog)</a>
              <a className="chip-soft"><Icon name="file" size={14}/> screenshot-otp.png</a>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h2>حوادث مشابهة</h2></div>
            <div className="panel-body" style={{padding:0}}>
              {ctx.data.incidents.filter((x) => x.themeId === inc.themeId && x.id !== inc.id).slice(0, 4).map((x) => (
                <a key={x.id} style={{display:"block",padding:"12px 16px",borderBottom:"1px solid var(--line)",cursor:"default",fontSize:13}}>
                  <div style={{fontWeight:500,marginBottom:2}}>{x.title}</div>
                  <div style={{color:"var(--muted)",fontSize:12}}>{x.id} · {x.service}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== SERVICE DETAIL =====
function ServiceScreen({ ctx, navigate, params }) {
  const { data, role } = ctx;
  const svc = data.SERVICES.find((s) => s[2] === params.id);
  if (!svc) return <div className="page"><div className="empty">خدمة غير موجودة</div></div>;
  const incidents = filterByRole(data.incidents, role).filter((i) => i.serviceId === params.id);

  const themeBreakdown = data.THEMES.map((t) => ({
    label: t[0], value: incidents.filter((i) => i.themeId === t[3]).length, key: t[3], color: themeColor(t[3]),
  })).filter((r) => r.value > 0).sort((a,b) => b.value - a.value);

  const sevBreakdown = ["P1", "P2", "P3"].map((s) => ({ label: s, value: incidents.filter((i) => i.severity === s).length }));
  const breached = incidents.filter((i) => i.slaStatus === "breached").length;

  return (
    <div className="page">
      <div style={{marginBottom:16}}>
        <button className="btn" onClick={() => navigate("#/")}><Icon name="arrow" size={14}/>العودة للوحة العامة</button>
      </div>
      <div className="page-head">
        <div>
          <div className="sub" style={{marginBottom:6}}>الخدمة</div>
          <h1>{svc[0]}</h1>
          <div className="sub">{incidents.length} حادثة · المرتبة {data.SERVICES.findIndex((s) => s[2] === params.id) + 1} في عدد الحوادث</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="bell" size={16}/>اشتراك بالتنبيهات</button>
        </div>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        <div className="kpi"><div className="label">إجمالي حوادث أبريل</div><div className="value">{incidents.length}</div></div>
        <div className="kpi"><div className="label">P1 — حرج</div><div className="value" style={{color:"var(--red)"}}>{sevBreakdown[0].value}</div></div>
        <div className="kpi"><div className="label">متجاوزة الاتفاقية</div><div className="value" style={{color:"var(--red)"}}>{breached}</div></div>
        <div className="kpi"><div className="label">معدل الحل</div><div className="value">{Math.round(incidents.filter((i) => i.status === "resolved").length / incidents.length * 100)}<span className="unit">٪</span></div></div>
      </div>

      <div className="row-2">
        <div className="panel">
          <div className="panel-head"><h2>توزيع المحاور لهذه الخدمة</h2></div>
          <div className="panel-body"><HBars rows={themeBreakdown} onRowClick={(r) => navigate(`#/incidents?service=${params.id}&theme=${r.key}`)} /></div>
        </div>
        <div className="panel">
          <div className="panel-head"><h2>توزيع الخطورة</h2></div>
          <div className="panel-body" style={{display:"flex",alignItems:"center",gap:18}}>
            <Donut
              segments={[
                { value: sevBreakdown[0].value, color: "#dc2626" },
                { value: sevBreakdown[1].value, color: "#d97706" },
                { value: sevBreakdown[2].value, color: "#6b7280" },
              ]}
              size={170}
              center={{ value: incidents.length, label: "حادثة" }}
            />
            <div style={{flex:1, fontSize:13}}>
              <LegendRow color="#dc2626" label="P1 — حرج" v={sevBreakdown[0].value} />
              <LegendRow color="#d97706" label="P2 — مرتفع" v={sevBreakdown[1].value} />
              <LegendRow color="#6b7280" label="P3 — متوسط" v={sevBreakdown[2].value} />
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>كل حوادث {svc[0]}</h2>
          <button className="btn" onClick={() => navigate(`#/incidents?service=${params.id}`)}>افتح في قائمة الحوادث ←</button>
        </div>
        <IncidentTable incidents={incidents.slice(0, 20)} navigate={navigate} />
      </div>
    </div>
  );
}

// ===== THEME DETAIL =====
function ThemeScreen({ ctx, navigate, params }) {
  const { data, role } = ctx;
  const t = data.THEMES.find((x) => x[3] === params.id);
  if (!t) return <div className="page"><div className="empty">محور غير موجود</div></div>;
  const incidents = filterByRole(data.incidents, role).filter((i) => i.themeId === params.id);
  const serviceBreakdown = data.SERVICES.map((s) => ({
    label: s[0], value: incidents.filter((i) => i.serviceId === s[2]).length, id: s[2],
  })).filter((r) => r.value > 0).sort((a,b)=>b.value-a.value);

  const trend = data.MONTHLY_TRENDS.map((m) => m[params.id] || 0);

  return (
    <div className="page">
      <div style={{marginBottom:16}}>
        <button className="btn" onClick={() => navigate("#/")}><Icon name="arrow" size={14}/>العودة</button>
      </div>
      <div className="page-head">
        <div>
          <div className="sub" style={{marginBottom:6}}>المحور</div>
          <h1>{t[0]}</h1>
          <div className="sub">{incidents.length} حادثة في أبريل · يمثّل {Math.round(incidents.length / data.meta.total * 100)}٪ من إجمالي الحوادث</div>
        </div>
      </div>

      <div className="row-1-1">
        <div className="panel">
          <div className="panel-head"><h2>الاتجاه عبر الأشهر</h2></div>
          <div className="panel-body">
            <TrendChart months={data.MONTHLY_TRENDS.map((m,i) => ({ month: m.month, total: trend[i] }))} height={200}/>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><h2>الخدمات الأكثر تأثراً بهذا المحور</h2></div>
          <div className="panel-body"><HBars rows={serviceBreakdown.slice(0,8).map((r) => ({...r, color: themeColor(params.id)}))} onRowClick={(r) => navigate(`#/service/${r.id}`)}/></div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h2>كل حوادث المحور</h2></div>
        <IncidentTable incidents={incidents.slice(0,20)} navigate={navigate} />
      </div>
    </div>
  );
}

// ===== TRENDS =====
function TrendsScreen({ ctx }) {
  const { data } = ctx;
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>الاتجاهات عبر الزمن</h1>
          <div className="sub">آخر 6 أشهر · نوفمبر 2025 — أبريل 2026</div>
        </div>
        <div className="page-actions"></div>
      </div>

      <div className="panel" style={{marginBottom:16}}>
        <div className="panel-head"><h2>إجمالي الحوادث الشهرية</h2><div className="meta">+50.5٪ منذ نوفمبر</div></div>
        <div className="panel-body"><TrendChart months={data.MONTHLY_TRENDS} height={300}/></div>
      </div>

      <div className="panel" style={{marginBottom:16}}>
        <div className="panel-head"><h2>تطور المحاور الرئيسية</h2></div>
        <div className="panel-body">
          <ThemesTrendChart
            months={data.MONTHLY_TRENDS}
            themes={[
              { key: "auth", label: "الحساب والمصادقة", color: "#0B1838" },
              { key: "payment", label: "الدفع والفوترة", color: "#7A3DC0" },
              { key: "hidden", label: "عناصر مخفيّة", color: "#1A6BD9" },
              { key: "notifications", label: "إشعارات خاطئة", color: "#22B7E5" },
              { key: "uploads", label: "الرفع والنماذج", color: "#F35E2C" },
            ]}
          />
          <div style={{display:"flex",gap:18,flexWrap:"wrap",marginTop:12,fontSize:13}}>
            {[
              { label: "الحساب والمصادقة", color: "#0B1838" },
              { label: "الدفع والفوترة", color: "#7A3DC0" },
              { label: "عناصر مخفيّة", color: "#1A6BD9" },
              { label: "إشعارات خاطئة", color: "#22B7E5" },
              { label: "الرفع والنماذج", color: "#F35E2C" },
            ].map((l) => (
              <div key={l.label} style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{width:12,height:3,background:l.color,display:"inline-block"}}/>{l.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row-3">
        {[
          {label:"معدل النمو الشهري", v:"+5.9٪", color:"var(--red)"},
          {label:"شهر الذروة", v:"أبريل", color:"var(--navy)"},
          {label:"أسرع نمو لمحور", v:"الحساب والمصادقة", color:"var(--orange)"},
        ].map((s,i) => (
          <div key={i} className="panel">
            <div className="panel-body">
              <div style={{fontSize:13,color:"var(--muted)"}}>{s.label}</div>
              <div style={{fontSize:28,fontWeight:500,marginTop:8,color:s.color}}>{s.v}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== SLA =====
function SlaScreen({ ctx, navigate }) {
  const { data, role } = ctx;
  const incidents = filterByRole(data.incidents, role);
  const onTrack = incidents.filter((i) => i.slaStatus === "on-track").length;
  const atRisk = incidents.filter((i) => i.slaStatus === "at-risk").length;
  const breached = incidents.filter((i) => i.slaStatus === "breached").length;
  const compliance = Math.round((onTrack / incidents.length) * 100);

  // by severity
  const bySev = ["P1","P2","P3"].map((s) => {
    const list = incidents.filter((i) => i.severity === s);
    const br = list.filter((i) => i.slaStatus === "breached").length;
    return { label: s, total: list.length, breached: br, pct: list.length ? Math.round((br/list.length)*100) : 0 };
  });

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>تقرير اتفاقية مستوى الخدمة (SLA)</h1>
          <div className="sub">أبريل 2026 · يستند إلى: استجابة أولى ≤ 24 ساعة · حل P1 ≤ 4س، P2 ≤ 24س، P3 ≤ 5 أيام</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="settings" size={16}/>تعديل عتبات الاتفاقية</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi feature">
          <div className="label">معدل الالتزام بالاتفاقية</div>
          <div className="value">{compliance}<span className="unit">٪</span></div>
          <div className="delta down">▼ ‎−4 نقاط مقارنة بمارس</div>
        </div>
        <div className="kpi"><div className="label">ضمن النطاق</div><div className="value" style={{color:"var(--green)"}}>{onTrack}</div></div>
        <div className="kpi"><div className="label">وشيك التجاوز</div><div className="value" style={{color:"var(--amber)"}}>{atRisk}</div></div>
        <div className="kpi"><div className="label">متجاوز</div><div className="value" style={{color:"var(--red)"}}>{breached}</div></div>
      </div>

      <div className="panel" style={{marginBottom:16}}>
        <div className="panel-head"><h2>الالتزام حسب مستوى الخطورة</h2></div>
        <div className="panel-body">
          <table className="tbl">
            <thead>
              <tr>
                <th>الخطورة</th>
                <th>عدد الحوادث</th>
                <th>متجاوزة</th>
                <th>نسبة التجاوز</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {bySev.map((s) => (
                <tr key={s.label}>
                  <td><SeverityPill sev={s.label}/></td>
                  <td>{s.total}</td>
                  <td>{s.breached}</td>
                  <td style={{fontWeight:500,color:s.pct>20?"var(--red)":"var(--navy)"}}>{s.pct}٪</td>
                  <td>
                    <div style={{background:"var(--paper)",borderRadius:6,height:10,width:200,overflow:"hidden"}}>
                      <div style={{width:`${100-s.pct}%`,height:"100%",background:"var(--green)"}}/>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>الحوادث المتجاوزة لاتفاقية الخدمة</h2>
          <div className="meta">{breached} حادثة بحاجة إلى تدخّل</div>
        </div>
        <IncidentTable incidents={incidents.filter((i) => i.slaStatus === "breached").slice(0, 30)} navigate={navigate} />
      </div>
    </div>
  );
}

// ===== Helpers =====
function filterByRole(list, role) {
  if (role === "manager") {
    // Senior manager: only "auth-team" services for the demo
    const team = window.DASHBOARD_DATA.TEAMS[0];
    return list.filter((i) => team.services.includes(i.serviceId));
  }
  return list;
}
function scopeLabel(role) {
  if (role === "manager") return "نطاق فريق الحساب والهوية";
  if (role === "analyst") return "كل الخدمات · للقراءة فقط";
  return "كل الخدمات";
}
function mean(arr) { if (!arr.length) return 0; return arr.reduce((s,x)=>s+x,0)/arr.length; }
function themeColor(key) {
  return { auth:"#0B1838", payment:"#7A3DC0", hidden:"#1A6BD9", notifications:"#22B7E5", uploads:"#F35E2C", roles:"#FA9A64", editing:"#6B7280", language:"#C5A4E0", privacy:"#dc2626" }[key] || "#0B1838";
}
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-SA-u-ca-gregory", { day:"2-digit", month:"2-digit", year:"numeric" });
}
function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ar-SA-u-ca-gregory", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
}

Object.assign(window, { OverviewScreen, IncidentsScreen, IncidentDetailScreen, ServiceScreen, ThemeScreen, TrendsScreen, SlaScreen });
