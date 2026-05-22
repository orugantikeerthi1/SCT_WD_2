'use strict';

// ── DOM ──────────────────────────────────────────
const valEl  = document.getElementById('val');
const exprEl = document.getElementById('expr');

// ── Calculator State ─────────────────────────────
let displayValue  = '0';
let firstOperand  = null;
let operator      = null;
let waitingForSecond = false;

// ── Update Screen ────────────────────────────────
function updateDisplay() {
  valEl.textContent = displayValue;

  valEl.className = 'display-val';
  const len = displayValue.length;

  if (len > 14) valEl.classList.add('sm');
  else if (len > 9) valEl.classList.add('med');
}

// ── Input a digit or decimal point ───────────────
function inputDigit(d) {
  if (waitingForSecond) {
    displayValue = d === '.' ? '0.' : d;
    waitingForSecond = false;
  } else {
    if (d === '.') {
      if (displayValue.includes('.')) return;
      displayValue += '.';
    } else {
      if (displayValue === '0') {
        displayValue = d;
      } else {
        if (displayValue.replace('-','').replace('.','').length >= 12) return;
        displayValue += d;
      }
    }
  }

  updateDisplay();
}

// ── Handle operator ──────────────────────────────
function handleOperator(op) {
  const current = parseFloat(displayValue);

  if (operator && !waitingForSecond) {
    const result = calculate(firstOperand, current, operator);

    if (result === null) {
      showError('Cannot ÷ by 0');
      return;
    }

    displayValue = niceNum(result);
    firstOperand = result;

  } else {
    firstOperand = current;
  }

  operator = op;
  waitingForSecond = true;

  const sym = {'+':'+', '-':'−', '*':'×', '/':'÷'}[op];

  exprEl.textContent = niceNum(firstOperand) + ' ' + sym;

  document.querySelectorAll('.btn.op').forEach(b => b.classList.remove('active'));

  document.querySelectorAll('.btn.op').forEach(b => {
    if (b.textContent.trim() === sym) {
      b.classList.add('active');
    }
  });

  updateDisplay();
}

// ── Press = ──────────────────────────────────────
function pressEquals() {
  if (operator === null || firstOperand === null) return;

  const second = parseFloat(displayValue);

  const sym = {'+':'+', '-':'−', '*':'×', '/':'÷'}[operator];

  exprEl.textContent =
    niceNum(firstOperand) + ' ' + sym + ' ' + niceNum(second) + ' =';

  const result = calculate(firstOperand, second, operator);

  if (result === null) {
    showError('Cannot ÷ by 0');
    return;
  }

  displayValue = niceNum(result);
  firstOperand = null;
  operator = null;
  waitingForSecond = false;

  document.querySelectorAll('.btn.op').forEach(b => b.classList.remove('active'));

  updateDisplay();
}

// ── Arithmetic ───────────────────────────────────
function calculate(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? null : a / b;
  }
}

// ── Format number ────────────────────────────────
function niceNum(n) {
  if (!isFinite(n)) return 'Error';

  const rounded = parseFloat(n.toPrecision(10));
  const s = String(rounded);

  if (s.length > 15) return rounded.toExponential(6);

  return s;
}

// ── Clear ────────────────────────────────────────
function clearAll() {
  displayValue = '0';
  firstOperand = null;
  operator = null;
  waitingForSecond = false;

  exprEl.textContent = '';

  valEl.className = 'display-val';

  document.querySelectorAll('.btn.op').forEach(b => b.classList.remove('active'));

  updateDisplay();
}

// ── Toggle sign ──────────────────────────────────
function toggleSign() {
  if (displayValue === '0' || displayValue === 'Error') return;

  displayValue = displayValue.startsWith('-')
    ? displayValue.slice(1)
    : '-' + displayValue;

  updateDisplay();
}

// ── Percent ──────────────────────────────────────
function percent() {
  const n = parseFloat(displayValue);

  if (isNaN(n)) return;

  displayValue = niceNum(n / 100);

  updateDisplay();
}

// ── Error ────────────────────────────────────────
function showError(msg) {
  valEl.className = 'display-val err';

  valEl.textContent = msg;

  exprEl.textContent = '';

  displayValue = '0';
  firstOperand = null;
  operator = null;
  waitingForSecond = false;
}

// ── Backspace ────────────────────────────────────
function backspace() {
  if (waitingForSecond) return;

  if (displayValue.length <= 1 || displayValue === '-0') {
    displayValue = '0';
  } else {
    displayValue = displayValue.slice(0, -1);

    if (displayValue === '-') {
      displayValue = '0';
    }
  }

  updateDisplay();
}

// ── Ripple effect ────────────────────────────────
function ripple(btn, e) {
  const sp = document.createElement('span');

  sp.className = 'ripple';

  const r = btn.getBoundingClientRect();

  const sz = Math.max(r.width, r.height);

  // FIXED LINE
  sp.style.cssText = `
    width:${sz}px;
    height:${sz}px;
    left:${e.clientX - r.left - sz/2}px;
    top:${e.clientY - r.top - sz/2}px;
  `;

  btn.appendChild(sp);

  sp.addEventListener('animationend', () => sp.remove());
}

// ── Button Events ────────────────────────────────
document.getElementById('btn-ac').addEventListener('click', e => {
  ripple(e.currentTarget, e);
  clearAll();
});

document.getElementById('btn-sign').addEventListener('click', e => {
  ripple(e.currentTarget, e);
  toggleSign();
});

document.getElementById('btn-pct').addEventListener('click', e => {
  ripple(e.currentTarget, e);
  percent();
});

document.getElementById('btn-eq').addEventListener('click', e => {
  ripple(e.currentTarget, e);
  pressEquals();
});

document.querySelectorAll('.btn.num').forEach(btn => {
  btn.addEventListener('click', e => {
    ripple(btn, e);
    inputDigit(btn.dataset.num);
  });
});

document.querySelectorAll('.btn.op').forEach(btn => {
  btn.addEventListener('click', e => {
    ripple(btn, e);
    handleOperator(btn.dataset.op);
  });
});

// ── Keyboard Support ─────────────────────────────
document.addEventListener('keydown', e => {

  if (e.key >= '0' && e.key <= '9') {
    inputDigit(e.key);
    return;
  }

  if (e.key === '.') {
    inputDigit('.');
    return;
  }

  if (e.key === '+') {
    handleOperator('+');
    return;
  }

  if (e.key === '-') {
    handleOperator('-');
    return;
  }

  // FIXED LINE
  if (e.key === '*') {
    handleOperator('*');
    return;
  }

  if (e.key === '/') {
    e.preventDefault();
    handleOperator('/');
    return;
  }

  if (e.key === 'Enter' || e.key === '=') {
    pressEquals();
    return;
  }

  if (e.key === 'Escape') {
    clearAll();
    return;
  }

  if (e.key === 'Backspace') {
    backspace();
    return;
  }

  if (e.key === '%') {
    percent();
    return;
  }
});

// ── Keyboard Hint ────────────────────────────────
const kbdDiv = document.createElement('div');

kbdDiv.className = 'kbd';

kbdDiv.textContent = '⌨️ keyboard · ESC = clear · ⌫ = delete';

document.querySelector('.calculator').appendChild(kbdDiv);

// ── Init ─────────────────────────────────────────
updateDisplay();