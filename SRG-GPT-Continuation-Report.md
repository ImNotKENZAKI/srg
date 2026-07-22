# SRG Advisors Funnel - GPT Continuation Report

Date: July 5, 2026

Prepared for: John Jefferson Manalo, Co-Founder and CTO / Creative Director, Mary Digi Solutions

Purpose: Use this as the starting context for the next GPT/Codex thread so the work can continue without repeating discovery.

## Executive Summary

Mary Digi Solutions is building a dedicated conversion funnel for SRG Advisors, LLC. This is not a full redesign of the normal SRG website. The funnel is a separate landing page built to qualify higher-value CPA, tax, business, real estate, entity, estate, trust, K-1, and complex planning prospects before giving them a consultation path.

The current funnel files are already built and should be preserved. The next work should focus on the GoHighLevel workflow, branch logic, testing, reporting, and final deployment cleanup.

## Current Active Funnel Files

- `strategy-consultation.html`
- `strategy-consultation-thank-you.html`
- `css/funnel.css`
- `js/funnel.js`
- `sitemap-funnel.xml`
- `images/logo.png`
- `images/favicon.png`
- `images/jacobguttmann.jpg`
- `images/LEON.jpg`
- `images/Milt.jpg`
- `images/aicpa.jpg`
- `images/landing.jpg`
- `images/contact_bg.jpg`
- `images/generated/funnel-hero-cpa-concept-01.png`
- `videos/srg-hero-cpa-loop.mp4`

## Important Current Status

The main funnel page already has the live GoHighLevel form embedded.

Current embedded GHL form:

- Form name in HTML: `SRG | Strategy Consultation Application Form`
- Form ID: `cpYvPsitFjJtbRB8PRNI`
- Iframe URL: `https://api.leadconnectorhq.com/widget/form/cpYvPsitFjJtbRB8PRNI`
- Embed script: `https://link.msgsndr.com/js/form_embed.js`

Current redirect note inside the HTML:

- Current GHL post-submit redirect: `https://imnotkenzaki.github.io/srg/strategy-consultation-thank-you.html`
- Replace this with the final SRG-hosted thank-you URL once the funnel is deployed to the real domain.

The thank-you page is already created and should remain `noindex`.

## Business Logic Already Agreed

All form submissions should create or update contacts in GoHighLevel.

Only qualified or review-needed leads should become pipeline opportunities.

The Google Sheet should be used as a backup/reporting log, not as the main CRM.

Calendar booking should stay gated behind qualification. Do not show the booking calendar to every applicant immediately.

Sensitive documents should not be requested in the first form. Do not ask for tax returns, IDs, bank statements, SSNs, financial statements, or private documents at the first step.

## Recommended GHL Flow

1. Visitor lands on `strategy-consultation.html`.
2. Visitor submits the GHL qualification form.
3. GHL creates or updates the contact.
4. GHL applies a base tag such as `SRG Funnel - Submitted`.
5. GHL evaluates qualification fields.
6. Qualified leads receive a qualified tag and can be routed to calendar access.
7. Review-needed leads are assigned for manual review before scheduling.
8. Not immediate fit leads remain as contacts for nurture or later follow-up.
9. Submission is logged to Google Sheets for reporting.
10. Carlyn or the assigned team member receives a notification.

## Suggested Tags

- `SRG Funnel - Submitted`
- `SRG Funnel - Qualified`
- `SRG Funnel - Needs Review`
- `SRG Funnel - Nurture`
- `SRG Funnel - Follow Up Later`

## Suggested Pipeline Stages

- New Application
- Carlyn Review
- Qualified - Calendar Eligible
- Consultation Booked
- Not Fit / Nurture
- Closed / Engaged

## Suggested Google Sheet Columns

- Date Submitted
- Full Name
- Email
- Phone
- Prospect Type
- Estimated Planning Range
- Main Need
- Timeline
- Lead Status
- Assigned To
- GHL Contact Link
- Notes
- Source / UTM

## What Is Already Built

