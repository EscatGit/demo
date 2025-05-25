import React from 'react';
import { Building } from 'lucide-react';
import { AdjudicacioProvider, useAdjudicacio } from './context/AdjudicacioContext';
import VistaAdmin from './components/admin/VistaAdmin';
import VistaAspirant from './components/aspirant/VistaAspirant';
import Header from './components/shared/Header';

// Componente interno que consume el contexto
const AppContent = () => {
  const { vistaActual, candidatActual, candidats } = useAdjudicacio();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      {vistaActual === 'admin' ? <VistaAdmin /> : <VistaAspirant />}
    </div>
  );
};

// Componente principal que proporciona el contexto
const App = () => {
  return (
    <AdjudicacioProvider>
      <AppContent />
    </AdjudicacioProvider>
  );
};

export default App;