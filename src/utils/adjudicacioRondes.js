export class AdjudicacioRondes {
  constructor(candidats, posicions) {
    this.candidats = [...candidats];
    this.posicions = [...posicions];
    this.grupsConcurrents = this.crearGrupsConcurrents();
    this.adjudicacions = [];
    this.placesIndividuals = this.crearPlacesIndividuals();
  }

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
      
      if (candidat.estat === 'respost') {
        grups[candidat.categoria].candidatsActius.push(candidat.id);
      }
    });

    return grups;
  }

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

  iniciarAdjudicacio() {
    this.candidats.forEach(candidat => {
      if (candidat.estat === 'pendent') {
        candidat.estat = 'desqualificat';
        console.log(`${candidat.nom} passa a estat 'desqualificat' per no haver expressat prioritats`);
      }
    });

    Object.values(this.grupsConcurrents).forEach(grup => {
      if (grup.candidatsActius.length > 0) {
        grup.estatRonda = 'processant';
        grup.dataIniciFase = new Date();
        this.processarRondaGrup(grup);
      }
    });
  }

  processarRondaGrup(grup) {
    console.log(`Processant ronda ${grup.rondaActual} per ${grup.nom}`);
    
    const candidatsGrup = grup.candidatsActius
      .map(id => this.candidats.find(c => c.id === id))
      .filter(c => c && c.estat !== 'contractat' && c.estat !== 'rebutjat')
      .sort((a, b) => b.puntuacio - a.puntuacio);

    let algunaAssignacio = false;
    let grupDeveEsperar = false;
    
    for (const candidat of candidatsGrup) {
      if (candidat.estat === 'adjudicat') {
        continue;
      }

      let assignat = false;

      for (let i = 0; i < candidat.prioritats.length; i++) {
        const preferencia = candidat.prioritats[i];
        
        const placaDisponible = this.buscarPlacaDisponible(preferencia.posicioId, grup.categoria);
        
        if (placaDisponible) {
          this.assignarPlaca(placaDisponible, candidat, preferencia, grup);
          assignat = true;
          algunaAssignacio = true;
          break;
        } else {
          const placaPendentDelGrup = this.buscarPlacaPendentDelGrup(preferencia.posicioId, grup);
          
          if (placaPendentDelGrup) {
            console.log(`${candidat.nom} troba plaza pendent del mateix grup en ${preferencia.posicioId} (preferència ${preferencia.prioritat})`);
            console.log(`GRUP ${grup.nom} ATURA la ronda ${grup.rondaActual} - esperant confirmacions internes`);
            grupDeveEsperar = true;
            break;
          }
          console.log(`${candidat.nom} - plaza ${preferencia.posicioId} ocupada/pendent d'altre grup - continuant amb següent preferència`);
        }
      }

      if (grupDeveEsperar) {
        break;
      }

      if (!assignat) {
        candidat.estat = 'rebutjat';
        this.eliminarCandidatDelGrup(grup, candidat.id);
        console.log(`${candidat.nom} passa a estat 'rebutjat' - sense opcions disponibles`);
      }
    }

    if (grup.adjudicacionsPendents.length > 0 || grupDeveEsperar) {
      grup.estatRonda = 'esperant_confirmacions';
      grup.dataIniciFase = new Date();
      console.log(`Grup ${grup.nom} esperant ${grup.adjudicacionsPendents.length} confirmacions`);
    } else if (algunaAssignacio) {
      grup.rondaActual++;
      grup.estatRonda = 'processant';
      setTimeout(() => this.processarRondaGrup(grup), 100);
    } else {
      grup.estatRonda = 'finalitzada';
      console.log(`Grup ${grup.nom} finalitzat`);
    }
  }

  buscarPlacaDisponible(posicioId, categoria) {
    return this.placesIndividuals.find(placa => 
      placa.posicioId === posicioId && 
      placa.categoria === categoria &&
      placa.estat === 'lliure'
    );
  }

  buscarPlacaPendentDelGrup(posicioId, grup) {
    return this.placesIndividuals.find(placa => 
      placa.posicioId === posicioId && 
      placa.categoria === grup.categoria &&
      placa.estat === 'pendent' &&
      grup.adjudicacionsPendents.includes(placa.adjudicacioId)
    );
  }

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

    placa.estat = 'pendent';
    placa.candidatAssignat = candidat.id;
    placa.adjudicacioId = adjudicacio.id;

    candidat.estat = 'adjudicat';
    candidat.posicioAdjudicada = preferencia.posicioId;

    this.adjudicacions.push(adjudicacio);
    grup.adjudicacionsPendents.push(adjudicacio.id);

    console.log(`Assignada plaza ${placa.id} a ${candidat.nom} (preferència ${preferencia.prioritat}, ronda ${grup.rondaActual})`);

    this.programarTimeout(adjudicacio);
  }

  programarTimeout(adjudicacio) {
    setTimeout(() => {
      if (adjudicacio.estat === 'pendent') {
        this.rebutjarAdjudicacio(adjudicacio.id, true);
      }
    }, 24 * 60 * 60 * 1000);
  }

  acceptarAdjudicacio(adjudicacioId) {
    const adjudicacio = this.adjudicacions.find(a => a.id === adjudicacioId);
    if (!adjudicacio || adjudicacio.estat !== 'pendent') return false;

    const candidat = this.candidats.find(c => c.id === adjudicacio.candidatId);
    const placa = this.placesIndividuals.find(p => p.id === adjudicacio.placaId);
    const grup = this.grupsConcurrents[candidat.categoria];

    adjudicacio.estat = 'acceptat';
    candidat.estat = 'contractat';
    placa.estat = 'ocupada';

    grup.adjudicacionsPendents = grup.adjudicacionsPendents.filter(id => id !== adjudicacioId);
    this.eliminarCandidatDelGrup(grup, candidat.id);

    console.log(`${candidat.nom} ha acceptat la plaza ${placa.id}`);

    this.verificarContinuitatGrup(grup);
    return true;
  }

  rebutjarAdjudicacio(adjudicacioId, automatic = false) {
    const adjudicacio = this.adjudicacions.find(a => a.id === adjudicacioId);
    if (!adjudicacio || adjudicacio.estat !== 'pendent') return false;

    const candidat = this.candidats.find(c => c.id === adjudicacio.candidatId);
    const placa = this.placesIndividuals.find(p => p.id === adjudicacio.placaId);
    const grup = this.grupsConcurrents[candidat.categoria];

    adjudicacio.estat = 'rebutjat';
    candidat.estat = 'rebutjat';
    placa.estat = 'lliure';
    placa.candidatAssignat = null;
    placa.adjudicacioId = null;

    grup.adjudicacionsPendents = grup.adjudicacionsPendents.filter(id => id !== adjudicacioId);
    this.eliminarCandidatDelGrup(grup, candidat.id);

    console.log(`${candidat.nom} ha rebutjat la plaza ${placa.id} ${automatic ? '(automàtic)' : ''}`);
    console.log(`Plaza ${placa.id} torna a estar lliure`);

    this.notificarPlazaLliure(placa);

    this.verificarContinuitatGrup(grup);
    return true;
  }

  notificarPlazaLliure(placa) {
    const grup = Object.values(this.grupsConcurrents).find(g => g.categoria === placa.categoria);
    
    if (grup && grup.estatRonda === 'esperant_confirmacions') {
      console.log(`Notificant a grup ${grup.nom} que plaza ${placa.id} està lliure`);
      setTimeout(() => this.verificarContinuitatGrup(grup), 1000);
    }
  }

  eliminarCandidatDelGrup(grup, candidatId) {
    grup.candidatsActius = grup.candidatsActius.filter(id => id !== candidatId);
  }

  verificarContinuitatGrup(grup) {
    if (grup.estatRonda === 'finalitzada') return;

    if (grup.adjudicacionsPendents.length > 0) {
      grup.estatRonda = 'esperant_confirmacions';
      return;
    }

    if (grup.candidatsActius.length === 0) {
      grup.estatRonda = 'finalitzada';
      console.log(`Grup ${grup.nom} finalitzat - sense candidats actius`);
      return;
    }

    grup.rondaActual++;
    grup.estatRonda = 'processant';
    grup.dataIniciFase = new Date();
    console.log(`Grup ${grup.nom} continua amb ronda ${grup.rondaActual}`);
    setTimeout(() => this.processarRondaGrup(grup), 1000);
  }

  obtenirEstatActual() {
    return {
      grupsConcurrents: this.grupsConcurrents,
      adjudicacions: this.adjudicacions,
      placesIndividuals: this.placesIndividuals,
      candidats: this.candidats,
      posicions: this.posicions
    };
  }

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

  obtenirEstadistiquesGlobals() {
    const estadistiques = {
      candidatsTotals: this.candidats.length,
      candidatsPendent: this.candidats.filter(c => ['pendent', 'desqualificat'].includes(c.estat)).length,
      candidatsRespost: this.candidats.filter(c => ['respost', 'adjudicat', 'contractat', 'rebutjat'].includes(c.estat)).length,
      candidatsAdjudicat: this.candidats.filter(c => c.estat === 'adjudicat').length,
      candidatsContractat: this.candidats.filter(c => c.estat === 'contractat').length,
      candidatsRebutjat: this.candidats.filter(c => c.estat === 'rebutjat').length,
      candidatsDesqualificat: this.candidats.filter(c => c.estat === 'desqualificat').length,
      
      placesTotals: this.placesIndividuals.length,
      placesLliures: this.placesIndividuals.filter(p => p.estat === 'lliure').length,
      placesPendents: this.placesIndividuals.filter(p => p.estat === 'pendent').length,
      placesOcupades: this.placesIndividuals.filter(p => p.estat === 'ocupada').length,
      
      adjudicacionsTotals: this.adjudicacions.length,
      adjudicacionsPendents: this.adjudicacions.filter(a => a.estat === 'pendent').length,
      adjudicacionsAcceptades: this.adjudicacions.filter(a => a.estat === 'acceptat').length,
      adjudicacionsRebutjades: this.adjudicacions.filter(a => a.estat === 'rebutjat').length,
      
      procesActiu: Object.values(this.grupsConcurrents).some(g => 
        g.estatRonda === 'processant' || 
        g.estatRonda === 'esperant_confirmacions'
      ),
      grupsActius: Object.values(this.grupsConcurrents).filter(g => 
        g.estatRonda !== 'finalitzada'
      ).length,
      grupsTotals: Object.keys(this.grupsConcurrents).length,
      
      taxaAcceptacio: this.adjudicacions.length > 0 
        ? Math.round((this.adjudicacions.filter(a => a.estat === 'acceptat').length / this.adjudicacions.length) * 100)
        : 0,
      
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
