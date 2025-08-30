import { Injectable, Scope } from '@nestjs/common';
import * as XLSX from 'xlsx-js-style';
import { ProjectDetailResponseDto, EquipmentWithFloors } from '../projects/dto';
import { ChecklistResponseDto } from '../checklists/dto/checklist-response.dto';

@Injectable({ scope: Scope.REQUEST })
export class ExcelService {
  constructor() {}

  generateInspectionDocument(project: ProjectDetailResponseDto, checklists: ChecklistResponseDto[]): Buffer {
    const workbook = XLSX.utils.book_new();

    if (!project.equipments || project.equipments.length === 0) {
      // Create a single sheet if no equipment
      const worksheet = XLSX.utils.aoa_to_sheet([]);
      this.addProjectInfo(worksheet, project, null);
      this.setColumnWidths(worksheet);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Project Info');
    } else {
      for (const equipment of project.equipments) {
        const sheetName = equipment.name.substring(0, 31); // Excel sheet names are limited to 31 characters
        const worksheet = XLSX.utils.aoa_to_sheet([]);

        // Project information header
        this.addProjectInfo(worksheet, project, equipment);
        
        // Equipment information
        this.addEquipmentInfo(worksheet, equipment);
        
        // Inspection items table
        this.addInspectionTable(worksheet, equipment, checklists);

        // Set column widths
        this.setColumnWidths(worksheet);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    }

    // Generate buffer
    const buffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      cellStyles: true,
      cellDates: true
    });
    return buffer;
  }

  private addProjectInfo(worksheet: XLSX.WorkSheet, project: ProjectDetailResponseDto, equipment: EquipmentWithFloors | null): void {
    const addressText = project.address ? 
      `${project.address.street_1}${project.address.street_2 ? ', ' + project.address.street_2 : ''}, ${project.address.city}, ${project.address.state} ${project.address.post_code}` : 
      '';

    const data = [
      [
        { v: 'Project/Building Name', s: { font: { bold: true }, alignment: { horizontal: 'center' } } },
        { v: project.name, s: { alignment: { horizontal: 'center' } } }
      ],
      [
        { v: 'Building Type', s: { font: { bold: true }, alignment: { horizontal: 'center' } } },
        { v: project.category, s: { alignment: { horizontal: 'center' } } }
      ],
      [
        { v: 'Building Address', s: { font: { bold: true }, alignment: { horizontal: 'center' } } },
        { v: addressText, s: { alignment: { horizontal: 'center' } } }
      ],
      [
        { v: 'Customer', s: { font: { bold: true }, alignment: { horizontal: 'center' } } },
        { v: project.account?.name || '', s: { alignment: { horizontal: 'center' } } }
      ],
      ['', '']
    ];

    if (equipment) {
      data.push(
        [
          { v: 'Lift Number', s: { font: { bold: true }, alignment: { horizontal: 'center' } } },
          { v: equipment.name, s: { alignment: { horizontal: 'center' } } }
        ],
        [
          { v: 'Load (Kg)', s: { font: { bold: true }, alignment: { horizontal: 'center' } } },
          { v: String(equipment.lift?.load || ''), s: { alignment: { horizontal: 'center' } } }
        ],
        [
          { v: 'Speed', s: { font: { bold: true }, alignment: { horizontal: 'center' } } },
          { v: String(equipment.lift?.speed || ''), s: { alignment: { horizontal: 'center' } } }
        ],
        [
          { v: 'Floors', s: { font: { bold: true }, alignment: { horizontal: 'center' } } },
          { v: String(equipment.floors_served), s: { alignment: { horizontal: 'center' } } }
        ],
        [
          { v: 'Installation Date', s: { font: { bold: true }, alignment: { horizontal: 'center' } } },
          { v: String(equipment.lift?.installation_date || ''), s: { alignment: { horizontal: 'center' } } }
        ],
        [
          { v: 'Maintenance Provider', s: { font: { bold: true }, alignment: { horizontal: 'center' } } },
          { v: String(equipment.maintenance?.current_provider || ''), s: { alignment: { horizontal: 'center' } } }
        ]
      );
    }

    data.push(['', ''], ['', ''], ['', '']);

    // Add data to worksheet
    XLSX.utils.sheet_add_aoa(worksheet, data, { origin: 'A1' });
  }

  private addEquipmentInfo(worksheet: XLSX.WorkSheet, equipment: EquipmentWithFloors): void {
    // Equipment info is already added in addProjectInfo
    // This method can be extended for additional equipment-specific formatting
  }

  private addInspectionTable(worksheet: XLSX.WorkSheet, equipment: EquipmentWithFloors, checklists: ChecklistResponseDto[]): void {
    const locations = [
      { location: 'machine_room', title: 'Machine Room' },
      { location: 'lift_car_top', title: 'Lift Car Top' },
      { location: 'lift_well', title: 'Lift Well' },
      { location: 'lift_pit', title: 'Lift Pit' },
      { location: 'landings', title: 'Landings' },
      { location: 'lift_car', title: 'Lift Car' },
    ];

    let currentRow = 15;

    // Add table header with styling
    const headerData = [[
      { v: 'Location', s: { font: { bold: true }, alignment: { horizontal: 'center' } } },
      { v: 'Inspection Item', s: { font: { bold: true }, alignment: { horizontal: 'center' } } },
      { v: 'Status', s: { font: { bold: true }, alignment: { horizontal: 'center' } } },
      { v: 'Comment', s: { font: { bold: true }, alignment: { horizontal: 'center' } } }
    ]];
    XLSX.utils.sheet_add_aoa(worksheet, headerData, { origin: `A${currentRow}` });

    currentRow++;

    for (const location of locations) {
      const locationChecklists = checklists.filter(checklist => checklist.equipment_type === equipment.category && checklist.location === location.location).sort((a, b) => a.order - b.order);
      
      if (locationChecklists.length === 0) continue;

      const startRow = currentRow;

      for (const checklist of locationChecklists) {
        const checklistId = checklist._id;
        const equipmentChecklist = equipment.checklists?.[checklistId];
        
        const status = equipmentChecklist?.status || '';
        const comment = equipmentChecklist?.comment || '';
        
        const statusText = this.getStatusText(status);
        const statusColor = this.getStatusColor(status);
        
        // Create styled row data with xlsx-js-style
        const rowData = [
          { v: location.title, s: { alignment: { vertical: 'center' } } },
          { v: checklist.title.trim(), s: { alignment: { horizontal: 'center' } } },
          { 
            v: statusText, 
            s: { 
              fill: { fgColor: { rgb: statusColor || 'FFFFFF' } },
              alignment: { horizontal: 'center' },
              font: { color: { rgb: this.getStatusFontColor(status) } }
            } 
          },
          { v: comment.trim(), s: { alignment: { horizontal: 'center' } } }
        ];

        XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: `A${currentRow}` });

        currentRow++;
      }

      // Merge column A for this location group and center vertically
      if (startRow < currentRow) {
        this.mergeLocationColumn(worksheet, startRow, currentRow - 1);
      }

      currentRow++;
    }

    // Apply borders to the entire inspection table
    if (currentRow > 16) { // Only if we have data
      this.applyBordersToRange(worksheet, 15, currentRow - 1, 0, 3);
    }
  }

  private getStatusText(status: string): string {
    switch (status) {
      case 'pass': return 'Pass';
      case 'priority1': return 'Priority 1';
      case 'priority2': return 'Priority 2';
      case 'na': return 'N/A';
      default: return status;
    }
  }

  private getStatusColor(status: string): string | null {
    switch (status) {
      case 'pass': return 'B0DB9C'; // Green
      case 'priority1': return 'FE5D26'; // Red
      case 'priority2': return 'FF9B45'; // Orange
      case 'na': return 'F2F2F2'; // Gray
      default: return null;
    }
  }

  private getStatusFontColor(status: string): string {
    switch (status) {
      case 'pass': return '000000'; // Black for Pass
      case 'priority1': return 'FFFFFF'; // White for Priority 1
      case 'priority2': return 'FFFFFF'; // White for Priority 2
      case 'na': return '000000'; // Black for N/A
      default: return '000000'; // Black for unknown
    }
  }


  private setColumnWidths(worksheet: XLSX.WorkSheet): void {
    const columnWidths = [
      { wch: 25 }, // A - Location
      { wch: 50 }, // B - Inspection Item
      { wch: 20 }, // C - Status
      { wch: 50 }, // D - Comment
    ];

    worksheet['!cols'] = columnWidths;
  }

  /**
   * Apply borders to a range of cells using xlsx-js-style
   */
  private applyBordersToRange(worksheet: XLSX.WorkSheet, startRow: number, endRow: number, startCol: number, endCol: number): void {
    const borderStyle = { style: 'thin', color: { rgb: '000000' } };
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col });
        let cell = worksheet[cellRef];
        
        if (!cell) {
          cell = { v: '', s: {} };
        }
        
        if (!cell.s) cell.s = {};
        
        cell.s.border = {
          top: borderStyle,
          bottom: borderStyle,
          left: borderStyle,
          right: borderStyle
        };
        
        worksheet[cellRef] = cell;
      }
    }
  }

  private mergeLocationColumn(worksheet: XLSX.WorkSheet, startRow: number, endRow: number): void {
    // Create merge definition for column A
    const mergeRange = { s: { r: startRow - 1, c: 0 }, e: { r: endRow - 1, c: 0 } };
    
    // Add merge to worksheet
    if (!worksheet['!merges']) {
      worksheet['!merges'] = [];
    }
    worksheet['!merges'].push(mergeRange);

    // Style the merged cell with vertical centering
    const cellRef = XLSX.utils.encode_cell({ r: startRow - 1, c: 0 });
    let cell = worksheet[cellRef];
    
    if (!cell) {
      cell = { v: '', s: {} };
    }
    
    if (!cell.s) cell.s = {};
    
    // Apply vertical centering to the merged cell
    cell.s.alignment = { 
      vertical: 'center',
      horizontal: 'center'
    };
    
    // Update the worksheet
    worksheet[cellRef] = cell;
  }

}