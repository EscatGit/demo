// utils/helpers.js
export const getEstatColor = (estat) => {
  const colors = {
    'pendent': 'bg-gray-200',
    'respost': 'bg-blue-200',
    'adjudicat': 'bg-yellow-200',
    'contractat': 'bg-green-200',
    'rebutjat': 'bg-red-200',
    'acceptada': 'bg-green-100 text-green-800',
    'rebutjada': 'bg-red-100 text-red-800',
	'desqualificat': 'bg-gray-600 text-white'
  };
  return colors[estat] || 'bg-gray-200';
};

export const formatTemps = (segons) => {
  if (segons === null || segons <= 0) return '00h 00m 00s';
  const hores = Math.floor(segons / 3600);
  const minuts = Math.floor((segons % 3600) / 60);
  const segsRestants = segons % 60;
  return `${hores}h ${minuts}m ${segsRestants}s`;
};

export const calcularEstatistiques = (candidats, posicions, adjudicacions) => {
  return {
    candidatsRespostos: candidats.filter(c => c.estat === 'respost').length,
    placesTotals: posicions.reduce((acc, p) => acc + p.placesInicials, 0),
    placesOcupades: posicions.reduce((acc, p) => acc + (p.placesInicials - p.placesDisponibles), 0),
    adjudicacionsFetes: adjudicacions.length,
    acceptades: adjudicacions.filter(a => a.estat === 'acceptada').length,
    pendents: adjudicacions.filter(a => a.estat === 'pendent').length,
    rebutjades: adjudicacions.filter(a => a.estat === 'rebutjada').length
  };
};

export const filtrarPosicionsElegibles = (posicions, candidat) => {
  return posicions.filter(p => 
    p.categoria === candidat.categoria && 
    p.especialitat === candidat.especialitat &&
    p.placesDisponibles > 0
  );
};

export const simularNotificacions = (candidats, posicions) => {
  return candidats.map(c => {
    if (Math.random() > 0.3) {
      const posicionsElegibles = posicions.filter(p => 
        p.categoria === c.categoria && 
        p.especialitat === c.especialitat
      );
      const prioritats = posicionsElegibles
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(5, posicionsElegibles.length))
        .map((p, index) => ({ posicioId: p.id, prioritat: index + 1 }));
      
      return { ...c, estat: 'respost', prioritats };
    }
    return c;
  });
};

export const validarSeleccioPrioritat = (candidat, posicioId, maxPrioritats = 5) => {
  const indexExistent = candidat.prioritats.findIndex(p => p.posicioId === posicioId);
  const puedeAgregar = candidat.prioritats.length < maxPrioritats;
  
  return {
    existe: indexExistent >= 0,
    puedeAgregar,
    indexExistent
  };
};