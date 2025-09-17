// Habit Tracker & Pomodoro Timer App
// This file contains all the JavaScript logic for both features

// ===========================================
// GLOBAL VARIABLES AND STATE
// ===========================================

// Habit Tracker State
let habits = [];
let habitIdCounter = 1;

// Pomodoro Timer State
let timer = {
    isRunning: false,
    isPaused: false,
    currentTime: 25 * 60, // 25 minutes in seconds
    workDuration: 25, // minutes
    breakDuration: 5, // minutes
    isWorkTime: true,
    intervalId: null
};

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

// Format time from seconds to MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Save data to localStorage
function saveToLocalStorage() {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('habitIdCounter', habitIdCounter.toString());
}

// Load data from localStorage
function loadFromLocalStorage() {
    const savedHabits = localStorage.getItem('habits');
    const savedCounter = localStorage.getItem('habitIdCounter');
    
    if (savedHabits) {
        habits = JSON.parse(savedHabits);
    }
    
    if (savedCounter) {
        habitIdCounter = parseInt(savedCounter);
    }
}

// ===========================================
// HABIT TRACKER FUNCTIONS
// ===========================================

// Add a new habit
function addHabit(habitName) {
    if (habitName.trim() === '') {
        alert('Please enter a habit name!');
        return;
    }
    
    const newHabit = {
        id: habitIdCounter++,
        name: habitName.trim(),
        streak: 0,
        lastCompleted: null,
        createdAt: new Date().toISOString()
    };
    
    habits.push(newHabit);
    saveToLocalStorage();
    renderHabits();
}

// Complete a habit (mark as done for today)
function completeHabit(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const today = new Date().toDateString();
    const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted).toDateString() : null;
    
    // If already completed today, don't do anything
    if (lastCompleted === today) {
        alert('You already completed this habit today!');
        return;
    }
    
    // Update streak logic
    if (lastCompleted) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();
        
        if (lastCompleted === yesterdayString) {
            // Consecutive day - increment streak
            habit.streak++;
        } else if (lastCompleted !== today) {
            // Not consecutive - reset streak
            habit.streak = 1;
        }
    } else {
        // First time completing
        habit.streak = 1;
    }
    
    habit.lastCompleted = new Date().toISOString();
    saveToLocalStorage();
    renderHabits();
}

// Delete a habit
function deleteHabit(habitId) {
    if (confirm('Are you sure you want to delete this habit?')) {
        habits = habits.filter(h => h.id !== habitId);
        saveToLocalStorage();
        renderHabits();
    }
}

// Render all habits to the DOM
function renderHabits() {
    const habitsList = document.getElementById('habits-list');
    
    if (habits.length === 0) {
        habitsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No habits yet. Add your first habit above!</p>';
        return;
    }
    
    habitsList.innerHTML = habits.map(habit => `
        <div class="habit-item">
            <div class="habit-info">
                <span class="habit-name">${habit.name}</span>
                <span class="habit-streak">${habit.streak} day streak</span>
            </div>
            <div class="habit-actions">
                <button class="btn btn-complete" onclick="completeHabit(${habit.id})">
                    Complete
                </button>
                <button class="btn btn-delete" onclick="deleteHabit(${habit.id})">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// ===========================================
// POMODORO TIMER FUNCTIONS
// ===========================================

// Update timer display
function updateTimerDisplay() {
    const timeElement = document.getElementById('timer-time');
    const modeElement = document.getElementById('timer-mode');
    
    timeElement.textContent = formatTime(timer.currentTime);
    modeElement.textContent = timer.isWorkTime ? 'Work Time' : 'Break Time';
}

// Start the timer
function startTimer() {
    if (timer.isPaused) {
        // Resume from pause
        timer.isPaused = false;
    } else {
        // Start fresh
        timer.currentTime = timer.isWorkTime ? timer.workDuration * 60 : timer.breakDuration * 60;
    }
    
    timer.isRunning = true;
    timer.intervalId = setInterval(tick, 1000);
    
    // Update button states
    document.getElementById('start-btn').disabled = true;
    document.getElementById('pause-btn').disabled = false;
}

// Pause the timer
function pauseTimer() {
    timer.isRunning = false;
    timer.isPaused = true;
    clearInterval(timer.intervalId);
    
    // Update button states
    document.getElementById('start-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
}

// Reset the timer
function resetTimer() {
    timer.isRunning = false;
    timer.isPaused = false;
    clearInterval(timer.intervalId);
    
    timer.currentTime = timer.workDuration * 60;
    timer.isWorkTime = true;
    
    updateTimerDisplay();
    
    // Update button states
    document.getElementById('start-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
}

// Timer tick function (called every second)
function tick() {
    timer.currentTime--;
    updateTimerDisplay();
    
    if (timer.currentTime <= 0) {
        // Timer finished
        clearInterval(timer.intervalId);
        timer.isRunning = false;
        
        // Switch between work and break
        timer.isWorkTime = !timer.isWorkTime;
        timer.currentTime = timer.isWorkTime ? timer.workDuration * 60 : timer.breakDuration * 60;
        
        // Show notification
        const message = timer.isWorkTime ? 'Break time is over! Time to work!' : 'Work time is over! Take a break!';
        alert(message);
        
        updateTimerDisplay();
        
        // Update button states
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
    }
}

// Update timer settings
function updateTimerSettings() {
    const workDuration = parseInt(document.getElementById('work-duration').value);
    const breakDuration = parseInt(document.getElementById('break-duration').value);
    
    timer.workDuration = workDuration;
    timer.breakDuration = breakDuration;
    
    // If timer is not running, update current time
    if (!timer.isRunning) {
        timer.currentTime = timer.isWorkTime ? timer.workDuration * 60 : timer.breakDuration * 60;
        updateTimerDisplay();
    }
}

// ===========================================
// EVENT LISTENERS
// ===========================================

// Wait for DOM to load before setting up event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    loadFromLocalStorage();
    
    // Render initial state
    renderHabits();
    updateTimerDisplay();
    
    // Habit Tracker Event Listeners
    document.getElementById('add-habit-btn').addEventListener('click', function() {
        const habitInput = document.getElementById('habit-input');
        addHabit(habitInput.value);
        habitInput.value = ''; // Clear input
    });
    
    // Allow adding habit with Enter key
    document.getElementById('habit-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addHabit(this.value);
            this.value = '';
        }
    });
    
    // Pomodoro Timer Event Listeners
    document.getElementById('start-btn').addEventListener('click', startTimer);
    document.getElementById('pause-btn').addEventListener('click', pauseTimer);
    document.getElementById('reset-btn').addEventListener('click', resetTimer);
    
    // Timer settings change listeners
    document.getElementById('work-duration').addEventListener('change', updateTimerSettings);
    document.getElementById('break-duration').addEventListener('change', updateTimerSettings);
});
