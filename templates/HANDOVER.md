# <CLIENT NAME>: what you own and where it lives

Everything about this website: what exists, whose name it is in, what it costs
and how to get into it. Keep this. If you ever work with somebody else, hand
them this file and they will have everything they need.

Built by Carl Dos Santos · carl@builtbyarealperson.com · 082 827 1243

---

## The short version

| | |
| --- | --- |
| Web address | `<domain>` |
| Registered to | `<client business name>` |
| Site is hosted on | `<host>`, account owned by `<who>` |
| Went live | `<date>` |
| Reference | `<BRP-XXXX-XXXX>` |

---

## Accounts

One row per account. **Owned by** is the person whose name is on it and who can
remove everyone else. If that is not you, it is written down here so it is never
a surprise.

| Account | What it is for | Owned by | Costs | How to get in |
| --- | --- | --- | --- | --- |
| `<registrar>` | The web address itself | `<client>` | `~R<x>/year` | `<login route>` |
| `<host>` | Where the site runs | `<client / Carl>` | `<R x/month or free>` | `<login route>` |
| `<github>` | The code | `<client>` | Free | `<login route>` |
| Google Analytics | Visitor numbers | `<client>` | Free | `<login route>` |
| Google Search Console | How Google sees the site | `<client>` | Free | `<login route>` |
| `<email host>` | Business email | `<client>` | `<R x/month>` | `<login route>` |

**No passwords are written in this document, and I do not hold any of yours.**
Where I need access I am invited to your account as a member and log in under my
own name. When you want me gone, you remove me.

---

## What you own, and what I keep

**Yours outright, and yours whether or not we carry on working together:** the
web address, the website itself, everything on it, your content, your images,
your data and every account listed above.

**Mine:** the reusable toolkit underneath — the components and build setup I use
across every project. You are not buying a share of my tools, and I am not
taking a share of your website.

If you leave, you take a complete, working website. You do not take my toolkit,
and nothing about that stops the site working, being edited, or being taken over
by somebody else.

---

## If you want to move it

**If the hosting is in your name:** remove me from the account. That is the
entire process. Nothing moves, nothing goes down, the site does not blink.

**If the hosting is on my account:** ask me and I will move it to an account of
yours. It takes an afternoon, there is no charge, and there is no version of
this where I refuse or make it difficult.

**If you cannot reach me at all:** everything you need is in the table above.
Any competent developer can take it from there. That is the point of this file.

---

## The code

**Your copy is the file `<slug>-website-<date>.bundle` in this pack.** That one
file is the entire website, including every version of it since the day it was
started. It is not an export or a backup that might be missing something. Any
developer can turn it back into a working project with one command, offline,
years from now, without needing anything from me and without my permission.

You do not need a GitHub account, and you will never have to use one.

| | |
| --- | --- |
| Where I keep it day to day | `<repo url>` |
| Who can see it | Private |
| Deploys are triggered from | `<repo url>`, branch `<branch>` |

That last row matters and is worth understanding: **the hosting is fed from that
repository.** If you ever move the site to a developer of your own, they need to
point the hosting at their own copy, which the bundle gives them. It is a
ten-minute job and it is the only string attached.

**To turn the file back into the website:**

```
git clone <slug>-website-<date>.bundle mysite
cd mysite
npm install
npm run dev
```

It is a Next.js project. Any web developer will recognise it immediately.
Settings and keys are not in the code — they live in the hosting account, which
is listed in the table above.

## What was agreed

| | |
| --- | --- |
| Quoted | `R<amount>` fixed |
| Included | `<pages, features>` |
| Care plan | `<taken / not taken>`, `R<x>/month` |
| Hosting after year one | `<what was agreed>` |

---

## Changes since launch

| Date | What changed |
| --- | --- |
| | |
