import { Injectable, Scope } from '@nestjs/common';
import { Document, Packer, Paragraph, TextRun, AlignmentType, patchDocument, PatchType, PatchDocumentOptions, IPatch, Table, TableRow, TableCell, VerticalAlignTable, TextDirection, HeadingLevel, WidthType, ShadingType, ParagraphChild, FileChild, ImageRun, LevelFormat, Numbering } from 'docx';
import type { EquipmentWithFloors, ProjectDetailResponseDto } from '../projects/dto';
import type { UserInfo } from 'src/types/user.types';
import * as fs from 'fs';
import * as path from 'path';
import { StorageService } from '../storage/storage.service';
import { AttachmentResponseDto } from '../attachments/dto';
import { ChecklistResponseDto } from '../checklists/dto/checklist-response.dto';

export class ReportsService {
  private readonly allFloorDesignations: Set<string>;

  constructor(
    private readonly project: ProjectDetailResponseDto,
    private readonly checklists: ChecklistResponseDto[],
    private readonly currentUser: UserInfo,
    private readonly storageService: StorageService
  ) {
    this.allFloorDesignations = new Set<string>(
      this.project.equipments.flatMap(equipment =>
        equipment.floors.map(floor => floor.designation)
      )
    );
  }

  // Word document generation methods
  async generateReport(): Promise<Buffer> {
    try {
      const patches = await this.getPatches();
      const buffer = await patchDocument({
        outputType: "nodebuffer",
        data: fs.readFileSync(path.join(process.cwd(), 'templates/report_template.docx')),
        patches,
      });
      return buffer;
    } catch (error) {
      console.log("error", error);
      throw new Error(`Failed to generate Word document: ${error.message}`);
    }
  }

  // Getter methods to access the injected data
  getProject(): ProjectDetailResponseDto {
    return this.project;
  }

  getCurrentUser(): UserInfo {
    return this.currentUser;
  }

  // Helper method to get project name
  getProjectName(): string {
    return this.project?.name || 'Unknown Project';
  }

  // Helper method to get current user name
  getCurrentUserName(): string {
    return this.currentUser?.name || this.currentUser?.email || 'Unknown User';
  }

