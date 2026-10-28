'use strict';
// Smoke test: load the app's inline script in a fake DOM and make sure
// render paths execute and CRUD writes to localStorage work.
const fs = require('fs');
const path = require('path');
global.window = global;
const store = {};
global.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
};

function El() {
  this.listeners = {};
  this._html = '';
  this.value = '';
  this.textContent = '';
  this.children = [];
}
El.prototype = {
  addEventListener(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); },
  set innerHTML(v) { this._html = v; this._parseButtons(); },
  get innerHTML() { return this._html; },
  setAttribute() {}, getAttribute() { return null; },
  querySelectorAll() { return this._btns || []; },
  _parseButtons() { this._btns = []; },
  appendChild() {}, remove() {}, click() {},
  closest() { return null; },
  reset() { this.value = ''; },
  scrollIntoView() {}
};

const ids = ['warranty-form', 'renewal-form', 'warranty-list', 'renewal-rows', 'forecast-view', 'fc-today', 'btn-export'];
const els = {};
ids.forEach(id => { els[id] = new El(); });
(global.document = {
  getElementById: id => els[id] || (els[id] = new El()),
  querySelectorAll: () => [],
  createElement: () => new El(),
  body: new El()
});
global.confirm = () => false;
global.alert = m => { throw new Error('ALERT: ' + m); };
global.Blob = function () {};
global.URL = { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} };

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
eval(script);

// Simulate submitting a warranty item through the form listeners.
const form = els['warranty-form'];
function field(id, v) { els[id] = els[id] || new El(); els[id].value = v; return els[id]; }
els['w-id'] = field('w-id', '');
els['w-name'] = field('w-name', 'Test fridge');
els['w-type'] = field('w-type', 'Appliance');
els['w-purchase'] = field('w-purchase', '2026-01-15');
els['w-months'] = field('w-months', '12');
els['w-days'] = field('w-days', '');
els['w-loc'] = field('w-loc', 'kitchen drawer');
els['w-renew'] = field('w-renew', '99');



try { form.listeners['submit'][0]({ preventDefault() {} }); } catch (e) { console.error('SUBMIT FAIL:', e.message); process.exit(1); }


const saved = JSON.parse(store['wrt.items.v1']);
if (saved.length !== 1 || saved[0].name !== 'Test fridge') {
  console.error('FAIL: item not saved', saved);
  process.exit(1);
}
if ((JSON.parse(localStorage.getItem('wrt.renewals.v1') || '[]')).some(r => /warranty lapse/.test(r.name))) {
  console.error('FAIL: warranty renewCost leaked into renewals list');
  process.exit(1);
}
if (!els['warranty-list']._html.includes('Test fridge')) {
  console.error('FAIL: item not rendered');
  process.exit(1);
}

if (els['warranty-list']._html.indexOf('kitchen drawer') < 0) {
  console.error('FAIL: doc location not rendered');
  process.exit(1);
}
if (els['forecast-view']._html.indexOf('12-month total') < 0) {
  console.error('FAIL: forecast not rendered');
  process.exit(1);
}

// Renewal save path.
const rform = els['renewal-form'];
els['r-id'] = field('r-id', '');
els['r-name'] = field('r-name', 'Car insurance');
els['r-type'] = field('r-type', 'Insurance');
els['r-due'] = field('r-due', '2025-11-05');
els['r-cost'] = field('r-cost', '120');
els['r-interval'] = field('r-interval', '12');
els['r-note'] = field('r-note', 'email');


rform.listeners['submit'][0]({ preventDefault() {} });

const rSaved = JSON.parse(store['wrt.renewals.v1']);
if (rSaved.length !== 1) { console.error('FAIL: renewal not saved', rSaved); process.exit(1); }

console.log('SMOKE OK — save, render, forecast, persistence all executed');
