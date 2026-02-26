import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { toast } from "sonner";

/* ── Encounter mock data (derived from the original Figma table) ── */
const ENCOUNTER_DATA: {
  encounter_id: string; provider: string; surgical_case_id: string;
  or_proc_id: string; supply_item: string; cost: number;
  surgery_end: string; opportunity_id: string; facility_code: string;
  cpt_code: string;
}[] = [
  { encounter_id: 'ENC-001', provider: 'Provider 48751', surgical_case_id: 'SC-HC-001', or_proc_id: 'OP-2024-001', supply_item: 'Urological Guidewire', cost: 125.50, surgery_end: '2024-11-15 14:30', opportunity_id: 'OPP-547812', facility_code: 'FAC-NW-042', cpt_code: '27447' },
  { encounter_id: 'ENC-002', provider: 'Provider 48751', surgical_case_id: 'SC-HC-002', or_proc_id: 'OP-2024-002', supply_item: 'Lithotripsy Basket', cost: 245.75, surgery_end: '2024-11-16 10:15', opportunity_id: 'OPP-547812', facility_code: 'FAC-NW-042', cpt_code: '27447' },
  { encounter_id: 'ENC-003', provider: 'Provider 48751', surgical_case_id: 'SC-HC-003', or_proc_id: 'OP-2024-003', supply_item: 'Laser Fiber 200um', cost: 389.20, surgery_end: '2024-11-18 09:45', opportunity_id: 'OPP-547812', facility_code: 'FAC-NW-042', cpt_code: '27447' },
  { encounter_id: 'ENC-004', provider: 'Provider 48751', surgical_case_id: 'SC-HC-004', or_proc_id: 'OP-2024-004', supply_item: 'Stone Extraction Bag', cost: 178.30, surgery_end: '2024-11-19 13:20', opportunity_id: 'OPP-547812', facility_code: 'FAC-NW-042', cpt_code: '27447' },
  { encounter_id: 'ENC-005', provider: 'Provider 48751', surgical_case_id: 'SC-HC-005', or_proc_id: 'OP-2024-005', supply_item: 'Ureteral Stent Set', cost: 256.90, surgery_end: '2024-11-20 11:00', opportunity_id: 'OPP-547812', facility_code: 'FAC-NW-042', cpt_code: '27447' },
  { encounter_id: 'ENC-006', provider: 'Provider 48751', surgical_case_id: 'SC-LC-001', or_proc_id: 'OP-2024-101', supply_item: 'Dilator Set', cost: 85.50, surgery_end: '2024-11-15 09:30', opportunity_id: 'OPP-547812', facility_code: 'FAC-NW-042', cpt_code: '36415' },
  { encounter_id: 'ENC-007', provider: 'Provider 48751', surgical_case_id: 'SC-LC-002', or_proc_id: 'OP-2024-102', supply_item: 'Flexible Endoscope', cost: 145.75, surgery_end: '2024-11-16 14:15', opportunity_id: 'OPP-547812', facility_code: 'FAC-NW-042', cpt_code: '97116' },
  { encounter_id: 'ENC-009', provider: 'Provider 23243', surgical_case_id: 'SC-LC-004', or_proc_id: 'OP-2024-104', supply_item: 'Nephrostomy Catheter', cost: 410.25, surgery_end: '2024-11-18 11:45', opportunity_id: 'OPP-547812', facility_code: 'FAC-SE-018', cpt_code: '27447' },
  { encounter_id: 'ENC-010', provider: 'Provider 23243', surgical_case_id: 'SC-LC-005', or_proc_id: 'OP-2024-105', supply_item: 'Percutaneous Kidney Access Kit', cost: 220.15, surgery_end: '2024-11-19 10:20', opportunity_id: 'OPP-547812', facility_code: 'FAC-SE-018', cpt_code: '27447' },
  { encounter_id: 'ENC-011', provider: 'Provider 23243', surgical_case_id: 'SC-MC-001', or_proc_id: 'OP-2024-106', supply_item: 'Balloon Ureteral Dilator', cost: 275.80, surgery_end: '2024-11-20 08:00', opportunity_id: 'OPP-547812', facility_code: 'FAC-SE-018', cpt_code: '27447' },
  { encounter_id: 'ENC-012', provider: 'Provider 23243', surgical_case_id: 'SC-MC-002', or_proc_id: 'OP-2024-107', supply_item: 'Hemostatic Agent', cost: 135.60, surgery_end: '2024-11-21 13:45', opportunity_id: 'OPP-547812', facility_code: 'FAC-SE-018', cpt_code: '97165' },
  { encounter_id: 'ENC-013', provider: 'Provider 23243', surgical_case_id: 'SC-MC-003', or_proc_id: 'OP-2024-108', supply_item: 'Retrieval Device', cost: 490.40, surgery_end: '2024-11-15 14:30', opportunity_id: 'OPP-547812', facility_code: 'FAC-SE-018', cpt_code: 'C1713' },
  { encounter_id: 'ENC-014', provider: 'Provider 23243', surgical_case_id: 'SC-MC-004', or_proc_id: 'OP-2024-109', supply_item: 'Guide Catheter', cost: 72.00, surgery_end: '2024-11-16 10:15', opportunity_id: 'OPP-547812', facility_code: 'FAC-SE-018', cpt_code: '27447' },
  { encounter_id: 'ENC-015', provider: 'Provider 23243', surgical_case_id: 'SC-MC-005', or_proc_id: 'OP-2024-110', supply_item: 'Biliary Drainage Set', cost: 360.10, surgery_end: '2024-11-18 09:45', opportunity_id: 'OPP-547812', facility_code: 'FAC-SE-018', cpt_code: '27447' },
];

