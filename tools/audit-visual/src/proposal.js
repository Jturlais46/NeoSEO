// Turns "current profile + proposal" into the profile we can honestly promise after setup.
// Only levers we control in the first two weeks change. Review volume, rating and recency
// stay as they are today: those improve over months and are shown as goals, never as results.

export function applyProposal(profile, proposal = {}) {
  const after = { ...profile };
  after.is_claimed = true; // Owner verifies; we assist. Agencies cannot claim on the owner's behalf.
  if (proposal.primary_category) {
    after.primary_category = proposal.primary_category;
    after.primary_category_specific = true;
  }
  if (proposal.secondary_categories?.length) after.secondary_categories = proposal.secondary_categories;
  if (proposal.description) after.has_description = true;
  after.has_hours = true;
  if (proposal.website_url) after.has_website = true;
  if (proposal.services?.length) after.has_services_or_menu = true;
  after.photo_count = Math.max(profile.photo_count ?? 0, proposal.setup_photo_count ?? 20);
  after.owner_reply_rate = 1; // We answer the existing backlog during setup.
  after.last_update_days_ago = 0;
  return after;
}
