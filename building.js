(() => {
  const params = new URLSearchParams(location.search);
  const id = params.get("id") || "empire";

  const DATA = {
    empire: {
      name: "EMPIRE STATE BUILDING",
      tag: "Midtown · 1931 · Art Deco",
      img: "assets/image/empire.png",
      pool: [
        ["Silhouette", "Setbacks stack upward like a ladder for the sky."],
        ["Spire", "A punctuation mark—thin, sharp, unmistakable."],
        ["Grid", "Tiny windows repeat until the building feels infinite."],
        ["Myth", "More than height: it’s a shortcut to “NYC.”"],
        ["Mood", "At night, color becomes a public signal."],
        ["Distance", "Readable from far away, like a logo."]
      ]
    },
    chrysler: {
      name: "CHRYSLER BUILDING",
      tag: "Midtown · 1930 · Art Deco",
      img: "assets/image/cry.png",
      pool: [
        ["Crown", "A stainless-steel crown that turns light into identity."],
        ["Ornament", "Decoration as power—bold, unapologetic."],
        ["Speed", "Lines that feel like motion frozen in metal."],
        ["Top-heavy", "The skyline remembers the head first."],
        ["Shimmer", "Daylight changes the surface like a mood ring."],
        ["Icon", "One of the most recognizable tops on earth."]
      ]
    },
    oneworld: {
      name: "ONE WORLD TRADE CENTER",
      tag: "Downtown · 2014 · Tallest in the U.S.",
      img: "assets/image/oneworld.png",
      pool: [
        ["Taper", "A calm tower that narrows with intention."],
        ["Glass", "Weather writes new gradients on the facade."],
        ["Spire", "A symbol—more statement than structure."],
        ["Axis", "A vertical anchor for Lower Manhattan."],
        ["Night", "Mass disappears! Edges and reflection remain."],
        ["Resilience", "Built to hold meaning, not just space."]
      ]
    }
  };

  const ORDER = ["empire", "chrysler", "oneworld"];
  const b = DATA[id] || DATA.empire;

  const stage = document.getElementById("stage");
  const totem = document.getElementById("totem");
  const img = document.getElementById("bImg");
  const nameEl = document.getElementById("bName");
  const tagEl = document.getElementById("bTag");

  document.title = b.name;
  img.src = b.img;
  img.alt = b.name;
  nameEl.textContent = b.name;
  tagEl.textContent = b.tag;

  // ---------- helpers ----------
  const rand = (a, b) => Math.random() * (b - a) + a;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  let z = 20;

  function safeArea() {
    // avoid top bar + totem center a bit
    const w = window.innerWidth;
    const h = window.innerHeight;
    return { w, h, top: 84, pad: 18 };
  }

  function spawnFrag(customText) {
    const [k, t] = customText || pick(b.pool);

    const el = document.createElement("div");
    el.className = "frag";
    el.style.setProperty("--r", `${rand(-7, 7).toFixed(2)}deg`);
    el.style.zIndex = (++z).toString();

    el.innerHTML = `
      <div class="frag__k">${k}</div>
      <div class="frag__t">${t}</div>
      <div class="frag__meta">drag this</div>
    `;

    stage.appendChild(el);

    // random placement (avoid totem zone roughly)
    const { w, h, top, pad } = safeArea();
    const rectW = Math.min(360, w * 0.7);
    const rectH = 120;

    let x, y;
    let tries = 0;
    do {
      x = rand(pad, w - rectW - pad);
      y = rand(top, h - rectH - pad);
      tries++;
      // avoid center zone (totem area)
      const cx = w * 0.5;
      const cy = h * 0.52;
      const dx = Math.abs((x + rectW / 2) - cx);
      const dy = Math.abs((y + rectH / 2) - cy);
      if (dx > 200 || dy > 160) break;
    } while (tries < 25);

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    // bring to front on pointer down
    el.addEventListener("pointerdown", () => {
      el.style.zIndex = (++z).toString();
    });

    // click -> spawn another (non-linear chain)
    el.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      spawnFrag();
    });

    makeDraggable(el);
  }

  function shuffleAll() {
    document.querySelectorAll(".frag").forEach((el) => {
      el.style.setProperty("--r", `${rand(-9, 9).toFixed(2)}deg`);
      el.style.zIndex = (++z).toString();
      // re-place
      const { w, h, top, pad } = safeArea();
      const rectW = Math.min(360, w * 0.7);
      const rectH = 120;
      el.style.left = `${rand(pad, w - rectW - pad)}px`;
      el.style.top = `${rand(top, h - rectH - pad)}px`;
    });
  }

  function goRandom() {
    const rid = pick(ORDER);
    location.href = `building.html?id=${encodeURIComponent(rid)}`;
  }

  // ---------- drag ----------
  function makeDraggable(el) {
    let startX = 0, startY = 0, origX = 0, origY = 0, dragging = false;

    el.addEventListener("pointerdown", (e) => {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      origX = parseFloat(el.style.left || "0");
      origY = parseFloat(el.style.top || "0");
    });

    el.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      el.style.left = `${origX + dx}px`;
      el.style.top = `${origY + dy}px`;
    });

    el.addEventListener("pointerup", () => {
      dragging = false;
    });

    el.addEventListener("pointercancel", () => {
      dragging = false;
    });
  }

  // ---------- buttons ----------
  document.getElementById("btnSpawn").addEventListener("click", () => spawnFrag());
  document.getElementById("btnShuffle").addEventListener("click", shuffleAll);
  document.getElementById("btnRandom").addEventListener("click", goRandom);

  // stage click: spawn too (optional vibe)
  stage.addEventListener("dblclick", () => spawnFrag());

  // initial fragments (enough to feel alive)
  const initial = window.innerWidth < 820 ? 5 : 8;
  for (let i = 0; i < initial; i++) spawnFrag();

  // keep layout sane on resize
  window.addEventListener("resize", () => {
    // don’t destroy positions, just gently shuffle to avoid off-screen
    shuffleAll();
  });

  // totem double click -> random building (fun easter)
  totem.addEventListener("dblclick", goRandom);
})();

