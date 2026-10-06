# CopyCatch — Development Rules & Operating Principles

The following mandatory rules govern the development, lifecycle, and engineering practices of the CopyCatch project. All developers and AI assistants must strictly follow them:

1. **Filesystem is the source of truth:** Inspect actual files, directory structures, and git history rather than relying on unverified assumptions.
2. **Never guess project state:** Always inspect the workspace and verify reality before taking action.
3. **Never randomly rewrite existing work:** Preserve established progress, comments, and working implementations.
4. **Do not change the approved architecture without explicit approval:** Adhere to `docs/ARCHITECTURE.md` unless formal authorization is provided.
5. **Do not expose or commit secrets:** Never hardcode credentials, API tokens, or secrets. Rely exclusively on `.env` (ignored by Git) and maintain `.env.example`.
6. **Work phase-by-phase:** Focus strictly on the designated scope of each development phase.
7. **Complete only the requested phase:** Do not jump ahead into subsequent phases or add unsolicited features.
8. **Update `PROJECT_STATE.md` after every phase:** Keep the project state document synchronized with every completed phase.
9. **Create a Git checkpoint after every completed phase:** Ensure clean commits and appropriate git tags mark every major milestone.
10. **Recover from files and Git upon session reset:** If the AI session changes, recover using project files and Git history rather than conversation memory.
11. **Do not introduce unnecessary dependencies:** Keep dependencies lightweight, justified, and focused on core requirements.
12. **Do not create fake/mock functionality unless explicitly requested:** Build robust, functional, and verifiable systems according to specifications.
13. **Preserve research reproducibility and document important architectural decisions:** Maintain deterministic workflows, evaluation records, and clear technical documentation.
14. **Mini-project optimization & no external databases:** Maintain a lightweight, fast-moving project structure. Do not introduce external database services (MongoDB, Supabase, PostgreSQL, SQLite, Firebase, etc.). Use local file storage (`backend/data/`) for persistence.
