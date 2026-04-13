import SlideWrapper from './SlideWrapper';

export default function TitleSlide() {
  return (
    <SlideWrapper dark className="items-center justify-center text-center">
      <div className="inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-semibold tracking-wide text-indigo-300 mb-5">
        Master's Thesis Dashboard
      </div>
      <h1 className="text-4xl font-bold text-white tracking-tight">
        Skill × Stake
      </h1>
      <p className="mt-3 text-lg text-slate-400 max-w-xl leading-relaxed">
        Adaptive Skill Updates for Forecast Aggregation
      </p>
      <p className="mt-8 text-sm text-slate-500">13 / 04 / 2026</p>
      <p className="mt-2 text-xs text-slate-600">MSc Thesis · 2026</p>
    </SlideWrapper>
  );
}
