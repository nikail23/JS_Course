var field = new Array(9);

function ai() {
  var id = Math.floor(Math.random() * 9);
  field[id] ? ai() : move(id, 'ai');
}

function checkEnd() {
  if (field[0]=='ai' && field[1]=='ai' && field[2]=='ai' || field[0]=='player' && field[1]=='player' && field[2]=='player')  return true;
  if (field[3]=='ai' && field[4]=='ai' && field[5]=='ai' || field[3]=='player' && field[4]=='player' && field[5]=='player')  return true;
  if (field[6]=='ai' && field[7]=='ai' && field[8]=='ai' || field[6]=='player' && field[7]=='player' && field[8]=='player')  return true;
  if (field[0]=='ai' && field[3]=='ai' && field[6]=='ai' || field[0]=='player' && field[3]=='player' && field[6]=='player')  return true;
  if (field[1]=='ai' && field[4]=='ai' && field[7]=='ai' || field[1]=='player' && field[4]=='player' && field[7]=='player')  return true;
  if (field[2]=='ai' && field[5]=='ai' && field[8]=='ai' || field[2]=='player' && field[5]=='player' && field[8]=='player')  return true;
  if (field[0]=='ai' && field[4]=='ai' && field[8]=='ai' || field[0]=='player' && field[4]=='player' && field[8]=='player')  return true;
  if (field[2]=='ai' && field[4]=='ai' && field[6]=='ai' || field[2]=='player' && field[4]=='player' && field[6]=='player')  return true;
  if(field[0] && field[1] && field[2] && field[3] && field[4] && field[5] && field[6] && field[7] && field[8]) return true;
}

function move(id, role) {
  if(field[id]) return false;
  field[id] = role;
  document.getElementById(id).className = 'cell ' + role;
  !checkEnd() ? (role == 'player') ? ai() : null : reset()
}

function reset() {
  alert("Игра окончена!");
  location.reload();
}