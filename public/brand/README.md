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
