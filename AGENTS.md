# SRG Advisors Short Funnel Landing Page

## Project purpose

Build a new short, conversion-focused landing page for SRG Advisors, LLC.

This is separate from the existing long nurture landing page.

The new short page is intended for:
- Paid advertising
- Social media traffic
- Direct lead-generation campaigns
- Cold or low-awareness visitors

The existing long nurture landing page must remain working and must not be overwritten.

## Conversion Strategy and COO Direction

### Clear distinction between the two landing pages

The existing `strategy-consultation.html` is the long nurture landing page.

Its purpose is:
- Email nurture traffic
- Warmer prospects
- Visitors who need more education and trust-building
- Detailed explanations before taking the next step

The new short funnel is separate.

Its purpose is:
- Paid advertising traffic
- Facebook, Instagram, LinkedIn, and Google traffic
- Direct lead-generation campaigns
- Cold or low-awareness visitors
- Fast scanning and low-friction conversion

Never replace, shorten, or overwrite the existing nurture landing page.

### Primary conversion problem

The existing long page spends too much time explaining why SRG is credible before answering why the visitor should care.

The short page must immediately answer questions such as:
- Can SRG help with my tax situation?
- Can SRG help me avoid reactive financial decisions?
- Does SRG understand growing businesses and complex investments?
- Can I trust SRG with an important financial situation?
- What is the easiest next step?

The visitor's problem and desired outcome must appear before long credentials, company history, or technical explanations.

### Core positioning

Do not sell only accounting services.

Position SRG around:
- Peace of mind
- Proactive tax and financial strategy
- Clarity before important financial decisions
- Protecting what the prospect has built
- Guidance for increasingly complex business and financial situations

Do not guarantee:
- Tax savings
- Specific financial results
- Acceptance as a client
- An immediate consultation

## Confirmed SRG process

- Prospects first complete a short contact form.
- They then continue to the detailed Private Strategy Review form.
- Existing qualification questions remain but are divided into two steps.
- Qualification outcomes may be Qualified, Manual Review, or Nurture.
- Qualified prospects must not receive an automatic calendar link.
- SRG reviews every submitted application first.
- When applicable, SRG provides secure instructions for tax documents.
- Sensitive documents must not be requested through ordinary email.
- Jay or the SRG team reviews the information and documents.
- Only after manual approval will SRG send the appropriate booking link.
- The default consultation is by phone.
- Zoom or Microsoft Teams may be requested.
- In-person consultations require Jay's approval.
- A paid consultation may apply depending on the case.

## Page strategy

The page must be short, direct, easy to scan, and conversion-focused.

It should quickly help visitors understand:
- Whether SRG may help with their tax situation
- Whether SRG understands complex businesses and investments
- The value of proactive tax and financial guidance
- Why SRG is trustworthy
- What the next step is

Do not make the page read like a whitepaper or long educational article.

Lead with:
- The prospect's problem
- The outcome they want
- Peace of mind
- Proactive planning
- Protection of what they have built
- A clear, low-friction next step

## Page length and structure

The new page must remain concise and must not read like a whitepaper.

Target approximately five main sections and roughly 500 to 800 words total.

1. Hero
   - Outcome-focused headline
   - One short supporting paragraph
   - Gold primary CTA
   - One short trust statement
   - The CTA scrolls to the Step 1 form

2. Problem and desired outcome
   - Explain the limitations of reactive tax decisions
   - Emphasize proactive planning, clarity, and protecting what the prospect has built
   - Use a maximum of three concise benefit points

3. Four service cards
   - US Tax Planning
   - US Tax Returns & Compliance
   - Accounting & CFO Services
   - IRS Tax Resolution & Disputes
   - Use a responsive 2-by-2 layout
   - Write one concise, original, SRG-specific description per service

4. How the SRG review works
   - Submit basic contact information
   - Complete the detailed Private Strategy Review
   - SRG reviews the application and provides the appropriate next step
   - State clearly that submitting the forms does not automatically schedule a consultation

5. Final CTA and Step 1 form
   - Full Name
   - Email Address
   - Phone Number
   - CTA: Start My Private Strategy Review
   - Continue to the existing Step 2 page after submission
   - Do not include a calendar link or booking embed

## Four services

Use these exact service categories:

1. US Tax Planning
2. US Tax Returns & Compliance
3. Accounting & CFO Services
4. IRS Tax Resolution & Disputes

Write original SRG-specific descriptions.

Do not copy another company's wording, images, icons, code, or exact design.

## Form flow

Step 1:
- Full Name
- Email Address
- Phone Number
- Primary CTA: Start My Private Strategy Review

Step 2:
- Existing Private Strategy Review qualification questions

Submission must not automatically schedule a consultation.

## CTA rules

Preferred primary CTA:
Start My Private Strategy Review

Acceptable alternative:
Request a Private Strategy Review

Do not use:
- Book a Call
- Schedule Now
- Schedule a Consultation
- Instant Consultation
- Automatically Schedule a Meeting

## Design direction

Use:
- Primary Navy: #173F5B
- Deep Focus Navy: #102F44
- CTA Gold: #C9A227
- CTA Gold Hover: #B58D18
- Soft Gold Surface: #F7F1DC
- Pastel Blue: #DCECF4
- Light Blue Surface: #EEF6F9
- Soft Background: #F7FAFC
- Border Blue: #C7DCE6
- Body Text: #253642
- White: #FFFFFF

Use gold strategically for:
- Primary CTA buttons
- Small conversion highlights
- Selected icons or dividers

Gold should guide attention toward the primary conversion actions.

Do not overuse gold.

Do not use:
- Green
- Red
- Bright neon colors

The page must feel:
- Premium
- Professional
- Modern
- Calm
- Trustworthy
- High-value
- Appropriate for a CPA advisory firm

## Inspiration rule

The Jasmine DiLucci website may be used only as inspiration for:
- Compact 2-by-2 service cards
- Clear visual hierarchy
- Short service descriptions
- CTA placement
- Soft image-backed sections
- Repeated but controlled CTA placement

Do not copy its:
- Colors
- Text
- Branding
- Images
- Icons
- Code
- Exact layout

## Source verification rule

The July 15 two-step package is only a candidate baseline.

Do not treat it as the final source of truth until it is verified against the actual current GitHub repository or current Vercel deployment source.

Before implementation:
1. Verify the exact current production source.
2. Confirm both GHL form IDs remain active.
3. Confirm the Step 1 redirect.
4. Confirm contact deduplication between Step 1 and Step 2.
5. Confirm the current qualification fields and conditional logic.

## Technical rules

- Source files are stored in the user's GitHub repository.
- Current Vercel production domain: srg-review.vercel.app
- Do not modify SRG's existing main website or hosting.
- Preserve the existing long nurture landing page.
- Create the short funnel as a separate file and route.
- GoHighLevel manages forms, fields, tags, workflows, notifications, and qualification routing.
- Maintain mobile responsiveness and accessibility.
- Maintain visible keyboard focus states.
- Ensure sufficient contrast.
- Prevent horizontal overflow.
- Preserve working fields, forms, redirects, and automation unless an approved change is necessary.

## Working rules

- Work one step at a time.
- Inspect existing files before proposing edits.
- Clearly separate confirmed facts, recommendations, and assumptions.
- Do not edit code until explicitly approved.
- Do not modify forms or automation until explicitly approved.
- Use exact file, field, tag, workflow, action, and page names.
- Validate desktop and mobile behavior.
- Never introduce an automatic calendar route.
- Present all file changes through reviewable diffs.
