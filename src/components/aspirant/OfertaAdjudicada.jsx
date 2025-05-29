import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAdjudicacio } from '../../context/AdjudicacioContext';
import { formatTemps } from '../../utils/helpers';

const OfertaAdjudicada = ({ candidat, adjudicacio }) => {
  const { posicions, acceptarAdjudicacio, rebutjarAdjudicacio } = useAdjudicacio();
  const [tempsRestant, setTempsRestant] = useState(null);
  
  // Calcular tiempo restante igual que en GrupsConcurrents.jsx
  useEffect(() => {
    if (adjudicacio && adjudicacio.dataLimitAcceptacio && adjudicacio.estat === 'pendent') {
      const interval = setInterval(() => {
        const ara = new Date();
        const limit = new Date(adjudicacio.dataLimitAcceptacio);
        const diferencia = Math.max(0, Math.floor((limit - ara) / 1000));
        setTempsRestant(diferencia);
        
        // Si el tiempo se agota, limpiar el interval
        if (diferencia <= 0) {
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setTempsRestant(null);
    }
  }, [adjudicacio]);
  
  const posicioAdjudicada = posicions.find(p => p.id === adjudicacio.posicioId);

  if (!posicioAdjudicada) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Error: No s'ha trobat la posició adjudicada</p>
      </div>
    );
  }

  // Handlers para aceptar/rechazar
  const handleAcceptarOferta = async () => {
    try {
      await acceptarAdjudicacio(adjudicacio.id);
    } catch (error) {
      console.error('Error acceptant l\'oferta:', error);
    }
  };

  const handleRebutjarOferta = async () => {
    try {
      await rebutjarAdjudicacio(adjudicacio.id);
    } catch (error) {
      console.error('Error rebutjant l\'oferta:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="text-yellow-600" />
          Tens una oferta!
        </h3>
        
        {/* Detalls de la posició */}
        <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold text-xl mb-2">{posicioAdjudicada.titol}</h4>
              <p className="text-gray-600 mb-4">{posicioAdjudicada.departament}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Torn</p>
                  <p className="font-medium">{posicioAdjudicada.torn}</p>
                </div>
                <div>
                  <p className="text-gray-500">Contracte</p>
                  <p className="font-medium">{posicioAdjudicada.contracte}</p>
                </div>
                <div>
                  <p className="text-gray-500">Salari</p>
                  <p className="font-medium text-green-600">{posicioAdjudicada.salari}</p>
                </div>
                <div>
                  <p className="text-gray-500">Inici</p>
                  <p className="font-medium">Immediat</p>
                </div>
              </div>

              {posicioAdjudicada.requisits && posicioAdjudicada.requisits.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-500 text-sm mb-2">Requisits</p>
                  <div className="flex flex-wrap gap-1">
                    {posicioAdjudicada.requisits.map((requisit, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700"
                      >
                        {requisit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Información adicional de la adjudicación */}
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Preferència seleccionada</p>
                    <p className="font-medium text-blue-600">#{adjudicacio.preferencia}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ronda d'adjudicació</p>
                    <p className="font-medium text-blue-600">{adjudicacio.ronda}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center ml-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Adjudicada</p>
            </div>
          </div>
        </div>

        {/* Comptador de temps */}
        {tempsRestant && tempsRestant > 0 && adjudicacio.estat === 'pendent' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 flex items-center gap-2">
              <AlertCircle size={20} />
              <span className="font-medium">
                Temps restant: {formatTemps(tempsRestant)}
              </span>
            </p>
            <p className="text-sm text-red-600 mt-1">
              Després d'aquest temps, l'oferta expirarà automàticament
            </p>
          </div>
        )}

        {/* Accions o estat final */}
        {adjudicacio.estat === 'pendent' ? (
          <div className="flex gap-4">
            <button
              onClick={handleAcceptarOferta}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <CheckCircle size={20} />
              Acceptar Oferta
            </button>
            <button
              onClick={handleRebutjarOferta}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <XCircle size={20} />
              Rebutjar Oferta
            </button>
          </div>
        ) : (
          <div className={`text-center py-6 rounded-lg ${
            adjudicacio.estat === 'acceptat' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {adjudicacio.estat === 'acceptat' ? (
                <CheckCircle size={24} />
              ) : (
                <XCircle size={24} />
              )}
              <p className="font-semibold text-lg">
                {adjudicacio.estat === 'acceptat' 
                  ? 'Oferta acceptada amb signatura digital'
                  : 'Oferta rebutjada'
                }
              </p>
            </div>
            
            {adjudicacio.estat === 'acceptat' && (
              <div className="text-sm mt-2 space-y-1">
                <p>Contracte signat digitalment el {new Date().toLocaleDateString('ca-ES')}</p>
                <p>Rebràs un correu amb els detalls del contracte i les instruccions per incorporar-te.</p>
                <p className="font-medium mt-3">¡Felicitats! Benvingut/da a l'Hospital del Mar</p>
              </div>
            )}
            
            {adjudicacio.estat === 'rebutjat' && (
              <div className="text-sm mt-2 space-y-1">
                <p>Has rebutjat aquesta oferta el {new Date(adjudicacio.dataAdjudicacio).toLocaleDateString('ca-ES')}</p>
                <p>El sistema continuarà processant altres candidats per aquesta plaça.</p>
                <p className="font-medium mt-3">Pots seguir participant en futures rondes d'adjudicació.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfertaAdjudicada;
