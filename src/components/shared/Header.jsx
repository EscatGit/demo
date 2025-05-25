import React from 'react';
import { Building } from 'lucide-react';
import { useAdjudicacio } from '../../context/AdjudicacioContext';

const Header = () => {
  const { vistaActual, candidatActual, candidats } = useAdjudicacio();

  const getNomCandidat = () => {
    if (candidatActual) return candidatActual.nom;
    if (candidats.length > 0) return candidats[0].nom;
    return '';
  };

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building size={28} />
          Sistema d'Adjudicació de Places - Hospital del Mar
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm bg-blue-700/50 px-3 py-1 rounded-full">
            {vistaActual === 'admin' 
              ? 'Mode Administrador' 
              : `Mode Aspirant - ${getNomCandidat()}`
            }
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;