import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { AdminDashboard } from './AdminDashboard';
import '../index.css';

// 1. Standalone /admin.html page mount
const standaloneContainer = document.getElementById('admin-root');
if (standaloneContainer) {
  const root = createRoot(standaloneContainer);
  root.render(<AdminDashboard onClose={() => { window.location.href = '/'; }} isStandalone={true} />);
}

// 2. In-page modal / overlay mount on index.html
const modalContainer = document.getElementById('admin-modal-root');
let modalRoot: Root | null = null;

function renderModal() {
  if (!modalContainer) return;
  if (!modalRoot) {
    modalRoot = createRoot(modalContainer);
  }

  // Set default modal container presentation
  modalContainer.style.display = 'block';
  modalContainer.style.background = 'rgba(15, 23, 42, 0.75)';
  modalContainer.style.backdropFilter = 'blur(6px)';
  modalContainer.style.pointerEvents = 'auto';
  document.body.style.overflow = 'hidden';

  const handleClose = () => {
    if (modalContainer) {
      modalContainer.style.display = 'none';
      modalContainer.style.background = '';
      modalContainer.style.backdropFilter = '';
      modalContainer.style.pointerEvents = 'auto';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      if (window.location.hash === '#admin') {
        history.pushState(null, '', window.location.pathname + window.location.search);
      }
    }
  };

  const handleDockModeChange = (mode: 'split' | 'modal') => {
    if (!modalContainer) return;
    if (mode === 'split') {
      modalContainer.style.background = 'transparent';
      modalContainer.style.backdropFilter = 'none';
      modalContainer.style.pointerEvents = 'none';
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '620px';
    } else {
      modalContainer.style.background = 'rgba(15, 23, 42, 0.75)';
      modalContainer.style.backdropFilter = 'blur(6px)';
      modalContainer.style.pointerEvents = 'auto';
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '';
    }
  };

  modalRoot.render(
    <AdminDashboard
      onClose={handleClose}
      onDockModeChange={handleDockModeChange}
      isStandalone={false}
    />
  );
}

// Global hook
(window as any).__openCmsAdmin = renderModal;

// Auto-open if URL has #admin or query ?admin
if (typeof window !== 'undefined') {
  if (window.location.hash === '#admin' || window.location.search.includes('admin')) {
    setTimeout(renderModal, 100);
  }

  // Bind to button
  window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('cms-admin-btn') || document.getElementById('cms-admin-link');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        renderModal();
      });
    }
  });

  // Also bind via click delegation so it works even if dynamically rendered
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    const btn = target?.closest('#cms-admin-btn, #cms-admin-link, [data-open-admin]');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      renderModal();
    }
  }, true); // Use capture phase so nothing can preventDefault or stop it!
}
