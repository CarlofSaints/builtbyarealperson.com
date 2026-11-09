import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${SITE.name} handles your personal information.`,
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    h: "Who is responsible",
    p: [
      `${SITE.name} is a trading name of ${SITE.legal.name}, registration ${SITE.legal.registration}. Our Information Officer under the Protection of Personal Information Act (POPIA) is ${SITE.legal.informationOfficer}.`,
    ],
  },
  {
    h: "What I collect",
    p: [
      "When you ask for an estimate: your name, business, email address, phone number if you give it, your notes and your answers about the website you want.",
      "When you send the estimate form, the site also records your IP address, your browser details and the page that sent you there.",
      "When we work together: what you tell me in the setup questions, your comments on the work, and any review you choose to leave.",
      "If I contacted you about your business website first, I used business contact details that were publicly available. I keep your business name, contact name, email address, how I found you, and a screenshot and mock-up I made for you.",
    ],
  },
  {
    h: "Why I use it",
    p: [
      "To send your estimate, quote you, build what you asked for, and contact you about that work. You are not put on a mailing list. A review is only published in the way you chose when you left it.",
      "If I contacted you first, I use your details to send you one email offering a new website, because it may be useful to your business. To stop this, reply to that email or write to the address below and I will delete your details and not contact you again.",
    ],
  },
  {
    h: "Who else handles it",
    p: [
      "The site runs on Vercel, where enquiries are stored, and email is sent through Resend. Emails to me arrive in a Microsoft mailbox. If you book a call, the booking tool and Microsoft Teams receive what you enter there. These service providers may process the information outside South Africa. I do not sell your information.",
    ],
  },
  {
    h: "Cookies",
    p: ["The public site sets no tracking or advertising cookies."],
  },
  {
    h: "How long I keep it",
    p: [
      "I delete estimates that never became a project, and the details of businesses I contacted first, 12 months after the last activity on them. If your project goes ahead, I keep its records for as long as accounting and tax law requires. You can ask me to delete your information sooner, unless the law requires me to keep it as a business record.",
    ],
  },
  {
    h: "Your rights",
    p: [
      "You can ask to see, correct or delete your information, or object to how it is used, by emailing the address below. You may also complain to the Information Regulator of South Africa.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <section className="u-glow relative overflow-hidden px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
      <div className="relative mx-auto max-w-3xl">
        <Eyebrow>Privacy</Eyebrow>
        <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
          Your information
        </h1>
        {SECTIONS.map((s) => (
          <div key={s.h} className="mt-10">
            <h2 className="font-display text-xl font-bold tracking-tight text-text">{s.h}</h2>
            {s.p.map((t) => (
              <p key={t} className="mt-3 text-[17px] leading-relaxed text-muted">{t}</p>
            ))}
          </div>
        ))}
        <p className="mt-10 text-[17px] leading-relaxed text-muted">
          Contact:{" "}
          <a href={`mailto:${SITE.email}`} className="text-turq underline-offset-4 hover:underline">
            {SITE.email}
          </a>
        </p>
      </div>
    </section>
  );
}
