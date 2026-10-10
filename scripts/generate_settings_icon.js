const sharp = require('sharp');
const path = require('path');

const svgContent = `
<svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient (Classic iOS Settings Icon) -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E5E5EA"/>
      <stop offset="100%" stop-color="#C7C7CC"/>
    </linearGradient>

    <!-- Gear Outer Gradient -->
    <linearGradient id="gearGrad" x1="0" y1="30" x2="0" y2="210" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#8E8E93"/>
      <stop offset="100%" stop-color="#636366"/>
    </linearGradient>

    <!-- Clip Path for Squircle -->
    <clipPath id="squircleClip">
      <rect x="0" y="0" width="240" height="240" rx="54" ry="54" />
    </clipPath>
  </defs>

  <g clip-path="url(#squircleClip)">
    <!-- Base Squircle Background -->
    <rect width="240" height="240" fill="url(#bgGrad)" />

    <!-- Subtle Inner Top Highlight -->
    <rect x="0" y="0" width="240" height="4" fill="white" opacity="0.3" />

    <!-- Center Mechanical Gear (iOS Settings Glyph) -->
    <!-- Center Hole -->
    <circle cx="120" cy="120" r="72" fill="url(#gearGrad)" />
    <circle cx="120" cy="120" r="38" fill="url(#bgGrad)" />
    <circle cx="120" cy="120" r="16" fill="url(#gearGrad)" />

    <!-- Gear Teeth (8 Teeth) -->
    <g fill="url(#gearGrad)">
      <rect x="110" y="32" width="20" height="28" rx="4" />
      <rect x="110" y="180" width="20" height="28" rx="4" />
      <rect x="32" y="110" width="28" height="20" rx="4" />
      <rect x="180" y="110" width="28" height="20" rx="4" />
      
      <!-- Diagonal Teeth -->
      <rect x="110" y="32" width="20" height="28" rx="4" transform="rotate(45 120 120)" />
      <rect x="110" y="180" width="20" height="28" rx="4" transform="rotate(45 120 120)" />
      <rect x="32" y="110" width="28" height="20" rx="4" transform="rotate(45 120 120)" />
      <rect x="180" y="110" width="28" height="20" rx="4" transform="rotate(45 120 120)" />
    </g>
  </g>
</svg>
`;

const outputPath = path.join(__dirname, '..', 'public', 'images', 'cases', 'case_000', 'phone', 'icons', 'settings.png');

sharp(Buffer.from(svgContent))
  .png()
  .toFile(outputPath)
  .then(info => {
    console.log('Successfully generated settings.png:', info);
  })
  .catch(err => {
    console.error('Error generating settings icon:', err);
  });
