// components/admin/VistaAdmin.jsx
import React, { useState } from 'react';
import { Building, Users, Briefcase, TrendingUp, FileText, Send, Eye, Download, ArrowLeft, Clock, Play, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useAdjudicacio } from '../../context/AdjudicacioContext';
import { formatTemps, getEstatColor } from '../../utils/helpers';
import EstadistiquesPanel from './EstadistiquesPanel';
import TaulaCandidats from './TaulaCandidats';
import PosicionsTempsReal from './PosicionsTempsReal';
import GrupsConcurrents from './GrupsConcurrents';

const VistaAdmin = () => {
  const {
    candidats,
    posicions,
    adjudicacions,
    notificacionsEnviades,
    setCandidatActual,
    setVistaActual,
    enviarNotificacions,
    generarPDF,
    estadistiques,
    iniciarAdjudicacio,
    procesRondes,
    procesEnMarxa
  } = useAdjudicacio();

  const [activeTab, setActiveTab] = useState('aspirants');
  const [vistaDetall, setVistaDetall] = useState(null);
  const [posicioDetall, setPosicioDetall] = useState(null);

  const tabs = [
    { id: 'aspirants', label: 'Aspirants', icon: Users },
    { id: 'posicions', label: 'Posicions', icon: Briefcase },
    { id: 'adjudicacio', label: 'Adjudicació', icon: TrendingUp },
    { id: 'informe', label: 'Informe', icon: FileText }
  ];

  const handleVeureAspirant = (candidat) => {
    setCandidatActual(candidat);
    setVistaActual('aspirant');
  };

  const handleVeurePosicio = (posicio) => {
    setPosicioDetall(posicio);
  };

  const handleVeureDetalls = (candidat) => {
    setVistaDetall(candidat);
  };

  // Contar candidatos que han respondido
  const candidatsRespost = candidats.filter(c => ['respost', 'adjudicat', 'contractat', 'rebutjat'].includes(c.estat)).length;
  const candidatsPendent = candidats.filter(c => ['pendent', 'desqualificat'].includes(c.estat)).length;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'aspirants':
        return (
          <div className="space-y-4">
            {vistaDetall ? (
              <>
                <button
                  onClick={() => setVistaDetall(null)}
                  className="text-blue-600 hover:underline mb-4 flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Tornar a la llista
                </button>
                <DetallAspirant 
                  candidat={vistaDetall} 
                  posicions={posicions}
                  onAccedirPortal={() => handleVeureAspirant(vistaDetall)}
                />
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">Llista d'Aspirants</h2>
                
                {/* Resumen de estados */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{candidatsRespost}</p>
                    <p className="text-sm text-gray-600">Amb preferències establertes</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-yellow-600">{candidatsPendent}</p>
                    <p className="text-sm text-gray-600">Sense preferències establertes</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{candidats.length}</p>
                    <p className="text-sm text-gray-600">Total candidats</p>
                  </div>
                </div>
                
                <TaulaCandidats onVeureDetalls={handleVeureDetalls} />
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Fes clic a "Veure detalls" per veure informació completa de cada candidat.
                  </p>
                </div>
              </>
            )}
          </div>
        );

      case 'posicions':
        return (
          <div className="space-y-4">
            {posicioDetall ? (
              <>
                <button
                  onClick={() => setPosicioDetall(null)}
                  className="text-blue-600 hover:underline mb-4 flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Tornar a la llista
                </button>
                <DetallPosicio posicio={posicioDetall} candidats={candidats} />
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">Llista de Posicions</h2>
                <PosicionsTempsReal onVeurePosicio={handleVeurePosicio} />
              </>
            )}
          </div>
        );

      case 'adjudicacio':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Procés d'Adjudicació per Rondes</h2>
              
              {/* Botons d'acció */}
              <div className="flex gap-3">
                {!procesRondes ? (
                  <button
                    onClick={iniciarAdjudicacio}
                    disabled={procesEnMarxa || candidatsRespost === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded font-medium ${
                      procesEnMarxa || candidatsRespost === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {procesEnMarxa ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} />}
                    {procesEnMarxa ? 'Iniciant Procés...' : 'Iniciar Procés d\'Adjudicació'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded">
                    <CheckCircle size={20} />
                    <span className="font-medium">Procés d'Adjudicació en Curs</span>
                  </div>
                )}

                <button
                  onClick={enviarNotificacions}
                  disabled={notificacionsEnviades}
                  className={`flex items-center gap-2 px-4 py-2 rounded font-medium ${
                    notificacionsEnviades 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Send size={20} />
                  {notificacionsEnviades ? 'Notificacions Enviades' : 'Enviar Notificacions'}
                </button>
              </div>
            </div>

            {/* Advertencia de estado de candidatos */}
            {candidatsPendent > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Clock className="text-yellow-600" size={20} />
                  <p className="text-yellow-800">
                    Hi ha {candidatsPendent} candidats que encara no han respost les seves prioritats.
                    El sistema de rondes només processarà candidats amb estat 'respost'.
                  </p>
                </div>
              </div>
            )}

            {/* Avís si no hi ha candidats preparats */}
            {candidatsRespost === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="text-red-600" size={20} />
                  <p className="text-red-800">
                    <strong>No es pot iniciar el procés d'adjudicació.</strong> No hi ha cap candidat amb estat 'respost'. 
                    Els candidats han d'expressar les seves prioritats abans d'iniciar el procés.
                  </p>
                </div>
              </div>
            )}
			
            {/* Vista de grupos concurrentes con gestión individual */}
            <GrupsConcurrents />
          </div>
        );

      case 'informe':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Generació d'Informes</h2>

            {/* Opcions d'informe */}
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">Tipus d'Informes Disponibles</h3>
              
              <div className="grid gap-4">
                <div className="border rounded-lg p-4 hover:bg-gray-50">
                  <h4 className="font-medium mb-2">Informe d'Adjudicació per Rondes</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Resum complet del procés d'adjudicació amb resultats per candidat, posició i ronda
                  </p>
                  <button 
                    onClick={generarPDF}
                    disabled={adjudicacions.length === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded ${
                      adjudicacions.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Download size={18} />
                    Generar PDF
                  </button>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50">
                  <h4 className="font-medium mb-2">Informe Estadístic de Rondes</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Anàlisi detallat amb gràfics i mètriques del procés per rondes i grups concurrents
                  </p>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    <Download size={18} />
                    Generar Excel
                  </button>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50">
                  <h4 className="font-medium mb-2">Informe de Candidats i Adjudicacions</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Llista completa de candidats amb el seu estat, adjudicacions i timeline del procés
                  </p>
                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                    <Download size={18} />
                    Generar CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building className="text-blue-600" />
              Panell d'Administració - Hospital del Mar
            </h1>
            <p className="text-gray-600 mt-2">Sistema d'adjudicació per rondes concurrents</p>
          </div>

          {/* Panell d'Estadístiques - Sempre visible */}
          <div className="p-6 bg-gray-50 border-b">
            <EstadistiquesPanel />
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-blue-600 bg-blue-50'
                        : 'text-gray-600 border-transparent hover:text-gray-800'
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component Detall Aspirant
const DetallAspirant = ({ candidat, posicions, onAccedirPortal }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">{candidat.nom}</h2>
        
        {/* Informació bàsica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Informació de Contacte</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{candidat.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Telèfon:</span>
                <span className="font-medium">{candidat.telefon || 'No disponible'}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Informació Professional</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Categoria:</span>
                <span className="font-medium">{candidat.categoria}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Especialitat:</span>
                <span className="font-medium">{candidat.especialitat}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Puntuació i experiència */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-gray-700 mb-2">Puntuació</h3>
            <p className="text-3xl font-bold text-blue-600">{candidat.puntuacio}</p>
            <p className="text-sm text-gray-600">punts</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-gray-700 mb-2">Experiència</h3>
            <p className="text-3xl font-bold text-green-600">{candidat.experiencia}</p>
            <p className="text-sm text-gray-600">anys</p>
          </div>
        </div>

        {/* Estat */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Estat Actual</h3>
          <span className={`px-3 py-1 rounded text-sm ${getEstatColor(candidat.estat)}`}>
            {candidat.estat}
          </span>
        </div>

        {/* Titulacions */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Titulacions</h3>
          {candidat.titulacions && candidat.titulacions.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {candidat.titulacions.map((titulacio, index) => (
                <li key={index}>{titulacio}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No s'han registrat titulacions</p>
          )}
        </div>

        {/* Prioritats */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Prioritats Seleccionades</h3>
          {candidat.prioritats && candidat.prioritats.length > 0 ? (
            <div className="space-y-3">
              {candidat.prioritats.map(prio => {
                const pos = posicions.find(p => p.id === prio.posicioId);
                return pos ? (
                  <div key={prio.posicioId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      {prio.prioritat}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{pos.titol}</p>
                      <p className="text-sm text-gray-600">{pos.departament} - {pos.torn}</p>
                    </div>
                    <span className="text-sm text-gray-500">{pos.contracte}</span>
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            <p className="text-gray-500">No ha seleccionat cap prioritat</p>
          )}
        </div>

        {/* Botons d'acció */}
        <div className="flex gap-3 pt-4 border-t">
          <button 
            onClick={onAccedirPortal}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Eye size={20} />
            Accedir al Portal de l'Aspirant
          </button>
          <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium">
            Editar Dades
          </button>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
            Enviar Missatge
          </button>
        </div>
      </div>
    </div>
  );
};

// Component Detall Posició
const DetallPosicio = ({ posicio, candidats }) => {
  const candidatsInteressats = candidats.filter(c => 
    c.prioritats && c.prioritats.some(p => p.posicioId === posicio.id)
  ).sort((a, b) => {
    const prioA = a.prioritats.find(p => p.posicioId === posicio.id)?.prioritat || 999;
    const prioB = b.prioritats.find(p => p.posicioId === posicio.id)?.prioritat || 999;
    return prioA - prioB;
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">{posicio.titol}</h2>
        
        {/* Informació bàsica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Detalls de la Posició</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Departament:</span>
                <span className="font-medium">{posicio.departament}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Categoria:</span>
                <span className="font-medium">{posicio.categoria}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Especialitat:</span>
                <span className="font-medium">{posicio.especialitat}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Condicions Laborals</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Torn:</span>
                <span className="font-medium">{posicio.torn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contracte:</span>
                <span className="font-medium">{posicio.contracte}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Salari:</span>
                <span className="font-medium text-green-600">{posicio.salari}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Places disponibles */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Places</h3>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{posicio.placesDisponibles}</p>
              <p className="text-sm text-gray-600">Disponibles</p>
            </div>
            <div className="text-2xl text-gray-400">/</div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{posicio.placesInicials}</p>
              <p className="text-sm text-gray-600">Totals</p>
            </div>
          </div>
        </div>

        {/* Requisits */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Requisits</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {posicio.requisits.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>

        {/* Candidats interessats */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">
            Candidats Interessats ({candidatsInteressats.length})
          </h3>
          {candidatsInteressats.length > 0 ? (
            <div className="space-y-3">
              {candidatsInteressats.map(candidat => {
                const prioritat = candidat.prioritats.find(p => p.posicioId === posicio.id);
                return (
                  <div key={candidat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {prioritat?.prioritat}
                      </span>
                      <div>
                        <p className="font-medium">{candidat.nom}</p>
                        <p className="text-sm text-gray-600">
                          {candidat.categoria} - {candidat.especialitat}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{candidat.puntuacio} punts</p>
                      <p className="text-sm text-gray-600">{candidat.experiencia} anys exp.</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No hi ha candidats interessats en aquesta posició</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VistaAdmin;