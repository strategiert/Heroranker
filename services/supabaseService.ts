import { createClient } from '@supabase/supabase-js';
import { ExternalHero, Hero } from '../types';
import { GameState } from '../types/economy';
import { InventoryState } from '../context/InventoryContext';
import { SpireState } from '../context/SpireContext';

// Safe environment access for browser environments
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) return process.env[key];
  } catch (e) { }
  return '';
};

// Initialize Supabase Client using the Service Role Key to ensure access (Bypass RLS)
const supabaseUrl = getEnv('SUPABASE_URL') || 'https://uwzmldtoiulcezexsclo.supabase.co';
const supabaseKey = getEnv('SUPABASE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3em1sZHRvaXVsY2V6ZXhzY2xvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njg1NDE1OSwiZXhwIjoyMDgyNDMwMTU5fQ.NjD8tZ933Uba4ii3XxOEbNFa7atwrON80GlKpe6nmS0';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

export const REQUIRED_TABLE_NAME = 'superheroes_raw';
export const MY_HEROES_TABLE = 'my_heroes';
export const SAVE_GAME_TABLE = 'save_games';

export const SCHEMA_SQL = `
-- SYSTEM REPAIR SCRIPT
-- Führe dieses Skript im Supabase SQL Editor aus, um die Datenbank zu reparieren.

-- 1. Tabelle 'my_heroes' (Deine Armee)
DROP TABLE IF EXISTS my_heroes;
CREATE TABLE my_heroes (
    id text PRIMARY KEY,                   -- Eindeutige ID des Helden
    data jsonb NOT NULL DEFAULT '{}'::jsonb, -- Alle Heldendaten als JSON
    created_at timestamptz DEFAULT now()   -- Erstellungsdatum
);

ALTER TABLE my_heroes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Heroes Access" ON my_heroes FOR ALL USING (true) WITH CHECK (true);

-- 2. Tabelle 'save_games' (Basis, Inventar, Spire)
DROP TABLE IF EXISTS save_games;
CREATE TABLE save_games (
    user_id text PRIMARY KEY,              -- Eindeutige ID des Spielers (Browser-Instanz)
    game_state jsonb DEFAULT '{}'::jsonb,  -- Basis-Daten (Gebäude, Ressourcen)
    inventory_state jsonb DEFAULT '{}'::jsonb, -- Inventar (Items, Ausrüstung)
    spire_state jsonb DEFAULT '{}'::jsonb, -- Turm-Fortschritt (Floor, Highscore)
    updated_at timestamptz DEFAULT now()   -- Zeitstempel der letzten Speicherung
);

ALTER TABLE save_games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Save Access" ON save_games FOR ALL USING (true) WITH CHECK (true);

-- System Status: BEREIT
`;

export const listTables = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) return [];
    return data ? data.map((row: any) => row.table_name) : [];
  } catch (e) {
    return [];
  }
};

// Robust utility to remove surrounding quotes and 'None' strings
const cleanStr = (val: any): string => {
  if (typeof val !== 'string') return '';
  let cleaned = val.replace(/^['"]+|['"]+$/g, '').trim();
  if (cleaned.toLowerCase() === 'none' || cleaned === '-') return '';
  return cleaned;
};

// Helper to calculate total stats for comparison
const getPowerScore = (h: ExternalHero) => {
    return (h.intelligence || 0) + (h.strength || 0) + (h.speed || 0) + 
           (h.durability || 0) + (h.power || 0) + (h.combat || 0);
};

export const fetchRawHeroes = async (limit = 1000, offset = 0): Promise<ExternalHero[]> => {
  if (!supabaseUrl || !supabaseKey) {
     throw new Error("Supabase Credentials fehlen.");
  }

  const { data, error } = await supabase
    .from(REQUIRED_TABLE_NAME) 
    .select('*')
    .range(offset, offset + limit - 1);

  if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01') {
            throw new Error(`Tabelle '${REQUIRED_TABLE_NAME}' nicht gefunden.`);
      }
      // Return a standard error object
      throw new Error(`Supabase Error (${error.code}): ${error.message}`);
  }

  if (!data) return [];

  const processedHeroes: ExternalHero[] = data.map((record: any) => {
    
    const getVal = (keys: string[]) => {
        for(const k of keys) {
            if (record[k] !== undefined && record[k] !== null) return record[k];
            if (record[k.toLowerCase()] !== undefined && record[k.toLowerCase()] !== null) return record[k.toLowerCase()];
        }
        return undefined;
    };

    return {
        name: cleanStr(getVal(['Character', 'character', 'name', 'Name'])) || 'Unknown',
        full_name: cleanStr(getVal(['full_name', 'FullName', 'Real_Name', 'Alter_Egos', 'alter_egos'])) || 'Unknown',
        race: cleanStr(getVal(['race', 'Race', 'Species'])) || 'Unknown',
        publisher: cleanStr(getVal(['publisher', 'Publisher'])) || 'Unknown',
        alignment: cleanStr(getVal(['alignment', 'Alignment'])) || 'neutral',
        
        intelligence: Number(getVal(['intelligence', 'Intelligence'])) || 0,
        strength: Number(getVal(['strength', 'Strength'])) || 0,
        speed: Number(getVal(['speed', 'Speed'])) || 0,
        durability: Number(getVal(['durability', 'Durability'])) || 0,
        power: Number(getVal(['power', 'Power'])) || 0,
        combat: Number(getVal(['combat', 'Combat'])) || 0,
        
        description: cleanStr(getVal(['description', 'Description', 'History'])),
        image: cleanStr(getVal(['image_url', 'image', 'Image', 'url']))
    };
  });

  // SMART DEDUPLICATION
  const uniqueHeroes = new Map<string, ExternalHero>();
  
  processedHeroes.forEach(hero => {
      if (!hero.name || hero.name === 'Unknown') return;

      const existing = uniqueHeroes.get(hero.name);
      
      if (!existing) {
          uniqueHeroes.set(hero.name, hero);
      } else {
          const scoreNew = getPowerScore(hero);
          const scoreExisting = getPowerScore(existing);
          
          if (scoreNew > scoreExisting) {
              uniqueHeroes.set(hero.name, hero);
          } else if (scoreNew === scoreExisting && !existing.image && hero.image) {
              uniqueHeroes.set(hero.name, hero);
          }
      }
  });

  return Array.from(uniqueHeroes.values());
};

