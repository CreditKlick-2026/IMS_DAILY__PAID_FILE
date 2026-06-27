# Gurugram (GGN) Location Incentive & Paid System Analysis

Based on the detailed review of the `New Incentive Schemes -GGN` and `Incentive May'26 nnn` datasets, here is an in-depth analysis of your entire paid system for the Gurugram location. The system is designed to reward collection performance while strictly enforcing quality, attendance, and team stability riders.

## 1. Overall Paid System Architecture

Your paid system operates on a **Slab-Based Revenue/Collection Model** with **Performance Riders**. Payouts are highly dependent on the employee's role, the process they are mapped to, their vintage (tenure), and their adherence to quality and attendance metrics.

### System Breakdown:
*   **Base Metric:** Total Money Collected / PCP (Principal Collection Performance).
*   **Roles Covered:** Tele Callers (TC) / Agents, Team Leaders (TL), and Assistant Managers (AM).
*   **Vintage Impact:** Targets and payout slabs are distinct for new joiners (`<90 Days`) versus tenured employees (`>91 Days`), allowing new agents a ramp-up period with lower thresholds.
*   **Deductions (Docking):** Payouts are not guaranteed at 100% even if targets are met. They are subject to deductions based on specific *Riders*.

> [!IMPORTANT]
> The final payout formula is essentially: `(Slab Payout Amount or %) * (Quality Score Rider %) * (UPL Rider %) + (Kickers/Bonuses)`

---

## 2. Process & Client-Wise Breakdown

The Gurugram location manages multiple clients and products, primarily focusing on Write-offs (Woff) and Non-Performing Assets (NPA). 

### A. Axis Bank Process
*   **Products:** Credit Card (BAU & SmartTeam), Loans (PL, BL, EL), and Citi Credit Card.
*   **Tele Callers:** 
    *   **<90 Days Vintage:** Payouts usually kick in at collections > ₹1,00,000 for standard CC BAU. The payout is percentage-based (e.g., 2% on early slabs, escalating as collections rise).
    *   **>91 Days Vintage:** Thresholds are higher (e.g., > ₹1,50,000). 
    *   *SmartTeam:* Operates on a specialized model tracking Salary + Incentive, Cost Per Account (CPA), Revenue Per Account (RPA), and Gross Margin (GM).
*   **TLs & AMs:** Incentives are tied to team overall collections and maintaining Gross Margin (GM). AMs have specific Cost vs. Revenue targets to unlock higher slabs.

### B. SBI Cards (New & Old)
*   **Products:** SBI Credit Card (Woff - BAU).
*   **Tele Callers:** Follows a similar slab structure to Axis but with slightly different base minimums. Payout percentages usually scale from 1.5% to 3.5% depending on the slab.
*   **Old SBI Process:** Has flat amount payouts based on slabs instead of percentages (e.g., ₹2.25L recovery = ₹8,100 payout for TLs).

### C. Encore ARC
*   **Products:** SBI Credit Card (Woff - BAU) managed under Encore.
*   **Structure:** Mirrors the standard credit card structure but with its own specific collection thresholds (e.g., Slab 1 usually starts at < ₹1,00,000, with payouts escalating up to 3% at highest slabs).

### D. IIFL HF (Home Loans)
*   **Products:** Home Loan (Bucket X).
*   **Categories:** Shakti Agents vs. Hub & Ex-HL Agents.
*   **System:** Unlike credit cards, IIFL operates on **Resolution Percentage (Reso%)** rather than absolute collected amounts.
    *   Slabs are defined by Resolution % (e.g., <89%, 89%-91%, 91%-93%, etc.).
    *   Payouts are fixed amounts (e.g., ₹2,000, ₹5,000, ₹8,000) rather than percentages of the loan collected.
    *   Also heavily tracks CPA (Cost Per Account) and GM % (Gross Margin).

---

## 3. Role-Wise Riders & Conditionality (The Docking System)

The incentive system enforces strong behavioral controls through "Docking Riders."

### Tele Callers (TC)
1.  **Quality Score Rider (Rider 1):**
    *   `>= 85% Score`: 100% of Incentive Payout.
    *   `< 85% Score`: **Docked to 70%** of Incentive Payout.
2.  **Unplanned Leaves (UPL) Rider (Rider 2):**
    *   `<= 1 Leave`: 100% of Incentive Payout.
    *   `>= 2 Leaves`: **Docked to 70%** of Incentive Payout.

### Team Leaders (TL)
1.  **Attrition Rider:**
    *   `1 Attrition`: 100% Payout.
    *   `<= 2 Attritions`: 70% Payout.
    *   `>= 3 Attritions`: **0% Payout** (Total Incentive Forfeiture).
2.  **Attrition Control Kicker:** If the TL maintains **Zero** attrition, they receive an extra **10%** on their total incentive amount.
3.  **Team Eligibility Kicker:** If >70% of the TL's team is eligible for incentives, the TL gets an extra **10%**.

### Assistant Managers (AM)
1.  **Attrition Rider:** 
    *   `< 10% Attrition`: 100% Payout.
    *   `10% - 20% Attrition`: 70% Payout.
    *   `> 21% Attrition`: **0% Payout**.
2.  **Kickers:** Similar to TLs, AMs receive 10% extra for Zero attrition and 10% extra if >70% of the entire team qualifies for incentives.

---

## 4. Operational Execution & Data Management (May'26 Insights)

Looking at your raw operational data for May '26 (`Incentive May'26 nnn.xlsx`), the execution process flows as follows:

1.  **Raw Data Aggregation:** Data is pooled daily into `Raw` and `Raw NPA` sheets tracking every single transaction (LAN, CM, Phone No., Amount, Payment Mode) tagged to the respective TC, TL, and AM.
2.  **IIFL Specialized Tracking:** IIFL has its own separate processing sheet because it calculates based on cases and Resolution % (Norm vs RF) instead of direct collection slabs.
3.  **TC Calculation (Incentive TC & TC NPA):** The raw collections are aggregated against the employee's Vintage (`<90` vs `>91`). The respective Grid is applied, and then the UPL and QA riders are cross-referenced to finalize the "Final Amount".
4.  **Attrition Tracking:** The `Attrition` sheet closely monitors Opening Headcount vs. Closing Headcount and Status (Active vs. Attrition/FinalSettlement). This is crucial because TL and AM incentives depend heavily on these exact numbers.

> [!TIP]
> **Optimization Recommendation:** 
> Your incentive logic is highly mathematical and deeply nested (especially with Gross Margin calculations for SmartTeams). To avoid manual errors in Excel, consider migrating this exact logic into a database-driven dashboard (which it appears you are doing in `ims-dpf`). 

---

### Do you have any specific requirements for implementing these exact formulas into your new application's dashboard?
Let me know if you would like me to map these Excel formulas directly into your TypeScript/Next.js backend logic.
