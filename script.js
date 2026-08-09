// ── THEME TOGGLE ──
const html = document.documentElement;
const toggleBtn = document.getElementById('themeToggle');
const toggleIcon = document.getElementById('toggleIcon');

// Load saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateIcon(savedTheme);

toggleBtn.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateIcon(next);
});

function updateIcon(theme) {
  toggleIcon.textContent = theme === 'dark' ? '○' : '☽';
}

// ── FADE-UP ON SCROLL ──
const fadeEls = document.querySelectorAll('.fade-up');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings within the same parent
      const siblings = [...entry.target.parentElement.querySelectorAll('.fade-up:not(.visible)')];
      const delay = siblings.indexOf(entry.target) * 80;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

fadeEls.forEach(el => observer.observe(el));

// ── ACTIVE NAV LINK ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav ul a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.style.color = 'var(--accent)';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));

// ── 2D KOB-ANDERSEN BIDISPERSE PACKING VISUAL ──
(function () {
  const svg = document.getElementById('packingSVG');
  if (!svg) return;
  const ns = 'http://www.w3.org/2000/svg';

  // Seeded LCG — same layout every load
  let seed = 31337;
  function rand() {
    seed = (Math.imul(1664525, seed) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  }

  // Generate dense KA mixture (Type A and Type B)
  const W = 350, H = 345, ox = 5, oy = 8;
  const particles = [];
  const target = 320; // High density target
  const ratioA = 0.65; // 65% Type A
  const rA = 9;
  const rB = 6.3;

  // Random Sequential Adsorption (RSA)
  for (let attempt = 0; attempt < target * 400 && particles.length < target; attempt++) {
    const isTypeA = particles.length < (target * ratioA);
    const r = isTypeA ? rA : rB;
    const x = ox + r + rand() * (W - 2 * r);
    const y = oy + r + rand() * (H - 2 * r);
    
    let ok = true;
    for (const p of particles) {
      // Allow a very slight overlap (1.5%) to pack more densely
      if (Math.hypot(x - p.x, y - p.y) < (r + p.r) * 0.985) { 
        ok = false; break; 
      }
    }
    if (ok) particles.push({ x, y, r, isTypeA });
  }

  // Draw nearest-neighbor bonds (sits behind discs)
  const bondG = document.createElementNS(ns, 'g');
  bondG.setAttribute('stroke', 'var(--border)');
  bondG.setAttribute('stroke-width', '0.6');
  bondG.setAttribute('opacity', '0.7');
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const p = particles[i], q = particles[j];
      if (Math.hypot(p.x - q.x, p.y - q.y) < (p.r + q.r) * 1.25) {
        const ln = document.createElementNS(ns, 'line');
        ln.setAttribute('x1', p.x); ln.setAttribute('y1', p.y);
        ln.setAttribute('x2', q.x); ln.setAttribute('y2', q.y);
        bondG.appendChild(ln);
      }
    }
  }
  svg.appendChild(bondG);

  // Particle discs
  particles.forEach((p) => {
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', p.x);
    c.setAttribute('cy', p.y);
    c.setAttribute('r', p.r);
    c.setAttribute('fill', 'var(--bg)');
    // Visually distinguish Type A (accent) and Type B (ink)
    c.setAttribute('stroke', p.isTypeA ? 'var(--ink3)' : 'var(--accent)');
    c.setAttribute('stroke-width', p.isTypeA ? '1.5' : '1.0');
    svg.appendChild(c);
  });

  // Simulation box outline
  const box = document.createElementNS(ns, 'rect');
  box.setAttribute('x', ox); box.setAttribute('y', oy);
  box.setAttribute('width', W); box.setAttribute('height', H);
  box.setAttribute('fill', 'none');
  box.setAttribute('stroke', 'var(--ink3)');
  box.setAttribute('stroke-width', '0.75');
  box.setAttribute('opacity', '0.5');
  svg.appendChild(box);

  // Caption
  const lbl = document.createElementNS(ns, 'text');
  lbl.setAttribute('x', '5');
  lbl.setAttribute('y', '360');
  lbl.setAttribute('font-family', 'Fira Code, monospace');
  lbl.setAttribute('font-size', '9');
  lbl.setAttribute('fill', 'var(--ink3)');
  lbl.textContent = '2D kob-andersen bidisperse model — N=' + particles.length;
  svg.appendChild(lbl);
})();
