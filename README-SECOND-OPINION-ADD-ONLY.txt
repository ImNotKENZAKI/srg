SRG SECOND OPINION — ADDITIONS ONLY

The original 195 files from srg-main (2).zip are unchanged.
Existing funnels, privacy.html and vercel.json are preserved.

NEW FILES TO UPLOAD INTO YOUR EXISTING GITHUB REPOSITORY ROOT:
- second-opinion.html
- second-opinion-review.html
- second-opinion-thank-you.html
- second-opinion-assets/ (keep the entire folder and its subfolders)
- README-SECOND-OPINION-ADD-ONLY.txt (this guide)

For the safest upload, extract SRG-Second-Opinion-ADD-ONLY-2026-10-08.zip
and upload its CONTENTS into the repository root. Do not upload the ZIP itself.
Do not put these files inside an extra srg-main folder.

The full combined ZIP also contains all original files, unchanged, with these
additions. Its archive contents are already arranged for the repository root.
No package install or build command is required by the new static pages.

URL PATHS AFTER DEPLOYMENT ON YOUR EXISTING HOSTNAME:
Landing:   /second-opinion.html
Step 2:    /second-opinion-review.html
Thank you: /second-opinion-thank-you.html

Example using the existing Vercel hostname:
https://srg-review.vercel.app/second-opinion.html

No domain change is needed for a new URL path. These are explicit .html paths;
no existing route, homepage or vercel.json rule has been modified.

FORM FLOW:
Protected Step 1 ID: l0RxE6mTYuBdDQD23Rrd
Protected Step 2 ID: AU21lU4ZE6oG9Ia9taW0
These forms retain their existing remote GHL configuration and redirects.
The new Step 2 and thank-you files are available at the paths above, but this
package does not reconfigure live form submissions to those new paths.
Existing production /review and /thanks flows remain in place.
SRG manually reviews applications before any approved booking instructions.
No automatic calendar route has been introduced.

The approved visual design and copy are preserved. Only references in the
newly copied pages/assets were adapted to their isolated names and folder.
The pages retain their current noindex settings.
Local layout/package checks do not verify live CRM submissions or deployment.
