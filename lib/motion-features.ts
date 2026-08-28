/**
 * The framer-motion feature bundle, isolated so webpack can split it out.
 *
 * This file exists purely to create a code-split point. <LazyMotion> only
 * defers anything if `features` is a function returning a dynamic import —
 * passing the `domAnimation` object directly, as an ordinary top-level import,
 * pulls the whole ~17 KB feature set into the main chunk and the component
 * saves nothing at all.
 *
 * A dynamic import of "framer-motion" itself would not split cleanly either,
 * since the package's entry pulls in far more than these features. Re-exporting
 * as the default from a module of its own gives the bundler exactly one small
 * thing to fetch on demand.
 */
export { domAnimation as default } from "framer-motion";
