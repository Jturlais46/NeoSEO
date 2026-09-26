---
name: monthly-report
description: Write a client's one-page monthly report in plain language from Performance API metrics, review stats, rank-grid results and the month's work log. Use on the monthly reporting schedule for each active client.
---

# Monthly report

## Input
- **Performance metrics** for this month, last month and the baseline:
  - calls;
  - direction requests;
  - website clicks;
  - bookings, if any;
  - the top search keywords.
- **Reviews:**
  - number of new reviews;
  - average rating this month and overall;
  - reply rate.
- **One rank-grid summary:** keyword, average position, and share of the grid in the top 3.
- **Work log:**
  - posts published;
  - photos added;
  - replies posted;
  - fixes made;
  - incidents (suggested edits blocked, duplicates removed).
- **Upcoming:** the next month's update ideas and holiday dates.

## Output
HTML sections, which the renderer turns into a PDF:
1. **Headline** (1 sentence). Example: "More people called you from Google this month: 41, up from 33."
2. **Three numbers,** each compared with last month and with the baseline: calls, directions, website clicks.
3. **Reviews:** new reviews, average rating, and "we replied to all N".
4. **What people searched to find you:** the top 5 keywords.
5. **What we did:** a bullet list, taken only from the work log.
6. **What's next:** 2-3 items.
7. **One ask** of the client, if needed. Examples: "send 5 photos of the new menu", "confirm holiday hours".

## Rules
- Use only numbers from the input, and show every comparison with both values.
- **Be honest about bad months.** Name a likely cause only if the data supports it (seasonality from last year's data, a competitor's review surge). Otherwise say "we're watching this".
- Don't claim credit for changes we can't attribute.
- Don't use jargon: no "impressions", "SERP", "NAP" or "citations". Use "calls", "directions" and "people who found you".
- Keep it under 250 words, excluding tables.
