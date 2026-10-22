const sharp = require('sharp');
const path = require('path');

const svgContent = `
<svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient (Classic iOS 9 Contacts Book Cover) -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#737376"/>
      <stop offset="100%" stop-color="#48484A"/>
    </linearGradient>

    <!-- Silhouette Linear Gradient -->
    <linearGradient id="avatarGrad" x1="0" y1="50" x2="0" y2="190" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F2F2F7"/>
      <stop offset="100%" stop-color="#D1D1D6"/>
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
    <rect x="0" y="0" width="240" height="4" fill="white" opacity="0.15" />

    <!-- A-Z Index Tabs on Right Edge (Signature iOS Contacts Bookmark Tabs) -->
    <!-- Tab 1: Red -->
    <rect x="226" y="38" width="14" height="34" rx="3" fill="#FF3B30" />
    <!-- Tab 2: Orange -->
    <rect x="226" y="80" width="14" height="34" rx="3" fill="#FF9500" />
    <!-- Tab 3: Green -->
    <rect x="226" y="122" width="14" height="34" rx="3" fill="#34C759" />
    <!-- Tab 4: Blue -->
    <rect x="226" y="164" width="14" height="34" rx="3" fill="#007AFF" />

    <!-- Center Avatar Silhouette (Classic User Bust) -->
    <!-- Head -->
    <circle cx="114" cy="94" r="34" fill="url(#avatarGrad)" />

    <!-- Shoulders / Torso -->
    <path d="M52 186 C52 144, 76 134, 114 134 C152 134, 176 144, 176 186 C176 194, 168 198, 158 198 L70 198 C60 198, 52 194, 52 186 Z" fill="url(#avatarGrad)" />
  </g>
</svg>
`;

const outputPath = path.join(__dirname, '..', 'public', 'images', 'cases', 'case_000', 'phone', 'icons', 'contacts.png');

sharp(Buffer.from(svgContent))
  .png()
  .toFile(outputPath)
  .then(info => {
    console.log('Successfully generated contacts.png:', info);
  })
  .catch(err => {
    console.error('Error generating contacts icon:', err);
  });
