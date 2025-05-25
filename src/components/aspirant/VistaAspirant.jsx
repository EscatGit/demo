import React from 'react';
import { UserCheck, Building } from 'lucide-react';
import { useAdjudicacio } from '../../context/AdjudicacioContext';
import PerfilCandidat from './PerfilCandidat';
import SistemaPrioritats from './SistemaPrioritats';
import OfertaAdjudicada from './OfertaAdjudicada';

const VistaAspirant = () => {
  const { 
    candidatActual, 
    candidats, 
    adjudicacions, 
    setVistaActual 
  } = useAdjudicacio();

  const candidat = candidatActual || candidats[0];
  const adjudicacio = adjudicacions.find(a => a.candidatId === candidat?.id);

  if (!candidat) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="text-gray-500">No hi ha candidat seleccionat</p>
          <button
            onClick={() => setVistaActual('admin')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Tornar a administració
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="text-blue-600" />
            Portal de l'Aspirant
          </h2>
          <button
            onClick={() => setVistaActual('admin')}
            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
          >
            <Building size={16} />
            Tornar a administració
          </button>
        </div>

        {/* Perfil del candidat */}
        <PerfilCandidat candidat={candidat} />

        {/* Contingut principal segons l'estat */}
        {!adjudicacio ? (
          <SistemaPrioritats candidat={candidat} />
        ) : (
          <OfertaAdjudicada candidat={candidat} adjudicacio={adjudicacio} />
        )}
      </div>
    </div>
  );
};

export default VistaAspirant;