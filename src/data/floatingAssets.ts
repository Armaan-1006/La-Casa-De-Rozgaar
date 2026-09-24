// High-fidelity assets for floating offer letters and currency notes
// Designed for realistic textures and professional appearance

// Offer Letter Template with rich detail
export const offerLetterTemplate = {
  // Dimensions (scaled via CSS transform)
  baseWidth: 320,   // px at 1x scale
  baseHeight: 450,  // px at 1x scale
  
  // Text styling
  fonts: {
    header: '"Oswald", sans-serif',
    body: '"Inter", sans-serif',
    mono: '"JetBrains Mono", monospace'
  },
  
  // Colors (theme-aware values will be applied in component)
  themeColors: {
    dark: {
      paper: '#1a1a1e',           // Deep charcoal
      ink: '#e0e0ea',             // Warm ivory
      accent: '#b3132b',          // Crimson
      seal: '#8e1021',            // Blood red
      shadow: 'rgba(0,0,0,0.4)'
    },
    light: {
      paper: '#faf9f6',           // Warm white
      ink: '#1a1a1e',             // Near black
      accent: '#d4364f',          // Crimson light
      seal: '#b3132b',            // Crimson
      shadow: 'rgba(0,0,0,0.15)'
    }
  },
  
  // Layout proportions
  layout: {
    margin: 24,
    headerHeight: 48,
    sealSize: 60,
    lineHeight: 28,
    smallText: 12,
    normalText: 14,
    largeText: 18,
    titleText: 24
  },
  
  // Texture overlays (base64 PNG noise for realism)
  textures: {
    paperGrain: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAklEQVR42mP4////hwAMALD8wOgA6JY0AAAAAElFTkSuQmCC',
    fiber: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAA0lEQVR42mP4//8/AAX+Av7czFnnAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAElFTkSuQmCC'
  }
};

// Currency Note Assets (stylized homage to INR)
export const currencyNoteAssets = {
  baseWidth: 280,
  baseHeight: 140,
  
  denominations: [
    { value: 2000, color: '#8e1021', name: 'Blood Red', pattern: 'diagonal' },
    { value: 500,  color: '#151518', name: 'Obsidian', pattern: 'geometric' },
    { value: 200,  color: '#b3132b', name: 'Crimson', pattern: 'interlace' },
    { value: 100,  color: '#3a0d13', name: 'Burgundy', pattern: 'lattice' }
  ],
  
  // Text styling
  fonts: {
    title: '"Oswald", sans-serif',
    value: '"Oswald", sans-serif',
    mono: '"JetBrains Mono", monospace'
  },
  
  // Security features (simplified SVG paths)
  securityStrip: `
    <rect x="20" y="0" width="8" height="100%" rx="2" fill="currentColor" opacity="0.15"/>
  `,
  
  // Watermark silhouette (very simplified Gandhi profile)
  watermark: `
    <path d="M50 20 C45 25, 45 35, 50 40 C55 45, 55 55, 50 60" 
          fill="none" stroke="currentColor" stroke-width="2" opacity="0.08"/>
  `,
  
  // Guilloché pattern base (geometric repeating)
  guillocheBase: `
    <defs>
      <pattern id="guilloche" patternUnits="userSpaceOnUse" width="40" height="40">
        <path d="M0,20 Q10,0 20,20 T40,20" 
              fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#guilloche)"/>
  `,

  textures: {
    paperGrain: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAklEQVR42mP4////hwAMALD8wOgA6JY0AAAAAElFTkSuQmCC'
  }
};