import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Gamepad2, X, Maximize2, Minimize2, Info, ExternalLink } from 'lucide-react';
import gamesData from './games.json';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const categories = useMemo(() => {
    const cats = ['All', ...Array.from(new Set(gamesData.map((g) => g.category)))];
    return cats;
  }, []);

  const filteredGames = useMemo(() => {
    return gamesData.filter((game) => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           game.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block uppercase">
              SCHMUCK<span className="text-orange-500 underline decoration-2 underline-offset-4 ml-1">GAMES</span>
            </h1>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search unblocked games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-neutral-600"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 hidden md:block">
              {gamesData.length} Games Available
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {filteredGames.map((game) => (
            <motion.div
              layoutId={game.id}
              key={game.id}
              onClick={() => setSelectedGame(game)}
              className="group relative cursor-pointer bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-orange-500/50 transition-all shadow-lg"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={game.thumbnail}
                  alt={game.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-transparent" />
                <div className="absolute top-2 right-2 flex gap-1">
                   <div className="bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-orange-400 border border-orange-500/20">
                    {game.category}
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm mb-1 group-hover:text-orange-500 transition-colors truncate">
                  {game.title}
                </h3>
                <p className="text-xs text-neutral-500 line-clamp-1">
                  {game.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block p-4 bg-neutral-900 rounded-full mb-4">
              <Search className="w-8 h-8 text-neutral-600" />
            </div>
            <h3 className="text-lg font-bold mb-1">No games found</h3>
            <p className="text-neutral-500">Try searching for something else or check another category.</p>
          </div>
        )}
      </main>

      {/* Game Viewer Modal */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 lg:p-8"
          >
            <div 
              className="absolute inset-0 bg-neutral-950/95 backdrop-blur-xl" 
              onClick={() => {
                setSelectedGame(null);
                setIsFullscreen(false);
              }}
            />
            
            <motion.div
              layoutId={selectedGame.id}
              className={`relative bg-neutral-950 border border-neutral-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
                isFullscreen 
                  ? 'w-full h-full md:rounded-none border-none' 
                  : 'w-full h-full max-w-5xl max-h-[85vh] rounded-2xl'
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-neutral-700 hidden sm:block">
                    <img src={selectedGame.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">{selectedGame.title}</h2>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{selectedGame.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => window.open(selectedGame.url, '_blank')}
                    className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white hidden sm:block"
                    title="Toggle Theatre Mode"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGame(null);
                      setIsFullscreen(false);
                    }}
                    className="p-2 hover:bg-orange-600 rounded-full transition-colors text-neutral-400 hover:text-white"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Game Viewport */}
              <div className="flex-1 bg-black relative">
                <iframe
                  src={selectedGame.url}
                  className="w-full h-full border-none"
                  title={selectedGame.title}
                  allow="fullscreen; autoplay; gamepad"
                />
              </div>

              {/* Game Info Footer (only when not fullscreen) */}
              {!isFullscreen && (
                <div className="px-6 py-4 bg-neutral-900/50 border-t border-neutral-800 hidden md:block">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                        <Info className="w-4 h-4 text-orange-500" />
                        About this game
                      </h3>
                      <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
                        {selectedGame.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-20 border-t border-neutral-900 py-12 px-4 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-neutral-500" />
            </div>
            <span className="font-bold opacity-50 tracking-tighter">SCHMUCK GAMES HUB</span>
          </div>
          
          <div className="flex gap-8">
            <a href="#" className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors uppercase tracking-widest font-medium">Privacy</a>
            <a href="#" className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors uppercase tracking-widest font-medium">Terms</a>
            <a href="#" className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors uppercase tracking-widest font-medium">Contact</a>
          </div>

          <p className="text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} Schmuck Games. Built for fun.
          </p>
        </div>
      </footer>
    </div>
  );
}
