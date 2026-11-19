const previews = new Set([
  'monster', 'space', 'chocolate', 'chameleon', 'frog', 'potions', 'dino',
  'rail', 'snail', 'camera', 'bubble', 'closet'
]);

export function gamePreview99(kind, fallback) {
  return previews.has(kind)
    ? `<img class="game99-thumb" src="assets/art99/${kind}-cover.webp" alt="" loading="lazy" decoding="async">`
    : fallback;
}

export const flightPreview99 = {
  feeder:'assets/art99/feeder-cover.webp'
};

export function hangarPaint99(selected, paintButton, speakButton) {
  return `<div class="hangar99-paints" role="group" aria-label="Malowanie Quinjeta">
    ${[['blue','Niebieskie'], ['mint','Miętowe'], ['gold','Złote']].map(([id,label]) =>
      `<div class="hangar99-paint" data-hangar99-paint="${id}" data-selected="${id===selected}">
        ${paintButton(id,label,id===selected)}
        ${speakButton(label+' malowanie.')}
      </div>`).join('')}
  </div>`;
}
