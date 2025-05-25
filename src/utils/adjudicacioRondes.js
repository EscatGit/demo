// utils/adjudicacioRondes.js

export class AdjudicacioRondes {
  constructor(candidats, posicions) {
    this.candidats = [...candidats];
    this.posicions = [...posicions];
    this.grupsConcurrents = this.crearGrupsConcurrents();
    this.adjudicacions = [];
    this.placesIndividuals = this.crearPlacesIndividuals();
  }

  // Crear grupos concurrentes por categoría
  crearGrupsConcurrents() {
    const grups = {};
    
    this.candidats.forEach(candidat => {
      if (!grups[candidat.categoria]) {
        grups[candidat.categoria] = {
          categoria: candidat.categoria,
          nom: `${candidat.categoria}-1`,
          rondaActual: 1,
          candidatsActius: [],
          adjudicacionsPendents: [],
          estatRonda: 'preparant',
          dataIniciFase: null
        };
      }
      
      // Solo incluir candidatos que han respondido
      if (candidat.estat === 'respost') {
        grups[candidat.categoria].candidatsActius.push(candidat.id);
      }
    });

    return grups;
  }

  // Crear plazas individuales con estado
  crearPlacesIndividuals() {
    const places = [];
    
    this.posicions.forEach(posicio => {
      for (let i = 0; i < posicio.placesInicials; i++) {
        places.push({
          id: `${posicio.id}-${i + 1}`,
          posicioId: posicio.id,
          numeroPlaca: i + 1,
          estat: 'lliure',
          candidatAssignat: null,
          adjudicacioId: null,
          categoria: posicio.categoria
        });
      }
    });

    return places;
  }

  // Iniciar proceso de adjudicación para todos los grupos
  iniciarAdjudicacio() {
    // CAMBIO 1: Marcar candidatos "pendent" como "rebutjat"
    this.candidats.forEach(candidat => {
      if (candidat.estat === 'pendent') {
        candidat.estat = 'desqualificat';
        console.log(`${candidat.nom} passa a estat 'desqualificat' per no haver expressat prioritats`);
      }
    });

    // Iniciar proceso para cada grupo
    Object.values(this.grupsConcurrents).forEach(grup => {
      if (grup.candidatsActius.length > 0) {
        grup.estatRonda = 'processant';
        grup.dataIniciFase = new Date();
        this.processarRondaGrup(grup);
      }
    });
  }

  // Procesar una ronda para un grupo específico
  processarRondaGrup(grup) {
    console.log(`Processant ronda ${grup.rondaActual} per ${grup.nom}`);
    
    // Obtener candidatos activos del grupo ordenados por puntuación
    const candidatsGrup = grup.candidatsActius
      .map(id => this.candidats.find(c => c.id === id))
      .filter(c => c && c.estat !== 'contractat' && c.estat !== 'rebutjat')
      .sort((a, b) => b.puntuacio - a.puntuacio);

    let algunaAssignacio = false;
    let algunaPendent = false;
    
    // Procesar candidatos uno por uno en orden de puntuación
    for (const candidat of candidatsGrup) {
      // Si el candidato ya tiene una adjudicación pendiente, no evaluar más
      if (candidat.estat === 'adjudicat') {
        algunaPendent = true;
        continue;
      }

      // CAMBIO 2: Evaluar TODAS las preferencias desde la primera
      let assignat = false;
      let esperantPlacaPendent = false;

      for (let i = 0; i < candidat.prioritats.length; i++) {
        const preferencia = candidat.prioritats[i];
        
        // Verificar si hay plaza libre
        const placaDisponible = this.buscarPlacaDisponible(preferencia.posicioId, grup.categoria);
        
        if (placaDisponible) {
          // Asignar la plaza
          this.assignarPlaca(placaDisponible, candidat, preferencia, grup);
          assignat = true;
          algunaAssignacio = true;
          break;
        } else {
          // No hay plaza libre, verificar si hay plazas pendientes
          const placaPendent = this.buscarPlacaPendent(preferencia.posicioId, grup.categoria);
          
          if (placaPendent) {
            // Hay plaza pendiente, debe esperar
            console.log(`${candidat.nom} espera plaza pendent en ${preferencia.posicioId} (preferència ${preferencia.prioritat})`);
            esperantPlacaPendent = true;
            algunaPendent = true;
            break; // No evaluar más preferencias
          }
          // Si no hay plaza libre ni pendiente, continuar con la siguiente preferencia
        }
      }

      // Si no se asignó ninguna plaza y no está esperando
      if (!assignat && !esperantPlacaPendent) {
        // El candidato no tiene más opciones disponibles
        candidat.estat = 'rebutjat';
        this.eliminarCandidatDelGrup(grup, candidat.id);
        console.log(`${candidat.nom} passa a estat 'rebutjat' - sense opcions disponibles`);
      }
    }

    // Determinar siguiente estado del grupo
    if (grup.adjudicacionsPendents.length > 0) {
      grup.estatRonda = 'esperant_confirmacions';
      grup.dataIniciFase = new Date();
      console.log(`Grup ${grup.nom} esperant ${grup.adjudicacionsPendents.length} confirmacions`);
    } else if (algunaPendent) {
      // Hay candidatos esperando plazas pendientes de otras rondas
      console.log(`Grup ${grup.nom} té candidats esperant places pendents`);
      // Programar verificación periódica
      setTimeout(() => this.verificarContinuitatGrup(grup), 5000);
    } else if (algunaAssignacio) {
      // Se hicieron asignaciones, preparar siguiente ronda
      grup.rondaActual++;
      grup.estatRonda = 'processant';
      setTimeout(() => this.processarRondaGrup(grup), 100);
    } else {
      // No hay más candidatos activos o no se pueden hacer más asignaciones
      grup.estatRonda = 'finalitzada';
      console.log(`Grup ${grup.nom} finalitzat`);
    }
  }

