import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, RefreshCw, Award, Volume2, VolumeX } from 'lucide-react';

// --- FONT AND STYLE LOADER ---
// This component injects the necessary fonts and custom CSS into the document,
// replacing the need for an external CSS file.
const GlobalStyles = () => {
    useEffect(() => {
        // Add Google Fonts
        const fontLink = document.createElement('link');
        fontLink.href = "https://fonts.googleapis.com/css2?family=Open+Sans&family=OpenDyslexic:wght@400;700&display=swap";
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);

        // Add custom CSS for card animations
        const style = document.createElement('style');
        style.textContent = `
          .perspective-1000 {
            perspective: 1000px;
          }
          .preserve-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            position: absolute;
            width: 100%;
            height: 100%;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
        `;
        document.head.appendChild(style);

        return () => {
          document.head.removeChild(fontLink);
          document.head.removeChild(style);
        };
      }, []);

    return null;
};


// --- CARD BACK PATTERN (SVG ONLY) ---
const CardBackPattern = ({ className }) => {
    return (
        <svg className={className} viewBox="0 0 64 64" stroke="currentColor" strokeWidth="2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 5 H54 L60 11 V53 L54 59 H10 L4 53 V11 Z" strokeWidth="2.5" />
            <circle cx="32" cy="32" r="12" />
            <circle cx="32" cy="32" r="6" fill="currentColor" fillOpacity="0.3" />
            <path d="M32 20 V 12 M32 44 V 52 M20 32 H 12 M44 32 H 52" />
            <path d="M22 22 L 16 16 M42 22 L 48 16 M22 42 L 16 48 M42 42 L 48 48" />
            <path d="M12 12 L 18 12 L 12 18 Z" fill="currentColor" />
            <path d="M52 12 L 46 12 L 52 18 Z" fill="currentColor" />
            <path d="M12 52 L 18 52 L 12 46 Z" fill="currentColor" />
            <path d="M52 52 L 46 52 L 52 46 Z" fill="currentColor" />
        </svg>
    );
};

// --- SVG ICONS ---
const ANIMAL_ICONS = {
    Cat: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M32 12C26 12 20 16 20 24V32H44V24C44 16 38 12 32 12Z" /><path d="M20 32C16 32 12 36 12 40V48H20" /><path d="M44 32C48 32 52 36 52 40V48H44" /><path d="M32 32V52" /><path d="M26 52H38" /><path d="M24 24C24 22 26 20 28 20" /><path d="M40 24C40 22 38 20 36 20" /></svg>,
    Scarab: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M32 16C22 16 16 26 16 32C16 42 22 52 32 52C42 52 48 42 48 32C48 26 42 16 32 16Z" /><path d="M16 32H48" /><path d="M24 16V12" /><path d="M40 16V12" /><path d="M18 24L12 20" /><path d="M46 24L52 20" /><path d="M18 40L12 44" /><path d="M46 40L52 44" /></svg>,
    Falcon: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M20 20C20 12 28 12 32 16C36 12 44 12 44 20V36H20V20Z" /><path d="M32 36V52" /><path d="M16 36H20" /><path d="M44 36H48" /><path d="M24 44L16 52" /><path d="M40 44L48 52" /><path d="M32 24C34 24 34 22 32 22C30 22 30 24 32 24Z" /></svg>,
    Cobra: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M32 52V44C32 36 24 32 24 24C24 16 32 12 32 12C32 12 40 16 40 24C40 32 32 36 32 44Z" /><path d="M28 20H36" /></svg>,
    Anubis: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M32 12L24 24V40H40V24L32 12Z" /><path d="M24 40V52H28" /><path d="M40 40V52H36" /><path d="M32 40V52" /><path d="M28 20L24 24" /><path d="M36 20L40 24" /></svg>,
    Ibis: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M32 12C24 12 20 24 20 32H44C44 24 40 12 32 12Z" /><path d="M20 32C16 32 12 36 12 40V48H20" /><path d="M44 32C48 32 52 36 52 40V48H44" /><path d="M32 32V52" /><path d="M28 48H36" /><path d="M32 12C32 8 36 6 40 10" /></svg>,
    Ankh: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M32 12 C38 12 44 18 44 24 C44 30 38 36 32 36 C26 36 20 30 20 24 C20 18 26 12 32 12 Z" /><path d="M32 36 L32 52" /><path d="M20 28 L44 28" /></svg>,
    Crocodile: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M12 28 L24 28 L32 20 L52 28 L52 36 L12 36 Z" /><path d="M16 36 L16 44" /><path d="M24 36 L24 44" /><path d="M40 36 L40 44" /><path d="M48 36 L48 44" /><path d="M40 25 C41 24 42 24 43 25" /></svg>,
    Vulture: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M24 16 C24 12 28 12 32 16 C36 12 40 12 40 16 V28 H24 Z" /><path d="M24 28 L12 40 L20 40 L32 28 L44 40 L52 40 L40 28" /><path d="M32 28 V48" /></svg>,
    Hippo: ({ className }) => <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" xmlns="http://www.w3.org/2000/svg"><path d="M16 24 C16 16 48 16 48 24 V40 H16 Z" /><path d="M20 40 V48" /><path d="M44 40 V48" /><path d="M24 24 C24 22 26 20 28 20" /><path d="M40 24 C40 22 38 20 36 20" /></svg>,
};
const NORMAL_CARD_TYPES = ['Cat', 'Scarab', 'Falcon', 'Cobra', 'Anubis', 'Ibis'];
const HARD_CARD_TYPES = Object.keys(ANIMAL_ICONS);
const ALL_CARD_DATA = Object.keys(ANIMAL_ICONS);

