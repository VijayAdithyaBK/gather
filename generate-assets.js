// Generator script for crisp vector assets matching the UI screenshot
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'public', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

const assets = {
  'bag-new-york.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="shadow1" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.12"/>
    </filter>
  </defs>
  <g filter="url(#shadow1)">
    <!-- Canvas Tote Shape -->
    <path d="M110 90 L290 90 L260 270 L140 270 Z" fill="#FBF8F3" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- Orange accent stripes -->
    <path d="M118 150 L282 150" stroke="#FF5500" stroke-width="6" stroke-linecap="round"/>
    <path d="M122 170 L278 170" stroke="#FF5500" stroke-width="4" stroke-linecap="round"/>
    <!-- Small tech patch -->
    <rect x="230" y="125" width="22" height="14" fill="#3B5998" rx="2"/>
    <circle x="245" y="132" r="3" fill="#FFF"/>
    <!-- Center badge/eyelet -->
    <circle cx="200" cy="115" r="7" fill="none" stroke="#666" stroke-width="2"/>
    <!-- Shoulder Straps & Drawstrings -->
    <path d="M140 90 C140 40, 260 40, 260 90" fill="none" stroke="#E6E0D5" stroke-width="12" stroke-linecap="round"/>
    <!-- Hanging straps -->
    <path d="M165 270 L160 360" stroke="#E6E0D5" stroke-width="8" stroke-linecap="round"/>
    <path d="M235 270 L240 360" stroke="#E6E0D5" stroke-width="8" stroke-linecap="round"/>
    <circle cx="160" cy="360" r="4" fill="#222"/>
    <circle cx="240" cy="360" r="4" fill="#222"/>
  </g>
</svg>`,

  'loewe-book.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="bookShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="2" dy="10" stdDeviation="10" flood-opacity="0.2"/>
    </filter>
  </defs>
  <g filter="url(#bookShadow)">
    <!-- Book cover textured yellow -->
    <rect x="110" y="50" width="180" height="280" rx="3" fill="#E6A63E" stroke="#5C3E14" stroke-width="1.5"/>
    <rect x="110" y="50" width="14" height="280" rx="2" fill="#D2922D"/>
    <!-- LOEWE Anagram style flourishes -->
    <path d="M140 100 C155 70, 185 70, 200 95 C215 120, 250 80, 260 110" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round"/>
    <path d="M145 130 C170 120, 190 150, 230 135" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round"/>
    <!-- Editorial portrait silhouette -->
    <circle cx="200" cy="200" r="45" fill="#F4C7A3" opacity="0.9"/>
    <!-- Red heart sticker on lips/cheek -->
    <path d="M195 215 C195 200, 175 195, 175 210 C175 225, 195 235, 195 240 C195 235, 215 225, 215 210 C215 195, 195 200, 195 215 Z" fill="#E62E2E"/>
    <!-- Book typography -->
    <text x="200" y="80" font-family="Helvetica, Arial, sans-serif" font-weight="900" font-size="14" text-anchor="middle" letter-spacing="4" fill="#111">EYE / LOEWE / YOU</text>
  </g>
</svg>`,

  'dot-dot-dot.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="pageShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="2" dy="8" stdDeviation="8" flood-opacity="0.18"/>
    </filter>
  </defs>
  <g filter="url(#pageShadow)">
    <!-- Book Cover Paper -->
    <rect x="110" y="50" width="180" height="280" rx="2" fill="#F6F1E8" stroke="#D3C9B8" stroke-width="1.5"/>
    <!-- Photo Frame -->
    <rect x="125" y="75" width="150" height="210" fill="#E2D6C3"/>
    <!-- Blonde Woman Illustration -->
    <rect x="135" y="90" width="130" height="180" fill="#7B8B97"/>
    <!-- Blonde hair and shirt -->
    <path d="M175 120 C165 110, 225 110, 215 120 C235 150, 230 190, 225 210 L165 210 C160 190, 155 150, 175 120 Z" fill="#E6D38B"/>
    <path d="M160 210 L230 210 L240 270 L150 270 Z" fill="#D6E5EE"/>
    <!-- Iconic cloud obscuring face -->
    <path d="M190 145 C185 135, 215 135, 210 145 C220 145, 220 160, 210 165 C215 175, 185 175, 190 165 C180 160, 180 145, 190 145 Z" fill="#FFFFFF"/>
    <!-- Editorial bottom title -->
    <text x="200" y="315" font-family="'Courier New', monospace" font-weight="bold" font-size="11" text-anchor="middle" fill="#222">DOT DOT DOT 11</text>
  </g>
</svg>`,

  'hawaii-fishes.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="fishShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="2" dy="8" stdDeviation="8" flood-opacity="0.18"/>
    </filter>
  </defs>
  <g filter="url(#fishShadow)">
    <rect x="110" y="50" width="180" height="280" rx="2" fill="#F4EFE6" stroke="#D3C7B5" stroke-width="1.5"/>
    <text x="200" y="80" font-family="Georgia, serif" font-style="italic" font-size="9" text-anchor="middle" fill="#666">THE MANY-SPLENDORED</text>
    <text x="200" y="93" font-family="Georgia, serif" font-weight="bold" font-size="11" text-anchor="middle" fill="#222">FISHES OF HAWAII</text>
    <!-- Fish 1 (Green/Orange) -->
    <path d="M140 130 C165 115, 210 115, 235 130 C250 120, 260 140, 245 135 C230 145, 160 145, 140 130 Z" fill="#E89B38"/>
    <!-- Fish 2 (Blue Reef) -->
    <path d="M150 170 C180 155, 230 155, 255 170 C270 160, 275 180, 265 175 C245 185, 180 185, 150 170 Z" fill="#3D779C"/>
    <!-- Fish 3 (Yellow Tang) -->
    <circle cx="170" cy="220" r="22" fill="#F2C94C"/>
    <polygon points="190,215 205,205 205,225" fill="#F2C94C"/>
    <!-- Fish 4 (Koi / Red Pattern) -->
    <path d="M170 270 C195 255, 240 255, 260 270 C270 260, 275 275, 265 273 C245 282, 190 282, 170 270 Z" fill="#EB5757"/>
    <circle cx="190" cy="268" r="4" fill="#FFF"/>
  </g>
</svg>`,

  'faded-shirt.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="shirtShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-opacity="0.15"/>
    </filter>
    <linearGradient id="fadeBleach" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#242B35"/>
      <stop offset="50%" stop-color="#3A4659"/>
      <stop offset="68%" stop-color="#BF9864"/>
      <stop offset="90%" stop-color="#F3E5AB"/>
    </linearGradient>
  </defs>
  <g filter="url(#shirtShadow)">
    <!-- Bleached Plaid Flannel Shirt -->
    <path d="M150 70 L175 90 L225 90 L250 70 L305 130 L275 170 L250 145 L250 310 L150 310 L150 145 L125 170 L95 130 Z" 
          fill="url(#fadeBleach)" stroke="#111" stroke-width="2" stroke-linejoin="round"/>
    <!-- Collar -->
    <polygon points="175,90 200,120 185,125 160,85" fill="#1C212A"/>
    <polygon points="225,90 200,120 215,125 240,85" fill="#1C212A"/>
    <!-- Buttons -->
    <circle cx="200" cy="140" r="3" fill="#FFF"/>
    <circle cx="200" cy="175" r="3" fill="#FFF"/>
    <circle cx="200" cy="210" r="3" fill="#E2C99A"/>
    <circle cx="200" cy="250" r="3" fill="#F3E5AB"/>
    <!-- Plaid subtle grid lines -->
    <line x1="150" y1="120" x2="250" y2="120" stroke="#FFF" stroke-opacity="0.2" stroke-width="2"/>
    <line x1="150" y1="160" x2="250" y2="160" stroke="#FFF" stroke-opacity="0.2" stroke-width="2"/>
    <line x1="180" y1="90" x2="180" y2="220" stroke="#FFF" stroke-opacity="0.2" stroke-width="2"/>
    <line x1="220" y1="90" x2="220" y2="220" stroke="#FFF" stroke-opacity="0.2" stroke-width="2"/>
  </g>
</svg>`,

  'origami-trees.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="treeShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="3" dy="8" stdDeviation="8" flood-opacity="0.18"/>
    </filter>
  </defs>
  <g filter="url(#treeShadow)">
    <!-- Teal Green Main Tree -->
    <g transform="translate(130, 80)">
      <polygon points="50,0 20,50 35,50 10,100 25,100 0,160 100,160 75,100 90,100 65,50 80,50" fill="#1B5E55"/>
      <polygon points="50,0 35,50 25,100 0,160 50,160" fill="#14463F"/>
    </g>
    <!-- Grey/White Tree -->
    <g transform="translate(210, 160)">
      <polygon points="40,0 15,40 28,40 8,80 20,80 0,130 80,130 60,80 72,80 52,40 65,40" fill="#D3D9DE"/>
      <polygon points="40,0 28,40 20,80 0,130 40,130" fill="#B0B9C0"/>
    </g>
    <!-- Small Red Origami Tree in Foreground -->
    <g transform="translate(160, 230)">
      <polygon points="30,0 12,28 20,28 6,56 14,56 0,90 60,90 46,56 54,56 40,28 48,28" fill="#D32F2F"/>
      <polygon points="30,0 20,28 14,56 0,90 30,90" fill="#9A1B1B"/>
    </g>
  </g>
</svg>`,

  'longneck-sweatshirt.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="sweatShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-opacity="0.12"/>
    </filter>
  </defs>
  <g filter="url(#sweatShadow)">
    <!-- High funnel neck -->
    <path d="M175 60 L225 60 L230 110 L170 110 Z" fill="#FDFDFE" stroke="#222" stroke-width="2"/>
    <!-- Fold and crease in neck -->
    <path d="M172 85 C190 92, 210 92, 228 85" stroke="#E0E0E0" stroke-width="2" fill="none"/>
    <!-- Sweatshirt Body & Slanted Sleeves -->
    <path d="M170 110 L120 135 L90 250 L120 260 L140 180 L140 310 L260 310 L260 180 L280 260 L310 250 L280 135 L230 110 Z"
          fill="#FFFFFF" stroke="#222" stroke-width="2" stroke-linejoin="round"/>
    <!-- Sleeve cuff logo -->
    <rect x="278" y="240" width="12" height="7" fill="#111" rx="1"/>
    <!-- Side tie knot effect -->
    <path d="M140 300 C125 315, 120 335, 135 340 C145 340, 150 325, 140 300 Z" fill="#F8F8F8" stroke="#222" stroke-width="2"/>
  </g>
</svg>`,

  'closed-eyes-cap.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="capShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-opacity="0.2"/>
    </filter>
  </defs>
  <g filter="url(#capShadow)">
    <!-- Pinstripe Cap Crown -->
    <path d="M120 220 C110 130, 290 130, 280 220 Z" fill="#1A2230" stroke="#111" stroke-width="2.5"/>
    <!-- Button on top -->
    <ellipse cx="200" cy="130" rx="8" ry="4" fill="#243044"/>
    <!-- Pinstripes -->
    <path d="M145 220 C140 160, 160 140, 185 132" stroke="#FFF" stroke-width="1.5" stroke-opacity="0.5" fill="none"/>
    <path d="M170 220 C168 160, 180 140, 195 132" stroke="#FFF" stroke-width="1.5" stroke-opacity="0.5" fill="none"/>
    <path d="M230 220 C232 160, 220 140, 205 132" stroke="#FFF" stroke-width="1.5" stroke-opacity="0.5" fill="none"/>
    <path d="M255 220 C260 160, 240 140, 215 132" stroke="#FFF" stroke-width="1.5" stroke-opacity="0.5" fill="none"/>
    <!-- Visor / Brim -->
    <path d="M110 220 C110 260, 290 260, 290 220 C250 235, 150 235, 110 220 Z" fill="#151C28" stroke="#111" stroke-width="2.5"/>
    <!-- Embroidered Closed Eyes (white lashes) -->
    <g transform="translate(160, 195)">
      <path d="M0 10 Q12 0 24 10" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none"/>
      <line x1="4" y1="7" x2="2" y2="15" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="12" y1="5" x2="12" y2="16" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="20" y1="7" x2="22" y2="15" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    </g>
    <g transform="translate(216, 195)">
      <path d="M0 10 Q12 0 24 10" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none"/>
      <line x1="4" y1="7" x2="2" y2="15" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="12" y1="5" x2="12" y2="16" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="20" y1="7" x2="22" y2="15" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    </g>
  </g>
</svg>`,

  'three-socks.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="sockShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="2" dy="8" stdDeviation="8" flood-opacity="0.14"/>
    </filter>
  </defs>
  <g filter="url(#sockShadow)">
    <!-- Sock 1 (Left tilted) -->
    <g transform="translate(90, 110) rotate(-15)">
      <path d="M20 0 L55 0 L55 90 C55 120, 85 130, 95 150 C105 170, 75 185, 55 170 C35 155, 20 120, 20 90 Z" fill="#F4EFE6" stroke="#222" stroke-width="2"/>
      <line x1="20" y1="15" x2="55" y2="15" stroke="#CCC" stroke-width="1.5"/>
      <line x1="20" y1="30" x2="55" y2="30" stroke="#CCC" stroke-width="1.5"/>
    </g>
    <!-- Sock 2 (Center) -->
    <g transform="translate(180, 85)">
      <path d="M10 0 L45 0 L45 100 C45 130, 75 140, 85 160 C95 180, 65 195, 45 180 C25 165, 10 130, 10 100 Z" fill="#F4EFE6" stroke="#222" stroke-width="2"/>
      <line x1="10" y1="15" x2="45" y2="15" stroke="#CCC" stroke-width="1.5"/>
      <line x1="10" y1="30" x2="45" y2="30" stroke="#CCC" stroke-width="1.5"/>
    </g>
    <!-- Sock 3 (Right) -->
    <g transform="translate(250, 95) rotate(10)">
      <path d="M10 0 L45 0 L45 100 C45 130, 75 140, 85 160 C95 180, 65 195, 45 180 C25 165, 10 130, 10 100 Z" fill="#F4EFE6" stroke="#222" stroke-width="2"/>
      <line x1="10" y1="15" x2="45" y2="15" stroke="#CCC" stroke-width="1.5"/>
      <line x1="10" y1="30" x2="45" y2="30" stroke="#CCC" stroke-width="1.5"/>
    </g>
  </g>
</svg>`,

  'candle-tin.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="tinShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="3" dy="10" stdDeviation="12" flood-opacity="0.2"/>
    </filter>
    <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#C0C5C9"/>
      <stop offset="35%" stop-color="#E5EAEE"/>
      <stop offset="70%" stop-color="#A5ACB2"/>
      <stop offset="100%" stop-color="#7A8288"/>
    </linearGradient>
  </defs>
  <g filter="url(#tinShadow)">
    <!-- Candle Flame & Glow -->
    <ellipse cx="200" cy="115" rx="14" ry="24" fill="#FFEAA7" opacity="0.6"/>
    <path d="M200 95 C206 108, 204 116, 200 125 C196 116, 194 108, 200 95 Z" fill="#FF7675"/>
    <path d="M200 103 C203 111, 202 116, 200 122 C198 116, 197 111, 200 103 Z" fill="#FFF275"/>
    <!-- Wick -->
    <line x1="200" y1="125" x2="200" y2="138" stroke="#222" stroke-width="2.5"/>
    <!-- Inner Wax -->
    <ellipse cx="200" cy="138" rx="70" ry="20" fill="#FCFAF2" stroke="#888" stroke-width="1.5"/>
    <!-- Metal Tin Body -->
    <path d="M130 138 C130 150, 270 150, 270 138 L270 250 C270 265, 130 265, 130 250 Z" fill="url(#metalGrad)" stroke="#555" stroke-width="1.5"/>
    <ellipse cx="200" cy="250" rx="70" ry="15" fill="#8E979E" stroke="#555" stroke-width="1.5"/>
    <!-- Hand-drawn handwritten text on tin -->
    <text x="200" y="180" font-family="'Brush Script MT', cursive, sans-serif" font-style="italic" font-size="16" fill="#444" text-anchor="middle">we're really</text>
    <text x="200" y="205" font-family="'Brush Script MT', cursive, sans-serif" font-style="italic" font-size="18" fill="#444" text-anchor="middle">coffee and</text>
    <text x="200" y="230" font-family="'Brush Script MT', cursive, sans-serif" font-style="italic" font-size="18" fill="#444" text-anchor="middle">silence</text>
  </g>
</svg>`,

  'fact-magazine.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="magShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="2" dy="8" stdDeviation="8" flood-opacity="0.18"/>
    </filter>
  </defs>
  <g filter="url(#magShadow)">
    <rect x="110" y="50" width="180" height="280" rx="1" fill="#F7F3E9" stroke="#333" stroke-width="1.5"/>
    <!-- Bold FACT Logo -->
    <text x="200" y="115" font-family="'Times New Roman', Georgia, serif" font-weight="900" font-size="44" text-anchor="middle" letter-spacing="-1" fill="#111">fact:</text>
    <!-- Quote text layout -->
    <text x="130" y="160" font-family="Georgia, serif" font-weight="bold" font-size="13" fill="#111">“Bobby Kennedy</text>
    <text x="130" y="180" font-family="Georgia, serif" font-weight="bold" font-size="13" fill="#111">is the most vicious,</text>
    <text x="130" y="200" font-family="Georgia, serif" font-weight="bold" font-size="13" fill="#111">evil — — — — in</text>
    <text x="130" y="220" font-family="Georgia, serif" font-weight="bold" font-size="13" fill="#111">American politics</text>
    <text x="130" y="240" font-family="Georgia, serif" font-weight="bold" font-size="13" fill="#111">today,” says lawyer</text>
    <text x="130" y="260" font-family="Georgia, serif" font-weight="bold" font-size="13" fill="#111">Melvin Belli.</text>
  </g>
</svg>`,

  'colette-book.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="coletteShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="2" dy="8" stdDeviation="8" flood-opacity="0.18"/>
    </filter>
  </defs>
  <g filter="url(#coletteShadow)">
    <rect x="120" y="55" width="160" height="270" rx="2" fill="#EAE3D2" stroke="#222" stroke-width="1.5"/>
    <!-- Purple Header Box -->
    <rect x="130" y="70" width="140" height="40" fill="#5F6B58"/>
    <rect x="133" y="73" width="134" height="34" fill="#6C4B63"/>
    <text x="200" y="96" font-family="'Times New Roman', serif" font-weight="bold" font-size="15" text-anchor="middle" fill="#E8D1B5" letter-spacing="3">COLETTE</text>
    <!-- Portrait Illustration Sketch -->
    <circle cx="200" cy="180" r="45" fill="none" stroke="#6C4B63" stroke-width="1.5"/>
    <path d="M185 160 C190 150, 210 150, 215 160" stroke="#6C4B63" stroke-width="1.5" fill="none"/>
    <path d="M190 180 Q200 190 210 180" stroke="#6C4B63" stroke-width="1.5" fill="none"/>
  </g>
</svg>`,

  'necklace-blue.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="neckShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="1" dy="6" stdDeviation="6" flood-opacity="0.15"/>
    </filter>
  </defs>
  <g filter="url(#neckShadow)">
    <!-- Face Silhouette wire shape -->
    <path d="M180 80 C210 70, 240 90, 220 130 C220 145, 235 155, 235 170 C235 185, 215 195, 220 220 C225 245, 190 280, 160 300"
          stroke="#999" stroke-width="2" fill="none"/>
    <!-- White Beads along chain -->
    <circle cx="170" cy="95" r="5" fill="#FFFFFF" stroke="#333" stroke-width="1"/>
    <circle cx="165" cy="110" r="5" fill="#FFFFFF" stroke="#333" stroke-width="1"/>
    <circle cx="162" cy="125" r="5" fill="#FFFFFF" stroke="#333" stroke-width="1"/>
    <circle cx="160" cy="140" r="5" fill="#FFFFFF" stroke="#333" stroke-width="1"/>
    <circle cx="158" cy="155" r="5" fill="#FFFFFF" stroke="#333" stroke-width="1"/>
    <!-- Brass/Gold tube segment -->
    <line x1="210" y1="85" x2="225" y2="115" stroke="#C5A059" stroke-width="5" stroke-linecap="round"/>
    <!-- Vibrant Blue Jewel Pendant -->
    <rect x="188" y="325" width="24" height="24" rx="4" fill="#1D4ED8" stroke="#1E3A8A" stroke-width="2"/>
    <circle cx="200" cy="337" r="4" fill="#60A5FA"/>
  </g>
</svg>`,

  'necklace-red.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="neckShadow2" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="1" dy="6" stdDeviation="6" flood-opacity="0.15"/>
    </filter>
  </defs>
  <g filter="url(#neckShadow2)">
    <!-- Face Silhouette wire shape -->
    <path d="M190 80 C220 70, 250 90, 230 130 C230 145, 245 155, 245 170 C245 185, 225 195, 230 220 C235 245, 200 280, 170 300"
          stroke="#999" stroke-width="2" fill="none"/>
    <!-- Red Coral Beads along chain -->
    <circle cx="180" cy="95" r="5" fill="#E6392E" stroke="#900" stroke-width="1"/>
    <circle cx="175" cy="110" r="5" fill="#E6392E" stroke="#900" stroke-width="1"/>
    <circle cx="172" cy="125" r="5" fill="#E6392E" stroke="#900" stroke-width="1"/>
    <circle cx="170" cy="140" r="5" fill="#E6392E" stroke="#900" stroke-width="1"/>
    <circle cx="168" cy="155" r="5" fill="#E6392E" stroke="#900" stroke-width="1"/>
    <!-- Brass/Gold tube segment -->
    <line x1="220" y1="85" x2="235" y2="115" stroke="#C5A059" stroke-width="5" stroke-linecap="round"/>
    <!-- Vibrant Red Jewel Pendant -->
    <rect x="198" y="325" width="24" height="24" rx="4" fill="#DC2626" stroke="#991B1B" stroke-width="2"/>
    <circle cx="210" cy="337" r="4" fill="#F87171"/>
  </g>
</svg>`,

  'necklace-black.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <filter id="neckShadow3" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="1" dy="6" stdDeviation="6" flood-opacity="0.15"/>
    </filter>
  </defs>
  <g filter="url(#neckShadow3)">
    <!-- Face Silhouette wire shape -->
    <path d="M190 80 C220 70, 250 90, 230 130 C230 145, 245 155, 245 170 C245 185, 225 195, 230 220 C235 245, 200 280, 170 300"
          stroke="#999" stroke-width="2" fill="none"/>
    <!-- Black Onyx Beads along chain -->
    <circle cx="180" cy="95" r="5" fill="#111" stroke="#333" stroke-width="1"/>
    <circle cx="175" cy="110" r="5" fill="#111" stroke="#333" stroke-width="1"/>
    <circle cx="172" cy="125" r="5" fill="#111" stroke="#333" stroke-width="1"/>
    <circle cx="170" cy="140" r="5" fill="#111" stroke="#333" stroke-width="1"/>
    <circle cx="168" cy="155" r="5" fill="#111" stroke="#333" stroke-width="1"/>
    <!-- Brass/Gold tube segment -->
    <line x1="220" y1="85" x2="235" y2="115" stroke="#C5A059" stroke-width="5" stroke-linecap="round"/>
    <!-- Black Onyx Jewel Pendant -->
    <rect x="198" y="325" width="24" height="24" rx="4" fill="#18181B" stroke="#000000" stroke-width="2"/>
    <circle cx="210" cy="337" r="4" fill="#71717A"/>
  </g>
</svg>`
};

for (const [filename, content] of Object.entries(assets)) {
  fs.writeFileSync(path.join(assetsDir, filename), content.trim());
}
console.log(`Generated ${Object.keys(assets).length} SVG assets in ${assetsDir}`);
