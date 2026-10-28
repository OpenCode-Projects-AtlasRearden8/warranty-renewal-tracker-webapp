/*
 * warranty-core.js — pure, dependency-free date & money math for the
 * Warranty & Renewal Tracker. Loaded by both index.html (the app) and
 * tests/run-tests.js (the test runner), so the logic lives in one place.
 */
(function (root) {
  'use strict';

  function parseDate(str) {
    if (typeof str !== 'string') return null;
    // Accept "YYYY-MM-DD" (preferred) or "MM/DD/YYYY".
    function validYMD(y, mo, da) {
      if (mo < 1 || mo > 12) return null;
      const daysInMonth = new Date(y, mo, 0).getDate();
      if (da < 1 || da > daysInMonth) return null;
      return new Date(y, mo - 1, da);
    }
    let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str.trim());
    if (m) return validYMD(Number(m[1]), Number(m[2]), Number(m[3]));
    m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(str.trim());
    if (m) return validYMD(Number(m[3]), Number(m[1]), Number(m[2]));
    return null;
  }

  function pad2(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function toISODate(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  /* Add months with end-of-month clamping: Jan 31 + 1 month = Feb 28. */
  function addMonths(date, months) {
    const d = new Date(date.getTime());
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + months);
    const daysInTarget = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, daysInTarget));
    return d;
  }

  function daysBetween(a, b) {
    const msA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const msB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((msB - msA) / 86400000);
  }

  function expiryDate(purchaseISO, months, days) {
    const start = parseDate(purchaseISO);
    if (!start) return null;
    let exp = start;
    const m = Number(months) || 0;
    const d = Number(days) || 0;
    if (m > 0) exp = addMonths(exp, m);
    else if (d > 0) exp = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate() + d);
    else return null; // no warranty length = no expiry
    return exp;
  }

  function daysUntilExpiry(purchaseISO, months, days, today) {
    const exp = expiryDate(purchaseISO, months, days);
    if (!exp) return null;
    const ref = today ? parseDate(today) : new Date();
    if (!ref) return null;
    return daysBetween(ref, exp);
  }

  /* Status bucket for an item given days left. */
  function statusFromDays(days) {
    if (days === null || typeof days === 'undefined' || isNaN(days)) return 'none';
    if (days < 0) return 'expired';
    if (days <= 30) return 'soon';
    if (days <= 90) return 'upcoming';
    return 'active';
  }

  const MONTH_LABELS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  /* Renewal-type items: only cost + next-due date + optional interval (months). */
  function nextDueAfter(dueISO, intervalMonths) {
    const due = parseDate(dueISO);
    if (!due) return null;
    const m = Number(intervalMonths) || 0;
    if (m <= 0) return null;
    return addMonths(due, m);
  }

  /* Big-expense forecast: next 12 months, key = "YYYY-MM", sum of renewal
   * costs due in that month plus warrantied purchases whose coverage lapse
   * month matches (lapse itself costs nothing, so warranty items only
   * surface as rows you may want to renew — counted only if renewCost set). */
  function forecastByMonth(renewals, today) {
    const ref = today ? parseDate(today) : new Date();
    if (!ref) return [];
    const out = [];
    for (let i = 0; i < 12; i++) {
      const d = addMonths(new Date(ref.getFullYear(), ref.getMonth(), 1), i);
      const key = d.getFullYear() + '-' + pad2(d.getMonth() + 1);
      out.push({
        key: key,
        label: MONTH_LABELS[d.getMonth()] + ' ' + d.getFullYear(),
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        total: 0,
        items: []
      });
    }
    (renewals || []).forEach(function (r) {
      let due = parseDate(r.dueDate);
      if (!due || !r.cost) return;
      // Roll past-due recurring renewals forward so they still show up here.
      while (Number(r.intervalMonths) > 0 && due < new Date(ref.getFullYear(), ref.getMonth(), 1)) {
        due = addMonths(due, Number(r.intervalMonths));
      }
      for (let guard = 0; guard < 240; guard++) {
        const key = due.getFullYear() + '-' + pad2(due.getMonth() + 1);
        const bucket = out.find(function (b) { return b.key === key; });
        if (bucket) {
          bucket.total += Number(r.cost) || 0;
          bucket.items.push(r.name + ' ($' + (Number(r.cost).toFixed(2)) + ')');
          if (!r.intervalMonths) break; // one-time: shown once
        } else if (!r.intervalMonths) {
          break; // one-time due outside window
        } else if (key > out[out.length - 1].key) {
          break; // past the forecast window
        }
        due = addMonths(due, Number(r.intervalMonths));
      }
    });
    return out;
  }

  function totalForecast(forecast) {
    return (forecast || []).reduce(function (sum, b) { return sum + b.total; }, 0);
  }

  function fmtMoney(n) {
    return '$' + (Number(n) || 0).toFixed(2);
  }

  const api = {
    parseDate: parseDate,
    toISODate: toISODate,
    addMonths: addMonths,
    daysBetween: daysBetween,
    expiryDate: expiryDate,
    daysUntilExpiry: daysUntilExpiry,
    statusFromDays: statusFromDays,
    nextDueAfter: nextDueAfter,
    forecastByMonth: forecastByMonth,
    totalForecast: totalForecast,
    fmtMoney: fmtMoney,
    MONTH_LABELS: MONTH_LABELS
  };

  if (typeof window !== 'undefined') {
    root.WarrantyCore = api;
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.WarrantyCore = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