  // Buscar plaza libre para una posición
  buscarPlacaDisponible(posicioId, categoria) {
    return this.placesIndividuals.find(placa => 
      placa.posicioId === posicioId && 
      placa.categoria === categoria &&
      placa.estat === 'lliure'
    );
  }

  // Buscar plaza pendiente de confirmación
  buscarPlacaPendent(posicioId, categoria) {
    return this.placesIndividuals.find(placa => 
      placa.posicioId === posicioId && 
      placa.categoria === categoria &&
      placa.estat === 'pendent'
    );
  }

  // Asignar plaza a candidato
  assignarPlaca(placa, candidat, preferencia, grup) {
    const adjudicacio = {
      id: `adj_${Date.now()}_${candidat.id}`,
      candidatId: candidat.id,
      posicioId: preferencia.posicioId,
      placaId: placa.id,
      ronda: grup.rondaActual,
      preferencia: preferencia.prioritat,
      estat: 'pendent',
      dataAdjudicacio: new Date(),
      dataLimitAcceptacio: new Date(Date.now() + 24 * 60 * 60 * 1000),
      grupConcurrent: grup.nom
    };

    // Actualizar estado de la plaza
    placa.estat = 'pendent';
    placa.candidatAssignat = candidat.id;
    placa.adjudicacioId = adjudicacio.id;

    // Actualizar estado del candidato
    candidat.estat = 'adjudicat';
    candidat.posicioAdjudicada = preferencia.posicioId;

    // Agregar a adjudicaciones
    this.adjudicacions.push(adjudicacio);
    grup.adjudicacionsPendents.push(adjudicacio.id);

    console.log(`Assignada plaza ${placa.id} a ${candidat.nom} (preferència ${preferencia.prioritat}, ronda ${grup.rondaActual})`);

    // Programar timeout automático
    this.programarTimeout(adjudicacio);
  }

  // Programar timeout automático para rechazo
  programarTimeout(adjudicacio) {
    setTimeout(() => {
      if (adjudicacio.estat === 'pendent') {
        this.rebutjarAdjudicacio(adjudicacio.id, true);
      }
    }, 24 * 60 * 60 * 1000);
  }

  // Acceptar adjudicación
  acceptarAdjudicacio(adjudicacioId) {
    const adjudicacio = this.adjudicacions.find(a => a.id === adjudicacioId);
    if (!adjudicacio || adjudicacio.estat !== 'pendent') return false;

    const candidat = this.candidats.find(c => c.id === adjudicacio.candidatId);
    const placa = this.placesIndividuals.find(p => p.id === adjudicacio.placaId);
    const grup = this.grupsConcurrents[candidat.categoria];

    // Actualizar estados
    adjudicacio.estat = 'acceptat';
    candidat.estat = 'contractat';
    placa.estat = 'ocupada';

    // Eliminar de adjudicaciones pendientes del grupo
    grup.adjudicacionsPendents = grup.adjudicacionsPendents.filter(id => id !== adjudicacioId);
    this.eliminarCandidatDelGrup(grup, candidat.id);

    console.log(`${candidat.nom} ha acceptat la plaza ${placa.id}`);

    // Verificar si el grupo puede continuar
    this.verificarContinuitatGrup(grup);
    return true;
  }

