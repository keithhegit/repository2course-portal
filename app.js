const MANIFEST_URLS = [
  "./courses-manifest.json",
  "https://raw.githubusercontent.com/keithhegit/repository2course/main/courses-manifest.json",
  "https://cdn.jsdelivr.net/gh/keithhegit/repository2course@main/courses-manifest.json",
];

let allCourses = [];

function fmtTime(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

function render(courses) {
  const list = document.getElementById("list");
  const empty = document.getElementById("empty");
  list.innerHTML = "";
  if (!courses.length) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  for (const c of courses) {
    const courseUrl =
      c.course_url ||
      `https://keithhegit.github.io/repository2course/${c.slug}/index.html`;
    const filesUrl =
      c.github_tree_url ||
      `https://github.com/keithhegit/repository2course/tree/main/${c.slug}`;
      
    let shortTitle = c.slug;
    if (c.repo) {
      try {
        const url = new URL(c.repo);
        const isGithubRepo = /(^|\.)github\.com$/i.test(url.hostname);
        const parts = url.pathname.split('/').filter(Boolean);
        if (isGithubRepo && parts.length >= 2) {
          shortTitle = `${parts[0]}/${parts[1]}`;
        } else if (c.title) {
          shortTitle = c.title.replace(/\s*互动拆解课\s*$/, "");
        }
      } catch (e) {}
    }

    const li = document.createElement("li");
    li.className = "course-item";
    li.innerHTML = `
      <h3>${shortTitle}</h3>
      <div class="meta-row">
        <span class="category-badge">${c.category || "other-tools"}</span>
      </div>
      <div class="description">${c.description || c.slug}</div>
      <div class="links">
        <a href="${c.repo}" target="_blank" rel="noopener" title="Source Repo">
          <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.22.49-2.69-1.07-2.69-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.81.06 1.23.83 1.23.83.72 1.24 1.89.88 2.35.67.07-.52.28-.88.5-1.08-1.77-.2-3.64-.89-3.64-3.95 0-.87.31-1.58.82-2.14-.08-.2-.36-1.01.08-2.1 0 0 .67-.21 2.2.82A7.6 7.6 0 018 3.8c.68 0 1.36.09 2 .26 1.53-1.03 2.2-.82 2.2-.82.44 1.09.16 1.9.08 2.1.51.56.82 1.27.82 2.14 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.14.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
        </a>
        <a href="${courseUrl}" target="_blank" rel="noopener" title="Course Page">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
        </a>
        <a href="${filesUrl}" target="_blank" rel="noopener" title="Course Files">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        </a>
      </div>
      <div class="slug" style="margin-top: auto; padding-top: 12px; font-size: 11px;">updated: ${fmtTime(c.updated_at)}</div>
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
    `${c.title} ${c.slug} ${c.repo} ${c.category || ""} ${c.description || ""}`.toLowerCase().includes(q)
  );
  render(filtered);
}

async function loadManifest() {
  const sourceEl = document.getElementById("manifest-source");
  const updatedEl = document.getElementById("manifest-updated");
  const countEl = document.getElementById("manifest-count");

  sourceEl.textContent = `manifest: loading...`;
  updatedEl.textContent = "loading...";
  countEl.textContent = "";

  let payload = null;
  let loadedFrom = "";
  let lastErr = "";
  for (const url of MANIFEST_URLS) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status}`);
      const candidate = await res.json();
      const arr = Array.isArray(candidate.courses) ? candidate.courses : [];
      if (!arr.length) throw new Error("empty courses");
      payload = candidate;
      loadedFrom = url;
      break;
    } catch (e) {
      lastErr = `${url}: ${e.message}`;
    }
  }
  if (!payload) throw new Error(`all manifest sources failed, last: ${lastErr}`);
  allCourses = payload.courses;

  sourceEl.textContent = `manifest: ${loadedFrom}`;
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
