/* RadMoon Studios — shared site behaviour. Loaded with `defer` on every page. */

/* ---------- Contact form ("Send Us The Brief") ----------
   Same behaviour as the original inline onsubmit: no network request, the button just confirms. */
document.querySelectorAll('.rm-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.querySelector('.rm-submit-btn').textContent = 'Sent \u2713';
  });
});

/* ---------- YouTube facade ----------
   <button class="yt-facade" data-yt="VIDEO_ID"> holds a lazy thumbnail + play icon.
   On click it is replaced in place by a youtube-nocookie iframe that autoplays. */
document.addEventListener('click', e => {
  const btn = e.target.closest('.yt-facade[data-yt]');
  if (!btn || btn.querySelector('iframe')) return;
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(btn.dataset.yt) + '?autoplay=1&rel=0';
  iframe.title = btn.getAttribute('aria-label') || 'YouTube video';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  btn.appendChild(iframe);
  btn.removeAttribute('data-yt');
  btn.style.cursor = 'default';
});

/* YouTube thumbnails: if a video has no high-res thumbnail, YouTube returns a 120px grey
   placeholder; swap to the standard-quality one so every facade shows a real frame. */
document.querySelectorAll('.yt-facade[data-yt] img').forEach(img => {
  const fix = () => {
    if (img.naturalWidth && img.naturalWidth <= 120 && !img.dataset.fallback) {
      img.dataset.fallback = '1';
      img.src = 'https://i.ytimg.com/vi/' + img.closest('.yt-facade').dataset.yt + '/hqdefault.jpg';
    }
  };
  if (img.complete) fix(); else img.addEventListener('load', fix);
});

