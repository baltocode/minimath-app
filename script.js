document.getElementById("expression-form").addEventListener("submit", function(event) {
  event.preventDefault();

  const input = document.getElementById("expression").value.trim();
  const stepsDiv = document.getElementById("steps");

  try {
    const tokens = tokenize(input);
    const steps = [];
    const result = evaluateTokens(tokens, steps);
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

// Tokenizza: "1/2 + (1/3 - 1/6)" → ["1/2", "+", "(", "1/3", "-", "1/6", ")"]
function tokenize(expr) {
  return expr.match(/\d+\/\d+|[()+-]/g);
}

// Valuta un array di token, supportando parentesi
function evaluateTokens(tokens, steps) {
  const output = [];
  const stack = [];

  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];

    if (token === "(") {
      // Trova la chiusura e valuta ricorsivamente
      const subExpr = [];
      let depth = 1;
      i++;
      while (i < tokens.length && depth > 0) {
        if (tokens[i] === "(") depth++;
        else if (tokens[i] === ")") depth--;
        if (depth > 0) subExpr.push(tokens[i]);
        i++;
      }
      output.push(evaluateTokens(subExpr, steps));
    } else if (token === "+" || token === "-") {
      stack.push(token);
      i++;
    } else {
      // È una frazione
      output.push(parseFraction(token));
      i++;
    }

    // Se ci sono almeno 3 elementi, risolvi l’operazione corrente
    while (output.length >= 3 && typeof stack[stack.length - 1] === "string") {
      const b = output.pop();
      const a = output.pop();
      const op = stack.pop();

      const mcd = lcm(a.den, b.den);
      const n1 = a.num * (mcd / a.den);
      const n2 = b.num * (mcd / b.den);
      const newNum = (op === '+') ? n1 + n2 : n1 - n2;
      const current = { num: newNum, den: mcd };

      steps.push(`${a.num}/${a.den} ${op} ${b.num}/${b.den} → ${n1}/${mcd} ${op} ${n2}/${mcd} = ${newNum}/${mcd}`);
      output.push(current);
    }
  }

  if (output.length !== 1) throw new Error("Espressione malformata");
  return output[0];
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
