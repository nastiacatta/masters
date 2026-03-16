# Sybil Resistance Test

**Plot**: Two panels — profit difference (left), profit ratio (right) when splitting one agent into k=2..8 identities. 20 random trials per k.

**Results**:
- Profit difference is exactly 0 (max |delta| ~ 1.8e-16, machine precision).
- Profit ratio is exactly 1.0 for all k.
- The mechanism is perfectly Sybil-resistant for same-report identity splits (Lambert 2008).
