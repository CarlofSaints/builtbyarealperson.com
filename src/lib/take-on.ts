/**
 * The take-on questionnaire, sent once a quote is accepted.
 *
 * Its job is to work out where the finished site should live. That decision has
 * real consequences: whether the customer can walk away, what it costs them
 * every month, and how much administration they are signing up for. And it is
 * a decision they cannot make directly, because nobody outside this trade knows
 * what a platform is.
 *
 * So none of these questions mention hosting. They ask about things a person
 * running a plumbing business genuinely knows: whether they pay anybody every
 * month, what their email address looks like, whether they can get into the
 * place their web address was bought, and how much they care about being able
 * to leave. The recommendation is derived from those.
 *
 * The one input that is NOT asked is whether the site needs a server. That
 * comes from what they already told the estimator: a shop or an integration
 * needs one, a brochure site does not. Asking again would be asking them to
 * answer a question they have already answered, in worse words.
 */

import type { Answers } from "./estimate";

export type TakeOnAnswers = {
  currentHosting: "yes-known" | "yes-unknown" | "no" | "unsure" | null;
  currentHostingWho: string;
  emailKind: "own-domain" | "free" | "none" | null;
  domainAccess: "yes" | "someone-else" | "dont-have" | "unsure" | null;
  domainWho: string;
  portability: "high" | "medium" | "low" | null;
  stance: "own-it" | "hands-off" | "no-preference" | null;
  whoLooksAfterIt: "me" | "someone-inside" | "outside-company" | "nobody" | null;
  monthlyCost: "fine" | "prefer-not" | "problem" | null;
  notes: string;
};

export const EMPTY_TAKE_ON: TakeOnAnswers = {
  currentHosting: null,
  currentHostingWho: "",
  emailKind: null,
  domainAccess: null,
  domainWho: "",
  portability: null,
  stance: null,
  whoLooksAfterIt: null,
  monthlyCost: null,
  notes: "",
};

export type Choice<T extends string> = { id: T; label: string; note?: string };

export type Question = {
  id: keyof TakeOnAnswers;
  section: string;
  question: string;
  /** Why it is being asked. Shown, because an unexplained question feels like a form. */
  why: string;
  choices: Choice<string>[];
  /** Shown only when one of these answers is picked. */
  followUp?: { id: keyof TakeOnAnswers; when: string[]; label: string; placeholder: string };
};

