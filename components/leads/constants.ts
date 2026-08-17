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

export const COLUMN_ORDER: Record<string, { order: number; label: string }> = {
  account_no: { order: 1, label: 'Account_No' },
  employee_name: { order: 2, label: 'Employee_Name' },
  mobile: { order: 3, label: 'Mobile Number' },
  address: { order: 4, label: 'Address' },
  city: { order: 5, label: 'City' },
  state: { order: 6, label: 'State' },
  email: { order: 7, label: 'Email' },
  bank: { order: 8, label: 'Bank / Lender' },
  portfolio: { order: 9, label: 'Portfolio' },
  dpd: { order: 10, label: 'DPD' },
  bkt_2: { order: 11, label: 'Bucket' },
  min_amt_due: { order: 12, label: 'Min Amount Due' },
  principle_outstanding: { order: 13, label: 'Principle Outstanding' },
  money_collected: { order: 14, label: 'Money_Collected' },
  product: { order: 15, label: 'Product Type' },
  'credit card number': { order: 16, label: 'Credit Card Number' },
  credit_card_number: { order: 16, label: 'Credit Card Number' },
  pan: { order: 17, label: 'PAN Number' },
  createdat: { order: 18, label: 'Allocation Date' },
  assignedagent: { order: 19, label: 'Assigned Agent' },
};
