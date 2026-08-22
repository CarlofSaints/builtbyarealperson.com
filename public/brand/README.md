# Brand assets

Rendered from the real brand values and the real display font, so these match
the site rather than approximating it. Regenerate rather than edit by hand.

| File | Size | Use it for |
| --- | --- | --- |
| `logo-wordmark-light.png` | 1400×300, transparent | **The logo, for white backgrounds** — Microsoft Bookings, email headers, invoices, anything on paper |
| `logo-wordmark-dark.png` | 1400×300, transparent | The same lockup for dark backgrounds |
| `logo-mark.png` | 512×512 | The icon on its own — social avatars, app tiles, anywhere square and small |
| `share-card.png` | 1200×630 | Full-size share card. The site serves its own compressed copy at `/opengraph-image.jpg` |

The wordmark gradient is three-stop, matching the site's
`linear-gradient(100deg, turq 0%, #7de0d6 35%, pink 100%)`. A two-stop
turquoise-to-pink slides through grey in the middle and looks muddy — the mid
stop is what stops that.

The light and dark versions are not the same file recoloured by accident: the
site's turquoise `#2ae8ce` is tuned for a near-black background and is far too
pale to read on white. The light version uses `#0f9e8c`, the same turquoise the
estimate emails already use on their white background.

## The mark

Concentric ridges knocked out of the gradient disc: a fingerprint. One specific
human made this, which is the argument the whole business rests on and the exact
opposite of generic AI output.

**Detail threshold.** Below about 46px across, the ridges close up into a smudge,
so the mark drops them and falls back to the plain gradient dot the site header
already animates. That is why the favicon and the share card wordmark are drawn
at sizes above the threshold rather than shrunk down from the 512px version —
shrinking produces the smudge the threshold exists to avoid.

**The mark renders on its own transparent canvas and is then composited.**
Knocking the ridges out directly onto a target erases the background behind them
as well, punching holes through to whatever sits underneath.

`logo-wordmark-signature.png` is the same lockup at 672×144 — the email
signature's 224×48 at 3×. It exists separately because the mark has to be
*drawn* at its final size for the detail threshold to make the right call.
Scaling the 1400px version down to signature width draws the ridges and then
shrinks them into a smudge; drawing at 43px drops them and leaves a clean dot,
which is what you actually want at 14px on screen.

## Social

`fb-cover.png` — 1640×856, the Facebook page cover. Two constraints shape it,
and the share card fails both:

- **The profile picture sits bottom-centre and covers the middle of the image.**
  On the current Facebook page layout it is roughly 300px across, centred, about
  80% of the way down. Everything readable therefore lives in the top 60%.
- **Mobile crops the sides.** Only the central ~1280px of the 1640 survives, so
  nothing important goes outside that, including the wordmark.

Both were checked by drawing the profile-picture circle and the mobile crop over
the design as guides before exporting without them.
