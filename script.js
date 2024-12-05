// Spielfeld- und Spielerinitialisierung
const board = document.getElementById("board");
const rollDiceButton = document.getElementById("rollDice");
const buildHouseButton = document.getElementById("buildHouse");
const diceResult = document.getElementById("diceResult");
const playerInfo = document.getElementById("playerInfo");
const playerToken = document.getElementById("player");


const totalFields = 40; // Anzahl der Spielfelder
const players = [
  { id: 1, money: 1500, position: 0, properties: [] },
  { id: 2, money: 1500, position: 0, properties: [] },
];
let currentPlayerIndex = 0; // Startspieler

const fields = Array.from({ length: totalFields }, (_, i) => ({
  owner: null,
  houses: 0,
  basePrice: 25,
}));

// Ereigniskarten
const eventCards = [
  { text: "Gehe 3 Felder zurück", action: (player) => movePlayer(-3) },
  { text: "Erhalte 200$", action: (player) => (player.money += 200) },
  { text: "Zahle 100$", action: (player) => (player.money -= 100) },
  {text: "Gehe direkt ins Gefängnis",action: (player) => (player.position = 10),
  },
];


// Würfeln-Funktion
function rollDice() {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const totalRoll = dice1 + dice2;

  const diceResult = document.getElementById("diceResult");
  diceResult.textContent = `Würfel 1: ${dice1}, Würfel 2: ${dice2}, Gesamt: ${totalRoll}`;

  // // Beispiel: Weitere Bearbeitungen des diceResult-Elements
  diceResult.style.fontSize = "24px"; // Schriftgröße auf 24px setzen
  diceResult.style.color = "blue"; // Textfarbe auf blau setzen
  diceResult.style.fontWeight = "bold"; // Text fett darstellen
  diceResult.style.backgroundColor = "lightgreen"; // Hintergrundfarbe auf hellgrün setzen
  diceResult.style.padding = "10px"; // Innenabstand auf 10px setzen
  diceResult.style.border = "2px solid black"; // Rahmen hinzufügen
  diceResult.style.borderRadius = "10px"; // Abgerundete Ecken
  movePlayer(totalRoll);
  animateDice(dice1, dice2);
}
function animateDice(dice1, dice2) {
  const dice1Element = document.getElementById('dice1');
  const dice2Element = document.getElementById('dice2');

  dice1Element.style.setProperty('--dice-offset', '-50px');
  dice2Element.style.setProperty('--dice-offset', '50px');

  dice1Element.style.animation = 'throwDice 1s forwards';
  dice2Element.style.animation = 'throwDice 1s forwards';

  setTimeout(() => {
      dice1Element.style.animation = '';
      dice2Element.style.animation = '';
  }, 1000);
}

// Funktion zum Kaufen eines Feldes
function buyProperty(player) {
  const currentField = fields[player.position];
  if (isPurchasable(player.position) && currentField.owner === null) {
    if (player.money >= currentField.basePrice) {
      player.money -= currentField.basePrice;
      currentField.owner = player.id;
      alert(`Feld gekauft!`);
    } else {
      alert("Nicht genug Geld!");
    }
  } else {
    alert("Feld nicht kaufbar!");
  }
}

// Funktion zum Aktualisieren der Spielerposition
function updatePlayerPosition(player) {
  const allCells = document.querySelectorAll('.cell');
  const currentCell = allCells[player.position];
  const token = document.getElementById(`player${player.id}`);

  if (currentCell) {
    const rect = currentCell.getBoundingClientRect();
    token.style.top = `${rect.top + window.scrollY + 5}px`;
    token.style.left = `${rect.left + window.scrollX + 5}px`;
  }
}

