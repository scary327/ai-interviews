# Project memory

Verified: 2026-11-16. Store confirmed facts, limitations and decision rationale
for future AI sessions. Start with [project state](project-state.md).
Working rules live in root and service AGENTS.md files.

## Maintenance

- Update the fact, verification date and source link when behavior changes.
  Code and observed results take precedence over old memory.
- Separate implementation, intended architecture and hypotheses. Distinguish
  build success, health checks and complete user-flow verification.
- Keep rationale and diagnostic findings, not command transcripts. Remove stale entries.
- Never store API keys, passwords, JWTs, private keys, `.env` contents, personal
  data or candidate conversations. Do not generalize local workarounds.
- Recheck container state, group membership, model availability and account
  balance during troubleshooting; these are not permanent project facts.
