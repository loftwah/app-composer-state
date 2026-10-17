# Carry / forward

Independent synthetic-only Portable AI State demo. Reviewed 13 October 2026. MIT. No Emilio data or real private records.

`pnpm install; pnpm test; pnpm dev; pnpm deploy`. JSON is a YAML 1.2 subset; its encrypted envelope is `.state.enc.json`. WebCrypto AES-256-GCM with random salt/nonce and fixed PBKDF2-SHA256 600,000 iterations. Keys are never uploaded or copied into model context. Explicit reviewed memory subsets can be copied without keys or unselected records. Imported envelope versions/algorithms/size are checked; tampering and wrong keys fail.

Ciphertext persistence is opt-in. Browser/OS/extension compromise and guaranteed memory erasure are outside this demo’s guarantees. No key recovery: retain the passphrase separately. No server sync or provider account is claimed. #31–34 remain the security/interoperability acceptance gates before real sensitive data.

## Public project standard

Reviewed 13 October 2026; artwork, naming and repetition reviewed 17 October 2026. The app supplies saved reader dark/light themes, native app navigation with Ctrl/Cmd+K and ordinary links, visible keyboard focus, phone layouts, favicon/touch icon and page-specific social metadata. These features do not widen signup, owner access or disclosure permissions.

Artwork: the hero, the default social card, the favicon and the apple-touch icon are this app's own reviewed ink-line cel animation set — a courier carrying a glowing memory core between a bulky mainframe and a slim handheld, joined by a continuous signal ribbon. `public/brand/carry-forward-art-v4-master.png` is the editable master; the 480/960 WebP hero and the 1200 × 630 JPEG share card are its reviewed derivatives. Before this release `public/mark.svg` and `public/brand/mark.svg` were byte-identical to App Composer's own mark, so the app wore the parent product's logo; it now has its own. The bundled font and its OFL licence live once, under `public/brand`, and the display font is preloaded from that same file.

One statement per idea: the introduction describes what the example is, the numbered list is the only "what to do" list, each section heading is distinct from the step that points at it, and the passphrase is explained once in the boundaries list rather than restated beside the field. The switcher lists every app by its own name, so this app appears as Carry / forward everywhere, never as Portable AI State.

Contributions: [Contributing](CONTRIBUTING.md), [Code of Conduct](CODE_OF_CONDUCT.md), [Security](SECURITY.md), [Accessibility](ACCESSIBILITY.md). Physical-device, screen-reader and full platform sharing acceptance remain distinct from browser checks.

## Health and optional usage

Reviewed 14 October 2026. `GET /healthz` (or the declared mount plus `/healthz`) returns public liveness and exact source revision. It does not query storage, inspect credentials or prove a full user journey. `HEAD` is supported; other methods return 405.

Optional server-only daily counts use `USAGE_ENDPOINT` (an explicit HTTPS app-scoped endpoint) and `USAGE_TOKEN` (a write-only runtime secret). Both are absent by default, so forks remain independent. The copied MIT publisher derives from App Composer `lib/usage/publisher.mjs`; it is owned and deployable here, without a Composer package or Woodhouse runtime dependency. Failure or a 1.5-second timeout drops a count without blocking the app; there are no retries. Only successful public home-page opens are published. No visitor, URL, referrer, entered text, identity, profile, filename or passphrase is sent. `X-Composer-Verification: 1` excludes synthetic release probes.

Vault operations remain local and the browser keeps `connect-src none`. Only the server home-page count is optional. The launch operator enables its own instances through Wrangler secrets; do not copy those secrets into a fork. The public [app activity](https://composer.loftwah.com/activity) explains retention, limits and missing-count/bot caveats.

Add `?vitals=1` to the public page, then open “Page performance” for local LCP/INP/CLS measurements. Values apply to this load only; unsupported metrics say unavailable. The self-hosted standard `web-vitals` 6.2.3 bundle and Apache licence/provenance are retained. No values, element attribution or page data are uploaded or persisted. Developer console links stay public and do not print app contents.

## Try the fictional example

Reviewed 14 October 2026. [Open Carry / forward](https://ai.loftwah.com).

1. Choose **Open Mira’s example** to read the invented museum-maker profile (the same action as the page’s first step).
2. Tick a memory. Review the exact outgoing JSON, approve it, then choose **Copy selected memories**. Changing the selection clears approval. Nothing goes to an assistant until you paste it there.
3. Enter a made-up passphrase of at least 16 characters and **Encrypt and download**. Keep the passphrase separately. Saving an encrypted copy on this device is optional.
4. **Close this profile**, choose the downloaded JSON file and enter the same passphrase to **Reopen encrypted profile**. A wrong passphrase exposes no profile.
5. Optional: add an invented update under **Keep a note for next time**, then download again to retain it. **Remove saved copy** only removes browser persistence; it leaves the open profile and downloaded files alone.

The reviewed ink-line cel animation artwork ships under public/brand/ as the v4 master, the 480/960 WebP hero and the 1200×630 share card with its WebP variants. Encryption implementation and file format remain unchanged. The saved reader theme applies before paint. This example is assistant context, not a shared account login or an authenticated real-data vault; security/provider/recovery acceptance remains open.

## Sharing release check

Reviewed 16 October 2026. Carry / forward has its own versioned 1200×630 JPEG card and matching page, Open Graph and X title/description. Source checks validate the metadata and actual JPEG dimensions. The normal deployment also verifies public HTML, exact reviewed image bytes, robots and sitemap with a marked Twitterbot user-agent probe. A successful probe confirms our live response; it does not prove X fetched or rendered the card. Actual platform preview acceptance is a separate observation. The reviewed artwork files are the v4 set under `public/brand/`.

MP’s 16 October 2026 direction removes underlined text links. Links retain accent/weight treatment, hover feedback and visible keyboard focus.

The shared header keeps theme switching as a quiet current-mode sun/moon icon. Preserve the stable Dark theme accessible toggle name, pressed state, keyboard focus, 44px target and existing saved-preference key. Keep the secondary control class so light-theme primary-button rules cannot override its foreground.
