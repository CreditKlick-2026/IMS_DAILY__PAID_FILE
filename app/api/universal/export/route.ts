import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import ExcelJS from 'exceljs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!month || !year) {
      return NextResponse.json({ success: false, error: 'Month and Year are required' }, { status: 400 });
    }

    const monthYearStr = `${month}-${year}`;

    const { rows } = await query(`
      SELECT 
        m.employee_id,
        COALESCE(k.name, '—') as employee_name,
        COALESCE(k.designation, 'Associate') as designation,
        COALESCE(k.location, '—') as location,
        COALESCE(k.product, '—') as product,
        m.month_year,
        m.total_metric_value as "Target/Collection",
        m.base_payout as "Base Incentive",
        m.final_payout as "Final Incentive",
        m.status
      FROM monthly_incentive_calculation m
      LEFT JOIN employee_keka_data k ON UPPER(m.employee_id) = UPPER(k.employee_id)
      WHERE m.month_year = $1
      ORDER BY m.final_payout DESC
    `, [monthYearStr]);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No data found for this month' }, { status: 404 });
    }

    // Generate Excel File
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`Paid File ${monthYearStr}`);

    sheet.columns = [
      { header: 'Emp Code', key: 'employee_id', width: 15 },
      { header: 'Emp Name', key: 'employee_name', width: 25 },
      { header: 'Designation', key: 'designation', width: 20 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Product', key: 'product', width: 20 },
      { header: 'Month-Year', key: 'month_year', width: 15 },
      { header: 'Metric Value (₹/%)', key: 'Target/Collection', width: 20 },
      { header: 'Base Incentive (₹)', key: 'Base Incentive', width: 20 },
      { header: 'Final Payout (₹)', key: 'Final Incentive', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    // Styling Header
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF024E4D' } };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    rows.forEach(row => {
      sheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Universal_Paid_File_${monthYearStr}.xlsx"`
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