function movePlayer(steps) {
  const player = players[currentPlayerIndex];
  player.position = (player.position + steps + totalFields) % totalFields; // Neue Position berechnen
  const field = fields[player.position]; // Aktuelles Feld

  // Überprüfen, ob der Spieler auf Zelle 31 landet
  if (player.position === 30) { // Zelle 31 hat den Index 30 (0-basiert)
    alert("Du bist auf Zelle 31 gelandet und ziehst auf Zelle 11!");
    player.position = 10; // Zelle 11 hat den Index 10 (0-basiert)
  }

  // Überprüfen, ob der Spieler ins Gefängnis muss
  if (player.position === 30) { // Beispiel: Zelle 31 schickt den Spieler ins Gefängnis
    handleJail(player);
    return; // Beende die Funktion, da der Spieler ins Gefängnis geht
  }

  // Spielfigur bewegen
  moveTokenToField(player.position);

  // Ereignisfeld-Logik
  if ((player.position + 1) % 10 === 3) {
    const card = eventCards[Math.floor(Math.random() * eventCards.length)];
    alert(`Ereignisfeld: ${card.text}`);
    card.action(player);
  }

  // Feldaktionen
  if (!field.owner) {
    // Feld kaufen, wenn noch frei
    if (player.money >= field.basePrice) {
      if (confirm(`Feld kaufen für ${field.basePrice}$?`)) {
        player.money -= field.basePrice;
        field.owner = player.id;
        player.properties.push(player.position);
        updateField(player.position, `Besitzer: Spieler ${player.id}`);
      }
    }
  } else if (field.owner !== player.id) {
    // Miete zahlen, wenn Feld einem anderen Spieler gehört
    const rent = field.basePrice + field.houses * 25;
    alert(`Miete zahlen: ${rent}$`);
    player.money -= rent;
    players[field.owner - 1].money += rent;
  }

  // Nächster Spieler
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  updatePlayerInfo();
}

// Spielfigur bewegen
function moveTokenToField(fieldIndex) {
  const cell = board.children[fieldIndex];
  const rect = cell.getBoundingClientRect();
  playerToken.style.top = `${rect.top + window.scrollY}px`;
  playerToken.style.left = `${rect.left + window.scrollX}px`;
}

// Hausbau-Funktion
function buildHouse() {
  const player = players[currentPlayerIndex];
  const field = fields[player.position];
  if (field.owner === player.id && field.houses < 4) {
    const housePrice = 50; // Beispiel: Hausbau kostet 50$
    if (player.money >= housePrice) {
      player.money -= housePrice;
      field.houses += 1;
      updateField(player.position, `Häuser: ${field.houses}`);
      updatePlayerInfo();
    } else {
      alert("Nicht genug Geld für ein Haus!");
    }
  } else {
    alert("Du kannst hier kein Haus bauen!");
  }
}

// Funktion zum Erstellen eines farbigen Punktes
function createPlayerDot(playerId) {
  const dot = document.createElement("div");
  dot.classList.add("player-dot");
  dot.style.backgroundColor = playerId === 1 ? "purple" : "orange"; // Beispiel: Spieler 1 = purple, Spieler 2 = orange
  return dot;
}

// Spielfeld aktualisieren
function updateField(position, text) {
  const field = document.querySelector(`.cell:nth-child(${position + 1})`);
  const dot = createPlayerDot(players[currentPlayerIndex].id);
  field.appendChild(dot);
}

// Funktion zum Anwenden von Stilen auf das Spielerinfo-Element
function applyPlayerInfoStyles(element) {
  element.style.fontSize = "20px"; // Beispiel: Schriftgröße auf 20px setzen
  element.style.background = "linear-gradient(to right, purple, orange)";
  element.style.border = "2px solid black";
  element.style.borderRadius = "8px";
  element.style.boxShadow = "3px 3px 5px rgba(0, 0, 0, 0.5)"; // Beispiel: Box-Shadow hinzufügen
  element.style.fontWeight = "bold"; // Beispiel: Text fett darstellen
  element.style.margin = "10px 0"; // Beispiel: Abstand nach oben und unten
}

// Spielerinformationen anzeigen
function updatePlayerInfo() {
  playerInfo.textContent = players
    .map((p) => `Spieler ${p.id}: ${p.money}$`)
    .join(" | ");
  applyPlayerInfoStyles(playerInfo);
}
// Spieler wechseln
function switchPlayer() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
}

// Event Listener
document.getElementById('rollDice').addEventListener('click', rollDice);
document.getElementById('buildHouse').addEventListener('click', buildHouse);


// Spielerinfo initialisieren
updatePlayerInfo();
