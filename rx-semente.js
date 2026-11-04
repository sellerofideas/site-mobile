const modules = [...document.querySelectorAll('[data-module]')];
const progressItems = [...document.querySelectorAll('[data-progress]')];
const offer = document.querySelector('#oferta');
const whatsAppCta = document.querySelector('.whatsapp-cta');
const previewMode = document.body.classList.contains('preview-mode');
const storageKey = 'meuzovo-rx-semente-completed';
let completed = Number.parseInt(localStorage.getItem(storageKey), 10) || 0;

function showThrough(moduleNumber) {
  modules.forEach((module, index) => {
    const number = index + 1;
    const unlocked = previewMode || number <= moduleNumber;
    module.hidden = !unlocked;
    module.classList.toggle('is-locked', !unlocked);
    module.classList.toggle('is-current', number === moduleNumber && number < 3);
  });

  progressItems.forEach((item, index) => {
    const number = index + 1;
    item.classList.toggle('is-complete', number <= completed);
    item.classList.toggle('is-active', number === moduleNumber && number > completed);
  });

  offer.hidden = !previewMode && completed < 3;
  whatsAppCta.classList.toggle('is-disabled', !previewMode && completed < 3);
  whatsAppCta.setAttribute('aria-disabled', String(!previewMode && completed < 3));
  whatsAppCta.tabIndex = previewMode || completed >= 3 ? 0 : -1;
}

function completeModule(moduleNumber) {
  if (moduleNumber > completed + 1) return;

  completed = Math.max(completed, moduleNumber);
  localStorage.setItem(storageKey, completed);
  showThrough(Math.min(completed + 1, 3));

  if (completed < 3) {
    modules[completed].scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    offer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

modules.forEach((module, index) => {
  const video = module.querySelector('video');
  const pendingMessage = module.querySelector('.video-pending');
  const sourceUrl = video.dataset.videoSrc.trim();
  let furthestTime = 0;

  if (!sourceUrl) {
    pendingMessage.hidden = false;
    return;
  }

  video.src = sourceUrl;
  video.addEventListener('timeupdate', () => {
    furthestTime = Math.max(furthestTime, video.currentTime);
  });
  video.addEventListener('seeking', () => {
    if (video.currentTime > furthestTime + 2) video.currentTime = furthestTime;
  });
  video.addEventListener('ended', () => completeModule(index + 1));
});

showThrough(Math.min(completed + 1, 3));
