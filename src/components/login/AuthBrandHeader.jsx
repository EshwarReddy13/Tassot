import React from 'react';
import { Link } from 'react-router-dom';

const AuthBrandHeader = () => (
  <div className="absolute md:fixed top-0 left-0 z-30 flex items-center gap-2 sm:gap-3 p-2 sm:p-6 select-none pointer-events-none">
    <Link
      to="/login"
      aria-label="Go to login page"
      className="flex items-center gap-2 sm:gap-3 pointer-events-auto cursor-pointer"
    >
      <img
        src="/favicon.svg"
        alt="Tassot logo"
        className="w-8 h-8 md:w-16 md:h-16"
        draggable="false"
      />
      <span className="text-2xl md:text-3xl font-semibold tracking-tight text-white drop-shadow-sm" style={{letterSpacing: '0.05em'}}>
        Tassot
      </span>
    </Link>
  </div>
);

export default AuthBrandHeader; 