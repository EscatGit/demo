import React from 'react';
import { Activity, Eye, Users, Clock, CheckCircle } from 'lucide-react';
import { useAdjudicacio } from '../../context/AdjudicacioContext';

const PosicionsTempsReal = ({ onVeurePosicio }) => {
  const { estadistiquesGlobals } = useAdjudicacio();
  
  if (!estadistiquesGlobals || !estadistiquesGlobals.posicionsDetall) {
    return <div className="text-center py-4">Carregant posicions...</div>;
  }

  const posicions = estadistiquesGlobals.posicionsDetall;

  const getPercentatgeDisponible = (posicio) => {
    return posicio.placesInicials > 0 
      ? (posicio.placesLliures / posicio.placesInicials) * 100 
      : 0;
  };

  const getColorBarra = (percentatge) => {
    if (percentatge > 60) return 'bg-green-600';
    if (percentatge > 30) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getEstatPlaces = (posicio) => {
    const estats = [];
    if (posicio.placesLliures > 0) {
      estats.push({
        label: 'Lliures',
        value: posicio.placesLliures,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      });
    }
    if (posicio.placesPendents > 0) {
      estats.push({
        label: 'Pendents',
        value: posicio.placesPendents,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      });
    }
    if (posicio.placesOcupades > 0) {
      estats.push({
        label: 'Ocupades',
        value: posicio.placesOcupades,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      });
    }
    return estats;
  };

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posicions.map(pos => {
          const percentatgeDisponible = getPercentatgeDisponible(pos);
          const estatsPlaces = getEstatPlaces(pos);
          
          return (
            <div key={pos.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{pos.titol}</h4>
                  <p className="text-xs text-gray-600">{pos.departament}</p>
                </div>
                {pos.adjudicacionsPendents > 0 && (
                  <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Clock size={12} />
                    {pos.adjudicacionsPendents}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                {/* Barra de progreso con colores según estado */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="h-full flex">
                    {pos.placesOcupades > 0 && (
                      <div 
                        className="bg-blue-600 transition-all duration-500"
                        style={{ width: `${(pos.placesOcupades / pos.placesInicials) * 100}%` }}
                      />
                    )}
                    {pos.placesPendents > 0 && (
                      <div 
                        className="bg-yellow-500 transition-all duration-500"
                        style={{ width: `${(pos.placesPendents / pos.placesInicials) * 100}%` }}
                      />
                    )}
                    {pos.placesLliures > 0 && (
                      <div 
                        className="bg-green-500 transition-all duration-500"
                        style={{ width: `${(pos.placesLliures / pos.placesInicials) * 100}%` }}
                      />
                    )}
                  </div>
                </div>

                {/* Estado detallado de plazas */}
                <div className="flex gap-2 text-xs">
                  {estatsPlaces.map(estat => (
                    <span key={estat.label} className={`${estat.bgColor} ${estat.color} px-2 py-1 rounded`}>
                      {estat.value} {estat.label}
                    </span>
                  ))}
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Total: {pos.placesInicials}
                  </span>
                </div>
                
                {/* Información adicional */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>
                    <span className="block">Torn:</span>
                    <span className="font-medium text-gray-700">{pos.torn}</span>
                  </div>
                  <div>
                    <span className="block">Contracte:</span>
                    <span className="font-medium text-gray-700">{pos.contracte}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-gray-500">Salari: </span>
                    <span className="font-medium text-green-600">{pos.salari}</span>
                  </div>
                  {pos.candidatsInteressats > 0 && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Users size={12} />
                      <span>{pos.candidatsInteressats} interessats</span>
                    </div>
                  )}
                </div>

                {onVeurePosicio && (
                  <button
                    onClick={() => onVeurePosicio(pos)}
                    className="w-full mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center justify-center gap-1"
                  >
                    <Eye size={14} />
                    Veure detalls
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {posicions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hi ha posicions carregades</p>
        </div>
      )}
    </div>
  );
};

export default PosicionsTempsReal;