- Separate SRG strategy consultation landing page.
- Separate thank-you page.
- Scoped funnel CSS and JavaScript.
- Live GHL form embed.
- CPA-safe disclaimer and compliance-safe copy.
- Mobile sticky Apply/Call CTA.
- Header call button.
- Hero with video background and fallback poster image.
- Team and trust sections using existing SRG assets.
- FAQ and JSON-LD metadata.
- Noindex thank-you page.
- Sitemap file for the funnel.

## What Not To Do

- Do not rebuild the normal SRG homepage or core website pages.
- Do not replace the live GHL form with a dummy placeholder unless John explicitly asks.
- Do not make claims about guaranteed tax savings, refunds, loopholes, or guaranteed outcomes.
- Do not ask prospects for sensitive documents in the first form.
- Do not give the booking calendar to every applicant by default.
- Do not treat Google Sheets as the CRM. GHL is the CRM.
- Do not broaden the package into the whole mirrored SRG website unless requested.

## Next GPT/Codex Tasks

1. Audit the current GHL screenshots and workflow screens from John.
2. Verify any uncertain GHL behavior against official GoHighLevel or LeadConnector help sources before giving branch-logic advice.
3. Build the exact workflow map:
   - Form submitted
   - Contact created or updated
   - Tags applied
   - Branch logic evaluated
   - Opportunity created only for qualified or review-needed leads
   - Notifications sent
   - Google Sheet row created
   - Thank-you or calendar routing handled
4. Write simple setup instructions that John can follow inside GHL.
5. Build test scenarios for:
   - Qualified lead
   - Review-needed lead
   - Not immediate fit lead
   - Duplicate contact submission
   - Missing required field
6. Confirm the form redirect after the final hosting URL is known.
7. Before production launch, compress or replace `videos/srg-hero-cpa-loop.mp4` because it is still heavy.

## Testing Checklist

Website checks:

- Open `strategy-consultation.html`.
- Confirm the GHL form appears in the application section.
- Confirm the form is not visually cut off on desktop, tablet, or mobile.
- Confirm Apply buttons scroll to the form.
- Confirm Call buttons open the phone link.
- Confirm `strategy-consultation-thank-you.html` loads correctly.
- Confirm the page still looks professional on desktop, tablet, and mobile.

GHL checks:

- Submit a test qualified lead.
- Submit a test review-needed lead.
- Submit a test not-immediate-fit lead.
- Confirm each submission creates or updates a contact.
- Confirm tags apply correctly.
- Confirm opportunities are created only for qualified or review-needed leads.
- Confirm notifications are sent to the correct person.
- Confirm the Google Sheet row is created.
- Confirm the redirect goes to the correct thank-you page.

GitHub Pages checks:

- Upload the package contents to the intended GitHub repository or folder.
- Confirm the entry page URL works.
- Confirm CSS, JS, images, video, and the GHL iframe load.
- Confirm the thank-you URL works before using it as the GHL redirect.

## Known Risks

- The GHL form is loaded from external LeadConnector/GHL URLs, so it needs internet access and correct GHL permissions.
- The current redirect note points to a GitHub preview URL. This should be changed to the final SRG-hosted URL when production hosting is ready.
- The hero video is large and should be compressed before final launch.
- Google Fonts are loaded from external Google URLs.
- This is a static frontend package. CRM logic, emails, notifications, pipeline stages, and sheet logging must be configured inside GHL or connected automations.

## Recommended Final Deployment Path

For temporary review, GitHub Pages is acceptable.

For production, host the funnel under SRG's real domain and update:

- Canonical URLs
- GHL redirect URL
- Sitemap URL
- Tracking scripts
- Any final privacy or terms links

Best production URL target:

- `https://www.srgadvisors.com/strategy-consultation.html`

Thank-you URL target:

- `https://www.srgadvisors.com/strategy-consultation-thank-you.html`

## Current Handoff Point

The funnel package is ready for preview/upload. The next work should start with GHL workflow audit and exact branch setup, not with redesigning the funnel.
