/* === Shared UI components (window-attached) === */
const { useState, useEffect, useMemo, useRef } = React;

// Icons (inline SVG)
const Icon = ({ name, size = 18 }) => {
  const paths = {
    home: "M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z",
    list: "M8 6h12M8 12h12M8 18h12M3 6h.01M3 12h.01M3 18h.01",
    grid: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
    layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    trend: "M3 17l6-6 4 4 8-8M14 7h7v7",
    shield: "M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z",
    settings: "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.36.16.62.51.82.99",
    search: "M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM21 21l-4.35-4.35",
    download: "M12 3v12m-5-5l5 5 5-5M5 21h14",
    filter: "M3 4h18l-7 9v6l-4 2v-8z",
    chevron: "M9 6l6 6-6 6",
    chevronDown: "M6 9l6 6 6-6",
    bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
    refresh: "M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0 1 14-3M20 14a8 8 0 0 1-14 3",
    arrow: "M5 12h14m-7-7l7 7-7 7",
    arrowDown: "M19 12H5m7 7l-7-7 7-7",
    check: "M5 13l4 4L19 7",
    x: "M6 6l12 12M18 6l-12 12",
    clock: "M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zM12 6v6l4 2",
    user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM4 21a8 8 0 0 1 16 0",
    file: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6",
    flag: "M4 21V4h13l-2 5 2 5H4",
    book: "M4 5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 0-2 2zM4 5v16",
    moon: "M21 13a9 9 0 1 1-9-9 7 7 0 0 0 9 9z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name] || paths.home} />
    </svg>
  );
};

const ElmMark = ({ size = 30 }) => (
  <svg viewBox="0 0 395 325.3" width={size * 1.2} height={size} aria-hidden="true">
    <polygon fill="#22B7E5" points="169.1 260.3 169.1 195 225.6 227.8 225.6 292.8 169.1 260.3" />
    <polygon fill="#7A3DC0" points="169.1 130 225.6 97.5 225.6 162.5 169.1 195 169.1 130" />
    <polygon fill="#7A3DC0" points="282.2 65 225.6 97.5 225.6 32.5 282.2 0 282.2 65" />
    <polygon fill="#C5A4E0" points="56.3 130 112.8 97.5 112.8 162.5 56.3 195 56.3 130" />
    <polygon fill="#C5A4E0" points="112.8 162.5 112.8 97.5 169.1 130 169.1 195 112.8 162.5" />
    <polygon fill="#1A6BD9" points="338.4 162.5 338.4 97.5 395 130 395 195 338.4 162.5" />
    <polygon fill="#FA9A64" points="0 292.8 56.3 260.3 112.8 292.8 56.3 325.3 0 292.8" />
    <polygon fill="#FA9A64" points="112.8 292.8 169.1 260.3 225.6 292.8 169.1 325.3 112.8 292.8" />
    <polygon fill="#F35E2C" points="169.1 195 225.6 162.5 281.9 195 225.6 227.8 169.1 195" />
    <polygon fill="#22B7E5" points="281.9 195 338.4 162.5 395 195 338.4 227.8 281.9 195" />
  </svg>
);

const SeverityPill = ({ sev }) => (
  <span className={`pill sev-${sev}`}>
    <span className="dot" />
    {sev}
  </span>
);

const StatusPill = ({ status }) => {
  const labels = { open: "مفتوح", "in-progress": "قيد المعالجة", resolved: "تم الحل" };
  return <span className={`pill status-${status}`}>{labels[status]}</span>;
};

const SlaPill = ({ s }) => {
  const labels = { "on-track": "ضمن النطاق", "at-risk": "وشيك التجاوز", breached: "متجاوز" };
  return (
    <span className={`pill sla-${s}`}>
      <span className="dot" />
      {labels[s]}
    </span>
  );
};

// Mini sparkline
const Sparkline = ({ data, color = "#F35E2C", filled = true }) => {
  const w = 120, h = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 4) - 2]);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const fillD = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      {filled && <path d={fillD} fill={color} fillOpacity="0.12" />}
      <path d={d} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Bar chart with horizontal bars
