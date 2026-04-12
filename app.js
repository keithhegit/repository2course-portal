const MANIFEST_URL =
  "https://raw.githubusercontent.com/keithhegit/repository2course/main/courses-manifest.json";

let allCourses = [];

function fmtTime(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

function render(courses) {
  const list = document.getElementById("course-list");
  const empty = document.getElementById("empty");
  list.innerHTML = "";
  if (!courses.length) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  for (const c of courses) {
    const li = document.createElement("li");
    li.className = "course-item";
    li.innerHTML = `
      <h3>${c.title || c.slug}</h3>
      <div class="slug">${c.slug}</div>
      <div class="links">
        <a href="${c.repo}" target="_blank" rel="noopener">Source Repo</a>
        <a href="${c.path || "#"}" target="_blank" rel="noopener">Course Page</a>
      </div>
      <div class="slug">updated: ${fmtTime(c.updated_at)}</div>
    `;
    list.appendChild(li);
  }
}

function applyFilter() {
  const q = document.getElementById("q").value.trim().toLowerCase();
  if (!q) {
    render(allCourses);
    return;
  }
  const filtered = allCourses.filter((c) =>
    `${c.title} ${c.slug} ${c.repo}`.toLowerCase().includes(q)
  );
  render(filtered);
}

async function loadManifest() {
  const sourceEl = document.getElementById("manifest-source");
  const updatedEl = document.getElementById("manifest-updated");
  const countEl = document.getElementById("manifest-count");

  sourceEl.textContent = `manifest: ${MANIFEST_URL}`;
  updatedEl.textContent = "loading...";
  countEl.textContent = "";

  const res = await fetch(MANIFEST_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`manifest fetch failed: ${res.status}`);
  const payload = await res.json();
  allCourses = Array.isArray(payload.courses) ? payload.courses : [];

  updatedEl.textContent = `generated_at: ${fmtTime(payload.generated_at)}`;
  countEl.textContent = `count: ${allCourses.length}`;
  render(allCourses);
}

async function boot() {
  try {
    await loadManifest();
  } catch (e) {
    document.getElementById("manifest-updated").textContent = `error: ${e.message}`;
  }
  document.getElementById("q").addEventListener("input", applyFilter);
  document.getElementById("reload").addEventListener("click", () => loadManifest());
}

boot();
