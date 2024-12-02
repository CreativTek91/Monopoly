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
  { text: "Gehe direkt ins Gefängnis", action: (player) => (player.position = 10) },
];

// Würfeln-Funktion
function rollDice() {
  const roll = Math.floor(Math.random() * 6) + 1;
  diceResult.textContent = `Würfel: ${roll}`;
  movePlayer(roll);
}

// Spieler bewegen
function movePlayer(steps) {
  const player = players[currentPlayerIndex];
  player.position = (player.position + steps + totalFields) % totalFields; // Neue Position berechnen
  const field = fields[player.position]; // Aktuelles Feld

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

  updatePlayerInfo(); // Spielerinformationen aktualisieren
  switchPlayer(); // Spieler wechseln
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
  const dot = document.createElement('div');
  dot.classList.add('player-dot');
  dot.style.backgroundColor = playerId === 1 ? 'red' : 'blue'; // Beispiel: Spieler 1 = rot, Spieler 2 = blau
  return dot;
}

// Spielfeld aktualisieren
function updateField(position, text) {
  const field = document.querySelector(`.cell:nth-child(${position + 1})`);
  const dot = createPlayerDot(players[currentPlayerIndex].id);
  field.appendChild(dot);
}

// Spielerinformationen anzeigen
function updatePlayerInfo() {
  playerInfo.textContent = players
    .map((p) => `Spieler ${p.id}: ${p.money}$`)
    .join(" | ");
    playerInfo.style.fontSize = '20px'; // Beispiel: Schriftgröße auf 20px setzen
    playerInfo.style.background = 'linear-gradient(to right, purple, orange)'; 
    playerInfo.style.border = '2px solid black';
    playerInfo.style.borderRadius = '8px'
    playerInfo.style.boxShadow = '3px 3px 5px rgba(0, 0, 0, 0.5)'; // Beispiel: Box-Shadow hinzufügen
    playerInfo.style.fontWeight = 'bold'; // Beispiel: Text fett darstellen
    playerInfo.style.margin = '10px 0'; // Beispiel: Abstand nach oben und unten
}

// Spieler wechseln
function switchPlayer() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
}

// Event Listener
rollDiceButton.addEventListener("click", rollDice);
buildHouseButton.addEventListener("click", buildHouse);

// Spielerinfo initialisieren
updatePlayerInfo();