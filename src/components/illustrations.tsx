/**
 * Abstract geometric illustrations for SQLearn public pages.
 * Database tables, query flows, and connected data nodes
 * rendered in the brand palette (Dusk, Light Mauve, Taupe, Pale Oak).
 */

export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Database table — top left */}
      <rect x="32" y="48" width="160" height="120" rx="8" fill="#3E5570" opacity="0.12" />
      <rect x="32" y="48" width="160" height="32" rx="8" fill="#3E5570" opacity="0.25" />
      <rect x="44" y="56" width="40" height="6" rx="3" fill="#F5ECDF" />
      <rect x="92" y="56" width="56" height="6" rx="3" fill="#F5ECDF" opacity="0.6" />
      <rect x="156" y="56" width="24" height="6" rx="3" fill="#F5ECDF" opacity="0.4" />
      {/* Table rows */}
      <rect x="44" y="92" width="40" height="4" rx="2" fill="#3E5570" opacity="0.3" />
      <rect x="92" y="92" width="56" height="4" rx="2" fill="#3E5570" opacity="0.2" />
      <rect x="156" y="92" width="24" height="4" rx="2" fill="#3E5570" opacity="0.15" />
      <rect x="44" y="108" width="40" height="4" rx="2" fill="#3E5570" opacity="0.3" />
      <rect x="92" y="108" width="56" height="4" rx="2" fill="#3E5570" opacity="0.2" />
      <rect x="156" y="108" width="24" height="4" rx="2" fill="#3E5570" opacity="0.15" />
      <rect x="44" y="124" width="40" height="4" rx="2" fill="#3E5570" opacity="0.3" />
      <rect x="92" y="124" width="56" height="4" rx="2" fill="#3E5570" opacity="0.2" />
      <rect x="156" y="124" width="24" height="4" rx="2" fill="#3E5570" opacity="0.15" />
      <rect x="44" y="140" width="40" height="4" rx="2" fill="#B999A4" opacity="0.5" />
      <rect x="92" y="140" width="56" height="4" rx="2" fill="#B999A4" opacity="0.35" />
      <rect x="156" y="140" width="24" height="4" rx="2" fill="#B999A4" opacity="0.25" />

      {/* Query arrow flowing right */}
      <path d="M200 108 C 232 108, 240 80, 272 80" stroke="#B999A4" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
      <circle cx="272" cy="80" r="4" fill="#B999A4" opacity="0.8" />

      {/* Result set — center right */}
      <rect x="280" y="40" width="168" height="96" rx="8" fill="#B999A4" opacity="0.1" />
      <rect x="280" y="40" width="168" height="28" rx="8" fill="#B999A4" opacity="0.2" />
      <rect x="292" y="48" width="32" height="5" rx="2.5" fill="#463C33" opacity="0.5" />
      <rect x="332" y="48" width="48" height="5" rx="2.5" fill="#463C33" opacity="0.35" />
      <rect x="388" y="48" width="48" height="5" rx="2.5" fill="#463C33" opacity="0.25" />
      <rect x="292" y="80" width="32" height="4" rx="2" fill="#B999A4" opacity="0.35" />
      <rect x="332" y="80" width="48" height="4" rx="2" fill="#B999A4" opacity="0.25" />
      <rect x="388" y="80" width="48" height="4" rx="2" fill="#B999A4" opacity="0.2" />
      <rect x="292" y="96" width="32" height="4" rx="2" fill="#B999A4" opacity="0.35" />
      <rect x="332" y="96" width="48" height="4" rx="2" fill="#B999A4" opacity="0.25" />
      <rect x="388" y="96" width="48" height="4" rx="2" fill="#B999A4" opacity="0.2" />
      <rect x="292" y="112" width="32" height="4" rx="2" fill="#B999A4" opacity="0.35" />
      <rect x="332" y="112" width="48" height="4" rx="2" fill="#B999A4" opacity="0.25" />
      <rect x="388" y="112" width="48" height="4" rx="2" fill="#B999A4" opacity="0.2" />

      {/* Code block — bottom left */}
      <rect x="56" y="216" width="180" height="140" rx="10" fill="#3E5570" opacity="0.9" />
      <rect x="56" y="216" width="180" height="28" rx="10" fill="#3E5570" />
      {/* Window dots */}
      <circle cx="74" cy="230" r="4" fill="#B999A4" opacity="0.6" />
      <circle cx="86" cy="230" r="4" fill="#CDB896" opacity="0.5" />
      <circle cx="98" cy="230" r="4" fill="#DECAA9" opacity="0.4" />
      {/* Code lines */}
      <rect x="72" y="256" width="56" height="4" rx="2" fill="#B999A4" opacity="0.7" />
      <rect x="136" y="256" width="32" height="4" rx="2" fill="#DECAA9" opacity="0.5" />
      <rect x="84" y="272" width="72" height="4" rx="2" fill="#F5ECDF" opacity="0.5" />
      <rect x="164" y="272" width="24" height="4" rx="2" fill="#B999A4" opacity="0.4" />
      <rect x="84" y="288" width="48" height="4" rx="2" fill="#F5ECDF" opacity="0.4" />
      <rect x="140" y="288" width="56" height="4" rx="2" fill="#CDB896" opacity="0.4" />
      <rect x="72" y="304" width="40" height="4" rx="2" fill="#B999A4" opacity="0.5" />
      <rect x="120" y="304" width="80" height="4" rx="2" fill="#F5ECDF" opacity="0.35" />
      <rect x="72" y="320" width="64" height="4" rx="2" fill="#DECAA9" opacity="0.4" />

      {/* Connecting lines from code to result */}
      <path d="M244 286 C 280 286, 300 200, 340 176" stroke="#3E5570" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.25" />

      {/* Floating data nodes — right side */}
      <circle cx="340" cy="176" r="20" fill="#3E5570" opacity="0.08" />
      <circle cx="340" cy="176" r="8" fill="#3E5570" opacity="0.2" />

      <circle cx="400" cy="220" r="16" fill="#B999A4" opacity="0.1" />
      <circle cx="400" cy="220" r="6" fill="#B999A4" opacity="0.25" />

      <circle cx="360" cy="280" r="24" fill="#3E5570" opacity="0.06" />
      <circle cx="360" cy="280" r="10" fill="#3E5570" opacity="0.15" />

      <circle cx="428" cy="300" r="14" fill="#B999A4" opacity="0.08" />
      <circle cx="428" cy="300" r="5" fill="#B999A4" opacity="0.2" />

      {/* Node connections */}
      <line x1="348" y1="176" x2="394" y2="220" stroke="#3E5570" strokeWidth="1" opacity="0.12" />
      <line x1="400" y1="226" x2="370" y2="270" stroke="#B999A4" strokeWidth="1" opacity="0.12" />
      <line x1="370" y1="280" x2="423" y2="300" stroke="#3E5570" strokeWidth="1" opacity="0.1" />

      {/* Decorative dots */}
      <circle cx="20" cy="180" r="3" fill="#B999A4" opacity="0.2" />
      <circle cx="460" cy="60" r="3" fill="#3E5570" opacity="0.15" />
      <circle cx="440" cy="360" r="4" fill="#B999A4" opacity="0.12" />
      <circle cx="260" cy="360" r="3" fill="#3E5570" opacity="0.1" />
    </svg>
  );
}

