import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { AdjudicacioRondes } from '../utils/adjudicacioRondes';
import { generarInformePDF } from '../utils/pdfGenerator';
import { calcularEstatistiques, simularNotificacions, validarSeleccioPrioritat } from '../utils/helpers';

const AdjudicacioContext = createContext();

export const useAdjudicacio = () => {
  const context = useContext(AdjudicacioContext);
  if (!context) {
    throw new Error('useAdjudicacio must be used within an AdjudicacioProvider');
  }
  return context;
};

export const AdjudicacioProvider = ({ children }) => {
  // Estados principales
  const [candidats, setCandidats] = useState([]);
  const [posicions, setPosicions] = useState([]);
  const [vistaActual, setVistaActual] = useState('admin');
  const [candidatActual, setCandidatActual] = useState(null);
  const [procesEnMarxa, setProcesEnMarxa] = useState(false);
  const [notificacionsEnviades, setNotificacionsEnviades] = useState(false);
  const [mostrarPosicions, setMostrarPosicions] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  // Estados del sistema de rondas
  const [sistemaRondes, setSistemaRondes] = useState(null);
  const [procesRondes, setProcesRondes] = useState(null);
  const [estatRondes, setEstatRondes] = useState(null);
  
  // NUEVO: Estado para estadísticas globales
  const [estadistiquesGlobals, setEstadistiquesGlobals] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    carregarCandidats();
    carregarPosicions();
  }, []);

  // ACTUALIZADO: Timer para actualizar el estado de las rondas y estadísticas globales
  useEffect(() => {
    if (procesRondes) {
      const interval = setInterval(() => {
        const nouEstat = procesRondes.obtenirEstatActual();
        setEstatRondes(nouEstat);
        setCandidats(nouEstat.candidats);
        setPosicions(nouEstat.posicions.map(p => ({
          ...p,
          placesDisponibles: nouEstat.placesIndividuals
            .filter(pl => pl.posicioId === p.id && pl.estat === 'lliure')
            .length
        })));
        setAdjudicacions(nouEstat.adjudicacions);
        
        // NUEVO: Actualizar estadísticas globales
        const stats = procesRondes.obtenirEstadistiquesGlobals();
        setEstadistiquesGlobals(stats);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [procesRondes]);

  // NUEVO: Actualizar estadísticas globales cuando cambie el estado
  useEffect(() => {
    const stats = obtenirEstadistiquesGlobals();
    setEstadistiquesGlobals(stats);
  }, [candidats, posicions, estatRondes]);

  const carregarCandidats = async () => {
    try {
      const response = await fetch('/candidats.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      const candidatsData = jsonData.map(row => ({
        id: row.id,
        nom: row.nom,
        email: row.email,
        telefon: row.telefon,
        categoria: row.categoria,
        especialitat: row.especialitat,
        puntuacio: Number(row.puntuacio),
        experiencia: Number(row.experiencia),
        titulacions: row.titulacions 
          ? String(row.titulacions).split(';').map(t => t.trim()) 
          : [],
        estat: row.estat || 'pendent',
        prioritats: []
      }));

      setCandidats(candidatsData);
    } catch (error) {
      console.error('Error loading candidats.xlsx:', error);
     
    }
  };

  const carregarPosicions = async () => {
    try {
      const response = await fetch('/posicions.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      const posicionsData = jsonData.map(row => ({
        id: row.id,
        titol: row.titol,
        departament: row.departament,
        categoria: row.categoria,
        especialitat: row.especialitat,
        torn: row.torn,
        contracte: row.contracte,
        placesDisponibles: Number(row.placesDisponibles),
        placesInicials: Number(row.placesInicials),
        salari: row.salari,
        requisits: row.requisits 
          ? String(row.requisits).split(';').map(r => r.trim()) 
          : [],
        assignades: []
      }));

      setPosicions(posicionsData);
    } catch (error) {
      console.error('Error loading posicions.xlsx:', error);
    }
  };

  const enviarNotificacions = useCallback(() => {
    setNotificacionsEnviades(true);
    
    setTimeout(() => {
      const candidatsActualitzats = simularNotificacions(candidats, posicions);
      setCandidats(candidatsActualitzats);
    }, 2000);
  }, [candidats, posicions]);

  // ACTUALIZADO: Sistema de rondas con estadísticas globales
  const iniciarAdjudicacio = useCallback(async () => {
    if (procesEnMarxa) return;
    
    setProcesEnMarxa(true);
    
    try {
      // Crear nueva instancia del proceso
      const rondes = new AdjudicacioRondes(candidats, posicions);
      setProcesRondes(rondes);
      setSistemaRondes(rondes);
      
      // Iniciar el proceso
      rondes.iniciarAdjudicacio();
      
      // Actualizar estado
      const nouEstat = rondes.obtenirEstatActual();
      setEstatRondes(nouEstat);
      setCandidats(nouEstat.candidats);
      setPosicions(nouEstat.posicions.map(p => ({
        ...p,
        placesDisponibles: nouEstat.placesIndividuals
          .filter(pl => pl.posicioId === p.id && pl.estat === 'lliure')
          .length
      })));
      
      // NUEVO: Actualizar estadísticas globales
      const stats = rondes.obtenirEstadistiquesGlobals();
      setEstadistiquesGlobals(stats);
      
    } catch (error) {
      console.error('Error iniciant adjudicació:', error);
    } finally {
      setProcesEnMarxa(false);
    }
  }, [candidats, posicions, procesEnMarxa]);

  // ACTUALIZADO: Acceptar adjudicación con actualización de estadísticas
  const acceptarAdjudicacio = useCallback((adjudicacioId) => {
    if (procesRondes) {
      const resultat = procesRondes.acceptarAdjudicacio(adjudicacioId);
      if (resultat) {
        const nouEstat = procesRondes.obtenirEstatActual();
        setEstatRondes(nouEstat);
        setCandidats(nouEstat.candidats);
        setPosicions(nouEstat.posicions.map(p => ({
          ...p,
          placesDisponibles: nouEstat.placesIndividuals
            .filter(pl => pl.posicioId === p.id && pl.estat === 'lliure')
            .length
        })));
        
        // NUEVO: Actualizar estadísticas globales
        const stats = procesRondes.obtenirEstadistiquesGlobals();
        setEstadistiquesGlobals(stats);
      }
      return resultat;
    }
    return false;
  }, [procesRondes]);

  // ACTUALIZADO: Rechazar adjudicación con actualización de estadísticas
  const rebutjarAdjudicacio = useCallback((adjudicacioId) => {
    if (procesRondes) {
      const resultat = procesRondes.rebutjarAdjudicacio(adjudicacioId);
      if (resultat) {
        const nouEstat = procesRondes.obtenirEstatActual();
        setEstatRondes(nouEstat);
        setCandidats(nouEstat.candidats);
        setPosicions(nouEstat.posicions.map(p => ({
          ...p,
          placesDisponibles: nouEstat.placesIndividuals
            .filter(pl => pl.posicioId === p.id && pl.estat === 'lliure')
            .length
        })));
        
        // NUEVO: Actualizar estadísticas globales
        const stats = procesRondes.obtenirEstadistiquesGlobals();
        setEstadistiquesGlobals(stats);
      }
      return resultat;
    }
    return false;
  }, [procesRondes]);

  // Obtener estadísticas del sistema de rondas
  const obtenirEstadistiques = useCallback(() => {
    return procesRondes ? procesRondes.obtenirEstadistiques() : {};
  }, [procesRondes]);

  // NUEVO: Obtener estadísticas globales
  const obtenirEstadistiquesGlobals = useCallback(() => {
    if (procesRondes) {
      return procesRondes.obtenirEstadistiquesGlobals();
    }
    
    // Si no hay proceso activo, calcular estadísticas básicas
    const stats = {
      candidatsTotals: candidats.length,
      candidatsPendent: candidats.filter(c => c.estat === 'pendent').length,
      candidatsRespost: candidats.filter(c => c.estat === 'respost').length,
      candidatsAdjudicat: candidats.filter(c => c.estat === 'adjudicat').length,
      candidatsContractat: candidats.filter(c => c.estat === 'contractat').length,
      candidatsRebutjat: candidats.filter(c => c.estat === 'rebutjat').length,
      placesTotals: posicions.reduce((acc, p) => acc + p.placesInicials, 0),
      placesOcupades: posicions.reduce((acc, p) => acc + (p.placesInicials - p.placesDisponibles), 0),
      placesLliures: posicions.reduce((acc, p) => acc + p.placesDisponibles, 0),
      placesPendents: 0,
      adjudicacionsTotals: adjudicacions.length,
      adjudicacionsPendents: adjudicacions.filter(a => a.estat === 'pendent').length,
      adjudicacionsAcceptades: adjudicacions.filter(a => a.estat === 'acceptat').length,
      adjudicacionsRebutjades: adjudicacions.filter(a => a.estat === 'rebutjat').length,
      procesActiu: false,
      grupsActius: 0,
      grupsTotals: 0,
      taxaAcceptacio: adjudicacions.length > 0 
        ? Math.round((adjudicacions.filter(a => a.estat === 'acceptat').length / adjudicacions.length) * 100)
        : 0,
      posicionsDetall: posicions.map(pos => ({
        ...pos,
        placesLliures: pos.placesDisponibles,
        placesPendents: 0,
        placesOcupades: pos.placesInicials - pos.placesDisponibles,
        candidatsInteressats: candidats.filter(c => 
          c.prioritats && c.prioritats.some(p => p.posicioId === pos.id)
        ).length,
        adjudicacionsPendents: 0
      }))
    };
    
    return stats;
  }, [candidats, posicions, procesRondes]);

  const seleccionarPrioritat = useCallback((candidatId, posicioId) => {
    const candidat = candidats.find(c => c.id === candidatId);
    if (!candidat) return;

    const { existe, puedeAgregar, indexExistent } = validarSeleccioPrioritat(candidat, posicioId);
    const nouvesPrioritats = [...(candidat.prioritats || [])];
    
    if (existe) {
      // Eliminar
      nouvesPrioritats.splice(indexExistent, 1);
      // Reordenar prioritats
      nouvesPrioritats.forEach((p, index) => {
        p.prioritat = index + 1;
      });
    } else if (puedeAgregar) {
      // Afegir
      nouvesPrioritats.push({ posicioId, prioritat: nouvesPrioritats.length + 1 });
    }

    const candidatsActualitzats = candidats.map(c => 
      c.id === candidatId 
        ? { ...c, prioritats: nouvesPrioritats, estat: 'respost' }
        : c
    );
    setCandidats(candidatsActualitzats);
    
    if (candidatActual && candidatActual.id === candidatId) {
      setCandidatActual({ ...candidat, prioritats: nouvesPrioritats, estat: 'respost' });
    }
  }, [candidats, candidatActual]);

  const reordenarPrioritats = useCallback((candidatId, novesPrioritats) => {
    const candidatsActualitzats = candidats.map(c => 
      c.id === candidatId 
        ? { ...c, prioritats: novesPrioritats }
        : c
    );
    setCandidats(candidatsActualitzats);
    
    if (candidatActual && candidatActual.id === candidatId) {
      const candidat = candidats.find(c => c.id === candidatId);
      setCandidatActual({ ...candidat, prioritats: novesPrioritats });
    }
  }, [candidats, candidatActual]);

  const generarPDF = useCallback(() => {
    // Usar adjudicaciones del sistema de rondas si están disponibles
    const adjudicacions = estatRondes?.adjudicacions || [];
    generarInformePDF(adjudicacions, candidats, posicions);
  }, [candidats, posicions, estatRondes]);

  // Computed values
  const adjudicacions = estatRondes?.adjudicacions || [];
  const estadistiques = calcularEstatistiques(candidats, posicions, adjudicacions);

  const value = {
    // Estados principales
    candidats,
    posicions,
    vistaActual,
    candidatActual,
    procesEnMarxa,
    adjudicacions,
    notificacionsEnviades,
    mostrarPosicions,
    draggedItem,
    estadistiques,
    estadistiquesGlobals, // NUEVO

    // Estados del sistema de rondas
    sistemaRondes,
    procesRondes,
    estatRondes,

    // Setters
    setCandidats,
    setPosicions,
    setVistaActual,
    setCandidatActual,
    setProcesEnMarxa,
    setNotificacionsEnviades,
    setMostrarPosicions,
    setDraggedItem,
    setSistemaRondes,
    setProcesRondes,
    setEstatRondes,
    setEstadistiquesGlobals, // NUEVO

    // Actions
    enviarNotificacions,
    iniciarAdjudicacio,
    acceptarAdjudicacio,
    rebutjarAdjudicacio,
    obtenirEstadistiques,
    obtenirEstadistiquesGlobals, // NUEVO
    seleccionarPrioritat,
    reordenarPrioritats,
    generarPDF,
    carregarCandidats,
    carregarPosicions
  };

  return (
    <AdjudicacioContext.Provider value={value}>
      {children}
    </AdjudicacioContext.Provider>
  );
};