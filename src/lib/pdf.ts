/**
 * Preliminary estimate PDF.
 *
 * Built with pdf-lib rather than a headless browser: it is pure JavaScript with
 * the standard font metrics compiled in, so it works in a serverless function
 * with no font files on disk and no Chromium to cold-start.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { groupLines, type Estimate, type Answers } from "./estimate";
import {
  ACCURACY_BAND,
  CARE_PLAN,
  INTEGRATIONS,
  formatMoney,
} from "./rate-card";
import { SITE } from "./site";

/* pdf-lib's standard fonts are WinAnsi. Anything outside that set throws at
   draw time, which is exactly the kind of failure that only shows up on the one
   submission containing an em dash. Map the characters we actually use and
   strip the rest rather than crash. */
const CHAR_MAP: Record<string, string> = {
  "—": "-",
  "–": "-",
  "‘": "'",
  "’": "'",
  "“": '"',
  "”": '"',
  "…": "...",
  "±": "+/-",
  "→": "->",
  "×": "x",
  "•": "-",
  " ": " ",
  " ": " ",
  " ": " ",
};

function safe(text: string): string {
  let out = "";
  for (const ch of String(text ?? "")) {
    if (CHAR_MAP[ch] !== undefined) {
      out += CHAR_MAP[ch];
      continue;
    }
    // Any other Unicode space becomes a normal one. Dropping it instead would
    // silently glue two words together.
    if (/\s/.test(ch) && ch !== "\n") {
      out += " ";
      continue;
    }
    const code = ch.codePointAt(0) ?? 0;
    // Printable ASCII plus the Latin-1 range pdf-lib's WinAnsi covers.
    if ((code >= 32 && code <= 126) || (code >= 160 && code <= 255)) {
      out += ch;
    } else if (ch === "\n") {
      out += "\n";
    }
    // Anything else (emoji, CJK, exotic punctuation) is dropped.
  }
  return out;
}

const INK = rgb(0.02, 0.027, 0.043);
const TURQ = rgb(0.086, 0.686, 0.62);
const PINK = rgb(0.88, 0.208, 0.498);
const BODY = rgb(0.22, 0.26, 0.31);
const MUTED = rgb(0.45, 0.5, 0.56);
const HAIRLINE = rgb(0.86, 0.88, 0.9);
const WASH = rgb(0.965, 0.976, 0.98);

const PAGE_W = 595.28; // A4 portrait
const PAGE_H = 841.89;
const MARGIN = 52;
const CONTENT_W = PAGE_W - MARGIN * 2;

type Ctx = {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
  pageNumber: number;
};

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const paragraphs = safe(text).split("\n");
  const lines: string[] = [];

  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
      } else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function newPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  ctx.pageNumber += 1;
  ctx.y = PAGE_H - MARGIN;
}

function ensure(ctx: Ctx, needed: number) {
  if (ctx.y - needed < MARGIN + 46) newPage(ctx);
}

function text(
  ctx: Ctx,
  content: string,
  opts: {
    size?: number;
    bold?: boolean;
    color?: ReturnType<typeof rgb>;
    x?: number;
    width?: number;
    lineHeight?: number;
    gapAfter?: number;
  } = {},
) {
  const size = opts.size ?? 10;
  const font = opts.bold ? ctx.bold : ctx.regular;
  const color = opts.color ?? BODY;
  const x = opts.x ?? MARGIN;
  const width = opts.width ?? CONTENT_W;
  const lh = opts.lineHeight ?? size * 1.45;

  const lines = wrap(content, font, size, width);
  for (const line of lines) {
    ensure(ctx, lh);
    ctx.page.drawText(line, { x, y: ctx.y - size, size, font, color });
    ctx.y -= lh;
  }
  ctx.y -= opts.gapAfter ?? 0;
}

function rule(ctx: Ctx, color = HAIRLINE) {
  ensure(ctx, 12);
  ctx.page.drawRectangle({ x: MARGIN, y: ctx.y - 1, width: CONTENT_W, height: 0.8, color });
  ctx.y -= 12;
}

export type PdfInput = {
  answers: Answers;
  estimate: Estimate;
  reference: string;
  dateLabel: string;
};

