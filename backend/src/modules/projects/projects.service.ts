import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './projects.schema';
import { Equipment, EquipmentDocument } from '../equipments/equipments.schema';
import { Floor, FloorDocument } from '../floors/floors.schema';
import { Attachment, AttachmentDocument } from '../attachments/attachments.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectDetailResponseDto } from './dto/project-detail-response.dto';
import { ChecklistsService } from '../checklists/checklists.service';
import { ExcelService } from '../reports/excel.service';
import type { UserInfo } from 'src/types/user.types';
import { ReportsServiceFactory } from '../reports/reports.service';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  category?: string;
  accountId?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name, 'default') private projectModel: Model<ProjectDocument>,
    @InjectModel(Equipment.name, 'default') private equipmentModel: Model<EquipmentDocument>,
    @InjectModel(Floor.name, 'default') private floorModel: Model<FloorDocument>,
    @InjectModel(Attachment.name, 'default') private attachmentModel: Model<AttachmentDocument>,
    private checklistsService: ChecklistsService,
    private excelService: ExcelService,
    private reportServiceFactory: ReportsServiceFactory
  ) { }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Project>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
      search,
      category,
      accountId
    } = options;

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // Validate and set default sort field
    const allowedSortFields = ['created_at', 'updated_at', 'name', 'category', 'inspection_date'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';

    // Build sort object
    const sort: any = {};
    sort[validSortBy] = sortDirection;

    // Build filter object
    const filter: any = { deleted_at: { $exists: false } };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (accountId) {
      filter.account_id = new Types.ObjectId(accountId);
    }

    // Get total count for pagination
    const total = await this.projectModel.countDocuments(filter);

    // Get paginated data
    const data = await this.projectModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findAllWithoutPagination(): Promise<Project[]> {
    return this.projectModel
      .find({ deleted_at: { $exists: false } })
      .sort({ created_at: -1 })
      .exec();
  }

  async getAvailableCategories(): Promise<string[]> {
    const categories = await this.projectModel
      .distinct('category', { deleted_at: { $exists: false } })
      .exec();
    return categories.sort();
  }

  async findById(id: string): Promise<ProjectDetailResponseDto> {
    const result = await this.projectModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(id) }
      },
      {
        $addFields: {
          projectIdStr: { $toString: "$_id" }
        }
      },
      {
        $addFields: {
          accountIdObjectId: { $toObjectId: "$account_id" }
        }
      },
      {
        $lookup: {
          from: "accounts",
          localField: "accountIdObjectId",
          foreignField: "_id",
          as: "account"
        }
      },
      {
        $addFields: {
          account: { $arrayElemAt: ["$account", 0] }
        }
      },
      {
        $lookup: {
          from: "equipments",
          localField: "projectIdStr",
          foreignField: "project_id",
          as: "equipments"
        }
      },
      {
        $addFields: {
          equipments: {
            $cond: {
              if: { $gt: [{ $size: "$equipments" }, 0] },
              then: {
                $map: {
                  input: "$equipments",
                  as: "eq",
                  in: {
                    $mergeObjects: [
                      "$$eq",
                      {
                        equipmentIdStr: { $toString: "$$eq._id" }
                      }
                    ]
                  }
                }
              },
              else: []
            }
          }
        }
      },
      {
        $unwind: {
          path: "$equipments",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "floors",
          localField: "equipments.equipmentIdStr",
          foreignField: "equipment_id",
          as: "equipments.floors"
        }
      },
      {
        $lookup: {
          from: "attachments",
          localField: "equipments.equipmentIdStr",
          foreignField: "equipment_id",
          as: "equipments.attachments"
        }
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          category: { $first: "$category" },
          account_id: { $first: "$account_id" },
          account: { $first: "$account" },
          address: { $first: "$address" },
          inspection_date: { $first: "$inspection_date" },
          is_test: { $first: "$is_test" },
          created_by: { $first: "$created_by" },
          updated_by: { $first: "$updated_by" },
          deleted_by: { $first: "$deleted_by" },
          created_at: { $first: "$created_at" },
          updated_at: { $first: "$updated_at" },
          deleted_at: { $first: "$deleted_at" },
          equipments: { 
            $push: {
              $cond: {
                if: { $and: [
                  { $ne: ["$equipments", null] },
                  { $ne: ["$equipments", {}] }
                ]},
                then: "$equipments",
                else: "$$REMOVE"
              }
            }
          }
        }
      }
    ]).exec();

    if (!result || result.length === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Filter out equipments that have deleted_at field with a value after the MongoDB query
    const projectData = result[0];

    projectData.checklists = await this.checklistsService.findAll();

    // Ensure equipments is always an array and filter out deleted equipments
    if (!projectData.equipments) {
      projectData.equipments = [];
    } else {
      projectData.equipments = projectData.equipments.filter(equipment => {
        // Keep equipment only if it has valid properties and deleted_at is undefined, null, or doesn't exist
        return equipment && equipment._id && !equipment.deleted_at;
      });

      // Filter out deleted attachments for each equipment
      projectData.equipments.forEach(equipment => {
        if (equipment.attachments) {
          equipment.attachments = equipment.attachments.filter(attachment => {
            // Keep attachment only if deleted_at is undefined, null, or doesn't exist
            return !attachment.deleted_at;
          });
        }
      });
    }

    return this.mapToDetailResponseDto(projectData);
  }

  async findByAccountId(accountId: string): Promise<Project[]> {
    return this.projectModel.find({
      account_id: new Types.ObjectId(accountId),
      deleted_at: { $exists: false }
    }).exec();
  }


  async create(createProjectDto: CreateProjectDto, user: UserInfo): Promise<Project> {
    const createdProject = new this.projectModel({
      ...createProjectDto,
      account_id: createProjectDto.account_id,
      inspection_date: new Date(createProjectDto.inspection_date),
      created_by: user,
    });
    return createdProject.save();
  }

  async update(id: string, updateProjectDto: CreateProjectDto, user: UserInfo): Promise<Project> {
    const updateData: any = { ...updateProjectDto };

    // Convert inspection_date to Date if it exists
    if (updateProjectDto.inspection_date) {
      updateData.inspection_date = new Date(updateProjectDto.inspection_date);
    }

    const updatedProject = await this.projectModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { ...updateData, updated_at: new Date(), updated_by: user },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return updatedProject;
  }

  async delete(id: string, user: UserInfo): Promise<void> {
    const result = await this.projectModel.findByIdAndUpdate(
      id,
      { deleted_at: new Date(), deleted_by: user },
    ).exec();

    if (!result) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

  async hardDelete(id: string, user: UserInfo): Promise<void> {
    const result = await this.projectModel.findByIdAndDelete(id, { deleted_by: user }).exec();

    if (!result) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

  async generateInspectionDocument(projectId: string): Promise<Buffer> {
    // Get project details with all related data
    const project = await this.findById(projectId);

    // Generate Excel document
    return this.excelService.generateInspectionDocument(project);
  }

  async generateReport(projectId: string, user: UserInfo): Promise<Buffer> {
    const project = await this.findById(projectId);
    const reportService = this.reportServiceFactory.create(project, user);
    return reportService.generateReport();
  }

  private mapToDetailResponseDto(projectData: any): ProjectDetailResponseDto {
    return {
      _id: projectData._id,
      checklists: projectData.checklists,
      name: projectData.name,
      category: projectData.category,
      account_id: projectData.account_id,
      account: projectData.account,
      address: {
        ...projectData.address,
        text: [
          projectData.address.street_1,
          projectData.address.street_2  ,
          projectData.address.city,
          projectData.address.post_code,
          projectData.address.state,
          projectData.address.country
        ].filter(Boolean).join(', ')
      },
      inspection_date: projectData.inspection_date,
      is_test: projectData.is_test,
      created_by: projectData.created_by,
      updated_by: projectData.updated_by,
      deleted_by: projectData.deleted_by,
      created_at: projectData.created_at,
      updated_at: projectData.updated_at,
      deleted_at: projectData.deleted_at,
      equipments: (projectData.equipments || []).map(
        equipment => {
          equipment.floors_served_front_rear  = `${equipment.lift?.floor_served_front}/${equipment.lift?.floor_served_rear}`
          return equipment;
        }
      ),
    };
  }
}
