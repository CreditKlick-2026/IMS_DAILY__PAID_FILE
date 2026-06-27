# Database "Old Data" Research & Schema Analysis

I have queried and analyzed the existing PostgreSQL database (`paymentfilesystemims.cd0ii8iysxip.ap-south-1.rds.amazonaws.com`) to understand how the "old data" and the previous paid system were structured. 

Here is the breakdown of what currently exists in the database and how it contrasts with your new incentive logic (from the May '26 Gurugram Excel files).

## 1. Database Schema & Table Overview

The database currently holds **11 tables**. The most critical ones containing the "old data" are:

| Table Name | Row Count | Purpose in Old System |
| :--- | :--- | :--- |
| `dpf_records` | 2,244 | **Daily Performance File (Transactions):** Contains the raw collection data (Account No, Employee, Money Collected, Payment Mode, Date, etc.). This mirrors the "Raw" and "Raw NPA" sheets in your Excel files. |
| `employee_keka_data` | 140 | **Employee Master Data:** Tracks the roster, joining dates, salaries, and TL/AM mappings. This serves the same purpose as your "Attrition" sheet. |
| `associate_vintage_grid` | 11 | **Legacy TC Payout Grid:** Hardcoded collection targets (from ₹25k to ₹4L) mapped against vintage months (`m0`, `m1`, `m2`, `m3`). |
| `associate_tenured_grid` | 6 | **Legacy Tenured TC Grid:** Payout matrices based on collection slabs (Under 16k, 16-18k, 18-24k, over 24k). |
| `leadership_grid` | 18 | **Legacy TL, ATL, and AM Grid:** Static incentive percentages based on target collections. |
| `clients_master` | 18 | Master list of clients (e.g., "HDFC", "Sbi Recovery"). |
| `upload_jobs` | 21 | Logs of previous Excel uploads and parsing jobs. |

---

## 2. Legacy vs. New Incentive Logic (Key Differences)

By comparing the old hardcoded tables in the DB with the new `New Incentive Schemes -GGN.xlsx`, several major shifts in your business logic are apparent:

### A. Tele Caller (TC) Vintage Calculation
*   **Old System (DB):** Tracked vintage across 4 distinct months (`m0`, `m1`, `m2`, `m3`). Targets and payouts changed per specific month.
*   **New System (Excel):** Simplified into two major buckets: `<90 Days` and `>91 Days`. The slabs are much higher now (e.g., standard slabs starting at ₹1L or ₹1.5L depending on vintage).

### B. Leadership Payouts (TL / AM)
*   **Old System (DB):** The `leadership_grid` table applied static percentages. For example, a TL hitting ₹3,00,000 received `1.15%`. An AM hitting ₹2,75,000 received `0.40%`.
*   **New System (Excel):** The new logic is drastically more complex. 
    *   It introduces **Attrition Riders** (docking to 70% or 0% based on headcount loss).
    *   It introduces **Bonus Kickers** (+10% for zero attrition, +10% for high team eligibility).
    *   AM payouts are now heavily tied to **Gross Margin (GM)**, Cost, and Revenue formulas rather than just flat percentages.

### C. Client & Process Specificity
*   **Old System (DB):** The grids in the database (`associate_tenured_grid`, etc.) appear to be generic. They don't have a `client_id` or `process_id` column, implying a "one-size-fits-all" payout structure.
*   **New System (Excel):** Every client (Axis, SBI, Encore, IIFL) has completely bespoke logic. IIFL, for instance, uses Resolution % instead of absolute collection numbers—something the old database schema **cannot support** in its current form.

---

## 3. Findings & Recommendations

> [!WARNING]
> **Database Schema Limitation**
> The current database schema (`associate_vintage_grid`, `leadership_grid`) is obsolete and insufficient to support the new Gurugram incentive logic. 

**Next Steps for the Next.js App (`ims-dpf`):**
1.  **Deprecate Old Grid Tables:** The `associate_tenured_grid`, `associate_vintage_grid`, and `leadership_grid` tables should be phased out.
2.  **Schema Redesign:** We need to design a relational schema that can handle:
    *   Dynamic Slabs (Min/Max values).
    *   Rule conditions (e.g., Metric Type = "Collection Amount" vs "Resolution %").
    *   Rider deductions (UPL, Quality Score, Attrition counts).
3.  **Data Migration:** The 2,244 raw transactions in `dpf_records` are structured well. We can keep this table, but the engine that calculates the "Final Amount" needs to be rebuilt in your backend (likely in `app/api/`) to pull the new client-specific rules instead of querying the old grid tables.
