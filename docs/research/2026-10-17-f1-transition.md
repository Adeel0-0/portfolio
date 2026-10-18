# F1 mode transition: research and motion specification

Date: 2026-10-17. Status: researched proposal, not implemented or visually tested.

Companion to [the portfolio rebuild design](../superpowers/specs/2026-10-17-portfolio-rebuild-design.md). The owner wants a professional minimalist default, a spectacular short transition into refined F1 mode, and permits heavier effects for that moment. The owner declined a design preview/mockup. Automatic Git deployment previews remain part of the separately selected publishing workflow.

## Recommendation

Create a custom **Lights Out** sequence: starting lights build anticipation, a low track-level perspective accelerates through red/white light trails, and a diagonal track-edge sweep reveals the F1 portfolio. Target 2.2 seconds from activation to a settled page. One coherent acceleration is the visual centerpiece. The site then becomes still enough to read.

Use Three.js for a procedural track and instanced light trails, GSAP for the short timeline, and CSS/SVG for the cover/reveal and fallback. This can run as a lazily imported TypeScript module in either Astro or Next.js; it does not decide the framework migration. Final implementation package versions must be checked and locked. React Three Fiber is not required for this one scene.

## Sources and what they establish

| Source inspected | Useful finding | Decision |
| --- | --- | --- |
| [React Bits Hyperspeed](https://reactbits.dev/backgrounds/hyperspeed), [GitHub source at the inspected revision](https://github.com/DavidHDev/react-bits/blob/310fc737fadcaa149a4e06fb088fc95332dc8bfb/src/ts-default/Backgrounds/Hyperspeed/Hyperspeed.tsx) | React/Three.js implementation with road, trails, curvature, speed and field-of-view controls. Inspected sections include renderer setup, animation lifecycle and disposal. | Strong technical reference for the acceleration scene; its continuing background behavior needs a bounded transition controller. Do not install an entire component collection for this feature. |
| [21st.dev Shader Reveal Transition by Edu Calvo](https://21st.dev/@educalvolpz/components/shader-reveal-transition) | Catalog describes several reveal styles and reduced-motion behavior; the accessible page exposes a usage example, lists Framer Motion, and labels the component MIT. Its underlying renderer was not audited. | Reference for the final handoff, especially a directional wipe. The custom scene can reveal the real DOM without importing this React wrapper. |
| [21st.dev Cinematic Theme Switcher](https://21st.dev/@rhllom/components/cinematic-theme-switcher) | Relevant discovery result for theme-switch presentation. Available page content was insufficient for an implementation or license audit. | Inspiration only; not a verified dependency selection. |
| [Codrops: High-Speed Light Trails in Three.js](https://tympanus.net/codrops/2019/11/13/high-speed-light-trails-in-three-js/) | Explains procedural light trails, instancing, synchronized road distortion, and acceleration. Published in 2019. | Useful visual technique; reimplement against the chosen current APIs rather than treating an older demo as a drop-in component. |
| [Three.js renderer documentation](https://threejs.org/docs/pages/WebGLRenderer.html), [cleanup guide](https://threejs.org/manual/pages/cleanup.html) | Documents asynchronous shader preparation and explicit GPU-resource disposal. | Prepare the scene before the acceleration beat; always tear down rendering resources on completion or interruption. |
| [GSAP timelines](https://gsap.com/docs/v3/GSAP/Timeline/) | Provides a controllable sequence for coordinated DOM and numeric-property animation. | One timeline coordinates the cover, scene uniforms, and reveal. No overlapping animation libraries controlling the same properties. |

Research included GitHub repository/source reads and primary documentation. No downloaded source was executed; no component or package was installed. Catalog screenshots or descriptions are not performance measurements, browser validation, or proof that a component integrates correctly here.

### Source and license boundary

React Bits was inspected at `310fc737fadcaa149a4e06fb088fc95332dc8bfb`. That revision's [license](https://github.com/DavidHDev/react-bits/blob/310fc737fadcaa149a4e06fb088fc95332dc8bfb/LICENSE.md) is **MIT + Commons Clause**, not plain MIT. It requires notices and restricts redistribution of the components themselves. Retain the source revision and required notices if adapting its implementation; the preferred plan is a focused custom scene, not repackaging a component library.

[Three.js is MIT](https://github.com/mrdoob/three.js/blob/dev/LICENSE). GSAP uses its [Standard No Charge license](https://gsap.com/community/standard-license/), not MIT. Verify and preserve the actual shipped notices. A catalog's license label is specific to that component; it is not a blanket license for 21st.dev. No branded race footage, team livery, paid model, logo, audio, or other third-party art asset is required by this design.

## The sequence

Timings below are proposed art direction, not measured timings from a built effect.

| Time from click | What the visitor sees | Implementation purpose |
| --- | --- | --- |
| 0-120 ms | The mode control responds immediately. A thin red line extends from it into a dark viewport cover. | Visible feedback while preparing the optional scene. No spinner. |
| 120-650 ms | Five small red starting lights illuminate progressively, hold briefly, then extinguish together. | A single anticipation beat. Lights stay spatially small; no repeated flashes or full-screen white pulse. |
| 650-1550 ms | Low track-level acceleration: red/white curbs, bright trails stretching past the camera, a controlled field-of-view increase and a slight bend into the reveal. | Main Three.js scene. Procedural geometry and instanced trails; keep the horizon stable. |
| 1550-2200 ms | One track-edge stripe sweeps across the viewport. The F1 canvas, typography accents and panel borders appear behind it, then settle. | Commit the shared theme tokens while covered, reveal the actual page, and dispose the scene. |

The return to Professional uses a shorter 450 ms retracting sweep. This makes switching back feel intentional without repeating the full launch. Each deliberate Professional-to-F1 activation may play the entrance; restored preference, reload, and normal page navigation do not replay it.

The scene uses graphite, pale white and one strong red. Track lights may use a small amount of emissive glow; avoid a full-screen stack of blur, chromatic aberration, camera shake and particles. A procedural track gives sufficient racing character without making the transition depend on a large car-model download. Silent by default. Audio is not part of this version.

Motion language: one cubic easing family, mostly 100 ms timing increments, anticipation followed by acceleration and decisive deceleration. Use a restrained 40 ms stagger only on decorative details near the reveal. Do not animate all paragraphs, headings and buttons after the page returns.

## Integration and first-click behavior

The normal portfolio and theme preference controller remain small. Separate the optional Three.js/GSAP code into an effect chunk. Start its import on deliberate pointer hover, keyboard focus or pointer-down on the theme control; do not preload it on every visit. Recheck reduced-motion preferences before any import. Cache the imported module for later use, but do not retain a running renderer between switches.

On click, begin the lightweight cover/lights immediately and prepare the GPU scene concurrently. Use `compileAsync()` where supported by the locked Three.js version. It addresses shader compilation readiness; it is not a guarantee against all browser or driver stalls. If the complete scene is not ready within a provisional 500 ms preparation budget, choose a CSS/SVG racing sweep and finish the switch by approximately 700 ms. Do not extend the countdown while downloading. Late import/compile resolutions must check their session identifier and dispose stale resources without mounting or replaying the scene.

The foreground rich path has a 2.5-second completion deadline, measured from activation. JavaScript cannot enforce a deadline during a browser/main-thread stall, so an elapsed-time check must settle immediately on the next opportunity. Page hiding or navigation ends the effect rather than resuming a film when the visitor returns.

Render the effect as a temporary viewport overlay outside transformed content containers. Theme changes affect the real DOM beneath an opaque cover; do not screenshot the page into a texture, duplicate interactive content, or remount routes. The theme itself must not change layout geometry. Route, hash, scroll, filter selections and expanded content remain intact.

## State, input and resource ownership

Use an explicit lifecycle: `idle -> preparing -> playing -> settling -> idle`. Keep a single owner for the renderer, timeline and current session. A newer theme request wins: cancel the active cinematic, settle to the latest requested theme through a brief fade, and do not start a second renderer. Store only the validated committed preference through guarded storage.

One idempotent settle/cleanup path handles normal completion, Skip, Escape, further theme requests, failed import, unavailable WebGL, context loss, preparation timeout, completion deadline, live reduced-motion change, hidden page and route teardown. It must stop the timeline and animation loop, remove transient listeners/observers/timers, dispose geometries/materials/textures/render targets/renderer, remove the canvas and cover, and clear temporary styles. Disposing only the renderer or removing only the canvas is insufficient.

The decorative overlay is `aria-hidden` and has no interactive descendants. The visible mode control and a temporary real `Skip animation` control are siblings above it. Keep the focused control visible; do not hide or make its ancestor inert. Escape, Tab, scroll intent or Skip completes the transition before the requested normal interaction proceeds. The cover prevents an accidental click through to an obscured project link. If focus is on Skip when it is removed, return it to the mode control; otherwise preserve valid focus. Announce the settled mode once, not every animation beat.

Under reduced motion, use an immediate change or a fade of at most 150 ms, with no lights countdown, depth travel, zoom or Three.js/GSAP import for the effect. A live preference change aborts an in-flight scene and settles. Failed/unsupported WebGL uses the short CSS sweep; accessibility and usable content never depend on WebGL.

Initial quality targets: cap device pixel ratio around 1.5 on desktop and 1 on small screens, bound drawing-buffer resolution and trail count, and favor shader-generated glow over a compulsory multi-pass postprocessing chain. These are builder-tunable starting points, not proof of 60 fps. Measure representative devices and reduce quality or select the fallback when needed.

## Verification required during implementation

- Confirm core-page scripts do not import the effect on arrival or saved-theme reload. Report compressed core bytes and separately report transition-chunk bytes; neither number is currently measured.
- Exercise cold and warm activation, slow network/CPU, failed import, context loss, reduced motion before and during playback, rapid reversal, Escape/Tab/Skip, page hiding, navigation and disabled storage.
- Verify same route, scroll position and UI state on ordinary switches, and correct focus and final preference after interruptions. Inspect both themes at mobile and desktop sizes.
- After at least 20 switches, verify no effect canvas, active effect timeline/animation loop or retained transient listener remains. Compare allocation profiles and renderer statistics; a screenshot alone does not establish cleanup.
- Profile frame times and long tasks on representative real hardware. Browser screenshots and automated tests alone cannot prove smoothness. Record the cold/warm duration, chosen quality tier, frame-time observations and fallback behavior.
- Validate the lifecycle with focused tests and actual browser interaction. Do not add brittle tests asserting every animation millisecond or claiming quality from mocked WebGL.

## Alternatives considered

| Approach | Tradeoff | Role |
| --- | --- | --- |
| CSS/SVG-only racing wipe | Reliable, small and immediate; less depth and acceleration detail | Essential fallback and Professional return |
| Custom Three.js track plus GSAP choreography | Strong racing identity with control over timing, geometry and cleanup | Recommended rich entrance |
| Paste a continuously animated Hyperspeed background | Fast initial demo but different lifecycle, input and rendering needs | Reference implementation only |
| Pre-rendered video or detailed 3D car flyby | Adds media/model transfer, art direction and asset dependencies | Outside the first version |

Implementation update (2026-10-17): the owner approved the design and Astro rebuild. The original procedural scene is implemented and exercised in local Chrome software WebGL (~2.23 seconds in an observed warm run). Production arrival JS is 2.6 KB gzip and the separate cinematic is 154.1 KB gzip. Twenty switches and cancellation paths have browser coverage. Real-device frame-time/allocation profiling and live deployment remain unverified; consult CHECKPOINT.md and docs/verification.md for final evidence. No separate mockup was created.
