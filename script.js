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
  return expr.match(/\d+\/\d+|[()+-]/g);
}

function evaluate(tokens, steps = []) {
  const output = [];
  const operators = [];

  const applyOp = () => {
    const b = output.pop();
    const a = output.pop();
    const op = operators.pop();

    const mcd = lcm(a.den, b.den);
    const n1 = a.num * (mcd / a.den);
    const n2 = b.num * (mcd / b.den);
    const newNum = (op === '+') ? n1 + n2 : n1 - n2;
    const current = { num: newNum, den: mcd };

    steps.push(`${a.num}/${a.den} ${op} ${b.num}/${b.den} → ${n1}/${mcd} ${op} ${n2}/${mcd} = ${newNum}/${mcd}`);
    output.push(current);
  };

  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];

    if (token === "(") {
      // Trova sotto-espressione e valuta ricorsivamente
      let depth = 1;
      let j = i + 1;
      const subExpr = [];
      while (j < tokens.length && depth > 0) {
        if (tokens[j] === "(") depth++;
        else if (tokens[j] === ")") depth--;
        if (depth > 0) subExpr.push(tokens[j]);
        j++;
      }
      const [subResult, _] = evaluate(subExpr, steps);
      output.push(subResult);
      i = j;
    } else if (token === "+" || token === "-") {
      operators.push(token);
      i++;
    } else {
      output.push(parseFraction(token));
      i++;
    }

    // Applica l'operatore appena hai due operandi
    while (output.length >= 2 && operators.length >= 1) {
      applyOp();
    }
  }

  if (output.length !== 1) throw new Error("Espressione malformata");
  return [output[0], steps];
}

function parseFraction(str) {
  if (typeof str === "object") return str;
  const parts = str.split('/');
  if (parts.length !== 2) throw new Error("Frazione malformata: " + str);
  return { num: parseInt(parts[0]), den: parseInt(parts[1]) };
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
