const ARCH_PATH =
  "M1071 2959 c-531 -104 -907 -730 -982 -1634 -32 -388 38 -1255 102 -1255 34 0 52 74 124 515 96 585 155 855 251 1145 190 570 468 878 810 897 343 20 601 -215 769 -697 96 -277 160 -611 230 -1205 50 -427 68 -525 92 -501 24 24 16 643 -11 891 -80 711 -282 1230 -606 1556 -159 160 -307 247 -482 283 -82 17 -224 19 -297 5z";

const ORVO_PATH =
  "M410 1007 c-215 -48 -350 -232 -350 -477 0 -208 91 -364 258 -443 64 -30 73 -32 187 -32 114 0 123 2 187 32 169 80 258 233 258 443 0 152 -35 250 -122 346 -105 114 -266 165 -418 131z m258 -107 c74 -39 110 -79 155 -170 31 -63 32 -68 32 -200 0 -131 -1 -137 -32 -202 -141 -299 -555 -267 -654 51 -58 188 5 411 143 503 102 69 247 76 356 18z M1800 1000 c-100 -27 -168 -70 -250 -158 l-68 -72 -7 110 -8 110 -33 0 -34 0 0 -460 0 -460 40 0 40 0 0 289 0 288 55 75 c62 86 139 150 222 184 70 28 214 33 281 10 l41 -15 12 36 c13 39 9 45 -41 62 -67 22 -169 23 -250 1z M3874 1005 c-84 -18 -138 -47 -206 -113 -96 -91 -138 -202 -138 -362 0 -213 87 -362 257 -443 65 -30 74 -32 189 -32 119 0 121 0 196 38 160 79 248 234 248 437 0 325 -246 539 -546 475z m246 -97 c143 -65 216 -208 208 -402 -8 -172 -77 -290 -206 -353 -85 -41 -212 -40 -296 1 -78 38 -131 93 -169 174 -31 65 -32 71 -32 202 0 147 15 198 81 286 89 116 273 158 414 92z M2384 938 c13 -29 79 -174 146 -323 67 -148 149 -332 183 -407 l61 -138 46 0 47 0 201 454 c111 249 202 456 202 460 0 3 -17 6 -39 6 l-38 0 -151 -342 c-83 -189 -165 -378 -183 -421 -18 -43 -36 -74 -40 -70 -6 7 -138 305 -329 743 l-37 85 -46 3 -46 3 23 -53z";

export function ArchMark({ className = "", mono = false }: { className?: string; mono?: boolean }) {
  return (
    <svg viewBox="0 0 256 305" className={className} style={{ height: "1em", width: "auto" }} role="img" aria-label="Norvo">
      <defs>
        <linearGradient id="norvoArcMark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={mono ? "currentColor" : "var(--norvo-violet)"} />
          <stop offset="100%" stopColor={mono ? "currentColor" : "var(--observatory-gold)"} />
        </linearGradient>
      </defs>
      <g transform="translate(0,305) scale(0.1,-0.1)" fill="url(#norvoArcMark)">
        <path d={ARCH_PATH} />
      </g>
    </svg>
  );
}

export default function Logo({ className = "", mono = false }: { className?: string; mono?: boolean }) {
  return (
    <svg viewBox="367 268 680 251" className={className} style={{ height: "1em", width: "auto" }} role="img" aria-label="Norvo Designs">
      <defs>
        <linearGradient id="norvoLockArc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={mono ? "currentColor" : "var(--norvo-violet)"} />
          <stop offset="100%" stopColor={mono ? "currentColor" : "var(--observatory-gold)"} />
        </linearGradient>
      </defs>
      <g transform="translate(370.6,271.6) scale(0.8) translate(0,305) scale(0.1,-0.1)" fill="url(#norvoLockArc)">
        <path d={ARCH_PATH} />
      </g>
      <g transform="translate(596,354) translate(0,108) scale(0.1,-0.1)" fill="currentColor">
        <path d={ORVO_PATH} />
      </g>
    </svg>
  );
}
