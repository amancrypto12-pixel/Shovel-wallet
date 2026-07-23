/* ==========================================================================
   AUTHORITATIVE TOKEN REGISTRY WITH EMBEDDED INLINE SVG GRAPHICS
   All icons: 34x34px, perfect circle, consistent rendering
   ========================================================================== */

const SZ = 'width="34" height="34"';

export const TOKEN_MAP = {
  SHOVEL: { 
    name: 'Shovel Token', 
    priceUsd: 0.000225,
    svg: `<img src="/shovel_logo.png" width="34" height="34" style="border-radius:50%; object-fit:cover; display:block;" />`
  },
  TON: { 
    name: 'Toncoin', 
    priceUsd: 2.20,
    svg: `<svg ${SZ} viewBox="0 0 128 128" style="border-radius:50%;display:block;"><circle cx="64" cy="64" r="64" fill="#0088CC"/><path d="M41 40h46c2.8 0 4.5 3 3.1 5.3L67.1 84.7c-1.4 2.3-4.8 2.3-6.2 0L37.9 45.3C36.5 43 38.2 40 41 40z" fill="none" stroke="#FFF" stroke-width="7"/><path d="M64 40v46" stroke="#FFF" stroke-width="7"/></svg>`
  },
  USDT: { 
    name: 'Tether USD', 
    priceUsd: 1.00,
    svg: `<svg ${SZ} viewBox="0 0 128 128" style="border-radius:50%;display:block;"><circle cx="64" cy="64" r="64" fill="#26A17B"/><rect x="40" y="38" width="48" height="14" rx="2" fill="#FFF"/><rect x="57" y="50" width="14" height="34" rx="2" fill="#FFF"/><ellipse cx="64" cy="62" rx="22" ry="7" fill="none" stroke="#FFF" stroke-width="5"/></svg>`
  },
  BTC: { 
    name: 'Bitcoin', 
    priceUsd: 65000.00,
    svg: `<svg ${SZ} viewBox="0 0 128 128" style="border-radius:50%;display:block;"><circle cx="64" cy="64" r="64" fill="#F7931A"/><text x="64" y="88" font-size="72" font-weight="900" text-anchor="middle" fill="#FFF" font-family="Arial">₿</text></svg>`
  },
  ETH: { 
    name: 'Ethereum', 
    priceUsd: 3400.00,
    svg: `<svg ${SZ} viewBox="0 0 128 128" style="border-radius:50%;display:block;"><circle cx="64" cy="64" r="64" fill="#627EEA"/><path d="M64 20L36 66l28 17 28-17L64 20z" fill="#FFF" opacity="0.6"/><path d="M64 20v46l28 17L64 20z" fill="#FFF"/><path d="M64 88L36 72l28 36 28-36-28 16z" fill="#FFF" opacity="0.6"/><path d="M64 88v36l28-36-28 16z" fill="#FFF"/></svg>`
  },
  SOL: { 
    name: 'Solana', 
    priceUsd: 155.00,
    svg: `<svg ${SZ} viewBox="0 0 128 128" style="border-radius:50%;display:block;"><circle cx="64" cy="64" r="64" fill="#14F195"/><path d="M34 88h60l-8 10H26l8-10zm0-21h52l-8 10H26l8-10zm8-21h52l-8 10H34l8-10z" fill="#000"/></svg>`
  },
  BNB: { 
    name: 'BNB', 
    priceUsd: 580.00,
    svg: `<svg ${SZ} viewBox="0 0 128 128" style="border-radius:50%;display:block;"><circle cx="64" cy="64" r="64" fill="#F3BA2F"/><path d="M64 28l12 12-12 12-12-12 12-12zm22 22l12 12-12 12-12-12 12-12zm-44 0l12 12-12 12-12-12 12-12zm22 22l12 12-12 12-12-12 12-12z" fill="#FFF"/></svg>`
  },
  NOT: { 
    name: 'Notcoin', 
    priceUsd: 0.012,
    svg: `<svg ${SZ} viewBox="0 0 128 128" style="border-radius:50%;display:block;"><circle cx="64" cy="64" r="64" fill="#1C1C1E"/><circle cx="64" cy="64" r="44" fill="none" stroke="#FFF" stroke-width="8"/><text x="64" y="78" font-size="44" font-weight="900" text-anchor="middle" fill="#FFF" font-family="Arial">N</text></svg>`
  },
  DOGS: { 
    name: 'DOGS Token', 
    priceUsd: 0.00065,
    svg: `<svg ${SZ} viewBox="0 0 128 128" style="border-radius:50%;display:block;"><circle cx="64" cy="64" r="64" fill="#E1A800"/><text x="64" y="84" font-size="60" text-anchor="middle" font-family="serif">🐶</text></svg>`
  }
};
