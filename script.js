document.getElementById("expression-form").addEventListener("submit", function(event) {
  event.preventDefault();

  const input = document.getElementById("expression").value.trim();
  const stepsDiv = document.getElementById("steps");

  try {
    const tokens = tokenize(input);
    const [result, steps] = evaluate(tokens);
    const simplified = simplifyFraction(result.num, result.den);

    stepsDiv.innerHTML = `
      <p><strong>Espressione:</strong> ${input}</p>
      ${steps.map(step => `<p>➡️ ${step}</p>`).join("")}
      <p>✅ Risultato semplificato: <strong>${simplified.num}/${simplified.den}</strong></p>
    `;
  } catch (error) {
    stepsDiv.innerHTML = `<p style='color:red;'>Errore: ${error.message}</p>`;
  }
});

function tokenize(expr) {
  return expr.match(/\d+\/\d+|\d+|[()+\-*/:]/g);
}

function evaluate(tokens, steps = []) {
  const output = [];
  const operators = [];

  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, ':': 2 };

  const applyOp = () => {
    const b = output.pop();
    const a = output.pop();
    const op = operators.pop();

    let result, stepText;

    if (op === '+' || op === '-') {
      const mcd = lcm(a.den, b.den);
      const n1 = a.num * (mcd / a.den);
      const n2 = b.num * (mcd / b.den);
      const newNum = (op === '+') ? n1 + n2 : n1 - n2;
      result = { num: newNum, den: mcd };
      stepText = `${a.num}/${a.den} ${op} ${b.num}/${b.den} → ${n1}/${mcd} ${op} ${n2}/${mcd} = ${newNum}/${mcd}`;
    } else if (op === '*') {
      result = { num: a.num * b.num, den: a.den * b.den };
      stepText = `${a.num}/${a.den} × ${b.num}/${b.den} = ${result.num}/${result.den}`;
    } else if (op === '/' || op === ':') {
      if (b.num === 0) throw new Error("Divisione per zero");
      result = { num: a.num * b.den, den: a.den * b.num };
      stepText = `${a.num}/${a.den} ÷ ${b.num}/${b.den} = ${result.num}/${result.den}`;
    }

    steps.push(stepText);
    output.push(result);
  };

  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];

    if (token === "(") {
      let depth = 1;
      let j = i + 1;
      const subExpr = [];
      while (j < tokens.length && depth > 0) {
        if (tokens[j] === "(") depth++;
        else if (tokens[j] === ")") depth--;
        if (depth > 0) subExpr.push(tokens[j]);
        j++;
      }
      const subEvaluation = evaluate(subExpr, steps);
      const subResult = subEvaluation[0];
      output.push(subResult);
      i = j;
    } else if ("+-*/:".includes(token)) {
      while (
        operators.length &&
        precedence[operators[operators.length - 1]] >= precedence[token]
      ) {
        applyOp();
      }
      operators.push(token);
      i++;
    } else {
      output.push(parseFraction(token));
      i++;
    }
  }

  while (operators.length > 0) {
    applyOp();
  }

  if (output.length !== 1) throw new Error("Espressione malformata");
  return [output[0], steps];
}

function parseFraction(str) {
  if (typeof str === "object") return str;

  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length !== 2) throw new Error("Frazione malformata: " + str);
    return { num: parseInt(parts[0]), den: parseInt(parts[1]) };
  } else {
    return { num: parseInt(str), den: 1 };
  }
}

function simplifyFraction(n, d) {
  const g = gcd(n, d);
  return { num: n / g, den: d / g };
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}
