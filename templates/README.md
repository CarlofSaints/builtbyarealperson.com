# Templates

`HANDOVER.md` is filled in per client and given to them at launch.

It exists because the site makes a strong promise. The domain, the code, the
analytics and every login in the client's name, and no version of leaving that
costs them their website. A promise like that is only real if there is a
document that proves it, and the client can act on it without you.

Fill it in **as you go, not at the end**. Its second job is as a build
checklist: if a row cannot be completed honestly, an account got created in the
wrong name and now is the cheap moment to fix it, not launch week.

The hosting row comes out of the take-on questionnaire at `/setup/<reference>`.

## Producing a pack

From inside the client repo:

    node ../builtbyarealperson.com/scripts/handover.mjs "Client Name"

It writes a verified `git bundle` into `handover/`, checks the history for
secrets including ones deleted later, refuses to pass a public repo, and prints
the rows to paste into HANDOVER.md.

The bundle is the point. The customer does not need a GitHub account, does not
need to know what a repository is, and will never type a git command. They get
one file that IS the website, and a document telling any developer how to use
it. Ownership without administration.
