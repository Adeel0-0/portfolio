const form = document.querySelector<HTMLFormElement>("#project-filter");
const select = document.querySelector<HTMLSelectElement>("#skill-filter");
if (form && select) {
  form.hidden = false;
  const cards = [...document.querySelectorAll<HTMLElement>("[data-project]")];
  const apply = () => {
    let count = 0;
    cards.forEach((card) => {
      const matches =
        !select.value ||
        (JSON.parse(card.dataset.skills || "[]") as string[]).includes(
          select.value,
        );
      card.hidden = !matches;
      if (matches) count++;
    });
    const status = document.querySelector("#filter-status");
    if (status)
      status.textContent = `${count} project${count === 1 ? "" : "s"}`;
    const empty = document.querySelector<HTMLElement>("#filter-empty");
    if (empty) empty.hidden = count !== 0;
  };
  const linked = JSON.parse(select.dataset.linkedSkills || "[]") as string[];
  // The server-rendered options only list skills used by a published project,
  // but the home page also links skills with none yet. The owner chose to keep
  // those links and show the honest empty state rather than every project.
  const selectRequestedSkill = (requested: string) => {
    if (![...select.options].some((option) => option.value === requested)) {
      if (linked.includes(requested)) {
        const option = document.createElement("option");
        option.value = requested;
        option.textContent = requested;
        select.appendChild(option);
      } else {
        return;
      }
    }
    select.value = requested;
  };
  const initial = new URL(location.href).searchParams.get("skill");
  if (initial) selectRequestedSkill(initial);
  select.addEventListener("change", () => {
    const url = new URL(location.href);
    if (select.value) url.searchParams.set("skill", select.value);
    else url.searchParams.delete("skill");
    history.replaceState(null, "", url);
    apply();
  });
  form.addEventListener("submit", (event) => event.preventDefault());
  apply();
}
