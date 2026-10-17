// Generated from checked TypeScript; edit the corresponding .ts/.mts source. MIT.
import { fictional, encryptDocument, decryptDocument, disclosure, reviewedCheckpoint, } from "./vault.mjs";
let current = null;
let envelope = null;
let busy = false, savedCopy = false;
const key = "portable-state:synthetic:v1";
function $(id) {
    const element = document.getElementById(id);
    if (!element)
        throw Error("Missing interface element: " + id);
    return element;
}
function input(id) {
    const element = $(id);
    if (!(element instanceof HTMLInputElement))
        throw Error("Expected input: " + id);
    return element;
}
function button(id) {
    const element = $(id);
    if (!(element instanceof HTMLButtonElement))
        throw Error("Expected button: " + id);
    return element;
}
function textarea(id) {
    const element = $(id);
    if (!(element instanceof HTMLTextAreaElement))
        throw Error("Expected textarea: " + id);
    return element;
}
const selected = () => [
    ...document.querySelectorAll("#memories input:checked"),
].map((c) => c.value);
function showMessage(value, scope) {
    const text = value instanceof Error ? value.message : String(value);
    $("message").textContent = text;
    if (scope)
        $(scope + "-feedback").textContent = text;
}
function syncControls() {
    const count = selected().length, phrase = input("passphrase").value;
    button("fixture").disabled = busy;
    button("lock").disabled = busy || !current;
    input("passphrase").disabled = busy || (!current && !envelope);
    input("remember").disabled = busy || !current;
    input("import").disabled = busy;
    button("unlock").disabled = busy || !envelope || phrase.length < 16;
    button("encrypt").disabled = busy || !current || phrase.length < 16;
    button("forget").disabled = busy || !savedCopy;
    input("consent").disabled = busy || !current || !count;
    button("copy").disabled =
        busy || !current || !count || !input("consent").checked;
    textarea("checkpoint").disabled = busy || !current;
    button("checkpoint-save").disabled =
        busy || !current || !textarea("checkpoint").value.trim();
    for (const input of document.querySelectorAll("#memories input"))
        input.disabled = busy;
}
function preview() {
    const ids = selected();
    $("selection-count").textContent = ids.length
        ? `${ids.length} ${ids.length === 1 ? "memory" : "memories"} selected`
        : "No memories selected";
    $("selection-help").textContent = ids.length
        ? "This is the complete text that will go to your clipboard."
        : "The exact text you approve appears here.";
    $("disclosure-preview").textContent =
        current && ids.length
            ? JSON.stringify(disclosure(current, ids), null, 2)
            : "Your selection will appear here.";
    input("consent").checked = false;
    $("share-feedback").textContent =
        "The encrypted file and passphrase are never included.";
    syncControls();
}
$("memories").onchange = preview;
input("passphrase").oninput = syncControls;
textarea("checkpoint").oninput = syncControls;
input("consent").onchange = syncControls;
function render() {
    for (const id of ["memories", "perspectives", "checkpoints"])
        $(id).replaceChildren();
    $("profile-title").textContent = current?.profile.name ?? "Start with Mira.";
    $("identity").textContent =
        current?.profile.identity ??
            "Open the example to read three invented memories. Nothing is shared automatically.";
    if (!current) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent =
            "Open Mira’s example above, or reopen a saved example file below.";
        $("memories").append(empty);
        const hint = document.createElement("p");
        hint.textContent =
            "Open the example to read the teacher, visitor and archivist’s views.";
        $("perspectives").append(hint);
        preview();
        return;
    }
    for (const m of current.memories) {
        const label = document.createElement("label");
        label.className = "memory";
        const check = document.createElement("input");
        check.type = "checkbox";
        check.value = m.id;
        const content = document.createElement("span"), title = document.createElement("strong"), text = document.createElement("p"), source = document.createElement("small");
        title.textContent = m.subject;
        text.textContent = m.text;
        source.textContent =
            m.source +
                " · " +
                (m.confidence === "open" ? "Still undecided" : "Invented detail");
        content.append(title, text, source);
        label.append(check, content);
        $("memories").append(label);
    }
    for (const p of current.perspectives) {
        const el = document.createElement("p"), name = document.createElement("strong");
        name.textContent = p.role + ". ";
        el.append(name, document.createTextNode(p.view));
        $("perspectives").append(el);
    }
    for (const p of current.checkpoints) {
        const el = document.createElement("p");
        el.textContent = "Reviewed here: " + p.text;
        $("checkpoints").append(el);
    }
    preview();
}
async function bounded(action, scope = "file") {
    if (busy)
        return;
    busy = true;
    syncControls();
    $("main").setAttribute("aria-busy", "true");
    showMessage(scope === "share"
        ? "Copying your reviewed selection…"
        : "Working in this browser…", scope);
    try {
        await action();
    }
    catch (e) {
        showMessage(e, scope);
    }
    finally {
        busy = false;
        $("main").removeAttribute("aria-busy");
        syncControls();
    }
}
button("fixture").onclick = () => {
    current = structuredClone(fictional);
    textarea("checkpoint").value = "";
    render();
    showMessage("Mira’s example is open. Choose a memory below; nothing has been shared.");
};
button("lock").onclick = () => {
    current = null;
    input("passphrase").value = "";
    textarea("checkpoint").value = "";
    render();
    showMessage("The profile is closed and this view is cleared. Your encrypted file can be reopened below. Browser memory erasure cannot be guaranteed.");
};
button("encrypt").onclick = () => bounded(async () => {
    if (!current)
        throw new Error("Open Mira’s example first.");
    envelope = await encryptDocument(current, input("passphrase").value);
    const blob = new Blob([JSON.stringify(envelope, null, 2)], {
        type: "application/json",
    }), url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url;
    a.download = "mira-vale.state.enc.json";
    a.click();
    URL.revokeObjectURL(url);
    input("passphrase").value = "";
    if (input("remember").checked) {
        try {
            localStorage.setItem(key, JSON.stringify(envelope));
            savedCopy = true;
        }
        catch {
            showMessage("The encrypted file was downloaded, but this browser could not keep a saved copy. Keep the download and its passphrase separately.", "file");
            return;
        }
    }
    showMessage("Encrypted file downloaded. Keep the passphrase separately. Close the profile, then try reopening your file.", "file");
});
input("import").onchange = () => bounded(async () => {
    const f = input("import").files?.[0];
    if (!f)
        return;
    if (f.size > 200000)
        throw new Error("Choose an encrypted example file smaller than 200 KB.");
    const imported = JSON.parse(await f.text());
    envelope = imported;
    current = null;
    input("passphrase").value = "";
    textarea("checkpoint").value = "";
    render();
    showMessage("File opened in this browser. Enter its original passphrase, then choose Reopen encrypted profile. Nothing was uploaded.", "file");
});
button("unlock").onclick = () => bounded(async () => {
    if (!envelope)
        throw new Error("Choose an encrypted example file first.");
    current = await decryptDocument(envelope, input("passphrase").value);
    input("passphrase").value = "";
    render();
    showMessage("Mira’s profile is open again. Choose memories above to copy; nothing has been shared.", "file");
});
button("forget").onclick = () => {
    try {
        localStorage.removeItem(key);
        savedCopy = false;
        syncControls();
        showMessage("Saved copy removed from this device. Your open profile and downloaded files are unchanged.", "file");
    }
    catch {
        showMessage("This browser could not remove the saved copy. Check its storage settings and try again.", "file");
    }
};
button("copy").onclick = () => bounded(async () => {
    if (!current || !input("consent").checked || !selected().length)
        throw new Error("Select a memory and approve the exact text before copying.");
    await navigator.clipboard.writeText(JSON.stringify(disclosure(current, selected()), null, 2));
    input("consent").checked = false;
    showMessage("Selection copied. Paste it into an assistant if you want to share it. No passphrase, encrypted file or unselected memories are included.", "share");
}, "share");
button("checkpoint-save").onclick = () => {
    try {
        if (!current)
            throw new Error("Open Mira’s example first.");
        current = reviewedCheckpoint(current, textarea("checkpoint").value);
        textarea("checkpoint").value = "";
        render();
        showMessage("Note added to the open profile. Encrypt and download again to keep it.", "file");
    }
    catch (e) {
        showMessage(e, "file");
    }
};
try {
    const saved = localStorage.getItem(key);
    savedCopy = Boolean(saved);
    if (saved) {
        envelope = JSON.parse(saved);
        showMessage("An encrypted copy is saved on this device. Enter its passphrase below to reopen it.", "file");
    }
}
catch {
    showMessage("The saved copy could not be read. It has not been changed; you can choose a downloaded file instead.", "file");
}
render();
