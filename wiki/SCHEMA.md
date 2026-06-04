# Wiki Schema

## Structure Rules
- Each page covers ONE concept, module, or decision
- Every page has a `## Backlinks` section listing pages that reference it
- Page filenames use kebab-case: `auth-middleware.md`, `database-schema.md`
- Pages start with a 1-sentence summary, then details
- Cross-references use relative links: `[Auth](./pages/auth-middleware.md)`

## Content Rules
- Facts only — no speculation, no "might be useful later"
- Include file paths and line numbers when referencing code
- Date every entry (YYYY-MM-DD)
- Mark uncertain information with `[UNVERIFIED]`

## Maintenance Rules
- After every significant code change, update affected pages
- Log every change in `log.md` with date and reason
- Re-validate backlinks weekly with `/wiki-lint`
