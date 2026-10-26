/**
 * The plan under the work: a website drawn as a blueprint, nav to footer, with
 * its measurements. It sits behind the hero and only shows where the cursor
 * (or, on a phone, a slow automatic drift) shines on it. The point it makes is
 * the pitch: every site here is planned and measured by a person first.
 */
export function Blueprint() {
  const cols = Array.from({ length: 12 }, (_, i) => 180 + i * 98);
  return (
    <svg
      className="u-blueprint pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      {/* the browser */}
      <rect x="120" y="70" width="1200" height="760" rx="14" />
      <path d="M120 112h1200" />
      <circle cx="148" cy="91" r="6" />
      <circle cx="170" cy="91" r="6" />
      <circle cx="192" cy="91" r="6" />
      <rect x="560" y="82" width="320" height="18" rx="9" />

      {/* the 12-column grid */}
      <g strokeDasharray="4 8" opacity="0.55">
        {cols.map((x) => (
          <path key={x} d={`M${x} 112v718`} />
        ))}
      </g>

      {/* nav */}
      <circle cx="196" cy="150" r="12" />
      <rect x="216" y="142" width="120" height="16" rx="4" />
      <rect x="820" y="144" width="70" height="12" rx="3" />
      <rect x="910" y="144" width="70" height="12" rx="3" />
      <rect x="1000" y="144" width="70" height="12" rx="3" />
      <rect x="1120" y="134" width="150" height="34" rx="17" />

      {/* hero headline, paragraph and button */}
      <rect x="180" y="230" width="560" height="64" rx="6" />
      <rect x="180" y="308" width="430" height="64" rx="6" />
      <rect x="180" y="400" width="480" height="12" rx="3" />
      <rect x="180" y="424" width="450" height="12" rx="3" />
      <rect x="180" y="448" width="300" height="12" rx="3" />
      <rect x="180" y="490" width="230" height="52" rx="26" />
      <rect x="426" y="490" width="170" height="52" rx="26" />

      {/* hero picture */}
      <rect x="800" y="220" width="470" height="330" rx="10" />
      <path d="M800 220l470 330M1270 220L800 550" opacity="0.5" />

      {/* three cards */}
      <rect x="180" y="610" width="350" height="180" rx="12" />
      <rect x="550" y="610" width="350" height="180" rx="12" />
      <rect x="920" y="610" width="350" height="180" rx="12" />
      <rect x="208" y="640" width="160" height="14" rx="3" />
      <rect x="578" y="640" width="160" height="14" rx="3" />
      <rect x="948" y="640" width="160" height="14" rx="3" />

      {/* measurements */}
      <path d="M180 205h560M180 199v12M740 199v12" />
      <path d="M760 230v142M754 230h12M754 372h12" />
      <path d="M1290 220v330M1284 220h12M1284 550h12" />
      <g fill="currentColor" stroke="none" fontFamily="var(--font-inter), sans-serif" fontSize="15">
        <text x="400" y="196">560</text>
        <text x="772" y="306">h1 · 64</text>
        <text x="1302" y="390">330</text>
        <text x="180" y="580">button · 52 tall, thumb-sized</text>
        <text x="180" y="818">12 columns · 98 · gutters 24</text>
        <text x="920" y="818">tested on a real phone</text>
      </g>
    </svg>
  );
}
