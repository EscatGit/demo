import React, { useState } from 'react';
import { Briefcase, Heart, Clock, FileText, Users, GripVertical, CheckCircle } from 'lucide-react';
import { useAdjudicacio } from '../../context/AdjudicacioContext';
import { filtrarPosicionsElegibles } from '../../utils/helpers';

const SistemaPrioritats = ({ candidat }) => {
  const { 
    posicions, 
    seleccionarPrioritat, 
    reordenarPrioritats 
  } = useAdjudicacio();
  
  const [draggedItem, setDraggedItem] = useState(null);

  const posicionsElegibles = filtrarPosicionsElegibles(posicions, candidat);

  const handleSeleccionarPosicio = (posicioId) => {
    seleccionarPrioritat(candidat.id, posicioId);
  };

  // Funcions drag & drop
  const handleDragStart = (e, posicioId) => {
    setDraggedItem(posicioId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    
    if (draggedItem) {
      const novesPrioritats = [...candidat.prioritats];
      const draggedIndex = novesPrioritats.findIndex(p => p.posicioId === draggedItem);
      
      if (draggedIndex >= 0) {
        const [draggedPriority] = novesPrioritats.splice(draggedIndex, 1);
        novesPrioritats.splice(targetIndex, 0, draggedPriority);
        
        // Actualitzar números de prioritat
        novesPrioritats.forEach((p, index) => {
          p.prioritat = index + 1;
        });
        
        reordenarPrioritats(candidat.id, novesPrioritats);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Posicions disponibles */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="text-gray-600" />
          Places disponibles per al teu perfil
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Selecciona fins a 5 places fent clic sobre elles
        </p>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {posicionsElegibles.map(posicio => {
            const prioritat = candidat.prioritats?.find(p => p.posicioId === posicio.id);
            
            return (
              <div 
                key={posicio.id} 
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  prioritat 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleSeleccionarPosicio(posicio.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold">{posicio.titol}</h4>
                    <p className="text-sm text-gray-600">{posicio.departament}</p>
                    
                    <div className="flex flex-wrap gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock size={14} />
                        {posicio.torn}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <FileText size={14} />
                        {posicio.contracte}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Users size={14} />
                        {posicio.placesDisponibles} places
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        💰 {posicio.salari}
                      </span>
                    </div>
                  </div>
                  
                  {prioritat && (
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      ✓
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {posicionsElegibles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No hi ha places disponibles per al teu perfil</p>
          </div>
        )}
      </div>

      {/* Sistema de prioritats */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Heart className="text-gray-600" />
          Les teves preferències
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Ordena les teves seleccions arrossegant-les. La posició 1 és la teva prioritat màxima.
        </p>

        {!candidat.prioritats || candidat.prioritats.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">Encara no has seleccionat cap plaça</p>
            <p className="text-sm text-gray-400 mt-2">Fes clic a les places de l'esquerra per afegir-les</p>
          </div>
        ) : (
          <div className="space-y-2">
            {candidat.prioritats
              .sort((a, b) => a.prioritat - b.prioritat)
              .map((prio, index) => {
                const posicio = posicions.find(p => p.id === prio.posicioId);
                
                if (!posicio) return null;
                
                return (
                  <div
                    key={prio.posicioId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, prio.posicioId)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`bg-white border rounded-lg p-4 cursor-move transition-all duration-200 ${
                      draggedItem === prio.posicioId ? 'opacity-50' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-gray-400">
                        <GripVertical size={20} />
                        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{posicio.titol}</h4>
                        <p className="text-sm text-gray-600">
                          {posicio.departament} • {posicio.torn}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {candidat.prioritats && candidat.prioritats.length > 0 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 flex items-center gap-2">
              <CheckCircle size={20} />
              Les teves preferències s'han guardat correctament
            </p>
            <p className="text-sm text-green-600 mt-1">
              Has seleccionat {candidat.prioritats.length} de 5 places possibles
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SistemaPrioritats;