try { const saved = localStorage.getItem("state:reader-theme"); if (saved === "light" || saved === "dark") document.documentElement.dataset.theme = saved; } catch {}
