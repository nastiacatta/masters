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
import { PALETTE, TYPOGRAPHY, FIGURE_FRAME } from './shared/presentationConstants';

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

interface DatasetConfig {
  key: 'wind' | 'electricity';
  label: string;
  rounds: string;
  url: string;
  colour: string;
  improvement: string;
}

/* ── Forecaster metadata ───────────────────────────────────────── */

export const FORECASTER_META = [
  { key: 'sigma_0', name: 'Naive',    colour: '#1B2A4A' },
  { key: 'sigma_1', name: 'EWMA',     colour: '#2E8B8B' },
  { key: 'sigma_2', name: 'ARIMA',    colour: '#E85D4A' },
  { key: 'sigma_3', name: 'XGBoost',  colour: '#7C3AED' },
  { key: 'sigma_4', name: 'MLP',      colour: '#E67E22' },
  { key: 'sigma_5', name: 'Theta',    colour: '#64748B' },
  { key: 'sigma_6', name: 'Ensemble', colour: '#003E74' },
] as const;

const BASE = import.meta.env.BASE_URL;

const DATASETS: DatasetConfig[] = [
  {
    key: 'wind',
    label: 'Elia Wind',
    rounds: '17,544 rounds',
    url: `${BASE}data/real_data/elia_wind/data/comparison.json`,
    colour: PALETTE.teal,
    improvement: '44% CRPS improvement over equal weights',
  },
  {
    key: 'electricity',
    label: 'Elia Electricity',
    rounds: '10,000 rounds',
    url: `${BASE}data/real_data/elia_electricity/data/comparison.json`,
    colour: PALETTE.coral,
    improvement: '8% CRPS improvement (forecasters more similar)',
  },
];

/* ── Pure opacity helpers (exported for testing) ───────────────── */

export function getLineOpacity(selected: number | null, lineIdx: number): number {
  if (selected === null) return 0.6;
  return lineIdx === selected ? 1.0 : 0.15;
}

export function getLineStrokeWidth(selected: number | null, lineIdx: number): number {
  if (selected === null) return 2;
  return lineIdx === selected ? 3 : 1.5;
}

/* ── Helper to extract skill_history rows ──────────────────────── */

function extractSkillHistory(json: Record<string, unknown>): SkillHistoryRow[] | null {
  const history = json?.skill_history;
  if (!Array.isArray(history)) return null;
  return history.map((r: Record<string, number>) => ({
    t: r.t,
    sigma_0: r.sigma_0,
    sigma_1: r.sigma_1,
    sigma_2: r.sigma_2,
    sigma_3: r.sigma_3,
    sigma_4: r.sigma_4,
    sigma_5: r.sigma_5,
    sigma_6: r.sigma_6,
  }));
}

/* ── Component ─────────────────────────────────────────────────── */

export default function ContributionsChartSlide() {
  const [dataByDataset, setDataByDataset] = useState<Record<string, SkillHistoryRow[]>>({});
  const [fetchErrors, setFetchErrors] = useState<Record<string, boolean>>({});
  const [activeDataset, setActiveDataset] = useState<'wind' | 'electricity'>('wind');
  const [selected, setSelected] = useState<number | null>(null);

  /* Fetch both datasets at mount */
  useEffect(() => {
    for (const ds of DATASETS) {
      fetch(ds.url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((json) => {
          const rows = extractSkillHistory(json);
          if (rows) {
            setDataByDataset((prev) => ({ ...prev, [ds.key]: rows }));
          } else {
            setFetchErrors((prev) => ({ ...prev, [ds.key]: true }));
          }
        })
        .catch(() => {
          setFetchErrors((prev) => ({ ...prev, [ds.key]: true }));
        });
    }
  }, []);

  const activeConfig = DATASETS.find((d) => d.key === activeDataset)!;
  const skillData = dataByDataset[activeDataset] ?? null;
  const hasError = fetchErrors[activeDataset] ?? false;

  /* Click handlers with stopPropagation to prevent slide advance */
  const handlePillClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setSelected((prev) => (prev === idx ? null : idx));
  };

  const handleDatasetToggle = (e: React.MouseEvent, key: 'wind' | 'electricity') => {
    e.stopPropagation();
    setActiveDataset(key);
    setSelected(null); // reset forecaster selection on dataset switch
  };

  return (
    <SlideShell title="Real Data: Elia Wind + Electricity" slideNumber={13}>
      {/* Top row: dataset toggle + dataset label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        {/* Dataset toggle */}
        {DATASETS.map((ds) => {
          const isActive = activeDataset === ds.key;
          return (
            <button
              key={ds.key}
              onClick={(e) => handleDatasetToggle(e, ds.key)}
              style={{
                padding: '5px 18px',
                borderRadius: 8,
                border: `2px solid ${ds.colour}`,
                background: isActive ? ds.colour : 'transparent',
                color: isActive ? '#fff' : ds.colour,
                fontWeight: isActive ? 700 : 500,
                fontSize: '1.05rem',
                fontFamily: TYPOGRAPHY.fontFamily,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {ds.label}
            </button>
          );
        })}

        {/* Active dataset info badge */}
        <span
          style={{
            fontSize: '0.95rem',
            color: PALETTE.slate,
            fontFamily: TYPOGRAPHY.fontFamily,
            marginLeft: 8,
          }}
        >
          {activeConfig.rounds} — {activeConfig.improvement}
        </span>
      </div>

      {/* Forecaster pill selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {FORECASTER_META.map((meta, idx) => {
          const isSelected = selected === idx;
          return (
            <button
              key={meta.key}
              onClick={(e) => handlePillClick(e, idx)}
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
      <div style={{ flex: 1, minHeight: 0, ...FIGURE_FRAME }}>
        {hasError ? (
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100%', color: PALETTE.slate,
              fontSize: TYPOGRAPHY.body.fontSize, fontFamily: TYPOGRAPHY.fontFamily,
            }}
          >
            Data unavailable for {activeConfig.label}
          </div>
        ) : !skillData ? (
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100%', color: PALETTE.slate,
              fontSize: TYPOGRAPHY.body.fontSize, fontFamily: TYPOGRAPHY.fontFamily,
            }}
          >
            Loading {activeConfig.label}…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={skillData} margin={{ top: 8, right: 24, bottom: 28, left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} />
              <XAxis
                dataKey="t"
                label={{
                  value: 'Round',
                  position: 'insideBottom',
                  offset: -12,
                  style: { fontSize: TYPOGRAPHY.chartAxis.fontSize, fontFamily: TYPOGRAPHY.fontFamily },
                }}
                tick={{ fontSize: 16, fontFamily: TYPOGRAPHY.fontFamily }}
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
                tick={{ fontSize: 16, fontFamily: TYPOGRAPHY.fontFamily }}
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
            flex: 1, background: 'rgba(46, 139, 139, 0.06)',
            border: `1.5px solid ${PALETTE.teal}`, borderRadius: 10,
            padding: '10px 16px', textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: PALETTE.teal, fontFamily: TYPOGRAPHY.fontFamily }}>
            Wind: 44% CRPS improvement — Naive ranks highest
          </span>
        </div>
        <div
          style={{
            flex: 1, background: 'rgba(232, 93, 74, 0.06)',
            border: `1.5px solid ${PALETTE.coral}`, borderRadius: 10,
            padding: '10px 16px', textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: PALETTE.coral, fontFamily: TYPOGRAPHY.fontFamily }}>
            Electricity: 8% gain (forecasters more similar)
          </span>
        </div>
      </div>
    </SlideShell>
  );
}
