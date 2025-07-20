import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, RefreshCw, Award, Volume2, VolumeX, PlayCircle, StopCircle, ArrowLeft, Star } from 'lucide-react';
import bgmAudio from './autism_bgm.mp3';

// --- GLOBAL STYLES COMPONENT ---
const GlobalStyles = () => {
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap");
            @font-face {
              font-family: 'OpenDyslexic';
              src: url('src/assets/fonts/OpenDyslexic/OpenDyslexic-Regular.otf') format('opentype');
              font-weight: normal;
              font-style: normal;
            }
            @font-face {
              font-family: 'OpenDyslexic';
              src: url('src/assets/fonts/OpenDyslexic/OpenDyslexic-Bold.otf') format('opentype');
              font-weight: bold;
              font-style: normal;
            }
            body {
              margin: 0;
              font-family: 'Open Sans', sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .font-opensans { font-family: 'Open Sans', sans-serif; }
            .dyslexia-font { font-family: 'OpenDyslexic', sans-serif; }
            .perspective-1000 { perspective: 1000px; }
            .preserve-3d { transform-style: preserve-3d; }
            .backface-hidden { 
              backface-visibility: hidden; 
              -webkit-backface-visibility: hidden; 
              position: absolute; 
              width: 100%; 
              height: 100%; 
            }
            .rotate-y-180 { transform: rotateY(180deg); }
            #root {
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);
    return null;
};


// --- KERALA-THEMED CARD BACK PATTERN ---
const CardBackPattern = ({ className }) => (
    <svg className={className} viewBox="0 0 64 64" stroke="currentColor" strokeWidth="2" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 5 H54 L60 11 V53 L54 59 H10 L4 53 V11 Z" strokeWidth="2.5" />
        <path d="M32 12 L20 20 L32 28 L44 20 Z" /><path d="M32 36 L20 44 L32 52 L44 44 Z" />
        <path d="M28 32 L12 32 L20 44" /><path d="M36 32 L52 32 L44 44" />
        <path d="M28 32 L20 20" /><path d="M36 32 L44 20" />
    </svg>
);