  private async getPatches(): Promise<Record<string, IPatch>> {
    return {
      PROJECT_NAME: {
        type: PatchType.PARAGRAPH,
        children: [
          new TextRun(this.project.name)
        ]
      },
      CONTRACTOR_NAME: {
        type: PatchType.PARAGRAPH,
        children: [
          new TextRun(this.project.equipments[0]?.maintenance?.current_provider || "")
        ]
      },
      INSPECTION_DATE: {
        type: PatchType.PARAGRAPH,
        children: [
          new TextRun(
            this.project.inspection_date ? new Date(this.project.inspection_date)?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ""
          )
        ]
      },
      CUSTOMER_NAME: {
        type: PatchType.PARAGRAPH,
        children: [
          new TextRun(this.project.account?.name || "")
        ]
      },
      BUILDING_ADDRESS: {
        type: PatchType.PARAGRAPH,
        children: [
          new TextRun(this.project.address?.text || "")
        ]
      },
      ACCEPTANCE_STATUS: {
        type: PatchType.PARAGRAPH,
        children: [
          new TextRun("acceptable")
        ]
      },
      REPORT_DATE: {
        type: PatchType.PARAGRAPH,
        children: [
          new TextRun(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))
        ]
      },
      CURRENT_USER: {
        type: PatchType.PARAGRAPH,
        children: [
          new TextRun(this.currentUser.name)
        ]
      },
      LIFT_NAMES: {
        type: PatchType.PARAGRAPH,
        children: [
          new TextRun(this.project.equipments.map(eq => eq.name).join(', '))
        ]
      },

      TABLE_EQUIPMENT_LIST: {
        type: PatchType.DOCUMENT,
        children: [
          this.generateEquipmentTableData()
        ]
      },
      TABLE_EXECUTIVE_DASHBOARD: {
        type: PatchType.DOCUMENT,
        children: [
          this.generateExecutiveDashboardData()
        ]
      },
      TABLE_MAINTENANCE_RECORDS: {
        type: PatchType.DOCUMENT,
        children: [
          this.generateMaintenanceRecordsData()
        ]
      },
      TABLE_PASSENGER_COMFORT_1: {
        type: PatchType.DOCUMENT,
        children: [
          (this.generatePassengerComfort1Data())
        ]
      },
      TABLE_PASSENGER_COMFORT_2: {
        type: PatchType.DOCUMENT,
        children: [
          (this.generatePassengerComfort2Data())
        ]
      },
      TABLE_CAR_INTERIOR: {
        type: PatchType.DOCUMENT,
        children: this.generateCarInteriorData()
      },

      TABLE_CAR_DOOR_OPERATION: {
        type: PatchType.DOCUMENT,
        children: [
          this.generateCarDoorOperationData()
        ]
      },
      TABLE_LANDING_SIGNALISATION: {
        type: PatchType.DOCUMENT,
        children: [this.generateLandingSignalisationData()]
      },
      TABLE_FLOOR_LEVELLING: {
        type: PatchType.DOCUMENT,
        children: [
          this.generateFloorLevellingData()
        ]
      },
      TABLE_DEFECTIVE_ITEMS: {
        type: PatchType.DOCUMENT,
        children: [
          await this.generateDefectiveItemsData()
        ]
      },
      OWNER_BULLET_LIST: {
        type: PatchType.DOCUMENT,
        children: this.generateChecklistBulletList("owner")

      },
      HOUSEKEEPING_BULLET_LIST: {
        type: PatchType.DOCUMENT,
        children: this.generateChecklistBulletList("housekeeping")
      },
      SAFETY_DEVICES_BULLET_LIST: {
        type: PatchType.DOCUMENT,
        children: this.generateChecklistBulletList("safety-devices")
      },
      SAFETY_RISKS_BULLET_LIST: {
        type: PatchType.DOCUMENT,
        children: this.generateChecklistBulletList("safety-risk")
      },
      RELIABILITY_AND_OUTAGE_RISKS_BULLET_LIST: {
        type: PatchType.DOCUMENT,
        children: this.generateChecklistBulletList(["reliability", "outage-risk"])
      },
      PASSENGER_COMFORT_BULLET_LIST: {
        type: PatchType.DOCUMENT,
        children: this.generateChecklistBulletList("passenger-comfort")
      },
      COMPLIANCE_BULLET_LIST: {
        type: PatchType.DOCUMENT,
        children: this.generateChecklistBulletList("compliance")
      },
      SUSTAINABILITY_BULLET_LIST: {
        type: PatchType.DOCUMENT,
        children: this.generateChecklistBulletList("sustainability")
      },

    };
  }

  private createTable(rows: Array<TableRow | Array<string | TableCell>>, headerColor: string = '#bde0fe'): Table {
    return new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      alignment: AlignmentType.CENTER,
      rows: rows.map((row, row_index) =>
        row instanceof TableRow ? row :
          new TableRow({
            height: {
              value: "20pt",
              rule: 'atLeast'
            },
            children: row.map((cell, cell_index) =>
              typeof cell === 'string' ?
                new TableCell({
                  verticalAlign: VerticalAlignTable.CENTER,
                  shading: row_index === 0 ? {
                    fill: headerColor,
                    type: ShadingType.CLEAR
                  } : { type: ShadingType.CLEAR },
                  children: [
                    typeof cell === 'string' ?
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: cell,
                            bold: row_index === 0,
                            size: "9pt",
                            color: '#141414',
                          })
                        ]
                      }
                      ) : cell]
                }) : cell)
          })
      )
    });
  }

  // Helper method to generate checklist bullet list text
  private generateChecklistBulletList(categories: string | string[]): FileChild[] {
    const categoryArray = Array.isArray(categories) ? categories : [categories];
    const paragraphs: FileChild[] = [];

    this.project.equipments.forEach(equipment => {
      if (!equipment.category || !equipment.checklists) return;
      const equipmentItems: FileChild[] = [];

      this.checklists.forEach(checklist => {
        if (!categoryArray.includes(checklist.category))
          return

        if (!equipment.checklists?.[checklist._id])
          return

        const comment = equipment.checklists[checklist._id].comment;
        if (!comment)
          return

        equipmentItems.push(new Paragraph({
          text: comment,
          spacing:{
            before: 200,
            after: 200
          },
          bullet:{
            level: 0,
          }
        }));
      });

      if (equipmentItems.length > 0) {
        paragraphs.push(new Paragraph(equipment.name || `Equipment ${equipment._id}`,
        ));
        paragraphs.push(...equipmentItems);
      }
    });
    return paragraphs;
  }


  // Helper method to generate equipment table data
  private generateEquipmentTableData(): Table {
    const headers = [
      'Equipment Identification',
      ...this.project.equipments.map(equipment => equipment.name || `Equipment ${equipment._id}`),
    ];

    const rows_columns = [
      { label: 'Load', value: 'lift.load' },
      { label: 'Speed', value: 'lift.speed' },
      { label: 'Floors served - Front / Rear', value: 'floors_served_front_rear' },
      { label: 'Installation Date', value: 'lift.installation_date' },
      { label: 'Original Equipment Manufacturer', value: 'lift.original_equipment_manufacturer' },
      { label: 'Current Maintenance Provider', value: 'maintenance.current_provider' },
      { label: 'Roping Arrangement', value: 'lift.hoist_rope_size' },
      { label: 'Control/Drive System.Regen?', value: 'lift.drive_system' },
    ];

    return this.createTable([
      headers,
      ...rows_columns.map(
        column => [
          column.label,
          ...this.project.equipments.map(equipment => this.getNestedValue(equipment, column.value) || '')
        ]
      )
    ]);


  }

  // Helper method to generate executive dashboard data
  private generateExecutiveDashboardData(): Table {
    const headers = [
      'Review Areas',
      ...this.project.equipments.map(equipment => equipment.name || `Equipment ${equipment._id}`)
    ];
    const rows = [
      'Housekeeping', 'Safety Risk', 'Reliability Risk',
      'Maintenance and Failure Rate', 'Extended Outage Risk', 'Passenger Comfort', 'Sustainability'
    ];
    return this.createTable([
      headers,
      ...rows.map(row => [row, ...Array(this.project.equipments.length).fill('')])
    ]);
  }

  // Helper method to generate maintenance records data
  private generateMaintenanceRecordsData(): Table {
    const headers = ['Equipment ID', 'Contracted Annual Service Visits', 'Actual Services Completed', 'Outcome Score'];
    const rows = this.project.equipments.map(equipment => [
      equipment.name || `Equipment ${equipment._id}`,
      '', '', ''
    ]);


    const maintenanceRecordsTable = this.createTable([
      headers,
      ...rows,
      ['', '', '', ''],
    ]);



    return maintenanceRecordsTable;
  }
  // Helper method to generate car door operation data
  private generateCarDoorOperationData(): Table {
    const headers = ['Parameter:', 'Units', 'Target', ...this.project.equipments.map(equipment => equipment.name || `Equipment ${equipment._id}`)];
    const rows = [
      new TableRow({
        height: {
          value: "20pt",
          rule: 'atLeast'
        },
        children: [
          new TableCell({
            columnSpan: 3 + this.project.equipments.length,
            verticalAlign: VerticalAlignTable.CENTER,
            children: [new Paragraph({
              children: [
                new TextRun({ text: 'Door Operating:', bold: true })
              ]
            })]
          }),
        ]
      }),
      ['Fullly open to fully closed', 'sec', '2.4 - 2.8'],
      ['Fully closed to fully open', 'sec', '1.8 - 2.2'],
      ['Levelling time', 'sec', '1.0 - 1.2'],
      new TableRow({
        height: {
          value: "20pt",
          rule: 'atLeast'
        },
        children: [
          new TableCell({
            columnSpan: 3 + this.project.equipments.length,
            verticalAlign: VerticalAlignTable.CENTER,
            children: [new Paragraph({
              children: [
                new TextRun({ text: 'Closing Force:', bold: true })
              ]
            })]
          }),
        ]
      }),
      ['Door dwell time in response to:', '', ''],
      ['Car cell', 'sec', '3.0 - 5.0'],
      ['Landing call', 'sec', '5.0 - 7.0']
    ];

    return this.createTable([
      headers,
      ...rows.map(row =>
        row instanceof TableRow ? row :
          [
            ...row,
            ...Array(this.project.equipments.length).fill('')
          ]
      )
    ])
  }

  // Helper method to generate passenger comfort 1 data
  private generatePassengerComfort1Data(): Table {
    const headers = ['Parameter:', 'Units', 'Target'];
    const rows = [
      ['1. Vertical acceleration', 'm/s²', '0.9 - 1.1'],
      ['2. Vertical deceleration', 'm/s²', '0.9 - 1.1'],
      ['3. Jerk', 'm/s²', '1 to 3'],
      ['4. Full speed', 'm/s²', ''],
      ['    ●Up - maximum', '', '4.75 - 5.25'],
      ['    ●Down - maximum', '', '4.75 - 5.25'],
      ['5. Longitudinal vibration:', '', 'Max 0.180'],
      ['6. Lateral vibration:', '', 'Max 0.180'],
      ['7. Vertical vibration (Outside Jerk Zones)', '', 'Max 0.200'],
      ['8. Vertical vibration (Inside Jerk Zones)', '', 'Max 0.350'],
      ['9. Noise level measured whilst lfit is travelling', 'dBA', '58']
    ];

    return this.createTable([
      [...headers,
      ...this.project.equipments.map(equipment =>
        equipment.name || `Equipment ${equipment._id}`
      ),
      ],
      ...rows.map(row => [
        ...row,
        ...Array(this.project.equipments.length).fill('')
      ])
    ])

  }

  // Helper method to generate passenger comfort 2 data
  private generatePassengerComfort2Data(): Table {
    const headers = ['Parameter:'];
    const rows = [
      ['1. Longitudinal vibration'],
      ['2. Lateral vibration'],
      ['3. Vertical vibration'],
      ['4. Noise level']
    ];

    return this.createTable([
      [...headers,
      ...this.project.equipments.map(equipment =>
        equipment.name || `Equipment ${equipment._id}`
      ),
      ],
      ...rows.map(row => [
        ...row,
        ...Array(this.project.equipments.length).fill('')
      ])
    ])
  }


  // Helper method to generate defective items data
  private async generateDefectiveItemsData(): Promise<Table> {
    const headers = ['Unit No.', 'ELEVATOR / ESCALATOR / MOVING WALK DEFECT', 'Completion Details'];
    const rows: Array<Array<string | TableCell>> = [
      ['LIFT CAR', '', '']
    ];
    for (const equipment of this.project.equipments) {
      if (!equipment.checklists || !equipment.category) continue;
      for (const checklist of this.checklists) {
        if (!equipment.checklists[checklist._id]) continue;
        const status = equipment.checklists[checklist._id].status;
        if (status !== 'priority1' && status !== 'priority2') continue;
        const comment = equipment.checklists[checklist._id].comment;
        const attachments = equipment.attachments.filter(attachment => attachment.inspection_item === checklist._id);
        if (comment || attachments.length > 0) {
          const imagePromises = attachments.map(async (attachment) => {
            try {
              return await this.getImage(attachment);
            } catch (error) {
              const errorCategory = this.categorizeImageError(error, attachment);
              console.error(`Failed to load image for attachment ${attachment._id}:`, {
                attachmentId: attachment._id,
                fileName: attachment.low_size_name,
                errorCategory,
                error: error.message
              });
              // Return a fallback text element instead of null
              return this.createImageFallback(attachment);
            }
          });
          
          const imageResults = await Promise.all(imagePromises);
          // All images should now be valid (either actual images or fallbacks)
          const images = imageResults;
          
          // Log summary of image processing
          const totalImages = attachments.length;
          const successfulImages = imageResults.filter(img => img instanceof ImageRun).length;
          const failedImages = totalImages - successfulImages;
          
          if (failedImages > 0) {
            console.warn(`Image processing summary for equipment ${equipment.name || equipment._id}: ${successfulImages}/${totalImages} images loaded successfully, ${failedImages} failed (using fallbacks)`);
          } else if (totalImages > 0) {
            console.log(`Image processing summary for equipment ${equipment.name || equipment._id}: ${successfulImages}/${totalImages} images loaded successfully`);
          }

          rows.push([
            equipment.name || `Equipment ${equipment._id}`,
            new TableCell({
              children: [
                new Paragraph({
                  spacing:{
                    before: 200,
                    after: 200
                  },
                  children: [
                    new TextRun({
                      text: comment || '' }),
                    ...images
                  ]
                }),
              ]
            }),
            ""
          ]);
        }
      }
    }

    return this.createTable([
      headers,
      ...rows
    ]);


  }

  // Helper method to generate landing signalisation data
  private generateLandingSignalisationData(): Table {
    const headers = [
      '',
      ...this.project.equipments.map(
        equipment => (
          new TableCell({
            columnSpan: 3,
            shading: {
              fill: '#bde0fe',
              type: ShadingType.CLEAR
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: equipment.name || `Equipment ${equipment._id}`,
                    bold: true,
                    size: `9pt`,
                    color: '#141414',
                  })
                ]
              })
            ]
          })
        )
      )
    ];

    const subHeaders = ['Floor ID', ...this.project.equipments.flatMap(_eq => ['Buttons', 'Indicator', 'Chime'])];
    const rows: Array<Array<string | TableCell>> = [];

    for (const floor of this.allFloorDesignations) {
      const row: Array<string | TableCell> = [floor];

      for (const equipment of this.project.equipments) {
        const floorData = equipment.floors.find(f => f.designation === floor);
        if (floorData) {
          row.push(
            this.getStatusCell(floorData.landing_call_button || ''),
            this.getStatusCell(floorData.landing_indication || ''),
            this.getStatusCell(floorData.landing_chime || '')
          );
        } else {
          row.push('', '', '');
        }
      }
      rows.push(row);
    }

    return this.createTable([
      headers,
      subHeaders,
      ...rows
    ]);
  }

  // Helper method to generate floor levelling data
  private generateFloorLevellingData(): Table {

    const headers = ['Floor ID', ...this.project.equipments.map(eq => eq.name || `Equipment ${eq._id}`)];
    const rows: Array<Array<string | TableCell>> = [];

    for (const floor of this.allFloorDesignations) {
      const row: Array<string | TableCell> = [floor];

      for (const equipment of this.project.equipments) {
        const floorData = equipment.floors.find(f => f.designation === floor);
        if (floorData) {
          row.push(
            this.getStatusCell(floorData.floor_levelling || ''),
          );
        } else {
          row.push('');
        }
      }
      rows.push(row);
    }


    return this.createTable([
      headers,
      ...rows
    ]);
  }

  // Helper method to generate car interior data
  private generateCarInteriorData(): Array<FileChild> {

    const headers = ['Car Interior', 'Type', 'Condition and Compliance'];
    const rows = [{
      label: 'Walls',
      typeKey: 'car_interior.wall_type',
      statusKey: 'walls'
    }, {
      label: 'Ceiling and Lights',
      typeKey: 'car_interior.ceiling_and_lights_type',
      statusKey: 'ceiling'
    }, {
      label: 'Flooring',
      typeKey: 'car_interior.flooring_type',
      statusKey: 'flooring'
    }, {
      label: 'Mirror',
      typeKey: 'car_interior.mirror_location',
      statusKey: 'mirror'
    }, {
      label: 'Hand Rails',
      typeKey: 'car_interior.handrails',
      statusKey: 'handrails'
    }, {
      label: 'Car Buttons',
      typeKey: 'car_interior.buttons_type',
      statusKey: 'buttons'
    }, {
      label: 'Car Indication',
      typeKey: 'car_interior.indication_type',
      statusKey: 'indication'
    }, {
      label: 'Voice Announcement',
      typeKey: 'car_interior.voice_announcement',
      statusKey: 'voice_announcement'
    }, {
      label: 'Car Door Type',
      typeKey: 'car_interior.car_door_type',
      statusKey: 'car_door_type'
    }, {
      label: 'Car Door Finishes',
      typeKey: 'car_interior.car_door_finishes',
      statusKey: 'car_door_finishes'
    }]

    const carInterriorChildren: Array<ParagraphChild | FileChild> = []

    this.project.equipments.forEach(equipment => {
      carInterriorChildren.push(
        new Paragraph({
          spacing:{
            before: 200,
            after: 200
          },
          children: [
            new TextRun({
              text: `Car Interior - ${equipment.name}`,
              bold: true,
              size: `9pt`,
              color: '#141414',
            })
          ]
        })
      )
      carInterriorChildren.push(
        this.createTable(
          [headers,
            ...rows.map(row => {
              const status = this.getInteriorStatus(equipment, row.statusKey)

              return [
                row.label,
                this.getNestedValue(equipment, row.typeKey) || "",
                this.getStatusCell(status)
              ]
            })
          ]
        )
      )


    })
    return carInterriorChildren as Array<FileChild>

  }

  // Helper method to get nested object values safely
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  private getInteriorStatus(equipment: EquipmentWithFloors, statusKey: string): string {
    let interiorId: string | null = null
    if (statusKey == "walls" && equipment.category == "machineRoom")
      interiorId = "65c9f0f8c5360896a8a81406"
    else if (statusKey == "walls" && equipment.category == "mrl")
      interiorId = "65c9c1eb502328e91c7f00c4"
    else if (statusKey == "ceiling" && equipment.category == "machineRoom")
      interiorId = "65c9f0e4c5360896a8a81404"
    else if (statusKey == "ceiling" && equipment.category == "mrl")
      interiorId = "65c9c1da502328e91c7f00c2"
    else if (statusKey == "lights" && equipment.category == "machineRoom")
      interiorId = "65c9f060c5360896a8a813f8"
    else if (statusKey == "lights" && equipment.category == "mrl")
      interiorId = "65c9c16f502328e91c7f00b6"
    else if (statusKey == "flooring" && equipment.category == "machineRoom")
      interiorId = "65f902b8f575dc2d8aca7476"
    else if (statusKey == "flooring" && equipment.category == "mrl")
      interiorId = "65c9c211502328e91c7f00c8"
    else if (statusKey == "mirror" && equipment.category == "machineRoom")
      interiorId = "65c9f10ec5360896a8a81408"
    else if (statusKey == "mirror" && equipment.category == "mrl")
      interiorId = "65c9c1fd502328e91c7f00c6"
    else if (statusKey == "buttons" && equipment.category == "machineRoom")
      interiorId = "65f903abf575dc2d8aca7479"
    else if (statusKey == "buttons" && equipment.category == "mrl")
      interiorId = "65c9c22d502328e91c7f00cb"
    else if (statusKey == "indication" && equipment.category == "machineRoom")
      interiorId = "65f904b5f575dc2d8aca747c"
    else if (statusKey == "indication" && equipment.category == "mrl")
      interiorId = "65c9c246502328e91c7f00ce"
    else if (statusKey == "voice_announcement" && equipment.category == "machineRoom")
      interiorId = "65c9f085c5360896a8a813fc"
    else if (statusKey == "voice_announcement" && equipment.category == "mrl")
      interiorId = "65c9c190502328e91c7f00ba"
    else return ""

    return equipment.checklists?.[interiorId]?.['status']

  }

  private getStatusCell(status: string): TableCell {
    const statusText = status === "pass" ? "✓" : ["priority1", "priority2"].includes(status) ? "✗" : ""
    const statusColor = status === "pass" ? "#588157" : ["priority1", "priority2"].includes(status) ? "#FF0000" : "#000000"

    return new TableCell({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: statusText,
              size: `9pt`,
              color: statusColor,
            })
          ]
        })
      ]
    })
  }

  private async getImage(attachment: AttachmentResponseDto): Promise<ImageRun> {
    try {
      const imageData = await this.storageService.getFile(attachment.equipment_id, attachment.low_size_name);
      
      if (!imageData) {
        throw new Error(`No image data returned for attachment ${attachment._id}`);
      }

      return new ImageRun({
        data: imageData,
        type: "jpg",
        transformation: {
          width: 400,
          height: 300
        }
      });
    } catch (error) {
      console.error(`Error in getImage for attachment ${attachment._id}:`, {
        attachmentId: attachment._id,
        equipmentId: attachment.equipment_id,
        fileName: attachment.low_size_name,
        error: error.message
      });
      throw error; // Re-throw so the calling code can handle it
    }
  }

  /**
   * Creates a fallback text element when an image fails to load
   * This provides better user experience by showing what was supposed to be there
   */
  private createImageFallback(attachment: AttachmentResponseDto): TextRun {
    return new TextRun({
      text: `[Image: ${attachment.low_size_name} - Failed to load]`,
      color: '#FF0000',
      size: '8pt',
      italics: true
    });
  }

  /**
   * Enhanced error handling for image loading with categorization
   */
  private categorizeImageError(error: any, attachment: AttachmentResponseDto): string {
    if (error.message?.includes('No image data returned')) {
      return 'Image data missing';
    } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
      return 'Network error';
    } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
      return 'Access denied';
    } else if (error.message?.includes('not found')) {
      return 'File not found';
    } else {
      return 'Unknown error';
    }
  }
}

// Factory for creating configured ReportsService instances
@Injectable()
export class ReportsServiceFactory {

  constructor(private readonly storageService: StorageService) { }

  create(project: ProjectDetailResponseDto, checklists: ChecklistResponseDto[], user: UserInfo): ReportsService {
    return new ReportsService(project, checklists, user, this.storageService);
  }
}
