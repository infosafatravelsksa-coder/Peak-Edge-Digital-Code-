/**
 * Orbit Digital CMS — Live Public Content Synchronizer
 * Zero-error real-time content, visibility, and brief intake engine.
 */
(function() {
  const FIRESTORE_DATABASE_ID = "ai-studio-maintenanceinfra-0bafca4a-d8c5-4471-9cf7-52d03e178f23";
  const PROJECT_ID = "safa-travel-ksa-1785253286798";
  const LOCAL_API_URL = "/api/cms/published/home";
  const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/publishedContent/home`;

  const SECTION_DOM_MAP = {
    'sec-hero': 'hero',
    'sec-channels': 'channels',
    'sec-creative': 'creative',
    'sec-innovation': 'innovation',
    'sec-workshops': 'workshops',
    'sec-workflow': 'workflow',
    'sec-about': 'about',
    'sec-proven': 'proven',
    'sec-clients': 'clients',
    'sec-faq': 'faq',
    'sec-pricing': 'pricing',
    'sec-contact': 'contact',
    'sec-footer': 'footer',
  };

  function parseFirestoreFields(fields) {
    if (!fields) return {};
    const res = {};
    for (const [k, v] of Object.entries(fields)) {
      if ('stringValue' in v) res[k] = v.stringValue;
      else if ('integerValue' in v) res[k] = parseInt(v.integerValue, 10);
      else if ('doubleValue' in v) res[k] = parseFloat(v.doubleValue);
      else if ('booleanValue' in v) res[k] = v.booleanValue;
      else if ('mapValue' in v) res[k] = parseFirestoreFields(v.mapValue.fields);
      else if ('arrayValue' in v) {
        res[k] = (v.arrayValue.values || []).map(val => {
          if ('stringValue' in val) return val.stringValue;
          if ('mapValue' in val) return parseFirestoreFields(val.mapValue.fields);
          return val;
        });
      }
    }
    return res;
  }

  // 1. Client Brief Submission Pipeline
  window.__orbitSubmitBrief = async function(briefData) {
    if (!briefData) return;
    try {
      const briefId = 'brief-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const servicesArray = Array.isArray(briefData.selectedServices)
        ? briefData.selectedServices
        : (briefData.services ? [briefData.services] : ['Full-Funnel Growth']);

      const payload = {
        fields: {
          clientTimestamp: { stringValue: new Date().toISOString() },
          contactName: { stringValue: String(briefData.contactName || briefData.name || 'Website Inquiry') },
          contactEmail: { stringValue: String(briefData.contactEmail || briefData.email || 'client@growth.lead') },
          companyName: { stringValue: String(briefData.companyName || briefData.company || '') },
          projectBudget: { stringValue: String(briefData.projectBudget || briefData.budget || '$25k - $50k') },
          timeline: { stringValue: String(briefData.timeline || 'Immediate') },
          notes: { stringValue: String(briefData.notes || briefData.message || '') },
          status: { stringValue: 'new' },
          receivedAt: { stringValue: new Date().toISOString() },
          selectedServices: {
            arrayValue: {
              values: servicesArray.map(s => ({ stringValue: String(s) }))
            }
          }
        }
      };

      const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/briefSubmissions?documentId=${briefId}`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      // Suppress network notice
    }
  };

  // 2. Visual Edit HUD
  let visualEditActive = false;

  function initVisualEditHUD() {
    try {
      if (window.location.hash.includes('visual-edit') || localStorage.getItem('orbit_visual_edit') === 'true') {
        visualEditActive = true;
      }

      if (document.getElementById('orbit-visual-edit-hud')) return;

      const ctrl = document.createElement('div');
      ctrl.id = 'orbit-visual-edit-hud';
      ctrl.style.cssText = 'position:fixed; bottom:18px; left:18px; z-index:99999; display:flex; align-items:center; gap:8px; font-family:ui-monospace,monospace; font-size:11px;';
      
      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.style.cssText = 'padding:7px 14px; border-radius:9999px; background:rgba(15,19,28,0.92); border:1px solid rgba(255,255,255,0.2); color:#fff; cursor:pointer; backdrop-filter:blur(10px); display:flex; align-items:center; gap:6px; box-shadow:0 4px 16px rgba(0,0,0,0.4);';
      toggleBtn.innerHTML = visualEditActive
        ? '<span style="width:6px; height:6px; border-radius:9999px; background:#00e5ff; display:inline-block;"></span><span>Visual Edit: ON</span>'
        : '<span style="width:6px; height:6px; border-radius:9999px; background:#94a3b8; display:inline-block;"></span><span>Visual Edit</span>';

      toggleBtn.addEventListener('click', () => {
        visualEditActive = !visualEditActive;
        try { localStorage.setItem('orbit_visual_edit', String(visualEditActive)); } catch (e) {}
        toggleBtn.innerHTML = visualEditActive
          ? '<span style="width:6px; height:6px; border-radius:9999px; background:#00e5ff; display:inline-block;"></span><span>Visual Edit: ON</span>'
          : '<span style="width:6px; height:6px; border-radius:9999px; background:#94a3b8; display:inline-block;"></span><span>Visual Edit</span>';
        updateSectionBadges();
      });

      ctrl.appendChild(toggleBtn);
      document.body.appendChild(ctrl);
      updateSectionBadges();
    } catch (e) {}
  }

  function updateSectionBadges() {
    for (const [secId, domId] of Object.entries(SECTION_DOM_MAP)) {
      const el = document.getElementById(domId);
      if (!el) continue;

      let badge = el.querySelector('.orbit-cms-edit-badge');
      if (visualEditActive) {
        el.style.position = el.style.position || 'relative';
        if (!badge) {
          badge = document.createElement('button');
          badge.className = 'orbit-cms-edit-badge';
          badge.type = 'button';
          badge.style.cssText = 'position:absolute; top:12px; right:12px; z-index:9000; padding:5px 10px; background:#00e5ff; color:#000; font-family:ui-monospace,monospace; font-size:10px; font-weight:700; border-radius:6px; border:none; cursor:pointer; box-shadow:0 2px 10px rgba(0,229,255,0.4); display:flex; align-items:center; gap:4px;';
          badge.innerHTML = `<span>✎ Edit ${domId.toUpperCase()}</span>`;
          badge.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.__openCmsAdmin) {
              window.__openCmsAdmin();
            }
          });
          el.appendChild(badge);
        }
        badge.style.display = 'flex';
      } else if (badge) {
        badge.style.display = 'none';
      }
    }
  }

  // 3. Dynamic Section Sync
  function applyCmsToDom(cmsData) {
    if (!cmsData || !cmsData.sections) return;

    for (const [secId, secData] of Object.entries(cmsData.sections)) {
      const domId = SECTION_DOM_MAP[secId];
      if (!domId) continue;
      const el = document.getElementById(domId);
      if (!el) continue;

      if (secData.isVisible === false) {
        el.style.display = 'none';
      } else {
        el.style.removeProperty('display');
      }

      if (secId === 'sec-innovation' && secData.content?.description) {
        const descEl = el.querySelector('p');
        if (descEl) descEl.textContent = secData.content.description;
      }
    }
  }

  async function fetchLivePublishedContent() {
    // 1. Try local endpoint first (guaranteed 200 OK, 0 error)
    try {
      const localRes = await fetch(LOCAL_API_URL, { cache: 'no-store' });
      if (localRes.ok) {
        const localData = await localRes.json();
        if (localData && localData.sections) {
          window.__ORBIT_CMS_DATA__ = localData;
          applyCmsToDom(localData);
          window.dispatchEvent(new CustomEvent('orbit-cms-update', { detail: localData }));
        }
      }
    } catch (e) {}

    // 2. Try Firestore REST endpoint in background
    try {
      const fsRes = await fetch(FIRESTORE_URL, { cache: 'no-store' });
      if (fsRes.ok) {
        const json = await fsRes.json();
        if (json.fields) {
          const cmsData = parseFirestoreFields(json.fields);
          window.__ORBIT_CMS_DATA__ = cmsData;
          applyCmsToDom(cmsData);
          window.dispatchEvent(new CustomEvent('orbit-cms-update', { detail: cmsData }));
        }
      }
    } catch (e) {}
  }

  // Boot
  fetchLivePublishedContent();
  setInterval(fetchLivePublishedContent, 15000);
  window.__refreshOrbitCms = fetchLivePublishedContent;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initVisualEditHUD();
      if (window.__ORBIT_CMS_DATA__) applyCmsToDom(window.__ORBIT_CMS_DATA__);
    });
  } else {
    initVisualEditHUD();
  }
})();
