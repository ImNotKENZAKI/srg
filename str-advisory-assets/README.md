# STR cinematic landing page

Adds `/str-advisory-review.html`, its self-contained `str-advisory-assets/` directory and `sitemap-str.xml`. Existing pages, shared assets, routing and sitemaps are unchanged.

Expected public URL after merge/deployment: https://review.srgadvisors.com/str-advisory-review.html

The approved cinematic design retains its one-gesture opening, horizontal financial story, architectural cutaway, service shutters and static review form. Motion caches layout and changed styles, culls offscreen scenes, scopes compositor hints to nearby scenes and releases blocking opening listeners after completion/cancellation.

SEO: index/follow metadata, self-canonical URL, complete Open Graph/X fields with a 1200x630 JPEG, WebPage/Organization/Service JSON-LD and a standalone sitemap. All service copy is present in the initial HTML. After deployment, submit https://review.srgadvisors.com/sitemap-str.xml to the existing Search Console property; no shared robots or sitemap file was changed. Search indexing/rankings are not guaranteed.

The original GHL iframe `l0RxE6mTYuBdDQD23Rrd` and vendor attributes/script are unchanged. No form submission interception, new fields, calendar links or automation changes. Contact details lead to the existing detailed review and manual SRG assessment.

Validation records, generated-image originals/prompts and release ZIPs are kept in the local STR working folder, not deployed. Before merging, review the add-only diff and the checks in the PR. After deployment, verify the page, assets, canonical/social URL and sitemap responses. A controlled GHL submission/routing test remains separate from read-only form rendering checks.

SEO references:
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
