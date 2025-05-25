// Components index - Barrel exports (Actualizado para Sistema de Rondas)

// Shared components
export { default as Header } from './shared/Header';

// Admin components
export { default as VistaAdmin } from './admin/VistaAdmin';
export { default as EstadistiquesPanel } from './admin/EstadistiquesPanel';
export { default as TaulaCandidats } from './admin/TaulaCandidats';
export { default as PosicionsTempsReal } from './admin/PosicionsTempsReal';
export { default as GestorAdjudicacioRondes } from './admin/GestorAdjudicacioRondes'; // NUEVO
export { default as GrupsConcurrents } from './admin/GrupsConcurrents';

// Aspirant components
export { default as VistaAspirant } from './aspirant/VistaAspirant';
export { default as PerfilCandidat } from './aspirant/PerfilCandidat';
export { default as SistemaPrioritats } from './aspirant/SistemaPrioritats';
export { default as OfertaAdjudicada } from './aspirant/OfertaAdjudicada';

// Nota: ResultatsAdjudicacio ha sido integrado en GestorAdjudicacioRondes