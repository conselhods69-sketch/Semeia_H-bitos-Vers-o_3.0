/* SEMEANDO HÁBITOS — lógica do app (localStorage) */
(function () {
  "use strict";

  const STORAGE_KEY = "semeando-habitos:v1";
  const DAY_LABELS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const MS_DIA = 24 * 60 * 60 * 1000;

  const STAGES = [
    { name: "semente", min: 0 },
    { name: "broto", min: 1 },
    { name: "muda", min: 3 },
    { name: "planta jovem", min: 7 },
    { name: "planta madura", min: 14 },
    { name: "florescendo", min: 30 },
  ];

  const BADGES = [
    { id: "b3", name: "Primeiras raízes", desc: "Alcance 3 dias de sequência.", need: 3 },
    { id: "b7", name: "Uma semana inteira", desc: "Alcance 7 dias de sequência.", need: 7 },
    { id: "b14", name: "Enraizado", desc: "Alcance 14 dias de sequência.", need: 14 },
    { id: "b30", name: "Em plena floração", desc: "Alcance 30 dias de sequência.", need: 30 },
    { id: "b60", name: "Jardineiro dedicado", desc: "Alcance 60 dias de sequência.", need: 60 },
    { id: "b100", name: "Estufa centenária", desc: "Alcance 100 dias de sequência.", need: 100 },
  ];

  /* ---------- utilidades de data ---------- */
  function hojeISO() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return isoFromDate(d);
  }
  function isoFromDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  function dateFromISO(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function diffDias(isoA, isoB) {
    return Math.round((dateFromISO(isoA) - dateFromISO(isoB)) / MS_DIA);
  }
  function addDias(iso, n) {
    const d = dateFromISO(iso);
    d.setDate(d.getDate() + n);
    return isoFromDate(d);
  }
  function diaDaSemana(iso) {
    return dateFromISO(iso).getDay();
  }

  /* ---------- estado ---------- */
  function estadoPadrao() {
    return { habits: [], remindersOn: false };
  }
  function carregarEstado() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return estadoPadrao();
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.habits)) return estadoPadrao();
      return parsed;
    } catch (e) {
      console.error("Falha ao carregar estado:", e);
      return estadoPadrao();
    }
  }
  function salvarEstado() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Falha ao salvar estado:", e);
    }
  }

  let state = carregarEstado();

  /* ---------- lógica de hábitos ---------- */
  function criarHabito(nome, dias, horario) {
    return {
      id: "h_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: nome,
      days: dias, // array de 0-6
      time: horario,
      log: [], // array de datas ISO confirmadas
      streak: 0,
      bestStreak: 0,
      lastCheckedDate: null,
      unlockedBadges: [],
      createdAt: hojeISO(),
    };
  }

  // Retorna as datas (ISO) programadas para o hábito entre duas datas, inclusive
  function datasProgramadasAte(habit, isoFim) {
    const datas = [];
    let cursor = habit.createdAt;
    while (diffDias(isoFim, cursor) >= 0) {
      if (habit.days.includes(diaDaSemana(cursor))) datas.push(cursor);
      cursor = addDias(cursor, 1);
    }
    return datas;
  }

  // Recalcula a sequência atual de um hábito considerando dias programados perdidos
  function recalcularStreak(habit) {
    const hoje = hojeISO();
    if (habit.days.length === 0) {
      habit.streak = habit.log.length > 0 ? habit.streak : 0;
      return;
    }
    const programadas = datasProgramadasAte(habit, hoje);
    let streak = 0;
    // percorre de trás para frente; dia de hoje ainda "não vencido" se não passou
    for (let i = programadas.length - 1; i >= 0; i--) {
      const dia = programadas[i];
      const confirmado = habit.log.includes(dia);
      if (confirmado) {
        streak++;
        continue;
      }
      if (dia === hoje) {
        // hoje ainda pode ser confirmado, não quebra a sequência ainda
        continue;
      }
      break;
    }
    habit.streak = streak;
    if (streak > habit.bestStreak) habit.bestStreak = streak;
  }

  function isProgramadoHoje(habit) {
    if (habit.days.length === 0) return true;
    return habit.days.includes(diaDaSemana(hojeISO()));
  }

  function jaConfirmadoHoje(habit) {
    return habit.log.includes(hojeISO());
  }

  function estaMurcho(habit) {
    if (habit.log.length === 0) return false;
    const hoje = hojeISO();
    const programadas = datasProgramadasAte(habit, hoje);
    // conta quantos dias programados anteriores a hoje foram perdidos consecutivamente
    let perdidos = 0;
    for (let i = programadas.length - 1; i >= 0; i--) {
      const dia = programadas[i];
      if (dia === hoje) continue;
      if (habit.log.includes(dia)) break;
      perdidos++;
      if (perdidos >= 2) return true;
    }
    return false;
  }

  function estagioAtual(habit) {
    const streak = habit.streak;
    let atual = STAGES[0];
    for (const s of STAGES) {
      if (streak >= s.min) atual = s;
    }
    return atual;
  }

  function confirmarHabito(habit) {
    const hoje = hojeISO();
    if (habit.log.includes(hoje)) return { ok: false, motivo: "ja-confirmado" };
    habit.log.push(hoje);
    habit.log.sort();
    recalcularStreak(habit);
    const novasConquistas = verificarConquistas(habit);
    salvarEstado();
    return { ok: true, novasConquistas };
  }

  function verificarConquistas(habit) {
    const novas = [];
    for (const b of BADGES) {
      if (habit.streak >= b.need && !habit.unlockedBadges.includes(b.id)) {
        habit.unlockedBadges.push(b.id);
        novas.push(b);
      }
    }
    return novas;
  }

  function conquistasGlobaisDesbloqueadas() {
    const set = new Set();
    state.habits.forEach((h) => h.unlockedBadges.forEach((id) => set.add(id)));
    return set;
  }

  function removerHabito(id) {
    state.habits = state.habits.filter((h) => h.id !== id);
    salvarEstado();
  }

  function formatarDias(dias) {
    if (!dias || dias.length === 0) return "Todos os dias";
    if (dias.length === 7) return "Todos os dias";
    return dias
      .slice()
      .sort((a, b) => a - b)
      .map((d) => DAY_LABELS[d])
      .join(", ");
  }

  /* ---------- SVGs da planta por estágio ---------- */
  function svgPote() {
    return `
      <path d="M28 118 L34 138 L86 138 L92 118 Z" fill="var(--terracota)"/>
      <rect x="24" y="108" width="72" height="14" rx="4" fill="var(--terracota-soft)"/>
      <ellipse cx="60" cy="108" rx="36" ry="7" fill="var(--verde-900)" opacity="0.12"/>
    `;
  }

  function svgPlanta(stageName, murcho) {
    const corFolha = murcho ? "var(--murcha)" : "var(--verde-600)";
    const corFolha2 = murcho ? "var(--murcha)" : "var(--verde-700)";
    const corCaule = murcho ? "var(--murcha)" : "var(--verde-800)";
    switch (stageName) {
      case "semente":
        return `
          <ellipse cx="60" cy="112" rx="7" ry="9" fill="${corCaule}"/>
          ${svgPote()}
        `;
      case "broto":
        return `
          <path d="M60 112 C60 100 60 96 60 92" stroke="${corCaule}" stroke-width="3" stroke-linecap="round" fill="none"/>
          <path d="M60 98 C50 98 46 92 46 86 C56 86 60 92 60 98 Z" fill="${corFolha}"/>
          <path d="M60 100 C70 100 74 94 74 88 C64 88 60 94 60 100 Z" fill="${corFolha2}"/>
          ${svgPote()}
        `;
      case "muda":
        return `
          <path d="M60 112 C60 92 60 80 60 68" stroke="${corCaule}" stroke-width="3.4" stroke-linecap="round" fill="none"/>
          <path d="M60 90 C46 90 39 80 38 68 C52 68 60 78 60 90 Z" fill="${corFolha}"/>
          <path d="M60 96 C74 96 81 86 82 74 C68 74 60 84 60 96 Z" fill="${corFolha2}"/>
          <path d="M60 76 C52 76 47 69 47 61 C57 61 60 69 60 76 Z" fill="${corFolha}"/>
          ${svgPote()}
        `;
      case "planta jovem":
        return `
          <path d="M60 112 C60 86 60 66 60 48" stroke="${corCaule}" stroke-width="3.8" stroke-linecap="round" fill="none"/>
          <path d="M60 92 C44 92 35 80 34 66 C50 66 60 78 60 92 Z" fill="${corFolha}"/>
          <path d="M60 98 C76 98 85 86 86 72 C70 72 60 84 60 98 Z" fill="${corFolha2}"/>
          <path d="M60 70 C48 70 41 61 40 51 C52 51 60 60 60 70 Z" fill="${corFolha}"/>
          <path d="M60 74 C72 74 79 65 80 55 C68 55 60 64 60 74 Z" fill="${corFolha2}"/>
          <circle cx="60" cy="46" r="5" fill="${murcho ? "var(--murcha)" : "var(--sol-soft)"}"/>
          ${svgPote()}
        `;
      case "planta madura":
        return `
          <path d="M60 112 C60 84 60 60 60 40" stroke="${corCaule}" stroke-width="4.2" stroke-linecap="round" fill="none"/>
          <path d="M60 90 C42 90 31 76 30 60 C48 60 60 74 60 90 Z" fill="${corFolha}"/>
          <path d="M60 96 C78 96 89 82 90 66 C72 66 60 80 60 96 Z" fill="${corFolha2}"/>
          <path d="M60 66 C46 66 38 55 37 43 C51 43 60 54 60 66 Z" fill="${corFolha}"/>
          <path d="M60 70 C74 70 82 59 83 47 C69 47 60 58 60 70 Z" fill="${corFolha2}"/>
          <circle cx="60" cy="38" r="7" fill="${murcho ? "var(--murcha)" : "var(--sol)"}"/>
          <circle cx="52" cy="42" r="4.5" fill="${murcho ? "var(--murcha)" : "var(--sol-soft)"}"/>
          <circle cx="68" cy="42" r="4.5" fill="${murcho ? "var(--murcha)" : "var(--sol-soft)"}"/>
          ${svgPote()}
        `;
      case "florescendo":
      default:
        return `
          <path d="M60 112 C60 80 60 54 60 34" stroke="${corCaule}" stroke-width="4.6" stroke-linecap="round" fill="none"/>
          <path d="M60 88 C40 88 28 72 27 54 C46 54 60 70 60 88 Z" fill="${corFolha}"/>
          <path d="M60 94 C80 94 92 78 93 60 C74 60 60 76 60 94 Z" fill="${corFolha2}"/>
          <path d="M60 62 C44 62 35 50 34 37 C49 37 60 49 60 62 Z" fill="${corFolha}"/>
          <path d="M60 66 C76 66 85 54 86 41 C71 41 60 53 60 66 Z" fill="${corFolha2}"/>
          <g transform="translate(60 30)">
            <circle cx="0" cy="-8" r="6" fill="${murcho ? "var(--murcha)" : "var(--sol)"}"/>
            <circle cx="7" cy="-3" r="6" fill="${murcho ? "var(--murcha)" : "var(--sol)"}"/>
            <circle cx="4" cy="6" r="6" fill="${murcho ? "var(--murcha)" : "var(--sol)"}"/>
            <circle cx="-4" cy="6" r="6" fill="${murcho ? "var(--murcha)" : "var(--sol)"}"/>
            <circle cx="-7" cy="-3" r="6" fill="${murcho ? "var(--murcha)" : "var(--sol)"}"/>
            <circle cx="0" cy="0" r="5" fill="${murcho ? "var(--terracota)" : "var(--terracota)"}"/>
          </g>
          ${svgPote()}
        `;
    }
  }

  /* ---------- referências DOM ---------- */
  const el = {
    tabs: document.querySelectorAll(".tab"),
    views: {
      greenhouse: document.getElementById("view-greenhouse"),
      stats: document.getElementById("view-stats"),
      achievements: document.getElementById("view-achievements"),
    },
    habitForm: document.getElementById("habitForm"),
    habitName: document.getElementById("habitName"),
    habitTime: document.getElementById("habitTime"),
    dayPicker: document.getElementById("dayPicker"),
    formError: document.getElementById("formError"),
    newHabitDetails: document.getElementById("newHabitDetails"),
    greenhouseGrid: document.getElementById("greenhouseGrid"),
    greenhouseEmpty: document.getElementById("greenhouseEmpty"),
    plantCardTemplate: document.getElementById("plantCardTemplate"),
    notifToggle: document.getElementById("notifToggle"),
    toast: document.getElementById("toast"),
    statTotalConfirms: document.getElementById("statTotalConfirms"),
    statBestStreak: document.getElementById("statBestStreak"),
    statConsistency: document.getElementById("statConsistency"),
    statActive: document.getElementById("statActive"),
    heatmap: document.getElementById("heatmap"),
    rankingList: document.getElementById("rankingList"),
    rankingEmpty: document.getElementById("rankingEmpty"),
    badgesGrid: document.getElementById("badgesGrid"),
  };

  let selectedDays = new Set();
  let toastTimer = null;

  /* ---------- navegação por abas ---------- */
  el.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const view = tab.dataset.view;
      el.tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
      Object.entries(el.views).forEach(([key, section]) => {
        section.classList.toggle("is-active", key === view);
      });
      if (view === "stats") renderEstatisticas();
      if (view === "achievements") renderConquistas();
    });
  });

  /* ---------- seletor de dias ---------- */
  el.dayPicker.querySelectorAll(".day-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const dia = Number(chip.dataset.day);
      if (selectedDays.has(dia)) {
        selectedDays.delete(dia);
        chip.classList.remove("is-selected");
      } else {
        selectedDays.add(dia);
        chip.classList.add("is-selected");
      }
    });
  });

  /* ---------- formulário de novo hábito ---------- */
  el.habitForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const nome = el.habitName.value.trim();
    el.formError.textContent = "";

    if (!nome) {
      el.formError.textContent = "Dê um nome para o seu hábito.";
      return;
    }
    if (state.habits.some((h) => h.name.toLowerCase() === nome.toLowerCase())) {
      el.formError.textContent = "Você já tem um hábito com esse nome.";
      return;
    }

    const dias = Array.from(selectedDays);
    const horario = el.habitTime.value || "08:00";
    const novo = criarHabito(nome, dias, horario);
    state.habits.unshift(novo);
    salvarEstado();

    el.habitForm.reset();
    el.habitTime.value = "08:00";
    selectedDays.clear();
    el.dayPicker
      .querySelectorAll(".day-chip")
      .forEach((c) => c.classList.remove("is-selected"));
    el.newHabitDetails.removeAttribute("open");

    renderEstufa();
    mostrarToast(`"${nome}" foi plantado na sua estufa! 🌱`);
  });

  /* ---------- toast ---------- */
  function mostrarToast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.classList.remove("is-visible");
    }, 3200);
  }

  /* ---------- lembretes (Notification API) ---------- */
  el.notifToggle.addEventListener("click", async () => {
    if (!state.remindersOn) {
      if (!("Notification" in window)) {
        mostrarToast("Seu navegador não suporta notificações.");
        return;
      }
      const permissao = await Notification.requestPermission();
      if (permissao === "granted") {
        state.remindersOn = true;
        salvarEstado();
        atualizarBotaoNotif();
        mostrarToast("Lembretes ativados.");
        agendarLembretes();
      } else {
        mostrarToast("Permissão de notificação negada.");
      }
    } else {
      state.remindersOn = false;
      salvarEstado();
      atualizarBotaoNotif();
      mostrarToast("Lembretes desativados.");
    }
  });

  function atualizarBotaoNotif() {
    el.notifToggle.setAttribute("aria-pressed", String(state.remindersOn));
  }

  let lembretesAgendados = [];
  function agendarLembretes() {
    lembretesAgendados.forEach((t) => clearTimeout(t));
    lembretesAgendados = [];
    if (!state.remindersOn || Notification.permission !== "granted") return;
    const agora = new Date();
    state.habits.forEach((habit) => {
      if (!isProgramadoHoje(habit) || jaConfirmadoHoje(habit)) return;
      const [h, m] = (habit.time || "08:00").split(":").map(Number);
      const alvo = new Date();
      alvo.setHours(h, m, 0, 0);
      if (alvo <= agora) return;
      const delay = alvo - agora;
      const timer = setTimeout(() => {
        try {
          new Notification("Semeando Hábitos", {
            body: `Hora de cuidar de "${habit.name}" 🌿`,
          });
        } catch (e) {
          console.error(e);
        }
      }, delay);
      lembretesAgendados.push(timer);
    });
  }

  /* ---------- renderização: estufa ---------- */
  function renderEstufa() {
    state.habits.forEach(recalcularStreak);
    el.greenhouseGrid.innerHTML = "";
    const vazio = state.habits.length === 0;
    el.greenhouseEmpty.hidden = !vazio;
    el.greenhouseGrid.hidden = vazio;

    state.habits.forEach((habit) => {
      const node = el.plantCardTemplate.content.cloneNode(true);
      const card = node.querySelector(".plant-card");
      const murcho = estaMurcho(habit);
      const estagio = murcho ? STAGES[0] : estagioAtual(habit);
      const nomeEstagio = murcho ? "murchando" : estagio.name;

      card.classList.toggle("is-wilted", murcho);
      card.dataset.id = habit.id;

      node.querySelector(".plant-name").textContent = habit.name;
      node.querySelector(".plant-stage-name").textContent = nomeEstagio;
      node.querySelector(".plant-svg").innerHTML = svgPlanta(
        murcho ? "semente" : estagio.name,
        murcho
      );

      const dots = node.querySelectorAll(".progress-dot");
      const preenchidos = Math.min(dots.length, habit.streak);
      dots.forEach((dot, i) => dot.classList.toggle("is-filled", i < preenchidos));

      node.querySelector(".streak-value").textContent = habit.streak;
      node.querySelector(".best-value").textContent = habit.bestStreak;
      node.querySelector(".plant-schedule").textContent = `${formatarDias(
        habit.days
      )} • ${habit.time}`;

      const btnConfirm = node.querySelector(".btn-confirm");
      const confirmadoHoje = jaConfirmadoHoje(habit);
      const programadoHoje = isProgramadoHoje(habit);
      if (confirmadoHoje) {
        btnConfirm.classList.add("is-done");
        btnConfirm.querySelector("span").textContent = "Confirmado hoje ✓";
        btnConfirm.disabled = true;
      } else if (!programadoHoje) {
        btnConfirm.disabled = true;
        btnConfirm.querySelector("span").textContent = "Não programado hoje";
      } else {
        btnConfirm.addEventListener("click", () => {
          const resultado = confirmarHabito(habit);
          if (resultado.ok) {
            renderEstufa();
            mostrarToast(`"${habit.name}" confirmado! Sequência: ${habit.streak} 🌞`);
            if (resultado.novasConquistas && resultado.novasConquistas.length) {
              resultado.novasConquistas.forEach((b) => {
                setTimeout(
                  () => mostrarToast(`Conquista desbloqueada: ${b.name} 🏅`),
                  600
                );
              });
            }
          }
        });
      }

      node.querySelector(".plant-menu-btn").addEventListener("click", () => {
        if (confirm(`Remover o hábito "${habit.name}" da sua estufa?`)) {
          removerHabito(habit.id);
          renderEstufa();
          mostrarToast(`"${habit.name}" foi removido.`);
        }
      });

      el.greenhouseGrid.appendChild(node);
    });

    agendarLembretes();
  }

  /* ---------- renderização: estatísticas ---------- */
  function renderEstatisticas() {
    state.habits.forEach(recalcularStreak);

    const totalConfirms = state.habits.reduce((acc, h) => acc + h.log.length, 0);
    const bestStreak = state.habits.reduce(
      (acc, h) => Math.max(acc, h.bestStreak),
      0
    );

    // consistência: confirmações nos últimos 30 dias / dias programados nos últimos 30 dias
    const hoje = hojeISO();
    let programados30 = 0;
    let feitos30 = 0;
    const inicio30 = addDias(hoje, -29);
    state.habits.forEach((habit) => {
      const programadas = datasProgramadasAte(habit, hoje).filter(
        (d) => diffDias(d, inicio30) >= 0
      );
      programados30 += programadas.length;
      feitos30 += programadas.filter((d) => habit.log.includes(d)).length;
    });
    const consistencia =
      programados30 > 0 ? Math.round((feitos30 / programados30) * 100) : 0;

    el.statTotalConfirms.textContent = totalConfirms;
    el.statBestStreak.textContent = bestStreak;
    el.statConsistency.textContent = `${consistencia}%`;
    el.statActive.textContent = state.habits.length;

    renderHeatmap();
    renderRanking();
  }

  function renderHeatmap() {
    el.heatmap.innerHTML = "";
    const hoje = hojeISO();
    const totalDias = 56; // 8 semanas
    const inicio = addDias(hoje, -(totalDias - 1));

    // alinhar para começar num domingo
    let cursor = inicio;
    while (diaDaSemana(cursor) !== 0) {
      cursor = addDias(cursor, -1);
    }

    const fimIdx = diffDias(hoje, cursor);
    for (let i = 0; i <= fimIdx; i++) {
      const iso = addDias(cursor, i);
      const cell = document.createElement("div");
      cell.className = "heatmap-day";
      if (diffDias(iso, hoje) > 0) {
        cell.style.visibility = "hidden";
      } else {
        const confirmacoes = state.habits.reduce(
          (acc, h) => acc + (h.log.includes(iso) ? 1 : 0),
          0
        );
        let nivel = 0;
        if (confirmacoes >= 1) nivel = 1;
        if (confirmacoes >= 2) nivel = 2;
        if (confirmacoes >= 4) nivel = 3;
        if (confirmacoes >= 6) nivel = 4;
        cell.dataset.level = String(nivel);
        cell.title = `${iso}: ${confirmacoes} confirmação(ões)`;
      }
      el.heatmap.appendChild(cell);
    }
  }

  function renderRanking() {
    const ordenado = [...state.habits].sort((a, b) => b.streak - a.streak);
    el.rankingList.innerHTML = "";
    el.rankingEmpty.hidden = ordenado.length > 0;

    ordenado.forEach((habit, idx) => {
      const li = document.createElement("li");
      li.className = "ranking-item";
      li.innerHTML = `
        <span class="ranking-pos">${idx + 1}</span>
        <span class="ranking-name">${escapeHtml(habit.name)}</span>
        <span class="ranking-streak">${habit.streak} dia${habit.streak === 1 ? "" : "s"}</span>
      `;
      el.rankingList.appendChild(li);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------- renderização: conquistas ---------- */
  function svgMedalha() {
    return `<svg viewBox="0 0 24 24"><path d="M12 3 14.6 8.4 20.5 9.3 16.3 13.4 17.3 19.3 12 16.5 6.7 19.3 7.7 13.4 3.5 9.3 9.4 8.4Z" fill="currentColor"/></svg>`;
  }

  function renderConquistas() {
    const desbloqueadas = conquistasGlobaisDesbloqueadas();
    el.badgesGrid.innerHTML = "";
    BADGES.forEach((b) => {
      const desbloqueada = desbloqueadas.has(b.id);
      const card = document.createElement("div");
      card.className = "badge-card" + (desbloqueada ? "" : " is-locked");
      card.innerHTML = `
        <div class="badge-icon">${svgMedalha()}</div>
        <div class="badge-title">${escapeHtml(b.name)}</div>
        <div class="badge-desc">${escapeHtml(b.desc)}</div>
        <div class="badge-status">${desbloqueada ? "Desbloqueada" : "Bloqueada"}</div>
      `;
      el.badgesGrid.appendChild(card);
    });
  }

  /* ---------- inicialização ---------- */
  function init() {
    atualizarBotaoNotif();
    if (state.habits.length === 0) {
      el.newHabitDetails.setAttribute("open", "");
    }
    renderEstufa();
    renderEstatisticas();
    renderConquistas();

    // reagenda lembretes ao voltar o foco (ex.: virou o dia)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        renderEstufa();
      }
    });
  }

  init();
})();
