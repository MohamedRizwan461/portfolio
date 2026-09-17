/**
 * Small looping scenes that stand in for missing photos. Pure SVG + CSS, themed
 * from the site's variables, and still under prefers-reduced-motion.
 */

type P = { className?: string };

/** A small autonomous car on a road, lane marks rushing past, sensor waves ahead. */
export function CarScene({ className = "" }: P) {
  return (
    <svg viewBox="0 0 240 120" className={className} role="img" aria-label="A small autonomous car driving with its sensors scanning ahead">
      <rect width="240" height="120" fill="var(--surface-2)" />
      <rect y="70" width="240" height="34" fill="color-mix(in srgb, var(--ink) 10%, transparent)" />
      <g className="il-lanes">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={i * 44} y="86" width="22" height="3" rx="1.5" fill="var(--ink-2)" opacity="0.7" />
        ))}
      </g>
      {/* sensor waves */}
      <g className="il-waves" fill="none" stroke="var(--accent)" strokeWidth="2">
        <path d="M150 62 q10 -14 0 -28" opacity="0.9" />
        <path d="M162 68 q16 -20 0 -40" opacity="0.6" />
        <path d="M174 74 q22 -26 0 -52" opacity="0.35" />
      </g>
      <g className="il-bob">
        <path d="M58 76 L66 58 Q70 52 80 52 L112 52 Q122 52 128 60 L140 70 Q146 72 146 78 L146 82 L54 82 L54 80 Q54 77 58 76 Z" fill="var(--accent)" />
        <path d="M72 58 L80 55 L100 55 L100 67 L68 67 Z M104 55 L114 55 Q120 56 126 66 L104 67 Z" fill="var(--surface)" opacity="0.85" />
        <rect x="136" y="72" width="8" height="4" rx="1" fill="#fff6c2" />
        {[74, 126].map((cx) => (
          <g key={cx} transform={`translate(${cx} 84)`}>
            <g className="il-spin">
              <circle r="9" fill="var(--ink)" />
              <circle r="4" fill="var(--surface-2)" />
              <rect x="-1" y="-8" width="2" height="16" fill="var(--surface-2)" />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}

/** A camera eye scanning, locking a detection box onto a hand. */
export function VisionScene({ className = "" }: P) {
  return (
    <svg viewBox="0 0 240 120" className={className} role="img" aria-label="A camera eye scanning and detecting a hand">
      <rect width="240" height="120" fill="var(--surface-2)" />
      {/* camera body */}
      <g transform="translate(58 60)">
        <rect x="-38" y="-26" width="64" height="52" rx="10" fill="var(--ink)" opacity="0.9" />
        <rect x="-30" y="-34" width="18" height="10" rx="3" fill="var(--ink)" opacity="0.9" />
        <circle r="20" fill="var(--surface)" />
        <g className="il-look">
          <circle r="12" fill="var(--accent)" />
          <circle r="5" fill="var(--ink)" />
          <circle cx="-4" cy="-4" r="2" fill="#fff" />
        </g>
      </g>
      {/* hand with landmarks */}
      <g transform="translate(170 62)">
        <g className="il-hand" fill="none" stroke="var(--ink-2)" strokeWidth="3" strokeLinecap="round">
          <path d="M0 26 L0 0 M-12 22 L-16 -2 M12 22 L16 -2 M-20 30 L-30 12 M8 -2 L10 -22 M-4 -2 L-4 -26" />
        </g>
        {[
          [0, 26], [0, 0], [-16, -2], [16, -2], [-30, 12], [10, -22], [-4, -26],
        ].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="2.6" fill="var(--accent)" className="il-blink" />
        ))}
        <rect x="-40" y="-36" width="64" height="72" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="6 4" className="il-lock" />
      </g>
      <path d="M92 60 L128 50 M92 60 L128 72" stroke="var(--accent)" strokeWidth="1.5" opacity="0.4" className="il-beam" />
    </svg>
  );
}

