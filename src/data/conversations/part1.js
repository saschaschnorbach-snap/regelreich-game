/**
 * Teil 1: Konversation mit drei Interaktionsschleifen (erfunden, Skript folgt später).
 * Jeder Schritt: Sprechblasen (Größe dynamisch nach Textumfang) + Antwortoptionen.
 * nextStep = Index des nächsten Schritts, nextPart = Wechsel zu anderem Teil.
 */
export const PART1_CONVERSATION = [
  {
    stepIndex: 0,
    speechBubbles: [
      {
        characterId: 'uwe',
        speakerName: 'Uwe-R. Blick',
        text: 'Ah. Du musst fürs Sommerpraktikum hier sein.\n\nIch bin Uwe-R. Blick. Ich beobachte, was zwischen den Zeilen passiert.',
        anchor: 'right',
      },
      {
        characterId: 'clara',
        speakerName: 'Clara Blick',
        text: 'Und ich bin Clara Blick. Ich sortiere, was davon übrig bleibt, wenn der Lärm weg ist.',
        anchor: 'left',
      },
      {
        characterId: 'clara',
        speakerName: 'Clara Blick',
        text: 'Wir haben schon auf Verstärkung gehofft – TikTalk produziert schneller Debatten, als wir Kaffee kochen können.',
        anchor: 'left',
      },
    ],
    options: [
      { id: 'workload', label: 'Das klingt nach viel Arbeit.', nextStep: 1 },
      { id: 'coffee', label: 'Ich hoffe, es gibt wenigstens guten Kaffee.', nextStep: 1 },
    ],
  },
  {
    stepIndex: 1,
    speechBubbles: [
      {
        characterId: 'uwe',
        speakerName: 'Uwe-R. Blick',
        text: 'Arbeit ja. Panik nein.',
        anchor: 'right',
        showOnOptionId: 'workload',
      },
      {
        characterId: 'clara',
        speakerName: 'Clara Blick',
        text: 'Wir analysieren Muster. Und Muster lassen sich sortieren.',
        anchor: 'left',
        showOnOptionId: 'workload',
      },
      {
        characterId: 'uwe',
        speakerName: 'Uwe-R. Blick',
        text: 'Der Kaffee ist solide.',
        anchor: 'right',
        showOnOptionId: 'coffee',
      },
      {
        characterId: 'clara',
        speakerName: 'Clara Blick',
        text: 'Aber spannender sind die Debatten.',
        anchor: 'left',
        showOnOptionId: 'coffee',
      },
    ],
    options: [
      { id: 'what_media_lab', label: 'Was genau macht das Media Lab?', nextStep: 2 },
    ],
  },
  {
    stepIndex: 2,
    speechBubbles: [
      {
        characterId: 'uwe',
        speakerName: 'Uwe-R. Blick',
        text: 'Wir beobachten TikTalk nicht wegen der Themen.',
        anchor: 'right',
        showOnOptionId: 'what_media_lab',
      },
      {
        characterId: 'clara',
        speakerName: 'Clara Blick',
        text: 'Sondern wegen der Dynamiken.',
        anchor: 'left',
        showOnOptionId: 'what_media_lab',
      },
      {
        characterId: 'uwe',
        speakerName: 'Uwe-R. Blick',
        text: 'In den letzten Monaten sind uns drei Profile besonders aufgefallen: Emma Pör. Konrad Sens. Didi Fam.',
        anchor: 'right',
      },
      {
        characterId: 'clara',
        speakerName: 'Clara Blick',
        text: 'Intern nennen wir sie die notorischen Drei.',
        anchor: 'left',
      },
    ],
    options: [
      { id: 'not_fanclub', label: 'Ich ahne, das ist kein Fanclub.', nextStep: 3 },
    ],
  },
  {
    stepIndex: 3,
    speechBubbles: [
      {
        characterId: 'uwe',
        speakerName: 'Uwe-R. Blick',
        text: 'Sie haben eines gemeinsam: Sie wissen genau, wie man Debatten verschiebt.',
        anchor: 'right',
      },
      {
        characterId: 'clara',
        speakerName: 'Clara Blick',
        text: 'Und genau deshalb gibt es zu jedem von ihnen eine eigene Fallakte.',
        anchor: 'left',
      },
    ],
    options: [
      { id: 'solve_cases', label: 'Und ich soll die lösen?', nextStep: 4 },
      { id: 'detective_work', label: 'Das klingt fast wie Detektivarbeit.', nextStep: 4 },
    ],
  },
  {
    stepIndex: 4,
    speechBubbles: [
      {
        characterId: 'uwe',
        speakerName: 'Uwe-R. Blick',
        text: 'Ganz so dramatisch ist es nicht.',
        anchor: 'right',
        showOnOptionId: 'solve_cases',
      },
      {
        characterId: 'clara',
        speakerName: 'Clara Blick',
        text: 'Aber ja. Du wirst ihre Strategien analysieren.',
        anchor: 'left',
        showOnOptionId: 'solve_cases',
      },
      {
        characterId: 'uwe',
        speakerName: 'Uwe-R. Blick',
        text: 'Mit weniger Trenchcoat.',
        anchor: 'right',
        showOnOptionId: 'detective_work',
      },
      {
        characterId: 'clara',
        speakerName: 'Clara Blick',
        text: 'Aber mit ähnlich viel Beobachtung.',
        anchor: 'left',
        showOnOptionId: 'detective_work',
      },
    ],
    options: [
      { id: 'what_do_i_get', label: 'Und was bekomme ich dafür?', nextStep: 5 },
    ],
  },
  {
    stepIndex: 5,
    speechBubbles: [
      {
        characterId: 'uwe',
        speakerName: 'Uwe-R. Blick',
        text: 'Du startest im Keller.',
        anchor: 'right',
      },
      {
        characterId: 'clara',
        speakerName: 'Clara Blick',
        text: 'Mit jeder abgeschlossenen Fallakte steigst du ein Stockwerk höher.',
        anchor: 'left',
      },
      {
        characterId: 'uwe',
        speakerName: 'Uwe-R. Blick',
        text: 'Vom Praktikum zur Analyse.',
        anchor: 'right',
      },
      {
        characterId: 'clara',
        speakerName: 'Clara Blick',
        text: 'Und am Ende ganz nach oben.',
        anchor: 'left',
      },
    ],
    options: [
      { id: 'real_progress', label: 'Also ein echter Aufstieg?', nextStep: 6 },
      { id: 'to_corner_office', label: 'Vom Keller ins Corner Office?', nextStep: 6 },
    ],
  },
  {
    stepIndex: 6,
    speechBubbles: [
      {
        characterId: 'uwe',
        speakerName: 'Uwe-R. Blick',
        text: 'So ist der Plan.',
        anchor: 'right',
        showOnOptionId: 'real_progress',
      },
      {
        characterId: 'clara',
        speakerName: 'Clara Blick',
        text: 'Kompetenz hat hier eine eigene Etagenstruktur.',
        anchor: 'left',
        showOnOptionId: 'real_progress',
      },
      {
        characterId: 'uwe',
        speakerName: 'Uwe-R. Blick',
        text: 'Exakt.',
        anchor: 'right',
        showOnOptionId: 'to_corner_office',
      },
      {
        characterId: 'clara',
        speakerName: 'Clara Blick',
        text: 'Wer Muster erkennt, kommt nach oben.',
        anchor: 'left',
        showOnOptionId: 'to_corner_office',
      },
    ],
    options: [
      { id: 'who_guides_me', label: 'Und wer begleitet mich?', nextStep: 7 },
    ],
  },
  {
    stepIndex: 7,
    speechBubbles: [
      {
        characterId: 'uwe',
        speakerName: 'Uwe-R. Blick',
        text: 'Du entscheidest.',
        anchor: 'right',
      },
      {
        characterId: 'clara',
        speakerName: 'Clara Blick',
        text: 'Wir arbeiten beide im Media Lab. Unterschiedlicher Stil. Gleicher Anspruch.',
        anchor: 'left',
      },
    ],
    options: [
      { id: 'clara', label: 'Clara Blick', nextStep: 8 },
      { id: 'uwe', label: 'Uwe-R. Blick', nextStep: 8 },
    ],
  },
  {
    stepIndex: 8,
    speechBubbles: [
      {
        characterId: 'host',
        speakerName: 'Host',
        text: 'Super! Dann kann es jetzt ja los gehen.',
        anchor: 'left',
      },
    ],
    options: [
      { id: 'finally', label: 'Na endlich!', nextPart: 2 },
      { id: 'what_awaits_me', label: 'Was mich wohl erwartet…', nextPart: 2 },
    ],
  },
]

export function getPart1Step(stepIndex) {
  return PART1_CONVERSATION[stepIndex] ?? PART1_CONVERSATION[0]
}
