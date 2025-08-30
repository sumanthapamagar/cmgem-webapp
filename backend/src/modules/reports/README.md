# Reports Module - Excel Service

## Overview

The Excel Service provides functionality to generate Excel inspection documents for projects. It's designed to be request-scoped and integrates with the projects module to generate downloadable Excel files.

## Features

- **Request-scoped service**: Each request gets its own instance of the Excel service
- **Multi-sheet generation**: Creates separate sheets for each equipment in a project
- **Professional formatting**: Includes borders, cell merging, and color coding for status
- **Dynamic content**: Adapts to project data structure and handles missing fields gracefully

## API Endpoint

### Generate Inspection Document

```
GET /projects/:id/inspection-report
```

**Response**: Excel file download with filename `inspection_report_{id}.xlsx`

**Headers**:
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- Content-Disposition: attachment; filename="inspection_report_{id}.xlsx"

## Excel Document Structure

Each Excel document contains:

1. **Project Information Sheet** (if no equipment exists)
   - Project/Building Name
   - Building Type
   - Building Address
   - Customer

2. **Equipment Sheets** (one per equipment)
   - Project information header
   - Equipment details (Lift Number, Load, Speed, Floors, etc.)
   - Inspection items table organized by location
   - Status color coding (Pass: Green, Priority 1: Red, Priority 2: Orange, N/A: Gray)

## Location Categories

The service organizes inspection items by these locations:
- Machine Room
- Lift Car Top
- Lift Well
- Lift Pit
- Landings
- Lift Car

## Status Color Coding

- **Pass**: Green (#B0DB9C)
- **Priority 1**: Red (#FE5D26)
- **Priority 2**: Orange (#FF9B45)
- **N/A**: Gray (#F2F2F2)

## Dependencies

- `xlsx` package for Excel file generation
- NestJS framework with request-scoped injection
- Mongoose for MongoDB integration

## Usage Example

```typescript
// In a service
@Injectable()
export class ProjectsService {
  constructor(private excelService: ExcelService) {}

  async generateInspectionDocument(projectId: string): Promise<Buffer> {
    const project = await this.findById(projectId);
    const checklists = await this.checklistsService.findAll();
    return this.excelService.generateInspectionDocument(project, checklists);
  }
}
```

## Error Handling

The service includes comprehensive error handling:
- Graceful handling of missing equipment data
- Fallback for missing fields (lift information, maintenance details)
- Proper error responses for failed document generation

## Performance Considerations

- Request-scoped to prevent memory leaks
- Efficient Excel generation using the xlsx library
- Minimal memory footprint during document creation
