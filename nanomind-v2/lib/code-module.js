/**
 * NanoMind Code Module
 * Handles code suggestions with language-specific templates
 * and model-augmented completions
 */

'use strict';

const CodeModule = {
  selectedLang: 'HTML',
  nm: null,

  init(nmInstance) {
    this.nm = nmInstance;
  },

  setLang(lang) {
    this.selectedLang = lang;
    document.querySelectorAll('.lang-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.lang === lang);
    });
  },

  // Language-specific prompt templates
  getPrompt(task, lang) {
    const prompts = {
      'HTML': `Write clean semantic HTML5 for: ${task}`,
      'CSS': `Write modern CSS with flexbox/grid for: ${task}`,
      'JavaScript': `Write clean ES6+ JavaScript for: ${task}`,
      'HTML+CSS+JS': `Create a complete responsive webpage for: ${task}`,
    };
    return prompts[lang] || task;
  },

  // Template-based starters for common patterns
  getTemplate(task, lang) {
    const t = task.toLowerCase();

    if (lang === 'HTML') {
      if (t.includes('nav') || t.includes('navigation')) return this.templates.nav;
      if (t.includes('form') || t.includes('login')) return this.templates.form;
      if (t.includes('card')) return this.templates.card;
      if (t.includes('table')) return this.templates.table;
      if (t.includes('modal') || t.includes('popup') || t.includes('dialog')) return this.templates.modal;
    }
    if (lang === 'CSS') {
      if (t.includes('grid') || t.includes('layout')) return this.templates.cssGrid;
      if (t.includes('animation') || t.includes('animate')) return this.templates.cssAnimation;
      if (t.includes('button')) return this.templates.cssButton;
      if (t.includes('dark mode') || t.includes('theme')) return this.templates.darkMode;
    }
    if (lang === 'JavaScript') {
      if (t.includes('fetch') || t.includes('api')) return this.templates.fetchApi;
      if (t.includes('todo') || t.includes('list')) return this.templates.todoList;
      if (t.includes('slider') || t.includes('carousel')) return this.templates.slider;
      if (t.includes('form') || t.includes('valid')) return this.templates.formValidation;
      if (t.includes('search') || t.includes('filter')) return this.templates.searchFilter;
    }
    if (lang === 'HTML+CSS+JS') {
      if (t.includes('todo')) return this.templates.fullTodo;
      if (t.includes('quiz') || t.includes('game')) return this.templates.quiz;
      if (t.includes('calculator') || t.includes('calc')) return this.templates.calculator;
    }
    return null;
  },

  templates: {
    nav: `<!-- Responsive Navigation Bar -->
<nav class="navbar" role="navigation" aria-label="Main navigation">
  <div class="nav-container">
    <a href="/" class="nav-brand">
      <span class="brand-icon">◆</span>
      BrandName
    </a>

    <ul class="nav-links" role="list">
      <li><a href="#home" aria-current="page">Home</a></li>
      <li><a href="#about">About</a></li>
      <li class="nav-dropdown">
        <button class="dropdown-trigger" aria-expanded="false">
          Services ▾
        </button>
        <ul class="dropdown-menu">
          <li><a href="#design">Design</a></li>
          <li><a href="#dev">Development</a></li>
          <li><a href="#seo">Marketing</a></li>
        </ul>
      </li>
      <li><a href="#contact">Contact</a></li>
    </ul>

    <a href="#cta" class="nav-cta">Get Started</a>

    <button class="nav-hamburger" aria-label="Toggle menu" onclick="toggleMobileNav()">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<style>
  .navbar {
    position: sticky; top: 0; z-index: 100;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .nav-container {
    max-width: 1200px; margin: 0 auto;
    display: flex; align-items: center;
    padding: 0 24px; height: 64px; gap: 32px;
  }
  .nav-brand {
    font-weight: 800; font-size: 18px;
    text-decoration: none; color: inherit;
    display: flex; align-items: center; gap: 8px;
  }
  .brand-icon { color: #6c63ff; }
  .nav-links {
    display: flex; list-style: none;
    gap: 4px; margin: 0; flex: 1;
  }
  .nav-links a, .dropdown-trigger {
    padding: 8px 14px; border-radius: 6px;
    text-decoration: none; color: #555;
    background: none; border: none; cursor: pointer;
    font-size: 14px; transition: all 0.2s;
  }
  .nav-links a:hover, .dropdown-trigger:hover {
    background: #f5f3ff; color: #6c63ff;
  }
  .nav-cta {
    background: #6c63ff; color: #fff;
    padding: 8px 20px; border-radius: 8px;
    text-decoration: none; font-weight: 600;
    font-size: 14px; white-space: nowrap;
    transition: background 0.2s;
  }
  .nav-cta:hover { background: #5a52d5; }
  .nav-hamburger { display: none; }

  @media (max-width: 768px) {
    .nav-links, .nav-cta { display: none; }
    .nav-hamburger {
      display: flex; flex-direction: column;
      gap: 5px; background: none; border: none;
      cursor: pointer; margin-left: auto;
    }
    .nav-hamburger span {
      width: 24px; height: 2px;
      background: #333; border-radius: 2px;
      transition: all 0.3s;
    }
  }
</style>

<script>
  function toggleMobileNav() {
    const nav = document.querySelector('.nav-links');
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    nav.style.flexDirection = 'column';
    nav.style.position = 'absolute';
    nav.style.top = '64px';
    nav.style.left = 0;
    nav.style.right = 0;
    nav.style.background = '#fff';
    nav.style.padding = '16px';
    nav.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
  }
</script>`,

    form: `<!-- Login Form -->
<div class="form-container">
  <form class="auth-form" id="loginForm" novalidate>
    <div class="form-header">
      <h1>Welcome back</h1>
      <p>Sign in to your account</p>
    </div>

    <div class="form-group">
      <label for="email">Email address</label>
      <input type="email" id="email" name="email"
        placeholder="you@example.com"
        autocomplete="email" required>
      <span class="field-error" id="emailError"></span>
    </div>

    <div class="form-group">
      <label for="password">
        Password
        <a href="#forgot" class="forgot-link">Forgot password?</a>
      </label>
      <div class="input-wrapper">
        <input type="password" id="password" name="password"
          placeholder="Min. 8 characters"
          autocomplete="current-password" required>
        <button type="button" class="toggle-pwd" onclick="togglePassword()">👁</button>
      </div>
      <span class="field-error" id="pwdError"></span>
    </div>

    <label class="checkbox-label">
      <input type="checkbox" name="remember"> Remember me for 30 days
    </label>

    <button type="submit" class="submit-btn">Sign in</button>

    <p class="form-footer">
      Don't have an account? <a href="#signup">Sign up free</a>
    </p>
  </form>
</div>

<style>
  .form-container {
    min-height: 100vh; display: flex;
    align-items: center; justify-content: center;
    background: #f0f2f5; padding: 24px;
  }
  .auth-form {
    background: #fff; border-radius: 16px;
    padding: 40px; width: 100%; max-width: 400px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  }
  .form-header h1 { font-size: 24px; margin-bottom: 4px; }
  .form-header p { color: #888; margin-bottom: 28px; }
  .form-group { margin-bottom: 20px; }
  .form-group label {
    display: flex; justify-content: space-between;
    font-size: 13px; font-weight: 600; margin-bottom: 6px;
  }
  .form-group input {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid #e0e0e0; border-radius: 8px;
    font-size: 14px; transition: border-color 0.2s;
    outline: none;
  }
  .form-group input:focus { border-color: #6c63ff; }
  .form-group input.error { border-color: #e74c3c; }
  .field-error { font-size: 12px; color: #e74c3c; display: block; margin-top: 4px; }
  .input-wrapper { position: relative; }
  .input-wrapper input { padding-right: 44px; }
  .toggle-pwd {
    position: absolute; right: 12px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    font-size: 16px; opacity: 0.6;
  }
  .forgot-link { font-weight: normal; color: #6c63ff; text-decoration: none; font-size: 12px; }
  .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 24px; cursor: pointer; }
  .submit-btn {
    width: 100%; padding: 13px;
    background: #6c63ff; color: #fff;
    border: none; border-radius: 8px;
    font-size: 15px; font-weight: 600;
    cursor: pointer; transition: background 0.2s;
  }
  .submit-btn:hover { background: #5a52d5; }
  .form-footer { text-align: center; margin-top: 20px; font-size: 13px; color: #888; }
  .form-footer a { color: #6c63ff; text-decoration: none; }
</style>

<script>
  function togglePassword() {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let valid = true;

    const email = document.getElementById('email');
    const emailErr = document.getElementById('emailError');
    if (!email.value.match(/^[^@]+@[^@]+\.[^@]+$/)) {
      email.classList.add('error');
      emailErr.textContent = 'Please enter a valid email address';
      valid = false;
    } else {
      email.classList.remove('error');
      emailErr.textContent = '';
    }

    const pwd = document.getElementById('password');
    const pwdErr = document.getElementById('pwdError');
    if (pwd.value.length < 8) {
      pwd.classList.add('error');
      pwdErr.textContent = 'Password must be at least 8 characters';
      valid = false;
    } else {
      pwd.classList.remove('error');
      pwdErr.textContent = '';
    }

    if (valid) {
      console.log('Form submitted:', { email: email.value });
      // Add your submit logic here
    }
  });
</script>`,

    fetchApi: `// Fetch API Utility Module
const API = {
  baseURL: 'https://api.example.com',
  headers: { 'Content-Type': 'application/json' },

  async request(method, endpoint, data = null, options = {}) {
    const config = {
      method,
      headers: { ...this.headers, ...options.headers },
    };
    if (data) config.body = JSON.stringify(data);

    try {
      const response = await fetch(this.baseURL + endpoint, config);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || \`HTTP \${response.status}\`);
      }
      return response.status === 204 ? null : await response.json();
    } catch (err) {
      if (err.name === 'AbortError') throw new Error('Request timed out');
      throw err;
    }
  },

  get: (endpoint, opts) => API.request('GET', endpoint, null, opts),
  post: (endpoint, data, opts) => API.request('POST', endpoint, data, opts),
  put: (endpoint, data, opts) => API.request('PUT', endpoint, data, opts),
  patch: (endpoint, data, opts) => API.request('PATCH', endpoint, data, opts),
  delete: (endpoint, opts) => API.request('DELETE', endpoint, null, opts),
};

// Usage examples:

// Fetch all users
async function getUsers() {
  try {
    const users = await API.get('/users');
    console.log('Users:', users);
    return users;
  } catch (error) {
    console.error('Failed to get users:', error.message);
  }
}

// Create new user
async function createUser(userData) {
  try {
    const newUser = await API.post('/users', userData);
    console.log('Created:', newUser);
    return newUser;
  } catch (error) {
    console.error('Failed to create user:', error.message);
  }
}

// With loading state
async function fetchWithUI(btn) {
  btn.disabled = true;
  btn.textContent = 'Loading...';
  try {
    const data = await API.get('/data');
    renderData(data);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Refresh';
  }
}

// Polling example
function startPolling(endpoint, interval = 5000) {
  async function poll() {
    const data = await API.get(endpoint).catch(console.error);
    if (data) renderData(data);
  }
  poll();
  return setInterval(poll, interval);
}`,

    cssAnimation: `/* CSS Animation Collection */

/* ── 1. Fade In ── */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.fade-in { animation: fadeIn 0.4s ease forwards; }

/* ── 2. Slide Up ── */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.slide-up { animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

/* ── 3. Scale Pop ── */
@keyframes pop {
  0% { transform: scale(0.8); opacity: 0; }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
.pop { animation: pop 0.3s ease forwards; }

/* ── 4. Shimmer / Skeleton loader ── */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

/* ── 5. Spinner ── */
@keyframes spin { to { transform: rotate(360deg); } }
.spinner {
  width: 24px; height: 24px;
  border: 3px solid rgba(108, 99, 255, 0.2);
  border-top-color: #6c63ff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

/* ── 6. Stagger children ── */
.stagger-parent .stagger-child {
  opacity: 0;
  animation: slideUp 0.5s ease forwards;
}
.stagger-child:nth-child(1) { animation-delay: 0s; }
.stagger-child:nth-child(2) { animation-delay: 0.1s; }
.stagger-child:nth-child(3) { animation-delay: 0.2s; }
.stagger-child:nth-child(4) { animation-delay: 0.3s; }
.stagger-child:nth-child(5) { animation-delay: 0.4s; }

/* ── 7. Pulse attention ── */
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(108, 99, 255, 0.4); }
  50% { box-shadow: 0 0 0 12px rgba(108, 99, 255, 0); }
}
.pulse { animation: pulse 2s ease infinite; }

/* ── 8. Typewriter ── */
@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}
@keyframes blinkCursor {
  from, to { border-color: transparent; }
  50% { border-color: currentColor; }
}
.typewriter {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid;
  width: 0;
  animation: typing 2s steps(30) forwards, blinkCursor 0.8s infinite;
}`,

    fullTodo: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Todo App</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #f0f2f5; min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; padding: 40px 16px; }
  .app { background: #fff; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
  .app-header { background: linear-gradient(135deg, #6c63ff, #a78bfa); color: #fff; padding: 28px 24px; }
  .app-header h1 { font-size: 22px; margin-bottom: 4px; }
  .app-header .stats { opacity: 0.85; font-size: 13px; }
  .input-row { display: flex; gap: 10px; padding: 20px 24px 12px; border-bottom: 1px solid #f0f0f0; }
  .input-row input { flex: 1; padding: 10px 14px; border: 1.5px solid #e0e0e0; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s; }
  .input-row input:focus { border-color: #6c63ff; }
  .input-row button { background: #6c63ff; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
  .input-row button:hover { background: #5a52d5; }
  .filter-bar { display: flex; gap: 6px; padding: 12px 24px; background: #fafafa; border-bottom: 1px solid #f0f0f0; }
  .filter-btn { padding: 5px 14px; border-radius: 20px; border: 1.5px solid #e0e0e0; background: #fff; font-size: 12px; cursor: pointer; transition: all 0.2s; }
  .filter-btn.active { background: #6c63ff; color: #fff; border-color: #6c63ff; }
  .todo-list { list-style: none; max-height: 400px; overflow-y: auto; }
  .todo-item { display: flex; align-items: center; gap: 12px; padding: 14px 24px; border-bottom: 1px solid #f8f8f8; transition: background 0.15s; animation: slideIn 0.2s ease; }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: none; } }
  .todo-item:hover { background: #fafafa; }
  .todo-item input[type=checkbox] { width: 18px; height: 18px; accent-color: #6c63ff; cursor: pointer; flex-shrink: 0; }
  .todo-text { flex: 1; font-size: 14px; transition: all 0.2s; }
  .todo-item.done .todo-text { text-decoration: line-through; color: #bbb; }
  .delete-btn { opacity: 0; background: none; border: none; color: #ccc; cursor: pointer; font-size: 16px; transition: all 0.2s; padding: 4px; border-radius: 4px; }
  .todo-item:hover .delete-btn { opacity: 1; }
  .delete-btn:hover { color: #e74c3c; background: #fff0f0; }
  .empty-state { text-align: center; padding: 40px; color: #bbb; }
  .empty-state .icon { font-size: 48px; margin-bottom: 12px; }
  .footer { padding: 14px 24px; background: #fafafa; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
  .remaining { font-size: 13px; color: #888; }
  .clear-done-btn { background: none; border: none; color: #aaa; font-size: 12px; cursor: pointer; transition: color 0.2s; }
  .clear-done-btn:hover { color: #e74c3c; }
</style>
</head>
<body>
<div class="app">
  <div class="app-header">
    <h1>📋 My Todos</h1>
    <div class="stats" id="stats">0 tasks</div>
  </div>
  <div class="input-row">
    <input type="text" id="newTodo" placeholder="What needs to be done?" maxlength="100">
    <button onclick="addTodo()">+ Add</button>
  </div>
  <div class="filter-bar">
    <button class="filter-btn active" onclick="setFilter('all', this)">All</button>
    <button class="filter-btn" onclick="setFilter('active', this)">Active</button>
    <button class="filter-btn" onclick="setFilter('done', this)">Done</button>
  </div>
  <ul class="todo-list" id="todoList"></ul>
  <div class="footer">
    <span class="remaining" id="remaining"></span>
    <button class="clear-done-btn" onclick="clearDone()">Clear completed</button>
  </div>
</div>

<script>
let todos = JSON.parse(localStorage.getItem('nm_todos') || '[]');
let filter = 'all';
let nextId = todos.reduce((m, t) => Math.max(m, t.id + 1), 1);

function save() { localStorage.setItem('nm_todos', JSON.stringify(todos)); }

function render() {
  const filtered = todos.filter(t =>
    filter === 'all' ? true : filter === 'done' ? t.done : !t.done
  );
  const list = document.getElementById('todoList');

  if (filtered.length === 0) {
    list.innerHTML = \`<div class="empty-state"><div class="icon">\${filter === 'done' ? '🎉' : '✨'}</div><p>\${filter === 'done' ? 'Nothing completed yet' : 'No tasks here!'}</p></div>\`;
  } else {
    list.innerHTML = filtered.map(t => \`
      <li class="todo-item \${t.done ? 'done' : ''}" id="item-\${t.id}">
        <input type="checkbox" \${t.done ? 'checked' : ''} onchange="toggle(\${t.id})">
        <span class="todo-text">\${escHtml(t.text)}</span>
        <button class="delete-btn" onclick="remove(\${t.id})" title="Delete">✕</button>
      </li>\`).join('');
  }

  const active = todos.filter(t => !t.done).length;
  document.getElementById('stats').textContent = \`\${todos.length} task\${todos.length !== 1 ? 's' : ''}\`;
  document.getElementById('remaining').textContent = \`\${active} item\${active !== 1 ? 's' : ''} left\`;
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function addTodo() {
  const input = document.getElementById('newTodo');
  const text = input.value.trim();
  if (!text) return;
  todos.unshift({ id: nextId++, text, done: false, created: Date.now() });
  input.value = '';
  save(); render();
}

function toggle(id) {
  const t = todos.find(t => t.id === id);
  if (t) { t.done = !t.done; save(); render(); }
}

function remove(id) {
  const el = document.getElementById('item-' + id);
  el.style.animation = 'none';
  el.style.opacity = '0';
  el.style.transform = 'translateX(12px)';
  el.style.transition = 'all 0.2s';
  setTimeout(() => {
    todos = todos.filter(t => t.id !== id);
    save(); render();
  }, 200);
}

function setFilter(f, btn) {
  filter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

function clearDone() {
  todos = todos.filter(t => !t.done);
  save(); render();
}

document.getElementById('newTodo').addEventListener('keypress', e => { if (e.key === 'Enter') addTodo(); });

render();
</script>
</body>
</html>`,
  }
};

window.CodeModule = CodeModule;
