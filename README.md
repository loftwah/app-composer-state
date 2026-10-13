# Carry / forward

Independent synthetic-only Portable AI State demo. Reviewed 13 October 2026. MIT. No Emilio data or real private records.

`pnpm install; pnpm test; pnpm dev; pnpm deploy`. JSON is a YAML 1.2 subset; its encrypted envelope is `.state.enc.json`. WebCrypto AES-256-GCM with random salt/nonce and fixed PBKDF2-SHA256 600,000 iterations. Keys are never uploaded or copied into model context. Explicit reviewed memory subsets can be copied without keys or unselected records. Imported envelope versions/algorithms/size are checked; tampering and wrong keys fail.

Ciphertext persistence is opt-in. Browser/OS/extension compromise and guaranteed memory erasure are outside this demo’s guarantees. No key recovery: retain the passphrase separately. No server sync or provider account is claimed. #31–34 remain the security/interoperability acceptance gates before real sensitive data.

## Public project standard

Reviewed 13 October 2026. The app supplies saved reader dark/light themes, native app navigation with Ctrl/Cmd+K and ordinary links, visible keyboard focus, phone layouts, favicon/touch icon and page-specific social metadata. Original generated App Composer artwork is retained with its prompt; functional icons remain vectors. These features do not widen signup, owner access or disclosure permissions.

Contributions: [Contributing](CONTRIBUTING.md), [Code of Conduct](CODE_OF_CONDUCT.md), [Security](SECURITY.md), [Accessibility](ACCESSIBILITY.md). Physical-device, screen-reader and full platform sharing acceptance remain distinct from browser checks.

## Health and optional usage

Reviewed 14 October 2026. `GET /healthz` (or the declared mount plus `/healthz`) returns public liveness and exact source revision. It does not query storage, inspect credentials or prove a full user journey. `HEAD` is supported; other methods return 405.

Optional server-only daily counts use `USAGE_ENDPOINT` (an explicit HTTPS app-scoped endpoint) and `USAGE_TOKEN` (a write-only runtime secret). Both are absent by default, so forks remain independent. The copied MIT publisher derives from App Composer `lib/usage/publisher.mjs`; it is owned and deployable here, without a Composer package or Woodhouse runtime dependency. Failure or a 1.5-second timeout drops a count without blocking the app; there are no retries. Only successful public home-page opens are published. No visitor, URL, referrer, entered text, identity, profile, filename or passphrase is sent. `X-Composer-Verification: 1` excludes synthetic release probes.

Vault operations remain local and the browser keeps `connect-src none`. Only the server home-page count is optional. The launch operator enables its own instances through Wrangler secrets; do not copy those secrets into a fork. The public [app activity](https://composer.loftwah.com/activity) explains retention, limits and missing-count/bot caveats.

Add `?vitals=1` to the public page, then open “Page performance” for local LCP/INP/CLS measurements. Values apply to this load only; unsupported metrics say unavailable. The self-hosted standard `web-vitals` 6.2.3 bundle and Apache licence/provenance are retained. No values, element attribution or page data are uploaded or persisted. Developer console links stay public and do not print app contents.