/* ---------- Project gallery + lightbox (rm-project-gallery-script) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Autoplay page videos muted + looped. The hero video starts immediately;
  //    videos further down start loading/playing only when they come near the screen.
  const startVideo = v => {
    v.preload = 'auto';
    const p = v.play();
    if (p !== undefined) {
      p.catch(() => {
        const resume = () => {
          v.play().catch(() => {});
          window.removeEventListener('scroll', resume);
          window.removeEventListener('click', resume);
          window.removeEventListener('touchstart', resume);
        };
        window.addEventListener('scroll', resume, { passive: true, once: true });
        window.addEventListener('click', resume, { once: true });
        window.addEventListener('touchstart', resume, { passive: true, once: true });
      });
    }
  };
  const lazyVideos = [];
  Array.from(document.querySelectorAll('video')).forEach(v => {
    if (v.id === 'rmGalleryMainVideo') return;
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.loop = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    if (v.closest('.pj-hero') || !('IntersectionObserver' in window)) startVideo(v);
    else lazyVideos.push(v);
  });
  if (lazyVideos.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { startVideo(en.target); }
        else if (!en.target.paused) { en.target.pause(); }
      });
    }, { rootMargin: '300px 0px' });
    lazyVideos.forEach(v => io.observe(v));
  }

  const modal = document.getElementById('rmGalleryModal');
  const mainImg = document.getElementById('rmGalleryMainImg');
  const mainVideo = document.getElementById('rmGalleryMainVideo');
  const counter = document.getElementById('rmGalleryCounter');
  const thumbsStrip = document.getElementById('rmGalleryThumbs');
  const btnClose = document.getElementById('rmGalleryClose');
  const btnBackdrop = document.getElementById('rmGalleryBackdrop');
  const btnPrev = document.getElementById('rmGalleryPrev');
  const btnNext = document.getElementById('rmGalleryNext');

  if (!modal || !mainImg || !mainVideo) return;

  // Helper: is element in header, footer, social, or "Related Projects" section?
  function isExcluded(el) {
    if (!el) return true;
    if (
      el.closest('.rm-global-header') ||
      el.closest('.rm-global-footer') ||
      el.closest('.rm-contact-section') ||
      el.closest('.related-section') ||
      el.closest('.yt-facade') ||
      el.closest('#rmGalleryModal') ||
      el.classList.contains('rm-logo-img')
    ) {
      return true;
    }
    return false;
  }

  const galleryItems = [];

  // 1. Gather all project artwork images
  const allImgs = Array.from(document.querySelectorAll('img'));
  allImgs.forEach(img => {
    const src = img.getAttribute('src');
    if (!src || isExcluded(img)) return;
    if (src.includes('logo.')) {
      return;
    }
    if (!galleryItems.some(it => it.src === src)) {
      galleryItems.push({
        type: 'image',
        src: src,
        poster: src,
        domElements: [img]
      });
    } else {
      const existing = galleryItems.find(it => it.src === src);
      if (existing) existing.domElements.push(img);
    }
    img.classList.add('rm-artwork-clickable');
  });

  // 2. Gather all project videos
  const allVideos = Array.from(document.querySelectorAll('video'));
  allVideos.forEach(vid => {
    if (vid.id === 'rmGalleryMainVideo') return;
    const src = vid.getAttribute('src') || (vid.querySelector('source') ? vid.querySelector('source').getAttribute('src') : null);
    if (!src || isExcluded(vid)) return;

    const poster = vid.getAttribute('poster') || '';
    const elementsToListen = [vid];
    if (vid.parentElement) {
      elementsToListen.push(vid.parentElement);
      vid.parentElement.style.cursor = 'zoom-in';
    }

    if (!galleryItems.some(it => it.src === src)) {
      galleryItems.push({
        type: 'video',
        src: src,
        poster: poster,
        domElements: elementsToListen
      });
    } else {
      const existing = galleryItems.find(it => it.src === src);
      if (existing) {
        elementsToListen.forEach(el => {
          if (!existing.domElements.includes(el)) existing.domElements.push(el);
        });
      }
    }
    vid.classList.add('rm-artwork-clickable');
    vid.style.cursor = 'zoom-in';
  });

  const total = galleryItems.length;
  if (total === 0) return;

  let currentIndex = 0;

  function renderThumbs() {
    thumbsStrip.innerHTML = '';
    const offsets = total <= 7 
      ? Array.from({ length: total }, (_, i) => i - currentIndex)
      : [-3, -2, -1, 0, 1, 2, 3];

    offsets.forEach(offset => {
      const idx = (currentIndex + offset + total * 10) % total;
      const item = galleryItems[idx];
      const isActive = (idx === currentIndex);

      const thumbDiv = document.createElement('div');
      thumbDiv.className = 'rm-thumb-item' + (isActive ? ' rm-thumb-active' : '');
      thumbDiv.dataset.index = idx;
      thumbDiv.setAttribute('title', 'Item ' + (idx + 1));

      if (item.type === 'video') {
        thumbDiv.innerHTML = '<div class="rm-thumb-video-wrap">' +
          '<video src="' + item.src + '#t=0.1" muted playsinline preload="metadata"></video>' +
          '<div class="rm-thumb-play-badge"><span class="rm-thumb-play-icon">▶</span></div>' +
          '</div>';
      } else {
        thumbDiv.innerHTML = '<img src="' + item.src + '" alt="Thumb ' + (idx + 1) + '" loading="lazy">';
      }

      thumbDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        showItem(idx);
      });

      thumbsStrip.appendChild(thumbDiv);
    });
  }

  function showItem(index) {
    if (total === 0) return;
    currentIndex = (index + total) % total;
    const item = galleryItems[currentIndex];

    if (item.type === 'video') {
      // Strictly hide the image element
      mainImg.classList.remove('rm-media-visible');
      mainImg.classList.add('rm-media-hidden');
      mainImg.removeAttribute('src');

      // Show and play video element
      mainVideo.classList.remove('rm-media-hidden');
      mainVideo.classList.add('rm-media-visible');
      mainVideo.src = item.src;
      mainVideo.currentTime = 0;
      mainVideo.play().catch(() => {});
    } else {
      // Strictly hide the video element
      mainVideo.pause();
      mainVideo.removeAttribute('src');
      mainVideo.classList.remove('rm-media-visible');
      mainVideo.classList.add('rm-media-hidden');

      // Show image element
      mainImg.classList.remove('rm-media-hidden');
      mainImg.classList.add('rm-media-visible');
      mainImg.style.opacity = '0.5';
      mainImg.src = item.src;
      mainImg.onload = () => {
        mainImg.style.opacity = '1';
      };
    }

    counter.textContent = (currentIndex + 1) + ' / ' + total;
    renderThumbs();
  }

  function openGallery(index) {
    showItem(index);
    modal.classList.add('rm-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeGallery() {
    mainVideo.pause();
    mainVideo.removeAttribute('src');
    mainVideo.classList.remove('rm-media-visible');
    mainVideo.classList.add('rm-media-hidden');

    mainImg.classList.remove('rm-media-visible');
    mainImg.classList.add('rm-media-hidden');
    mainImg.removeAttribute('src');

    modal.classList.remove('rm-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Attach click events on artwork images and video cards
  galleryItems.forEach((item, itemIdx) => {
    item.domElements.forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openGallery(itemIdx);
      });
    });
  });

  btnPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    showItem(currentIndex - 1);
  });

  btnNext.addEventListener('click', (e) => {
    e.stopPropagation();
    showItem(currentIndex + 1);
  });

  btnClose.addEventListener('click', closeGallery);
  btnBackdrop.addEventListener('click', closeGallery);

  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('rm-active')) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      showItem(currentIndex - 1);
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      showItem(currentIndex + 1);
    } else if (e.key === 'Escape') {
      closeGallery();
    }
  });
});
