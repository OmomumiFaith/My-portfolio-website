'use strict';

document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');
if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
}

const taskForm = document.querySelector('#task-form');
if (taskForm) {
  const taskInput = document.querySelector('#task-input');
  const dateInput = document.querySelector('#task-date');
  const taskList = document.querySelector('#task-list');
  const count = document.querySelector('#task-count');
  const emptyState = document.querySelector('#empty-state');
  const clearButton = document.querySelector('#clear-completed');
  const storageKey = 'faith-academic-planner-v1';
  let tasks = [];
  try { tasks = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { tasks = []; }
  if (!Array.isArray(tasks)) tasks = [];

  function saveTasks() {
    try { localStorage.setItem(storageKey, JSON.stringify(tasks)); } catch { /* Storage may be unavailable in private browsing. */ }
  }
  function renderTasks() {
    taskList.replaceChildren();
    tasks.forEach((task) => {
      const item = document.createElement('li');
      item.className = `task-item${task.done ? ' completed' : ''}`;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox'; checkbox.checked = Boolean(task.done);
      checkbox.setAttribute('aria-label', `Mark ${task.text} as ${task.done ? 'not completed' : 'completed'}`);
      checkbox.addEventListener('change', () => { task.done = checkbox.checked; saveTasks(); renderTasks(); });
      const label = document.createElement('span'); label.className = 'task-text'; label.textContent = task.text;
      item.append(checkbox, label);
      if (task.due) {
        const due = document.createElement('time'); due.className = 'task-due'; due.dateTime = task.due;
        due.textContent = new Date(`${task.due}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        item.append(due);
      }
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete-task'; remove.textContent = '×';
      remove.setAttribute('aria-label', `Delete ${task.text}`);
      remove.addEventListener('click', () => { tasks = tasks.filter((entry) => entry.id !== task.id); saveTasks(); renderTasks(); });
      item.append(remove); taskList.append(item);
    });
    const remaining = tasks.filter((task) => !task.done).length;
    count.textContent = remaining;
    emptyState.hidden = tasks.length > 0;
  }
  taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = taskInput.value.trim();
    if (!text) { taskInput.focus(); return; }
    tasks.unshift({ id: `${Date.now()}-${Math.random()}`, text, due: dateInput.value, done: false });
    saveTasks(); renderTasks(); taskForm.reset(); taskInput.focus();
  });
  clearButton.addEventListener('click', () => { tasks = tasks.filter((task) => !task.done); saveTasks(); renderTasks(); });
  renderTasks();
}

const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  const feedback = document.querySelector('#form-feedback');
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    feedback.className = 'form-feedback';
    const values = Object.fromEntries(new FormData(contactForm).entries());
    const name = String(values.name || '').trim();
    const email = String(values.email || '').trim();
    const phone = String(values.phone || '').trim();
    const message = String(values.message || '').trim();
    let error = '';
    if (![name, email, phone, message].every(Boolean)) error = 'Please complete every field before submitting.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) error = 'Please enter a valid email address.';
    else if (!/^\d+$/.test(phone)) error = 'Please enter your phone number using digits only.';
    if (error) { feedback.textContent = error; return; }
    feedback.textContent = `Thanks, ${name}. Your details look good. This demo form does not send messages yet.`;
    feedback.classList.add('success');
    contactForm.reset();
  });
}
