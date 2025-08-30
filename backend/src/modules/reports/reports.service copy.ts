import { Injectable } from '@nestjs/common';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, TextRun } from 'docx';
import { EquipmentWithFloors, ProjectDetailResponseDto } from '../projects/dto';
import type { UserInfo } from 'src/types/user.types';
import { FloorResponseDto } from '../floors/dto';
import * as fs from 'fs';
import * as path from 'path';


@Injectable()
export class ReportsService {

  // Word document generation methods
  async generateReport(project: ProjectDetailResponseDto, currentUser: UserInfo): Promise<Buffer> {
    try {
      // Generate document content
      const documentContent = await this.createDocumentContent(project, currentUser);
      
      // Load the existing template
      const templatePath = path.join(process.cwd(), 'templates', 'report_template.docx');
      const templateBuffer = fs.readFileSync(templatePath);
      
      // Clone and edit the template
      const doc = await this.cloneAndEditTemplate(templateBuffer, documentContent);
      
      // Pack the document
      const buffer = await Packer.toBuffer(doc);
      return buffer;
    } catch (error) {
      console.log("error", error);
      throw new Error(`Failed to generate Word document: ${error.message}`);
    }
  }

  /**
   * Clones and edits an existing template by reading its structure
   * and applying new content to it
   */
  private async cloneAndEditTemplate(templateBuffer: Buffer, content: any): Promise<Document> {
    try {
      // Create a new document that follows the template structure
      // This effectively clones the template's intended structure and allows editing
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: this.buildTemplateDocumentChildren(content)
        }]
      });
      
      // Apply template-specific formatting and structure
      this.applyTemplateFormatting(doc, templateBuffer);
      
      return doc;
    } catch (error) {
      // Fallback to creating a new document if template processing fails
      console.warn('Template processing failed, falling back to new document creation:', error.message);
      return new Document({
        sections: [{
          properties: {},
          children: this.buildTemplateDocumentChildren(content)
        }]
      });
    }
  }

  /**
   * Applies template-specific formatting and structure to the document
   */
  private applyTemplateFormatting(doc: Document, templateBuffer: Buffer): void {
    // This method can be enhanced to apply specific formatting from the template
    // For now, it serves as a placeholder for template-specific customizations
    
    // You could implement logic here to:
    // - Extract styles from the template
    // - Apply template-specific formatting
    // - Maintain template structure and layout
  }

  private async createDocumentContent(project: ProjectDetailResponseDto, currentUser: UserInfo) {
    const currentDate = new Date();
    const defectiveItems = this.listDefectiveItems(project);
    const floorData = this.getFloorData(project.equipments);
    const signalisationData = this.getSignalisationData(project.equipments);

    return {
      replacements: {
        "{{PROJECT_NAME}}": project.name || "",
        // "<<CONTRACTOR_NAME>>": project.equipments[0]?.maintenance?.current_provider || "",
        // "<<INSPECTION_DATE>>": project.inspection_date || "",
        // "<<CUSTOMER_NAME>>": project.account?.name || "",
        // "<<BUILDING_ADDRESS>>": project.address?.text || "",
        // "<<ACCEPTANCE_STATUS>>": "acceptable",
        // "<<REPORT_DATE>>": currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        // "<<CURRENT_USER>>": currentUser.name,
        // "<<LIFT_NAMES>>": project.equipments.map(eq => eq.name).join(', ')
      },
      lists: {
        // "<<OWNER_BULLET_LIST>>": this.getChecklistValuesByCategory( ["owner"], project),
        // "<<HOUSEKEEPING_BULLET_LIST>>": this.getChecklistValuesByCategory( ["housekeeping"], project),
        // "<<SAFETY_DEVICES_BULLET_LIST>>": this.getChecklistValuesByCategory( ["safety-devices"], project),
        // "<<SAFETY_RISKS_BULLET_LIST>>": this.getChecklistValuesByCategory( ["safety-risk"], project),
        // "<<RELIABILITY_AND_OUTAGE_RISKS_BULLET_LIST>>": this.getChecklistValuesByCategory( ["reliability", "outage-risk"], project),
        // "<<PASSENGER_COMFORT_BULLET_LIST>>": this.getChecklistValuesByCategory( ["passenger-comfort"], project),
        // "<<COMPLIANCE_BULLET_LIST>>": this.getChecklistValuesByCategory( ["compliance"], project),
        // "<<SUSTAINABILITY_BULLET_LIST>>": this.getChecklistValuesByCategory( ["sustainability"], project)
      },
      tables: [
        {
          key: '<<TABLE_EQUIPMENT_LIST>>',
          data: this.createEquipmentListTable(project.equipments)
        },
        {
          key: '<<TABLE_EXECUTIVE_DASHBOARD>>',
          data: this.createExecutiveDashboardTable(project.equipments)
        },
        {
          key: '<<TABLE_CAR_DOOR_OPERATION>>',
          data: this.createCarDoorOperationTable(project.equipments)
        },
        {
          key: '<<TABLE_PASSENGER_COMFORT_1>>',
          data: this.createPassengerComfort1Table(project.equipments)
        },
        {
          key: '<<TABLE_PASSENGER_COMFORT_2>>',
          data: this.createPassengerComfort2Table(project.equipments)
        },
        {
          key: '<<TABLE_MAINTENANCE_RECORDS>>',
          data: this.createMaintenanceRecordsTable(project.equipments)
        },
        {
          key: '<<TABLE_DEFECTIVE_ITEMS>>',
          data: this.createDefectiveItemsTable(defectiveItems)
        }
      ],
      floorData,
      signalisationData,
      defectiveItems,
      project
    };
  }



  private buildTemplateDocumentChildren(content: any): any[] {
    const children: any[] = [];
    
    // Add document header with project information
    children.push(this.createDocumentHeader(content.replacements));
    
    // Add executive summary section
    children.push(this.createExecutiveSummary(content.replacements));
    
    // Add equipment overview table
    children.push(this.createEquipmentOverviewTable(content.tables[0]));
    
    // Add detailed findings sections
    children.push(...this.createDetailedFindingsSections(content.lists));
    
    // Add technical specifications tables
    children.push(...this.createTechnicalSpecificationsTables(content.tables.slice(1)));
    
    // Add floor and signalisation data
    children.push(this.createSignalisationTable(content.signalisationData));
    children.push(this.createFloorLevellingTable(content.floorData));
    
    // Add car interior details
    children.push(...this.createCarInteriorTables(content.project.equipments));
    
    // Add defective items summary
    children.push(this.createDefectiveItemsSummary(content.defectiveItems));
    
    return children;
  }

  private createDocumentHeader(replacements: Record<string, string>): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: `Project Report: ${replacements['<<PROJECT_NAME>>']}`,
          size: 32,
          font: 'Arial',
          bold: true
        })
      ],
      spacing: {
        after: 400
      },
      alignment: AlignmentType.CENTER
    });
  }

  private createExecutiveSummary(replacements: Record<string, string>): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: `Executive Summary`,
          size: 28,
          font: 'Arial',
          bold: true
        })
      ],
      spacing: {
        after: 200
      }
    });
  }

  private createEquipmentOverviewTable(tableInfo: any): Table {
    if (!tableInfo || !tableInfo.data || tableInfo.data.length === 0) {
      return new Table({
        rows: []
      });
    }
    
    return new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      rows: tableInfo.data.map((row: any[], rowIndex: number) => 
        new TableRow({
          children: row.map((cellContent: any, colIndex: number) => 
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: String(cellContent || ''),
                      size: 18,
                      font: 'Arial',
                      bold: rowIndex === 0
                    })
                  ],
                  alignment: AlignmentType.CENTER
                })
              ],
              width: {
                size: 100 / row.length,
                type: WidthType.PERCENTAGE
              },
              shading: {
                fill: rowIndex === 0 ? '4472C4' : undefined,
                color: 'auto'
              }
            })
          )
        })
      )
    });
  }

  private createDetailedFindingsSections(lists: Record<string, any[]>): any[] {
    const sections: any[] = [];
    
    for (const [placeholder, listData] of Object.entries(lists)) {
      if (listData.length === 0) continue;
      
      // Section title
      sections.push(new Paragraph({
        children: [
          new TextRun({
            text: this.formatSectionTitle(placeholder),
            size: 24,
            font: 'Arial',
            bold: true
          })
        ],
        spacing: {
          after: 200
        }
      }));
      
      // Section content
      for (const item of listData) {
        if (item.equipmentItems.length === 0) continue;
        
        // Equipment subtitle
        sections.push(new Paragraph({
          children: [
            new TextRun({
              text: item.equipmentName,
              size: 20,
              font: 'Arial',
              bold: true
            })
          ],
          spacing: {
            after: 100
          }
        }));
        
        // Bullet points
        for (const listItem of item.equipmentItems) {
          sections.push(new Paragraph({
            children: [
              new TextRun({
                text: `• ${listItem}`,
                size: 18,
                font: 'Arial'
              })
            ],
            spacing: {
              after: 100
            },
            indent: {
              left: 400
            }
          }));
        }
      }
    }
    
    return sections;
  }

  private createTechnicalSpecificationsTables(tables: any[]): any[] {
    const tableElements: any[] = [];
    
    for (const tableInfo of tables) {
      if (tableInfo.data && tableInfo.data.length > 0) {
        tableElements.push(new Paragraph({
          children: [
            new TextRun({
              text: this.formatTableTitle(tableInfo.key),
              size: 22,
              font: 'Arial',
              bold: true
            })
          ],
          spacing: {
            after: 200
          }
        }));
        
        tableElements.push(this.createTableFromData(tableInfo));
      }
    }
    
    return tableElements;
  }

  private createDefectiveItemsSummary(defectiveItems: any[]): any[] {
    const elements: any[] = [];
    
    if (defectiveItems.length === 0) return elements;
    
    elements.push(new Paragraph({
      children: [
        new TextRun({
          text: 'Defective Items Requiring Attention',
          size: 24,
          font: 'Arial',
          bold: true
        })
      ],
      spacing: {
        after: 200
      }
    }));
    
    for (const item of defectiveItems) {
      elements.push(new Paragraph({
        children: [
          new TextRun({
            text: `• ${item[0]}: ${item[1].text}`,
            size: 18,
            font: 'Arial'
          })
        ],
        spacing: {
          after: 100
        },
        indent: {
          left: 400
        }
      }));
    }
    
    return elements;
  }

  private formatSectionTitle(placeholder: string): string {
    return placeholder
      .replace(/[<>]/g, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private formatTableTitle(key: string): string {
    return key
      .replace(/[<>]/g, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private createReplacementParagraphs(replacements: Record<string, string>): Paragraph[] {
    return Object.entries(replacements).map(([placeholder, value]) => 
      new Paragraph({
        children: [
          new TextRun({
            text: `${placeholder}: ${value}`,
            size: 24,
            font: 'Arial'
          })
        ],
        spacing: {
          after: 200
        }
      })
    );
  }

  private createListParagraphs(lists: Record<string, any[]>): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    
    for (const [placeholder, listData] of Object.entries(lists)) {
      if (listData.length === 0) continue;
      
      const titleParagraph = new Paragraph({
        children: [
          new TextRun({
            text: placeholder.replace(/[<>]/g, ''),
            size: 24,
            font: 'Arial',
            bold: true
          })
        ],
        spacing: {
          after: 200
        }
      });
      
      paragraphs.push(titleParagraph);
      
      for (const item of listData) {
        if (item.equipmentItems.length === 0) continue;
        
        const equipmentTitle = new Paragraph({
          children: [
            new TextRun({
              text: item.equipmentName,
              size: 20,
              font: 'Arial',
              bold: true
            })
          ],
          spacing: {
            after: 100
          }
        });
        
        paragraphs.push(equipmentTitle);
        
        for (const listItem of item.equipmentItems) {
          const bulletParagraph = new Paragraph({
            children: [
              new TextRun({
                text: `• ${listItem}`,
                size: 18,
                font: 'Arial'
              })
            ],
            spacing: {
              after: 100
            },
            indent: {
              left: 400
            }
          });
          
          paragraphs.push(bulletParagraph);
        }
      }
    }
    
    return paragraphs;
  }

  private createTableFromData(tableInfo: any): Table {
    const { data } = tableInfo;
    
    if (!data || data.length === 0) {
      return new Table({
        rows: []
      });
    }
    
    return new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      rows: data.map((row: any[], rowIndex: number) => 
        new TableRow({
          children: row.map((cellContent: any, colIndex: number) => 
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: String(cellContent || ''),
                      size: 18,
                      font: 'Arial'
                    })
                  ],
                  alignment: AlignmentType.CENTER
                })
              ],
              width: {
                size: 100 / row.length,
                type: WidthType.PERCENTAGE
              },
              shading: {
                fill: rowIndex === 0 ? '8EAADB' : undefined,
                color: 'auto'
              }
            })
          )
        })
      )
    });
  }

  private createSignalisationTable(signalisationData: any[]): Table {
    if (!signalisationData || signalisationData.length === 0) {
      return new Table({
        rows: []
      });
    }
    
    return new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      rows: [
        // Header row
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Floor ID',
                      size: 18,
                      font: 'Arial',
                      bold: true
                    })
                  ],
                  alignment: AlignmentType.CENTER
                })
              ],
              shading: {
                fill: '8EAADB',
                color: 'auto'
              }
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Buttons',
                      size: 18,
                      font: 'Arial',
                      bold: true
                    })
                  ],
                  alignment: AlignmentType.CENTER
                })
              ],
              shading: {
                fill: '8EAADB',
                color: 'auto'
              }
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Indicator',
                      size: 18,
                      font: 'Arial',
                      bold: true
                    })
                  ],
                  alignment: AlignmentType.CENTER
                })
              ],
              shading: {
                fill: '8EAADB',
                color: 'auto'
              }
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Chime',
                      size: 18,
                      font: 'Arial',
                      bold: true
                    })
                  ],
                  alignment: AlignmentType.CENTER
                })
              ],
              shading: {
                fill: '8EAADB',
                color: 'auto'
              }
            })
          ]
        }),
        // Data rows
        ...signalisationData.map(floor => 
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: floor.designation,
                        size: 18,
                        font: 'Arial'
                      })
                    ],
                    alignment: AlignmentType.CENTER
                  })
                ]
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: this.getCheckOrCross(floor.landing_call_button, ''),
                        size: 18,
                        font: 'Arial'
                      })
                    ],
                    alignment: AlignmentType.CENTER
                  })
                ]
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: this.getCheckOrCross(floor.landing_indication, ''),
                        size: 18,
                        font: 'Arial'
                      })
                    ],
                    alignment: AlignmentType.CENTER
                  })
                ]
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: this.getCheckOrCross(floor.landing_chime, ''),
                        size: 18,
                        font: 'Arial'
                      })
                    ],
                    alignment: AlignmentType.CENTER
                  })
                ]
              })
            ]
          })
        )
      ]
    });
  }

  private createFloorLevellingTable(floorData: FloorResponseDto[]): Table {
    if (!floorData || floorData.length === 0) {
      return new Table({
        rows: []
      });
    }
    
    return new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      rows: [
        // Header row
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Floor ID',
                      size: 18,
                      font: 'Arial',
                      bold: true
                    })
                  ],
                  alignment: AlignmentType.CENTER
                })
              ],
              shading: {
                fill: 'E7E6E6',
                color: 'auto'
              }
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Floor Levelling',
                      size: 18,
                      font: 'Arial',
                      bold: true
                    })
                  ],
                  alignment: AlignmentType.CENTER
                })
              ],
              shading: {
                fill: 'E7E6E6',
                color: 'auto'
              }
            })
          ]
        }),
        // Data rows
        ...floorData.map(floor => 
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: floor.designation,
                        size: 18,
                        font: 'Arial'
                      })
                    ],
                    alignment: AlignmentType.CENTER
                  })
                ]
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: this.getCheckOrCross(floor.floor_levelling, ''),
                        size: 18,
                        font: 'Arial'
                      })
                    ],
                    alignment: AlignmentType.CENTER
                  })
                ]
              })
            ]
          })
        )
      ]
    });
  }

  private createCarInteriorTables(equipments: EquipmentWithFloors[]): any[] {
    const elements: any[] = [];
    
    for (const equipment of equipments) {
      const titleParagraph = new Paragraph({
        children: [
          new TextRun({
            text: `Car Interior Table – ${equipment.name}`,
            size: 20,
            font: 'Arial',
            bold: true
          })
        ],
        spacing: {
          after: 200
        }
      });
      
      elements.push(titleParagraph);
      
      const carInteriorData = [
        ["Car Interior", "Type", "Condition and Compliance"],
        ["Walls", equipment.car_interior?.wall_type, this.getInteriorStatus(equipment.checklists || {}, "walls", equipment.category)],
        ["Ceiling and Lights", equipment.car_interior?.ceiling_and_lights_type, this.getInteriorStatus(equipment.checklists || {}, "ceiling", equipment.category)],
        ["Flooring", equipment.car_interior?.flooring_type, this.getInteriorStatus(equipment.checklists || {}, "flooring", equipment.category)],
        ["Mirror", equipment.car_interior?.mirror_location, this.getInteriorStatus(equipment.checklists || {}, "mirror", equipment.category)],
        ["Hand Rails", equipment.car_interior?.handrails, this.getInteriorStatus(equipment.checklists || {}, "handrails", equipment.category)],
        ["Car Buttons", equipment.car_interior?.buttons_type, this.getInteriorStatus(equipment.checklists  || {}, "buttons", equipment.category)],
        ["Car Indication", equipment.car_interior?.indication_type, this.getInteriorStatus(equipment.checklists || {}, "indication", equipment.category)],
        ["Voice Announcement", equipment.car_interior?.voice_announcement, this.getInteriorStatus(equipment.checklists || {}, "voice_announcement", equipment.category)],
        ["Car Door Type", equipment.car_interior?.car_door_type, this.getInteriorStatus(equipment.checklists || {}, "car_door_type", equipment.category)],
        ["Car Door Finishes", equipment.car_interior?.car_door_finishes, this.getInteriorStatus(equipment.checklists || {}, "car_door_finishes", equipment.category)]
      ];
      
      const table = new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE
        },
        rows: carInteriorData.map((row: any[], rowIndex: number) => 
          new TableRow({
            children: row.map((cellContent: any, colIndex: number) => 
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: String(cellContent || ''),
                        size: 18,
                        font: 'Arial'
                      })
                    ],
                    alignment: AlignmentType.CENTER
                  })
                ],
                width: {
                  size: 100 / row.length,
                  type: WidthType.PERCENTAGE
                },
                shading: {
                  fill: rowIndex === 0 ? '8EAADB' : undefined,
                  color: 'auto'
                }
              })
            )
          })
        )
      });
      
      elements.push(table);
      
      // Add comments section
      elements.push(...this.createCarInteriorComments(equipment));
      
      // Add spacing
      elements.push(new Paragraph({
        spacing: {
          after: 400
        }
      }));
    }
    
    return elements;
  }

  private createCarInteriorComments(equipment: EquipmentWithFloors): Paragraph[] {
    if (!equipment.checklists) return [];
    
    const itemIds = [
      "65c9f0f8c5360896a8a81406", "65c9c1eb502328e91c7f00c4",
      "65c9f0e4c5360896a8a81404", "65c9c1da502328e91c7f00c2",
      "65c9f060c5360896a8a813f8", "65c9c16f502328e91c7f00b6",
      "65f902b8f575dc2d8aca7476", "65c9c211502328e91c7f00c8",
      "65c9f10ec5360896a8a81408", "65c9c1fd502328e91c7f00c6",
      "65f903abf575dc2d8aca7479", "65c9c22d502328e91c7f00cb",
      "65f904b5f575dc2d8aca747c", "65c9c246502328e91c7f00ce",
      "65c9f085c5360896a813fc", "65c9c190502328e91c7f00ba"
    ];

    const checklistItems: string[] = [];
    for (const itemId of itemIds) {
      if (itemId in equipment.checklists && 
          equipment.checklists[itemId].comment && 
          equipment.checklists[itemId].status && 
          !["priority1", "priority2"].includes(equipment.checklists[itemId].status) && 
          equipment.checklists[itemId].comment !== "") {
        checklistItems.push(equipment.checklists[itemId].comment);
      }
    }
    
    const paragraphs: Paragraph[] = [];
    
    if (checklistItems.length > 1) {
      const titleParagraph = new Paragraph({
        children: [
          new TextRun({
            text: `Car Interior condition ${equipment.name} requiring attention:`,
            size: 18,
            font: 'Arial',
            bold: true
          })
        ],
        spacing: {
          after: 200
        }
      });
      
      paragraphs.push(titleParagraph);
      
      for (const listItem of checklistItems) {
        const bulletParagraph = new Paragraph({
          children: [
            new TextRun({
              text: `• ${listItem}`,
              size: 16,
              font: 'Arial'
            })
          ],
          spacing: {
            after: 100
          },
          indent: {
            left: 400
          }
        });
        
        paragraphs.push(bulletParagraph);
      }
    }
    
    return paragraphs;
  }

  private getChecklistValuesByCategory( categories: string[], project: ProjectDetailResponseDto) {
    const values: Array<{equipmentName: string, equipmentItems: string[]}> = [];
    
    for (const equipment of project.equipments) {
      if (!equipment.checklists) continue;

      const equipmentItems: string[] = [];
      for (const category of categories) {
        const categoryChecklists = project.checklists[equipment.category]?.filter(
          item => item.category && item.category.includes(category)
        ) || [];

        for (const checklistItem of categoryChecklists) {
          const checklistItemId = checklistItem._id.toString();
          const checklistItemValue = equipment.checklists[checklistItemId];
          
          if (checklistItemValue?.comment && checklistItemValue.comment.length > 0) {
            equipmentItems.push(checklistItemValue.comment);
          }
        }
      }
      
      if (equipmentItems.length > 0) {
        values.push({
          equipmentName: equipment.name,
          equipmentItems
        });
      }
    }
    
    return values;
  }

  private listDefectiveItems(project: ProjectDetailResponseDto): Array<[string, {text: string, attachments: Array<{container_name: string, blob_name: string}>}, string]> {
    const list: Array<[string, {text: string, attachments: Array<{container_name: string, blob_name: string}>}, string]> = [];
    
    for (const equipment of project.equipments) {
      if (!equipment.checklists) continue;
      
      for (const checklist of project.checklists) {
        const checklistId = checklist._id.toString();
        if (!equipment.checklists[checklistId]) continue;
        
        const locationStatus = equipment.checklists[checklistId].status || "";
        const locationComment = equipment.checklists[checklistId].comment || "";
        const locationAttachments = equipment.attachments
          .filter(att => att.inspection_item === checklistId)
          .map(att => ({
            container_name: equipment. _id.toString(),
            blob_name: att.low_size_name
          }));

        if ((locationStatus === 'priority1' || locationStatus === 'priority2') && 
            (locationComment !== "" || locationAttachments.length > 0)) {
          list.push([
            equipment.name || "",
            {
              text: locationComment,
              attachments: locationAttachments
            },
            ""
          ]);
        }
      }
    }
    
    return list;
  }

  private getFloorData(equipments: EquipmentWithFloors[]): Array<{designation: string, floor_values: Record<string, string>}> {
    const floorTableData: Array<{designation: string, floor_values: Record<string, string>}> = [];
    
    for (const equipment of equipments) {
      for (const equipmentFloor of equipment.floors) {
        if (!equipmentFloor.designation) continue;
        
        const matchingSublist = floorTableData.find(
          sublist => sublist.designation === equipmentFloor.designation
        );
        
        if (matchingSublist) {
          matchingSublist.floor_values[equipmentFloor.equipment_id] = equipmentFloor.floor_levelling || '';
        } else {
          floorTableData.push({
            designation: equipmentFloor.designation,
            floor_values: {
              [equipmentFloor.equipment_id]: equipmentFloor.floor_levelling || ''
            }
          });
        }
      }
    }
    
    return floorTableData;
  }

  private getSignalisationData(equipments: EquipmentWithFloors[]): Array<{designation: string, landing_call_button: Record<string, string>, landing_indication: Record<string, string>, landing_chime: Record<string, string>}> {
    const signalisationTableData: Array<{designation: string, landing_call_button: Record<string, string>, landing_indication: Record<string, string>, landing_chime: Record<string, string>}> = [];
    
    for (const equipment of equipments) {
      for (const equipmentFloor of equipment.floors) {
        if (!equipmentFloor.designation) continue;
        
        const matchingSublist = signalisationTableData.find(
          sublist => sublist.designation === equipmentFloor.designation
        );
        
        if (matchingSublist) {
          matchingSublist.landing_call_button[equipmentFloor.equipment_id] = equipmentFloor.landing_call_button || '';
          matchingSublist.landing_indication[equipmentFloor.equipment_id] = equipmentFloor.landing_indication || '';
          matchingSublist.landing_chime[equipmentFloor.equipment_id] = equipmentFloor.landing_chime || '';
        } else {
          signalisationTableData.push({
            designation: equipmentFloor.designation,
            landing_call_button: {
              [equipmentFloor.equipment_id]: equipmentFloor.landing_call_button || ''
            },
            landing_indication: {
              [equipmentFloor.equipment_id]: equipmentFloor.landing_indication || ''
            },
            landing_chime: {
              [equipmentFloor.equipment_id]: equipmentFloor.landing_chime || ''
            }
          });
        }
      }
    }
    
    return signalisationTableData;
  }

  private createEquipmentListTable(equipments: EquipmentWithFloors[]): any[][] {
    const headers = [
      "Equipment Identification", "Load", "Speed", "Floors served - Front / Rear",
      "Installation Date", "Original Equipment Manufacturer", "Current Maintenance Provider",
      "Roping Arrangement", "Control/Drive System.Regen?"
    ];
    
    const rows = equipments.map(equipment => [
      equipment.name,
      this.getValueFromKey(equipment, "lift.load"),
      this.getValueFromKey(equipment, "lift.speed"),
      this.getValueFromKey(equipment, "lift.floor_served"),
      this.getValueFromKey(equipment, "lift.installation_date"),
      this.getValueFromKey(equipment, "lift.original_equipment_manufacturer"),
      this.getValueFromKey(equipment, "maintenance.current_provider"),
      this.getValueFromKey(equipment, "lift.hoist_rope_size"),
      this.getValueFromKey(equipment, "lift.drive_system")
    ]);
    
    return [headers, ...rows];
  }

  private createExecutiveDashboardTable(equipments: EquipmentWithFloors[]): any[][] {
    const headers = [
      "Review Areas", "Housekeeping", "Safety Risk", "Reliability Risk",
      "Maintenance and Failure Rate", "Extended Outage Risk", "Passenger Comfort", "Sustainability"
    ];
    
    const rows = equipments.map(equipment => [
      equipment.name,
      "", "", "", "", "", "", ""
    ]);
    
    return [headers, ...rows];
  }

  private createCarDoorOperationTable(equipments: EquipmentWithFloors[]): any[][] {
    const headers = ["Parameter:", "Units", "Target"];
    const rows = [
      ["Door Operating:", "", ""],
      ["Fullly open to fully closed", "sec", "2.4 - 2.8"],
      ["Fully closed to fully open", "sec", "1.8 - 2.2"],
      ["Levelling time", "sec", "1.0 - 1.2"],
      ["Closing Force", "", ""],
      ["Door dwell time in response to:", "", ""],
      ["Car cell", "sec", "3.0 - 5.0"],
      ["Landing call", "sec", "5.0 - 7.0"]
    ];
    
    return [headers, ...rows];
  }

  private createPassengerComfort1Table(equipments: EquipmentWithFloors[]): any[][] {
    const headers = ["Parameter:", "Units", "Target"];
    const rows = [
      ["1. Vertical acceleration", "m/s²", "0.9 - 1.1"],
      ["2. Vertical deceleration", "m/s²", "0.9 - 1.1"],
      ["3. Jerk", "m/s²", "1 to 3"],
      ["4. Full speed", "m/s²", ""],
      ["    ●Up - maximum", "", "4.75 - 5.25"],
      ["    ●Down - maximum", "", "4.75 - 5.25"],
      ["5. Longitudinal vibration:", "", "Max 0.180"],
      ["6. Lateral vibration:", "", "Max 0.180"],
      ["7. Vertical vibration (Outside Jerk Zones)", "", "Max 0.200"],
      ["8. Vertical vibration (Inside Jerk Zones)", "", "Max 0.350"],
      ["9. Noise level measured whilst lfit is travelling", "dBA", "58"]
    ];
    
    return [headers, ...rows];
  }

  private createPassengerComfort2Table(equipments: EquipmentWithFloors[]): any[][] {
    const headers = ["Parameter:"];
    const rows = [
      ["1. Longitudinal vibration"],
      ["2. Lateral vibration"],
      ["3. Vertical vibration"],
      ["4. Noise level"]
    ];
    
    return [headers, ...rows];
  }

  private createMaintenanceRecordsTable(equipments: EquipmentWithFloors[]): any[][] {
    const headers = ["Equipment ID", "Contracted Annual Service Visits", "Actual Services Completed", "Outcome Score"];
    const rows = equipments.map(equipment => [equipment.name, "", "", ""]);
    rows.push(["", "", "", ""]);
    rows.push(["Legend", "<75%", "75% -95 %", ">95%"]);
    
    return [headers, ...rows];
  }

  private createDefectiveItemsTable(defectiveItems: any[]): any[][] {
    const headers = ["Unit No.", "ELEVATOR / ESCALATOR / MOVING WALK DEFECT", "Completion Details"];
    const rows = [["LIFT CAR", "", ""]];
    
    return [headers, ...rows, ...defectiveItems];
  }

  private getValueFromKey(obj: any, keyPath: string): string {
    if (!keyPath) return "";
    
    const keys = keyPath.split('.');
    let currentValue = obj;
    
    for (const key of keys) {
      currentValue = currentValue?.[key] || "";
    }
    
    return currentValue;
  }

  private getCheckOrCross(dictionary: any, key: string): string {
    if (!dictionary || !dictionary[key]) return "";
    
    if (dictionary[key] === "pass") return "✓";
    if (dictionary[key] === "needs-attention") return "✗";
    
    return "";
  }

  private getInteriorStatus(checklists: Record<string, any>, carInterior: string, equipmentCategory: string): string {
    if (!checklists) return "";

    let interiorId: string | null = null;
    
    if (carInterior === "walls" && equipmentCategory === "machineRoom") {
      interiorId = "65c9f0f8c5360896a8a81406";
    } else if (carInterior === "walls" && equipmentCategory === "mrl") {
      interiorId = "65c9c1eb502328e91c7f00c4";
    } else if (carInterior === "ceiling" && equipmentCategory === "machineRoom") {
      interiorId = "65c9f0e4c5360896a8a81404";
    } else if (carInterior === "ceiling" && equipmentCategory === "mrl") {
      interiorId = "65c9c1da502328e91c7f00c2";
    } else if (carInterior === "lights" && equipmentCategory === "machineRoom") {
      interiorId = "65c9f060c5360896a8a813f8";
    } else if (carInterior === "lights" && equipmentCategory === "mrl") {
      interiorId = "65c9c16f502328e91c7f00b6";
    } else if (carInterior === "flooring" && equipmentCategory === "machineRoom") {
      interiorId = "65f902b8f575dc2d8aca7476";
    } else if (carInterior === "flooring" && equipmentCategory === "mrl") {
      interiorId = "65c9c211502328e91c7f00c8";
    } else if (carInterior === "mirror" && equipmentCategory === "machineRoom") {
      interiorId = "65c9f10ec5360896a8a81408";
    } else if (carInterior === "mirror" && equipmentCategory === "mrl") {
      interiorId = "65c9c1fd502328e91c7f00c6";
    } else if (carInterior === "buttons" && equipmentCategory === "machineRoom") {
      interiorId = "65f903abf575dc2d8aca7479";
    } else if (carInterior === "buttons" && equipmentCategory === "mrl") {
      interiorId = "65c9c22d502328e91c7f00cb";
    } else if (carInterior === "indication" && equipmentCategory === "machineRoom") {
      interiorId = "65f904b5f575dc2d8aca747c";
    } else if (carInterior === "indication" && equipmentCategory === "mrl") {
      interiorId = "65c9c246502328e91c7f00ce";
    } else if (carInterior === "voice_announcement" && equipmentCategory === "machineRoom") {
      interiorId = "65c9f085c5360896a8a813fc";
    } else if (carInterior === "voice_announcement" && equipmentCategory === "mrl") {
      interiorId = "65c9c190502328e91c7f00ba";
    }
    
    if (!interiorId || !(interiorId in checklists) || !("status" in checklists[interiorId])) {
      return "";
    }
    
    if (checklists[interiorId].status === "pass") {
      return "✓";
    } else if (["priority1", "priority2"].includes(checklists[interiorId].status)) {
      return "✗";
    }
    
    return "";
  }
}
