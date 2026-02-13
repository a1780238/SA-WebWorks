# Dry Run Protocol

- [ ] Submit test lead with `urgency=emergency`.
- [ ] Confirm acknowledgment workflow target is `< 60s`.
- [ ] Confirm lead row is stored with pipeline state `new_lead`.
- [ ] Confirm `automation_triggered` event exists.
- [ ] Confirm out-of-area suburb is rejected with `rejected_reason=out_of_service_area`.
- [ ] Confirm `GET /api/revenue-summary` returns projected totals.
- [ ] Confirm SSL, domain routing, and role inbox (`hello@sawebworks.com.au`) are active in production.
