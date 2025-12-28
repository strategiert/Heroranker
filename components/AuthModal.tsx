import React, { useState, useEffect } from 'react';
import { Shield, Key, Copy, Check, LogIn, AlertTriangle, User } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [currentId, setCurrentId] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('infinite_arena_user_id') || '';
    setCurrentId(id);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogin = () => {
    if (!inputKey.trim()) return;
    
    if (confirm("Bist du sicher? Der aktuelle Spielstand wird durch den geladenen Account ersetzt.")) {
        localStorage.setItem('infinite_arena_user_id', inputKey.trim());
        window.location.reload(); // Hard reload to refresh all contexts with new ID
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-blue-500/30 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-400">
            <Shield className="w-5 h-5" />
            <h2 className="font-bold font-mono tracking-wider">IDENTITÄTS-PROTOKOLL</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Current ID Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <User className="w-3 h-3" /> Dein Zugangsschlüssel
            </label>
            <div className="flex gap-2">
                <code className="flex-1 bg-black/50 border border-slate-700 rounded-lg p-3 text-xs font-mono text-green-400 break-all select-all">
                    {currentId}
                </code>
                <button 
                    onClick={handleCopy}
                    className={`px-3 flex items-center justify-center rounded-lg border transition-all ${copied ? 'bg-green-500 border-green-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
                <AlertTriangle className="w-3 h-3 inline mr-1 text-yellow-500" />
                Dies ist dein "Passwort". Speichere diesen Schlüssel, um deinen Account auf anderen Geräten wiederherzustellen.
            </p>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Login Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <LogIn className="w-3 h-3" /> Account wechseln / Wiederherstellen
            </label>
            <input 
                type="text" 
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Zugangsschlüssel hier einfügen..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
            />
            <button 
                onClick={handleLogin}
                disabled={!inputKey.trim() || inputKey.trim() === currentId}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-wide shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <LogIn className="w-4 h-4" /> Profil Laden
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};