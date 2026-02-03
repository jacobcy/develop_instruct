const A = ["olive","marble","bronze","sun","storm","ember","salt","atlas","dawn","iron","myth"];
const B = ["lion","wolf","hawk","boar","eagle","titan","nymph","oracle","runner","guard","spartan"];
const C = ["spear","shield","helm","blade","torch","banner","raid","quest","gate","ring","arena"];

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export function generateCode() {
  return `${pick(A)}-${pick(B)}-${pick(C)}`.toLowerCase();
}
