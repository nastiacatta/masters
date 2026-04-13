import SlideWrapper from './SlideWrapper';

export default function TitleSlide() {
  return (
    <SlideWrapper className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Skill × Stake</h1>
      <p className="mt-2 text-lg text-slate-600">
        Adaptive Skill Updates for Forecast Aggregation
      </p>
      <p className="mt-6 text-sm text-slate-500">13/08/2025</p>
      <p className="mt-4 text-sm text-slate-700">Anastasia Nastenko</p>
      <p className="text-sm text-slate-500">MSc Thesis · 2025</p>
    </SlideWrapper>
  );
}
