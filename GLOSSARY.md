# Glossary

**Scheduled message** — A user message the extension submits to the session on your behalf at a later time. Created by `/kg`, `/at`, or auto-resume.

**Fire time** — The instant a scheduled message is submitted. Fixed when the message is created.

**Duration** — A relative delay such as `40m` or `2h30m`. The `/kg` way of expressing a fire time.

**Clock time** — A local wall-clock time such as `20:00`. The `/at` way of expressing a fire time. Resolves to today if still ahead, otherwise tomorrow.

**Follow-up** — Delivery mode for scheduled messages: the message waits until the agent is idle rather than interrupting a running turn.

**Auto-resume** — A scheduled message the extension creates itself after a provider usage limit, timed to the limit's reset.
