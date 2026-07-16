const fs = require('fs');
const path = require('path');

const locations = ['uttam-nagar', 'gurugram', 'pune', 'delhi'];

for (const loc of locations) {
    const filePath = path.join('app', 'dashboard', 'incentive', loc, 'page.tsx');
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf-8');

    const oldMergeLogic = `        let mergedData = [];
        if (filterLocation || filterClient || filterProduct) {
            mergedData = incData.map((match: any) => {
                const emp = kekaData.find((e: any) => e.employee_id === match.employee_id) || {};
                return {
                    ...emp,
                    ...match,
                    name: match.name || emp.name || match.employee_id,
                    final_incentive: match.incentive || 0,
                    total_collection: match.total_collection || 0,
                    am_name: match.am_name || emp.am_name || '—',
                    tl_name: match.tl_name || emp.tl_name || '—',
                    aph: match.aph || emp.aph || '—',
                    ph: match.ph || emp.ph || '—',
                    designation: match.designation || emp.designation || '—'
                };
            });
        } else {
            mergedData = kekaData.map((emp: any) => {
                const match = incData.find((inc: any) => inc.employee_id === emp.employee_id) || {};
                return {
                    ...emp,
                    ...match,
                    name: match.name || emp.name || emp.employee_id,
                    final_incentive: match.incentive || 0,
                    total_collection: match.total_collection || 0,
                    am_name: match.am_name || emp.am_name || '—',
                    tl_name: match.tl_name || emp.tl_name || '—',
                    aph: match.aph || emp.aph || '—',
                    ph: match.ph || emp.ph || '—',
                    designation: match.designation || emp.designation || '—'
                };
            });
        }`;

    const newMergeLogic = `        const baseKeka = kekaData.filter((emp: any) => {
            const locMatch = !filterLocation || emp.location === filterLocation;
            const clientMatch = !filterClient || emp.client === filterClient;
            const productMatch = !filterProduct || emp.product === filterProduct;
            return locMatch && clientMatch && productMatch;
        });
        
        let mergedData = baseKeka.map((emp: any) => {
            const match = incData.find((inc: any) => inc.employee_id === emp.employee_id) || {};
            return {
                ...emp,
                ...match,
                name: match.name || emp.name || emp.employee_id,
                final_incentive: match.incentive || 0,
                total_collection: match.total_collection || 0,
                am_name: match.am_name || emp.am_name || '—',
                tl_name: match.tl_name || emp.tl_name || '—',
                aph: match.aph || emp.aph || '—',
                ph: match.ph || emp.ph || '—',
                designation: match.designation || emp.designation || '—'
            };
        });

        // Add any injected AMs/TLs from incData that are missing in baseKeka
        const baseKekaIds = new Set(baseKeka.map((e: any) => e.employee_id));
        incData.forEach((match: any) => {
            if (!baseKekaIds.has(match.employee_id)) {
                const emp = kekaData.find((e: any) => e.employee_id === match.employee_id) || {};
                mergedData.push({
                    ...emp,
                    ...match,
                    name: match.name || emp.name || match.employee_id,
                    final_incentive: match.incentive || 0,
                    total_collection: match.total_collection || 0,
                    am_name: match.am_name || emp.am_name || '—',
                    tl_name: match.tl_name || emp.tl_name || '—',
                    aph: match.aph || emp.aph || '—',
                    ph: match.ph || emp.ph || '—',
                    designation: match.designation || emp.designation || '—'
                });
            }
        });`;

    if (content.includes(oldMergeLogic)) {
        content = content.replace(oldMergeLogic, newMergeLogic);
        fs.writeFileSync(filePath, content);
        console.log("Updated " + filePath);
    } else {
        console.log("Could not find old logic in " + filePath);
    }
}
