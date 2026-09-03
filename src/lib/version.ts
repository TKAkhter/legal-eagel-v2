/**
 * `__APP_VERSION__`/`__BUILD_TIME__` are injected by `vite.config.ts`'s
 * `define` block, sourced from `package.json`. Import from here rather
 * than referencing the globals directly, so there's one place to swap
 * in a real CI-provided commit SHA later if desired.
 */
export const appVersion = __APP_VERSION__
export const buildTime = __BUILD_TIME__
