import {
  fictional,
  encryptDocument,
  decryptDocument,
  disclosure,
  reviewedCheckpoint,
} from "./vault.mjs";
let current = null,
  envelope = null;
const $ = (id) => document.getElementById(id),
  key = "portable-state:synthetic:v1";
const message = $("message");
const showMessage = (e) =>
  (message.textContent = e instanceof Error ? e.message : String(e));
function preview() {
  const ids = Array.from(
    document.querySelectorAll("#memories input:checked"),
  ).map((c) => c.value);
  $("disclosure-preview").textContent = current
    ? JSON.stringify(disclosure(current, ids), null, 2)
    : "Unlock a fictional fixture to inspect a disclosure.";
  $("consent").checked = false;
}
$("memories").onchange = preview;
function render() {
  for (const id of ["memories", "perspectives", "checkpoints"])
    $(id).replaceChildren();
  $("profile-title").textContent =
    current?.profile.name ?? "A locked workspace.";
  $("identity").textContent =
    current?.profile.identity ??
    "Open the synthetic fixture or import your encrypted demo file.";
  if (!current) {
    preview();
    return;
  }
  for (const m of current.memories) {
    const label = document.createElement("label");
    label.className = "memory";
    const check = document.createElement("input");
    check.type = "checkbox";
    check.value = m.id;
    const content = document.createElement("span"),
      title = document.createElement("strong"),
      text = document.createElement("p"),
      source = document.createElement("small");
    title.textContent = m.subject;
    text.textContent = m.text;
    source.textContent = m.source + " · " + m.confidence;
    content.append(title, text, source);
    label.append(check, content);
    $("memories").append(label);
  }
  for (const p of current.perspectives) {
    const el = document.createElement("p");
    el.textContent = p.role + ": " + p.view;
    $("perspectives").append(el);
  }
  for (const p of current.checkpoints) {
    const el = document.createElement("p");
    el.textContent = p.status + ": " + p.text;
    $("checkpoints").append(el);
  }
  preview();
}
async function bounded(action) {
  const buttons = Array.from(document.querySelectorAll("button"));
  buttons.forEach((b) => (b.disabled = true));
  try {
    await action();
  } catch (e) {
    showMessage(e);
  } finally {
    buttons.forEach((b) => (b.disabled = false));
  }
}
$("fixture").onclick = () => {
  current = structuredClone(fictional);
  render();
  showMessage("Fictional fixture loaded locally. No real personal records.");
};
$("lock").onclick = () => {
  current = null;
  $("passphrase").value = "";
  $("checkpoint").value = "";
  $("consent").checked = false;
  render();
  showMessage(
    "View locked and plaintext references cleared. JavaScript/OS memory erasure is not guaranteed.",
  );
};
$("encrypt").onclick = () =>
  bounded(async () => {
    if (!current) throw new Error("Open a fictional document first.");
    envelope = await encryptDocument(current, $("passphrase").value);
    const blob = new Blob([JSON.stringify(envelope, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "mira-vale.state.enc.json";
    a.click();
    URL.revokeObjectURL(url);
    if ($("remember").checked)
      localStorage.setItem(key, JSON.stringify(envelope));
    $("passphrase").value = "";
    showMessage(
      "Encrypted export downloaded. Keep its passphrase separately. Only ciphertext can be saved.",
    );
  });
$("import").onchange = () =>
  bounded(async () => {
    const f = $("import").files[0];
    if (!f) return;
    if (f.size > 200000)
      throw new Error("Use an encrypted envelope under 200 KB.");
    envelope = JSON.parse(await f.text());
    current = null;
    render();
    showMessage(
      "Encrypted file loaded. Enter its demo passphrase to unlock; no file was uploaded.",
    );
  });
$("unlock").onclick = () =>
  bounded(async () => {
    if (!envelope) throw new Error("Import or resume an encrypted file first.");
    current = await decryptDocument(envelope, $("passphrase").value);
    $("passphrase").value = "";
    render();
    showMessage("Fictional profile unlocked locally. Nothing was disclosed.");
  });
$("forget").onclick = () => {
  localStorage.removeItem(key);
  envelope = null;
  showMessage(
    "Saved ciphertext removed. Existing downloaded exports remain yours.",
  );
};
$("copy").onclick = () =>
  bounded(async () => {
    if (!current || !$("consent").checked)
      throw new Error(
        "Review the selected context and explicitly approve disclosure.",
      );
    const ids = Array.from(
      document.querySelectorAll("#memories input:checked"),
    ).map((c) => c.value);
    if (!ids.length) throw new Error("Select at least one fictional memory.");
    await navigator.clipboard.writeText(
      JSON.stringify(disclosure(current, ids), null, 2),
    );
    $("consent").checked = false;
    showMessage(
      "Reviewed fictional context copied. No passphrase or full vault is included.",
    );
  });
$("checkpoint-save").onclick = () => {
  try {
    if (!current) throw new Error("Unlock a fictional profile first.");
    current = reviewedCheckpoint(current, $("checkpoint").value);
    $("checkpoint").value = "";
    render();
    showMessage(
      "Reviewed checkpoint added in memory. Encrypt again to retain it.",
    );
  } catch (e) {
    showMessage(e);
  }
};
try {
  const saved = localStorage.getItem(key);
  if (saved) {
    envelope = JSON.parse(saved);
    showMessage(
      "Saved ciphertext resumed. Enter its demo passphrase to unlock.",
    );
  }
} catch {
  showMessage(
    "Saved ciphertext is unreadable. The original has not been changed.",
  );
}
render();
