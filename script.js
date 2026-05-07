let currentLang = 'en';
let translations = {};

async function loadTranslations(lang) {
  try {
    const response = await fetch(`lang-${lang}.json`);
    translations = await response.json();
    updatePageContent();
    currentLang = lang;
    localStorage.setItem('preferredLang', lang);
    updateLangButtons();
  } catch (error) {
    console.error('Error loading translations:', error);
  }
}

function updatePageContent() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value[k];
      if (!value) break;
    }
    if (value) {
      element.textContent = value;
    }
  });
}

function updateLangButtons() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

function switchLanguage(lang) {
  loadTranslations(lang);
}

window.addEventListener('load', () => {
  const savedLang = localStorage.getItem('preferredLang') || 'en';
  loadTranslations(savedLang);
  
  document.getElementById('currentYear').textContent = new Date().getFullYear();
  
  setTimeout(() => {
    const l = document.getElementById('loader');
    l.style.opacity = '0';
    l.style.transition = 'opacity .6s ease';
    setTimeout(() => l.remove(), 700);
  }, 1800);
});

const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.transform = `translate(${mx - 6}px,${my - 6}px)`;
});

(function animRing() {
  rx += (mx - rx) * .12;
  ry += (my - ry) * .12;
  ring.style.transform = `translate(${rx - 20}px,${ry - 20}px)`;
  requestAnimationFrame(animRing);
})();

document.querySelectorAll('a,button,.port-card,.service-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    ring.style.width = '60px';
    ring.style.height = '60px';
  });
  el.addEventListener('mouseleave', () => {
    ring.style.width = '40px';
    ring.style.height = '40px';
  });
});

const ham = document.getElementById('hamburger');
const mmenu = document.getElementById('mobileMenu');

function closeMenu() {
  ham.classList.remove('open');
  mmenu.classList.remove('open');
  document.body.style.overflow = '';
}

ham.addEventListener('click', () => {
  const o = ham.classList.toggle('open');
  mmenu.classList.toggle('open', o);
  document.body.style.overflow = o ? 'hidden' : '';
});

window.addEventListener('scroll', () => {
  document.querySelector('nav').style.background = window.scrollY > 50 ? 'rgba(10,10,10,.97)' : 'rgba(10,10,10,.85)';
});

const obs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 60);
      obs.unobserve(e.target);
    }
  });
}, { threshold: .08 });

document.querySelectorAll('.reveal').forEach(r => obs.observe(r));

function filterWork(btn, cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#portfolio-grid .port-card').forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? 'block' : 'none';
    if (show) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'opacity .4s,transform .4s';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 50);
    }
  });
  activePortCat = cat;
  if (window.innerWidth <= 768) portCarousel.render();
}

function makeCarousel(opts) {
  const track = document.getElementById(opts.trackId);
  const prev = document.getElementById(opts.prevId);
  const next = document.getElementById(opts.nextId);
  const dotsEl = document.getElementById(opts.dotsId);
  const counter = document.getElementById(opts.counterId);
  let cur = 0, items = [], startX = 0, startTime = 0;

  function render() {
    items = opts.getItems();
    if (!items.length) {
      track.innerHTML = '';
      dotsEl.innerHTML = '';
      counter.textContent = '0/0';
      return;
    }
    track.innerHTML = items.map(opts.renderItem).join('');
    dotsEl.innerHTML = items.map((_, i) => `<button class="carousel-dot${i === 0 ? ' active' : ''}" onclick="void(0)"></button>`).join('');
    cur = 0;
    update();
  }

  function cardWidth() {
    const c = track.firstElementChild;
    return c ? c.offsetWidth + 14 : 0;
  }

  function update() {
    track.style.transform = `translateX(-${cur * cardWidth()}px)`;
    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === cur));
    counter.textContent = `${cur + 1}/${items.length}`;
    prev.style.opacity = cur === 0 ? '.3' : '1';
    next.style.opacity = cur === items.length - 1 ? '.3' : '1';
  }

  function goTo(n) {
    cur = Math.max(0, Math.min(items.length - 1, n));
    update();
  }

  prev.addEventListener('click', () => goTo(cur - 1));
  next.addEventListener('click', () => goTo(cur + 1));

  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startTime = Date.now();
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dt = Date.now() - startTime;
    if (Math.abs(dx) > 36 && dt < 400) {
      dx < 0 ? goTo(cur + 1) : goTo(cur - 1);
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    setTimeout(update, 100);
  });

  return { render, goTo };
}

