import React, { useState } from 'react';
import Experience from './components/Experience';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeState.TREE_SHAPE ? TreeState.SCATTERED : TreeState.TREE_SHAPE
    );
  };

  return (
    <div className="w-full h-screen relative bg-arix-green-dark">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Experience treeState={treeState} />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        {/* Header */}
        <header className="flex flex-col items-center md:items-start text-center md:text-left animate-fade-in-down">
          <h1 className="font-serif text-2xl md:text-5xl text-arix-gold tracking-widest drop-shadow-[0_2px_10px_rgba(212,175,55,0.5)]">
            MERRY CHRISTMAS
          </h1>
        </header>

        {/* Bottom Section: Controls & Footer */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          
          {/* Left Spacer (Hidden on Mobile) */}
          <div className="hidden md:block" />

          {/* Controls - Center Bottom */}
          <div className="flex justify-center pointer-events-auto order-1 md:order-2">
            <button 
              onClick={toggleState}
              className="group relative px-8 py-3 bg-transparent overflow-hidden transition-all duration-500 ease-out"
            >
              {/* Custom Border Effect */}
              <span className="absolute inset-0 w-full h-full border border-arix-gold opacity-30 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-arix-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></span>
              <span className="absolute top-0 left-0 w-full h-[1px] bg-arix-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center delay-75"></span>
              
              <div className="relative flex items-center space-x-3">
                <span className="font-serif text-arix-gold text-lg tracking-widest uppercase group-hover:text-white transition-colors duration-300">
                  {treeState === TreeState.TREE_SHAPE ? 'Release Magic' : 'Gather Spirit'}
                </span>
              </div>
              
              {/* Glow backing */}
              <div className="absolute inset-0 bg-arix-gold opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500"></div>
            </button>
          </div>

          {/* Footer / Status - Right Bottom */}
          <footer className="text-center md:text-right font-sans text-arix-gold-light opacity-60 text-xs tracking-widest flex flex-col items-center md:items-end order-2 md:order-3">
              <p>INTERACTIVE 3D EXPERIENCE</p>
              <p className="mt-1">{treeState === TreeState.TREE_SHAPE ? 'FORM: CONIFER' : 'FORM: AETHER'}</p>
          </footer>
        </div>
      </div>

      {/* Gradient Overlay for Cinematic Depth */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-arix-green-dark via-transparent to-transparent opacity-80"></div>
    </div>
  );
};

export default App;