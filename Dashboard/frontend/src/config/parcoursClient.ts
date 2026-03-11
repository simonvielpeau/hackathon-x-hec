export interface ParcoursGroup {
  id: string
  label: string
  /** Clé pour matcher avec les données (group dans data.json). Si absent, utilise label. */
  dataGroup?: string
  tags: string[]
}

export interface ParcoursPhase {
  id: string
  label: string
  description: string
  groups: ParcoursGroup[]
}

export const PARCOURS_PHASES: ParcoursPhase[] = [
  {
    id: 'anticipation',
    label: 'Anticipation et Planification',
    description:
      "Cette étape initiale correspond à la découverte de l'offre et à la préparation de la visite.",
    groups: [
      {
        id: 'explorer',
        label: 'Explorer / Déclencher',
        dataGroup: 'Explorer/Déclencher',
        tags: [
          'Publicité',
          'Communications ciblées',
          'Humains',
          'Site web / App mobile',
          'CRC (centre relation client)',
        ],
      },
    ],
  },
  {
    id: 'approche',
    label: 'Approche et Accueil',
    description:
      "Cette phase couvre le trajet, l'entrée physique dans l'établissement et la prise de repères.",
    groups: [
      {
        id: 'deplacer',
        label: 'Se déplacer',
        tags: [
          'Accessibilité/Circulation arrivée',
          'Signalisation routière arrivée',
          'Mode de transport aller (taxi, auto, groupe autobus, vélo)',
          'Groupe autobus arrivée',
        ],
      },
      {
        id: 'arriver',
        label: 'Arriver (extérieur/intérieur)',
        tags: [
          'Allée/Marquise',
          'Signalisation',
          'Stationnement arrivée',
          'Entrée',
          'Sécurité',
          'Vestiaire arrivée',
        ],
      },
      {
        id: 'debuter',
        label: 'Débuter sa visite',
        tags: [
          'SDB',
          'Explorer',
          'Club CP',
          'Comptoir SAC',
          'Bornes/app mobile',
        ],
      },
    ],
  },
  {
    id: 'coeur',
    label: "Cœur de l'Expérience",
    description:
      "Il s'agit de l'activité principale liée aux jeux de hasard et d'argent (JHA) et à la gestion des gains.",
    groups: [
      {
        id: 'jouer',
        label: 'Jouer (JHA)',
        tags: [
          'Service de consommation',
          'Loterie',
          'Pari sportif',
          'Poker',
          'Zone',
          'TDJ (Table de jeux)',
          'MAS (Machine à sous)',
          'AJE (appareils de jeux électroniques)',
        ],
      },
      {
        id: 'gagner',
        label: 'Gagner',
        tags: ['Affichage', 'Réclamation', 'Célébration'],
      },
    ],
  },
  {
    id: 'divertissement',
    label: 'Divertissement et Services',
    description:
      "Cette étape regroupe les services complémentaires qui enrichissent l'expérience globale du client.",
    groups: [
      {
        id: 'privileges-hm',
        label: 'Profiter des privilèges HM (Haute Mise)',
        dataGroup: 'Profiter des privilèges HM',
        tags: [
          'Comptoir HM (haute mise)',
          'Salon HM',
          'HE (haut exécutif) /CEL (concierge en ligne)',
          'Offres et événements exclusifs',
        ],
      },
      {
        id: 'divertir',
        label: 'Se divertir et socialiser',
        tags: [
          'Club',
          'Salle de spectacle',
          "Non JHA (jeux de hasard et d'argent)",
          'Promotions & événements',
          'Ambiance générale',
          'Spectacles gratuits',
          'Bars',
          'Restaurants',
        ],
      },
      {
        id: 'pause',
        label: 'Prendre une pause',
        tags: [
          'Fumoir',
          'Station libre-service',
          'La Base',
          'Bien jouer',
        ],
      },
    ],
  },
  {
    id: 'sejour',
    label: 'Séjour Hôtelier (Optionnel)',
    description:
      "Cette phase est spécifique aux clients prolongeant leur expérience au sein du complexe hôtelier.",
    groups: [
      {
        id: 'sejourner',
        label: 'Séjourner dans un complexe',
        tags: [
          'Valet',
          'Réception',
          'Chambre',
          'Restos, bars et salons',
          'Activités',
          'Congrès/Banquet',
          'Employés séjour dans un complexe',
        ],
      },
    ],
  },
  {
    id: 'conclusion',
    label: 'Conclusion et Sortie',
    description:
      "La phase finale concerne la clôture de la visite et le départ physique de l'établissement.",
    groups: [
      {
        id: 'terminer',
        label: 'Terminer sa visite',
        tags: [
          'Employés fin de visite',
          'Caisse/GCP départ',
          'Vestiaire départ',
          'Sortie',
          'Votie',
        ],
      },
      {
        id: 'quitter',
        label: 'Quitter',
        tags: [
          'Stationnement départ',
          'Groupe autobus départ',
          'Mode de transport retour (taxi, auto, groupe autobus, vélo)',
          'Signalisation routière départ',
          'Accessibilité/Circulation départ',
        ],
      },
    ],
  },
]