// --- KERALA DATA (ICONS AND FACTS) ---
const KERALA_DATA = {
    Kathakali: { icon: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M32 12 C 44 12, 48 24, 48 32 C 48 48, 40 52, 32 52 C 24 52, 16 48, 16 32 C 16 24, 20 12, 32 12 Z" /><path d="M20 32 C 20 24, 24 20, 32 20 C 40 20, 44 24, 44 32" /><path d="M24 40 Q 32 44, 40 40" /><path d="M16 32 H 48" /><path d="M32 12 V 8" /><path d="M24 16 L 20 12" /><path d="M40 16 L 44 12" /></svg>, fact: "Kathakali is a classical Indian dance form known for its elaborate makeup and costumes." },
    Theyyam: { icon: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M16 40 C 16 52, 48 52, 48 40 V 32 H 16 V 40 Z" /><path d="M32 32 V 24" /><path d="M24 24 H 40" /><path d="M32 8 A 24 24 0 0 1 56 32" /><path d="M32 8 A 24 24 0 0 0 8 32" /><path d="M28 44 h 8" /></svg>, fact: "Theyyam is a vibrant ritual dance from northern Kerala where artists embody deities." },
    SnakeBoat: { icon: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M8 40 C 16 32, 48 32, 56 40" /><path d="M12 40 V 48 H 52 V 40" /><path d="M56 40 C 52 32, 48 20, 44 12" /><path d="M24 40 L 20 32" /><path d="M32 40 L 28 32" /><path d="M40 40 L 36 32" /><path d="M48 40 L 44 32" /></svg>, fact: "Known as 'Chundan Vallam', these boats are used in thrilling races during festivals." },
    Chenda: { icon: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="32" rx="16" ry="20" /><path d="M16 32 L 48 32" /><path d="M20 20 L 12 12" /><path d="M44 20 L 52 12" /><path d="M20 44 L 12 52" /><path d="M44 44 L 52 52" /></svg>, fact: "The Chenda is a powerful cylindrical drum, essential to temple festivals in Kerala." },
    Lamp: { icon: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M24 52 H 40" /><path d="M32 52 V 20" /><path d="M20 44 H 44" /><path d="M24 36 H 40" /><path d="M20 20 Q 32 12, 44 20" /><path d="M32 20 Q 30 12, 28 8" /></svg>, fact: "The 'Nilavilakku' is a traditional lamp symbolizing the removal of darkness." },
    CoconutTree: { icon: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M32 56 V 16" /><path d="M32 16 C 48 16, 52 28, 52 32" /><path d="M32 16 C 16 16, 12 28, 12 32" /><path d="M32 16 C 32 8, 44 12, 44 20" /><path d="M32 16 C 32 8, 20 12, 20 20" /></svg>, fact: "Kerala is known as the 'Land of Coconuts', vital to its culture and cuisine." },
    Muthukuda: { icon: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M12 32 A 20 20 0 0 1 52 32 H 12 Z" /><path d="M32 32 V 56" /><path d="M32 12 V 8" /><path d="M20 32 C 20 24, 24 20, 32 20 C 40 20, 44 24, 44 32" /><path d="M12 32 L 12 36" /><path d="M52 32 L 52 36" /><path d="M32 32 L 32 36" /></svg>, fact: "A decorative, sequined umbrella used in grand temple processions." },
    Houseboat: { icon: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M8 48 L 56 48 L 52 40 L 12 40 Z" /><path d="M16 40 V 24 C 16 20, 20 16, 24 16 H 40 C 44 16, 48 20, 48 24 V 40" /><path d="M16 32 H 48" /></svg>, fact: "Called 'Kettuvallam', these are a unique attraction in Kerala's backwaters." },
    Elephant: { icon: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M16 32 C 16 20, 24 12, 36 12 H 48 V 28 H 36" /><path d="M48 28 C 56 28, 56 40, 48 40 V 52 H 20 V 32" /><path d="M16 32 C 8 32, 8 44, 16 44 V 52" /><path d="M40 20 C 41 19, 42 19, 43 20" /></svg>, fact: "Elephants are deeply revered in Kerala and play a central role in temple festivals." },
    Chilli: { icon: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M20 20 C 20 44, 44 44, 44 20 C 36 32, 28 32, 20 20 Z" /><path d="M32 20 V 12 L 36 8" /></svg>, fact: "Chillies are a cornerstone of Kerala's spicy and flavorful cuisine." },
};
const ALL_CARD_TYPES = Object.keys(KERALA_DATA);

// --- LEVEL CONFIGURATION ---
const LEVEL_CONFIG = [
    { level: 1, title: "The Village Festival", story: "A grand festival is beginning! The air is filled with the sound of the Chenda drum. Can you find the matching pairs of cultural icons to get the celebration started?", cards: ['Kathakali', 'Theyyam', 'SnakeBoat', 'Chenda', 'Lamp', 'CoconutTree'], matchSize: 2, grid: 'grid-cols-4 aspect-square max-w-lg', endStory: { title: "The Dance of the Gods", text: "As the last pair was matched, the Kathakali dancer's story reached its climax. The crowd cheered, reminded of the timeless tales that dance through Kerala's heart. You've brought the festival to life!" } },
    { level: 2, title: "The Backwater Journey", story: "As we travel through the serene backwaters on a Houseboat, many sights appear. This time, you must find three of a kind to continue our journey.", cards: ['Houseboat', 'Muthukuda', 'Elephant', 'Chilli', 'Lamp', 'CoconutTree', 'SnakeBoat', 'Chenda'], matchSize: 3, grid: 'grid-cols-6 aspect-[3/2] max-w-2xl', endStory: { title: "Whispers of the Water", text: "With the final triplet found, the houseboat drifted into a quiet lagoon. The setting sun painted the sky orange and gold, a perfect end to a peaceful journey on the water." } },
    { level: 3, title: "The Grand Procession", story: "The final procession is here! It's a grand spectacle with all the elements of Kerala. Find the three matching symbols to complete the celebration!", cards: ALL_CARD_TYPES, matchSize: 3, grid: 'grid-cols-5 aspect-[5/4] max-w-xl', endStory: { title: "A Land of Wonders", text: "You did it! You've matched all the symbols of Kerala, from its dances and festivals to its nature and flavors. You now carry a piece of its magic with you. Well done!" } },
];

// --- AUDIO ENGINE ---
const cardSynths = ALL_CARD_TYPES.map(() => new Tone.Synth({ oscillator: { type: 'sine' } }).toDestination());
const specialSounds = { match: new Tone.Synth().toDestination(), mismatch: new Tone.Synth().toDestination(), win: new Tone.PolySynth(Tone.Synth).toDestination() };
const playSound = (cardId) => { if (Tone.context.state !== 'running') Tone.context.resume(); const freq = 220 * Math.pow(2, ((cardId % cardSynths.length) * 2) / 12); cardSynths[cardId % cardSynths.length].triggerAttackRelease(freq, '8n'); };
const playSpecialSound = (type) => { if (Tone.context.state !== 'running') Tone.context.resume(); const now = Tone.now(); if (type === 'match') { specialSounds.match.triggerAttackRelease('C4', '8n', now); specialSounds.match.triggerAttackRelease('G4', '8n', now + 0.2); } else if (type === 'mismatch') { specialSounds.mismatch.triggerAttackRelease('C3', '8n', now); } else if (type === 'win') { specialSounds.win.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '2n', now); } };
const speak = (text, onEndCallback) => { if ('speechSynthesis' in window) { speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.rate = 1.2; utterance.onend = onEndCallback; speechSynthesis.speak(utterance); } else { if(onEndCallback) onEndCallback(); } };
const stopSpeaking = () => { if ('speechSynthesis' in window) { speechSynthesis.cancel(); } };

// --- CARD COMPONENT ---
const Card = React.memo(({ card, onCardClick, isFlipped, isMatched, isHighlighted, isHighContrast, isSimpleMode }) => {
    const { icon: KeralaIcon } = KERALA_DATA[card.type] || {};
    if (!KeralaIcon) return null;

    const handleSelect = () => !isFlipped && !isMatched && onCardClick(card);
    const frontBg = isHighContrast ? 'bg-white' : 'bg-green-100';
    const frontText = isHighContrast ? 'text-black' : 'text-green-900';
    const backBg = isHighContrast ? 'bg-black border-white' : 'bg-green-800 border-green-900';
    const backIcon = isHighContrast ? 'text-white' : 'text-green-100';
    
    const isFaceUp = isSimpleMode || isFlipped || isMatched;

    return (
        <div id={`card-${card.id}`} tabIndex={-1} className={`w-full h-full perspective-1000 ${isMatched ? 'opacity-60' : ''} rounded-lg focus:outline-none ${isHighlighted ? 'ring-4 ring-teal-400' : ''}`} onClick={handleSelect} role="button" aria-pressed={isFlipped} aria-label={`${card.type} card`}>
            <motion.div className="relative w-full h-full preserve-3d" 
                animate={{ rotateY: isFaceUp ? 180 : 0 }} 
                transition={{ duration: 0.6 }}>
                <div className={`absolute w-full h-full backface-hidden flex items-center justify-center rounded-lg shadow-lg ${backBg} border-2 overflow-hidden`}>
                    <CardBackPattern className={`w-full h-full p-2 ${backIcon}`} />
                </div>
                <div className={`absolute w-full h-full backface-hidden flex flex-col items-center justify-center rounded-lg shadow-lg border-2 ${frontBg} ${frontText} rotate-y-180`}>
                    <KeralaIcon className={`w-3/5 h-3/5 ${isHighContrast ? 'stroke-2' : ''}`} />
                    <p className="mt-1 text-xs md:text-sm font-bold">{card.type}</p>
                </div>
            </motion.div>
        </div>
    );
});

// --- MODAL COMPONENTS ---
const StoryModal = ({ story, title, onStart, isSpeaking, onAutoSpeak, onManualSpeak, onStopSpeak, isHighlighted, focusIndex }) => {
    useEffect(() => { onAutoSpeak(story); }, [onAutoSpeak, story]);
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 p-4">
            <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="bg-green-800 p-8 rounded-xl shadow-2xl text-center max-w-lg w-full">
                <h2 className="text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'serif' }}>{title}</h2>
                <p className="text-green-100 text-lg mb-6">{story}</p>
                <div className="flex justify-center items-center space-x-4">
                    <button id="modal-btn-0" onClick={onStart} className={`px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 ${isHighlighted && focusIndex === 0 ? 'ring-4 ring-teal-400' : ''}`}>Start Level</button>
                    {isSpeaking ? <button id="modal-btn-1" onClick={onStopSpeak} className={`p-3 bg-red-600 text-white rounded-full hover:bg-red-700 ${isHighlighted && focusIndex === 1 ? 'ring-4 ring-teal-400' : ''}`}><StopCircle /></button> : <button id="modal-btn-1" onClick={() => onManualSpeak(story)} className={`p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 ${isHighlighted && focusIndex === 1 ? 'ring-4 ring-teal-400' : ''}`}><PlayCircle /></button>}
                </div>
            </motion.div>
        </motion.div>
    );
};

const FactModal = ({ fact, onContinue, isSpeaking, onAutoSpeak, onManualSpeak, onStopSpeak, isHighlighted, focusIndex }) => {
    const { icon: Icon, name, text } = fact;
    useEffect(() => { onAutoSpeak(text); }, [fact, onAutoSpeak, text]);
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 p-4">
            <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="bg-green-800 p-8 rounded-xl shadow-2xl text-center max-w-lg w-full flex flex-col items-center">
                <div className="w-24 h-24 mb-4 p-4 bg-green-100 rounded-full"><Icon className="w-full h-full text-green-900" /></div>
                <h2 className="text-3xl font-bold mb-2 text-white">{name}</h2>
                <p className="text-green-100 text-base mb-6">{text}</p>
                <div className="flex justify-center items-center space-x-4">
                    <button id="modal-btn-0" onClick={onContinue} className={`px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 ${isHighlighted && focusIndex === 0 ? 'ring-4 ring-teal-400' : ''}`}>Continue</button>
                    {isSpeaking ? <button id="modal-btn-1" onClick={onStopSpeak} className={`p-3 bg-red-600 text-white rounded-full hover:bg-red-700 ${isHighlighted && focusIndex === 1 ? 'ring-4 ring-teal-400' : ''}`}><StopCircle /></button> : <button id="modal-btn-1" onClick={() => onManualSpeak(text)} className={`p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 ${isHighlighted && focusIndex === 1 ? 'ring-4 ring-teal-400' : ''}`}><PlayCircle /></button>}
                </div>
            </motion.div>
        </motion.div>
    );
};

const LevelEndModal = ({ story, onNext, onEnd, isSpeaking, onAutoSpeak, onManualSpeak, onStopSpeak, isHighlighted, focusIndex }) => {
    useEffect(() => { onAutoSpeak(story.text); }, [story, onAutoSpeak]);
    const hasTwoButtons = !!onNext;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10 p-4">
            <div className={`p-8 rounded-xl text-center shadow-2xl bg-green-800 border-4`}>
                <Award className="w-24 h-24 mx-auto mb-4 text-teal-300" />
                <h2 className="text-4xl font-bold mb-2 text-white">{story.title}</h2>
                <p className="text-xl mb-6 text-green-100">{story.text}</p>
                <div className="flex justify-center items-center space-x-4">
                    <button id="modal-btn-0" onClick={onEnd} className={`px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 ${isHighlighted && focusIndex === 0 ? 'ring-4 ring-teal-400' : ''}`}>Change Level</button>
                    {onNext && <button id="modal-btn-1" onClick={onNext} className={`px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 ${isHighlighted && focusIndex === 1 ? 'ring-4 ring-teal-400' : ''}`}>Next Level</button>}
                    {isSpeaking ? <button id={`modal-btn-${hasTwoButtons ? 2 : 1}`} onClick={onStopSpeak} className={`p-3 bg-red-600 text-white rounded-full hover:bg-red-700 ${isHighlighted && focusIndex === (hasTwoButtons ? 2 : 1) ? 'ring-4 ring-teal-400' : ''}`}><StopCircle /></button> : <button id={`modal-btn-${hasTwoButtons ? 2 : 1}`} onClick={() => onManualSpeak(story.text)} className={`p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 ${isHighlighted && focusIndex === (hasTwoButtons ? 2 : 1) ? 'ring-4 ring-teal-400' : ''}`}><PlayCircle /></button>}
                </div>
            </div>
        </motion.div>
    );
};

// --- TOGGLE COMPONENT FOR SETTINGS ---
const Toggle = ({ label, isEnabled, onToggle, isHighlighted }) => (
    <label className={`flex items-center justify-between space-x-4 cursor-pointer p-2 rounded-md ${isHighlighted ? 'ring-4 ring-teal-400' : ''}`} onClick={onToggle}>
        <span>{label}</span>
        <div className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${isEnabled ? 'bg-green-500 justify-end' : 'bg-gray-500 justify-start'}`}>
            <motion.div layout className="w-4 h-4 bg-white rounded-full" />
        </div>
    </label>
);

// --- MAIN APP COMPONENT ---
export default function App() {
    const [gameState, setGameState] = useState('cover');
    const [currentLevel, setCurrentLevel] = useState(1);
    const [unlockedLevel, setUnlockedLevel] = useState(1);
    const [godMode, setGodMode] = useState(false);
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [blindAssist, setBlindAssist] = useState(false);
    const [deafAssist, setDeafAssist] = useState(false);
    const [dyslexiaAssist, setDyslexiaAssist] = useState(false);
    const [oneButtonMode, setOneButtonMode] = useState(true); // Default to ON
    const [isStoryMode, setIsStoryMode] = useState(true);
    const [isSimpleMode, setIsSimpleMode] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [showFact, setShowFact] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [ttsManuallyStopped, setTtsManuallyStopped] = useState(false);
    const [isGameWon, setIsGameWon] = useState(false);
    
    // One-button navigation state
    const [focusContext, setFocusContext] = useState('menu'); // 'menu', 'game', 'modal', 'settings', 'top-bar'
    const [focusIndex, setFocusIndex] = useState(0);
    const pressTimer = useRef(null);
    const keyPressStart = useRef(null);

    const hasInteracted = useRef(false);
    const levelConfig = LEVEL_CONFIG[currentLevel - 1];
    const bgmPlayer = useRef(null);
    const [isMusicLoaded, setIsMusicLoaded] = useState(false);

    const isHighContrast = blindAssist;
    const isGuideMode = blindAssist;

    // Single button navigation handler
    useEffect(() => {
        if (!oneButtonMode) return;

        const getFocusCount = () => {
             switch (focusContext) {
                 case 'menu': return LEVEL_CONFIG.filter(l => godMode || l.level <= unlockedLevel).length;
                 case 'game': return cards.length;
                 case 'modal':
                     if (showFact) return 2;
                     if (gameState === 'story') return 2;
                     if (gameState === 'won') return (levelConfig.endStory && currentLevel < LEVEL_CONFIG.length) ? 3 : 2;
                     return 0;
                 case 'settings': return 6; // Now 6 toggles
                 case 'top-bar': return 4;
                 default: return 0;
             }
        };

        const handleKeyDown = (e) => {
            if (e.repeat) return;
            const key = e.code;

            if (key === 'Space' || key === 'Escape') {
                 e.preventDefault();
                 if (keyPressStart.current) return; // Prevent multiple presses
                 keyPressStart.current = { key: key, time: Date.now() };

                 pressTimer.current = setTimeout(() => {
                     // --- PRESS & HOLD ACTION ---
                     if (!keyPressStart.current || keyPressStart.current.key !== key) return;

                     if (key === 'Space') {
                         const focusCount = getFocusCount();
                         if (focusCount === 0) return;
                         
                         let element;
                         switch (focusContext) {
                             case 'menu':
                                 element = document.getElementById(`level-btn-${focusIndex}`);
                                 break;
                             case 'game':
                                 if(cards[focusIndex]) {
                                     handleCardClick(cards[focusIndex]);
                                 }
                                 break;
                             case 'modal':
                                 element = document.getElementById(`modal-btn-${focusIndex}`);
                                 break;
                             case 'settings':
                                 element = document.getElementById(`setting-toggle-${focusIndex}`);
                                 if(element) element.querySelector('label')?.click();
                                 break;
                             case 'top-bar':
                                 element = document.getElementById(`top-bar-btn-${focusIndex}`);
                                 break;
                         }
                         if (element) element.click();
                     } else if (key === 'Escape') {
                         // Long press escape
                         handleStopSpeak();
                         setGameState('cover');
                     }
                     
                     keyPressStart.current = null; 
                 }, 500);
            }
        };

        const handleKeyUp = (e) => {
            const key = e.code;
            if (key !== 'Space' && key !== 'Escape') return;
            e.preventDefault();

            clearTimeout(pressTimer.current);
            if (keyPressStart.current && keyPressStart.current.key === key && (Date.now() - keyPressStart.current.time < 500)) {
                // --- SINGLE TAP ACTION ---
                if (key === 'Space') {
                    setFocusIndex(prev => (prev + 1) % (getFocusCount() || 1));
                } else if (key === 'Escape') {
                    if (isSettingsOpen) {
                        setIsSettingsOpen(false);
                        // Focus context will be set back to 'game' by the useEffect
                    } else {
                        setFocusContext(prev => prev === 'game' ? 'top-bar' : 'game');
                        setFocusIndex(0);
                    }
                }
            }
            keyPressStart.current = null;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            clearTimeout(pressTimer.current);
        };
    }, [oneButtonMode, focusContext, focusIndex, cards, gameState, isSettingsOpen, unlockedLevel, godMode]);


    // Update focus context based on game state
    useEffect(() => {
        if (isSettingsOpen) setFocusContext('settings');
        else if (showFact || gameState === 'story' || gameState === 'won') setFocusContext('modal');
        else if (gameState === 'playing') setFocusContext('game');
        else if (gameState === 'cover') setFocusContext('menu');
        else setFocusContext('');
        setFocusIndex(0);
    }, [gameState, showFact, isSettingsOpen]);


    useEffect(() => {
        bgmPlayer.current = new Tone.Player({
            url: bgmAudio,
            loop: true,
            autostart: false,
            volume: -12,
            onload: () => setIsMusicLoaded(true),
        }).toDestination();
         return () => {
            bgmPlayer.current?.dispose();
        };
    }, []);

    useEffect(() => {
        const savedLevel = localStorage.getItem('unlockedLevel');
        if (savedLevel) {
            setUnlockedLevel(parseInt(savedLevel, 10));
        }
    }, []);

    const handleAutoSpeak = useCallback((text) => {
        if (ttsManuallyStopped) return;
        speak(text, () => setIsSpeaking(false));
        setIsSpeaking(true);
    }, [ttsManuallyStopped]);

    const handleManualSpeak = useCallback((text) => {
        setTtsManuallyStopped(false);
        speak(text, () => setIsSpeaking(false));
        setIsSpeaking(true);
    }, []);

    const handleStopSpeak = useCallback(() => {
        stopSpeaking();
        setIsSpeaking(false);
        setTtsManuallyStopped(true);
    }, []);

    const shuffleAndDeal = useCallback(() => {
        handleStopSpeak();
        const { cards: cardTypes, matchSize } = levelConfig;
        let deck = [];
        for (let i = 0; i < matchSize; i++) { deck = [...deck, ...cardTypes]; }
        const shuffledDeck = deck.map((type, index) => ({ id: index, type: type })).sort(() => Math.random() - 0.5);
        setCards(shuffledDeck);
        setFlippedCards([]);
        setMatchedPairs([]);
        setMoves(0);
        setGameState('playing');
        setIsGameWon(false);
    }, [levelConfig, handleStopSpeak]);

    const selectLevel = (level) => {
        setTtsManuallyStopped(false);
        setCurrentLevel(level);
        if (isStoryMode) {
            setGameState('story');
        } else {
            shuffleAndDeal();
        }
    };

    const userInteraction = () => {
        if (!hasInteracted.current) {
            hasInteracted.current = true;
            if (Tone.context.state !== 'running') Tone.context.resume();
            if (!isMuted && isMusicLoaded && bgmPlayer.current.state !== 'started') {
                bgmPlayer.current.start();
            }
        }
    };

    const handleCardClick = useCallback((clickedCard) => {
        userInteraction();
        const isAlreadyFlipped = flippedCards.some(c => c.id === clickedCard.id);
        if (showFact || flippedCards.length === levelConfig.matchSize || isGameWon || isAlreadyFlipped || matchedPairs.includes(clickedCard.type)) return;

        if (isGuideMode) speak(clickedCard.type, () => {});
        playSound(ALL_CARD_TYPES.indexOf(clickedCard.type));
        const newFlippedCards = [...flippedCards, clickedCard];
        setFlippedCards(newFlippedCards);

        if (newFlippedCards.length === levelConfig.matchSize) {
            setMoves(m => m + 1);
            const allMatch = newFlippedCards.every(card => card.type === newFlippedCards[0].type);
            
            if (allMatch) {
                setTimeout(() => {
                    setMatchedPairs(prev => [...prev, newFlippedCards[0].type]);
                    setFlippedCards([]);
                    playSpecialSound('match');
                    setShowFact({ name: newFlippedCards[0].type, icon: KERALA_DATA[newFlippedCards[0].type].icon, text: KERALA_DATA[newFlippedCards[0].type].fact });
                    if (isGuideMode) speak("Correct match!", () => {});
                }, 500);
            } else {
                setTimeout(() => setFlippedCards([]), 1500);
            }
        }
    }, [flippedCards, isGameWon, isGuideMode, matchedPairs, levelConfig, showFact]);

    useEffect(() => {
        if (matchedPairs.length > 0 && matchedPairs.length === levelConfig.cards.length) {
            setIsGameWon(true); 
            playSpecialSound('win');
            if (isGuideMode) speak(`You completed the level in ${moves} moves.`, () => {});
            if (currentLevel === unlockedLevel && currentLevel < LEVEL_CONFIG.length) {
                const newUnlockedLevel = unlockedLevel + 1;
                setUnlockedLevel(newUnlockedLevel);
                localStorage.setItem('unlockedLevel', newUnlockedLevel.toString());
            }
        }
    }, [matchedPairs, levelConfig, isGuideMode, moves, currentLevel, unlockedLevel]);

    const handleContinueFromFact = () => {
        handleStopSpeak();
        setShowFact(null);
        if(isGameWon) {
            setGameState('won');
        }
    };

    const toggleMute = () => { 
        userInteraction(); 
        setIsMuted(current => { 
            const newState = !current; 
            if (newState) {
                if (bgmPlayer.current) bgmPlayer.current.stop();
            } else if (isMusicLoaded && bgmPlayer.current && bgmPlayer.current.state !== 'started') {
                bgmPlayer.current.start();
            }
            return newState; 
        }); 
    };
    
    const themeClasses = isHighContrast ? 'bg-black text-white' : 'bg-green-900 text-green-100';
    const fontClass = dyslexiaAssist ? 'dyslexia-font' : 'font-opensans';

    if (gameState === 'cover') {
        return (
            <>
                <GlobalStyles />
                <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-green-900">
                    <div className="bg-green-800 bg-opacity-80 p-10 rounded-xl shadow-2xl text-center backdrop-blur-sm">
                        <h1 className="text-6xl font-bold mb-4 text-white" style={{ fontFamily: 'serif' }}>Care Game</h1>
                        <p className="text-green-100 text-xl mb-8">Select a level to begin your journey through Kerala.</p>
                        <div className="flex justify-center space-x-4">
                            {LEVEL_CONFIG.map((level, index) => (
                                <button 
                                    id={`level-btn-${index}`}
                                    key={level.level} 
                                    onClick={() => selectLevel(level.level)} 
                                    disabled={!godMode && level.level > unlockedLevel}
                                    className={`px-8 py-4 bg-green-600 text-white font-bold text-xl rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed focus:ring-4 focus:ring-teal-400 ${focusContext === 'menu' && index === focusIndex ? 'ring-4 ring-teal-400' : ''}`}
                                >
                                    Level {level.level}
                                </button>
                            ))}
                        </div>
                         <p className="mt-4 text-sm text-teal-400">One Button Mode is ON</p>
                    </div>
                    <button onClick={() => setGodMode(true)} className="absolute bottom-4 left-4 text-yellow-600"><Star size={16}/></button>
                </div>
            </>
        );
    }
    
    return (
        <>
            <GlobalStyles />
            <div className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-500 ${themeClasses} ${fontClass}`}>
                <AnimatePresence>
                    {gameState === 'story' && (
                        <StoryModal 
                            title={levelConfig.title} 
                            story={levelConfig.story} 
                            onStart={shuffleAndDeal}
                            isSpeaking={isSpeaking}
                            onAutoSpeak={handleAutoSpeak}
                            onManualSpeak={handleManualSpeak}
                            onStopSpeak={handleStopSpeak}
                            isHighlighted={focusContext === 'modal'}
                            focusIndex={focusIndex}
                        />
                    )}
                    {showFact && (
                        <FactModal 
                            fact={showFact} 
                            onContinue={handleContinueFromFact}
                            isSpeaking={isSpeaking}
                            onAutoSpeak={handleAutoSpeak}
                            onManualSpeak={handleManualSpeak}
                            onStopSpeak={handleStopSpeak}
                            isHighlighted={focusContext === 'modal'}
                            focusIndex={focusIndex}
                        />
                    )}
                </AnimatePresence>

                <div className="absolute top-4 right-4 flex items-center space-x-2 z-30">
                    <button id="top-bar-btn-0" onClick={() => { handleStopSpeak(); setGameState('cover'); }} className={`p-2 rounded-full bg-green-600 text-white hover:bg-green-700 ${focusContext === 'top-bar' && focusIndex === 0 ? 'ring-4 ring-teal-400' : ''}`} aria-label="Back to Levels"><ArrowLeft size={24} /></button>
                    <button id="top-bar-btn-1" onClick={toggleMute} className={`p-2 rounded-full bg-green-600 text-white hover:bg-green-700 ${focusContext === 'top-bar' && focusIndex === 1 ? 'ring-4 ring-teal-400' : ''}`} aria-label="Toggle Music">{isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}</button>
                    <button id="top-bar-btn-2" onClick={shuffleAndDeal} className={`p-2 rounded-full bg-green-600 text-white hover:bg-green-700 ${focusContext === 'top-bar' && focusIndex === 2 ? 'ring-4 ring-teal-400' : ''}`} aria-label="Restart Level"><RefreshCw size={24} /></button>
                    <button id="top-bar-btn-3" onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`p-2 rounded-full bg-green-600 text-white hover:bg-green-700 ${focusContext === 'top-bar' && focusIndex === 3 ? 'ring-4 ring-teal-400' : ''}`} aria-label="Settings"><Settings size={24} /></button>
                </div>
                <AnimatePresence>
                    {isSettingsOpen && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`absolute top-16 right-4 p-4 rounded-lg shadow-2xl z-30 ${isHighContrast ? 'bg-gray-800' : 'bg-green-800'} border-2`}>
                            <h3 className="text-lg font-bold mb-3">Game & Accessibility</h3>
                            <div className="space-y-1">
                                <div id="setting-toggle-0"><Toggle label="Story Mode" isEnabled={isStoryMode} onToggle={() => setIsStoryMode(!isStoryMode)} isHighlighted={focusContext === 'settings' && focusIndex === 0} /></div>
                                <div id="setting-toggle-1"><Toggle label="Simple Mode" isEnabled={isSimpleMode} onToggle={() => setIsSimpleMode(!isSimpleMode)} isHighlighted={focusContext === 'settings' && focusIndex === 1}/></div>
                                <hr className="border-green-600 my-2"/>
                                <div id="setting-toggle-2"><Toggle label="Blind Assist" isEnabled={blindAssist} onToggle={() => setBlindAssist(!blindAssist)} isHighlighted={focusContext === 'settings' && focusIndex === 2}/></div>
                                <div id="setting-toggle-3"><Toggle label="Deaf Assist" isEnabled={deafAssist} onToggle={() => setDeafAssist(!deafAssist)} isHighlighted={focusContext === 'settings' && focusIndex === 3}/></div>
                                <div id="setting-toggle-4"><Toggle label="Dyslexia Assist" isEnabled={dyslexiaAssist} onToggle={() => setDyslexiaAssist(!dyslexiaAssist)} isHighlighted={focusContext === 'settings' && focusIndex === 4}/></div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <h1 className="text-4xl md:text-5xl font-bold mb-1 text-center" style={{ fontFamily: 'serif' }}>Care Game</h1>
                <p className="mb-4 text-lg">Level {currentLevel} | Moves: {moves}</p>
                <div className={`grid ${levelConfig.grid} gap-2 md:gap-3 w-full`}>
                    {cards.map((card, index) => <Card key={card.id} card={card} onCardClick={handleCardClick} isFlipped={flippedCards.some(c => c.id === card.id)} isMatched={matchedPairs.includes(card.type)} isHighlighted={(focusContext === 'game' && index === focusIndex) || (isGuideMode && index === focusIndex)} isHighContrast={isHighContrast} isSimpleMode={isSimpleMode} />)}
                </div>
                
                <AnimatePresence>
                    {deafAssist && showFact && (
                        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="absolute inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50">
                            <div className="px-12 py-8 bg-green-500 text-white text-5xl font-bold rounded-lg shadow-xl">Correct!</div>
                        </motion.div>
                    )}
                    {gameState === 'won' && (
                        <LevelEndModal 
                            story={levelConfig.endStory}
                            onNext={currentLevel < LEVEL_CONFIG.length ? () => { handleStopSpeak(); selectLevel(currentLevel + 1); } : null}
                            onEnd={() => { handleStopSpeak(); setGameState('cover'); }}
                            isSpeaking={isSpeaking}
                            onAutoSpeak={handleAutoSpeak}
                            onManualSpeak={handleManualSpeak}
                            onStopSpeak={handleStopSpeak}
                            isHighlighted={focusContext === 'modal'}
                            focusIndex={focusIndex}
                        />
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}