export function LoginIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Stacked table layers — perspective effect */}
      <rect x="40" y="80" width="240" height="8" rx="4" fill="#3E5570" opacity="0.06" />
      <rect x="48" y="72" width="224" height="8" rx="4" fill="#3E5570" opacity="0.08" />
      <rect x="56" y="52" width="208" height="24" rx="6" fill="#3E5570" opacity="0.12" />
      <rect x="68" y="58" width="48" height="5" rx="2.5" fill="#F5ECDF" opacity="0.6" />
      <rect x="124" y="58" width="64" height="5" rx="2.5" fill="#F5ECDF" opacity="0.4" />
      <rect x="196" y="58" width="40" height="5" rx="2.5" fill="#F5ECDF" opacity="0.3" />

      {/* Central key/lock motif */}
      <circle cx="160" cy="180" r="48" fill="#3E5570" opacity="0.06" />
      <circle cx="160" cy="180" r="32" fill="#3E5570" opacity="0.08" />
      <circle cx="160" cy="180" r="16" fill="#3E5570" opacity="0.15" />
      <circle cx="160" cy="180" r="6" fill="#B999A4" opacity="0.4" />

      {/* Radiating query paths */}
      <path d="M128 180 C 80 180, 60 140, 60 120" stroke="#B999A4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.3" />
      <circle cx="60" cy="120" r="8" fill="#B999A4" opacity="0.12" />
      <circle cx="60" cy="120" r="3" fill="#B999A4" opacity="0.3" />

      <path d="M192 180 C 240 180, 260 140, 260 120" stroke="#3E5570" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.2" />
      <circle cx="260" cy="120" r="8" fill="#3E5570" opacity="0.1" />
      <circle cx="260" cy="120" r="3" fill="#3E5570" opacity="0.25" />

      <path d="M160 212 C 160 240, 120 260, 100 280" stroke="#B999A4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.25" />
      <circle cx="100" cy="280" r="10" fill="#B999A4" opacity="0.08" />
      <circle cx="100" cy="280" r="4" fill="#B999A4" opacity="0.2" />

      <path d="M160 212 C 160 244, 200 264, 220 280" stroke="#3E5570" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.2" />
      <circle cx="220" cy="280" r="10" fill="#3E5570" opacity="0.08" />
      <circle cx="220" cy="280" r="4" fill="#3E5570" opacity="0.2" />

      {/* Bottom data rows */}
      <rect x="60" y="320" width="200" height="4" rx="2" fill="#3E5570" opacity="0.08" />
      <rect x="80" y="332" width="160" height="4" rx="2" fill="#B999A4" opacity="0.06" />
      <rect x="100" y="344" width="120" height="4" rx="2" fill="#3E5570" opacity="0.05" />

      {/* Decorative */}
      <circle cx="40" cy="320" r="3" fill="#B999A4" opacity="0.15" />
      <circle cx="280" cy="340" r="2" fill="#3E5570" opacity="0.12" />
      <circle cx="160" cy="380" r="2" fill="#B999A4" opacity="0.1" />
    </svg>
  );
}

