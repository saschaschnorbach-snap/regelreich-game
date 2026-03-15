# PDF Notes (Vibe Coding Instructions V3)

PDF length: 8 pages (`kMDItemNumberOfPages = 8`).

- p1: Core world + 3 mandatory case files (Emma Pör/Empörung, Konrad Sens/Konsens, Didi Fam/Diffamierung).
  - Consequence: seed content and taxonomy must preserve these exact strategic anchors.
- p2: Host selection (Clara/Uwe), dialogic tone, non-punitive progression.
  - Consequence: backend model needs host identity + retry-friendly branching.
- p3: Fixed spatial progression across parts 1..5.
  - Consequence: scene IDs remain stable and ordered; cross-scene transitions are first-class.
- p4: Chapter pattern is fixed (intro -> examples -> activity1 -> activity2 -> summary).
  - Consequence: `step.type` added to encode structure and admin readability.
- p5: Strategy-specific didactic goals and neutral political framing.
  - Consequence: generated seed dialogs must focus on rhetoric patterns, not partisan position.
- p6: Mechanics include repeated attempts with explanatory feedback.
  - Consequence: seed contains retry loops (`wrong -> feedback -> retry -> task`).
- p7: Activity specifics require nuanced detection tasks.
  - Consequence: branching payload supports multi-step micro-flows per activity.
- p8: Tone/style constraints (light satire, professional, chat-like UI).
  - Consequence: chat-driven frontend and host response variants by choice.
