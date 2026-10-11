// Calculator state — no eval() used anywhere.
let expression = "";
let justEvaluated = false;
let errorState = false;

const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const copyToast = document.getElementById("copyToast");
const buttons = document.querySelectorAll(".btn");

function isOperator(ch) {
  return ch === "+" || ch === "-" || ch === "*" || ch === "/";
}

function getCurrentNumber() {
  if (expression === "") return "";
  let i = expression.length - 1;
  let num = "";
  while (i >= 0) {
    const ch = expression[i];
    if ((ch >= "0" && ch <= "9") || ch === ".") {
      num = ch + num;
      i--;
    } else if (ch === "-") {
      // Unary minus if at start or after another operator
      const prev = i > 0 ? expression[i - 1] : null;
      if (i === 0 || (prev !== null && isOperator(prev))) {
        num = ch + num;
      }
      break;
    } else {
      break;
    }
  }
  return num;
}

function stripFloat(n) {
  return parseFloat(n.toPrecision(12));
}

function formatResult(n) {
  if (!isFinite(n)) throw new Error("DIV_ZERO");
  const cleaned = stripFloat(n);
  return String(cleaned);
}

function prettyExpression(expr) {
  return expr.replace(/\*/g, "\u00D7").replace(/\//g, "\u00F7").replace(/-/g, "\u2212");
}

// ---------- Input handlers (switch-driven) ----------

function appendNumber(value) {
  if (errorState) clearAll();
  if (justEvaluated) {
    expression = "";
    justEvaluated = false;
  }
  const current = getCurrentNumber();
  // Prevent meaningless leading zeros: "0" + "0" stays "0"
  if (current === "0" && value === "0") return;
  if (current === "0" && value !== "0" && !current.includes(".")) {
    // Replace lone leading zero, e.g. "0" -> "5", "5+0" -> "5+5"
    expression = expression.slice(0, expression.length - 1) + value;
  } else if (current === "-0" && value !== ".") {
    expression = expression.slice(0, expression.length - 1) + value;
  } else {
    // Prevent runaway input length
    if (expression.length >= 30) return;
    expression += value;
  }
  updateDisplay();
}

function appendDecimal() {
  if (errorState) clearAll();
  if (justEvaluated) {
    expression = "0.";
    justEvaluated = false;
    updateDisplay();
    return;
  }
  const current = getCurrentNumber();
  if (current.includes(".")) return; // one decimal per number
  if (current === "" || current === "-") {
    expression += "0.";
  } else {
    expression += ".";
  }
  updateDisplay();
}

function appendOperator(op) {
  if (errorState) return;
  if (expression === "") {
    // Allow starting a negative number, ignore other leading operators
    if (op === "-") {
      expression = "-";
      updateDisplay();
    }
    return;
  }
  if (justEvaluated) justEvaluated = false;

  const last = expression.slice(-1);

  if (isOperator(last)) {
    // Allow "5 * -3": minus after * / + becomes a negative sign
    if (op === "-" && (last === "*" || last === "/" || last === "+")) {
      expression += op;
    } else {
      // Operator chaining without reset: replace the pending operator
      // Drop a trailing unary minus too, e.g. "5*-" + "+" -> "5+"
      if ((last === "+" || last === "-" || last === "*" || last === "/") &&
          expression.length >= 2 &&
          isOperator(expression[expression.length - 2]) &&
          (expression.endsWith("*-") || expression.endsWith("/-") || expression.endsWith("+-"))) {
        expression = expression.slice(0, -2) + op;
      } else {
        expression = expression.slice(0, -1) + op;
      }
    }
  } else if (last === ".") {
    expression += "0" + op; // "5." + "+" -> "5.0+"
  } else {
    expression += op;
  }
  updateDisplay();
}

function applyPercent() {
  if (errorState) return;
  if (justEvaluated) justEvaluated = false;
  const current = getCurrentNumber();
  if (current === "" || current === "-" || current === "." || current === "-.") return;
  const value = parseFloat(current);
  if (isNaN(value)) return;
  const percentValue = stripFloat(value / 100);
  expression = expression.slice(0, expression.length - current.length) + String(percentValue);
  updateDisplay();
}

function deleteLast() {
  if (errorState) {
    clearAll();
    return;
  }
  if (justEvaluated) justEvaluated = false;
  expression = expression.slice(0, -1);
  updateDisplay();
}

function clearAll() {
  expression = "";
  justEvaluated = false;
  errorState = false;
  updateDisplay();
}

function showError(message) {
  errorState = true;
  justEvaluated = false;
  resultEl.textContent = message;
  resultEl.classList.add("error");
}

// ---------- Custom expression evaluator (no eval) ----------

function evaluateExpression(expr) {
  // Tokenize into [number, operator, number, ...]
  const tokens = [];
  let numBuffer = "";

  function flushNumber() {
    if (numBuffer !== "" && numBuffer !== "-" && numBuffer !== ".") {
      const n = parseFloat(numBuffer);
      if (isNaN(n)) throw new Error("INVALID");
      tokens.push(n);
      numBuffer = "";
    } else if (numBuffer === "-" || numBuffer === "." || numBuffer === "-.") {
      throw new Error("INVALID");
    }
  }

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if ((ch >= "0" && ch <= "9") || ch === ".") {
      numBuffer += ch;
    } else if (isOperator(ch)) {
      if (ch === "-" && numBuffer === "" &&
          (tokens.length === 0 || typeof tokens[tokens.length - 1] === "string")) {
        numBuffer = "-"; // unary minus
      } else {
        flushNumber();
        tokens.push(ch);
      }
    } else {
      throw new Error("INVALID");
    }
  }
  flushNumber();

  if (tokens.length === 0) throw new Error("INVALID");
  if (tokens.length === 1) {
    if (typeof tokens[0] !== "number") throw new Error("INVALID");
    return stripFloat(tokens[0]);
  }
  // Must alternate number/operator and end with a number
  if (typeof tokens[tokens.length - 1] !== "number") throw new Error("INVALID");

  // Pass 1: * and / (left to right)
  const pass1 = [tokens[0]];
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i];
    const next = tokens[i + 1];
    if (typeof op !== "string" || typeof next !== "number") throw new Error("INVALID");
    if (op === "*" || op === "/") {
      const prev = pass1.pop();
      let computed;
      switch (op) {
        case "*":
          computed = prev * next;
          break;
        case "/":
          if (next === 0) throw new Error("DIV_ZERO");
          computed = prev / next;
          break;
      }
      pass1.push(computed);
    } else {
      pass1.push(op, next);
    }
  }

  // Pass 2: + and - (left to right)
  let result = pass1[0];
  for (let i = 1; i < pass1.length; i += 2) {
    const op = pass1[i];
    const next = pass1[i + 1];
    switch (op) {
      case "+":
        result += next;
        break;
      case "-":
        result -= next;
        break;
      default:
        throw new Error("INVALID");
    }
  }
  return stripFloat(result);
}

