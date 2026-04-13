import { useState } from 'react';
import PasswordGate from '../components/slides/PasswordGate';
import TitleSlide from '../components/slides/TitleSlide';
import DataOverviewSlide from '../components/slides/DataOverviewSlide';
import ForecasterSlide, { FORECASTERS } from '../components/slides/ForecasterSlide';
import ResultsSlide from '../components/slides/ResultsSlide';
import KeyFindingsSlide from '../components/slides/KeyFindingsSlide';

export default function SlidesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <PasswordGate onAuthenticate={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <TitleSlide />
        <DataOverviewSlide />
        {FORECASTERS.map((f) => (
          <ForecasterSlide key={f.name} {...f} />
        ))}
        <ResultsSlide
          title="Elia Electricity — Performance"
          dataPath="data/real_data/elia_electricity/data/comparison.json"
        />
        <ResultsSlide
          title="Elia Wind — Performance"
          dataPath="data/real_data/elia_wind/data/comparison.json"
        />
        <KeyFindingsSlide />
      </div>
    </div>
  );
}