const HBars = ({ rows, max, color = "#F35E2C", onRowClick }) => {
  const top = max ?? Math.max(...rows.map((r) => r.value));
  return (
    <div>
      {rows.map((r, i) => (
        <div key={i} className="bar-row" onClick={() => onRowClick && onRowClick(r)} style={{ cursor: onRowClick ? "pointer" : "default" }}>
          <div style={{ fontWeight: 500 }}>{r.label}</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(r.value / top) * 100}%`, background: r.color || color }} />
          </div>
          <div className="num">{r.value}</div>
        </div>
      ))}
    </div>
  );
};

// Horizontal stacked-bar trend chart
const TrendChart = ({ months, height = 240 }) => {
  const w = 720, h = height;
  const padX = 40, padY = 30;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const max = Math.max(...months.map((m) => m.total));
  const stepX = innerW / (months.length - 1);
  const ptOf = (v, i) => [padX + i * stepX, padY + innerH - (v / max) * innerH];
  const totalPts = months.map((m, i) => ptOf(m.total, i));
  const totalD = totalPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const totalFill = `${totalD} L${padX + innerW},${padY + innerH} L${padX},${padY + innerH} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block" }}>
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
        <line key={i} x1={padX} x2={padX + innerW} y1={padY + innerH * p} y2={padY + innerH * p} stroke="#e6e1d6" strokeWidth="1" />
      ))}
      <path d={totalFill} fill="#F35E2C" fillOpacity="0.10" />
      <path d={totalD} stroke="#F35E2C" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {totalPts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill="#F35E2C" />
          <text x={x} y={y - 12} textAnchor="middle" fontSize="12" fill="#0B1838" fontWeight="600">{months[i].total}</text>
          <text x={x} y={h - 8} textAnchor="middle" fontSize="11" fill="#6B7280">{months[i].month.split(" ")[0]}</text>
        </g>
      ))}
    </svg>
  );
};

// Multi-line trend chart for themes
const ThemesTrendChart = ({ months, themes }) => {
  const w = 720, h = 280, padX = 40, padY = 24;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2 - 30;
  const max = Math.max(...months.flatMap((m) => themes.map((t) => m[t.key])));
  const stepX = innerW / (months.length - 1);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
        <line key={i} x1={padX} x2={padX + innerW} y1={padY + innerH * p} y2={padY + innerH * p} stroke="#e6e1d6" strokeWidth="1" />
      ))}
      {themes.map((t) => {
        const pts = months.map((m, i) => [padX + i * stepX, padY + innerH - (m[t.key] / max) * innerH]);
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
        return (
          <g key={t.key}>
            <path d={d} stroke={t.color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={t.color} />)}
          </g>
        );
      })}
      {months.map((m, i) => (
        <text key={i} x={padX + i * stepX} y={h - 8} textAnchor="middle" fontSize="11" fill="#6B7280">
          {m.month.split(" ")[0]}
        </text>
      ))}
    </svg>
  );
};

// Donut
const Donut = ({ segments, size = 180, center }) => {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = size / 2 - 12;
  const cx = size / 2, cy = size / 2;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((s, i) => {
        const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
        acc += s.value;
        const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
        const large = end - start > Math.PI ? 1 : 0;
        const x1 = cx + Math.cos(start) * r;
        const y1 = cy + Math.sin(start) * r;
        const x2 = cx + Math.cos(end) * r;
        const y2 = cy + Math.sin(end) * r;
        const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
        return <path key={i} d={d} fill={s.color} stroke="#fff" strokeWidth="2" />;
      })}
      <circle cx={cx} cy={cy} r={r * 0.62} fill="#fff" />
      {center && (
        <>
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="600" fill="#0B1838">{center.value}</text>
          <text x={cx} y={cy + 16} textAnchor="middle" fontSize="11" fill="#6B7280">{center.label}</text>
        </>
      )}
    </svg>
  );
};

Object.assign(window, { Icon, ElmMark, SeverityPill, StatusPill, SlaPill, Sparkline, HBars, TrendChart, ThemesTrendChart, Donut });
