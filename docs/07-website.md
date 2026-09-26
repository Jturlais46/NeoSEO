# Website

**Job of the site:**
1. Turn a skeptical owner who clicked from an email into a buyer, or into someone who books a call.
2. Capture inbound audit requests (warm leads we can call right away).
3. Host the personal audit pages.

It is not an SEO content play at the start.

## 1. Sitemap

| Path | Purpose | Notes |
|---|---|---|
| `/` | Home | Sell the idea: see your profile in 90 days before you pay |
| `/how-it-works` | Process and what is included | Includes "What we don't do" |
| `/pricing` | Public prices: Keep, Grow, Setup, add-ons | Public pricing is itself a trust signal |
| `/review-kit` | The physical kit | Photos of the stand and cards, how the tap works |
| `/audit` | Free audit request form | Main source of inbound leads |
| `/for/auto-repair`, `/for/salons` | Pages per vertical | Launch only for the two pilot verticals |
| `/about` | Founder: real name, photo, address, phone | This page does the most for trust |
| `/faq` | Questions owners ask | Includes "Is this Google?" |
| `/r/<token>` | Personal audit pages | noindex. Built by `tools/audit-visual`. Expire after 90 days. |
| `/stop` | One-click opt-out, for any channel | Writes to the suppression list |
| `/legal/terms`, `/legal/privacy` | Terms and privacy | Standard templates |
| `/portal` | Client portal | Stripe customer portal plus a report archive (phase 2) |

## 2. Page copy

### Home

**Hero**
> # Your Google profile, kept.
> We fix your Google Business Profile, keep it fresh every month, and bring in a steady flow of new reviews. See your profile in 90 days before you pay a cent.
>
> [Get my free audit] [See pricing]
>
> $99/month · Month to month · You always stay the owner

**Visual:** the today / in-90-days comparison for a sample business (`docs/assets/sample-comparison-en.png`).

**Section: "Most profiles are quietly losing customers"**
Three facts about a typical neglected profile:
- 0 replies to reviews;
- 7 photos from 2022;
- a generic "Restaurant" category.

Next to each fact, a line on how it costs calls: "People choose the place with recent reviews and real photos."

**Section: "What you get every month"**
Four tiles:
- **Fixed and complete:** categories, services, hours, description;
- **Fresh:** 4 updates and new photos;
- **Answered:** every review within 48 hours;
- **Reviewed:** a review kit and follow-up requests.

**Section: "See it before you pay"**
> Give us your business name. Within a day you get your profile as it looks today next to your profile in 90 days: more reviews, real photos, fresh posts, every review answered. If you like it, one click and we start.

**Section: "No catch"**

| What you're used to | What we do instead |
|---|---|
| Contracts and hostage listings | Month to month. You stay the owner. Your review kit keeps working even if you leave. |
| Hidden prices | The price is on this page. |
| Vague reports | Calls, directions and website clicks from Google's own numbers, every month. |

**Section: "Why it matters more in 2026"**
> When someone asks Google's AI for "the best mechanic open now near me", it answers from your profile, your reviews and your website. Missing details mean missing answers.

**Section: founder note**
A 60-second video and three sentences from you, with your name and signature.

**Footer**
- Company name and postal address;
- links to `/stop` and the legal pages.

### Pricing

Three columns (Keep | Grow | Setup), with add-ons below.

FAQ strip under the table:
- "Can I cancel anytime?" Yes, in the client portal.
- "Do you need my password?" No. You add us as a manager, and you can remove us in one click.
- "Can you guarantee rankings?" No, and anyone who does is misleading you. We guarantee the work.
- "What if I'm not happy?" 14-day money back on the first month.

### Free audit form (`/audit`)

**Fields:**
- business name and city (autocomplete via the Places API is allowed here, because it's user-initiated);
- your name;
- email.

**Optional:**
- mobile number;
- checkbox: "Call me to walk me through it." Checked leads get a Bland `walkthrough_close` call as soon as the audit is ready.

**After submitting:** "Your audit will be ready within 24 hours. We'll email you the link."

In practice the pipeline produces it in minutes, and a person does a quick check for inbound leads.

### FAQ (selection)

- **Are you Google?**
  No. We're an independent company that manages Google Business Profiles for local businesses. Google doesn't charge for profiles, and neither does anyone else "on behalf of Google".
- **Why pay if the profile is free?**
  The profile is free; the time isn't. We handle the weekly upkeep, the photos, the replies and the review requests, and we know which settings actually matter.
- **How does the review stand work?**
  Customers tap it or scan it with their phone and land straight on your Google review form. We add follow-up texts after each visit so the reviews keep coming.
- **Do you use AI?**
  Yes. It's how we keep the price at $99. A person checks anything sensitive, like replies to negative reviews.

## 3. Audit page spec (`/r/<token>`)

A working implementation is in `tools/audit-visual`: `index.html` per prospect. The sections:
- hero with the business name, then two buttons: "Yes, set it up" (Stripe Checkout, pre-filled) and "Book a call";
- the two profile panels (today and in 90 days) with the key numbers;
- the score table, today vs. in 90 days;
- the proposal: categories, description, services;
- a review comparison against named competitors, including the projected count;
- the first month of updates;
- the photo shot list;
- a sample review reply;
- why it matters in 2026 (Ask Maps);
- how it works in 3 steps;
- footer: company details and opt-out link.

**Rules:**
- **Unguessable token:** at least 128 bits of randomness, in base62.
- **Never indexed:** the `X-Robots-Tag: noindex, nofollow` header plus a meta tag. Keep these pages out of the sitemap, and **don't** block them in robots.txt (crawlers have to fetch the page to see the noindex).
- **Views logged on the server;** no third-party trackers.
- **Expiry at 90 days.** After that the link shows a "request a fresh audit" form.

## 4. Stack

| Layer | Choice | Cost | Why |
|---|---|---|---|
| Marketing site | **Astro** (static) on Cloudflare | $0-5 | Fast, cheap, easy for Claude to edit, and version-controlled in this repo |
| Audit pages and redirect links | Cloudflare Workers + R2 (images) + D1 or KV (tokens, redirects, view logs) | $5 (Workers Paid) | The same platform does rendering (Browser Rendering), redirects and pages |
| Forms | Worker endpoint → n8n webhook | $0 | One pipeline for all leads |
| Payments | Stripe Checkout links (pre-filled per prospect) + Customer Portal | % of revenue | No custom billing code |
| Booking | Cal.com (free) | $0 | Bland has a native Cal.com integration |
| Analytics | Cloudflare Web Analytics (cookieless) | $0 | No cookie banner needed for basic analytics [U] |

Alternatives, if you'd rather edit visually: Framer or Webflow for the marketing pages only, at about $15-30 a month [U]. The audit pages stay on Workers either way.

**Build order:**
1. Home, pricing, audit form, about, legal and `/stop` (enough to launch).
2. The `/r/<token>` Worker.
3. Vertical pages, FAQ and review kit.
4. The client portal.

The site copy is ready above. Building the Astro site is the next task, once you approve the name.
