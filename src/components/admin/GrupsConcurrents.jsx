import React, { useState } from 'react';
import { Users, TrendingUp, Award, Clock, CheckCircle, XCircle, AlertCircle, Settings, X, Play, RefreshCw } from 'lucide-react';
import { useAdjudicacio } from '../../context/AdjudicacioContext';
import { formatTemps } from '../../utils/helpers';

const GrupsConcurrents = () => {
  const { 
    estadistiquesGlobals, 
    estatRondes, 
    procesRondes, 
    iniciarAdjudicacio, 
    acceptarAdjudicacio, 
    rebutjarAdjudicacio, 
    obtenirEstadistiques, 
    candidats, 
    posicions, 
    procesEnMarxa 
  } = useAdjudicacio();
  
  const [modalObert, setModalObert] = useState(null);

  if (!estadistiquesGlobals) {
    return <div className="text-center py-4">Carregant grups...</div>;
  }

  // Usar datos directamente del sistema de rondas
  const grupsConcurrents = estatRondes?.grupsConcurrents || {};
  const categoriesDisponibles = Object.keys(grupsConcurrents);

  // Si no hay proceso activo, obtener categorías de candidatos
  const categoriesFromCandidats = procesRondes 
    ? [] 
    : [...new Set(candidats.map(c => c.categoria))];
  
  const totesCategoriesList = categoriesDisponibles.length > 0 
    ? categoriesDisponibles 
    : categoriesFromCandidats;

  const getEstatIcon = (estat) => {
    switch (estat) {
      case 'processant': return <Clock className="animate-spin" size={16} />;
      case 'esperant_confirmacions': return <AlertCircle className="animate-pulse" size={16} />;
      case 'finalitzada': return <CheckCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getEstatColor = (estat) => {
    switch (estat) {
      case 'processant': return 'text-blue-600 bg-blue-100';
      case 'esperant_confirmacions': return 'text-yellow-600 bg-yellow-100';
      case 'finalitzada': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleGestionarGrup = (categoria) => {
    setModalObert(categoria);
  };

  const tancarModal = () => {
    setModalObert(null);
  };

  // Función para obtener datos de categoria usando la lógica del sistema de rondas
  const obtenirDadesCategoria = (categoria) => {
    if (procesRondes) {
      // Si hay proceso activo, usar datos del sistema de rondas
      const grup = grupsConcurrents[categoria];
      const candidatsGrup = candidats.filter(c => c.categoria === categoria);
      const posicionsCategoria = estadistiquesGlobals.posicionsDetall.filter(p => p.categoria === categoria);
      
      return {
        grup,
        candidatsGrup,
        posicionsCategoria,
        candidatsRespost: candidatsGrup.filter(c => ['respost', 'adjudicat'].includes(c.estat)).length,
        candidatsPendent: candidatsGrup.filter(c => ['pendent', 'desqualificat'].includes(c.estat)).length,
        candidatsAdjudicat: candidatsGrup.filter(c => c.estat === 'adjudicat').length,
        candidatsContractat: candidatsGrup.filter(c => c.estat === 'contractat').length,
        candidatsRebutjat: candidatsGrup.filter(c => c.estat === 'rebutjat').length,
        placesTotals: posicionsCategoria.reduce((acc, p) => acc + p.placesInicials, 0),
        placesLliures: posicionsCategoria.reduce((acc, p) => acc + p.placesLliures, 0),
        placesPendents: posicionsCategoria.reduce((acc, p) => acc + p.placesPendents, 0),
        placesOcupades: posicionsCategoria.reduce((acc, p) => acc + p.placesOcupades, 0)
      };
    } else {
      // Si no hay proceso activo, calcular datos básicos
      const candidatsGrup = candidats.filter(c => c.categoria === categoria);
      const posicionsCategoria = posicions.filter(p => p.categoria === categoria);
      
      return {
        grup: null,
        candidatsGrup,
        posicionsCategoria,
        candidatsRespost: candidatsGrup.filter(c => ['respost', 'adjudicat'].includes(c.estat)).length,
        candidatsPendent: candidatsGrup.filter(c => c.estat === 'pendent').length,
        candidatsAdjudicat: candidatsGrup.filter(c => c.estat === 'adjudicat').length,
        candidatsContractat: candidatsGrup.filter(c => c.estat === 'contractat').length,
        candidatsRebutjat: candidatsGrup.filter(c => c.estat === 'rebutjat').length,
        placesTotals: posicionsCategoria.reduce((acc, p) => acc + p.placesInicials, 0),
        placesLliures: posicionsCategoria.reduce((acc, p) => acc + p.placesDisponibles, 0),
        placesPendents: 0,
        placesOcupades: posicionsCategoria.reduce((acc, p) => acc + (p.placesInicials - p.placesDisponibles), 0)
      };
    }
  };

  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-600" />
          Grups Concurrents per Categoria
          {procesRondes && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              (Procés en curs)
            </span>
          )}
        </h3>
        
        <div className="grid gap-4">
          {totesCategoriesList.map(categoria => {
            const {
              grup,
              candidatsGrup,
              posicionsCategoria,
              candidatsRespost,
              candidatsPendent,
              candidatsAdjudicat,
              candidatsContractat,
              candidatsRebutjat,
              placesTotals,
              placesLliures,
              placesPendents,
              placesOcupades
            } = obtenirDadesCategoria(categoria);

            // Ordenar candidatos por puntuación
            const topCandidatsRespost = candidatsGrup
              .filter(c => ['respost', 'adjudicat'].includes(c.estat))
              .sort((a, b) => b.puntuacio - a.puntuacio)
              .slice(0, 5);

            return (
              <div key={categoria} className="bg-white border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Users className="text-blue-500" size={20} />
                    {categoria}
                  </h4>
                  <div className="flex items-center gap-2">
                    {/* Estado del grupo si el proceso está activo */}
                    {grup && (
                      <div className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${getEstatColor(grup.estatRonda)}`}>
                        {getEstatIcon(grup.estatRonda)}
                        <span>Ronda {grup.rondaActual}</span>
                      </div>
                    )}
                    
                    <span className="bg-blue-100 px-2 py-1 rounded text-sm">
                      {candidatsGrup.length} candidats
                    </span>
                    <span className="bg-green-100 px-2 py-1 rounded text-sm">
                      {placesLliures}/{placesTotals} places lliures
                    </span>

                    {/* Botón para gestionar grupo */}
                    <button
                      onClick={() => handleGestionarGrup(categoria)}
                      disabled={candidatsRespost === 0}
                      className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${
                        candidatsRespost === 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      title={candidatsRespost === 0 ? 'No hi ha candidats preparats per aquest grup' : 'Gestionar aquest grup'}
                    >
                      <Settings size={14} />
                      Gestionar
                    </button>
                  </div>
                </div>

                {/* Advertencia si no hay candidatos que hayan respondido */}
                {candidatsRespost === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="text-yellow-600" size={16} />
                      <p className="text-yellow-800 text-sm">
                        No hi ha aspirants actius en aquest grup.
                      </p>
                    </div>
                  </div>
                )}

                {/* Estadísticas de estados de candidatos */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3 text-xs">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="font-bold text-gray-700">{candidatsRespost}</p>
                    <p className="text-gray-500">Candidats actius </p>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded text-center">
                    <p className="font-bold text-yellow-700">{candidatsAdjudicat}</p>
                    <p className="text-gray-500">Adjudicacions pendents de confirmació</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <p className="font-bold text-blue-700">{candidatsPendent}</p>
                    <p className="text-gray-500">Aspirants sense preferències (desqualificat)</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded text-center">
                    <p className="font-bold text-green-700">{candidatsContractat}</p>
                    <p className="text-gray-500">Aspirants contractats</p>
                  </div>
                  <div className="bg-red-50 p-2 rounded text-center">
                    <p className="font-bold text-red-700">{candidatsRebutjat}</p>
                    <p className="text-gray-500">Places rebutjades</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Candidatos */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Top candidats actius (ordenats per puntuació)
                    </h5>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {topCandidatsRespost.map((candidat, index) => (
                        <div key={candidat.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <span className="flex items-center gap-2">
                            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                              {index + 1}
                            </span>
                            <span className="truncate">{candidat.nom}</span>
                            {candidat.estat === 'adjudicat' && (
                              <Clock className="text-yellow-500" size={14} />
                            )}
                          </span>
                          <span className="font-bold text-blue-600">{candidat.puntuacio}</span>
                        </div>
                      ))}
                      {candidatsRespost > 5 && (
                        <p className="text-xs text-gray-500 text-center py-1">
                          ... i {candidatsRespost - 5} més
                        </p>
                      )}
                      {candidatsRespost === 0 && (
                        <p className="text-xs text-gray-400 text-center py-2">
                          No hi ha candidats que hagin respost
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Posiciones */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Estat de les places
                    </h5>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {posicionsCategoria.map(posicio => (
                        <div key={posicio.id} className="text-sm bg-gray-50 p-2 rounded">
                          <div className="flex justify-between items-center mb-1">
                            <span className="truncate font-medium">{posicio.titol}</span>
                          </div>
                          <div className="flex gap-1">
                            {posicio.placesLliures > 0 && (
                              <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs">
                                {posicio.placesLliures} lliures
                              </span>
                            )}
                            {posicio.placesPendents > 0 && (
                              <span className="bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded text-xs">
                                {posicio.placesPendents} pendents
                              </span>
                            )}
                            {posicio.placesOcupades > 0 && (
                              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
                                {posicio.placesOcupades} ocupades
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {posicionsCategoria.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-2">
                          No hi ha places per aquesta categoria
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Estadísticas de competitividad y estados de plazas */}
                <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-4">
                  <div className="text-xs text-gray-600">
                    <span>Ràtio competitivitat:</span>
                    <span className={`font-medium ml-1 ${
                      candidatsRespost > placesTotals 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {placesTotals > 0 ? (candidatsRespost / placesTotals).toFixed(1) : '∞'} candidats/plaça
                    </span>
                  </div>
                  <div className="text-xs text-right">
                    <span className="text-gray-600">Places: </span>
                    <span className="font-medium">
                      {placesOcupades} ocupades, {placesPendents} pendents, {placesLliures} lliures
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totesCategoriesList.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No hi ha grups de candidats per mostrar</p>
          </div>
        )}
      </div>

      {/* Modal de gestión por grupo */}
      {modalObert && (
        <ModalGestioGrup 
          categoria={modalObert}
          onTancar={tancarModal}
          candidats={candidats}
          posicions={posicions}
          iniciarAdjudicacio={iniciarAdjudicacio}
          acceptarAdjudicacio={acceptarAdjudicacio}
          rebutjarAdjudicacio={rebutjarAdjudicacio}
          obtenirEstadistiques={obtenirEstadistiques}
          estatRondes={estatRondes}
          procesRondes={procesRondes}
          procesEnMarxa={procesEnMarxa}
        />
      )}
    </>
  );
};

// Component Modal para gestionar un grupo específico
const ModalGestioGrup = ({ 
  categoria, 
  onTancar, 
  candidats, 
  posicions, 
  iniciarAdjudicacio, 
  acceptarAdjudicacio, 
  rebutjarAdjudicacio, 
  obtenirEstadistiques,
  estatRondes,
  procesRondes,
  procesEnMarxa
}) => {
  const [estadistiques, setEstadistiques] = React.useState({});

  React.useEffect(() => {
    if (procesRondes) {
      const interval = setInterval(() => {
        const stats = obtenirEstadistiques();
        setEstadistiques(stats);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [procesRondes, obtenirEstadistiques]);

  const handleIniciarProces = () => {
    iniciarAdjudicacio();
  };

  const handleAcceptarAdjudicacio = async (adjudicacioId) => {
    await acceptarAdjudicacio(adjudicacioId);
  };

  const handleRebutjarAdjudicacio = async (adjudicacioId) => {
    await rebutjarAdjudicacio(adjudicacioId);
  };

  // Filtrar candidatos y adjudicaciones de esta categoría usando datos del sistema de rondas
  const candidatsCategoria = candidats.filter(c => c.categoria === categoria);
  const candidatsRespost = candidatsCategoria.filter(c => c.estat === 'respost').length;
  
  // Obtener adjudicaciones de esta categoría
  const adjudicacionsCategoria = (estatRondes?.adjudicacions || []).filter(adj => {
    const candidat = candidats.find(c => c.id === adj.candidatId);
    return candidat && candidat.categoria === categoria;
  });

  // Obtener estadísticas del grupo específico
  const statistiquesGrup = estadistiques[`${categoria}-1`]; // Usando la convención de nombres del sistema

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header del modal */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="text-blue-600" />
            Gestió d'Adjudicació - {categoria}
          </h2>
          <button 
            onClick={onTancar}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Panel de Control */}
          <div className="bg-gray-50 rounded-lg border p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Control del Grup {categoria}</h3>
              <div className="flex gap-3">
                {!procesRondes ? (
                  <button
                    onClick={handleIniciarProces}
                    disabled={procesEnMarxa || candidatsRespost === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded font-medium ${
                      procesEnMarxa || candidatsRespost === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {procesEnMarxa ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} />}
                    {procesEnMarxa ? 'Iniciant...' : 'Iniciar Procés'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={20} />
                    <span className="font-medium">Procés en curs</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Adjudicaciones pendientes del grupo */}
          {adjudicacionsCategoria.filter(adj => adj.estat === 'pendent').length > 0 && (
            <div className="bg-white rounded-lg border p-4">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Clock size={20} />
                Adjudicacions Pendents de Confirmació ({adjudicacionsCategoria.filter(adj => adj.estat === 'pendent').length})
              </h4>
              <div className="space-y-3">
                {adjudicacionsCategoria
                  .filter(adj => adj.estat === 'pendent')
                  .map(adj => {
                    const candidat = candidats.find(c => c.id === adj.candidatId);
                    const posicio = posicions.find(p => p.id === adj.posicioId);
                    const tempsRestant = Math.max(0, new Date(adj.dataLimitAcceptacio) - new Date());
                    
                    return (
                      <div key={adj.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-bold">{candidat?.puntuacio}</span>
                            </div>
                            <div>
                              <p className="font-medium">{candidat?.nom}</p>
                              <p className="text-sm text-gray-600">
                                {posicio?.titol} - {posicio?.departament}
                              </p>
                              <p className="text-xs text-gray-500">
                                Preferència {adj.preferencia} • Ronda {adj.ronda}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex gap-2 mb-2">
                              <button
                                onClick={() => handleAcceptarAdjudicacio(adj.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                <CheckCircle size={14} className="inline mr-1" />
                                Acceptar
                              </button>
                              <button
                                onClick={() => handleRebutjarAdjudicacio(adj.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                <XCircle size={14} className="inline mr-1" />
                                Rebutjar
                              </button>
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatTemps(Math.floor(tempsRestant / 1000))} restants
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Mensaje si no hay adjudicaciones pendientes */}
          {adjudicacionsCategoria.filter(adj => adj.estat === 'pendent').length === 0 && procesRondes && (
            <div className="text-center py-8 text-gray-500">
              <p>No hi ha adjudicacions pendents per aquest grup</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrupsConcurrents;