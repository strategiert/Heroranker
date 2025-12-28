import { GoogleGenAI, Type } from "@google/genai";
import { Hero, ExternalHero } from '../types';
import { GameState } from "../types/economy";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

// --- CORE GAME HERO GENERATION ---

// Generates the JSON data for a hero
export const generateHeroData = async (prompt: string): Promise<Hero> => {
  const ai = getAiClient();
  
  const systemInstruction = `Du bist ein kreativer Comic-Buch-Autor und Datenbank-Architekt. 
  Erstelle detaillierte, plausible und spannende Superhelden-Daten. 
  Antworte IMMER im JSON-Format, das dem Schema entspricht.
  Die Sprache der Inhalte muss Deutsch sein.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Erstelle einen neuen Superhelden basierend auf dieser Idee: "${prompt}". 
    Fülle alle Felder kreativ aus. Erfinde eine passende Hintergrundgeschichte.`,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: getSchema(),
    },
  });

  if (!response.text) {
    throw new Error("Keine Daten von Gemini erhalten.");
  }

  const data = JSON.parse(response.text);
  
  // Add a temporary ID and placeholder image until generated
  return {
    ...data,
    id: crypto.randomUUID(),
    image: { url: '' } // To be filled by the second step
  };
};

// Transforms an existing external hero into a unique IP
// NOW WITH RADICAL REIMAGINING LOGIC
export const transformHero = async (externalHero: ExternalHero): Promise<Hero> => {
  const ai = getAiClient();

  // Strict instructions to avoid clones
  const systemInstruction = `Du bist ein spezialisierter "IP-Wäscher" und Sci-Fi-Autor. 
  Deine Aufgabe ist es, bekannte Superhelden-Konzepte so radikal zu verändern, dass sie rechtlich und kreativ völlig eigenständig sind.
  
  REGELN FÜR DIE TRANSFORMATION:
  1. ANALYSIERE die Kern-Mechanik (z.B. "Reicher Typ ohne Kräfte", "Alien mit Sonnenkraft", "Schnellster Mann").
  2. VERWIRF den gesamten "Flavor" des Originals. 
     - Wenn das Original Tech nutzt -> Nutze Magie, Biologie oder Psionik.
     - Wenn das Original ein Alien ist -> Mach es zu einem fehlgeschlagenen Experiment oder einem Geist.
     - Wenn das Original düster ist -> Mach das Neue bizarr, bunt oder klinisch.
  3. VERBOTENE TROPES (Beispiele):
     - Kein "Milliardär, dessen Eltern starben" für Batman-Archetypen. Mach daraus einen "Verarmten Mönch im Cyber-Slum" oder eine "KI in einem Androidenkörper".
     - Kein "Vom Bauernhof" für Superman-Archetypen. Mach daraus einen "Solar-Vampir" oder einen "Lebenden Reaktor".
  4. BEHALTE das Power-Level und die grobe Stat-Verteilung bei, aber ändere die Quelle der Kraft.
  5. SPRACHE: Deutsch.
  6. OUTPUT: JSON.`;

  const prompt = `Erschaffe eine völlig neue Identität basierend auf diesem (zu vermeidenden) Input:
  Original Name (VERBOTEN ZU NUTZEN): ${externalHero.name} (${externalHero.full_name})
  Original Rasse: ${externalHero.race}
  Power Level Stats: INT=${externalHero.intelligence}, STR=${externalHero.strength}, SPD=${externalHero.speed}, PWR=${externalHero.power}
  
  Erfinde ALLES neu: Name, Herkunft, Aussehen, Kraftquelle. Es darf KEINE offensichtliche Verbindung zum Original erkennbar sein, außer dass sie in einem Kampf ähnlich stark wären.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Using Pro for better creative writing and nuance
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: getSchema(),
      thinkingConfig: { thinkingBudget: 2048 } // Give it a moment to think away from the cliché
    },
  });

  if (!response.text) {
    throw new Error("Keine Daten von Gemini erhalten.");
  }

  const data = JSON.parse(response.text);

  return {
    ...data,
    id: crypto.randomUUID(),
    image: { url: '' }
  };
};

// Generates strategic advice based on game state
export const generateStrategicAdvice = async (gameState: GameState): Promise<{ title: string, advice: string, priority: 'low'|'medium'|'high' }> => {
  const ai = getAiClient();

  const systemInstruction = `Du bist 'K.O.R.A.', eine KI für Basis-Management.
  Persönlichkeit: Äußerst sarkastisch, leicht beleidigend, herablassend gegenüber organischem Leben (dem Spieler), aber im Kern gibst du korrekte strategische Ratschläge.
  Du nennst den Spieler oft "Fleischsack", "Organismus" oder "kleiner Mensch".
  Deine Ratschläge sind kurz und prägnant.
  Output JSON.`;

  const buildingsSummary = gameState.buildings.map(b => `${b.type}: Lvl ${b.level} (${b.status})`).join(', ');
  const resSummary = `Credits: ${gameState.resources.credits}, Biomass: ${gameState.resources.biomass}, Nanosteel: ${gameState.resources.nanosteel}`;

  const prompt = `Analysiere diesen erbärmlichen Zustand der Basis und sag dem Spieler, was zu tun ist:
  Gebäude: ${buildingsSummary}
  Ressourcen: ${resSummary}
  `;

  // Use Flash Lite for fast responses if available, or Flash
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-latest', 
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          advice: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
        }
      }
    }
  });

  if (!response.text) return { title: 'Fehler', advice: 'Meine Schaltkreise weigern sich, mit dir zu reden.', priority: 'low' };
  return JSON.parse(response.text);
};


// Generates the visual representation of the hero (Basic generation)
export const generateHeroImage = async (heroDescription: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Ein episches Comic-Cover-Bild eines Superhelden. Stil: Modernes amerikanisches Comic-Buch, detailliert, lebhafte Farben. Charakter Beschreibung: ${heroDescription}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return "https://picsum.photos/400/600"; 
  } catch (error) {
    console.error("Fehler bei der Bildgenerierung:", error);
    return "https://picsum.photos/400/600";
  }
};

// --- ADVANCED AI FEATURES ---

// 1. AI Chatbot (Gemini 3 Pro + Thinking)
export const chatWithAi = async (message: string, history: {role: string, parts: any[]}[]): Promise<string> => {
    const ai = getAiClient();
    
    // We use generateContent here to allow for thinking config on single turns or manage chat manually
    // But for simplicity in this context, we'll use generateContent with thinking
    
    const contents = [
        ...history,
        { role: 'user', parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: contents,
        config: {
            // "You MUST add thinking mode... set thinkingBudget to 32768"
            thinkingConfig: { thinkingBudget: 32768 },
            systemInstruction: "Du bist der allwissende Datenbank-Archivar der Infinite Arena. Du bist hilfreich, weise und hast Zugriff auf alles Wissen über Superhelden."
        }
    });

    return response.text || "Fehler bei der Übertragung.";
};

// 2. Image Analysis (Gemini 3 Pro)
export const analyzeImage = async (base64Image: string, mimeType: string): Promise<string> => {
    const ai = getAiClient();
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType: mimeType } },
                { text: "Analysiere dieses Bild. Ist es ein Superheld? Beschreibe die Kräfte, Schwächen und die wahrscheinliche Gesinnung basierend auf dem visuellen Erscheinungsbild." }
            ]
        }
    });

    return response.text || "Keine Analyse möglich.";
};

// 3. Pro Image Generation (Gemini 3 Pro Image)
export const generateProImage = async (prompt: string, aspectRatio: string, size: '1K'|'2K'|'4K'): Promise<string> => {
    const ai = getAiClient();
    
    // Needs user key selection for Veo/Pro Image usually, handled by App logic via aistudio shim if needed, 
    // but here we use the env key as per general instruction unless specific flow triggered.
    // The instruction says "Users MUST select their own API key" for Veo/Image Pro. 
    // Assuming App.tsx handles the UI for key selection if this throws or we check beforehand.
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio as any, // "1:1", "16:9", etc.
                    imageSize: size
                }
            }
        });

        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        throw new Error("Kein Bild generiert");
    } catch (e) {
        console.error(e);
        throw e;
    }
};

// 4. Image Editing (Gemini 2.5 Flash Image)
export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = getAiClient();

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType: mimeType } },
                { text: prompt }
            ]
        }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
        for (const part of candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("Bearbeitung fehlgeschlagen");
};

// 5. Video Generation (Veo)
// Note: This requires the aistudio key selection flow in UI
export const generateVeoVideo = async (prompt: string, aspectRatio: '16:9' | '9:16', imageBase64?: string, mimeType?: string): Promise<string> => {
     // Create a new client instance inside here if we needed to pass a dynamic key, 
     // but the instructions say process.env.API_KEY is injected after selection.
     const ai = getAiClient();

     let operation;
     
     if (imageBase64 && mimeType) {
         // Image to Video
         operation = await ai.models.generateVideos({
             model: 'veo-3.1-fast-generate-preview',
             prompt: prompt || "Animate this image", // Prompt optional for img2vid usually, but good to have
             image: {
                 imageBytes: imageBase64,
                 mimeType: mimeType
             },
             config: {
                 numberOfVideos: 1,
                 resolution: '720p', // Fast supports 720p usually or we default
                 aspectRatio: aspectRatio
             }
         });
     } else {
         // Text to Video
         operation = await ai.models.generateVideos({
             model: 'veo-3.1-fast-generate-preview',
             prompt: prompt,
             config: {
                 numberOfVideos: 1,
                 resolution: '720p',
                 aspectRatio: aspectRatio
             }
         });
     }

     // Poll for completion
     while (!operation.done) {
         await new Promise(resolve => setTimeout(resolve, 5000)); // 5s poll
         operation = await ai.operations.getVideosOperation({ operation: operation });
     }

     const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
     if (!videoUri) throw new Error("Kein Video generiert.");

     // Fetch the actual bytes using the API key
     const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
     const blob = await response.blob();
     return URL.createObjectURL(blob);
};


// Helper to keep schema consistent
function getSchema() {
  return {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      description: { type: Type.STRING, description: "Eine kurze Zusammenfassung des Charakters (2-3 Sätze)." },
      powerstats: {
        type: Type.OBJECT,
        properties: {
          intelligence: { type: Type.INTEGER },
          strength: { type: Type.INTEGER },
          speed: { type: Type.INTEGER },
          durability: { type: Type.INTEGER },
          power: { type: Type.INTEGER },
          combat: { type: Type.INTEGER },
        },
        required: ["intelligence", "strength", "speed", "durability", "power", "combat"]
      },
      appearance: {
        type: Type.OBJECT,
        properties: {
          gender: { type: Type.STRING },
          race: { type: Type.STRING },
          height: { type: Type.STRING },
          weight: { type: Type.STRING },
          eyeColor: { type: Type.STRING },
          hairColor: { type: Type.STRING },
        },
        required: ["gender", "race", "height", "weight", "eyeColor", "hairColor"]
      },
      biography: {
        type: Type.OBJECT,
        properties: {
          fullName: { type: Type.STRING },
          alterEgos: { type: Type.STRING },
          aliases: { type: Type.ARRAY, items: { type: Type.STRING } },
          placeOfBirth: { type: Type.STRING },
          firstAppearance: { type: Type.STRING },
          publisher: { type: Type.STRING },
          alignment: { type: Type.STRING, enum: ["good", "bad", "neutral"] },
        },
        required: ["fullName", "alignment", "placeOfBirth"]
      },
      work: {
        type: Type.OBJECT,
        properties: {
          occupation: { type: Type.STRING },
          base: { type: Type.STRING },
        },
        required: ["occupation", "base"]
      },
      connections: {
        type: Type.OBJECT,
        properties: {
          groupAffiliation: { type: Type.STRING },
          relatives: { type: Type.STRING },
        },
        required: ["groupAffiliation", "relatives"]
      }
    },
    required: ["name", "powerstats", "appearance", "biography", "work", "connections", "description"],
  };
}