// --- HEROES SYNC ---

export const fetchMyHeroes = async (): Promise<Hero[]> => {
    const { data, error } = await supabase
        .from(MY_HEROES_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        if (error.code === 'PGRST204' || error.message.includes('data')) {
            console.warn("Spalte 'data' fehlt in 'my_heroes'. Tabelle muss neu erstellt werden.");
            return [];
        }
        if (error.code === 'PGRST205' || error.code === '42P01') {
            console.warn(`Tabelle '${MY_HEROES_TABLE}' noch nicht erstellt.`);
            throw new Error('TABLE_MISSING');
        }
        console.error("Fetch My Heroes Error:", error.message || JSON.stringify(error));
        throw new Error(`Supabase Error (${error.code}): ${error.message}`);
    }

    return data ? data.map((row: any) => row.data) : [];
};

export const saveHero = async (hero: Hero): Promise<void> => {
    const { error } = await supabase
        .from(MY_HEROES_TABLE)
        .upsert({
            id: hero.id,
            data: hero
        });

    if (error) {
        // Handle undefined column error specifically (PGRST204 = Columns not found in cache or DB)
        if (error.code === 'PGRST204' || error.code === '42703') {
             console.error("SCHEMA FEHLER: Die Tabelle 'my_heroes' hat die falsche Struktur. Sie muss die Spalte 'data' (jsonb) enthalten. Bitte führe das SQL-Skript (DROP & CREATE) im Supabase Editor aus.");
             return;
        }
        if (error.code === 'PGRST205' || error.code === '42P01') {
             console.error("Tabelle 'my_heroes' existiert nicht. Bitte SQL ausführen.");
             return; 
        }
        console.error(`Fehler beim Speichern (${error.code}):`, error.message || JSON.stringify(error));
    }
};

// --- FULL SAVE GAME SYNC ---

export interface FullSaveData {
    game: GameState;
    inventory: InventoryState;
    spire: Partial<SpireState>;
}

export const loadSaveGame = async (userId: string): Promise<FullSaveData | null> => {
    const { data, error } = await supabase
        .from(SAVE_GAME_TABLE)
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // No rows found, new user
        
        // Error 42703 = Column does not exist
        if (error.code === 'PGRST205' || error.code === '42P01' || error.code === '42703') {
             console.warn(`Tabelle '${SAVE_GAME_TABLE}' defekt oder fehlt. (Fehler: ${error.code})`);
             return null;
        }
        console.error("Load Game Error:", error);
        return null;
    }

    return {
        game: data.game_state,
        inventory: data.inventory_state,
        spire: data.spire_state
    };
};

export const saveGameToCloud = async (userId: string, data: FullSaveData): Promise<{ success: boolean; error?: any }> => {
    const { error } = await supabase
        .from(SAVE_GAME_TABLE)
        .upsert({
            user_id: userId,
            game_state: data.game,
            inventory_state: data.inventory,
            spire_state: data.spire,
            updated_at: new Date().toISOString()
        });

    if (error) {
        // Error 42703 means column missing (likely user_id)
        if (error.code === '42703' || error.code === '42P01') {
            console.error("CRITICAL: Datenbank-Struktur falsch. Tabelle 'save_games' fehlt die Spalte 'user_id' oder existiert nicht.");
        } else {
            console.error("Cloud Save Error:", error);
        }
        return { success: false, error };
    }
    return { success: true };
};

export const seedDatabase = async (onProgress?: (msg: string) => void) => {
    console.warn("Seeding disabled by user request.");
    return 0;
};