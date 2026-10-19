# Editorial engineering: portfolio design proposal

Date: 2026-10-19. Owner-approved direction: editorial engineering, with F1 as a secondary expressive mode. Keep the approximately three-second terminal introduction. This document recommends a visual system and **60 distinct components**; it does not authorize installing 60 widgets or copying another site's assets. The accompanying implementation fixes existing presentation, lifecycle and verification defects. The new typography/palette and optional components below remain a design proposal.

## Recommendation

Build the experience around the work: a clear personal introduction, three carefully presented projects, readable case studies, evidence, and an easy way to contact Adeel. Use generous space and a quiet neutral palette. Let the project imagery and one deliberate F1 interaction supply the personality. Maintain the same information order, type sizing, card structure and navigation in both modes.

The strongest applicable reference lessons are simple navigation from [Navbar Gallery](https://www.navbar.gallery/), clear actions from [CTA Gallery](https://www.cta.gallery/), coherent tokens from [Refero Styles](https://styles.refero.design/), section composition from [Unsection](https://www.unsection.com/), small interaction details from [Design Spells](https://designspells.com/), and timing examples from [60fps](https://60fps.design/) and [Transitions.dev](https://transitions.dev/). These are our adaptations to this portfolio, not claims that each gallery contains the exact component described below.

Retain Astro, typed content, CSS and small browser scripts. The active application already serves static content and loads Three.js/GSAP on interaction intent. A different framework does not resolve the reproduced caption, metric-layout or animation-lifecycle bugs. [ThreeUI](https://threeui.com/) is useful for optional visual studies, without adding its entire catalog or another UI framework to this application.

## Proposed visual system

| Decision | Recommendation | Reason and boundary |
|---|---|---|
| Main typeface | Instrument Sans, regular/medium/semibold | Precise but approachable; use for navigation, body, cards and headings. Self-host a small WOFF2 subset after selecting it. The [official project](https://github.com/Instrument/instrument-sans) supplies a variable family under OFL. |
| Editorial accent | Newsreader for one hero phrase or a short pull quote | Adds an editorial voice without introducing a different font on every section. The [official project](https://github.com/productiontype/Newsreader) describes its on-screen reading purpose. Keep body and buttons in Instrument Sans. |
| Technical labels | Existing system monospace for actual code and the terminal | No third downloaded family. Keep normal metadata readable and sentence case. |
| Scale | Body 17–18px, small supporting text 13–14px; H1 fluid 44–80px | Approximate design targets, to test against real copy, 320px widths and zoom. Limit prose to 65–72 characters per line. |
| Professional colors | Paper `#F5F4F0`, surface `#FFFFFF`, ink `#1D262C`, muted `#5D666C`, rule `#DCDDD8`, action blue `#175CD3` | Six semantic tokens. Use color to distinguish actions and hierarchy. Border color is decorative, not the sole state indicator. Contrast verification is required when applied. |
| F1 colors | Retain graphite `#10151E`, surface `#171E29`, text `#EDF1F7`, muted `#A7B1C2`, rule `#303B4C`, coral `#FF624F` | Swap semantic colors; preserve geometry. Coral buttons use dark text. |
| Spacing | 4/8/12/16/24/32/48/64/96px scale | Shared gaps across sections and cards. Mobile page gutter 20–24px, minimum 16px at narrow widths. |
| Shape | 16px project frames, 8px controls, simple pills only for short tags | A small number of consistent radii. Avoid a different silhouette for every component. |
| Cards | One shared project-card composition; featured variant changes grid span | Same image ratio, metadata order, type and actions. Use flat reading sections for case-study prose. |
| Imagery | Actual screenshots, real portrait, annotated diagrams | Preserve existing portrait. Keep architecture illustrations until authentic screenshots are available. Use intrinsic image dimensions; never crop evidence in a case study. |
| Icons | One outline family or a small shared SVG set, 1.5–2px stroke | Labels accompany meaningful actions; no icon-font download. |
| Hover/focus | 140–180ms color/underline change; optional 2px lift | Keyboard focus must be equally apparent. No information available only on hover. |
| Menus/filter updates | 180–240ms opacity/transform; stable layout | Explicit expanded/selected states. Do not animate `height:auto` using polling loops. |
| Diagram interaction | 300–450ms per deliberate step | Play/pause and static explanation; animation explains the project rather than concealing text. |
| Intro and F1 | Intro remains ~3s; F1 remains user initiated and cancellable | Existing late-load and cleanup fixes apply. Reduced motion gets immediate usable content. No automatic full-page 3D on arrival. |
| Page transitions | Optional 150–220ms content crossfade | Preserve native navigation, focus, anchors and scroll restoration; ship only after browser coverage. |

Suggested imagery to collect later: SEFGH search/results screenshots with private details removed; a real annotated palm-detection sample with permission to publish; an authentic Tiny Drone photograph or annotated control diagram. Do not invent benchmark numbers, screenshots, awards, client logos, testimonials, or availability claims.

## Component selection library

**Core** means suitable for the first refined portfolio, including components already present that should be standardized. **Later** means useful when content or a real reading need justifies it. **Play** means an optional interaction, loaded only when used. Runtime estimates are architectural classes, not measured byte totals: **HTML/CSS**, **small JS**, or **3D**. Data-dependent recommendations stay hidden until supported by real content.

### Navigation and orientation — 01–10

Reference family: [Navbar Gallery](https://www.navbar.gallery/) documents static/sticky navigation, mobile menus and breadcrumbs. Adapt those patterns to a small portfolio, with four clear destinations.

| ID | Component | Where and why it fits | Priority | Runtime |
|---|---|---|---|---|
| 01 | Compact sticky header | Keep Projects, About, Credentials and Contact reachable without a large menu system. | Core | HTML/CSS |
| 02 | Text wordmark/home link | A consistent `adeel.` anchor makes identity and return navigation obvious. | Core | HTML/CSS |
| 03 | Active-page navigation indicator | Underline plus `aria-current` identifies the current section independently of color. | Core | HTML/CSS |
| 04 | Mobile disclosure menu | A compact native disclosure presents the same destinations on phones. | Core | HTML/CSS |
| 05 | Skip-to-content link | Gives keyboard users a direct route past repeated navigation. | Core | HTML/CSS |
| 06 | Professional/F1 mode control | One labelled button exposes the optional personality and its current state. | Core | Small JS |
| 07 | Case-study breadcrumb | Home → Projects → project provides orientation on deeper pages. | Later | HTML/CSS |
| 08 | Case-study contents index | Anchored headings help readers jump through longer technical write-ups. Collapse on mobile. | Later | HTML/CSS |
| 09 | Next-project navigation | A bottom-of-case-study link encourages browsing another real project. | Later | HTML/CSS |
| 10 | Back-to-top link | A plain footer anchor returns to the content start without a floating obstruction. | Core | HTML/CSS |

### Introduction and personal story — 11–20

Reference family: [Supahero](https://supahero.io/), [Curated Design](https://www.curated.design/), [Landing Love](https://www.landing.love/) and [Unsection](https://www.unsection.com/) supply hero and section composition examples. Our selection favors a readable introduction over a full-screen spectacle.

| ID | Component | Where and why it fits | Priority | Runtime |
|---|---|---|---|---|
| 11 | Editorial hero statement | Use the existing engineering headline with a clear hierarchy and careful line breaks. | Core | HTML/CSS |
| 12 | One-paragraph introduction | Explain AI systems and software work immediately in the existing authored voice. | Core | HTML/CSS |
| 13 | Portrait with caption | Human identity beside the work; keep the real portrait and stable dimensions. | Core | HTML/CSS |
| 14 | Location/education fact line | Hyderabad and VIT-AP context in a quiet supporting line, using existing facts. | Core | HTML/CSS |
| 15 | Primary work action | A prominent Explore my work link jumps directly to selected projects. | Core | HTML/CSS |
| 16 | Resume action | A secondary PDF link appears only when the real file exists. | Core | HTML/CSS |
| 17 | Capability triptych | Three coherent summaries for applied AI, backend engineering, and build/evaluate. | Core | HTML/CSS |
| 18 | Working-principles list | Short authored principles explain how decisions and trade-offs are made. | Later | HTML/CSS |
| 19 | Education/learning timeline | A readable chronological list when accurate dates and entries are supplied. | Later | HTML/CSS |
| 20 | Personal-interest aside | A short F1 note gives context to the optional mode without dominating hiring content. | Later | HTML/CSS |

### Project browsing and cards — 21–30

Reference family: section/card patterns from [Unsection](https://www.unsection.com/), [Collect UI](https://collectui.com/) and [SaaSFrame](https://www.saasframe.io/). Keep one card contract rather than importing unrelated templates.

| ID | Component | Where and why it fits | Priority | Runtime |
|---|---|---|---|---|
| 21 | Featured project card | Give SEFGH the leading position using the existing featured order. | Core | HTML/CSS |
| 22 | Standard project card | Present the other projects with consistent title, summary, role and links. | Core | HTML/CSS |
| 23 | Project media frame | Share predictable thumbnail sizing and a full uncropped case-study image presentation. | Core | HTML/CSS |
| 24 | Architecture-diagram cover | Provide an honest, labelled visual when a real screenshot is unavailable. | Core | HTML/CSS |
| 25 | Role/status metadata row | Distinguish contribution and completion status using words as well as visual styling. | Core | HTML/CSS |
| 26 | Technology tag list | Make skills scannable without a wall of unlabelled technology logos. | Core | HTML/CSS |
| 27 | Skill filter | Help a recruiter find relevant work; retain URL-linked selection and native control behavior. | Core | Small JS |
| 28 | Filter result summary | Announce how many projects match without moving focus. | Later | Small JS |
| 29 | Empty-results recovery | Explain that no published project matches and provide Clear filter. | Core | Small JS |
| 30 | Project action group | Stable Read case study, View code and genuine demo links with consistent spacing. | Core | HTML/CSS |

### Case-study reading and evidence — 31–40

Reference family: evidence/feature layouts in [SaaSFrame](https://www.saasframe.io/), reusable section patterns in [Unsection](https://www.unsection.com/), and hierarchy guidance represented in [Refero Styles](https://styles.refero.design/). These ten components are content structures, not ten boxed panels on one page.

| ID | Component | Where and why it fits | Priority | Runtime |
|---|---|---|---|---|
| 31 | Project facts strip | Role, status and updated date near the case-study title. | Core | HTML/CSS |
| 32 | Two-part project overview | Render the existing what-it-is/how-it-works descriptions that the schema already requires. | Core | HTML/CSS |
| 33 | Problem/approach/outcome sections | Consistent heading and prose hierarchy for each project's actual story. | Core | HTML/CSS |
| 34 | Technical decision note | Explain a genuine choice and its trade-off, with a subdued rule or inset. | Later | HTML/CSS |
| 35 | Annotated figure and caption | Keep labels, image and explanatory caption readable and unclipped. | Core | HTML/CSS |
| 36 | Accessible image lightbox | Inspect fine screenshot detail with close, Escape, focus return and an ordinary image-link fallback. | Later | Small JS |
| 37 | Measured-result panel | Show value, method, measurement date and supporting evidence only when available. | Core | HTML/CSS |
| 38 | Evidence/source list | Let visitors verify claims through real repositories, documents or demos. | Later | HTML/CSS |
| 39 | Technical code excerpt | A short meaningful code or API example with readable horizontal overflow and optional copy action. | Later | HTML/CSS; optional JS |
| 40 | Detail disclosure | Expand deeper implementation notes without obscuring the primary explanation. | Later | HTML/CSS |

### Credentials, contact and recovery — 41–50

Reference family: [Footer Design](https://www.footer.design/) offers typographic/grid/footer approaches; [CTA Gallery](https://www.cta.gallery/) supplies action patterns; [Collect UI](https://collectui.com/) and [SaaSFrame](https://www.saasframe.io/) include feedback and recovery patterns.

| ID | Component | Where and why it fits | Priority | Runtime |
|---|---|---|---|---|
| 41 | Credential card | Show real title, issuer and dates without exaggerating a course into a certification. | Core | HTML/CSS |
| 42 | Credential verification action | Link to the authentic issuer record or certificate, only when supplied. | Core | HTML/CSS |
| 43 | Related-project link | Connect a credential to work that uses that skill; schema already validates references. | Later | HTML/CSS |
| 44 | Honest credentials empty state | Explain that verified entries are not published yet; avoid placeholder awards. | Core | HTML/CSS |
| 45 | Editorial contact block | A clear concluding invitation, email and location using the existing content. | Core | HTML/CSS |
| 46 | Copy-email control with feedback | Optional convenience beside a working mailto link; announce success or failure accessibly. | Later | Small JS |
| 47 | Profile-link row | Consistent GitHub, LinkedIn and resume links with meaningful labels. | Core | HTML/CSS |
| 48 | Compact footer index | Repeat the small set of useful destinations without a large corporate sitemap. | Later | HTML/CSS |
| 49 | Portfolio 404 recovery | Explain the missing page and offer Home and Projects with the ordinary site navigation. | Core | HTML/CSS |
| 50 | Social sharing preview card | A coherent OG image using the real name and project title so shared links represent the portfolio. | Later | Build-time image |

### Controlled interaction and play — 51–60

Reference family: [TypeUI animations](https://www.typeui.sh/ui-animations), [60fps](https://60fps.design/), [Design Spells](https://designspells.com/), [Transitions.dev](https://transitions.dev/) and [ThreeUI](https://threeui.com/). Keep any illustrative demo visibly labelled and separate from measured project evidence. No action should require hovering or dragging alone.

| ID | Component | Where and why it fits | Priority | Runtime |
|---|---|---|---|---|
| 51 | Three-second terminal introduction | Preserve the owner's preferred first arrival, with immediate keyboard skip and reliable cleanup. | Core | Small JS + 2D canvas |
| 52 | Replay-intro control | Optional explicit replay from an interests/play area; never restart it on ordinary navigation. | Play | Small JS |
| 53 | Project-card hover/focus treatment | A tiny lift or underline response makes the interactive area clear; no moving hit target. | Later | HTML/CSS |
| 54 | Case-study crossfade | A restrained page handoff if it preserves native links, back navigation, focus and scroll. | Later | Small JS |
| 55 | SEFGH pipeline stepper | Let visitors step through question → interpretation → retrieval → ranking using labelled example data. | Play | Small JS + SVG |
| 56 | Palm-detection comparison slider | Compare a real source image and its annotated result; include buttons/keyboard and a static fallback. | Play | Small JS |
| 57 | Tiny Drone control explainer | Highlight control inputs and corresponding diagram parts with buttons; label it an illustration, not a live vehicle. | Play | Small JS + SVG |
| 58 | User-triggered F1 transition | Keep the existing optional Three.js moment with skip, reduced-motion bypass and bounded duration. | Core | Intent-loaded 3D |
| 59 | Inspectable 3D project object | An optional drone/model inspection only if an authentic suitable asset exists; rotate buttons and a static image fallback. | Play | Intent-loaded 3D |
| 60 | Motion preference control | Optional explicit reduced-effects setting, respecting the operating-system preference and persisting the user's choice. | Later | Small JS |

## What to implement first

Treat existing components as improvements, not additions: header/menu, intro/portrait/actions, shared project cards, filter/empty state, case-study facts/overview/media, credential state, contact/footer, terminal and F1 controls. The approved reliability patch handles 23, 25, 32, 35, 37 and 51 plus supporting architecture. Other items may already exist in basic form; this catalog does not claim all 60 are new or implemented.

For the next visual pass, select the proposed typography/palette, refine those existing components, then choose **one** purposeful play component: 55 for SEFGH, 56 when real detection images are available, or 57 for the drone diagram. Avoid simultaneous animated backgrounds, cursor trails, sound autoplay, scroll hijacking, constantly moving marquees and unrelated holographic cards. They would compete with the project evidence and increase motion and rendering work.

Acceptance for any selected component: same content and order in both modes; keyboard/touch operation; visible focus; reduced-motion behavior; 320/390/768/1024/1440px review; no clipped captions or intersecting controls; stable image dimensions; no accidental arrival import of 3D. Automated checks supplement screenshot inspection and real-device review. A zero-bug guarantee cannot be inferred from a passing test suite.

## Reference audit and evidence limits

Public pages and catalogs were read on 2026-10-19. The direct named domains were used instead of opaque social redirects. This was not a purchase, login, source-code-license audit, or a claim of hands-on testing every animation. Generated DESIGN.md examples are inspiration, not authoritative specifications of another brand.

| Reference | Access in this research | Relevant use |
|---|---|---|
| [TypeUI](https://www.typeui.sh/) | Public product and animation catalog read | Shared design guidance and interaction categories. |
| [designmd.me](https://designmd.me/) | Public page/example read | Semantic color, type, spacing, radius and state specification. |
| [designmd.supply](https://www.designmd.supply/) | Public catalog read | A coherent whole-system brief rather than unrelated components. |
| [Refero Styles](https://styles.refero.design/) | Public catalog read | Tokens and design-system structure. |
| [getdesign.md](https://getdesign.md/) | Public catalog read | Reasoning attached to visual decisions; technology/product references. |
| [Collect UI](https://collectui.com/) | Public index read | Component breadth; portfolio fit judged separately. |
| [Design.md Store](https://designmd-store.com/) | Public index read | Documented system packs and preview workflow. |
| [Niblet](https://niblet.com/) | Fetch failed (502) | No specific design claim relied on it. |
| [Godly](https://godly.website/) | Redirected to recent.design; destination unavailable to reader | No specific design claim relied on it. |
| [CTA Gallery](https://www.cta.gallery/) | Public catalog read | Button, navigation and action hierarchy. |
| [60fps](https://60fps.design/) | Public motion catalog read | Motion purpose and storyboard examples; name is not performance proof. |
| [SaaSFrame](https://www.saasframe.io/) | Public catalog read after www retry | Component taxonomy, evidence/details and recovery; omit SaaS billing/account UI. |
| [Navbar Gallery](https://www.navbar.gallery/) | Public categories read | Small sticky header, disclosure and breadcrumb patterns. |
| [Design Spells](https://designspells.com/) | Public interaction catalog read | Focused moments of play and feedback. |
| [Landing Love](https://www.landing.love/) | Public catalog read after www retry | Overall section hierarchy. |
| [Bento Grids](https://bentogrids.com/) | Empty extract; www retry failed | Do not claim a particular grid was inspected. |
| [404s](https://404s.design/) | Fetch failed | Recovery recommendation comes from portfolio needs and other accessible references. |
| [Rebrand Gallery](https://www.rebrand.gallery/) | Public catalog read after www retry | Identity consistency across typography and applications. |
| [Supahero](https://supahero.io/) | Public hero index read | Hero hierarchy and engineering/personality reference categories. |
| [Curated Design](https://www.curated.design/) | Public catalog read | Overall composition and restraint. |
| [Footer Design](https://www.footer.design/) | Public categories read | Typographic/grid contact footer. |
| [Unsection](https://www.unsection.com/) | Public section catalog read | Hero, portfolio, contact and footer composition. |
| [SaaSpo](https://saaspo.com/) | Access blocked/fetch failed | No specific design claim relied on it. |
| [Gridddy](https://gridddy.framer.website/) | No readable page content returned | No specific design claim relied on it. |
| [One Page Love OG](https://onepagelove.com/og) | Public OG gallery read | Shared-link preview presentation. |
| [Transitions.dev](https://transitions.dev/) | Public transition catalog read | Small resize/state transitions and consistent timing. |
| [ThreeUI](https://threeui.com/) | Public component/template descriptions read | Deliberate optional 3D, labelled interaction and static fallback design. |

No paid libraries, external accounts, analytics integrations or new frontend dependencies were added for this research.
