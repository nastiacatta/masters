interface ZoomBadgeProps {
  isZoomed: boolean;
  onReset: () => void;
}

export default function ZoomBadge({ isZoomed, onReset }: ZoomBadgeProps) {
  if (!isZoomed) return null;
  return (
    <button
      onClick={onReset}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-medium hover:bg-indigo-200 transition-colors ml-1"
    >
      <span>⟲</span> Reset zoom
    </button>
  );
}
