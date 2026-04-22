import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/* ── Types ─────────────────────────────────────────────────────── */

interface SkillHistoryRow {
  t: number;
  sigma_0: number;
  sigma_1: number;
  sigma_2: number;
  sigma_3: number;
  sigma_4: number;
  sigma_5: number;
  sigma_6: number;
}

/* ── Forecaster metadata ───────────────────────────────────────── */

export const FORECASTER_META = [
  { key: 'sigma_0', name: 'Naive',    colour: '#2E8B8B' },
  { key: 'sigma_1', name: 'EWMA',     colour: '#E85D4A' },
  { key: 'sigma_2', name: 'ARIMA',    colour: '#7C3AED' },
  { key: 'sigma_3', name: 'XGBoost',  colour: '#003E74' },
  { key: 'sigma_4', name: 'MLP',      colour: '#10b981' },
  { key: 'sigma_5', name: 'Theta',    colour: '#f59e0b' },
  { key: 'sigma_6', name: 'Ensemble', colour: '#64748B' },
] as const;

/* ── Pure opacity helpers (exported for testing) ───────────────── */

/**
 * Returns the stroke opacity for line at index `lineIdx`
 * given the currently-selected forecaster index (null = show all).
 */
export function getLineOpacity(selected: number | null, lineIdx: number): number {
  if (selected === null) return 0.6;
  return lineIdx === selected ? 1.0 : 0.15;
}

/**
 * Returns the stroke width for line at index `lineIdx`
 * given the currently-selected forecaster index.
 */
export function getLineStrokeWidth(selected: number | null, lineIdx: number): number {
  if (selected === null) return 2;
  return lineIdx === selected ? 3 : 1.5;
}

/* ── Component ─────────────────────────────────────────────────── */

export default function ContributionsChartSlide() {
  const [skillData, setSkillData] = useState<SkillHistoryRow[] | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  /* Fetch skill_history from comparison.json at mount */
  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/real_data/elia_wind/data/comparison.json`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const history = json?.skill_history;
        if (!Array.isArray(history)) {
          setFetchError(true);
          return;
        }
        /* Pick only the columns we need */
        const rows: SkillHistoryRow[] = history.map((r: Record<string, number>) => ({
          t: r.t,
          sigma_0: r.sigma_0,
          sigma_1: r.sigma_1,
          sigma_2: r.sigma_2,
          sigma_3: r.sigma_3,
          sigma_4: r.sigma_4,
          sigma_5: r.sigma_5,
          sigma_6: r.sigma_6,
        }));
        setSkillData(rows);
      })
      .catch(() => setFetchError(true));
  }, []);

  /* Pill click handler */
  const handlePillClick = (idx: number) => {
    setSelected((prev) => (prev === idx ? null : idx));
  };

  return (
    <SlideShell title="Real Data: Elia Wind + Electricity" slideNumber={13}>
      {/* Pill selector */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 12,
        }}
      >
        {FORECASTER_META.map((meta, idx) => {
          const isSelected = selected === idx;
          return (
            <button
              key={meta.key}
              onClick={() => handlePillClick(idx)}
              style={{
                padding: '4px 14px',
                borderRadius: 999,
                border: `2px solid ${meta.colour}`,
                background: isSelected ? meta.colour : 'transparent',
                color: isSelected ? '#fff' : meta.colour,
                fontWeight: isSelected ? 700 : 500,
                fontSize: TYPOGRAPHY.chartAxis.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                cursor: 'pointer',
                opacity: selected === null || isSelected ? 1 : 0.45,
                transition: 'all 0.15s ease',
              }}
            >
              {meta.name}
            </button>
          );
        })}
      </div>

      {/* Chart area */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {fetchError ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: PALETTE.slate,
              fontSize: TYPOGRAPHY.body.fontSize,
              fontFamily: TYPOGRAPHY.fontFamily,
            }}
          >
            Data unavailable
          </div>
        ) : !skillData ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: PALETTE.slate,
              fontSize: TYPOGRAPHY.body.fontSize,
              fontFamily: TYPOGRAPHY.fontFamily,
            }}
          >
            Loading…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={skillData}
              margin={{ top: 8, right: 24, bottom: 28, left: 24 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} />
              <XAxis
                dataKey="t"
                label={{
                  value: 'Round',
                  position: 'insideBottom',
                  offset: -12,
                  style: { fontSize: TYPOGRAPHY.chartAxis.fontSize, fontFamily: TYPOGRAPHY.fontFamily },
                }}
                tick={{ fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily }}
                stroke={PALETTE.slate}
              />
              <YAxis
                domain={[0, 1]}
                label={{
                  value: 'Learned Skill (σ)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 4,
                  style: { fontSize: TYPOGRAPHY.chartAxis.fontSize, fontFamily: TYPOGRAPHY.fontFamily },
                }}
                tick={{ fontSize: 12, fontFamily: TYPOGRAPHY.fontFamily }}
                stroke={PALETTE.slate}
              />
              <Tooltip
                contentStyle={{
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: 13,
                  borderRadius: 8,
                  border: `1px solid ${PALETTE.border}`,
                }}
              />
              {FORECASTER_META.map((meta, idx) => (
                <Line
                  key={meta.key}
                  type="monotone"
                  dataKey={meta.key}
                  name={meta.name}
                  stroke={meta.colour}
                  strokeOpacity={getLineOpacity(selected, idx)}
                  strokeWidth={getLineStrokeWidth(selected, idx)}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom summary boxes */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <div
          style={{
            flex: 1,
            background: 'rgba(46, 139, 139, 0.06)',
            border: `1.5px solid ${PALETTE.teal}`,
            borderRadius: 10,
            padding: '10px 16px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: PALETTE.teal,
              fontFamily: TYPOGRAPHY.fontFamily,
            }}
          >
            Mechanism learns who is skilled — improves aggregate by ~1/3
          </span>
        </div>
        <div
          style={{
            flex: 1,
            background: 'rgba(232, 93, 74, 0.06)',
            border: `1.5px solid ${PALETTE.coral}`,
            borderRadius: 10,
            padding: '10px 16px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: PALETTE.coral,
              fontFamily: TYPOGRAPHY.fontFamily,
            }}
          >
            Electricity: ~4% gain (forecasters more similar)
          </span>
        </div>
      </div>
    </SlideShell>
  );
}
