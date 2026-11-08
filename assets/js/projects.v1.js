/* Projects page filter (rm-projects-filter-script), loaded with defer. */
document.addEventListener('DOMContentLoaded', () => {
  const filterPills = document.querySelectorAll('.p-filter-pill');
  const projectGrid = document.querySelector('.pj-grid');
  if (!projectGrid) return;


  // Define tags for each project file
  const projectTagsMap = {
    'fallentear.html': ['motion-trailer', '3d-animation'],
    'neuroscape.html': ['card-illustrations'],
    'blastfront.html': ['motion-trailer'],
    'pacificrim.html': ['3d-animation', '3d-modeling'],
    'evermore.html': ['vis-dev', '3d-modeling'],
    'vflect.html': ['character-customization', '3d-characters', '3d-animation'],
    '3dcharacters.html': ['3d-characters', '3d-sculpt', '3d-modeling'],
    '3davatars.html': ['3d-characters', 'character-customization', '3d-sculpt'],
    'aloha.html': ['motion-trailer', '3d-animation'],
    'chap.html': ['motion-trailer', '3d-animation']
  };

  // Find all direct child containers of projectGrid that contain project links
  const directCards = [];
  const childDivs = Array.from(projectGrid.children);

  childDivs.forEach(child => {
    const link = child.querySelector('a[href$=".html"]');
    if (link) {
      const href = link.getAttribute('href');
      if (projectTagsMap[href]) {
        directCards.push({ element: child, href: href, tags: projectTagsMap[href] });
      }
    }
  });

  // Alias mapping for query params
  const aliasMap = {
    'illustration': 'card-illustrations',
    'illustrations': 'card-illustrations',
    'card-illustration': 'card-illustrations',
    'card-illustrations': 'card-illustrations',
    'animation': '3d-animation',
    'animations': '3d-animation',
    '3d-animation': '3d-animation',
    'concept-art': 'vis-dev',
    'visdev': 'vis-dev',
    'vis-dev': 'vis-dev',
    '3d-assets': 'vis-dev',
    '3d-chars': '3d-characters',
    '3d-character': '3d-characters',
    '3d-characters': '3d-characters',
    '3d-characters-props': '3d-characters,vis-dev',
    '3d-character-props': '3d-characters,vis-dev',
    '3d-chars-props': '3d-characters,vis-dev'
  };

  function applyFilter(filterRaw, updateUrl = false) {
    if (!filterRaw || filterRaw === 'all') {
      filterPills.forEach(p => p.classList.remove('active'));
      const allBtn = document.querySelector('.p-filter-pill[data-filter="all"]');
      if (allBtn) allBtn.classList.add('active');

      directCards.forEach(item => {
        item.element.classList.remove('p-card-hidden');
        item.element.style.removeProperty('display');
      });

      if (updateUrl && window.history.replaceState) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState(null, '', cleanUrl);
      }
      return;
    }

    // Resolve aliases and split comma-separated filters
    const rawTokens = filterRaw.split(',').map(s => s.trim().toLowerCase());
    const resolvedTags = [];
    rawTokens.forEach(token => {
      const mapped = aliasMap[token] || token;
      mapped.split(',').forEach(m => {
        const t = m.trim().toLowerCase();
        if (t && !resolvedTags.includes(t)) resolvedTags.push(t);
      });
    });

    // Update pills active states
    filterPills.forEach(p => p.classList.remove('active'));
    let anyPillMatched = false;
    resolvedTags.forEach(tag => {
      const matchingPill = document.querySelector(`.p-filter-pill[data-filter="${tag}"]`);
      if (matchingPill) {
        matchingPill.classList.add('active');
        anyPillMatched = true;
      }
    });
    if (!anyPillMatched) {
      const allBtn = document.querySelector('.p-filter-pill[data-filter="all"]');
      if (allBtn) allBtn.classList.add('active');
    }

    // Show/hide matching project cards
    directCards.forEach(item => {
      const match = resolvedTags.some(tag => item.tags.includes(tag));
      if (match) {
        item.element.classList.remove('p-card-hidden');
        item.element.style.removeProperty('display');
      } else {
        item.element.classList.add('p-card-hidden');
        item.element.style.setProperty('display', 'none', 'important');
      }
    });

    if (updateUrl && window.history.replaceState) {
      const newUrl = window.location.pathname + '?filter=' + encodeURIComponent(resolvedTags.join(','));
      window.history.replaceState(null, '', newUrl);
    }
  }

  // Attach click listener to each filter pill
  filterPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const activeFilter = pill.getAttribute('data-filter');
      applyFilter(activeFilter, true);
    });
  });

  // Handle incoming URL filter query on page load
  const urlParams = new URLSearchParams(window.location.search);
  const initialFilter = urlParams.get('filter') || urlParams.get('tag') || urlParams.get('cat');
  if (initialFilter) {
    applyFilter(initialFilter, false);
    setTimeout(() => {
      const filterBar = document.querySelector('.p-filter-bar-wrap');
      if (filterBar) {
        filterBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  }
});
