# Claude Prompts für Heroranker

Dieses Verzeichnis enthält spezialisierte Systemprompts für verschiedene Entwicklungsaufgaben im Heroranker-Projekt.

## Verfügbare Prompts

### 1. World Generator (`world-generator.md`)
**Zweck**: Spezialisierter Prompt für die Entwicklung von Weltgenerierungs-Features

**Verwendung**:
- Prozedurale Karten- und Weltgenerierung
- Biome und Terrain-Systeme
- AI-gestützte Lore-Erstellung
- Charaktergenerierung mit Gemini AI
- Asset-Integration (Bilder, Sprites, Videos)

**Hauptfokus**:
- High-Tech Arcade Design-System
- React + TypeScript + Tailwind
- @google/genai Integration
- Effiziente Code-Patterns für prozedurale Generation

**Beispiel-Anwendungen**:
```typescript
// Welt generieren
const world = await generateWorld(seed, {
  size: 100,
  biomeTypes: ['desert', 'forest', 'mountain'],
  resourceDensity: 'medium'
});

// Charakter erstellen
const hero = await generateCharacter("cyberpunk ninja with neon katana");
```

## Nutzung mit Claude

### Option 1: Claude Code (Desktop)
1. Kopiere den Prompt-Inhalt
2. Füge ihn als System-Kontext in deine Konversation ein
3. Starte mit deiner spezifischen Anfrage

### Option 2: Claude Web/API
```javascript
const response = await anthropic.messages.create({
  model: "claude-sonnet-4.5",
  system: fs.readFileSync('.claude/prompts/world-generator.md', 'utf-8'),
  messages: [{
    role: "user",
    content: "Erstelle ein prozedurales Kartensystem mit 5 Biomen"
  }]
});
```

### Option 3: Als Custom Instruction
Verwende den Prompt als "Custom Instructions" in deinem bevorzugten Claude-Interface.

## Projekt-Kontext

**Technologie-Stack**:
- React 18.3.1 + TypeScript 5.9.3
- Vite 7.3.0
- Tailwind CSS
- @google/genai 1.34.0
- @supabase/supabase-js 2.89.0

**Design-System**:
- Style: "High-Tech Arcade"
- Farben: Cyan, Gold, Void, Clean White
- Effekte: Neon Glow, Glassmorphismus
- Fonts: Inter, Bangers, Rajdhani

## Erweiterung

Füge neue Prompts für spezifische Use-Cases hinzu:
- `combat-system.md` - Kampfsystem-Entwicklung
- `economy-balance.md` - Wirtschafts-Balancing
- `ui-components.md` - UI/UX-Komponenten
- `ai-characters.md` - KI-Charakter-Persönlichkeiten

## Best Practices

1. **Kontext bereitstellen**: Füge immer relevante Files als Kontext hinzu
2. **Spezifisch sein**: Je präziser die Anfrage, desto besser das Ergebnis
3. **Iterativ arbeiten**: Kleine Schritte, dann verfeinern
4. **Design-System nutzen**: Immer Semantic Tokens verwenden
5. **Parallel denken**: Batch-Operations wo möglich

## Feedback & Verbesserungen

Wenn ein Prompt verbessert werden sollte:
1. Dokumentiere das Problem
2. Schlage eine Verbesserung vor
3. Teste die neue Version
4. Update den Prompt

---

**Ziel**: Effiziente, konsistente und hochwertige Code-Generierung für Heroranker.
