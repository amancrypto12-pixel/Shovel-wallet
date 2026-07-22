/* ==========================================================================
   AUTHORITATIVE TOKEN REGISTRY WITH EMBEDDED INLINE SVG GRAPHICS
   ========================================================================== */

export const TOKEN_MAP = {
  SHOVEL: { 
    name: 'Shovel Token', 
    priceUsd: 0.000225,
    svg: `<img src="/shovel_logo.png" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1px solid var(--accent-gold);" />`
  },
  TON: { 
    name: 'Toncoin', 
    priceUsd: 2.20,
    svg: `<svg viewBox="0 0 128 128" style="width: 28px; height: 28px; border-radius: 50%;"><circle cx="64" cy="64" r="64" fill="#0088CC"/><path d="M41 40h46c2.8 0 4.5 3 3.1 5.3L67.1 84.7c-1.4 2.3-4.8 2.3-6.2 0L37.9 45.3C36.5 43 38.2 40 41 40z" fill="none" stroke="#FFF" stroke-width="7"/><path d="M64 40v46" stroke="#FFF" stroke-width="7"/></svg>`
  },
  USDT: { 
    name: 'Tether USD', 
    priceUsd: 1.00,
    svg: `<svg viewBox="0 0 128 128" style="width: 28px; height: 28px; border-radius: 50%;"><circle cx="64" cy="64" r="64" fill="#26A17B"/><path d="M40 40h48v14H71v36H57V54H40V40z" fill="#FFF"/><ellipse cx="64" cy="62" rx="26" ry="8" fill="none" stroke="#FFF" stroke-width="5"/></svg>`
  },
  BTC: { 
    name: 'Bitcoin', 
    priceUsd: 65000.00,
    svg: `<svg viewBox="0 0 128 128" style="width: 28px; height: 28px; border-radius: 50%;"><circle cx="64" cy="64" r="64" fill="#F7931A"/><path d="M84 54c1.5-3.5 0-7.5-5-9h-15V32h-8v13h-6V32h-8v13H30v9h7v40h-7v9h12v13h8V103h6v13h8V103h18c7 0 11.5-4.5 10-10.5-1.2-4.5-5.2-7.5-9-8.5 5-1.5 8.5-5.5 7-10zm-33-8h16c3.5 0 6 2 6 5.5s-2.5 5.5-6 5.5H51V46zm18 46H51V79h18c4 0 7 2 7 6.5s-3 6.5-7 6.5z" fill="#FFF"/></svg>`
  },
  ETH: { 
    name: 'Ethereum', 
    priceUsd: 3400.00,
    svg: `<svg viewBox="0 0 128 128" style="width: 28px; height: 28px; border-radius: 50%;"><circle cx="64" cy="64" r="64" fill="#627EEA"/><path d="M64 20L36 66l28 17 28-17L64 20z" fill="#FFF" opacity="0.6"/><path d="M64 20v46l28 17L64 20z" fill="#FFF"/><path d="M64 88L36 72l28 36 28-36-28 16z" fill="#FFF" opacity="0.6"/><path d="M64 88v36l28-36-28 16z" fill="#FFF"/></svg>`
  },
  SOL: { 
    name: 'Solana', 
    priceUsd: 155.00,
    svg: `<svg viewBox="0 0 128 128" style="width: 28px; height: 28px; border-radius: 50%;"><circle cx="64" cy="64" r="64" fill="#14F195"/><path d="M36 84l12-12h44l-12 12H36zm0-26l12-12h44l-12 12H36zm12-26l-12 12h44l12-12H48z" fill="#000"/></svg>`
  },
  BNB: { 
    name: 'BNB', 
    priceUsd: 580.00,
    svg: `<svg viewBox="0 0 128 128" style="width: 28px; height: 28px; border-radius: 50%;"><circle cx="64" cy="64" r="64" fill="#F3BA2F"/><path d="M64 32l16 16-16 16-16-16 16-16zm24 24l16 16-16 16-16-16 16-16zm-48 0l16 16-16 16-16-16 16-16zm24 24l16 16-16 16-16-16 16-16z" fill="#FFF"/></svg>`
  },
  NOT: { 
    name: 'Notcoin', 
    priceUsd: 0.012,
    svg: `<svg viewBox="0 0 128 128" style="width: 28px; height: 28px; border-radius: 50%;"><circle cx="64" cy="64" r="64" fill="#111"/><circle cx="64" cy="64" r="48" fill="none" stroke="#FFF" stroke-width="8"/><text x="64" y="80" font-family="'Rubik', sans-serif" font-size="52" font-weight="900" fill="#FFF" text-anchor="middle">⭐</text></svg>`
  },
  DOGS: { 
    name: 'DOGS Token', 
    priceUsd: 0.00065,
    svg: `<svg viewBox="0 0 128 128" style="width: 28px; height: 28px; border-radius: 50%;"><circle cx="64" cy="64" r="64" fill="#E1B000"/><text x="64" y="82" font-family="'Rubik', sans-serif" font-size="56" font-weight="900" fill="#FFF" text-anchor="middle">🐶</text></svg>`
  }
};
