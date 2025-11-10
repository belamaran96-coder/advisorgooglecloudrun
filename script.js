class HealthAssistAI {
  constructor() {
    this.chatMessages = document.getElementById('chat-messages');
    this.userInput = document.getElementById('user-input');
    this.sendBtn = document.getElementById('send-btn');
    this.typingIndicator = document.createElement('div');
    this.clearChatBtn = null;
    this.themeToggle = null;

    this.apiUrl = '/api/chat';
    this.init();
  }

  init() {
    this.typingIndicator.className = 'typing-indicator';
    this.typingIndicator.textContent = 'HealthAssist AI is typing...';
    this.typingIndicator.style.display = 'none';
    this.chatMessages.appendChild(this.typingIndicator);

    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const question = e.target.getAttribute('data-question');
        this.userInput.value = question;
        this.sendMessage();
      });
    });

    this.clearChatBtn = document.getElementById('clear-chat-btn');
    if (this.clearChatBtn) {
      this.clearChatBtn.addEventListener('click', () => this.clearChat());
    }

    this.themeToggle = document.getElementById('theme-toggle');
    if (this.themeToggle) {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') document.body.classList.add('dark-mode');
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
      this.updateThemeButtonText();
    }
  }

  async sendMessage() {
    const userMessage = this.userInput.value.trim();
    if (!userMessage) return;

    this.addMessage(userMessage, 'user');
    this.userInput.value = '';
    this.sendBtn.disabled = true;

    this.showTypingIndicator();

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      this.hideTypingIndicator();
      this.addMessage(data.response, 'bot');
    } catch {
      this.hideTypingIndicator();
      this.addMessage('Error connecting to AI service. Please try again later.', 'bot');
    }

    this.sendBtn.disabled = false;
  }

  addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    const safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    messageDiv.innerHTML = `<p>${safeText}</p>`;
    this.chatMessages.insertBefore(messageDiv, this.typingIndicator);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    this.saveChatHistory();
  }

  showTypingIndicator() {
    this.typingIndicator.style.display = 'block';
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  hideTypingIndicator() {
    this.typingIndicator.style.display = 'none';
  }

  clearChat() {
    const confirmClear = confirm('Are you sure you want to clear the chat history?');
    if (!confirmClear) return;
    localStorage.removeItem('healthassist_chat');
    this.chatMessages.innerHTML = '';
    this.chatMessages.appendChild(this.typingIndicator);
    this.saveChatHistory();
  }

  saveChatHistory() {
    localStorage.setItem('healthassist_chat', this.chatMessages.innerHTML);
  }

  loadChatHistory() {
    const saved = localStorage.getItem('healthassist_chat');
    if (saved) this.chatMessages.innerHTML = saved;
  }

  toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.updateThemeButtonText();
  }

  updateThemeButtonText() {
    if (!this.themeToggle) return;
    this.themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new HealthAssistAI();
  app.loadChatHistory();
});
