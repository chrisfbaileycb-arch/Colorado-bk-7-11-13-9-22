# Recording Colorado counsel's sign-off

The app treats its Colorado exemption caps and median-income table as **unverified** until a
Colorado attorney's review is recorded in code. The disclaimer banner reads that status, so it
changes on its own once everything is recorded.

## What counsel should confirm

For each item, counsel confirms the amount and the rule as of a stated date:

| Item | Where it lives | Values to confirm |
|---|---|---|
| Homestead, C.R.S. § 38-41-201 | `lib/jurisdictions/colorado.ts` → `HOMESTEAD` | $250,000 / $350,000 elderly-disabled; **does not double for joint filers** |
| Motor vehicles, C.R.S. § 13-54-102(1)(j)(I) | `VEHICLE` | $15,000 / $25,000 elderly-disabled; per-debtor (doubles for joint) |
| Household goods, C.R.S. § 13-54-102(1)(e) | `HOUSEHOLD_GOODS` | $6,000; per-debtor |
| Tools of trade, C.R.S. § 13-54-102(1)(i) | `TOOLS_OF_TRADE` | $60,000; per-debtor |
| Retirement, § 522(b)(3)(C) / C.R.S. § 13-54-102(1)(s) | `RETIREMENT` | unlimited for qualified plans |
| Median family income, 122A-1 | `lib/engine/validators/index.ts` → `COLORADO_MEDIAN_INCOME_2026` | household sizes 1–4 and the per-person increment, with the U.S. Trustee table's effective date |

Get the confirmation in writing (an email is fine) and keep it with the firm's records.

## Recording it

1. In `lib/jurisdictions/colorado.ts`, for each confirmed rule set:
   ```ts
   last_verified_date: '2026-10-01',
   verified_by: 'Jane Counsel, Colorado Reg. #12345',
   ```
   Change any amount or `joint_cap_multiplier` counsel corrected.
2. In `lib/jurisdictions/counsel-verification.ts`, fill in `MEDIAN_INCOME_VERIFICATION`
   (`effectiveFor`, `verifiedBy`, `verifiedOn`) and correct the table values if needed.
3. Update the two tripwire tests in `tests/exemption-caps.test.ts` (they assert "unverified").
4. Run `bun test`, commit with a message naming counsel and the date, and open a PR.

After that, the banner reads "Colorado figures verified by … as of …".

Re-verify whenever Colorado adjusts exemption amounts or the U.S. Trustee publishes a new
median-income table (usually April and November).
