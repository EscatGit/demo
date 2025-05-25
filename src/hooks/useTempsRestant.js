// hooks/useTempsRestant.js
import { useEffect } from 'react';

export const useTempsRestant = (tempsRestant, setTempsRestant) => {
  useEffect(() => {
    if (tempsRestant !== null && tempsRestant > 0) {
      const timer = setTimeout(() => {
        setTempsRestant(tempsRestant - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tempsRestant, setTempsRestant]);

  const formatTemps = (segons) => {
    if (segons === null || segons <= 0) return '00h 00m 00s';
    const hores = Math.floor(segons / 3600);
    const minuts = Math.floor((segons % 3600) / 60);
    const segsRestants = segons % 60;
    return `${hores}h ${minuts}m ${segsRestants}s`;
  };

  return { formatTemps };
};