export async function buildEstimatePdf({
  answers,
  estimate,
  reference,
  dateLabel,
}: PdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const ctx: Ctx = {
    doc,
    page: doc.addPage([PAGE_W, PAGE_H]),
    y: PAGE_H,
    regular,
    bold,
    pageNumber: 1,
  };

  doc.setTitle(`Preliminary estimate ${reference} - ${SITE.name}`);
  doc.setAuthor(SITE.name);
  doc.setSubject("Preliminary website estimate - not a quote");
  doc.setProducer(SITE.name);
  doc.setCreator(SITE.name);

  /* ── Header band ─────────────────────────────────────────────────────── */
  const bandH = 108;
  ctx.page.drawRectangle({ x: 0, y: PAGE_H - bandH, width: PAGE_W, height: bandH, color: INK });
  ctx.page.drawRectangle({ x: 0, y: PAGE_H - bandH, width: PAGE_W, height: 3, color: TURQ });

  ctx.page.drawCircle({ x: MARGIN + 4, y: PAGE_H - 44, size: 4, color: TURQ });
  ctx.page.drawText(safe("built by a real person"), {
    x: MARGIN + 16,
    y: PAGE_H - 48,
    size: 12.5,
    font: bold,
    color: rgb(1, 1, 1),
  });
  ctx.page.drawText(safe("Preliminary estimate"), {
    x: MARGIN,
    y: PAGE_H - 82,
    size: 22,
    font: bold,
    color: rgb(1, 1, 1),
  });

  const refLabel = safe(reference);
  ctx.page.drawText(refLabel, {
    x: PAGE_W - MARGIN - bold.widthOfTextAtSize(refLabel, 11),
    y: PAGE_H - 48,
    size: 11,
    font: bold,
    color: TURQ,
  });
  const dLabel = safe(dateLabel);
  ctx.page.drawText(dLabel, {
    x: PAGE_W - MARGIN - regular.widthOfTextAtSize(dLabel, 9.5),
    y: PAGE_H - 82,
    size: 9.5,
    font: regular,
    color: rgb(0.62, 0.68, 0.74),
  });

  ctx.y = PAGE_H - bandH - 30;

  /* ── Who it is for ───────────────────────────────────────────────────── */
  text(ctx, "PREPARED FOR", { size: 7.6, bold: true, color: MUTED, gapAfter: 4 });
  text(ctx, `${answers.business}`, { size: 15, bold: true, color: INK, gapAfter: 1 });
  text(ctx, `${answers.name} · ${answers.email}${answers.phone ? ` · ${answers.phone}` : ""}`, {
    size: 9.5,
    color: MUTED,
    gapAfter: 18,
  });

  /* ── The warning box. This is the whole point of the document. ───────── */
  const warnLines = wrap(
    `This is NOT a quote. It is a preliminary estimate produced from the answers you gave, before I have seen your business, your content or your existing site. Treat it as a budget guide only.`,
    regular,
    9.8,
    CONTENT_W - 32,
  );
  const warnH = 30 + warnLines.length * 14 + 20;
  ensure(ctx, warnH);
  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.y - warnH,
    width: CONTENT_W,
    height: warnH,
    color: rgb(1, 0.957, 0.976),
    borderColor: PINK,
    borderWidth: 1.2,
  });
  ctx.page.drawRectangle({ x: MARGIN, y: ctx.y - warnH, width: 3.5, height: warnH, color: PINK });

  ctx.page.drawText(safe("PLEASE READ THIS FIRST"), {
    x: MARGIN + 16,
    y: ctx.y - 22,
    size: 9,
    font: bold,
    color: PINK,
  });
  warnLines.forEach((line, i) => {
    ctx.page.drawText(line, {
      x: MARGIN + 16,
      y: ctx.y - 40 - i * 14,
      size: 9.8,
      font: regular,
      color: rgb(0.42, 0.1, 0.24),
    });
  });
  ctx.y -= warnH + 22;

  /* ── The number ──────────────────────────────────────────────────────── */
  const heroH = 92;
  ensure(ctx, heroH + 10);
  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.y - heroH,
    width: CONTENT_W,
    height: heroH,
    color: WASH,
    borderColor: HAIRLINE,
    borderWidth: 1,
  });

  ctx.page.drawText(safe("ESTIMATED TOTAL"), {
    x: MARGIN + 20,
    y: ctx.y - 26,
    size: 7.6,
    font: bold,
    color: MUTED,
  });
  ctx.page.drawText(safe(formatMoney(estimate.total)), {
    x: MARGIN + 20,
    y: ctx.y - 60,
    size: 30,
    font: bold,
    color: INK,
  });
  ctx.page.drawText(safe("excluding VAT"), {
    x: MARGIN + 22 + bold.widthOfTextAtSize(safe(formatMoney(estimate.total)), 30),
    y: ctx.y - 60,
    size: 8.5,
    font: regular,
    color: MUTED,
  });
  ctx.page.drawText(
    safe(
      `The final fixed quote will land between ${formatMoney(estimate.low)} and ${formatMoney(
        estimate.high,
      )} - within ${Math.round(ACCURACY_BAND * 100)}% of the figure above.`,
    ),
    { x: MARGIN + 20, y: ctx.y - 78, size: 8.8, font: regular, color: BODY },
  );

  const daysText = safe(`${estimate.daysLow}-${estimate.daysHigh} working days`);
  ctx.page.drawText(daysText, {
    x: PAGE_W - MARGIN - 20 - bold.widthOfTextAtSize(daysText, 11),
    y: ctx.y - 34,
    size: 11,
    font: bold,
    color: TURQ,
  });
  const daysLabel = safe("ESTIMATED BUILD TIME");
  ctx.page.drawText(daysLabel, {
    x: PAGE_W - MARGIN - 20 - regular.widthOfTextAtSize(daysLabel, 7.6),
    y: ctx.y - 22,
    size: 7.6,
    font: regular,
    color: MUTED,
  });

  ctx.y -= heroH + 26;

  /* ── Line items ──────────────────────────────────────────────────────── */
  text(ctx, "What makes up that number", { size: 13, bold: true, color: INK, gapAfter: 4 });
  text(
    ctx,
    "Every line comes from the published rate card on builtbyarealperson.com/pricing. Nothing is hidden and nothing is added later.",
    { size: 9, color: MUTED, gapAfter: 12 },
  );

  for (const group of groupLines(estimate.lines)) {
    ensure(ctx, 46);
    text(ctx, group.group.toUpperCase(), { size: 7.6, bold: true, color: TURQ, gapAfter: 5 });

    for (const line of group.lines) {
      const amount = safe(formatMoney(line.amount));
      const amountW = bold.widthOfTextAtSize(amount, 10.5);
      const labelW = CONTENT_W - amountW - 24;

      const labelLines = wrap(line.label, bold, 10.5, labelW);
      const detailLines = line.detail ? wrap(line.detail, regular, 8.6, labelW) : [];
      const blockH = labelLines.length * 14 + detailLines.length * 11.5 + 12;

      ensure(ctx, blockH);
      const top = ctx.y;

      labelLines.forEach((l, i) => {
        ctx.page.drawText(l, { x: MARGIN, y: top - 10.5 - i * 14, size: 10.5, font: bold, color: INK });
      });
      detailLines.forEach((l, i) => {
        ctx.page.drawText(l, {
          x: MARGIN,
          y: top - 10.5 - labelLines.length * 14 - i * 11.5,
          size: 8.6,
          font: regular,
          color: MUTED,
        });
      });

      ctx.page.drawText(amount, {
        x: PAGE_W - MARGIN - amountW,
        y: top - 10.5,
        size: 10.5,
        font: bold,
        color: line.isSurcharge ? PINK : INK,
      });

      ctx.y = top - blockH;
    }
    ctx.y -= 6;
    rule(ctx);
  }

  /* ── Totals ──────────────────────────────────────────────────────────── */
  ensure(ctx, 70);
  if (estimate.surcharge > 0) {
    const sub = safe(formatMoney(estimate.subtotal));
    ctx.page.drawText(safe("Subtotal"), { x: MARGIN, y: ctx.y - 11, size: 10, font: regular, color: BODY });
    ctx.page.drawText(sub, {
      x: PAGE_W - MARGIN - regular.widthOfTextAtSize(sub, 10),
      y: ctx.y - 11,
      size: 10,
      font: regular,
      color: BODY,
    });
    ctx.y -= 20;
  }

  const totalStr = safe(formatMoney(estimate.total));
  ctx.page.drawRectangle({ x: MARGIN, y: ctx.y - 34, width: CONTENT_W, height: 34, color: INK });
  ctx.page.drawText(safe("ESTIMATED TOTAL (excl. VAT)"), {
    x: MARGIN + 14,
    y: ctx.y - 22,
    size: 9,
    font: bold,
    color: rgb(1, 1, 1),
  });
  ctx.page.drawText(totalStr, {
    x: PAGE_W - MARGIN - 14 - bold.widthOfTextAtSize(totalStr, 13),
    y: ctx.y - 23.5,
    size: 13,
    font: bold,
    color: TURQ,
  });
  ctx.y -= 34 + 24;

  /* ── Your answers, so they can check them ───────────────────────────── */
  ensure(ctx, 90);
  text(ctx, "What you told me", { size: 13, bold: true, color: INK, gapAfter: 4 });
  text(
    ctx,
    "If any of this is wrong, the number is wrong. Reply to the email and I will redo it.",
    { size: 9, color: MUTED, gapAfter: 10 },
  );

  const integrationLabels = answers.integrations
    .map((id) => INTEGRATIONS.find((i) => i.id === id)?.label)
    .filter(Boolean)
    .join(", ");

  const summary: [string, string][] = [
    ["Existing website", answers.hasSite ? answers.currentUrl.trim() || "Yes" : "None yet"],
    ["Selling online", answers.sell === "no" ? "No - enquiries only" : answers.sell === "simple" ? "Small catalogue" : "Full online shop"],
    ["Connections needed", integrationLabels || "None"],
    ["Market", answers.market === "intl" ? "South Africa and abroad" : "South Africa only"],
    ["Brand", answers.brand === "have-all" ? "Logo and guidelines exist" : answers.brand === "have-logo" ? "Logo only" : "Needs designing"],
    ["Words", answers.copy === "written" ? "I write them" : "You supply them"],
    ["Domain", answers.domain === "own-access" ? "Owned, with access" : answers.domain === "own-no-access" ? "Owned, controlled by a third party" : "Not yet registered"],
    ["Timing", answers.timeline === "rush" ? "As fast as possible (priority)" : answers.timeline === "soon" ? "Within a month" : "No particular rush"],
  ];

  for (const [label, value] of summary) {
    ensure(ctx, 16);
    ctx.page.drawText(safe(label), { x: MARGIN, y: ctx.y - 9.5, size: 9, font: bold, color: BODY });
    const valueLines = wrap(value, regular, 9, CONTENT_W - 150);
    valueLines.forEach((l, i) => {
      ctx.page.drawText(l, { x: MARGIN + 150, y: ctx.y - 9.5 - i * 12, size: 9, font: regular, color: MUTED });
    });
    ctx.y -= Math.max(16, valueLines.length * 12 + 4);
  }

  if (answers.notes.trim()) {
    ensure(ctx, 30);
    // Label and value share a baseline, like every other row above.
    ctx.page.drawText(safe("Your notes"), { x: MARGIN, y: ctx.y - 9.5, size: 9, font: bold, color: BODY });
    text(ctx, answers.notes.trim(), {
      size: 9,
      color: MUTED,
      x: MARGIN + 150,
      width: CONTENT_W - 150,
      lineHeight: 12,
    });
  }

  ctx.y -= 18;

  /* ── What happens next ───────────────────────────────────────────────── */
  ensure(ctx, 130);
  rule(ctx);
  text(ctx, "What happens next", { size: 13, bold: true, color: INK, gapAfter: 10 });

  const steps = [
    "I read your answers properly - a person, today, not a queue.",
    "I send you a link to book a 30-minute Teams call at a time that suits you.",
    "On that call we work out what the site actually has to do for your business.",
    "You get a fixed written quote afterwards. That one is binding, and it will sit inside the range on this page.",
  ];

  steps.forEach((step, i) => {
    ensure(ctx, 26);
    const top = ctx.y;
    ctx.page.drawCircle({ x: MARGIN + 6, y: top - 8, size: 8, color: WASH });
    ctx.page.drawText(safe(String(i + 1)), {
      x: MARGIN + 3.5,
      y: top - 11,
      size: 8.5,
      font: bold,
      color: TURQ,
    });
    const lines = wrap(step, regular, 9.4, CONTENT_W - 30);
    lines.forEach((l, li) => {
      ctx.page.drawText(l, { x: MARGIN + 24, y: top - 11 - li * 13, size: 9.4, font: regular, color: BODY });
    });
    ctx.y = top - Math.max(24, lines.length * 13 + 10);
  });

  ctx.y -= 10;
  ensure(ctx, 54);
  const noteH = 48;
  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.y - noteH,
    width: CONTENT_W,
    height: noteH,
    color: rgb(0.945, 0.992, 0.984),
    borderColor: TURQ,
    borderWidth: 1,
  });
  ctx.page.drawText(safe("No deposit is taken and nothing is owed until you accept a fixed written quote."), {
    x: MARGIN + 16,
    y: ctx.y - 20,
    size: 9.4,
    font: bold,
    color: rgb(0.05, 0.35, 0.32),
  });
  ctx.page.drawText(
    safe(
      `The optional care plan is ${formatMoney(CARE_PLAN.monthly)} a month and is never included in the total above.`,
    ),
    { x: MARGIN + 16, y: ctx.y - 34, size: 8.6, font: regular, color: rgb(0.2, 0.42, 0.4) },
  );

  /* ── Footers ─────────────────────────────────────────────────────────── */
  const pages = doc.getPages();
  pages.forEach((page, i) => {
    page.drawRectangle({ x: MARGIN, y: MARGIN - 6, width: CONTENT_W, height: 0.8, color: HAIRLINE });
    page.drawText(safe(`${SITE.domain}  ·  ${SITE.email}`), {
      x: MARGIN,
      y: MARGIN - 20,
      size: 7.8,
      font: regular,
      color: MUTED,
    });
    const right = safe(`${reference}  ·  Page ${i + 1} of ${pages.length}  ·  Estimate, not a quote`);
    page.drawText(right, {
      x: PAGE_W - MARGIN - regular.widthOfTextAtSize(right, 7.8),
      y: MARGIN - 20,
      size: 7.8,
      font: regular,
      color: MUTED,
    });
  });

  return doc.save();
}
