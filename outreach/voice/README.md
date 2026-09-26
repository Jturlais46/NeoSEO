# Voice agent (Bland)

This folder holds the platform-neutral source for our voice agent, **Kit**.

| File | What it is |
|---|---|
| [persona.md](persona.md) | Who Kit is, how Kit sounds, what Kit knows, and how Kit handles objections |
| [call-flows.md](call-flows.md) | 6 flows, one per Bland Pathway: `first_call`, `follow_up`, `walkthrough_close`, `inbound_line`, `onboarding_verification`, `client_checkin` |
| [call-request.example.json](call-request.example.json) | Example `POST /v1/calls` body |
| [post-call.schema.json](post-call.schema.json) | What we extract from every transcript: outcome, objections, next step |
| `pathways/` | Exported Pathway JSON versions, created once the flows are built in Bland |

**Who gets called:** outbound calls go to leads whose `consent_status` is `prior_approval` (approval you have obtained), `inbound` or `client`. Calling hours, days and attempt caps come from `config/markets.yaml`.

## Build steps

1. **Account.** Start plan ($0, $0.14/min, 100 calls/day) to build and pilot. Move to Build ($299/mo, 2,000 calls/day) at scale.
2. **Numbers.** Buy local numbers for each metro area you call ($15/month each). Local caller ID gets answered more.
3. **Voice.** Pick a warm stock voice, or clone your own. Test 3 voices on 20 calls each and keep the one with the best conversation rate.
4. **Knowledge base.** Load the "Knowledge base" section of `persona.md` plus the public pricing and FAQ pages.
5. **Pathways.**
   - Build each flow in `call-flows.md` as a Pathway.
   - The fastest route is Bland's hosted MCP server (`api.bland.ai/v1/mcp`) or the Claude Code plugin, prompted with the flow spec.
   - Keep each Pathway to 10 nodes or fewer; latency grows with complexity.
6. **Tools.** Point these at n8n webhooks: `lookup_lead`, `send_visual`, `send_checkout_link`, `book_meeting`, `schedule_callback`, `add_to_do_not_contact`, `create_ticket`, `check_manager_access`.
7. **Transfer.** Transfer to your mobile during your working hours. Outside them, take a message.
8. **Post-call.** The post-call webhook goes to n8n, which:
   - stores the transcript;
   - extracts data with `post-call.schema.json`;
   - updates the lead;
   - queues the next step.
9. **Test.** Run 20 calls to yourself and friends, trying every objection, then publish to production.
10. **Export.** Save each published version to `pathways/<flow>-v<N>.json` and commit it.

Parameter names in the example payload follow Bland's docs as of 2026-09. Check them against `docs.bland.ai/api-v1/post/calls` before going live, including how to pin a Pathway version.

## Muse compatibility

All calls go through one n8n sub-workflow (`place_call`) that takes `{lead_id, flow}`. It then:
1. checks the lead's status and the calling hours;
2. builds the payload;
3. calls Bland.

A second Bland API key can be handed to Muse later. Muse would trigger the same Pathways by ID, and results would come back through the same webhook.
