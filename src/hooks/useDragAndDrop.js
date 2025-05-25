// hooks/useDragAndDrop.js
import { useState, useCallback } from 'react';

export const useDragAndDrop = (candidats, setCandidats, candidatActual, setCandidatActual) => {
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = useCallback((e, posicioId) => {
    setDraggedItem(posicioId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e, targetIndex) => {
    e.preventDefault();
    const candidat = candidatActual || candidats[0];
    
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
        
        const candidatsActualitzats = candidats.map(c => 
          c.id === candidat.id 
            ? { ...c, prioritats: novesPrioritats }
            : c
        );
        setCandidats(candidatsActualitzats);
        setCandidatActual({ ...candidat, prioritats: novesPrioritats });
      }
    }
  }, [draggedItem, candidats, candidatActual, setCandidats, setCandidatActual]);

  return {
    draggedItem,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };
};
