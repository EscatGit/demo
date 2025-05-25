// utils/pdfGenerator.js
export const generarInformePDF = (adjudicacions, candidats, posicions) => {
  const contingutPDF = adjudicacions.map(adj => {
    const candidat = candidats.find(c => c.id === adj.candidatId);
    const posicio = posicions.find(p => p.id === adj.posicioId);
    return `${candidat.nom} - ${posicio.titol} - ${adj.estat}`;
  }).join('\n');

  const blob = new Blob([
    `INFORME D'ADJUDICACIÓ - HOSPITAL DEL MAR\n\n` +
    `Data: ${new Date().toLocaleDateString('ca-ES')}\n` +
    `Hora: ${new Date().toLocaleTimeString('ca-ES')}\n\n` +
    `RESUM:\n` +
    `Total adjudicacions: ${adjudicacions.length}\n` +
    `Acceptades: ${adjudicacions.filter(a => a.estat === 'acceptada').length}\n` +
    `Pendents: ${adjudicacions.filter(a => a.estat === 'pendent').length}\n` +
    `Rebutjades: ${adjudicacions.filter(a => a.estat === 'rebutjada').length}\n\n` +
    `DETALL:\n` +
    `${contingutPDF}`
  ], { type: 'text/plain' });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `adjudicacio_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};