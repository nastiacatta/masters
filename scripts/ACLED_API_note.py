#!/usr/bin/env python3
"""
ACLED CAST: next-6-month conflict forecast export (preview + CSV).

NOTE: This is saved as a reference for an alternative dataset.
ACLED provides sub-national conflict event forecasts with observed actuals,
which could serve as a real-world probabilistic forecasting benchmark.

Fields per row:
  - country, admin1, month, year
  - total_forecast, battles_forecast, erv_forecast, vac_forecast
  - total_observed, battles_observed, erv_observed, vac_observed
  - timestamp

Usage:
  1. Obtain an access token:
       curl -X POST "https://acleddata.com/oauth/token" \
         -H "Content-Type: application/x-www-form-urlencoded" \
         -d "username=YOUR_EMAIL&password=YOUR_PASS&grant_type=password&client_id=acled"
  2. Set ACLED_ACCESS_TOKEN env var or paste into ACCESS_TOKEN below.
  3. Run: python ACLED_API_note.py
"""

import os
import io
import sys
from datetime import datetime
from calendar import month_name
from collections import defaultdict
from typing import Dict, List, Tuple

import requests
import pandas as pd

# =============== USER SETTINGS ===============

# Paste your token here (or set env var ACLED_ACCESS_TOKEN)
ACCESS_TOKEN = ""  # REDACTED — obtain via OAuth endpoint above

# Optional: restrict to these countries (empty => all)
COUNTRIES: List[str] = []

# Optional: return only these columns (empty => all)
FIELDS: List[str] = []

PAGE_LIMIT = 5000
OUTPUT_NAME = "cast_next_6_months.csv"
PREVIEW_ROWS = 10

# ============================================

CAST_READ_URL = "https://acleddata.com/api/cast/read"


def resolve_token() -> str:
    tok = ACCESS_TOKEN.strip() or os.getenv("ACLED_ACCESS_TOKEN", "").strip()
    if not tok:
        sys.exit("No access token. Paste it into ACCESS_TOKEN or set ACLED_ACCESS_TOKEN.")
    return tok


def next_six_months_from_today() -> List[Tuple[int, str]]:
    now = datetime.utcnow()
    y, m = now.year, now.month
    out: List[Tuple[int, str]] = []
    for k in range(6):
        mm = ((m - 1 + k) % 12) + 1
        yy = y + ((m - 1 + k) // 12)
        out.append((yy, month_name[mm]))
    return out


def common_params() -> Dict[str, str]:
    params: Dict[str, str] = {"_format": "csv"}
    if FIELDS:
        params["fields"] = "|".join(FIELDS)
    if COUNTRIES:
        params["country"] = "|".join(COUNTRIES)
    return params


def fetch_page(token: str, base_params: Dict[str, str], year: int, months: List[str], page: int, limit: int) -> pd.DataFrame:
    params = dict(base_params)
    params["year"] = str(year)
    params["month"] = "|".join(months)
    params["page"] = str(page)
    params["limit"] = str(limit)

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "text/csv",
        "User-Agent": "Mozilla/5.0 (compatible; ACLED-CAST-Exporter/1.0)",
    }

    r = requests.get(CAST_READ_URL, params=params, headers=headers, timeout=120)
    if r.status_code != 200:
        snippet = r.text[:400].replace("\n", " ")
        sys.exit(f"HTTP {r.status_code} for year={year}, months={months}, page={page}. Response: {snippet}")

    try:
        df = pd.read_csv(io.StringIO(r.text))
    except Exception as e:
        sys.exit(f"CSV parse error year={year}, page={page}: {e}")
    return df


def main():
    token = resolve_token()

    target = next_six_months_from_today()
    per_year: Dict[int, List[str]] = defaultdict(list)
    for yy, mname in target:
        per_year[yy].append(mname)

    base_params = common_params()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    data_raw_dir = os.path.join(project_root, "data", "raw")
    os.makedirs(data_raw_dir, exist_ok=True)
    out_path = os.path.join(data_raw_dir, OUTPUT_NAME)

    total_rows = 0
    wrote_header = False
    preview_printed = False

    for yy in sorted(per_year):
        months = per_year[yy]
        page = 1
        while True:
            df = fetch_page(token, base_params, year=yy, months=months, page=page, limit=PAGE_LIMIT)
            if df is None or df.empty:
                break

            if not preview_printed:
                print("Preview:")
                with pd.option_context("display.max_columns", None, "display.width", 200):
                    print(df.head(PREVIEW_ROWS))
                preview_printed = True

            df.to_csv(out_path, index=False, mode="a", header=(not wrote_header))
            wrote_header = True
            total_rows += len(df)
            print(f"Year {yy}, page {page}: wrote {len(df)} rows -> {out_path}")

            if len(df) < PAGE_LIMIT:
                break
            page += 1

    if total_rows == 0:
        print("No rows returned for the next six months. Check filters or entitlements.")
    else:
        print(f"Done. Total rows written: {total_rows}")
        print(f"File: {out_path}")


if __name__ == "__main__":
    main()
