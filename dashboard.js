function updateDashboard() {
    const quitDate = localStorage.getItem("quitDate");
    const dailyCost = parseInt(localStorage.getItem("dailyCost") || 0);
  
    if (!quitDate) { window.location.href = "commit.html"; return; }
  
    const start = new Date(quitDate);
    const now = new Date();
    const diff = now - start;
  
    if (diff < 0) {
      document.getElementById("timeElapsed").textContent = "Belum mulai!";
      return;
    }
  
    // Hitung waktu
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    document.getElementById("timeElapsed").textContent = `${days} Hari, ${hours} Jam, ${minutes} Menit`;
  
    // Hitung uang
    const moneySaved = days * dailyCost;
    document.getElementById("moneySaved").textContent = `Rp ${moneySaved.toLocaleString("id-ID")}`;
  
    // Milestones kesehatan
    const milestones = [
      { day: 1, text: "Detak jantung mulai normal ❤️" },
      { day: 2, text: "Nikotin berkurang 🚭" },
      { day: 7, text: "Indra penciuman meningkat 👃" },
      { day: 30, text: "Sirkulasi membaik 💪" },
      { day: 90, text: "Batuk berkurang 🌬️" },
      { day: 365, text: "Risiko jantung -50% 🎉" },
    ];
    const list = document.getElementById("milestones");
    list.innerHTML = "";
    milestones.forEach(m => {
      if (days >= m.day) {
        const li = document.createElement("li");
        li.textContent = `✔ ${m.text}`;
        list.appendChild(li);
      }
    });
  
    // Daily Challenge
    const challenges = [
      "Minum 2 gelas air putih 💧",
      "Lakukan 10 push-up 💪",
      "Tulis 3 alasan berhenti ✍️",
      "Kunyah permen karet 🍬",
      "Jalan kaki 15 menit 🚶"
    ];
    document.getElementById("dailyChallenge").textContent = challenges[days % challenges.length];
  
    // Chart
    if (window.savingChart) window.savingChart.destroy();
    const ctx = document.getElementById("savingChart").getContext("2d");
    window.savingChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array.from({length: days+1}, (_,i) => i),
        datasets: [{
          label: "Penghematan (Rp)",
          data: Array.from({length: days+1}, (_,i) => i * dailyCost),
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6,182,212,0.2)",
          fill: true,
          tension: 0.3
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }
  
  setInterval(updateDashboard, 1000);
  updateDashboard();
  
  // Dark mode toggle
  document.getElementById("toggleDark").addEventListener("click", () => {
    document.getElementById("app").classList.toggle("dark");
  });
  