/** A breadboard with a blinking LED and a scope trace drawing itself. */
export function ProtoScene({ className = "" }: P) {
  return (
    <svg viewBox="0 0 240 120" className={className} role="img" aria-label="An oscilloscope trace and a breadboard with a blinking LED">
      <rect width="240" height="120" fill="var(--surface-2)" />
      {/* scope */}
      <rect x="12" y="14" width="120" height="92" rx="6" fill="var(--ink)" opacity="0.92" />
      <rect x="20" y="22" width="104" height="70" rx="3" fill="#07110d" />
      <g stroke="#1d3a2e" strokeWidth="0.6">
        {[40, 58, 76, 94, 112].map((x) => <line key={x} x1={x} y1="22" x2={x} y2="92" />)}
        {[36, 50, 64, 78].map((y) => <line key={y} x1="20" y1={y} x2="124" y2={y} />)}
      </g>
      <path d="M20 64 H34 V40 H52 V64 H70 V40 H88 V64 H106 V40 H124" fill="none" stroke="#35d6ff" strokeWidth="2" className="il-trace" />
      {/* breadboard */}
      <rect x="146" y="46" width="82" height="56" rx="4" fill="#e9e3d2" />
      {[0, 1, 2, 3, 4, 5, 6].map((c) =>
        [0, 1, 2, 3].map((r) => <circle key={`${c}${r}`} cx={154 + c * 11} cy={58 + r * 11} r="1.4" fill="#9c9582" />),
      )}
      <path d="M160 58 C160 30 200 30 200 58" fill="none" stroke="var(--accent)" strokeWidth="3" />
      <rect x="176" y="62" width="14" height="6" rx="1" fill="#6b5b3e" />
      <g transform="translate(212 60)">
        <circle r="7" fill="#ff4d4f" className="il-led" />
        <rect x="-4" y="6" width="2" height="10" fill="#9c9582" />
        <rect x="2" y="6" width="2" height="10" fill="#9c9582" />
      </g>
    </svg>
  );
}

/** Two controllers talking over a two-wire CAN bus, frames travelling both ways. */
export function CanBusScene({ className = "" }: P) {
  return (
    <svg viewBox="0 0 240 120" className={className} role="img" aria-label="Two controllers exchanging messages over a CAN bus">
      <rect width="240" height="120" fill="var(--surface-2)" />
      <line x1="30" y1="54" x2="210" y2="54" stroke="var(--accent)" strokeWidth="3" />
      <line x1="30" y1="66" x2="210" y2="66" stroke="var(--ink-2)" strokeWidth="3" />
      {[
        { x: 18, label: "SHIFT ECU" },
        { x: 170, label: "GEARBOX ECU" },
      ].map((n) => (
        <g key={n.label}>
          <rect x={n.x} y="36" width="52" height="48" rx="5" fill="var(--ink)" />
          <rect x={n.x + 8} y="46" width="36" height="20" rx="2" fill="var(--surface)" />
          <text x={n.x + 26} y="98" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="var(--ink-2)">
            {n.label}
          </text>
          <circle cx={n.x + 44} cy="76" r="2.4" fill="#22c55e" className="il-led" />
        </g>
      ))}
      <g className="il-frame-right">
        <rect x="70" y="48" width="34" height="12" rx="2" fill="var(--accent)" />
        <text x="87" y="57" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="var(--accent-ink)">D3 40</text>
      </g>
      <g className="il-frame-left">
        <rect x="136" y="60" width="30" height="12" rx="2" fill="var(--ink-2)" />
        <text x="151" y="69" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="var(--surface)">ACK</text>
      </g>
      <text x="120" y="22" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="var(--ink-2)">
        CAN 0x18F00500
      </text>
    </svg>
  );
}

/** A schematic trace drawing itself between two components, for "electronics". */
export function CircuitScene({ className = "" }: P) {
  return (
    <svg viewBox="0 0 240 120" className={className} role="img" aria-label="A circuit trace powering an LED">
      <rect width="240" height="120" fill="var(--surface-2)" />
      <g fill="none" stroke="var(--ink-2)" strokeWidth="2.5">
        <path d="M30 40 H80 M110 40 H150 M180 40 H210 V90 H30 V40" />
        <path d="M80 30 V50 M86 34 V46" />
        <path d="M110 40 l5 -8 l10 16 l10 -16 l10 16 l5 -8" />
      </g>
      <path d="M30 40 H80 M86 40 H110 l5 -8 l10 16 l10 -16 l10 16 l5 -8 H180 M190 40 H210 V90 H30 V40" fill="none" stroke="var(--accent)" strokeWidth="3" className="il-current" />
      <g transform="translate(185 40)">
        <path d="M-6 -8 L-6 8 L6 0 Z" fill="var(--accent)" />
        <line x1="6" y1="-8" x2="6" y2="8" stroke="var(--accent)" strokeWidth="2.5" />
        <circle r="14" fill="var(--accent)" opacity="0.25" className="il-led" />
      </g>
    </svg>
  );
}
