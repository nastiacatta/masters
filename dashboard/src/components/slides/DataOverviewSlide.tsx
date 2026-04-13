import SlideWrapper from './SlideWrapper';

const datasets = [
  {
    name: 'Elia Electricity',
    rounds: '10,000',
    forecasters: 5,
    description: 'Belgian electricity load from Elia TSO',
  },
  {
    name: 'Elia Wind',
    rounds: '17,544',
    forecasters: 5,
    description: 'Belgian wind power generation from Elia TSO',
  },
];

export default function DataOverviewSlide() {
  return (
    <SlideWrapper>
      <h2 className="text-xl font-semibold text-slate-900">Real-World Datasets</h2>
      <p className="mt-2 text-sm text-slate-600">
        Both datasets use the same 5 forecaster models, enabling a direct comparison of
        aggregation methods across different energy domains.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {datasets.map((ds) => (
          <div
            key={ds.name}
            className="rounded-lg border border-slate-200 bg-slate-50 p-5"
          >
            <h3 className="text-lg font-medium text-slate-900">{ds.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{ds.description}</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Rounds
                </dt>
                <dd className="mt-1 text-lg font-semibold text-slate-800">{ds.rounds}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Forecasters
                </dt>
                <dd className="mt-1 text-lg font-semibold text-slate-800">{ds.forecasters}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </SlideWrapper>
  );
}
