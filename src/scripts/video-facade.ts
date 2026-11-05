// Swap a YouTube placeholder for the privacy-enhanced player only when asked.
// Until then the page makes no request to YouTube. Without JavaScript the
// placeholder is an ordinary link to the video.
import { buildEmbedUrl } from "../lib/video";

document
  .querySelectorAll<HTMLElement>(".video-facade[data-youtube-id]")
  .forEach((facade) => {
    const link = facade.querySelector<HTMLAnchorElement>(".video-play");
    if (!link) return;
    link.addEventListener("click", (event) => {
      // Let modified clicks open YouTube in a new tab as usual.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
        return;
      event.preventDefault();
      const id = facade.dataset.youtubeId!;
      const iframe = document.createElement("iframe");
      iframe.src = buildEmbedUrl(id, Number(facade.dataset.youtubeStart) || 0);
      iframe.title = facade.dataset.youtubeTitle ?? "Project video";
      iframe.allow =
        "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;
      link.replaceWith(iframe);
      iframe.focus();
    });
  });
