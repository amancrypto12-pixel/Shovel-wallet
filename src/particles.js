/* ==========================================================================
   HTML5 CANVAS PARTICLE ENGINE (BACKGROUND & EXPLOSIVE TAP SPARKS)
   ========================================================================== */

export class ParticleEngine {
  constructor(bgCanvasId, sparkCanvasId) {
    this.bgCanvas = document.getElementById(bgCanvasId);
    this.sparkCanvas = document.getElementById(sparkCanvasId);
    this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;
    this.sparkCtx = this.sparkCanvas ? this.sparkCanvas.getContext('2d') : null;

    this.sparks = [];
    this.bgParticles = [];

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initBgParticles();
    this.animate();
  }

  resize() {
    if (this.bgCanvas) {
      this.bgCanvas.width = window.innerWidth;
      this.bgCanvas.height = window.innerHeight;
    }
    if (this.sparkCanvas) {
      this.sparkCanvas.width = window.innerWidth;
      this.sparkCanvas.height = window.innerHeight;
    }
  }

  initBgParticles() {
    this.bgParticles = [];
    const count = 35;
    for (let i = 0; i < count; i++) {
      this.bgParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2 + 0.5,
        color: Math.random() > 0.5 ? 'rgba(255, 215, 0, ' : 'rgba(0, 255, 255, ',
        alpha: Math.random() * 0.4 + 0.1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4
      });
    }
  }

  spawnTapSparks(x, y, text = '+500', isGold = true) {
    // 1. Create floating tap number
    const floatingNum = document.createElement('div');
    floatingNum.className = 'floating-tap-number';
    floatingNum.innerText = text;
    floatingNum.style.left = `${x}px`;
    floatingNum.style.top = `${y}px`;
    floatingNum.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      transform: translate(-50%, -50%);
      font-family: 'Rubik', sans-serif;
      font-size: 1.6rem;
      font-weight: 900;
      color: ${isGold ? '#FFD700' : '#00FFFF'};
      text-shadow: 0 0 15px ${isGold ? 'rgba(255, 215, 0, 0.8)' : 'rgba(0, 255, 255, 0.8)'};
      pointer-events: none;
      z-index: 1000;
      animation: float-up-fade 0.8s ease-out forwards;
    `;
    document.body.appendChild(floatingNum);
    setTimeout(() => floatingNum.remove(), 800);

    // 2. Spawn spark particles
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 2,
        color: isGold ? '#FFD700' : '#00FFFF',
        alpha: 1,
        life: 1,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  }

  animate() {
    // Render Background Particles
    if (this.bgCtx) {
      this.bgCtx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
      this.bgParticles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = this.bgCanvas.width;
        if (p.x > this.bgCanvas.width) p.x = 0;
        if (p.y < 0) p.y = this.bgCanvas.height;
        if (p.y > this.bgCanvas.height) p.y = 0;

        this.bgCtx.beginPath();
        this.bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.bgCtx.fillStyle = `${p.color}${p.alpha})`;
        this.bgCtx.fill();
      });
    }

    // Render Tap Sparks
    if (this.sparkCtx) {
      this.sparkCtx.clearRect(0, 0, this.sparkCanvas.width, this.sparkCanvas.height);
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const s = this.sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.15; // Gravity effect
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          this.sparks.splice(i, 1);
          continue;
        }

        this.sparkCtx.beginPath();
        this.sparkCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        this.sparkCtx.fillStyle = s.color;
        this.sparkCtx.globalAlpha = s.alpha;
        this.sparkCtx.shadowBlur = 10;
        this.sparkCtx.shadowColor = s.color;
        this.sparkCtx.fill();
        this.sparkCtx.globalAlpha = 1;
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Keyframes for floating number injection
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes float-up-fade {
    0% { transform: translate(-50%, -50%) scale(0.6); opacity: 1; }
    50% { transform: translate(-50%, -100px) scale(1.2); opacity: 1; }
    100% { transform: translate(-50%, -150px) scale(0.9); opacity: 0; }
  }
`;
document.head.appendChild(styleSheet);
