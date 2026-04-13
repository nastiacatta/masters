import { useState } from 'react';
import PasswordGate from '../components/slides/PasswordGate';
import TitleSlide from '../components/slides/TitleSlide';
import DataOverviewSlide from '../components/slides/DataOverviewSlide';
import ForecasterSlide, { FORECASTERS } from '../components/slides/ForecasterSlide';
import ResultsSlide from '../components/slides/ResultsSlide';
import DgpSummarySlide from '../components/slides/comparison/DgpSummarySlide';
import MechanismImprovementSlide from '../components/slides/comparison/MechanismImprovementSlide';
import BestSingleAnomalySlide from '../components/slides/comparison/BestSingleAnomalySlide';
import TheoryValidationSlide from '../components/slides/comparison/TheoryValidationSlide';
import WindExtendedSlide from '../components/slides/comparison/WindExtendedSlide';
import KeyFindingsSlide from '../components/slides/KeyFindingsSlide';

export default function SlidesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <PasswordGate onAuthenticate={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="h-full snap-y snap-mandatory overflow-y-auto scroll-smooth">
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
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
        <DgpSummarySlide />
        <MechanismImprovementSlide />
        <BestSingleAnomalySlide />
        <TheoryValidationSlide />
        <WindExtendedSlide />
        <KeyFindingsSlide />
      </div>
    </div>
  );
}
