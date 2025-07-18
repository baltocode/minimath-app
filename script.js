document.getElementById("expression-form").addEventListener("submit", function(event) {
  event.preventDefault();

  const input = document.getElementById("expression").value;
  const stepsDiv = document.getElementById("steps");

  // Regex per catturare: frazione1, operatore, frazione2
  const match = input.match(/^\s*(\d+)\/(\d+)\s*([+-])\s*(\d+)\/(\d+)\s*$/);

  if (!match) {
    stepsDiv.innerHTML = "<p style='color:red;'>Espressione non riconosciuta. Usa il formato: a/b + c/d</p>";
    return;
  }

  // Estrai numeri
  const a = parseInt(match[1]); // numeratore 1
  const b = parseInt(match[2]); // denominatore 1
  const op = match[3];          // operatore: + o -
  const c = parseInt(match[4]); // numeratore 2
  const d = parseInt(match[5]); // denominatore 2

  // Calcola m.c.d. (minimo comune denominatore)
  const mcd = lcm(b, d);

  const a1 = a * (mcd / b);
  const c1 = c * (mcd / d);

  const resultNumerator = (op === '+') ? a1 + c1 : a1 - c1;
  const resultDenominator = mcd;

  const simplified = simplifyFraction(resultNumerator, resultDenominator);

  // Mostra i passaggi
  stepsDiv.innerHTML = `
    <p><strong>Espressione:</strong> ${a}/${b} ${op} ${c}/${d}</p>
    <p>➡️ Passaggio 1: minimo comune denominatore = ${mcd}</p>
    <p>➡️ Passaggio 2: riscrivo le frazioni:<br>
       ${a}/${b} → ${a1}/${mcd}<br>
       ${c}/${d} → ${c1}/${mcd}</p>
    <p>➡️ Passaggio 3: somma i numeratori:<br>
       ${a1} ${op} ${c1} = ${resultNumerator}</p>
    <p>➡️ Risultato: ${resultNumerator}/${resultDenominator}</p>
    <p>✅ Risultato semplificato: <strong>${simplified.num}/${simplified.den}</strong></p>
  `;
});

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyFraction(n, d) {
  const g = gcd(n, d);
  return {
    num: n / g,
    den: d / g
  };
}
