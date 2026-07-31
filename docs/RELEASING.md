# Releasing

Releases are managed by Changesets and `.github/workflows/release.yml`.
Merging a release commit to `main` publishes both public packages after lint,
type-check, unit tests, and builds pass.

## npm trusted publishing

Both `@react-pixel-ui/core` and `@react-pixel-ui/react` use the same GitHub
Actions trusted publisher in npm:

- Repository owner: `Todari`
- Repository: `react-pixel-ui`
- Workflow: `release.yml`
- Environment: leave empty unless the workflow later adds one

The workflow grants `id-token: write`, uses Node 22 and npm 11.5.1+, and both
package manifests enable provenance. Publishing uses short-lived GitHub OIDC
credentials, so the workflow does not read a long-lived npm token.

## Local verification

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build
pnpm test:compat
pnpm test:e2e
pnpm audit --prod
```

Do not run `pnpm changeset publish` locally unless a manual release is
intentional.
