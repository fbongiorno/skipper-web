# Skipper Content Hub

30 SEO-optimized content pages for skipper.com, organized across 6 pillars.

## Structure

```
skipper-content/
├── assets/
│   ├── skipper.css       # Shared styles (Playfair Display + DM Sans, navy/gold theme)
│   └── skipper.js        # Shared JS (nav highlighting, FAQ accordion, smooth scroll)
├── destinations/
│   ├── best-sailing-destinations-world/
│   ├── caribbean/
│   │   ├── index.html
│   │   └── british-virgin-islands/
│   └── europe/
│       ├── greece/
│       ├── croatia/
│       ├── turkey/
│       └── spain/
├── guides/
│   ├── bareboat-charter-license-requirements/
│   ├── sailing-for-beginners/
│   ├── how-to-read-nautical-chart/
│   ├── essential-sailing-knots/
│   └── points-of-sail-wind-directions/
├── charter/
│   ├── catamaran-vs-monohull/
│   ├── yacht-charter-cost-guide/
│   ├── bareboat-vs-crewed-charter/
│   ├── crewed-yacht-charter-guide/
│   ├── sailing-charter-croatia/
│   └── catamaran/greece/
├── routes/
│   ├── greek-islands-7-day-cyclades/
│   ├── croatia-7-day-split-dubrovnik/
│   ├── caribbean-sailing-routes/
│   ├── mediterranean-2-week-italy-greece/
│   └── ionian-islands-10-day/
├── planning/
│   ├── sailing-trip-budget-guide/
│   ├── best-time-to-sail-mediterranean/
│   ├── sailing-trip-packing-list/
│   └── best-time-to-sail-caribbean/
├── magazine/
│   ├── sailing-cyclades-solo/
│   ├── bareboat-license-at-40/
│   └── most-beautiful-anchorages-mediterranean/
└── sitemap.xml
```

## SEO features on every page

- Unique `<title>` and `<meta description>` with primary keyword first
- `<link rel="canonical">` to prevent duplicate content
- Open Graph tags for social sharing
- JSON-LD structured data: `Article` + `BreadcrumbList` + `FAQPage` schemas
- Semantic HTML5 (`<nav>`, `<main>`, `<aside>`, `<footer>`)
- Breadcrumb navigation with schema markup
- Internal linking across all 6 content pillars
- Table of contents with anchor links (triggers Google sitelinks)
- FAQ section on every page (targets featured snippets)
- Quick-facts box (targets AI overview cards)

## Deployment to Railway

These are static HTML files. To serve them from your existing Railway app:

```bash
# In your skipper-web repo, copy content into the public/static directory
cp -r skipper-content/* public/

# Or serve via Express static middleware
app.use(express.static(path.join(__dirname, 'skipper-content')))
```

Or deploy as a separate static site. Railway supports static deployments natively.

## Google Search Console

After deploying:
1. Submit `https://www.skipper.com/sitemap.xml` in Google Search Console
2. Request indexing for the 14 high-priority pages first
3. Monitor Coverage and Performance reports weekly

## Next steps

- Add real photography (hero images per destination)
- Localize for French, German, and Italian markets (highest sailing charter demand)
- Add affiliate/booking links post-launch (charter company partnerships)
- Build `/destinations/` and `/guides/` hub index pages to aggregate sub-pages
