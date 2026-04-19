import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 8: Architecture — Three-layer SVG diagram (simplified):
 * Environment (DGPs) → Agents (policies) → Platform (core mechanism)
 * Sub-boxes: just names, no formulas. Arrows with 20px gaps, refX=9.
 */
export default function ArchitectureDiagramSlide() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 860 560"
        style={{ width: '100%', maxWidth: 840, height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="arch-down" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={PALETTE.slate} />
          </marker>
          <marker id="arch-up" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={PALETTE.teal} />
          </marker>
        </defs>

        {/* Environment layer */}
        <rect x={30} y={10} width={800} height={130} rx={12} fill={PALETTE.lightBg} stroke={PALETTE.border} strokeWidth={1.5} />
        <text x={430} y={40} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="20" fontWeight={700} fill={PALETTE.navy}>
          Environment (DGPs)
        </text>
        {['Synthetic', 'Elia Wind', 'Elia Electricity'].map((dgp, i) => (
          <g key={dgp}>
            <rect x={100 + i * 240} y={60} width={180} height={56} rx={12} fill={PALETTE.white} stroke={PALETTE.border} strokeWidth={1.5} />
            <text x={190 + i * 240} y={94} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="15" fontWeight={600} fill={PALETTE.navy}>
              {dgp}
            </text>
          </g>
        ))}

        {/* Arrow: Environment → Agents (15px gap) */}
        <line x1={430} y1={155} x2={430} y2={185} stroke={PALETTE.slate} strokeWidth={3} markerEnd="url(#arch-down)" />

        {/* Agents layer */}
        <rect x={30} y={200} width={800} height={130} rx={12} fill="rgba(27, 42, 74, 0.03)" stroke={PALETTE.border} strokeWidth={1.5} />
        <text x={430} y={230} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="20" fontWeight={700} fill={PALETTE.navy}>
          Agents (policies)
        </text>
        {['Honest', 'Noisy', 'Adversarial'].map((agent, i) => (
          <g key={agent}>
            <rect x={100 + i * 240} y={250} width={180} height={56} rx={12} fill={PALETTE.white} stroke={i === 2 ? PALETTE.coral : PALETTE.navy} strokeWidth={i === 2 ? 2.5 : 1.5} />
            <text x={190 + i * 240} y={284} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="15" fontWeight={600} fill={i === 2 ? PALETTE.coral : PALETTE.navy}>
              {agent}
            </text>
          </g>
        ))}

        {/* Arrows: Agents → Platform (15px gap) */}
        <line x1={310} y1={345} x2={310} y2={385} stroke={PALETTE.slate} strokeWidth={3} markerEnd="url(#arch-down)" />
        <line x1={430} y1={345} x2={430} y2={385} stroke={PALETTE.slate} strokeWidth={3} markerEnd="url(#arch-down)" />
        <line x1={550} y1={345} x2={550} y2={385} stroke={PALETTE.slate} strokeWidth={3} markerEnd="url(#arch-down)" />

        {/* Arrow labels */}
        <text x={310} y={362} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="12" fontWeight={600} fill={PALETTE.slate}>participate</text>
        <text x={430} y={362} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="12" fontWeight={600} fill={PALETTE.slate}>report</text>
        <text x={550} y={362} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="12" fontWeight={600} fill={PALETTE.slate}>deposit</text>

        {/* Platform layer */}
        <rect x={30} y={400} width={800} height={140} rx={12} fill="rgba(46, 139, 139, 0.04)" stroke={PALETTE.border} strokeWidth={1.5} />
        <text x={430} y={430} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="20" fontWeight={700} fill={PALETTE.teal}>
          Platform (core mechanism)
        </text>
        {['Scoring', 'Aggregation', 'Settlement', 'Skill Update'].map((mod, i) => (
          <g key={mod}>
            <rect x={60 + i * 195} y={450} width={170} height={56} rx={12} fill={PALETTE.white} stroke={PALETTE.teal} strokeWidth={1.5} />
            <text x={145 + i * 195} y={484} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="15" fontWeight={600} fill={PALETTE.teal}>
              {mod}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