let magnetOn = false;

function magnet(){
  magnetOn = !magnetOn;

  const t = totem.getBoundingClientRect();
  const cx = t.left + t.width / 2;
  const cy = t.top + t.height / 2;

  const frags = Array.from(document.querySelectorAll(".frag"));

  if (!magnetOn) {
    // 다시 흩뿌리기(셔플)
    shuffleAll();
    return;
  }

  // 조각들을 “궤도”처럼 둘러 배치
  const radiusX = Math.min(window.innerWidth * 0.33, 320);
  const radiusY = Math.min(window.innerHeight * 0.26, 220);

  frags.forEach((el, i) => {
    const angle = (i / frags.length) * Math.PI * 2;

    const rect = el.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const x = cx + Math.cos(angle) * radiusX - w / 2;
    const y = cy + Math.sin(angle) * radiusY - h / 2;

    el.style.left = `${Math.max(12, Math.min(x, window.innerWidth - w - 12))}px`;
    el.style.top  = `${Math.max(84, Math.min(y, window.innerHeight - h - 12))}px`;

    // 살짝 정렬되는 느낌(회전도 줄임)
    el.style.setProperty("--r", `${rand(-2, 2).toFixed(2)}deg`);
    el.style.zIndex = (++z).toString();
  });
}

document.getElementById("btnMagnet").addEventListener("click", magnet);

// =====================================
// Dynamic Background: Time + Weather
// - Uses geolocation if allowed
// - Falls back to NYC if denied
// - Weather API: Open-Meteo (no key)
// =====================================

function setTimeTheme(date = new Date()){
  const h = date.getHours(); // local time
  const body = document.body;

  body.classList.remove("time-morning","time-day","time-sunset","time-night");

  // 너 감성에 맞게 구간 조절 가능
  if (h >= 6 && h < 10) body.classList.add("time-morning");
  else if (h >= 10 && h < 17) body.classList.add("time-day");
  else if (h >= 17 && h < 20) body.classList.add("time-sunset");
  else body.classList.add("time-night");
}

function setWeatherTheme(kind){
  const body = document.body;
  body.classList.remove("weather-clear","weather-cloudy","weather-rain","weather-snow","weather-fog");

  // clear는 굳이 class 안 줘도 되지만 구분하고 싶으면 추가 가능
  if (kind) body.classList.add(`weather-${kind}`);
}

// Open-Meteo weathercode -> simple buckets
function weatherCodeToKind(code){
  // refs: Open-Meteo weather codes
  // clear
  if (code === 0) return "clear";

  // cloudy / overcast
  if (code === 1 || code === 2 || code === 3) return "cloudy";

  // fog
  if (code === 45 || code === 48) return "fog";

  // drizzle / rain / thunderstorms
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code)) return "rain";

  // snow
  if ([71,73,75,77,85,86].includes(code)) return "snow";

  return "cloudy";
}

async function fetchWeather(lat, lon){
  // current_weather=true gives weathercode + temperature etc.
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();
  const code = data?.current_weather?.weathercode;
  return { code };
}

