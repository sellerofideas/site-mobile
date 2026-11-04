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
    if (event.pointerType === 'mouse' && !event.target.closest('details, summary, a, button')) {
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

const productDetails = [...document.querySelectorAll('.product-details')];

function positionProductDetails(details) {
  const card = details.sourceCard;
  const cardRect = card.getBoundingClientRect();
  const margin = 12;
  const width = Math.min(cardRect.width, window.innerWidth - margin * 2);
  const left = Math.min(Math.max(cardRect.left, margin), window.innerWidth - width - margin);
  const top = cardRect.bottom + window.scrollY - 8;
  const maxHeight = Math.min(620, Math.max(180, window.innerHeight - cardRect.bottom - margin));

  details.style.setProperty('--details-top', `${top}px`);
  details.style.setProperty('--details-left', `${left + window.scrollX}px`);
  details.style.setProperty('--details-width', `${width}px`);
  details.style.setProperty('--details-max-height', `${maxHeight}px`);
}

function positionOpenProductDetails() {
  productDetails.filter(details => details.open).forEach(positionProductDetails);
}

productDetails.forEach(details => {
  details.addEventListener('toggle', () => {
    if (!details.open) {
      details.placeholder.replaceWith(details);
      return;
    }

    productDetails.filter(item => item !== details && item.open).forEach(item => {
      item.open = false;
    });

    details.sourceCard = details.closest('.product-card');
    details.placeholder = document.createComment('product-details');
    details.replaceWith(details.placeholder);
    document.body.append(details);
    positionProductDetails(details);
  });
});

window.addEventListener('resize', positionOpenProductDetails);
window.addEventListener('scroll', positionOpenProductDetails, { passive: true });
productsScroll?.addEventListener('scroll', positionOpenProductDetails, { passive: true });