export function RegisterIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Growing schema — tables connecting */}
      {/* Table 1 — top */}
      <rect x="100" y="40" width="120" height="64" rx="6" fill="#3E5570" opacity="0.1" />
      <rect x="100" y="40" width="120" height="20" rx="6" fill="#3E5570" opacity="0.18" />
      <rect x="112" y="46" width="32" height="4" rx="2" fill="#F5ECDF" opacity="0.6" />
      <rect x="152" y="46" width="48" height="4" rx="2" fill="#F5ECDF" opacity="0.35" />
      <rect x="112" y="72" width="32" height="3" rx="1.5" fill="#3E5570" opacity="0.2" />
      <rect x="152" y="72" width="48" height="3" rx="1.5" fill="#3E5570" opacity="0.15" />
      <rect x="112" y="84" width="32" height="3" rx="1.5" fill="#3E5570" opacity="0.2" />
      <rect x="152" y="84" width="48" height="3" rx="1.5" fill="#3E5570" opacity="0.15" />

      {/* Connection down-left */}
      <path d="M130 104 C 130 132, 80 140, 80 160" stroke="#B999A4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.3" />
      {/* Connection down-right */}
      <path d="M190 104 C 190 132, 240 140, 240 160" stroke="#3E5570" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.2" />

      {/* Table 2 — left */}
      <rect x="20" y="160" width="120" height="72" rx="6" fill="#B999A4" opacity="0.1" />
      <rect x="20" y="160" width="120" height="20" rx="6" fill="#B999A4" opacity="0.18" />
      <rect x="32" y="166" width="40" height="4" rx="2" fill="#463C33" opacity="0.4" />
      <rect x="80" y="166" width="40" height="4" rx="2" fill="#463C33" opacity="0.25" />
      <rect x="32" y="192" width="40" height="3" rx="1.5" fill="#B999A4" opacity="0.25" />
      <rect x="80" y="192" width="40" height="3" rx="1.5" fill="#B999A4" opacity="0.18" />
      <rect x="32" y="204" width="40" height="3" rx="1.5" fill="#B999A4" opacity="0.25" />
      <rect x="80" y="204" width="40" height="3" rx="1.5" fill="#B999A4" opacity="0.18" />
      <rect x="32" y="216" width="40" height="3" rx="1.5" fill="#B999A4" opacity="0.2" />
      <rect x="80" y="216" width="40" height="3" rx="1.5" fill="#B999A4" opacity="0.14" />

      {/* Table 3 — right */}
      <rect x="180" y="160" width="120" height="72" rx="6" fill="#3E5570" opacity="0.1" />
      <rect x="180" y="160" width="120" height="20" rx="6" fill="#3E5570" opacity="0.18" />
      <rect x="192" y="166" width="36" height="4" rx="2" fill="#F5ECDF" opacity="0.5" />
      <rect x="236" y="166" width="44" height="4" rx="2" fill="#F5ECDF" opacity="0.3" />
      <rect x="192" y="192" width="36" height="3" rx="1.5" fill="#3E5570" opacity="0.2" />
      <rect x="236" y="192" width="44" height="3" rx="1.5" fill="#3E5570" opacity="0.15" />
      <rect x="192" y="204" width="36" height="3" rx="1.5" fill="#3E5570" opacity="0.2" />
      <rect x="236" y="204" width="44" height="3" rx="1.5" fill="#3E5570" opacity="0.15" />
      <rect x="192" y="216" width="36" height="3" rx="1.5" fill="#3E5570" opacity="0.15" />
      <rect x="236" y="216" width="44" height="3" rx="1.5" fill="#3E5570" opacity="0.12" />

      {/* Join indicator — center */}
      <path d="M140 200 C 152 200, 160 196, 180 196" stroke="#463C33" strokeWidth="1.5" opacity="0.15" />
      <circle cx="160" cy="198" r="10" fill="#463C33" opacity="0.06" />
      <circle cx="160" cy="198" r="4" fill="#463C33" opacity="0.12" />

      {/* Result flowing down */}
      <path d="M160 198 C 160 240, 160 256, 160 272" stroke="#B999A4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.25" />

      {/* Result block — bottom center */}
      <rect x="60" y="280" width="200" height="80" rx="8" fill="#3E5570" opacity="0.06" />
      <rect x="60" y="280" width="200" height="24" rx="8" fill="#3E5570" opacity="0.1" />
      <rect x="76" y="288" width="28" height="4" rx="2" fill="#463C33" opacity="0.3" />
      <rect x="112" y="288" width="44" height="4" rx="2" fill="#463C33" opacity="0.2" />
      <rect x="164" y="288" width="36" height="4" rx="2" fill="#463C33" opacity="0.2" />
      <rect x="208" y="288" width="36" height="4" rx="2" fill="#463C33" opacity="0.15" />
      <rect x="76" y="316" width="28" height="3" rx="1.5" fill="#3E5570" opacity="0.15" />
      <rect x="112" y="316" width="44" height="3" rx="1.5" fill="#3E5570" opacity="0.12" />
      <rect x="164" y="316" width="36" height="3" rx="1.5" fill="#3E5570" opacity="0.12" />
      <rect x="208" y="316" width="36" height="3" rx="1.5" fill="#3E5570" opacity="0.1" />
      <rect x="76" y="332" width="28" height="3" rx="1.5" fill="#B999A4" opacity="0.2" />
      <rect x="112" y="332" width="44" height="3" rx="1.5" fill="#B999A4" opacity="0.15" />
      <rect x="164" y="332" width="36" height="3" rx="1.5" fill="#B999A4" opacity="0.15" />
      <rect x="208" y="332" width="36" height="3" rx="1.5" fill="#B999A4" opacity="0.12" />
      <rect x="76" y="348" width="28" height="3" rx="1.5" fill="#3E5570" opacity="0.12" />
      <rect x="112" y="348" width="44" height="3" rx="1.5" fill="#3E5570" opacity="0.1" />

      {/* Decorative */}
      <circle cx="30" cy="120" r="3" fill="#B999A4" opacity="0.15" />
      <circle cx="290" cy="260" r="3" fill="#3E5570" opacity="0.12" />
      <circle cx="160" cy="385" r="2" fill="#B999A4" opacity="0.1" />
    </svg>
  );
}
