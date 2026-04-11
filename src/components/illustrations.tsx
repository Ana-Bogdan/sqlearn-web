/**
 * Animated geometric illustrations for SQLearn public pages.
 * Each layer floats independently; connection lines flow with
 * animated stroke-dashoffset to suggest data in motion.
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
      {/* Database table — top left, slow float */}
      <g className="float-a parallax-layer" style={{ ["--depth" as string]: "12px" }}>
        <rect x="32" y="48" width="160" height="120" rx="8" fill="#3E5570" opacity="0.12" />
        <rect x="32" y="48" width="160" height="32" rx="8" fill="#3E5570" opacity="0.25" />
        <rect x="44" y="56" width="40" height="6" rx="3" fill="#FFFFFB" />
        <rect x="92" y="56" width="56" height="6" rx="3" fill="#FFFFFB" opacity="0.6" />
        <rect x="156" y="56" width="24" height="6" rx="3" fill="#FFFFFB" opacity="0.4" />
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
      </g>

      {/* Query arrow flowing right — animated dash */}
      <path
        d="M200 108 C 232 108, 240 80, 272 80"
        stroke="#B999A4"
        strokeWidth="2"
        strokeDasharray="6 4"
        opacity="0.7"
        className="dash-flow"
      />
      <circle cx="272" cy="80" r="4" fill="#B999A4" opacity="0.8" className="pulse-soft" />

      {/* Result set — center right, different float curve */}
      <g className="float-b parallax-layer" style={{ ["--depth" as string]: "16px" }}>
        <rect x="280" y="40" width="168" height="96" rx="8" fill="#B999A4" opacity="0.12" />
        <rect x="280" y="40" width="168" height="28" rx="8" fill="#B999A4" opacity="0.22" />
        <rect x="292" y="48" width="32" height="5" rx="2.5" fill="#463C33" opacity="0.5" />
        <rect x="332" y="48" width="48" height="5" rx="2.5" fill="#463C33" opacity="0.35" />
        <rect x="388" y="48" width="48" height="5" rx="2.5" fill="#463C33" opacity="0.25" />
        <rect x="292" y="80" width="32" height="4" rx="2" fill="#B999A4" opacity="0.4" />
        <rect x="332" y="80" width="48" height="4" rx="2" fill="#B999A4" opacity="0.3" />
        <rect x="388" y="80" width="48" height="4" rx="2" fill="#B999A4" opacity="0.22" />
        <rect x="292" y="96" width="32" height="4" rx="2" fill="#B999A4" opacity="0.4" />
        <rect x="332" y="96" width="48" height="4" rx="2" fill="#B999A4" opacity="0.3" />
        <rect x="388" y="96" width="48" height="4" rx="2" fill="#B999A4" opacity="0.22" />
        <rect x="292" y="112" width="32" height="4" rx="2" fill="#B999A4" opacity="0.4" />
        <rect x="332" y="112" width="48" height="4" rx="2" fill="#B999A4" opacity="0.3" />
        <rect x="388" y="112" width="48" height="4" rx="2" fill="#B999A4" opacity="0.22" />
      </g>

      {/* Code block — bottom left, gentle drift */}
      <g className="float-c parallax-layer" style={{ ["--depth" as string]: "20px" }}>
        <rect x="56" y="216" width="180" height="140" rx="10" fill="#3E5570" opacity="0.92" />
        <rect x="56" y="216" width="180" height="28" rx="10" fill="#3E5570" />
        <circle cx="74" cy="230" r="4" fill="#B999A4" opacity="0.7" />
        <circle cx="86" cy="230" r="4" fill="#EFE9D8" opacity="0.6" />
        <circle cx="98" cy="230" r="4" fill="#FAF7F0" opacity="0.5" />
        <rect x="72" y="256" width="56" height="4" rx="2" fill="#B999A4" opacity="0.75" />
        <rect x="136" y="256" width="32" height="4" rx="2" fill="#FAF7F0" opacity="0.55" />
        <rect x="84" y="272" width="72" height="4" rx="2" fill="#FFFFFB" opacity="0.55" />
        <rect x="164" y="272" width="24" height="4" rx="2" fill="#B999A4" opacity="0.45" />
        <rect x="84" y="288" width="48" height="4" rx="2" fill="#FFFFFB" opacity="0.45" />
        <rect x="140" y="288" width="56" height="4" rx="2" fill="#EFE9D8" opacity="0.45" />
        <rect x="72" y="304" width="40" height="4" rx="2" fill="#B999A4" opacity="0.55" />
        <rect x="120" y="304" width="80" height="4" rx="2" fill="#FFFFFB" opacity="0.4" />
        <rect x="72" y="320" width="64" height="4" rx="2" fill="#FAF7F0" opacity="0.45" />
      </g>

      {/* Connecting line code → data nodes */}
      <path
        d="M244 286 C 280 286, 300 200, 340 176"
        stroke="#3E5570"
        strokeWidth="1.5"
        strokeDasharray="5 5"
        opacity="0.32"
        className="dash-flow-slow"
      />

      {/* Floating data nodes — independent drifts and pulses */}
      <g className="float-drift parallax-layer" style={{ ["--depth" as string]: "26px" }}>
        <circle cx="340" cy="176" r="20" fill="#3E5570" opacity="0.1" />
        <circle cx="340" cy="176" r="8" fill="#3E5570" opacity="0.28" className="pulse-soft" />
      </g>

      <g className="float-a parallax-layer" style={{ ["--depth" as string]: "30px" }}>
        <circle cx="400" cy="220" r="16" fill="#B999A4" opacity="0.12" />
        <circle cx="400" cy="220" r="6" fill="#B999A4" opacity="0.32" className="pulse-soft" />
      </g>

      <g className="float-b parallax-layer" style={{ ["--depth" as string]: "22px" }}>
        <circle cx="360" cy="280" r="24" fill="#3E5570" opacity="0.08" />
        <circle cx="360" cy="280" r="10" fill="#3E5570" opacity="0.2" className="pulse-soft" />
      </g>

      <g className="float-c parallax-layer" style={{ ["--depth" as string]: "34px" }}>
        <circle cx="428" cy="300" r="14" fill="#B999A4" opacity="0.1" />
        <circle cx="428" cy="300" r="5" fill="#B999A4" opacity="0.28" className="pulse-soft" />
      </g>

      {/* Inter-node connections — animated flow */}
      <line x1="348" y1="176" x2="394" y2="220" stroke="#3E5570" strokeWidth="1" strokeDasharray="3 3" opacity="0.2" className="dash-flow-slow" />
      <line x1="400" y1="226" x2="370" y2="270" stroke="#B999A4" strokeWidth="1" strokeDasharray="3 3" opacity="0.22" className="dash-flow-reverse" />
      <line x1="370" y1="280" x2="423" y2="300" stroke="#3E5570" strokeWidth="1" strokeDasharray="3 3" opacity="0.18" className="dash-flow-slow" />

      {/* Decorative twinkles */}
      <circle cx="20" cy="180" r="3" fill="#B999A4" className="twinkle" style={{ ["--twinkle-min" as string]: "0.1", ["--twinkle-max" as string]: "0.4" }} />
      <circle cx="460" cy="60" r="3" fill="#3E5570" className="twinkle-slow" style={{ ["--twinkle-min" as string]: "0.08", ["--twinkle-max" as string]: "0.32" }} />
      <circle cx="440" cy="360" r="4" fill="#B999A4" className="twinkle" style={{ ["--twinkle-min" as string]: "0.06", ["--twinkle-max" as string]: "0.28" }} />
      <circle cx="260" cy="360" r="3" fill="#3E5570" className="twinkle-slow" style={{ ["--twinkle-min" as string]: "0.06", ["--twinkle-max" as string]: "0.24" }} />
      <circle cx="12" cy="40" r="2" fill="#3E5570" className="twinkle" style={{ ["--twinkle-min" as string]: "0.05", ["--twinkle-max" as string]: "0.22" }} />
      <circle cx="240" cy="20" r="2" fill="#B999A4" className="twinkle-slow" style={{ ["--twinkle-min" as string]: "0.05", ["--twinkle-max" as string]: "0.2" }} />
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
      {/* Stacked table layers — perspective effect, gentle float */}
      <g className="float-a parallax-layer" style={{ ["--depth" as string]: "10px" }}>
        <rect x="40" y="80" width="240" height="8" rx="4" fill="#3E5570" opacity="0.06" />
        <rect x="48" y="72" width="224" height="8" rx="4" fill="#3E5570" opacity="0.08" />
        <rect x="56" y="52" width="208" height="24" rx="6" fill="#3E5570" opacity="0.14" />
        <rect x="68" y="58" width="48" height="5" rx="2.5" fill="#FFFFFB" opacity="0.65" />
        <rect x="124" y="58" width="64" height="5" rx="2.5" fill="#FFFFFB" opacity="0.45" />
        <rect x="196" y="58" width="40" height="5" rx="2.5" fill="#FFFFFB" opacity="0.35" />
      </g>

      {/* Central key/lock motif — three rings, each pulses independently */}
      <g className="float-b parallax-layer" style={{ ["--depth" as string]: "18px" }}>
        <circle cx="160" cy="180" r="48" fill="#3E5570" opacity="0.06" className="pulse-soft" style={{ ["--pulse-min" as string]: "0.05", ["--pulse-max" as string]: "0.1" }} />
        <circle cx="160" cy="180" r="32" fill="#3E5570" opacity="0.1" />
        <circle cx="160" cy="180" r="16" fill="#3E5570" opacity="0.18" />
        <circle cx="160" cy="180" r="6" fill="#B999A4" opacity="0.5" className="pulse-soft" style={{ ["--pulse-min" as string]: "0.4", ["--pulse-max" as string]: "0.7" }} />
      </g>

      {/* Radiating query paths — flowing dashes outward */}
      <path d="M128 180 C 80 180, 60 140, 60 120" stroke="#B999A4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" className="dash-flow" />
      <g className="float-c parallax-layer" style={{ ["--depth" as string]: "22px" }}>
        <circle cx="60" cy="120" r="8" fill="#B999A4" opacity="0.14" />
        <circle cx="60" cy="120" r="3" fill="#B999A4" opacity="0.4" className="pulse-soft" />
      </g>

      <path d="M192 180 C 240 180, 260 140, 260 120" stroke="#3E5570" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.28" className="dash-flow-slow" />
      <g className="float-drift parallax-layer" style={{ ["--depth" as string]: "24px" }}>
        <circle cx="260" cy="120" r="8" fill="#3E5570" opacity="0.12" />
        <circle cx="260" cy="120" r="3" fill="#3E5570" opacity="0.32" className="pulse-soft" />
      </g>

      <path d="M160 212 C 160 240, 120 260, 100 280" stroke="#B999A4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.32" className="dash-flow-reverse" />
      <g className="float-a parallax-layer" style={{ ["--depth" as string]: "20px" }}>
        <circle cx="100" cy="280" r="10" fill="#B999A4" opacity="0.1" />
        <circle cx="100" cy="280" r="4" fill="#B999A4" opacity="0.28" className="pulse-soft" />
      </g>

      <path d="M160 212 C 160 244, 200 264, 220 280" stroke="#3E5570" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.26" className="dash-flow" />
      <g className="float-b parallax-layer" style={{ ["--depth" as string]: "26px" }}>
        <circle cx="220" cy="280" r="10" fill="#3E5570" opacity="0.1" />
        <circle cx="220" cy="280" r="4" fill="#3E5570" opacity="0.26" className="pulse-soft" />
      </g>

      {/* Bottom data rows */}
      <g className="float-c parallax-layer" style={{ ["--depth" as string]: "8px" }}>
        <rect x="60" y="320" width="200" height="4" rx="2" fill="#3E5570" opacity="0.1" />
        <rect x="80" y="332" width="160" height="4" rx="2" fill="#B999A4" opacity="0.08" />
        <rect x="100" y="344" width="120" height="4" rx="2" fill="#3E5570" opacity="0.06" />
      </g>

      {/* Decorative twinkles */}
      <circle cx="40" cy="320" r="3" fill="#B999A4" className="twinkle" style={{ ["--twinkle-min" as string]: "0.08", ["--twinkle-max" as string]: "0.28" }} />
      <circle cx="280" cy="340" r="2" fill="#3E5570" className="twinkle-slow" style={{ ["--twinkle-min" as string]: "0.06", ["--twinkle-max" as string]: "0.22" }} />
      <circle cx="160" cy="380" r="2" fill="#B999A4" className="twinkle" style={{ ["--twinkle-min" as string]: "0.05", ["--twinkle-max" as string]: "0.2" }} />
      <circle cx="20" cy="40" r="2" fill="#3E5570" className="twinkle-slow" style={{ ["--twinkle-min" as string]: "0.05", ["--twinkle-max" as string]: "0.2" }} />
      <circle cx="300" cy="60" r="2" fill="#B999A4" className="twinkle" style={{ ["--twinkle-min" as string]: "0.05", ["--twinkle-max" as string]: "0.2" }} />
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
      {/* Table 1 — top, slow float */}
      <g className="float-a parallax-layer" style={{ ["--depth" as string]: "12px" }}>
        <rect x="100" y="40" width="120" height="64" rx="6" fill="#3E5570" opacity="0.12" />
        <rect x="100" y="40" width="120" height="20" rx="6" fill="#3E5570" opacity="0.2" />
        <rect x="112" y="46" width="32" height="4" rx="2" fill="#FFFFFB" opacity="0.65" />
        <rect x="152" y="46" width="48" height="4" rx="2" fill="#FFFFFB" opacity="0.4" />
        <rect x="112" y="72" width="32" height="3" rx="1.5" fill="#3E5570" opacity="0.22" />
        <rect x="152" y="72" width="48" height="3" rx="1.5" fill="#3E5570" opacity="0.16" />
        <rect x="112" y="84" width="32" height="3" rx="1.5" fill="#3E5570" opacity="0.22" />
        <rect x="152" y="84" width="48" height="3" rx="1.5" fill="#3E5570" opacity="0.16" />
      </g>

      {/* Connection down-left & down-right — flowing */}
      <path d="M130 104 C 130 132, 80 140, 80 160" stroke="#B999A4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" className="dash-flow" />
      <path d="M190 104 C 190 132, 240 140, 240 160" stroke="#3E5570" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.28" className="dash-flow-slow" />

      {/* Table 2 — left */}
      <g className="float-b parallax-layer" style={{ ["--depth" as string]: "16px" }}>
        <rect x="20" y="160" width="120" height="72" rx="6" fill="#B999A4" opacity="0.12" />
        <rect x="20" y="160" width="120" height="20" rx="6" fill="#B999A4" opacity="0.2" />
        <rect x="32" y="166" width="40" height="4" rx="2" fill="#463C33" opacity="0.45" />
        <rect x="80" y="166" width="40" height="4" rx="2" fill="#463C33" opacity="0.28" />
        <rect x="32" y="192" width="40" height="3" rx="1.5" fill="#B999A4" opacity="0.28" />
        <rect x="80" y="192" width="40" height="3" rx="1.5" fill="#B999A4" opacity="0.2" />
        <rect x="32" y="204" width="40" height="3" rx="1.5" fill="#B999A4" opacity="0.28" />
        <rect x="80" y="204" width="40" height="3" rx="1.5" fill="#B999A4" opacity="0.2" />
        <rect x="32" y="216" width="40" height="3" rx="1.5" fill="#B999A4" opacity="0.22" />
        <rect x="80" y="216" width="40" height="3" rx="1.5" fill="#B999A4" opacity="0.16" />
      </g>

      {/* Table 3 — right */}
      <g className="float-c parallax-layer" style={{ ["--depth" as string]: "18px" }}>
        <rect x="180" y="160" width="120" height="72" rx="6" fill="#3E5570" opacity="0.12" />
        <rect x="180" y="160" width="120" height="20" rx="6" fill="#3E5570" opacity="0.2" />
        <rect x="192" y="166" width="36" height="4" rx="2" fill="#FFFFFB" opacity="0.55" />
        <rect x="236" y="166" width="44" height="4" rx="2" fill="#FFFFFB" opacity="0.32" />
        <rect x="192" y="192" width="36" height="3" rx="1.5" fill="#3E5570" opacity="0.22" />
        <rect x="236" y="192" width="44" height="3" rx="1.5" fill="#3E5570" opacity="0.16" />
        <rect x="192" y="204" width="36" height="3" rx="1.5" fill="#3E5570" opacity="0.22" />
        <rect x="236" y="204" width="44" height="3" rx="1.5" fill="#3E5570" opacity="0.16" />
        <rect x="192" y="216" width="36" height="3" rx="1.5" fill="#3E5570" opacity="0.16" />
        <rect x="236" y="216" width="44" height="3" rx="1.5" fill="#3E5570" opacity="0.13" />
      </g>

      {/* Join indicator — center, pulses */}
      <path d="M140 200 C 152 200, 160 196, 180 196" stroke="#463C33" strokeWidth="1.5" opacity="0.18" />
      <g className="float-drift parallax-layer" style={{ ["--depth" as string]: "8px" }}>
        <circle cx="160" cy="198" r="10" fill="#463C33" opacity="0.08" className="pulse-soft" style={{ ["--pulse-min" as string]: "0.06", ["--pulse-max" as string]: "0.14" }} />
        <circle cx="160" cy="198" r="4" fill="#463C33" opacity="0.18" className="pulse-soft" style={{ ["--pulse-min" as string]: "0.14", ["--pulse-max" as string]: "0.32" }} />
      </g>

      {/* Result flowing down */}
      <path d="M160 198 C 160 240, 160 256, 160 272" stroke="#B999A4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.32" className="dash-flow" />

      {/* Result block — bottom center */}
      <g className="float-a parallax-layer" style={{ ["--depth" as string]: "14px" }}>
        <rect x="60" y="280" width="200" height="80" rx="8" fill="#3E5570" opacity="0.08" />
        <rect x="60" y="280" width="200" height="24" rx="8" fill="#3E5570" opacity="0.12" />
        <rect x="76" y="288" width="28" height="4" rx="2" fill="#463C33" opacity="0.35" />
        <rect x="112" y="288" width="44" height="4" rx="2" fill="#463C33" opacity="0.22" />
        <rect x="164" y="288" width="36" height="4" rx="2" fill="#463C33" opacity="0.22" />
        <rect x="208" y="288" width="36" height="4" rx="2" fill="#463C33" opacity="0.16" />
        <rect x="76" y="316" width="28" height="3" rx="1.5" fill="#3E5570" opacity="0.18" />
        <rect x="112" y="316" width="44" height="3" rx="1.5" fill="#3E5570" opacity="0.14" />
        <rect x="164" y="316" width="36" height="3" rx="1.5" fill="#3E5570" opacity="0.14" />
        <rect x="208" y="316" width="36" height="3" rx="1.5" fill="#3E5570" opacity="0.12" />
        <rect x="76" y="332" width="28" height="3" rx="1.5" fill="#B999A4" opacity="0.22" />
        <rect x="112" y="332" width="44" height="3" rx="1.5" fill="#B999A4" opacity="0.18" />
        <rect x="164" y="332" width="36" height="3" rx="1.5" fill="#B999A4" opacity="0.18" />
        <rect x="208" y="332" width="36" height="3" rx="1.5" fill="#B999A4" opacity="0.14" />
        <rect x="76" y="348" width="28" height="3" rx="1.5" fill="#3E5570" opacity="0.14" />
        <rect x="112" y="348" width="44" height="3" rx="1.5" fill="#3E5570" opacity="0.12" />
      </g>

      {/* Decorative twinkles */}
      <circle cx="30" cy="120" r="3" fill="#B999A4" className="twinkle" style={{ ["--twinkle-min" as string]: "0.08", ["--twinkle-max" as string]: "0.3" }} />
      <circle cx="290" cy="260" r="3" fill="#3E5570" className="twinkle-slow" style={{ ["--twinkle-min" as string]: "0.06", ["--twinkle-max" as string]: "0.24" }} />
      <circle cx="160" cy="385" r="2" fill="#B999A4" className="twinkle" style={{ ["--twinkle-min" as string]: "0.05", ["--twinkle-max" as string]: "0.2" }} />
      <circle cx="14" cy="60" r="2" fill="#3E5570" className="twinkle-slow" style={{ ["--twinkle-min" as string]: "0.05", ["--twinkle-max" as string]: "0.2" }} />
      <circle cx="306" cy="40" r="2" fill="#B999A4" className="twinkle" style={{ ["--twinkle-min" as string]: "0.05", ["--twinkle-max" as string]: "0.2" }} />
    </svg>
  );
}
