/**
 * Szenen-Konfiguration für alle 5 Teile (inkl. Teil 5 – Corner Office).
 * Default-Hintergrund: ein Bild für alle Teile; später pro Teil eigenes Bild möglich.
 */
const DEFAULT_BACKGROUND = '/backgrounds/default-scene.png'

export const SCENES = [
  {
    id: -1,
    name: 'Start',
    backgroundImage: '/backgrounds/Willkommen.png',
    backgroundPlaceholder: 'linear-gradient(180deg, #dff2ff 0%, #f7fcff 100%)',
    characters: [],
    speechBubbles: [],
    interaction: null,
  },
  {
    id: 0,
    name: 'Avatar wählen',
    backgroundImage: '/backgrounds/Willkommen.png',
    backgroundPlaceholder: 'linear-gradient(180deg, #dff2ff 0%, #f7fcff 100%)',
    characters: [],
    speechBubbles: [],
    interaction: null,
  },
  {
    id: 1,
    name: 'Außenansicht & Einstieg',
    backgroundImage: '/backgrounds/media-lab.png',
    backgroundPlaceholder: 'linear-gradient(160deg, #87CEEB 0%, #B0E0E6 50%, #E0F4FF 100%)',
    characters: [
      { id: 'clara', name: 'Klara Blick', avatarUrl: null, position: { x: '18%', y: '62%' }, align: 'left' },
      { id: 'uwe', name: 'Uwe-R. Blick', avatarUrl: null, position: { x: '72%', y: '62%' }, align: 'right' },
    ],
    speechBubbles: [
      { characterId: 'clara', speakerName: 'Clara', text: 'Willkommen vor dem Media Lab! Schön, dass ihr da seid. Hier startet euer Sommerpraktikum.', anchor: 'left' },
      { characterId: 'uwe', speakerName: 'Uwe-R.', text: 'Moment, noch Fragen – dann wählt erst mal, mit wem ihr arbeiten wollt.', anchor: 'right' },
    ],
    interaction: {
      options: [
        { id: 'a', label: 'Ja, lass uns starten!' },
        { id: 'b', label: 'Moment, noch Fragen.' },
      ],
    },
  },
  {
    id: 2,
    name: 'Keller – Erste Fallakte',
    backgroundImage: '/backgrounds/keller-scene.png',
    backgroundPlaceholder: 'linear-gradient(180deg, #2c2416 0%, #4a3f2a 40%, #3d3528 100%)',
    characters: [
      { id: 'host', name: 'Host', avatarUrl: null, position: { x: '35%', y: '65%' }, align: 'left' },
    ],
    speechBubbles: [
      { characterId: 'host', speakerName: 'Host', text: 'Im Keller geht es um Fallakte 1: Emma Pör. Hier liegt der Fokus auf emotionaler Zuspitzung – Stichwort Empörung.', anchor: 'left' },
    ],
    interaction: {
      options: [
        { id: 'ok', label: 'Verstanden. Klingt logisch.' },
        { id: 'frage', label: 'Moment, das klingt verdächtig nach Drama.' },
      ],
    },
  },
  {
    id: 3,
    name: 'Erdgeschoss – Zweite Fallakte',
    backgroundImage: '/backgrounds/open-office-scene.svg',
    backgroundPlaceholder: 'linear-gradient(170deg, #e8e4dc 0%, #d4cfc4 50%, #c4bfb4 100%)',
    characters: [
      { id: 'host', name: 'Host', avatarUrl: null, position: { x: '50%', y: '63%' }, align: 'left' },
    ],
    speechBubbles: [
      { characterId: 'host', speakerName: 'Host', text: 'Im Großraumbüro warten wir auf Fallakte 2: Konrad Sens. Thema: Mitläufereffekt und der Illusion von Konsens.', anchor: 'left' },
    ],
    interaction: {
      options: [
        { id: 'weiter', label: 'Weiter zum Auftrag!' },
        { id: 'kurz', label: 'Kurz zusammenfassen, bitte.' },
      ],
    },
  },
  {
    id: 4,
    name: 'Zweiter Stock – Dritte Fallakte',
    backgroundImage: '/backgrounds/private-office-scene.svg',
    backgroundPlaceholder: 'linear-gradient(165deg, #f5f3ef 0%, #e8e6e0 40%, #dcd8d0 100%)',
    characters: [
      { id: 'host', name: 'Host', avatarUrl: null, position: { x: '65%', y: '64%' }, align: 'right' },
    ],
    speechBubbles: [
      { characterId: 'host', speakerName: 'Host', text: 'Im Einzelbüro geht es um Didi Fam: Diskreditierung und Diffamierung. Angriffe auf Personen statt auf Argumente.', anchor: 'right' },
    ],
    interaction: {
      options: [
        { id: 'los', label: 'Alles klar, ich bin bereit.' },
        { id: 'beispiel', label: 'Zeig mir ein Beispiel.' },
      ],
    },
  },
  {
    id: 5,
    name: 'Corner Office – Abschluss',
    backgroundImage: '/backgrounds/kuppelsaal.png',
    backgroundPlaceholder: 'linear-gradient(150deg, #1a2a4a 0%, #2d4a6e 35%, #4a6fa5 70%, #87CEEB 100%)',
    characters: [
      { id: 'clara', name: 'Klara Blick', avatarUrl: null, position: { x: '25%', y: '62%' }, align: 'left' },
      { id: 'uwe', name: 'Uwe-R. Blick', avatarUrl: null, position: { x: '75%', y: '62%' }, align: 'right' },
    ],
    speechBubbles: [
      { characterId: 'clara', speakerName: 'Clara', text: 'Ihr habt alle drei Fallakten durchgearbeitet. Das Praktikum ist offiziell abgeschlossen.', anchor: 'left' },
      { characterId: 'uwe', speakerName: 'Uwe-R.', text: 'Wir bieten euch eine feste Stelle im Media Lab an. Was sagt ihr?', anchor: 'right' },
    ],
    interaction: {
      options: [
        { id: 'ja', label: 'Ja, sehr gerne!' },
        { id: 'überlegen', label: 'Ich überlege es mir.' },
      ],
    },
  },
]

export function getSceneById(id) {
  return SCENES.find((s) => s.id === Number(id)) ?? SCENES[0]
}