  // Rechazar adjudicación
  rebutjarAdjudicacio(adjudicacioId, automatic = false) {
    const adjudicacio = this.adjudicacions.find(a => a.id === adjudicacioId);
    if (!adjudicacio || adjudicacio.estat !== 'pendent') return false;

    const candidat = this.candidats.find(c => c.id === adjudicacio.candidatId);
    const placa = this.placesIndividuals.find(p => p.id === adjudicacio.placaId);
    const grup = this.grupsConcurrents[candidat.categoria];

    // Actualizar estados
    adjudicacio.estat = 'rebutjat';
    candidat.estat = 'rebutjat';
    placa.estat = 'lliure'; // IMPORTANTE: La plaza vuelve a estar libre
    placa.candidatAssignat = null;
    placa.adjudicacioId = null;

    // Eliminar de adjudicaciones pendientes del grupo
    grup.adjudicacionsPendents = grup.adjudicacionsPendents.filter(id => id !== adjudicacioId);
    this.eliminarCandidatDelGrup(grup, candidat.id);

    console.log(`${candidat.nom} ha rebutjat la plaza ${placa.id} ${automatic ? '(automàtic)' : ''}`);
    console.log(`Plaza ${placa.id} torna a estar lliure`);

    // IMPORTANTE: Notificar a otros grupos que podrían estar esperando esta plaza
    this.notificarPlazaLliure(placa);

    // Verificar si el grupo puede continuar
    this.verificarContinuitatGrup(grup);
    return true;
  }

  // Notificar que una plaza está libre a grupos que podrían estar esperándola
  notificarPlazaLliure(placa) {
    Object.values(this.grupsConcurrents).forEach(grup => {
      if (grup.categoria === placa.categoria && 
          grup.estatRonda === 'processant' || 
          grup.estatRonda === 'esperant_confirmacions') {
        // Re-evaluar el grupo por si hay candidatos esperando esta plaza
        console.log(`Notificant a grup ${grup.nom} que plaza ${placa.id} està lliure`);
        setTimeout(() => this.verificarContinuitatGrup(grup), 1000);
      }
    });
  }

  // Eliminar candidato del grupo activo
  eliminarCandidatDelGrup(grup, candidatId) {
    grup.candidatsActius = grup.candidatsActius.filter(id => id !== candidatId);
  }

  // Verificar si el grupo puede continuar con la siguiente ronda
  verificarContinuitatGrup(grup) {
    // Si el grupo ya está finalizado, no hacer nada
    if (grup.estatRonda === 'finalitzada') return;

    // Si hay adjudicaciones pendientes, esperar
    if (grup.adjudicacionsPendents.length > 0) {
      grup.estatRonda = 'esperant_confirmacions';
      return;
    }

    // Si no hay candidatos activos, finalizar
    if (grup.candidatsActius.length === 0) {
      grup.estatRonda = 'finalitzada';
      console.log(`Grup ${grup.nom} finalitzat - sense candidats actius`);
      return;
    }

    // Si estaba esperando confirmaciones y ya no hay pendientes, continuar
    if (grup.estatRonda === 'esperant_confirmacions') {
      grup.rondaActual++;
      grup.estatRonda = 'processant';
      grup.dataIniciFase = new Date();
      console.log(`Grup ${grup.nom} continua amb ronda ${grup.rondaActual}`);
      setTimeout(() => this.processarRondaGrup(grup), 1000);
    } else {
      // Re-procesar el grupo actual por si hay nuevas plazas libres
      grup.estatRonda = 'processant';
      setTimeout(() => this.processarRondaGrup(grup), 1000);
    }
  }

  // Obtener estado actual del proceso
  obtenirEstatActual() {
    return {
      grupsConcurrents: this.grupsConcurrents,
      adjudicacions: this.adjudicacions,
      placesIndividuals: this.placesIndividuals,
      candidats: this.candidats,
      posicions: this.posicions
    };
  }

