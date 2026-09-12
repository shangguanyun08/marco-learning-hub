(function installReviewInputs(global) {
  'use strict';

  // Reviewed by question family, including all ten variants. Keep options when
  // they define the possible answers or require comparing statements/equations.
  const review1 = {
    2: ['prime', '', 'Use prime factors, with ^ for powers or × between factors.'],
    3: ['number'], 4: ['number', '', 'Enter a fraction, mixed number, or decimal.'],
    6: ['number', 'degrees'], 8: ['number'], 9: ['number', 'square feet'],
    10: ['ratio', '', 'Enter smaller volume : larger volume.'],
    11: ['number', 'times'], 12: ['number', 'trees'],
    13: ['number', '', 'Enter a fraction, mixed number, or decimal.'],
    15: ['number', 'feet'], 16: ['number', 'cm³'],
  };
  const review2 = {
    1: ['shape', '', 'Type the name of the shape.'],
    2: ['number'], 3: ['number'], 9: ['number'], 10: ['number'],
    15: ['number', 'workers'], 16: ['number'], 17: ['number', 'inches'],
    18: ['number'], 19: ['statistics', '', 'Name the statistic or statistics that change.'],
    21: ['number', 'goals'],
  };
  const units = {
    degrees: /\s*(?:°|degrees?|deg)$/i,
    'square feet': /\s*(?:square (?:feet|foot)|sq\.?\s*ft\.?|ft(?:²|\^?2))$/i,
    feet: /\s*(?:feet|foot|ft\.?)$/i,
    'cm³': /\s*(?:cm(?:³|\^?3)|cubic centim(?:eter|etre)s?)$/i,
    times: /\s*times?$/i,
    trees: /\s*(?:orange\s+)?trees?$/i,
    workers: /\s*workers?$/i,
    inches: /\s*(?:inches|inch|in\.?)$/i,
    goals: /\s*goals?$/i,
    slices: /\s*slices?$/i,
    cookies: /\s*cookies?$/i,
  };

  function spec(question) {
    const id = question.parentQuestionId || question.id;
    const match = /^(review1-q|review2-sessions-q)(\d+)$/.exec(id);
    if (!match) return null;
    const position = Number(match[2]);
    const config = (match[1] === 'review1-q' ? review1 : review2)[position];
    if (!config) return null;
    const [kind, unit = '', hint = 'Enter your answer.'] = config;
    return { kind, unit: match[1] === 'review1-q' && position === 8 ? (question.parentQuestionId ? 'cookies' : 'slices') : unit, hint };
  }

  function clean(value) {
    const fractions = { '½':'1/2', '⅓':'1/3', '⅔':'2/3', '¼':'1/4', '¾':'3/4', '⅛':'1/8', '⅜':'3/8', '⅝':'5/8', '⅞':'7/8' };
    return String(value).trim().replace(/[−–]/g, '-').replace(/[½⅓⅔¼¾⅛⅜⅝⅞]/g, value => ` ${fractions[value]}`).replace(/\s+/g, ' ').trim();
  }

  function number(value, unit = '') {
    let text = clean(value);
    if (unit) text = text.replace(units[unit], '').trim();
    if (text.includes(',')) {
      if (!/^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(text)) return null;
      text = text.replaceAll(',', '');
    }
    let result;
    const mixed = /^([+-]?\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(text);
    const fraction = /^([+-]?\d+)\s*\/\s*(\d+)$/.exec(text);
    if (mixed && Number(mixed[3]) > 0) result = (mixed[1].startsWith('-') ? -1 : 1) * (Math.abs(Number(mixed[1])) + Number(mixed[2]) / Number(mixed[3]));
    else if (fraction && Number(fraction[2]) > 0) result = Number(fraction[1]) / Number(fraction[2]);
    else if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) result = Number(text);
    return Number.isFinite(result) ? result : null;
  }

  function ratio(value) {
    const parts = clean(value).split(/\s*(?::|\/|\bto\b)\s*/i);
    if (parts.length !== 2) return null;
    const [left, right] = parts.map(part => number(part));
    return left > 0 && right > 0 ? left / right : null;
  }

  function primeProduct(value) {
    const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    const text = clean(value).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, run => '^' + [...run].map(c => superscripts.indexOf(c)).join('')).replaceAll('**', '^');
    const factors = text.split(/\s*(?:×|\*|x|·)\s*/i);
    let product = 1, count = 0;
    for (const factor of factors) {
      const match = /^(\d+)\s*(?:\^\s*(\d+))?$/.exec(factor.trim());
      if (!match) return null;
      const base = Number(match[1]), exponent = Number(match[2] || 1);
      if (base < 2 || base > 10000 || exponent < 1 || exponent > 32) return null;
      for (let divisor = 2; divisor * divisor <= base; divisor++) if (base % divisor === 0) return null;
      product *= base ** exponent;
      count += exponent;
    }
    return count > 1 && Number.isSafeInteger(product) ? product : null;
  }

  function check(question, value) {
    const input = spec(question);
    if (!input || typeof value !== 'string' || !value.trim() || value.length > 120) return { valid: false, correct: false };
    const expected = question.correctAnswer;
    let actual, target;
    if (input.kind === 'number') { actual = number(value, input.unit); target = number(expected, input.unit); }
    else if (input.kind === 'ratio') { actual = ratio(value); target = ratio(expected); }
    else if (input.kind === 'prime') { actual = primeProduct(value); target = primeProduct(expected); }
    else {
      const text = value.toLowerCase().trim().replace(/[.!]$/g, '').trim();
      const correct = input.kind === 'shape' ? /^(?:a |the )?squares?$/.test(text)
        : /^(?:(?:only )?(?:the )?(?:mean|average)(?: only| changes?)?|(?:the )?(?:mean|average) (?:is the only (?:one|statistic)(?: that changes)?))$/.test(text);
      return { valid: true, correct };
    }
    return { valid: actual !== null, correct: actual !== null && target !== null && Math.abs(actual - target) < 1e-9 };
  }

  global.MarcoReviewInputs = { spec, check };
})(window);
