# Carry / forward

Independent synthetic-only Portable AI State demo. Reviewed 13 October 2026. MIT. No Emilio data or real private records.

`pnpm install; pnpm test; pnpm dev; pnpm deploy`. JSON is a YAML 1.2 subset; its encrypted envelope is `.state.enc.json`. WebCrypto AES-256-GCM with random salt/nonce and fixed PBKDF2-SHA256 600,000 iterations. Keys are never uploaded or copied into model context. Explicit reviewed memory subsets can be copied without keys or unselected records. Imported envelope versions/algorithms/size are checked; tampering and wrong keys fail.

Ciphertext persistence is opt-in. Browser/OS/extension compromise and guaranteed memory erasure are outside this demo’s guarantees. No key recovery: retain the passphrase separately. No server sync or provider account is claimed. #31–34 remain the security/interoperability acceptance gates before real sensitive data.

## Public project standard

Reviewed 13 October 2026. The app supplies saved reader dark/light themes, native app navigation with Ctrl/Cmd+K and ordinary links, visible keyboard focus, phone layouts, favicon/touch icon and page-specific social metadata. Original generated App Composer artwork is retained with its prompt; functional icons remain vectors. These features do not widen signup, owner access or disclosure permissions.

Contributions: [Contributing](CONTRIBUTING.md), [Code of Conduct](CODE_OF_CONDUCT.md), [Security](SECURITY.md), [Accessibility](ACCESSIBILITY.md). Physical-device, screen-reader and full platform sharing acceptance remain distinct from browser checks.
