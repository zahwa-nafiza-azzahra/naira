// Data motivasi dan quotes
const motivationalQuotes = [
    "Setiap hari tanpa rokok adalah kemenangan besar untuk hidupmu",
    "Kamu lebih kuat dari keinginan untuk merokok",
    "Hidup sehat dimulai dari keputusan hari ini",
    "Paru-parumu berterima kasih untuk setiap hari tanpa asap",
    "Berhenti merokok adalah hadiah terbaik untuk masa depanmu",
    "Setiap nafas tanpa asap adalah nafas kebebasan",
    "Kamu sudah membuktikan bahwa kamu bisa melakukannya!",
    "Kesehatan adalah investasi terbaik dalam hidupmu"
  ];
  
  // Data health benefits berdasarkan hari
  const healthBenefits = {
    1: { health: 5, description: "Karbon monoksida mulai hilang dari darah" },
    3: { health: 15, description: "Penciuman dan perasa mulai membaik" },
    7: { health: 25, description: "Sirkulasi darah meningkat signifikan" },
    14: { health: 40, description: "Fungsi paru-paru mulai membaik" },
    30: { health: 60, description: "Risiko serangan jantung berkurang 50%" },
    90: { health: 80, description: "Paru-paru hampir pulih sepenuhnya" },
    365: { health: 100, description: "Risiko penyakit jantung sama dengan non-perokok" }
  };
  
  // Sistem Achievement
  const achievements = {
    starter: { name: "Pemula", icon: "🌱", requirement: 1, unlocked: false },
    week1: { name: "Survivor", icon: "⭐", requirement: 7, unlocked: false },
    month1: { name: "Strong", icon: "💪", requirement: 30, unlocked: false },
    saver: { name: "Saver", icon: "💰", requirement: "save_500k", unlocked: false },
    legend: { name: "Legend", icon: "🏆", requirement: 100, unlocked: false },
    master: { name: "Master", icon: "👑", requirement: 365, unlocked: false }
  };
  
  // Harga rokok rata-rata per hari (bisa disesuaikan)
  const DAILY_CIGARETTE_COST = 15000;
  
  class ChallengeManager {
    constructor() {
      this.init();
      this.updateDailyQuote();
      this.loadUserProgress();
      this.bindEvents();
      this.updateAllChallenges();
      this.updateStats();
    }
  
    init() {
      // Initialize daily check-in
      this.checkDailyCheckin();
      
      // Update progress setiap 5 detik untuk demo
      setInterval(() => {
        this.updateAllChallenges();
        this.updateStats();
      }, 5000);
    }
  
    updateDailyQuote() {
      const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      document.getElementById('daily-quote').textContent = `"${quote}"`;
    }
  
    bindEvents() {
      // Start button events
      document.querySelectorAll('.start-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const card = e.target.closest('.challenge-card');
          const days = parseInt(card.dataset.challenge);
          this.startChallenge(card, days);
        });
      });
  
      // Daily check-in event
      document.getElementById('checkin-btn').addEventListener('click', () => {
        this.dailyCheckin();
      });
  
      // Share button events
      document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const card = e.target.closest('.challenge-card');
          const days = parseInt(card.dataset.challenge);
          this.shareProgress(days);
        });
      });
  
      // Achievement hover effects
      document.querySelectorAll('.achievement-item').forEach(item => {
        item.addEventListener('click', () => {
          this.showAchievementDetails(item.dataset.badge);
        });
      });
    }
  
    startChallenge(card, days) {
      const challengeKey = `challenge_${days}`;
      
      // Jika belum dimulai, set tanggal mulai
      if (!localStorage.getItem(challengeKey)) {
        localStorage.setItem(challengeKey, new Date().toISOString());
        
        // Show success animation
        this.showStartAnimation(card);
        
        // Update button
        const startBtn = card.querySelector('.start-btn');
        startBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Challenge Dimulai!';
        startBtn.disabled = true;
        
        setTimeout(() => {
          startBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Sedang Berjalan';
          card.querySelector('.share-btn').classList.remove('hidden');
        }, 2000);
      }
  
      this.updateChallenge(card, days, challengeKey);
    }
  
    updateChallenge(card, days, key) {
      const startDate = localStorage.getItem(key);
      if (!startDate) return;
  
      const start = new Date(startDate);
      const now = new Date();
      const diffTime = Math.abs(now - start);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
      const progress = Math.min((diffDays / days) * 100, 100);
      const isCompleted = progress >= 100;
  
      // Update progress bar dengan animasi
      const progressBar = card.querySelector('.progress-bar');
      const progressText = card.querySelector('.progress-text');
      
      progressBar.style.width = `${progress}%`;
      
      if (isCompleted) {
        progressText.innerHTML = '<i class="fas fa-trophy text-yellow-500"></i> Selesai! 🎉';
        card.classList.add('completed');
        this.showCompletionCelebration(card);
      } else {
        progressText.textContent = `${Math.floor(progress)}% tercapai - ${diffDays}/${days} hari`;
      }
  
      // Update chart
      this.updateProgressChart(card, progress);
      
      // Show health benefits
      this.showHealthBenefits(card, diffDays);
      
      // Check achievements
      this.checkAchievements(diffDays);
    }
  
    updateProgressChart(card, progress) {
      const canvas = card.querySelector('.progress-chart');
      const ctx = canvas.getContext('2d');
      
      // Destroy existing chart
      if (card.chartInstance) {
        card.chartInstance.destroy();
      }
  
      // Create new chart
      card.chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Selesai', 'Sisa'],
          datasets: [{
            data: [progress, 100 - progress],
            backgroundColor: [
              progress >= 100 ? '#22c55e' : '#0ea5e9',
              '#e5e7eb'
            ],
            borderWidth: 0,
            cutout: '70%'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          animation: {
            animateRotate: true,
            duration: 1000
          }
        }
      });
  
      // Add center text
      const centerText = `${Math.floor(progress)}%`;
      this.addCenterText(card.chartInstance, centerText);
    }
  
    addCenterText(chart, text) {
      const canvas = chart.canvas;
      const ctx = canvas.getContext('2d');
      
      chart.options.plugins.beforeDraw = function() {
        const width = chart.width;
        const height = chart.height;
        const fontSize = (height / 114).toFixed(2);
        
        ctx.font = `bold ${fontSize}em Poppins`;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#374151';
        
        const textX = Math.round((width - ctx.measureText(text).width) / 2);
        const textY = height / 2;
        
        ctx.fillText(text, textX, textY);
      };
    }
  
    dailyCheckin() {
      const today = new Date().toDateString();
      const lastCheckin = localStorage.getItem('lastCheckin');
      
      if (lastCheckin === today) {
        this.showMessage('Kamu sudah check-in hari ini! 😊', 'info');
        return;
      }
  
      // Save check-in
      localStorage.setItem('lastCheckin', today);
      
      // Update streak
      this.updateStreak();
      
      // Show success animation
      const successDiv = document.getElementById('checkin-success');
      const checkinBtn = document.getElementById('checkin-btn');
      
      successDiv.classList.remove('hidden');
      checkinBtn.disabled = true;
      checkinBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Check-in Berhasil!';
      
      setTimeout(() => {
        successDiv.classList.add('hidden');
        checkinBtn.disabled = false;
        checkinBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Saya bebas rokok hari ini!';
      }, 3000);
      
      // Play celebration sound (optional)
      this.playCelebrationSound();
    }
  
    updateStreak() {
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
      const lastStreakDate = localStorage.getItem('lastStreakDate');
      
      if (lastStreakDate === yesterday.toDateString()) {
        // Continue streak
        const newStreak = currentStreak + 1;
        localStorage.setItem('currentStreak', newStreak.toString());
        localStorage.setItem('lastStreakDate', today);
      } else if (lastStreakDate !== today) {
        // Start new streak
        localStorage.setItem('currentStreak', '1');
        localStorage.setItem('lastStreakDate', today);
      }
    }
  
    updateStats() {
      // Update streak
      const currentStreak = localStorage.getItem('currentStreak') || '0';
      document.getElementById('current-streak').textContent = currentStreak;
      
      // Calculate health score
      const maxStreak = Math.max(1, parseInt(currentStreak));
      const healthScore = Math.min(Math.floor(maxStreak * 2.5), 100);
      document.getElementById('health-score').textContent = `${healthScore}%`;
      
      // Calculate money saved
      const moneySaved = parseInt(currentStreak) * DAILY_CIGARETTE_COST;
      document.getElementById('money-saved').textContent = this.formatCurrency(moneySaved);
      
      // Count achievements
      const unlockedBadges = Object.values(achievements).filter(a => a.unlocked).length;
      document.getElementById('total-badges').textContent = unlockedBadges;
    }
  
    checkDailyCheckin() {
      const today = new Date().toDateString();
      const lastCheckin = localStorage.getItem('lastCheckin');
      
      if (lastCheckin === today) {
        const checkinBtn = document.getElementById('checkin-btn');
        checkinBtn.disabled = true;
        checkinBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Sudah Check-in Hari Ini';
        checkinBtn.classList.add('bg-gray-400');
      }
    }
  
    showHealthBenefits(card, days) {
      const benefitsDiv = card.querySelector('.health-benefits');
      
      // Find appropriate health benefit
      const benefit = Object.entries(healthBenefits)
        .reverse()
        .find(([day]) => days >= parseInt(day));
      
      if (benefit && days > 0) {
        benefitsDiv.classList.remove('hidden');
        const [day, data] = benefit;
        benefitsDiv.querySelector('ul').innerHTML = `
          <li>✓ ${data.description}</li>
          <li>✓ Kesehatan meningkat ${data.health}%</li>
        `;
      }
    }
  
    checkAchievements(days) {
      const currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
      const moneySaved = currentStreak * DAILY_CIGARETTE_COST;
      
      Object.entries(achievements).forEach(([key, achievement]) => {
        if (achievement.unlocked) return;
        
        let shouldUnlock = false;
        
        if (typeof achievement.requirement === 'number') {
          shouldUnlock = days >= achievement.requirement || currentStreak >= achievement.requirement;
        } else if (achievement.requirement === 'save_500k') {
          shouldUnlock = moneySaved >= 500000;
        }
        
        if (shouldUnlock) {
          this.unlockAchievement(key, achievement);
        }
      });
    }
  
    unlockAchievement(key, achievement) {
      achievement.unlocked = true;
      
      // Update visual
      const achievementItem = document.querySelector(`[data-badge="${key}"]`);
      if (achievementItem) {
        achievementItem.classList.remove('locked');
        achievementItem.classList.add('unlocked');
        
        // Show notification
        this.showAchievementNotification(achievement);
      }
      
      // Save to localStorage
      localStorage.setItem(`achievement_${key}`, 'true');
    }
  
    showAchievementNotification(achievement) {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = 'achievement-notification';
      notification.innerHTML = `
        <div class="notification-content">
          <div class="achievement-icon">${achievement.icon}</div>
          <div>
            <h3>Achievement Unlocked!</h3>
            <p>${achievement.name}</p>
          </div>
        </div>
      `;
      
      // Add styles
      notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: white;
        padding: 1rem 2rem;
        border-radius: 15px;
        box-shadow: 0 15px 30px rgba(34, 197, 94, 0.3);
        z-index: 1000;
        animation: slideInRight 0.5s ease;
      `;
      
      document.body.appendChild(notification);
      
      // Remove after 4 seconds
      setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => notification.remove(), 500);
      }, 4000);
    }
  }