const ENC_PAGE_SIZE = 14;

type EncSortCol = 'encounter_id' | 'provider' | 'surgical_case_id' | 'or_proc_id' | 'supply_item' | 'cost' | 'surgery_end' | 'opportunity_id' | 'facility_code' | 'cpt_code';

function SortHeader({ col, label, align = 'left', sortCol, sortDir, onSort }: {
  col: EncSortCol; label: string; align?: string;
  sortCol: EncSortCol; sortDir: 'asc' | 'desc';
  onSort: (col: EncSortCol) => void;
}) {
  return (
    <button
      onClick={() => onSort(col)}
      className={`flex items-center gap-1 cursor-pointer group whitespace-nowrap ${align === 'right' ? 'ml-auto flex-row-reverse' : ''}`}
    >
      <span className={`font-[family-name:var(--font-open-sans)] text-[length:var(--text-xs)] font-semibold ${sortCol === col ? 'text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
      <ArrowUpDown size={10} className={`shrink-0 transition-colors ${sortCol === col ? 'text-foreground' : 'text-muted-foreground/40 group-hover:text-muted-foreground'}`} />
    </button>
  );
}

export default function ModalEncountersDownload() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState<EncSortCol>('encounter_id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [providerFilter, setProviderFilter] = useState<string>('all');

  const providers = useMemo(() => ['all', ...Array.from(new Set(ENCOUNTER_DATA.map(e => e.provider))).sort()], []);

  const filtered = useMemo(() => {
    let rows = ENCOUNTER_DATA;
    if (providerFilter !== 'all') rows = rows.filter(r => r.provider === providerFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.encounter_id.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q) ||
        r.supply_item.toLowerCase().includes(q) ||
        r.surgical_case_id.toLowerCase().includes(q) ||
        r.or_proc_id.toLowerCase().includes(q) ||
        r.cpt_code.toLowerCase().includes(q) ||
        r.facility_code.toLowerCase().includes(q)
      );
    }
    rows = [...rows].sort((a, b) => {
      let av: any = a[sortCol], bv: any = b[sortCol];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return rows;
  }, [search, sortCol, sortDir, providerFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ENC_PAGE_SIZE));
  const paged = filtered.slice((page - 1) * ENC_PAGE_SIZE, page * ENC_PAGE_SIZE);

  const toggleSort = (col: EncSortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const handleExport = () => {
    toast.success('Export Started', { description: `Exporting ${filtered.length} encounter records to Excel...` });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-[16px] py-[10px] border-b border-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative max-w-[280px] w-full">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search encounters..."
              className="w-full h-[32px] pl-8 pr-3 bg-[var(--background)] rounded-[var(--radius-button)] border-0 text-foreground font-[family-name:var(--font-open-sans)] text-[length:var(--text-xs)] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring/30"
            />
          </div>
          <select
            value={providerFilter}
            onChange={e => { setProviderFilter(e.target.value); setPage(1); }}
            className="h-[32px] px-2.5 bg-[var(--background)] rounded-[var(--radius-button)] border-0 text-foreground font-[family-name:var(--font-open-sans)] text-[length:var(--text-xs)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring/30"
          >
            {providers.map(p => (
              <option key={p} value={p}>{p === 'all' ? 'All Providers' : p}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-[family-name:var(--font-open-sans)] text-[length:var(--text-xs)] text-muted-foreground">
            {filtered.length} records
          </span>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 h-[32px] px-3 bg-secondary text-secondary-foreground rounded-[var(--radius-button)] cursor-pointer hover:bg-secondary/90 transition-colors"
          >
            <Download size={12} />
            <span className="font-[family-name:var(--font-open-sans)] text-[length:var(--text-xs)] font-semibold whitespace-nowrap">
              Export Excel
            </span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto scrollbar-subtle">
        <table className="w-full border-collapse min-w-[1100px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--background)]">
              <th className="text-left px-3 py-[6px] border-b border-border"><SortHeader col="provider" label="Provider" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} /></th>
              <th className="text-left px-3 py-[6px] border-b border-border"><SortHeader col="encounter_id" label="EncounterID" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} /></th>
              <th className="text-left px-3 py-[6px] border-b border-border"><SortHeader col="surgical_case_id" label="SurgicalCaseID" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} /></th>
              <th className="text-left px-3 py-[6px] border-b border-border"><SortHeader col="or_proc_id" label="ORProcID" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} /></th>
              <th className="text-left px-3 py-[6px] border-b border-border"><SortHeader col="supply_item" label="SupplyItem" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} /></th>
              <th className="text-right px-3 py-[6px] border-b border-border"><SortHeader col="cost" label="Cost" align="right" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} /></th>
              <th className="text-left px-3 py-[6px] border-b border-border"><SortHeader col="cpt_code" label="CPT" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} /></th>
              <th className="text-left px-3 py-[6px] border-b border-border"><SortHeader col="facility_code" label="Facility" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} /></th>
              <th className="text-left px-3 py-[6px] border-b border-border"><SortHeader col="surgery_end" label="SurgeryEndDTS" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} /></th>
              <th className="text-left px-3 py-[6px] border-b border-border"><SortHeader col="opportunity_id" label="OpportunityID" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} /></th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={row.encounter_id} className="bg-card hover:bg-muted/50 transition-colors border-b border-border/60">
                <td className="px-3 py-[5px]"><span className="font-[family-name:var(--font-open-sans)] text-[13px] text-foreground">{row.provider}</span></td>
                <td className="px-3 py-[5px]"><span className="font-[family-name:var(--font-open-sans)] text-[13px] text-foreground font-semibold">{row.encounter_id}</span></td>
                <td className="px-3 py-[5px]"><span className="font-[family-name:var(--font-open-sans)] text-[13px] text-foreground font-mono">{row.surgical_case_id}</span></td>
                <td className="px-3 py-[5px]"><span className="font-[family-name:var(--font-open-sans)] text-[13px] text-muted-foreground font-mono">{row.or_proc_id}</span></td>
                <td className="px-3 py-[5px] max-w-[200px]"><span className="font-[family-name:var(--font-open-sans)] text-[13px] text-foreground truncate block">{row.supply_item}</span></td>
                <td className="px-3 py-[5px] text-right"><span className="font-[family-name:var(--font-open-sans)] text-[13px] text-foreground font-semibold">${row.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
                <td className="px-3 py-[5px]"><span className="font-[family-name:var(--font-open-sans)] text-[12px] text-muted-foreground font-mono">{row.cpt_code}</span></td>
                <td className="px-3 py-[5px]"><span className="font-[family-name:var(--font-open-sans)] text-[12px] text-muted-foreground font-mono">{row.facility_code}</span></td>
                <td className="px-3 py-[5px]"><span className="font-[family-name:var(--font-open-sans)] text-[12px] text-muted-foreground">{row.surgery_end}</span></td>
                <td className="px-3 py-[5px]"><span className="font-[family-name:var(--font-open-sans)] text-[12px] text-muted-foreground font-mono">{row.opportunity_id}</span></td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center">
                  <span className="font-[family-name:var(--font-open-sans)] text-[length:var(--text-sm)] text-muted-foreground">No encounters match your search.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-[16px] py-[8px] border-t border-border bg-[var(--background)]/50">
        <span className="font-[family-name:var(--font-open-sans)] text-[length:var(--text-xs)] text-muted-foreground">
          Showing {paged.length > 0 ? (page - 1) * ENC_PAGE_SIZE + 1 : 0}\u2013{Math.min(page * ENC_PAGE_SIZE, filtered.length)} of {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="size-7 flex items-center justify-center rounded-[var(--radius-button)] hover:bg-muted transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={14} /></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`size-7 flex items-center justify-center rounded-[var(--radius-button)] transition-colors cursor-pointer font-[family-name:var(--font-open-sans)] text-[length:var(--text-xs)] ${p === page ? 'bg-foreground text-card font-semibold' : 'text-muted-foreground hover:bg-muted'}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="size-7 flex items-center justify-center rounded-[var(--radius-button)] hover:bg-muted transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}