// --- AUDIO ENGINE ---
const cardSynths = ALL_CARD_DATA.map(() => new Tone.Synth({ oscillator: { type: 'sine' } }).toDestination());
const specialSounds = { match: new Tone.Synth().toDestination(), mismatch: new Tone.Synth().toDestination(), win: new Tone.PolySynth(Tone.Synth).toDestination() };
const bgmPlayer = new Tone.Player({ url: "/autism_bgm.mp3", loop: true, autostart: false, volume: -12 }).toDestination();
const playSound = (cardId) => { if (Tone.context.state !== 'running') Tone.context.resume(); const freq = 220 * Math.pow(2, ((cardId % cardSynths.length) * 2) / 12); cardSynths[cardId % cardSynths.length].triggerAttackRelease(freq, '8n'); };
const playSpecialSound = (type) => { if (Tone.context.state !== 'running') Tone.context.resume(); const now = Tone.now(); if (type === 'match') { specialSounds.match.triggerAttackRelease('C4', '8n', now); specialSounds.match.triggerAttackRelease('G4', '8n', now + 0.2); } else if (type === 'mismatch') { specialSounds.mismatch.triggerAttackRelease('C3', '8n', now); } else if (type === 'win') { specialSounds.win.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '2n', now); } };
const speak = (text) => { if ('speechSynthesis' in window) { speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.rate = 1.2; speechSynthesis.speak(utterance); } };

