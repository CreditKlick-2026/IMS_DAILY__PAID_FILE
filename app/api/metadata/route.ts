import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    leadColumns: [
      { label: "Account No", key: "account_no" },
      { label: "Emp Code", key: "employee_code" },
      { label: "Customer Name", key: "employee_name" },
      { label: "Client", key: "client" },
      { label: "Product Type", key: "product" },
      { label: "Bucket", key: "bucket" },
      { label: "Location", key: "location" },
      { label: "Money_Collected", key: "money_collected" },
      { label: "Payment Mode", key: "payment_mode" },
      { label: "TL Name", key: "tl_name" },
      { label: "Agent Name", key: "am" },
      { label: "APH", key: "aph" },
      { label: "PH", key: "ph" },
      { label: "Mobile No", key: "mobile_no" },
      { label: "Upload At", key: "upload_at" }
    ],
    lists: {
      leadStatuses: [
        { value: "Right Party Connect", label: "RPC" },
        { value: "Third Party Connect", label: "TPC" },
        { value: "Wrong Party Connect", label: "WPC" },
        { value: "Not Connected", label: "NC" }
      ]
    },
    portfolios: [
      { id: "cc", name: "Credit Card" },
      { id: "pl", name: "Personal Loan" },
      { id: "al", name: "Auto Loan" }
    ]
  });
}
