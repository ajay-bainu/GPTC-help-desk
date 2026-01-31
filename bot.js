(function () {
  const chat = document.getElementById("chat");
  const form = document.getElementById("chatForm");
  const msg = document.getElementById("msg");
  const clearBtn = document.getElementById("clearBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // Session guard
  const sessionRaw = localStorage.getItem("session_user");
  if (!sessionRaw) window.location.href = "index.html";
  const session = JSON.parse(sessionRaw);

  const BOT_NAME = "College Staff";
  const BOT_STYLE = {
    intro:
      `ഹായ് ${session.name || ""} 👋\nഞാൻ GPTC helpdesk staff ആയി pretend ചെയ്യുന്ന bot ആണ്.\nCollege related doubts ചോദിക്കൂ — timings, departments, admission, contacts, etc.`,
    fallback:
      "ഇത് currently എന്റെ knowledge-base-ൽ ഇല്ല 😅\nനിങ്ങൾ data.js file-ൽ info add ചെയ്താൽ ഞാൻ super confidently reply ചെയ്യും.\nTry keywords: principal, office time, departments, admission, contact."
  };

  function nowTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function addBubble(text, who) {
    const b = document.createElement("div");
    b.className = `bubble ${who}`;
    b.textContent = text;

    const m = document.createElement("div");
    m.className = "meta";
    m.textContent = `${who === "me" ? "You" : BOT_NAME} • ${nowTime()}`;

    const wrap = document.createElement("div");
    wrap.appendChild(b);
    wrap.appendChild(m);

    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.alignItems = who === "me" ? "flex-end" : "flex-start";

    chat.appendChild(wrap);
    chat.scrollTop = chat.scrollHeight;
  }

  // Simple keyword scoring
  function bestMatchAnswer(userText) {
    const text = userText.toLowerCase();

    // exact-ish patterns
    const kb = window.COLLEGE_KB || [];
    let best = null;
    let bestScore = 0;

    for (const item of kb) {
      const tags = (item.tags || []).map(t => t.toLowerCase());
      let score = 0;

      for (const t of tags) {
        if (text.includes(t)) score += 3;
      }

      // bonus if question words overlap
      const qWords = (item.q || "").toLowerCase().split(/\s+/);
      for (const w of qWords) {
        if (w.length >= 4 && text.includes(w)) score += 1;
      }

      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }

    if (!best || bestScore < 2) return null;
    return best.a;
  }

  // Boot message
  addBubble(BOT_STYLE.intro, "bot");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const userText = msg.value.trim();
    if (!userText) return;

    addBubble(userText, "me");
    msg.value = "";

    // “employee” tone wrapper
    const answer = bestMatchAnswer(userText);
    const staffy =
      answer
        ? `Sure ✅\n${answer}\n\nAnything else?`
        : BOT_STYLE.fallback;

    // little delay for realism
    setTimeout(() => addBubble(staffy, "bot"), 350);
  });

  clearBtn.addEventListener("click", () => {
    chat.innerHTML = "";
    addBubble(BOT_STYLE.intro, "bot");
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("session_user");
    window.location.href = "index.html";
  });
})();