function handleEquals() {
  if (errorState) return;
  if (expression === "" || expression === "-") return;

  // Strip trailing operators / dangling decimal before evaluating
  let clean = expression;
  while (clean.length > 0 && (isOperator(clean.slice(-1)) || clean.slice(-1) === ".")) {
    // Keep a leading "-" (e.g. "-5") intact
    if (clean === "-") break;
    clean = clean.slice(0, -1);
  }
  if (clean === "" || clean === "-") return;

  try {
    const result = evaluateExpression(clean);
    const pretty = prettyExpression(clean);
    expressionEl.textContent = pretty;
    resultEl.textContent = formatResult(result);
    resultEl.classList.remove("error");
    expression = String(formatResult(result)); // keep result for chaining
    justEvaluated = true;
  } catch (err) {
    if (err && err.message === "DIV_ZERO") {
      showError("Error: Can't divide by 0");
    } else {
      showError("Error: Invalid expression");
    }
  }
}

function updateDisplay() {
  if (errorState) return;
  expressionEl.textContent = expression === "" ? "\u00A0" : prettyExpression(expression);
  // Result stays 0 while typing; only shows value after = is pressed.
  if (justEvaluated) {
    resultEl.textContent = expression === "" ? "0" : expression;
  } else {
    resultEl.textContent = "0";
  }
  resultEl.classList.remove("error");
}

// ---------- Event listeners (no inline onclick) ----------

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    const value = btn.dataset.value;
    switch (action) {
      case "number":
        appendNumber(value);
        break;
      case "decimal":
        appendDecimal();
        break;
      case "operator":
        appendOperator(value);
        break;
      case "percent":
        applyPercent();
        break;
      case "delete":
        deleteLast();
        break;
      case "clear":
        clearAll();
        break;
      case "equals":
        handleEquals();
        break;
      default:
        break;
    }
  });
});

document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (key >= "0" && key <= "9") {
    appendNumber(key);
  } else {
    switch (key) {
      case ".":
        appendDecimal();
        break;
      case "+":
      case "-":
      case "*":
      case "/":
        appendOperator(key);
        break;
      case "%":
        applyPercent();
        break;
      case "Enter":
      case "=":
        event.preventDefault();
        handleEquals();
        break;
      case "Backspace":
        deleteLast();
        break;
      case "Escape":
      case "Delete":
        clearAll();
        break;
      case "c":
      case "C":
        clearAll();
        break;
      default:
        break;
    }
  }
});

// Click result to copy (no inline onclick)
let copyTimer = null;

function showCopyToast(message) {
  if (!copyToast) return;
  copyToast.textContent = message;
  copyToast.classList.add("show");
  if (copyTimer) clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copyToast.classList.remove("show");
  }, 1200);
}

resultEl.addEventListener("click", async () => {
  if (errorState) return;
  const text = resultEl.textContent.trim();
  if (text === "" || text === "-") return;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    showCopyToast("Copied!");
  } catch (err) {
    showCopyToast("Copy failed");
  }
});

updateDisplay();
