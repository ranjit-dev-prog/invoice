const fs = require('fs');
const path = 'C:/Users/ATRN213/Desktop/invoice/src/App.jsx';
let text = fs.readFileSync(path, 'utf8');
const start = 'function Field({ label, value, onChange, textarea, type = "text" }) {\n';
const next = 'function Field({ label, value, onChange, textarea, type = "text" }) {\n  return (';
const i1 = text.indexOf(start);
const i2 = text.indexOf(next, i1 + start.length);
if (i1 === -1 || i2 === -1) {
  throw new Error(`markers not found: i1=${i1}, i2=${i2}`);
}
text = text.slice(0, i1) + next + text.slice(i2);
fs.writeFileSync(path, text, 'utf8');
console.log('patched App.jsx');