export const QUESTIONS: Question[] = [
  {
    id: "currentHosting",
    section: "What you already have",
    question: "Do you pay anyone a monthly or yearly fee for your website or your business email?",
    why: "If you are already paying for something that can host the new site, that is usually the cheapest and simplest answer, and it is already in your name.",
    choices: [
      { id: "yes-known", label: "Yes, and I know who it is" },
      { id: "yes-unknown", label: "Yes, but I am not sure who" },
      { id: "no", label: "No, nothing" },
      { id: "unsure", label: "I honestly do not know" },
    ],
    followUp: {
      id: "currentHostingWho",
      when: ["yes-known", "yes-unknown"],
      label: "Who, if you know? A guess is fine.",
      placeholder: "Xneelo, Afrihost, GoDaddy, the person who did the last site...",
    },
  },
  {
    id: "emailKind",
    section: "What you already have",
    question: "What does your business email address look like?",
    why: "An address on your own business name means a domain and mail hosting already exist somewhere. That changes what we do next.",
    choices: [
      { id: "own-domain", label: "It ends in my business name, like me@mybusiness.co.za" },
      { id: "free", label: "It is a Gmail, Outlook, Yahoo or Webmail address" },
      { id: "none", label: "I do not really use email for the business" },
    ],
  },
  {
    id: "domainAccess",
    section: "What you already have",
    question: "Your web address, mybusiness.co.za, can you log in to wherever it was bought?",
    why: "The web address is the one thing that is genuinely hard to recover if nobody knows who controls it. Better to find out now than the week we go live.",
    choices: [
      { id: "yes", label: "Yes, I can get into it" },
      { id: "someone-else", label: "Somebody else set it up and holds it" },
      { id: "dont-have", label: "I do not have a web address yet" },
      { id: "unsure", label: "I am not sure what this means" },
    ],
    followUp: {
      id: "domainWho",
      when: ["someone-else", "unsure"],
      label: "Any idea who? Even a first name helps.",
      placeholder: "My nephew, the previous web company, our IT guy...",
    },
  },
  {
    id: "portability",
    section: "How you want it to work",
    question:
      "Two years from now, if you wanted somebody else to work on the site, how much would it matter that they could take it over without involving me?",
    why: "There is no wrong answer. It decides whose name the accounts go in, and I would rather you chose than have me assume.",
    choices: [
      { id: "high", label: "A lot. I want to be able to move without asking anybody's permission." },
      { id: "medium", label: "Somewhat. I would like the option, but I am not planning on it." },
      { id: "low", label: "Not much. I would rather it just kept working and somebody else worried about it." },
    ],
  },
  {
    id: "stance",
    section: "How you want it to work",
    question: "Which of these sounds more like you?",
    why: "This is the trade-off in one question: control costs a little admin and sometimes a little money, and handing it over costs neither but ties you to me.",
    choices: [
      {
        id: "own-it",
        label: "I would rather own every account myself",
        note: "Even if that means a small monthly bill and the occasional email from a hosting company.",
      },
      {
        id: "hands-off",
        label: "I would rather have nothing to manage",
        note: "No accounts, no logins to keep, no monthly bill. You look after it.",
      },
      { id: "no-preference", label: "I genuinely do not mind. Tell me what you would do." },
    ],
  },
  {
    id: "whoLooksAfterIt",
    section: "How you want it to work",
    question: "Is there anyone who looks after computers and IT for the business?",
    why: "If there is somebody technical already, the accounts usually belong with them, and they will want to know this exists.",
    choices: [
      { id: "me", label: "Me, more or less" },
      { id: "someone-inside", label: "Somebody else who works here" },
      { id: "outside-company", label: "An outside IT company" },
      { id: "nobody", label: "Nobody, really" },
    ],
  },
  {
    id: "monthlyCost",
    section: "How you want it to work",
    question: "Would a hosting cost of roughly R100 to R250 a month be a problem?",
    why: "Most sites I build cost nothing or close to nothing to host. Some genuinely need more. Knowing your answer stops me quoting you something you did not want.",
    choices: [
      { id: "fine", label: "That is fine" },
      { id: "prefer-not", label: "I would rather avoid it if there is a sensible alternative" },
      { id: "problem", label: "Yes, that would be a problem" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* The recommendation                                                  */
/* ------------------------------------------------------------------ */

export type HostingPlan = "existing-host" | "own-free" | "own-paid" | "my-account";

export type Recommendation = {
  plan: HostingPlan;
  title: string;
  /** Said to the customer, in their words. */
  summary: string;
  monthly: string;
  /** What each side has to do to set it up. */
  theyDo: string[];
  iDo: string[];
  /** How they leave. Written down whichever option this is. */
  exit: string;
  /** Things for me to chase before the build. Not shown to the customer. */
  flags: string[];
};

/** A shop or an integration needs a server. A brochure site does not. */
export function needsServer(answers: Answers): boolean {
  return answers.sell !== "no" || answers.integrations.length > 0;
}

const ALWAYS_YOURS =
  "The web address is registered in your name and the code is handed to you as a file you keep, whichever of these we pick. Only where the site runs is in question.";

/**
 * The default is that I carry it.
 *
 * This started out the other way round and it was wrong. Recommending that
 * somebody create their own hosting account is recommending homework, and the
 * customers here run plumbing businesses. The whole proposition is that the
 * technical burden is mine. A recommendation that begins "first, create an
 * account" is a barrier dressed up as a principle.
 *
 * Owning something means being able to take it and having nobody able to stop
 * you. It does not mean holding the keys yourself. So the domain is in their
 * name and the code is in their hands from launch either way, and the running
 * of it is mine unless they have actively said they want it.
 *
 * An account in their name is therefore only recommended when they have asked
 * for one: either they said they would rather own everything, or they said
 * being able to leave without involving me matters a lot. Both are real
 * answers and both are honoured. Neither is the default.
 */
function wantsTheKeys(take: TakeOnAnswers): boolean {
  return take.stance === "own-it" || take.portability === "high";
}

export function recommend(take: TakeOnAnswers, answers: Answers): Recommendation {
  const server = needsServer(answers);
  const hasHost = take.currentHosting === "yes-known" || take.currentHosting === "yes-unknown";
  const ownDomainEmail = take.emailKind === "own-domain";
  const theirs = wantsTheKeys(take);

  const flags: string[] = [];
  if (take.domainAccess === "someone-else" || take.domainAccess === "unsure") {
    flags.push(
      `Domain control is unclear${take.domainWho.trim() ? ` (they said: ${take.domainWho.trim()})` : ""}. Chase this before the build starts, not the week of launch.`,
    );
  }
  if (take.currentHosting === "yes-unknown" || take.currentHosting === "unsure") {
    flags.push("They pay someone but do not know who. Find the invoice before assuming there is nothing to reuse.");
  }
  if (take.whoLooksAfterIt === "outside-company") {
    flags.push("There is an outside IT company. Loop them in early. They will have opinions about DNS and email.");
  }
  if (take.stance === "hands-off" && take.portability === "high") {
    flags.push("They want no admin AND full portability. Those pull against each other, so it is worth a sentence on the call.");
  }
  if (theirs) {
    flags.push("They have asked to hold the accounts themselves. Walk them through the signup on the call rather than emailing steps.");
  }

  const carriedByMe = (why: string): Recommendation => ({
    plan: "my-account",
    title: "I look after it",
    summary: `${why} So it runs on my account and there is nothing for you to set up, sign up for, or remember. ${ALWAYS_YOURS}`,
    monthly: "Nothing to you.",
    theyDo: ["Nothing at all."],
    iDo: [
      "Set the whole thing up and run it.",
      "Register the web address in your name, so it is legally yours from the start.",
      "Hand you a copy of the site's code at launch, as a file you keep.",
      "Give you a handover document listing everything, including exactly how to take it off me.",
    ],
    exit: "You ask, and I move it to wherever you want it. It takes an afternoon, there is no charge, and I do not need to be feeling co-operative for it to work: the handover document tells any developer everything they need.",
    flags,
  });

  if (server) {
    if (theirs) {
      return {
        plan: "own-paid",
        title: "A platform account in your name",
        summary: `Your site needs a server to run, which is what a shop or a connected system means. You have said you would rather hold the accounts yourself, so this one is yours. ${ALWAYS_YOURS}`,
        monthly: "Roughly R100 to R400 a month depending on the platform, billed to you directly.",
        theyDo: [
          "Sign up for the hosting account. I will do it with you on a call rather than sending you instructions.",
          "Invite me to it so I can build and look after the site.",
        ],
        iDo: [
          "Sit on a call and do the signup with you, so it takes ten minutes once rather than an evening of guessing.",
          "Build, deploy and maintain the site from inside your account.",
          "Never hold your password. I work as an invited member, under my own login.",
        ],
        exit: "You remove me from the account. That is the whole process. Nothing moves.",
        flags,
      };
    }
    return carriedByMe("Your site needs a proper platform to run on, and you have not asked to manage accounts.");
  }

  if (hasHost && ownDomainEmail) {
    return {
      plan: "existing-host",
      title: "On the hosting you already pay for",
      summary: `You are already paying somebody for hosting and email on your own business name, and your site does not need anything a server has to run. So it goes onto what you already have. No new accounts, no new bills, and it is already in your name. ${ALWAYS_YOURS}`,
      monthly: "Nothing new. You carry on paying what you already pay.",
      theyDo: ["Nothing, if I can work out who your host is from the invoice. If not, I will ask you for one thing."],
      iDo: [
        "Track down who your hosting is with and get access sorted.",
        "Check it can host the site properly, and tell you honestly if it cannot.",
        "Put the site there and point the web address at it.",
      ],
      exit: "It is already your account. There is nothing to take back.",
      flags,
    };
  }

  if (theirs) {
    return {
      plan: "own-free",
      title: "A free hosting account in your name",
      summary: `Your site does not need a server to run, so hosting it is genuinely free. Not a trial, not a first year. Free. You have said you would rather hold the accounts yourself, so it goes in one of yours. ${ALWAYS_YOURS}`,
      monthly: "Nothing. The web address is the only thing you pay for, and that is a few hundred rand a year.",
      theyDo: ["Sign up for one free account. I will do it with you on a call, it takes about five minutes."],
      iDo: [
        "Do the signup with you rather than sending you steps to follow alone.",
        "Build and deploy the site inside your account.",
        "Never hold your password. I work as an invited member, under my own login.",
      ],
      exit: "You remove me from the account. That is the whole process. Nothing moves.",
      flags,
    };
  }

  return carriedByMe("Your site does not need expensive hosting, and you have not asked to manage accounts.");
}

/** Every question answered? The free-text ones are optional by design. */
export function isComplete(take: TakeOnAnswers): boolean {
  return QUESTIONS.every((q) => take[q.id] !== null && take[q.id] !== "");
}
