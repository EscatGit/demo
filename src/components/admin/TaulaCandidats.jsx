import React, { useState, useMemo } from 'react';
import { Eye, Search, ChevronUp, ChevronDown, Filter, X } from 'lucide-react';
import { useAdjudicacio } from '../../context/AdjudicacioContext';
import { getEstatColor } from '../../utils/helpers';

const TaulaCandidats = ({ onVeureDetalls }) => {
  const { candidats } = useAdjudicacio();
  
  // Estats per ordenació
  const [ordenacio, setOrdenacio] = useState({ camp: null, direccio: 'asc' });
  
  // Estats per cerca i filtres
  const [cercaText, setCercaText] = useState('');
  const [filtreCategoria, setFiltreCategoria] = useState('');
  const [filtreEspecialitat, setFiltreEspecialitat] = useState('');
  const [filtreEstat, setFiltreEstat] = useState('');
  
  // Obtenir valors únics per als filtres
  const categories = [...new Set(candidats.map(c => c.categoria))].filter(Boolean);
  const especialitats = [...new Set(candidats.map(c => c.especialitat))].filter(Boolean);
  const estats = [...new Set(candidats.map(c => c.estat))].filter(Boolean);
  
  // Funció per ordenar
  const handleOrdenacio = (camp) => {
    if (ordenacio.camp === camp) {
      setOrdenacio({
        camp,
        direccio: ordenacio.direccio === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setOrdenacio({ camp, direccio: 'asc' });
    }
  };
  
  // Filtrar i ordenar candidats
  const candidatsFiltrats = useMemo(() => {
    let filtrats = [...candidats];
    
    // Aplicar cerca per nom o telèfon
    if (cercaText) {
	filtrats = filtrats.filter(c => 
		 c.nom.toLowerCase().includes(cercaText.toLowerCase()) ||
		(c.telefon && c.telefon.toString().includes(cercaText))
  );
}
    
    // Aplicar filtres
    if (filtreCategoria) {
      filtrats = filtrats.filter(c => c.categoria === filtreCategoria);
    }
    if (filtreEspecialitat) {
      filtrats = filtrats.filter(c => c.especialitat === filtreEspecialitat);
    }
    if (filtreEstat) {
      filtrats = filtrats.filter(c => c.estat === filtreEstat);
    }
    
    // Aplicar ordenació
    if (ordenacio.camp) {
      filtrats.sort((a, b) => {
        let valorA = a[ordenacio.camp];
        let valorB = b[ordenacio.camp];
        
        // Gestionar valors numèrics
        if (ordenacio.camp === 'puntuacio' || ordenacio.camp === 'experiencia') {
          valorA = Number(valorA) || 0;
          valorB = Number(valorB) || 0;
        }
        
        // Gestionar prioritats
        if (ordenacio.camp === 'prioritats') {
          valorA = a.prioritats?.length || 0;
          valorB = b.prioritats?.length || 0;
        }
        
        if (valorA < valorB) return ordenacio.direccio === 'asc' ? -1 : 1;
        if (valorA > valorB) return ordenacio.direccio === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtrats;
  }, [candidats, cercaText, filtreCategoria, filtreEspecialitat, filtreEstat, ordenacio]);
  
  // Component per mostrar icones d'ordenació
  const IconaOrdenacio = ({ camp }) => {
    if (ordenacio.camp !== camp) {
      return <div className="w-4 h-4" />;
    }
    return ordenacio.direccio === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };
  
  // Esborrar tots els filtres
  const esborrarFiltres = () => {
    setCercaText('');
    setFiltreCategoria('');
    setFiltreEspecialitat('');
    setFiltreEstat('');
  };
  
  const teFiltresActius = cercaText || filtreCategoria || filtreEspecialitat || filtreEstat;

  return (
    <div>
      {/* Barra de cerca i filtres */}
      <div className="mb-4 space-y-3">
        {/* Cerca */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cercar per nom o telèfon..."
              value={cercaText}
              onChange={(e) => setCercaText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          {teFiltresActius && (
            <button
              onClick={esborrarFiltres}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <X size={18} />
              Esborrar filtres
            </button>
          )}
        </div>
        
        {/* Filtres */}
        <div className="flex gap-2 items-center">
          <Filter className="text-gray-500" size={20} />
          <select
            value={filtreCategoria}
            onChange={(e) => setFiltreCategoria(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Totes les categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select
            value={filtreEspecialitat}
            onChange={(e) => setFiltreEspecialitat(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Totes les especialitats</option>
            {especialitats.map(esp => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>
          
          <select
            value={filtreEstat}
            onChange={(e) => setFiltreEstat(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Tots els estats</option>
            {estats.map(est => (
              <option key={est} value={est}>{est}</option>
            ))}
          </select>
        </div>
        
        {/* Resum de resultats */}
        <div className="text-sm text-gray-600">
          Mostrant {candidatsFiltrats.length} de {candidats.length} candidats
        </div>
      </div>
      
      {/* Taula */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th 
                className="border p-2 text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleOrdenacio('nom')}
              >
                <div className="flex items-center justify-between">
                  Nom
                  <IconaOrdenacio camp="nom" />
                </div>
              </th>
              <th 
                className="border p-2 text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleOrdenacio('categoria')}
              >
                <div className="flex items-center justify-between">
                  Categoria
                  <IconaOrdenacio camp="categoria" />
                </div>
              </th>
              <th 
                className="border p-2 text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleOrdenacio('especialitat')}
              >
                <div className="flex items-center justify-between">
                  Especialitat
                  <IconaOrdenacio camp="especialitat" />
                </div>
              </th>
              <th 
                className="border p-2 text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleOrdenacio('puntuacio')}
              >
                <div className="flex items-center justify-between">
                  Puntuació
                  <IconaOrdenacio camp="puntuacio" />
                </div>
              </th>
              <th 
                className="border p-2 text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleOrdenacio('experiencia')}
              >
                <div className="flex items-center justify-between">
                  Experiència
                  <IconaOrdenacio camp="experiencia" />
                </div>
              </th>
              <th 
                className="border p-2 text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleOrdenacio('estat')}
              >
                <div className="flex items-center justify-between">
                  Estat
                  <IconaOrdenacio camp="estat" />
                </div>
              </th>
              <th 
                className="border p-2 text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleOrdenacio('prioritats')}
              >
                <div className="flex items-center justify-between">
                  Prioritats
                  <IconaOrdenacio camp="prioritats" />
                </div>
              </th>
              <th className="border p-2 text-left">Acció</th>
            </tr>
          </thead>
          <tbody>
            {candidatsFiltrats.map(candidat => (
              <tr key={candidat.id} className="hover:bg-gray-50 transition-colors">
                <td className="border p-2">
                  <div>
                    <p className="font-medium">{candidat.nom}</p>
                    <p className="text-xs text-gray-500">{candidat.email}</p>
                    {candidat.telefon && (
                      <p className="text-xs text-gray-500">{candidat.telefon}</p>
                    )}
                  </div>
                </td>
                <td className="border p-2">{candidat.categoria}</td>
                <td className="border p-2">{candidat.especialitat}</td>
                <td className="border p-2">
                  <span className="font-medium text-lg">{candidat.puntuacio}</span>
                  <span className="text-xs text-gray-500 block">punts</span>
                </td>
                <td className="border p-2">
                  <span className="font-medium">{candidat.experiencia}</span>
                  <span className="text-xs text-gray-500 block">anys</span>
                </td>
                <td className="border p-2">
                  <span className={`px-2 py-1 rounded text-sm ${getEstatColor(candidat.estat)}`}>
                    {candidat.estat}
                  </span>
                </td>
                <td className="border p-2">
                  {candidat.prioritats && candidat.prioritats.length > 0 ? (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{candidat.prioritats.length}</span>
                      <span className="text-xs text-gray-500">seleccionades</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => onVeureDetalls(candidat)}
                    className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                  >
                    <Eye size={16} />
                    Veure detalls
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {candidatsFiltrats.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No s'han trobat candidats amb els criteris seleccionats</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaulaCandidats;