// --- CARD COMPONENT ---
const Card = React.memo(({ card, onCardClick, isFlipped, isMatched, isHighlighted, isHighContrast, isHardMode }) => {
    const AnimalIcon = ANIMAL_ICONS[card.type];
    const handleSelect = () => !isFlipped && !isMatched && onCardClick(card);
    const frontBg = isHighContrast ? 'bg-white' : 'bg-yellow-400';
    const frontText = isHighContrast ? 'text-black' : 'text-yellow-900';
    const backBg = isHighContrast ? 'bg-black border-white' : 'bg-yellow-600 border-yellow-800';
    const backIcon = isHighContrast ? 'text-white' : 'text-yellow-900';
    
    const isFaceUp = !isHardMode || isFlipped || isMatched;

    return (
        <div className={`w-full h-full perspective-1000 ${isMatched ? 'opacity-60' : ''}`} onClick={handleSelect} role="button" aria-pressed={isFlipped} aria-label={`${card.type} card`}>
            <motion.div className="relative w-full h-full preserve-3d" 
                animate={{ rotateY: isFaceUp ? 180 : 0 }} 
                transition={{ duration: 0.6 }}>
                <div className={`absolute w-full h-full backface-hidden flex items-center justify-center rounded-lg shadow-lg ${isHighlighted ? 'ring-4 ring-cyan-400' : ''} ${backBg} border-2 overflow-hidden`}>
                    <CardBackPattern className={`w-full h-full p-2 ${backIcon}`} />
                </div>
                <div className={`absolute w-full h-full backface-hidden flex flex-col items-center justify-center rounded-lg shadow-lg border-2 ${frontBg} ${frontText} rotate-y-180`}>
                    <AnimalIcon className={`w-1/2 h-1/2 ${isHighContrast ? 'stroke-2' : ''}`} />
                    <p className="mt-2 text-lg font-bold">{card.type}</p>
                </div>
            </motion.div>
        </div>
    );
});

