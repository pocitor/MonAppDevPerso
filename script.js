// ==========================================
// 1. NAVIGATION ENTRE ONGLETS
// ==========================================
function switchTab(tabName) {
  // Retire la classe 'active' de tous les contenus et boutons
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

  // Ajoute 'active' sur l'onglet et le bouton cliqués
  document.getElementById(`tab-${tabName}`).classList.add('active');
  document.getElementById(`nav-${tabName}`).classList.add('active');
}

// ==========================================
// 2. GESTION DES TÂCHES (Déjà appris !)
// ==========================================
let tasks = JSON.parse(localStorage.getItem('zenflow_tasks')) || [];
renderTasks();

function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();

  if (text !== '') {
    tasks.push({ text: text, completed: false });
    input.value = '';
    saveAndRender();
  }
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveAndRender();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem('zenflow_tasks', JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    if (task.completed) li.classList.add('done');

    li.innerHTML = `
      <div class="checkbox" onclick="toggleTask(${index})"></div>
      <span class="task-text" onclick="toggleTask(${index})">${task.text}</span>
      <button class="btn-delete" onclick="deleteTask(${index})">✕</button>
    `;
    list.appendChild(li);
  });
}

// ==========================================
// 3. GESTION DU MINUTEUR POMODORO
// ==========================================
let customMinutes = 25;           // Durée choisie par l'utilisateur
let timeLeft = customMinutes * 60; // Temps restant en SECONDES
let timerInterval = null;         // Variable pour stocker l'horloge
let isRunning = false;            // Vrai si le chrono tourne

// Mettre à jour le texte du chrono (ex: convertit 1500 secondes en "25:00")
function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // .padStart(2, '0') permet d'avoir toujours 2 chiffres (ex: "05" au lieu de "5")
  document.getElementById('timerDisplay').textContent = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Régler la durée manuellement depuis la case
function setCustomTime(val) {
  if (isRunning) return; // Sécurité : impossible de changer si le chrono tourne

  let newMinutes = parseInt(val);
  if (isNaN(newMinutes) || newMinutes < 1) newMinutes = 1;
  if (newMinutes > 180) newMinutes = 180;

  customMinutes = newMinutes;
  timeLeft = customMinutes * 60; // Convertit les minutes en secondes
  updateTimerDisplay();
}

// Démarrer ou Mettre en Pause
function toggleTimer() {
  const startBtn = document.getElementById('startBtn');

  if (isRunning) {
    // --- MODE PAUSE ---
    clearInterval(timerInterval); // Stoppe le décompte
    isRunning = false;
    startBtn.textContent = 'Démarrer';
    startBtn.style.background = '#2563eb'; // Bleu
  } else {
    // --- MODE DÉMARRAGE ---
    isRunning = true;
    startBtn.textContent = 'Pause';
    startBtn.style.background = '#e11d48'; // Rouge

    // setInterval exécute une fonction toutes les 1000 millisecondes (1 seconde)
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
      } else {
        // Fin du chrono
        clearInterval(timerInterval);
        alert("Session terminée ! Prends une pause bien méritée.");
        timeLeft = customMinutes * 60; // Réinitialise
        updateTimerDisplay();
        isRunning = false;
        startBtn.textContent = 'Démarrer';
        startBtn.style.background = '#2563eb';
      }
    }, 1000);
  }
}