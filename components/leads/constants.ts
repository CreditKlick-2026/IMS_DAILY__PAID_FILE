export const DISPOSITION_LOGIC: Record<string, Record<string, any[]>> = {
  "Right Party Connect": {
    "Customer Refused to Pay": [
      { name: "Financial Issue - Job Loss" },
      { name: "Financial Issue - Business Loss" },
      { name: "Financial Issue - Others" },
      { name: "Financial Issue - Medical Condition" },
      { name: "Dispute - Card No Usages" },
      { name: "Dispute - Card Not Received" },
      { name: "Dispute - Charges Related Issue" },
      { name: "Dispute - Fraud and Others" },
      { name: "Dispute - False Commitment" },
      { name: "Not Ready to Disclose" },
      { name: "Not Ready to Listen" },
    ],
    "Promised to Pay": [
      { name: "Full Outstanding Amount", date: true, amount: true },
      { name: "Minimum Amount", date: true, amount: true },
      { name: "Partial Amount", date: true, amount: true },
      { name: "Customer Wants Settlement", date: true, amount: true, settlement: true },
    ],
    "Follow-Up": [
      { name: "Requested for Waiver", date: true },
      { name: "Asking for some time", date: true },
      { name: "Requested for Statement", date: true },
      { name: "Call Back", date: true },
    ],
    "Customer Visit at Branch": [
      { name: "Customer Visit at Branch", date: true, amount: true }
    ]
  },
  "Third Party Connect": {
    "Customer Not Available": [
      { name: "Out of Country" },
      { name: "Out of City" },
      { name: "Customer Hospitalized" },
      { name: "Not Ready to Disclosed" },
      { name: "Not Ready to Listen" },
      { name: "Customer Deceased" }
    ],
    "Follow-up": [
      { name: "Call Back", date: true }
    ]
  },
  "Wrong Party Connect": {
    "Invalid Contact Number": []
  },
  "Not Connected": {
    "Wrong Number": [],
    "Incorrect Number": [],
    "Switched Off": [],
    "Ringing No Response": [],
    "IVR Call": [],
    "Temporary Out of Service": [],
    "Call Not Connected": [],
    "Call Disconnect": [],
    "No Response After Call Answer": []
  }
};

export const CONNECT_STATUS_COLORS: Record<string, string> = {
  'Right Party Connect': '#22c55e',
  'Third Party Connect': '#f59e0b',
  'Wrong Party Connect': '#ef4444',
  'Not Connected': '#6b7280',
};

export const PAGE_SIZE = 25;

