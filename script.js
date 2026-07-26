// ==========================================
// CONFIGURATION SUPABASE
// ==========================================
const SUPABASE_URL = "https://wzpzentaktubninkokdr.supabase.co";
const SUPABASE_KEY = "sb_publishable_s83sxDftB7ajlGf5Y-X-bA_qKVKYmsT"; 

// On utilise 'supabaseClient' pour éviter le conflit avec la variable globale
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 1. NAVIGATION ENTRE ONGLETS
// ==========================================
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

  document.getElementById(`tab-${tabName}`).classList.add('active');
  document.getElementById(`nav-${tabName}`).classList.add('active');
}

// ==========================================
// 2. GESTION DES TÂCHES AVEC SUPABASE
// ==========================================
let tasks = [];

// Charger les tâches au démarrage
fetchTasks();

// Écouter les changements en TEMPS RÉEL (Synchro PC / Téléphone)
supabaseClient
  .channel('schema-db-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
    fetchTasks();
  })
  .subscribe();

// 1. Récupérer les tâches
async function fetchTasks() {
  const { data, error } = await supabaseClient
    .from('tasks')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error("Erreur de chargement :", error);
  } else {
    tasks = data || [];
    renderTasks();
  }
}

// 2. Ajouter une tâche
async function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();

  if (text !== '') {
    const { error } = await supabaseClient
      .from('tasks')
      .insert([{ text: text, completed: false }]);

    if (!error) {
      input.value = '';
      fetchTasks();
    } else {
      console.error("Erreur d'ajout :", error);
    }
  }
}

// 3. Cocher / Décocher
async function toggleTask(index) {
  const task = tasks[index];
  
  await supabaseClient
    .from('tasks')
    .update({ completed: !task.completed })
    .eq('id', task.id);

  fetchTasks();
}

// 4. Supprimer
async function deleteTask(index) {
  const task = tasks[index];

  await supabaseClient
    .from('tasks')
    .delete()
    .eq('id', task.id);

  fetchTasks();
}

// 5. Générer le HTML
function renderTasks() {
  const list = document.getElementById('taskList');
  if (!list) return;
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
let customMinutes = 25;
let timeLeft = customMinutes * 60;
let timerInterval = null;
let isRunning = false;

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const display = document.getElementById('timerDisplay');
  if (display) {
    display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

function setCustomTime(val) {
  if (isRunning) return;

  let newMinutes = parseInt(val);
  if (isNaN(newMinutes) || newMinutes < 1) newMinutes = 1;
  if (newMinutes > 180) newMinutes = 180;

  customMinutes = newMinutes;
  timeLeft = customMinutes * 60;
  updateTimerDisplay();
}

function toggleTimer() {
  const startBtn = document.getElementById('startBtn');

  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.textContent = 'Démarrer';
    startBtn.style.background = '#2563eb';
  } else {
    isRunning = true;
    startBtn.textContent = 'Pause';
    startBtn.style.background = '#e11d48';

    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        alert("Session terminée ! Prends une pause bien méritée.");
        timeLeft = customMinutes * 60;
        updateTimerDisplay();
        isRunning = false;
        startBtn.textContent = 'Démarrer';
        startBtn.style.background = '#2563eb';
      }
    }, 1000);
  }
}