// --- TOGGLE COMPONENT FOR SETTINGS ---
const Toggle = ({ label, isEnabled, onToggle }) => (
    <label className="flex items-center justify-between space-x-4 cursor-pointer" onClick={onToggle}>
        <span>{label}</span>
        <div className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${isEnabled ? 'bg-green-500 justify-end' : 'bg-gray-500 justify-start'}`}>
            <motion.div layout className="w-4 h-4 bg-white rounded-full" />
        </div>
    </label>
);

// --- MAIN APP COMPONENT ---
export default function App() {
    const [gameState, setGameState] = useState('cover');
    const [isHardMode, setIsHardMode] = useState(false);
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [blindAssist, setBlindAssist] = useState(false);
    const [deafAssist, setDeafAssist] = useState(false);
    const [dyslexiaAssist, setDyslexiaAssist] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [showCorrectPopup, setShowCorrectPopup] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const holdTimeoutRef = useRef(null);
    const isHoldingRef = useRef(false);
    const hasInteracted = useRef(false);
    const isInitialMount = useRef(true);

    const isHighContrast = blindAssist;
    const isGuideMode = blindAssist;
    const useOpenDyslexic = dyslexiaAssist;

    const shuffleAndDeal = useCallback(() => {
        const cardTypes = isHardMode ? HARD_CARD_TYPES : NORMAL_CARD_TYPES;
        const doubledCards = [...cardTypes, ...cardTypes].map((type, index) => ({ id: index, type: type }))
            .sort(() => Math.random() - 0.5);
        setCards(doubledCards);
        setFlippedCards([]);
        setMatchedPairs([]);
        setMoves(0);
        setGameState('playing');
        setHighlightedIndex(-1);
    }, [isHardMode]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        shuffleAndDeal();
    }, [isHardMode, shuffleAndDeal]);

    const userInteraction = () => {
        if (!hasInteracted.current) {
            hasInteracted.current = true;
            if (Tone.context.state !== 'running') Tone.context.resume();
            if (!isMuted && bgmPlayer.state !== 'started') bgmPlayer.start();
        }
    };

    const handleCardClick = useCallback((clickedCard) => {
        userInteraction();
        const isAlreadyFlipped = flippedCards.some(c => c.id === clickedCard.id);
        if (flippedCards.length === 2 || gameState === 'won' || isAlreadyFlipped || matchedPairs.includes(clickedCard.type)) return;

        if (isGuideMode) speak(clickedCard.type);
        playSound(ALL_CARD_DATA.indexOf(clickedCard.type));
        const newFlippedCards = [...flippedCards, clickedCard];
        setFlippedCards(newFlippedCards);

        if (newFlippedCards.length === 2) {
            setMoves(m => m + 1);
            const [firstCard, secondCard] = newFlippedCards;
            if (firstCard.type === secondCard.type) {
                setMatchedPairs(prev => {
                    const newMatched = [...prev, firstCard.type];
                    const pairsToWin = isHardMode ? HARD_CARD_TYPES.length : NORMAL_CARD_TYPES.length;
                    if (newMatched.length === pairsToWin) {
                        setGameState('won');
                        playSpecialSound('win');
                        if (isGuideMode) speak(`You win! You matched all the cards in ${moves + 1} moves.`);
                    }
                    return newMatched;
                });
                setFlippedCards([]);
                playSpecialSound('match');
                if (isGuideMode) speak("Correct match!");
                if (deafAssist) {
                    setShowCorrectPopup(true);
                    setTimeout(() => setShowCorrectPopup(false), 1200);
                }
            } else {
                setTimeout(() => setFlippedCards([]), 1500);
            }
        }
    }, [flippedCards, gameState, isGuideMode, deafAssist, matchedPairs, moves, isHardMode]);
    
    const handleKeyDown = useCallback((e) => {
        if (e.code !== 'Space' || gameState !== 'playing') return;
        e.preventDefault(); userInteraction();
        if (!isHoldingRef.current) {
            isHoldingRef.current = true;
            holdTimeoutRef.current = setTimeout(() => {
                if (highlightedIndex !== -1) {
                    const cardToSelect = cards[highlightedIndex];
                    if (cardToSelect && !matchedPairs.includes(cardToSelect.type) && !flippedCards.some(c => c.id === cardToSelect.id)) {
                        handleCardClick(cardToSelect);
                    }
                }
                isHoldingRef.current = false;
            }, 500);
        }
    }, [highlightedIndex, cards, matchedPairs, flippedCards, gameState, handleCardClick]);

    const handleKeyUp = useCallback((e) => {
        if (e.code !== 'Space' || gameState !== 'playing') return;
        e.preventDefault();
        clearTimeout(holdTimeoutRef.current);
        if (isHoldingRef.current) {
            isHoldingRef.current = false;
            setHighlightedIndex(prev => {
                if (cards.length === 0) return -1;
                let nextIndex = (prev < 0 ? 0 : prev + 1) % cards.length;
                let attempts = 0;
                while (matchedPairs.includes(cards[nextIndex]?.type) && attempts < cards.length) {
                    nextIndex = (nextIndex + 1) % cards.length;
                    attempts++;
                }
                if (isGuideMode) speak(cards[nextIndex]?.type);
                return nextIndex;
            });
        }
    }, [cards, matchedPairs, gameState, isGuideMode]);
    
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            clearTimeout(holdTimeoutRef.current);
        };
    }, [handleKeyDown, handleKeyUp]);

    const toggleMute = () => {
        userInteraction();
        setIsMuted(current => {
            const newMutedState = !current;
            if (newMutedState) bgmPlayer.stop();
            else if (bgmPlayer.state !== 'started') bgmPlayer.start();
            return newMutedState;
        });
    };
    
    const themeClasses = isHighContrast ? 'bg-black text-white' : 'bg-stone-800 text-yellow-100';
    const fontClass = useOpenDyslexic ? 'font-opendyslexic' : 'font-opensans';

    if (gameState === 'cover') {
        return (
            <>
                <GlobalStyles />
                <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-stone-900">
                    <div className="bg-stone-800 bg-opacity-80 p-10 rounded-xl shadow-2xl text-center backdrop-blur-sm">
                        <h1 className="text-6xl font-bold mb-4 text-yellow-300" style={{ fontFamily: 'serif' }}>Egyptian Memory Match</h1>
                        <p className="text-yellow-100 text-xl mb-8">Test your memory with the symbols of ancient Egypt.</p>
                        <button onClick={shuffleAndDeal} className="px-12 py-4 bg-yellow-600 text-white font-bold text-2xl rounded-lg hover:bg-yellow-700 transition-transform transform hover:scale-105">Start Game</button>
                    </div>
                </div>
            </>
        );
    }
    
    return (
        <>
            <GlobalStyles />
            <div className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-500 ${themeClasses} ${fontClass}`}>
                <div className="absolute top-4 right-4 flex items-center space-x-2 z-30">
                    <button onClick={toggleMute} className="p-2 rounded-full bg-yellow-600 text-white hover:bg-yellow-700" aria-label="Toggle Music">{isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}</button>
                    <button onClick={shuffleAndDeal} className="p-2 rounded-full bg-yellow-600 text-white hover:bg-yellow-700" aria-label="New Game"><RefreshCw size={24} /></button>
                    <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-2 rounded-full bg-yellow-600 text-white hover:bg-yellow-700" aria-label="Settings"><Settings size={24} /></button>
                </div>
                <AnimatePresence>
                    {isSettingsOpen && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`absolute top-16 right-4 p-4 rounded-lg shadow-2xl z-30 ${isHighContrast ? 'bg-gray-800' : 'bg-yellow-800'} border-2`}>
                            <h3 className="text-lg font-bold mb-3">Game & Accessibility</h3>
                            <div className="space-y-3">
                                <Toggle label="Hard Mode" isEnabled={isHardMode} onToggle={() => setIsHardMode(!isHardMode)} />
                                <hr className="border-yellow-600"/>
                                <Toggle label="Blind Assist" isEnabled={blindAssist} onToggle={() => setBlindAssist(!blindAssist)} />
                                <Toggle label="Deaf Assist" isEnabled={deafAssist} onToggle={() => setDeafAssist(!deafAssist)} />
                                <Toggle label="Dyslexia Assist" isEnabled={dyslexiaAssist} onToggle={() => setDyslexiaAssist(!dyslexiaAssist)} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <h1 className="text-4xl md:text-5xl font-bold mb-1 text-center" style={{ fontFamily: 'serif' }}>Egyptian Memory Match</h1>
                <p className="mb-4 text-lg">Moves: {moves}</p>
                <div className={`grid ${isHardMode ? 'grid-cols-5' : 'grid-cols-4'} gap-2 md:gap-4 w-full ${isHardMode ? 'max-w-xl' : 'max-w-lg'} ${isHardMode ? 'aspect-[5/4]' : 'aspect-square'}`}>
                    {cards.map((card) => <Card key={card.id} card={card} onCardClick={handleCardClick} isFlipped={flippedCards.some(c => c.id === card.id)} isMatched={matchedPairs.includes(card.type)} isHighlighted={cards[highlightedIndex]?.id === card.id} isHighContrast={isHighContrast} isHardMode={isHardMode} />)}
                </div>
                <div className="mt-4 text-center h-10"><p className="text-sm"><span className="font-bold">Controls:</span> Click to flip. Or, use <span className="font-mono p-1 bg-gray-700 rounded">Spacebar</span> to cycle, and hold to select.</p></div>
                <AnimatePresence>
                    {showCorrectPopup && <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute bottom-10 px-6 py-3 bg-green-500 text-white text-2xl font-bold rounded-lg shadow-xl z-20">Correct!</motion.div>}
                    {gameState === 'won' && (
                        <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
                            <div className={`p-8 rounded-xl text-center shadow-2xl ${isHighContrast ? 'bg-gray-900' : 'bg-yellow-800'} border-4`}>
                                <Award className="w-24 h-24 mx-auto mb-4 text-yellow-400" />
                                <h2 className="text-4xl font-bold mb-2">You Win!</h2>
                                <p className="text-xl mb-6">Congratulations, you matched all the cards in {moves} moves.</p>
                                <button onClick={shuffleAndDeal} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">Play Again</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
