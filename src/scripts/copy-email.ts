export {};
// Optional convenience beside the mailto link. Hidden without JavaScript or a
// clipboard; the result is announced without moving focus.
const button = document.querySelector<HTMLButtonElement>(".copy-email");
const message = document.querySelector<HTMLElement>(".copy-status");

if (button && message && navigator.clipboard?.writeText) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  button.hidden = false;
  button.addEventListener("click", async () => {
    clearTimeout(timer);
    const email = button.dataset.email ?? "";
    try {
      await navigator.clipboard.writeText(email);
      message.textContent = "Email address copied.";
    } catch {
      message.textContent = `Copy failed. The address is ${email}.`;
    }
    timer = setTimeout(() => (message.textContent = ""), 5000);
  });
}
