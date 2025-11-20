import { GameConfig } from "./types";

export const THEME = {
  primary: '#E3001B', // Mercuries Red
  secondary: '#000000',
  text: '#FFFFFF',
  accent: '#FFD700', // Gold for flashy bricks
  background: '#111111',
};

// Dynamically calculate safe dimensions based on window
const isMobile = window.innerWidth < 768;
const canvasWidth = Math.min(window.innerWidth - 20, 800);
const canvasHeight = Math.min(window.innerHeight - 200, 600);

export const CONFIG: GameConfig = {
  canvasWidth,
  canvasHeight,
  paddleWidth: isMobile ? 100 : 140,
  paddleHeight: 20,
  ballRadius: 8,
  brickRowCount: 6,
  brickColumnCount: isMobile ? 6 : 10,
  brickPadding: 10,
  brickOffsetTop: 60,
};

// Embedded SVG for "Mercuries Life Insurance" to ensure it always displays without CORS/Hotlinking issues
const LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200" viewBox="0 0 600 200">
  <style>
    text { font-family: 'Noto Sans TC', sans-serif; }
  </style>
  <!-- Abstract Bird/Flower Logo Representation -->
  <g transform="translate(50, 40) scale(1.2)">
    <path d="M50,60 Q30,10 10,40 Q30,80 50,60 Z" fill="#E3001B" />
    <path d="M50,60 Q70,10 90,40 Q70,80 50,60 Z" fill="#E3001B" />
    <path d="M50,60 Q50,0 50,20 Q50,40 50,60 Z" fill="#E3001B" />
    <circle cx="50" cy="50" r="5" fill="#fff"/>
  </g>
  
  <!-- Text -->
  <text x="140" y="110" font-size="70" font-weight="bold" fill="#000">三商美邦人壽</text>
  <text x="145" y="150" font-size="28" fill="#555" letter-spacing="3">Mercuries Life Insurance</text>
</svg>
`;

export const LOGO_URL = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(LOGO_SVG)))}`;

// Tips generated for the AI coach
export const INSURANCE_TIPS = [
  "保障未來，從現在開始！ (Protect your future, start now!)",
  "每一份保單都是一份承諾。 (Every policy is a promise.)",
  "風險無所不在，三商美邦與你同在。 (Risk is everywhere, Mercuries is with you.)",
  "為家人多想一點，保障就多一點。 (Think more for family, protect more.)",
  "投資型保單，兼顧保障與理財。 (Investment-linked policies cover protection and finance.)"
];
