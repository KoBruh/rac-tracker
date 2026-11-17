// Tiny DOM helpers. Text always goes in as text, never as HTML.
// SPDX-License-Identifier: GPL-3.0-or-later

/** h('div.a.b', { attr: v, onclick: fn }, ...children) */
export function h(tag, props, ...children) {
  const [name, ...classes] = tag.split('.');
  const el = document.createElement(name || 'div');
  if (classes.length) el.className = classes.join(' ');
  if (props && (typeof props !== 'object' || props instanceof Node || Array.isArray(props))) {
    children.unshift(props);
    props = null;
  }
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className += ` ${v}`;
    else if (k === 'style') el.style.cssText = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const c of children) {
    if (c == null || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.append(c instanceof Node ? c : String(c));
  }
}

const SVG = 'http://www.w3.org/2000/svg';

/** Square-capped inline icon from path data. */
export function icon(d, cls = '') {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'square');
  svg.setAttribute('stroke-linejoin', 'miter');
  if (cls) svg.setAttribute('class', cls);
  const path = document.createElementNS(SVG, 'path');
  path.setAttribute('d', d);
  svg.append(path);
  return svg;
}

export const ICONS = {
  caret: 'M3 6l5 5 5-5',
  open: 'M2 4h5l1 2h6v7H2z',
};

/** Found/missing square. Shape carries the state; the label is for screen readers. */
export const square = (found, extra = '') => h(`span.sq${found ? '.on' : ''}${extra}`, { 'aria-hidden': 'true' });

export const timeText = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
