import { motion } from 'framer-motion';
import MathBlock from '@/components/dashboard/MathBlock';

interface GenerativeModelCardProps {
  presetId: string;
  attributes: Array<{
    name: string;
    symbol: string;
    distribution: string;
    value: number;
    description: string;
  }>;
}

export default function GenerativeModelCard({ presetId, attributes }: GenerativeModelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-slate-200 bg-white p-4"
    >
      <h4 className="text-xs font-semibold text-slate-600 mb-1">
        Generative model
        <span className="ml-1.5 font-mono text-[10px] text-slate-400">{presetId}</span>
      </h4>
      <p className="text-[11px] text-slate-500 mb-3">
        Sample hidden attributes → Generate per-round actions
      </p>

      {/* Attributes table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-400 font-semibold">
              <th className="pb-1 pr-3">Attribute</th>
              <th className="pb-1 pr-3">Symbol</th>
              <th className="pb-1 pr-3">Distribution</th>
              <th className="pb-1 pr-3">Value</th>
              <th className="pb-1">Description</th>
            </tr>
          </thead>
          <tbody>
            {attributes.map((attr) => (
              <tr key={attr.name} className="border-b border-slate-50">
                <td className="py-1 pr-3 font-medium text-slate-700">{attr.name}</td>
                <td className="py-1 pr-3 font-mono text-slate-600">{attr.symbol}</td>
                <td className="py-1 pr-3 font-mono text-slate-500">{attr.distribution}</td>
                <td className="py-1 pr-3 font-mono font-semibold text-slate-800">{attr.value}</td>
                <td className="py-1 text-slate-500">{attr.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CRRA formula */}
      <MathBlock
        latex="u(w) = \\begin{cases} \\frac{w^{1-\\gamma}}{1-\\gamma} & \\gamma \\neq 1 \\\\ \\ln(w) & \\gamma = 1 \\end{cases}"
        label="CRRA utility"
        caption="γ = CRRA risk-aversion parameter from hidden attributes"
        accent
      />
    </motion.div>
  );
}