const portData = [
  { cat: 'mockup', meta: 'Mockup', img: 'Images/main-images/mockup.jpeg', catLabel: 'Product Mockup', name: '' },
  { cat: 'logo', meta: 'Logo', img: 'Images/main-images/logodesign.jpeg', catLabel: 'Logo Design', name: '' },
  { cat: 'flyer', meta: 'Flyer', img: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80', catLabel: 'Event Flyer', name: '' },
  { cat: 'tshirt', meta: 'T-Shirt', img: 'Images/main-images/tshirt-mockup.png', catLabel: 'T-Shirt Mockup', name: '' },
  { cat: 'branding', meta: 'Branding', img: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=600&q=80', catLabel: 'Brand Identity', name: '' },
  { cat: 'flyer', meta: 'Flyer', img: 'Images/main-images/flyer1.jpeg', catLabel: 'Event Flyer', name: '' },
  { cat: 'social', meta: 'Social', img: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=700&q=80', catLabel: 'Social Media Kit', name: '' },
  { cat: 'packaging', meta: 'Packaging', img: 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&q=80', catLabel: 'Packaging Design', name: '' },
  { cat: 'bgremove', meta: 'BG Remove', img: 'Images/main-images/emma.png', catLabel: 'Background Removal', name: '' },
  { cat: 'mockup', meta: 'Mockup', img: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80', catLabel: 'Product Mockup', name: '' },
  { cat: 'branding', meta: 'Full Brand', img: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?w=900&q=80', catLabel: 'Complete Branding', name: 'NORTHWAVE COLLECTIVE', special: true },
];

let activePortCat = 'all';

const portCarousel = makeCarousel({
  trackId: 'portTrack',
  prevId: 'portPrev',
  nextId: 'portNext',
  dotsId: 'portDots',
  counterId: 'portCounter',
  getItems: () => activePortCat === 'all' ? portData : portData.filter(p => p.cat === activePortCat),
  renderItem: p => {
    if (p.special) {
      return `<div class="port-card carousel-card-size special-card" data-cat="${p.cat}" onclick="window.location.href='branding-showcase.html'">
        <span class="port-meta">${p.meta}</span>
        <img class="port-img" src="${p.img}" alt="${p.name}" loading="lazy" style="aspect-ratio:4/3;"/>
        <div class="port-overlay special-overlay">
          <div class="port-category">${p.catLabel}</div>
          <div class="port-name">${p.name}</div>
          <p class="port-description" style="font-size:13px;margin:10px 0 16px;">Explore a complete brand identity package including logo, mockups, and marketing materials.</p>
          <button class="view-branding-btn" style="font-size:11px;padding:12px 24px;">View Full Branding Kit →</button>
        </div>
      </div>`;
    }
    return `<div class="port-card carousel-card-size" data-cat="${p.cat}">
      <span class="port-meta">${p.meta}</span>
      <img class="port-img" src="${p.img}" alt="${p.catLabel}" loading="lazy" style="aspect-ratio:4/3;"/>
      <div class="port-overlay"><div class="port-category">${p.catLabel}</div>${p.name ? `<div class="port-name">${p.name}</div><div class="port-arrow">→</div>` : ''}</div>
    </div>`;
  }
});

const svcData = [
  { num: '01', icon: '<i class="fa-solid fa-image"></i>', title: 'Mockup Design', desc: 'Photorealistic product mockups — packaging, phones, apparel to print.', tags: ['Product', '3D', 'Print'] },
  { num: '02', icon: '<i class="fa-solid fa-file-lines"></i>', title: 'Flyer Design', desc: 'Eye-stopping event flyers and printed marketing assets.', tags: ['Events', 'Print', 'Digital'] },
  { num: '03', icon: '<i class="fa-solid fa-gem"></i>', title: 'Branding Pack', desc: 'Complete brand identity — logo, palette, typography, full asset library.', tags: ['Identity', 'Guidelines', 'Assets'] },
  { num: '04', icon: '<i class="fa-solid fa-pen-nib"></i>', title: 'Logo Design', desc: 'Distinctive, scalable logos — icons, wordmarks, combination marks.', tags: ['Wordmark', 'Icon', 'Monogram'] },
  { num: '05', icon: '<i class="fa-solid fa-shirt"></i>', title: 'T-Shirt Mockup', desc: 'Premium apparel mockups for merch drops and clothing lines.', tags: ['Apparel', 'Merch', 'Streetwear'] },
  { num: '06', icon: '<i class="fa-solid fa-mobile-screen"></i>', title: 'Social Media Kit', desc: 'Cohesive templates and story packs for a memorable online presence.', tags: ['Instagram', 'Templates', 'Stories'] },
];

const svcCarousel = makeCarousel({
  trackId: 'svcTrack',
  prevId: 'svcPrev',
  nextId: 'svcNext',
  dotsId: 'svcDots',
  counterId: 'svcCounter',
  getItems: () => svcData,
  renderItem: s => `<div class="service-card carousel-card-size" style="padding:32px 24px;">
    <div class="service-num">${s.num}</div><div class="service-icon">${s.icon}</div>
    <div class="service-title">${s.title}</div><div class="service-desc">${s.desc}</div>
    <div class="service-tags">${s.tags.map(t => `<span class="service-tag">${t}</span>`).join('')}</div>
  </div>`
});

const testiData = [
  { quote: 'The branding pack completely transformed how our clients perceive us. Clean, bold, and perfectly aligned with our vision.', name: 'Marcus T.', role: 'CEO, Volta Agency', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
  { quote: "Incredible attention to detail on our t-shirt mockups. Way beyond expectations — our merch sold out in 3 days.", name: 'Aisha K.', role: 'Founder, StreetDrop', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  { quote: 'The event flyer blew everyone away. People were stopping on the street to look at it. Most impactful design work we ever had.', name: 'Daniel R.', role: 'Event Director, Neon Nights', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80' },
];

const testiCarousel = makeCarousel({
  trackId: 'testiTrack',
  prevId: 'testiPrev',
  nextId: 'testiNext',
  dotsId: 'testiDots',
  counterId: 'testiCounter',
  getItems: () => testiData,
  renderItem: t => `<div class="testi-card carousel-card-size">
    <div class="testi-quote">"</div>
    <p class="testi-text">${t.quote}</p>
    <div class="testi-author"><img class="testi-avatar" src="${t.img}" alt="${t.name}"/><div><div class="testi-name">${t.name}</div><div class="testi-role">${t.role}</div></div></div>
  </div>`
});

function initCarousels() {
  if (window.innerWidth <= 768) {
    portCarousel.render();
    svcCarousel.render();
    testiCarousel.render();
  }
}

initCarousels();

let rt;
window.addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(initCarousels, 250);
});

function openLightbox(imgSrc) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  lightboxImg.src = imgSrc;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});