async function applyDynamicSky(){
  // 1) time
  setTimeTheme();

  // 2) weather
  const NYC = { lat: 40.7128, lon: -74.0060 };

  const onSuccess = async (pos) => {
    try{
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const w = await fetchWeather(lat, lon);
      const kind = weatherCodeToKind(w.code);
      setWeatherTheme(kind === "clear" ? "" : kind);
    }catch(e){
      // fallback to NYC
      try{
        const w = await fetchWeather(NYC.lat, NYC.lon);
        const kind = weatherCodeToKind(w.code);
        setWeatherTheme(kind === "clear" ? "" : kind);
      }catch(_){
        // final fallback: nothing
      }
    }
  };

  const onFail = async () => {
    // no location permission -> NYC
    try{
      const w = await fetchWeather(NYC.lat, NYC.lon);
      const kind = weatherCodeToKind(w.code);
      setWeatherTheme(kind === "clear" ? "" : kind);
    }catch(_){}
  };

  if ("geolocation" in navigator){
    navigator.geolocation.getCurrentPosition(onSuccess, onFail, {
      enableHighAccuracy: false,
      timeout: 4000,
      maximumAge: 10 * 60 * 1000
    });
  }else{
    onFail();
  }

  // time theme update every 5 minutes
  setInterval(() => setTimeTheme(), 5 * 60 * 1000);
}

applyDynamicSky();
const fx = document.getElementById("weatherFx");

let rainTimer = null;
let rainBurstTimer = null;

function clearFx(){
  if (!fx) return;
  fx.innerHTML = "";

  if (rainTimer) { clearInterval(rainTimer); rainTimer = null; }
  if (rainBurstTimer) { clearInterval(rainBurstTimer); rainBurstTimer = null; }
}

function spawnClouds(count = 18){
  clearFx();

  const w = window.innerWidth;
  const h = window.innerHeight;

  for (let i = 0; i < count; i++){
    const c = document.createElement("div");
    c.className = "fx-cloud";

    // 큰 구름 + 랜덤 스케일
    const scale = (Math.random() * 0.9 + 0.9); // 0.9 ~ 1.8
    const cw = 180 * scale;
    const ch = 68 * scale;

    c.style.width = `${cw}px`;
    c.style.height = `${ch}px`;
    c.style.top = `${Math.random() * 78}%`;
    c.style.left = `${-250 - Math.random() * 600}px`;
    c.style.opacity = `${0.75 + Math.random() * 0.2}`;

    const dur = 26 + Math.random() * 70; // 다양하게
    const delay = -Math.random() * dur;
    c.style.animationDuration = `${dur}s`;
    c.style.animationDelay = `${delay}s`;

    fx.appendChild(c);
  }
}

function spawnRain(){
  clearFx();

  const makeDrop = () => {
    const d = document.createElement("div");
    d.className = "rain-drop";

    // 랜덤 굵기/길이
    const r = Math.random();
    if (r > 0.85) d.classList.add("thick");
    else if (r < 0.25) d.classList.add("thin");

    // 랜덤 x 위치
    d.style.left = `${Math.random() * 100}%`;

    // 속도 랜덤 (빠르고 툭툭 떨어지는 느낌)
    const dur = 0.55 + Math.random() * 0.65; // 0.55~1.2s
    d.style.animationDuration = `${dur}s`;

    // 약간의 기울기(바람 느낌) — 너무 과하면 별로라서 살짝만
    const tilt = (Math.random() * 6 - 3); // -3~3deg
    d.style.transform = `rotate(${tilt}deg)`;

    fx.appendChild(d);

    // 끝나면 제거
    d.addEventListener("animationend", () => d.remove());
  };

  // 계속 뿌리기: 기본 레인
  rainTimer = setInterval(() => {
    // 한 번에 여러 개 떨어져야 “툭두둑”
    const burst = 6 + Math.floor(Math.random() * 10);
    for (let i = 0; i < burst; i++) makeDrop();
  }, 120);

  // 가끔 더 큰 소나기 같은 “툭!” 덩어리
  rainBurstTimer = setInterval(() => {
    const burst = 25 + Math.floor(Math.random() * 30);
    for (let i = 0; i < burst; i++) makeDrop();
  }, 1200);
}

function spawnFog(){
  clearFx();

  const f1 = document.createElement("div");
  f1.className = "fog";
  const f2 = document.createElement("div");
  f2.className = "fog fog--2";

  fx.appendChild(f1);
  fx.appendChild(f2);
}