  // Obtener estadísticas del proceso
  obtenirEstadistiques() {
    const stats = {};
    
    Object.values(this.grupsConcurrents).forEach(grup => {
      const adjudicacionsGrup = this.adjudicacions.filter(a => a.grupConcurrent === grup.nom);
      
      stats[grup.nom] = {
        categoria: grup.categoria,
        rondaActual: grup.rondaActual,
        estatRonda: grup.estatRonda,
        candidatsActius: grup.candidatsActius.length,
        adjudicacionsPendents: grup.adjudicacionsPendents.length,
        adjudicacionsAcceptades: adjudicacionsGrup.filter(a => a.estat === 'acceptat').length,
        adjudicacionsRebutjades: adjudicacionsGrup.filter(a => a.estat === 'rebutjat').length,
        placesOcupades: this.placesIndividuals.filter(p => p.categoria === grup.categoria && p.estat === 'ocupada').length,
        placesPendents: this.placesIndividuals.filter(p => p.categoria === grup.categoria && p.estat === 'pendent').length,
        placesLliures: this.placesIndividuals.filter(p => p.categoria === grup.categoria && p.estat === 'lliure').length
      };
    });

    return stats;
  }

  // Obtener estadísticas globales detalladas
  obtenirEstadistiquesGlobals() {
    const estadistiques = {
      // Candidatos por estado
      candidatsTotals: this.candidats.length,
      candidatsPendent: this.candidats.filter(c => ['pendent', 'desqualificat'].includes(c.estat)).length,
      candidatsRespost: this.candidats.filter(c => ['respost', 'adjudicat', 'contractat', 'rebutjat'].includes(c.estat)).length,
      candidatsAdjudicat: this.candidats.filter(c => c.estat === 'adjudicat').length,
      candidatsContractat: this.candidats.filter(c => c.estat === 'contractat').length,
      candidatsRebutjat: this.candidats.filter(c => c.estat === 'rebutjat').length,
	  candidatsDesqualificat: this.candidats.filter(c => c.estat === 'desqualificat').length,
      
      // Plazas por estado
      placesTotals: this.placesIndividuals.length,
      placesLliures: this.placesIndividuals.filter(p => p.estat === 'lliure').length,
      placesPendents: this.placesIndividuals.filter(p => p.estat === 'pendent').length,
      placesOcupades: this.placesIndividuals.filter(p => p.estat === 'ocupada').length,
      
      // Adjudicaciones
      adjudicacionsTotals: this.adjudicacions.length,
      adjudicacionsPendents: this.adjudicacions.filter(a => a.estat === 'pendent').length,
      adjudicacionsAcceptades: this.adjudicacions.filter(a => a.estat === 'acceptat').length,
      adjudicacionsRebutjades: this.adjudicacions.filter(a => a.estat === 'rebutjat').length,
      
      // Proceso
      procesActiu: Object.values(this.grupsConcurrents).some(g => 
        g.estatRonda === 'processant' || g.estatRonda === 'esperant_confirmacions'
      ),
      grupsActius: Object.values(this.grupsConcurrents).filter(g => 
        g.estatRonda !== 'finalitzada'
      ).length,
      grupsTotals: Object.keys(this.grupsConcurrents).length,
      
      // Ratio de éxito
      taxaAcceptacio: this.adjudicacions.length > 0 
        ? Math.round((this.adjudicacions.filter(a => a.estat === 'acceptat').length / this.adjudicacions.length) * 100)
        : 0,
      
      // Por posición (para actualizar PosicionsTempsReal)
      posicionsDetall: this.posicions.map(pos => {
        const placesPos = this.placesIndividuals.filter(p => p.posicioId === pos.id);
        return {
          ...pos,
          placesLliures: placesPos.filter(p => p.estat === 'lliure').length,
          placesPendents: placesPos.filter(p => p.estat === 'pendent').length,
          placesOcupades: placesPos.filter(p => p.estat === 'ocupada').length,
          placesDisponibles: placesPos.filter(p => p.estat === 'lliure').length,
          candidatsInteressats: this.candidats.filter(c => 
            c.prioritats && c.prioritats.some(p => p.posicioId === pos.id)
          ).length,
          adjudicacionsPendents: this.adjudicacions.filter(a => 
            a.posicioId === pos.id && a.estat === 'pendent'
          ).length
        };
      })
    };

    return estadistiques;
  }
}