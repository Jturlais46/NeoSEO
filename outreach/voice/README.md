# Voice agent (Bland)

This folder holds the platform-neutral source for our voice agent, "Kit". It holds three things:
- Persona.
- Flows (one per Pathway).
- The API payload example and the post-call schema.

The agent itself is built in Bland from these specs, and each published Pathway version is exported back here as JSON.

## Hard rule

**No cold calls.** A Bland call can start only when the lead's `consent_status` is one of these:
- `written`: our callback form, with evidence stored.
- `inbound`: they called us.
- `client`: an existing customer, with call consent in the terms.

The compliance gate checks this in code before `POST /v1/calls`. Why: Bland's own policy forbids AI cold-calling campaigns, and the TCPA, PECR, UWG and CRTC rules all require consent. See [docs/09-compliance-checklist.md](../../docs/09-compliance-checklist.md).

## Files

| File | What it is |
|---|---|
| [persona.md](persona.md) | Who Kit is, what Kit says and never says, and the knowledge base |
| [call-flows.md](call-flows.md) | 4 flows: callback walkthrough, inbound line, onboarding verification coach, client check-in |
| [call-request.example.json](call-request.example.json) | Example `POST /v1/calls` body |
| [post-call.schema.json](post-call.schema.json) | What we extract from every transcript (our own Haiku step, so it doesn't depend on Bland) |
| `pathways/` | Exported Pathway JSON versions (created once built in Bland) |

## Build steps

1. **Create a Bland account.** The Start plan ($0/month, $0.14 per connected minute) is enough for the pilot, with up to 100 calls a day.
2. **Buy one local number** ($15/month) and set it as the inbound line.
3. **Choose a voice.** Pick a stock voice, or clone **your own** voice with your consent. Don't clone anyone else's.
4. **Upload the knowledge base.** Use the "Knowledge base" section of `persona.md` plus the public pricing and FAQ pages.
5. **Build each flow in `call-flows.md` as a Pathway.**
   - Fastest route: Bland's hosted MCP server (`api.bland.ai/v1/mcp`) or the Claude Code plugin, prompting it with the flow spec.
   - Keep each Pathway to 10 nodes or fewer; latency grows with complexity.
6. **Point the tools at n8n webhooks:**
   - `lookup_lead`
   - `send_checkout_link`
   - `book_meeting`
   - `schedule_callback`
   - `add_to_suppression`
   - `create_ticket`
   - `check_manager_access`
7. **Transfer target:** your mobile, during your working hours only. Outside those hours, take a message.
8. **Webhook:** send the post-call webhook to n8n. n8n then:
   - stores the transcript;
   - runs extraction with `post-call.schema.json`;
   - updates the lead;
   - queues the follow-ups.
9. **Test with 20 calls to yourself and friends,** trying objections and "stop" requests. Publish to production only after that.
10. **Export each published version** to `pathways/<flow>-v<N>.json` and commit it.

Parameter names in the example payload come from Bland's docs as of 2026-09. Check them against `docs.bland.ai/api-v1/post/calls` before going live, including how to pin a Pathway version.

## Muse compatibility

All calls go through one n8n sub-workflow (`place_call`) that takes `{lead_id, flow}`. It then:
- checks consent;
- builds the payload;
- calls Bland.

A second, rate-limited Bland API key can be handed to Muse later. Muse would call the same Pathways by ID, and results would come back through the same webhook.
