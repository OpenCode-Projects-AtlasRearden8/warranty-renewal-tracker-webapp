'use strict';
const core = require('../warranty-core.js');

let pass = 0, fail = 0;
function t(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + '\n    expected: ' + JSON.stringify(expected) + '\n    actual:   ' + JSON.stringify(actual)); }
}

console.log('parseDate');
t('accepts ISO', core.parseDate('2026-01-15') && core.parseDate('2026-01-15').toISOString ? true : false, true);
t('rejects garbage', core.parseDate('nope'), null);
t('rejects empty', core.parseDate(''), null);
t('accepts MM/DD/YYYY', core.toISODate(core.parseDate('03/05/2027')), '2027-03-05');
t('rejects invalid month 13-ISO', core.parseDate('2026-13-01'), null);
t('rejects invalid day 32-ISO', core.parseDate('2026-01-32'), null);

console.log('addMonths');
t('2026-01-15 + 12m', core.toISODate(core.addMonths(core.parseDate('2026-01-15'), 12)), '2027-01-15');
t('end-of-month clamp Jan31+1m', core.toISODate(core.addMonths(core.parseDate('2026-01-31'), 1)), '2026-02-28');
t('leap year Feb', core.toISODate(core.addMonths(core.parseDate('2024-01-31'), 1)), '2024-02-29');
t('zero months', core.toISODate(core.addMonths(core.parseDate('2026-06-10'), 0)), '2026-06-10');
t('year rollover', core.toISODate(core.addMonths(core.parseDate('2026-11-05'), 3)), '2027-02-05');

console.log('expiryDate');
t('12-month warranty', core.toISODate(core.expiryDate('2025-03-10', 12, 0)), '2026-03-10');
t('24-month warranty', core.toISODate(core.expiryDate('2024-06-01', 24, 0)), '2026-06-01');
t('day-based warranty 365d', core.toISODate(core.expiryDate('2026-01-01', 0, 365)), '2027-01-01');
t('warranty length missing', core.expiryDate('2026-01-01', 0, 0), null);
t('purchase date missing', core.expiryDate('garbage', 12, 0), null);

console.log('daysUntilExpiry');
t('known diff', core.daysUntilExpiry('2026-01-01', 12, 0, '2026-09-15'), 108);
t('negative when expired', core.daysUntilExpiry('2025-01-01', 12, 0, '2026-06-01'), -151);
t('today purchase 12m = 365-ish', (d => d >= 364 && d <= 366)(core.daysUntilExpiry('2026-03-01', 12, 0, '2026-03-01')), true);
t('no warranty length', core.daysUntilExpiry('2026-03-01', 0, 0, '2026-03-01'), null);

console.log('statusFromDays');
t('active', core.statusFromDays(200), 'active');
t('upcoming 90', core.statusFromDays(90), 'upcoming');
t('soon 30', core.statusFromDays(30), 'soon');
t('soon boundary 31 -> upcoming', core.statusFromDays(31), 'upcoming');
t('expired', core.statusFromDays(-1), 'expired');
t('expired zero', core.statusFromDays(0), 'soon');
t('none', core.statusFromDays(null), 'none');

console.log('nextDueAfter');
t('monthly', core.toISODate(core.nextDueAfter('2026-05-31', 1)), '2026-06-30');
t('annual', core.toISODate(core.nextDueAfter('2025-08-20', 12)), '2026-08-20');
t('no interval', core.nextDueAfter('2026-05-31', 0), null);

console.log('forecastByMonth');
const ren = [
  { name: 'Car insurance', cost: 120, dueDate: '2026-11-05', intervalMonths: 1 },
  { name: 'Membership', cost: 60, dueDate: '2025-11-10', intervalMonths: 12 },
  { name: 'Furniture plan', cost: 25, dueDate: '2026-11-01' },
  { name: 'Anthem yearly', cost: 40, dueDate: '2025-12-01', intervalMonths: 12 },
  { name: 'Far future', cost: 500, dueDate: '2028-01-01', intervalMonths: 12 }
];
const fc = core.forecastByMonth(ren, '2026-10-27');
t('12 buckets', fc.length, 12);
t('first bucket is Oct 2026', fc[0].label, 'Oct 2026');
const nov = fc[1].total;
t('Nov total = 120+60+25', Math.abs(nov - 205) < 0.001, true);
t('recurring shows next month too', fc[2].items.join(',').indexOf('Car insurance') >= 0, true);
t('car insurance recurs repeatedly', fc[9].items.join(','), 'Car insurance ($120.00)');
t('past annual rolls forward to Nov 2026', fc[1].items.join(',').indexOf('Membership') >= 0, true);
t('past annual rolls forward to Dec 2026', fc[2].items.join(',').indexOf('Anthem yearly') >= 0, true);
t('far-future one-shot excluded', fc.find(b => b.label === 'Jan 2028'), undefined);
t('totalForecast positive', core.totalForecast(fc) > 0, true);
t('empty input', core.forecastByMonth([], '2026-10-27').reduce((s, b) => s + b.total, 0), 0);
t('bad dates ignored', core.forecastByMonth([{ name: 'x', cost: 5, dueDate: 'junk' }], '2026-10-27').reduce((s, b) => s + b.total, 0), 0);

console.log('msic');
t('fmtMoney', core.fmtMoney(12.5), '$12.50');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
