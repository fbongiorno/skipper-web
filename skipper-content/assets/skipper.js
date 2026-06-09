// Skipper content hub — shared JS
// Highlight active nav link based on current path
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && path.startsWith(href) && href !== '/') {
      link.classList.add('active');
    }
  });

  // FAQ accordion (optional enhancement)
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (q && a) {
      q.style.cursor = 'pointer';
      q.addEventListener('click', () => {
        const open = a.style.display !== 'none';
        document.querySelectorAll('.faq-a').forEach(el => el.style.display = 'none');
        if (!open) a.style.display = 'block';
      });
      // Start all open
      a.style.display = 'block';
    }
  });
});

// Smooth scroll for TOC links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
