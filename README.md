# SRG Advisors funnel site

This repository is the static source for `review.srgadvisors.com` and its Vercel deployment. The existing short and long funnels remain separate from the new Second Opinion journey.

| Route | Purpose |
| --- | --- |
| `/` | Existing short tax and advisory funnel |
| `/strategy` | Existing long nurture funnel |
| `/review` | Existing Private Strategy Review |
| `/thanks` | Existing application confirmation |
| `/second-opinion.html` | New Second Opinion Services (SOS) landing page |
| `/second-opinion-review.html` | Second Opinion Step 2 |
| `/second-opinion-thank-you.html` | Second Opinion confirmation |

## Deploying updates

Commit page changes and all referenced assets together to `main`. The connected Vercel project deploys the commit. Check its status and the intended route after the deployment succeeds. The new landing page does not replace `/`.

The October 11 update replaces the stale Second Opinion HTML that still selected the old illustrations and omitted the new team stylesheet. It includes the approved PNG graphics, SOS button, animation corrections and clean SEO titles. Update the HTML and `second-opinion-assets/` as one release; uploading images alone will not change the page.

Public page titles and URLs have no version labels. Internal asset names retain their existing identifiers to keep dependencies stable. Search metadata uses `https://review.srgadvisors.com`; update absolute URLs in the three Second Opinion page heads and its sitemap if the public domain changes.

## Keeping the repository lean

The October 11 cleanup removes 110 assets with no references from the production pages or their dependencies, including obsolete graphics, duplicate variants and a replaced gallery controller. Original email campaign images, individual staff portraits, canonical team assets, GHL custom styles and active page media remain. Removed files are recoverable from Git history before this cleanup (`10744251fa505709edd74bd198efea8ef229a7cb`).

Do not upload ZIPs, extracted duplicate repositories, local previews, generated masters or QA reports. `.gitignore` keeps these out of normal commits; `.vercelignore` excludes working files and archived handoffs from deployment. Font licenses remain with the font assets.

## Form and review rules

- Step 1 form: `l0RxE6mTYuBdDQD23Rrd`.
- Step 2 form: `AU21lU4ZE6oG9Ia9taW0`.
- SRG manually reviews every application before providing an applicable booking link.
- No public form submission automatically schedules a consultation.
- Use SRG's secure instructions for sensitive documents.

After publishing, check the new landing, Step 2 and confirmation, plus the existing routes. Test desktop, tablet and phone navigation, service transitions, pause/reduced motion, images and form loading. Live submissions and CRM workflows require a controlled test contact; a successful static deployment does not establish CRM delivery.

Sitemaps: `/sitemap-funnel.xml` and `/sitemap-second-opinion.xml`. The latter includes only the public landing; Step 2 and confirmation remain `noindex`.
