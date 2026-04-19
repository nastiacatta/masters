import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 8: Architecture — Three-layer SVG diagram:
 * Environment (top), Agents (middle), Platform (bottom).
 * Arrows have 12px gap from box edges.
 */
export default function ArchitectureDiagramSlide() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 860 580"
        style={{ width: '100%', maxWidth: 840, height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="arch-down" markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={PALETTE.slate} />
          </marker>
          <marker id="arch-up" markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={PALETTE.teal} />
          </marker>
        </defs>

        {/* Environment layer */}
        <rect x={30} y={10} width={800} height={150} rx={14} fill={PALETTE.lightBg} stroke={PALETTE.border} strokeWidth={2.5} />
        <text x={55} y={42} fontFamily={TYPOGRAPHY.fontFamily} fontSize="20" fontWeight={700} fill={PALETTE.navy}>
          Environment
        </text>
        <text x={55} y={68} fontFamily={TYPOGRAPHY.fontFamily} fontSize="15" fill={PALETTE.slate}>
          DGPs: Synthetic + Real data (Elia Wind, Electricity)
        </text>
        {['Synthetic\n(Gaussian)', 'Elia Wind\n(48h ahead)', 'Elia Elec.\n(Day-ahead)'].map((dgp, i) => {
          const lines = dgp.split('\n');
          return (
            <g key={dgp}>
              <rect x={100 + i * 230} y={85} width={180} height={56} rx={8} fill={PALETTE.white} stroke={PALETTE.slate} strokeWidth={1.5} />
              <text x={190 + i * 230} y={108} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="14" fontWeight={600} fill={PALETTE.navy}>
                {lines[0]}
              </text>
              {lines[1] && (
                <text x={190 + i * 230} y={128} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="12" fill={PALETTE.slate}>
                  {lines[1]}
                </text>
              )}
            </g>
          );
        })}

        {/* Agents layer */}
        <rect x={30} y={190} width={800} height={150} rx={14} fill="rgba(27, 42, 74, 0.03)" stroke={PALETTE.border} strokeWidth={2.5} />
        <text x={55} y={222} fontFamily={TYPOGRAPHY.fontFamily} fontSize="20" fontWeight={700} fill={PALETTE.navy}>
          Agents
        </text>
        <text x={55} y={248} fontFamily={TYPOGRAPHY.fontFamily} fontSize="15" fill={PALETTE.slate}>
          Honest, Noisy, Adversarial — output (participate, report, deposit)
        </text>
        {[
          { name: 'Honest', detail: 'tau = 0.15-0.5' },
          { name: 'Noisy', detail: 'tau = 0.5-1.0' },
          { name: 'Adversarial', detail: 'strategic' },
        ].map((agent, i) => (
          <g key={agent.name}>
            <rect x={100 + i * 230} y={265} width={180} height={56} rx={8} fill={PALETTE.white} stroke={i === 2 ? PALETTE.coral : PALETTE.navy} strokeWidth={2} />
            <text x={190 + i * 230} y={288} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="15" fontWeight={600} fill={i === 2 ? PALETTE.coral : PALETTE.navy}>
              {agent.name}
            </text>
            <text x={190 + i * 230} y={308} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="12" fill={PALETTE.slate}>
              {agent.detail}
            </text>
          </g>
        ))}

        {/* Platform layer */}
        <rect x={30} y={390} width={800} height={180} rx={14} fill="rgba(46, 139, 139, 0.04)" stroke={PALETTE.border} strokeWidth={2.5} />
        <text x={55} y={422} fontFamily={TYPOGRAPHY.fontFamily} fontSize="20" fontWeight={700} fill={PALETTE.teal}>
          Platform
        </text>
        <text x={55} y={448} fontFamily={TYPOGRAPHY.fontFamily} fontSize="15" fill={PALETTE.slate}>
          Deterministic core mechanism — 20+ invariant tests
        </text>
        {[
          { name: 'Scoring', detail: 'CRPS' },
          { name: 'Aggregation', detail: 'weighted' },
          { name: 'Settlement', detail: 'Pi = m(1+s-s_bar)' },
          { name: 'Skill Update', detail: 'EWMA' },
        ].map((mod, i) => (
          <g key={mod.name}>
            <rect x={60 + i * 195} y={465} width={170} height={56} rx={10} fill={PALETTE.white} stroke={PALETTE.teal} strokeWidth={2.5} />
            <text x={145 + i * 195} y={490} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="15" fontWeight={600} fill={PALETTE.teal}>
              {mod.name}
            </text>
            <text x={145 + i * 195} y={510} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="11" fill={PALETTE.slate}>
              {mod.detail}
            </text>
          </g>
        ))}

        {/* Connecting arrows: Agents -> Platform (down) — 12px gap */}
        <line x1={250} y1={333} x2={250} y2={378} stroke={PALETTE.slate} strokeWidth={3} markerEnd="url(#arch-down)" />
        <line x1={430} y1={333} x2={430} y2={378} stroke={PALETTE.slate} strokeWidth={3} markerEnd="url(#arch-down)" />
        <line x1={610} y1={333} x2={610} y2={378} stroke={PALETTE.slate} strokeWidth={3} markerEnd="url(#arch-down)" />

        {/* Down labels */}
        <text x={265} y={358} fontFamily={TYPOGRAPHY.fontFamily} fontSize="13" fontWeight={600} fill={PALETTE.slate}>participate</text>
        <text x={445} y={358} fontFamily={TYPOGRAPHY.fontFamily} fontSize="13" fontWeight={600} fill={PALETTE.slate}>report</text>
        <text x={625} y={358} fontFamily={TYPOGRAPHY.fontFamily} fontSize="13" fontWeight={600} fill={PALETTE.slate}>deposit</text>

        {/* Platform -> Agents (up) */}
        <line x1={190} y1={390} x2={190} y2={333} stroke={PALETTE.teal} strokeWidth={3} markerEnd="url(#arch-up)" />
        <line x1={370} y1={390} x2={370} y2={333} stroke={PALETTE.teal} strokeWidth={3} markerEnd="url(#arch-up)" />
        <line x1={550} y1={390} x2={550} y2={333} stroke={PALETTE.teal} strokeWidth={3} markerEnd="url(#arch-up)" />

        {/* Up labels */}
        <text x={155} y={358} fontFamily={TYPOGRAPHY.fontFamily} fontSize="13" fontWeight={600} fill={PALETTE.teal} textAnchor="end">wealth</text>
        <text x={335} y={358} fontFamily={TYPOGRAPHY.fontFamily} fontSize="13" fontWeight={600} fill={PALETTE.teal} textAnchor="end">sigma</text>
        <text x={515} y={358} fontFamily={TYPOGRAPHY.fontFamily} fontSize="13" fontWeight={600} fill={PALETTE.teal} textAnchor="end">round</text>

        {/* Environment -> Agents */}
        <line x1={430} y1={160} x2={430} y2={178} stroke={PALETTE.slate} strokeWidth={3} markerEnd="url(#arch-down)" />
      </svg>
    </div>
  );
}
