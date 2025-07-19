document.getElementById("expression-form").addEventListener("submit", function(event) {
  event.preventDefault();

  const input = document.getElementById("expression").value.trim();
  const stepsDiv = document.getElementById("steps");

  try {
    const steps = [];
    const result = evaluateFractionExpression(input, steps);
    const simplified = simplifyFraction(result.num, result.den);

    // Mostra i passaggi
    stepsDiv.innerHTML = `
      <p><strong>Espressione:</strong> ${input}</p>
      ${steps.map(step => `<p>➡️ ${step}</p>`).join("")}
      <p>✅ Risultato semplificato: <strong>${simplified.num}/${simplified.den}</strong></p>
    `;
  } catch (error) {
    stepsDiv.innerHTML = `<p style='color:red;'>Errore: ${error.message}</p>`;
  }
});

function evaluateFractionExpression(expr, steps) {
  const tokens = expr.match(/(\d+\/\d+|[+-])/g);

  if (!tokens || tokens.length < 3) {
    throw new Error("Espressione non valida. Usa frazioni nel formato a/b + c/d");
  }

  let current = parseFraction(tokens[0]);

  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i];
    const next = parseFraction(tokens[i + 1]);

    const mcd = lcm(current.den, next.den);
    const n1 = current.num * (mcd / current.den);
    const n2 = next.num * (mcd / next.den);

    const stepText = `${current.num}/${current.den} ${op} ${next.num}/${next.den} → ` +
                     `${n1}/${mcd} ${op} ${n2}/${mcd}`;

    const newNum = (op === '+') ? (n1 + n2) : (n1 - n2);
    current = { num: newNum, den: mcd };

    steps.push(stepText);
    steps.push(`= ${newNum}/${mcd}`);
  }

  return current;
}

function parseFraction(str) {
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
