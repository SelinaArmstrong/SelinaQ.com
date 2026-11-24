/* TEMPORARY — palette chooser. Delete this file, its <script> tag in
   index.html and the PALETTE LAB block in styles.css once a scheme wins. */
(() => {
  const LAB_SCHEMES = [
    ["", "Gold"],
    ["jade", "Jade"],
    ["platinum", "Platinum"],
    ["terracotta", "Terracotta"],
    ["petrol", "Petrol"],
  ];
  const lab = document.createElement("div");
  lab.className = "palette-lab";
  lab.innerHTML = "<b>Palette</b>";
  const fromUrl = new URLSearchParams(location.search).get("palette");
  const saved = fromUrl !== null ? fromUrl : (localStorage.getItem("palette") || "");
  const apply = (value) => {
    if (value) document.documentElement.dataset.palette = value;
    else delete document.documentElement.dataset.palette;
    localStorage.setItem("palette", value);
    lab.querySelectorAll("button").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.value === value)));
  };
  for (const [value, label] of LAB_SCHEMES) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.value = value;
    b.textContent = label;
    b.addEventListener("click", () => apply(value));
    lab.append(b);
  }
  document.body.append(lab);
  apply(saved);
})();
