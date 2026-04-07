import { motion } from 'framer-motion';

interface FamilyCardProps {
  family: string;
  description: string;
  items: Array<{ name: string; status: 'experiment' | 'taxonomy-only' | 'not-covered' }>;
  color: string;
  onClick?: () => void;
}

const STATUS_DOT: Record<string, string> = {
  experiment: 'bg-emerald-400',
  'taxonomy-only': 'bg-amber-400',
  'not-covered': 'bg-slate-300',
};

export default function FamilyCard({ family, description, items, color, onClick }: FamilyCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`rounded-xl border p-4 text-left transition-shadow hover:shadow-md ${color}`}
    >
      <h4 className="text-sm font-semibold capitalize">{family}</h4>
      <p className="text-[11px] leading-snug opacity-70 mt-0.5">{description}</p>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {items.map((item) => (
          <span
            key={item.name}
            className="inline-flex items-center gap-1 rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-medium"
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[item.status]}`} />
            {item.name}
          </span>
        ))}
      </div>
    </motion.button>
  );
}
