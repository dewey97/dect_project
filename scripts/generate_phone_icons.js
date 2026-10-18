const fs = require('fs');

const squircleSVG = (innerContent, bg) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
      ${bg}
    </linearGradient>
  </defs>
  <!-- Authentic Apple Squircle 256x256 rx=56 -->
  <rect width="256" height="256" rx="56" ry="56" fill="url(#grad)" />
  ${innerContent}
</svg>
`;

// 1. Banking / Ngân Hàng (Gradient Đỏ Đô / Techcombank / Thụy Sĩ sang trọng)
const bankingSVG = squircleSVG(`
  <circle cx="128" cy="128" r="85" fill="none" stroke="#FFFFFF" stroke-width="4" opacity="0.15"/>
  <path d="M60 100 L128 58 L196 100 Z" fill="#FFFFFF" />
  <rect x="76" y="112" width="18" height="60" rx="3" fill="#FFFFFF" />
  <rect x="105" y="112" width="18" height="60" rx="3" fill="#FFFFFF" />
  <rect x="134" y="112" width="18" height="60" rx="3" fill="#FFFFFF" />
  <rect x="163" y="112" width="18" height="60" rx="3" fill="#FFFFFF" />
  <rect x="54" y="178" width="148" height="16" rx="4" fill="#FFFFFF" />
`, `<stop offset="0%" stop-color="#E02424"/><stop offset="100%" stop-color="#881337"/>`);

// 2. 2048 Game (Màu vàng rực rỡ đặc trưng của ô 2048 kinh điển)
const game2048SVG = squircleSVG(`
  <text x="128" y="152" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Impact, sans-serif" font-weight="900" font-size="74" fill="#FFFFFF" text-anchor="middle" letter-spacing="-3">2048</text>
`, `<stop offset="0%" stop-color="#F59E0B"/><stop offset="100%" stop-color="#D97706"/>`);

// 3. Flappy Bird (Trời xanh lơ + Chim vàng mỏ cam pixel)
const flappySVG = squircleSVG(`
  <!-- Ground Grass strip inside icon -->
  <rect x="0" y="195" width="256" height="61" fill="#73BF2E" />
  <rect x="0" y="195" width="256" height="8" fill="#9DE64E" />
  <line x1="0" y1="195" x2="256" y2="195" stroke="#000000" stroke-width="4" />
  <!-- Bird Body -->
  <ellipse cx="120" cy="115" rx="52" ry="38" fill="#F8E038" stroke="#000000" stroke-width="8" />
  <!-- Wing -->
  <ellipse cx="94" cy="120" rx="25" ry="15" fill="#FFFFFF" stroke="#000000" stroke-width="6" />
  <!-- Big Eye -->
  <circle cx="144" cy="98" r="17" fill="#FFFFFF" stroke="#000000" stroke-width="6" />
  <circle cx="150" cy="98" r="6" fill="#000000" />
  <!-- Chunky Beak -->
  <path d="M152 114 L194 122 L178 144 L146 136 Z" fill="#F85820" stroke="#000000" stroke-width="7" />
`, `<stop offset="0%" stop-color="#4EC0CA"/><stop offset="100%" stop-color="#38BDF8"/>`);

// 4. Tetris (Các khối gạch Neon sắc nét)
const tetrisSVG = squircleSVG(`
  <g transform="translate(62, 58)">
    <!-- T piece (Purple) -->
    <rect x="18" y="15" width="30" height="30" rx="4" fill="#A855F7" stroke="#000000" stroke-width="4"/>
    <rect x="52" y="15" width="30" height="30" rx="4" fill="#A855F7" stroke="#000000" stroke-width="4"/>
    <rect x="86" y="15" width="30" height="30" rx="4" fill="#A855F7" stroke="#000000" stroke-width="4"/>
    <rect x="52" y="49" width="30" height="30" rx="4" fill="#A855F7" stroke="#000000" stroke-width="4"/>
    <!-- L piece (Cyan) -->
    <rect x="18" y="83" width="30" height="30" rx="4" fill="#06B6D4" stroke="#000000" stroke-width="4"/>
    <rect x="52" y="83" width="30" height="30" rx="4" fill="#06B6D4" stroke="#000000" stroke-width="4"/>
    <rect x="86" y="83" width="30" height="30" rx="4" fill="#06B6D4" stroke="#000000" stroke-width="4"/>
    <rect x="86" y="49" width="30" height="30" rx="4" fill="#06B6D4" stroke="#000000" stroke-width="4"/>
  </g>
`, `<stop offset="0%" stop-color="#0F172A"/><stop offset="100%" stop-color="#1E293B"/>`);

// 5. Snake '97 (Màn hình LCD xanh lục Nokia + rắn pixel)
const snakeSVG = squircleSVG(`
  <!-- LCD Screen Window -->
  <rect x="36" y="36" width="184" height="184" rx="20" fill="#879B5A" stroke="#556B2F" stroke-width="6" />
  <!-- Snake Segments -->
  <rect x="68" y="68" width="24" height="24" rx="3" fill="#1A2E05" />
  <rect x="96" y="68" width="24" height="24" rx="3" fill="#1A2E05" />
  <rect x="124" y="68" width="24" height="24" rx="3" fill="#1A2E05" />
  <rect x="124" y="96" width="24" height="24" rx="3" fill="#1A2E05" />
  <rect x="124" y="124" width="24" height="24" rx="3" fill="#1A2E05" />
  <rect x="152" y="124" width="24" height="24" rx="3" fill="#1A2E05" />
  <!-- Apple -->
  <circle cx="178" cy="172" r="12" fill="#8B0000" />
`, `<stop offset="0%" stop-color="#374151"/><stop offset="100%" stop-color="#1F2937"/>`);

// 6. Minesweeper (Quả mìn đen 8 cánh gai + bóng sáng retro)
const minesweeperSVG = squircleSVG(`
  <rect x="34" y="34" width="188" height="188" rx="18" fill="#C0C0C0" stroke="#808080" stroke-width="6"/>
  <!-- Spikes -->
  <line x1="128" y1="70" x2="128" y2="186" stroke="#000000" stroke-width="12" stroke-linecap="round" />
  <line x1="70" y1="128" x2="186" y2="128" stroke="#000000" stroke-width="12" stroke-linecap="round" />
  <line x1="86" y1="86" x2="170" y2="170" stroke="#000000" stroke-width="12" stroke-linecap="round" />
  <line x1="170" y1="86" x2="86" y2="170" stroke="#000000" stroke-width="12" stroke-linecap="round" />
  <!-- Center Mine Ball -->
  <circle cx="128" cy="128" r="42" fill="#000000" />
  <circle cx="116" cy="116" r="10" fill="#FFFFFF" opacity="0.8" />
`, `<stop offset="0%" stop-color="#E5E7EB"/><stop offset="100%" stop-color="#9CA3AF"/>`);

const dir = 'public/images/cases/case_000/phone/icons';
fs.writeFileSync(dir + '/banking.svg', bankingSVG.trim());
fs.writeFileSync(dir + '/game2048.svg', game2048SVG.trim());
fs.writeFileSync(dir + '/flappybird.svg', flappySVG.trim());
fs.writeFileSync(dir + '/tetris.svg', tetrisSVG.trim());
fs.writeFileSync(dir + '/snake.svg', snakeSVG.trim());
fs.writeFileSync(dir + '/minesweeper.svg', minesweeperSVG.trim());
console.log('Successfully created all 6 high-res vector iOS app icons!');
