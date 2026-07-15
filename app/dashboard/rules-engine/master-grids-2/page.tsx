import DynamicGridEditor from '../components/DynamicGridEditor';

export default function MasterGrid2Page() {
    return (
        <DynamicGridEditor 
            gridId="2" 
            title="Master Grid 2 — Axis Bank (Credit Card - Woff - BAU)" 
            subtitle="Configure tiers for Associates (Vintage), TLs (PCP), AMs (PCP) and Riders" 
            hasClientProduct={true}
        />
    );
}
