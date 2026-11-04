const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    el.classList.add('visible');
  } else {
    observer.observe(el);
  }
});

const productsScroll = document.querySelector('.products-scroll');

if (productsScroll) {
  let isDragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;

  productsScroll.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') {
      isDragging = true;
      dragStartX = event.clientX;
      dragStartScroll = productsScroll.scrollLeft;
      productsScroll.setPointerCapture(event.pointerId);
    }
  });
  productsScroll.addEventListener('pointermove', event => {
    if (!isDragging) return;
    productsScroll.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
  });
  productsScroll.addEventListener('pointerup', event => {
    if (isDragging) {
      isDragging = false;
      productsScroll.releasePointerCapture(event.pointerId);
    }
  });
  productsScroll.addEventListener('pointercancel', () => {
    isDragging = false;
  });

  document.querySelectorAll('[data-products-direction]').forEach(button => {
    button.addEventListener('click', () => {
      const card = productsScroll.querySelector('.product-card');
      const distance = card ? card.offsetWidth + 22 : productsScroll.clientWidth * 0.8;
      const direction = button.dataset.productsDirection === 'next' ? 1 : -1;
      productsScroll.scrollBy({ left: distance * direction, behavior: 'smooth' });
    });
  });
}
