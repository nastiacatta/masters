import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 8: Architecture — Three-layer SVG diagram:
 * Environment (DGPs) → Agents (policies) → Platform (core mechanism)
 *
 * Layout (viewBox 900x600, proper vertical gaps):
 * - Environment layer: y=10, height=130, sub-boxes bottom = 116
 * - Gap: arrows from y=155 (116+15+marker) to y=195 (200-5)
 * - Agents layer: y=200, height=130, sub-boxes bottom = 306
 * - Gap: arrows from y=345 (306+15+marker) to y=385 (400-15)
 * - Platform layer: y=400, height=140
 * - All arrows have 15px gap from box edges
 * - refX=12 for arrowhead markers
 */
export default function ArchitectureDiagramSlide() {
  const envY = 10;
  const envH = 130;
  const agentY = 200;
  const agentH = 130;
  const platY = 400;
  const platH = 140;

  const subBoxH = 56;
  const envSubY = 60;
  const agentSubY = 250;
  const platSubY = 450;

  const GAP = 15;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 900 600"
        style={{ width: '100%', maxWidth: 860, height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="arch-down" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto-start-reverse">
            <polygon points="0 0, 12 4, 0 8" fill={PALETTE.slate} />
          </marker>
          <marker id="arch-down-v" markerWidth="12" markerHeight="8" refX="6" refY="8" orient="0">
            <polygon points="0 0, 12 0, 6 8" fill={PALETTE.slate} />
          </marker>
        </defs>

        {/* Environment layer */}
        <rect x={30} y={envY} width={840} height={envH} rx={12} fill={PALETTE.lightBg} stroke={PALETTE.border} strokeWidth={1.5} />
        <text x={450} y={envY + 30} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="20" fontWeight={700} fill={PALETTE.navy}>
          Environment (DGPs)
        </text>
        {['Synthetic', 'Elia Wind', 'Elia Electricity'].map((dgp, i) => (
          <g key={dgp}>
            <rect x={100 + i * 250} y={envSubY} width={190} height={subBoxH} rx={12} fill={PALETTE.white} stroke={PALETTE.border} strokeWidth={1.5} />
            <text x={195 + i * 250} y={envSubY + 33} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="15" fontWeight={600} fill={PALETTE.navy}>
              {dgp}
            </text>
          </g>
        ))}

        {/* Arrow: Environment → Agents (15px below env bottom, 15px above agent top) */}
        <line x1={450} y1={envY + envH + GAP} x2={450} y2={agentY - GAP} stroke={PALETTE.slate} strokeWidth={3} markerEnd="url(#arch-down-v)" />

        {/* Agents layer */}
        <rect x={30} y={agentY} width={840} height={agentH} rx={12} fill="rgba(27, 42, 74, 0.03)" stroke={PALETTE.border} strokeWidth={1.5} />
        <text x={450} y={agentY + 30} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="20" fontWeight={700} fill={PALETTE.navy}>
          Agents (policies)
        </text>
        {['Honest', 'Noisy', 'Adversarial'].map((agent, i) => (
          <g key={agent}>
            <rect x={100 + i * 250} y={agentSubY} width={190} height={subBoxH} rx={12} fill={PALETTE.white} stroke={i === 2 ? PALETTE.coral : PALETTE.navy} strokeWidth={i === 2 ? 2.5 : 1.5} />
            <text x={195 + i * 250} y={agentSubY + 33} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="15" fontWeight={600} fill={i === 2 ? PALETTE.coral : PALETTE.navy}>
              {agent}
            </text>
          </g>
        ))}

        {/* Arrows: Agents → Platform (from sub-box bottom + GAP to platform top - GAP) */}
        {[195, 450, 700].map((xPos, i) => {
          const labels = ['participate', 'report', 'deposit'];
          const arrowY1 = agentSubY + subBoxH + GAP;
          const arrowY2 = platY - GAP;
          const midY = (arrowY1 + arrowY2) / 2;
          return (
            <g key={i}>
              <line x1={xPos} y1={arrowY1} x2={xPos} y2={arrowY2} stroke={PALETTE.slate} strokeWidth={3} markerEnd="url(#arch-down-v)" />
              <text x={xPos} y={midY + 4} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="12" fontWeight={600} fill={PALETTE.slate}>
                {labels[i]}
              </text>
            </g>
          );
        })}

        {/* Platform layer */}
        <rect x={30} y={platY} width={840} height={platH} rx={12} fill="rgba(46, 139, 139, 0.04)" stroke={PALETTE.border} strokeWidth={1.5} />
        <text x={450} y={platY + 30} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="20" fontWeight={700} fill={PALETTE.teal}>
          Platform (core mechanism)
        </text>
        {['Scoring', 'Aggregation', 'Settlement', 'Skill Update'].map((mod, i) => (
          <g key={mod}>
            <rect x={60 + i * 205} y={platSubY} width={180} height={subBoxH} rx={12} fill={PALETTE.white} stroke={PALETTE.teal} strokeWidth={1.5} />
            <text x={150 + i * 205} y={platSubY + 33} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="15" fontWeight={600} fill={PALETTE.teal}>
              {mod}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
