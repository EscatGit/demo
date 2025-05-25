import React from 'react';
import { Users, CheckCircle, Building, Award, Clock, UserCheck } from 'lucide-react';
import { useAdjudicacio } from '../../context/AdjudicacioContext';

const EstadistiquesPanel = () => {
  const { estadistiquesGlobals, procesRondes } = useAdjudicacio();

  if (!estadistiquesGlobals) {
    return <div className="text-center py-4">Carregant estadístiques...</div>;
  }

  const {
    candidatsTotals,
    candidatsPendent,
    candidatsRespost,
    candidatsAdjudicat,
    candidatsContractat,
    candidatsRebutjat,
    placesTotals,
    placesOcupades,
    taxaAcceptacio,
    procesActiu
  } = estadistiquesGlobals;

  return (
    <div className="space-y-4">
      {/* Primera fila: Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm">Candidats Totals</p>
              <p className="text-2xl font-bold">{candidatsTotals}</p>
              <p className="text-xs text-gray-600 mt-1">
                {candidatsRespost} han respost | {candidatsPendent} sense preferències
              </p>
            </div>
            <Users className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm">Contractats</p>
              <p className="text-2xl font-bold">{candidatsContractat}</p>
              <p className="text-xs text-gray-600 mt-1">
                {candidatsAdjudicat} a la espera de confirmació
              </p>
            </div>
            <UserCheck className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm">Places Disponibles</p>
              <p className="text-2xl font-bold">
                {placesTotals - placesOcupades}/{placesTotals}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {Math.round((placesOcupades / placesTotals) * 100)}% ocupades
              </p>
            </div>
            <Building className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm">Taxa d'Acceptació</p>
              <p className="text-2xl font-bold">{taxaAcceptacio}%</p>
              <p className="text-xs text-gray-600 mt-1">
                {candidatsRebutjat} places rebutjades
              </p>
            </div>
            <Award className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Segunda fila: Estado del proceso si está activo */}
      {procesRondes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="text-yellow-600 animate-pulse" size={24} />
              <div>
                <p className="font-medium text-yellow-800">
                  Procés d'Adjudicació en Curs
                </p>
                <p className="text-sm text-yellow-700">
                  {estadistiquesGlobals.grupsActius} grups actius de {estadistiquesGlobals.grupsTotals} totals
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-yellow-800">
                {estadistiquesGlobals.adjudicacionsPendents} adjudicacions pendents
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Advertencia si hay candidatos pendientes y no se ha iniciado el proceso */}
      {candidatsPendent > 0 && !procesRondes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-amber-600" size={20} />
            <p className="text-amber-800 text-sm">
              Hi ha {candidatsPendent} candidats que encara no han expressat les seves prioritats.
              Aquests seran marcats com a "desqualificats" quan s'iniciï el procés d'adjudicació.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstadistiquesPanel;