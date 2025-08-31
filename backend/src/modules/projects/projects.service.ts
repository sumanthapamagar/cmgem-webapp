import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './projects.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectDetailResponseDto } from './dto/project-detail-response.dto';
import { ChecklistsService } from '../checklists/checklists.service';
import { ExcelService } from '../reports/excel.service';
import type { UserInfo } from 'src/types/user.types';
import { ReportsServiceFactory } from '../reports/reports.service';
import { EquipmentsService } from '../equipments/equipments.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { FloorsService } from '../floors/floors.service';

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
    private checklistsService: ChecklistsService,
    private excelService: ExcelService,
    private reportServiceFactory: ReportsServiceFactory,
    private equipmentsService: EquipmentsService,
    private attachmentsService: AttachmentsService,
    private floorsService: FloorsService
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

    // Use aggregation with $facet for better performance and include account details
    const pipeline = [
      { $match: filter },
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
          account: { 
            $cond: {
              if: { $gt: [{ $size: "$account" }, 0] },
              then: { $arrayElemAt: ["$account", 0] },
              else: null
            }
          }
        }
      },
      {
        $facet: {
          data: [
            { $sort: sort },
            { $skip: skip },
            { $limit: limit }
          ],
          count: [
            { $count: "total" }
          ]
        }
      }
    ];

    const result = await this.projectModel.aggregate(pipeline).exec();
    const data = result[0].data;
    const total = result[0].count[0]?.total || 0;
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
    // Fetch from database
    const categories = await this.projectModel
      .distinct('category', { deleted_at: { $exists: false } })
      .exec();
    
    const sortedCategories = categories.sort();
    return sortedCategories;
  }

  async findById(id: string): Promise<ProjectDetailResponseDto> {

    // Step 1: Find the project with account information
    const project = await this.projectModel.aggregate([
      {
        $match: { 
          _id: new Types.ObjectId(id),
          deleted_at: { $exists: false }
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
      }
    ]).exec();

    if (!project || project.length === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const projectData = project[0];

    // Step 2: Get equipments for this project
    const equipments = await this.equipmentsService.findByProjectId(id);

    // Step 3: If equipments exist, get their IDs and fetch attachments and floors
    let allAttachments: any[] = [];
    let allFloors: any[] = [];

    if (equipments && equipments.length > 0) {
      const equipmentIds = equipments.map(eq => eq._id);

      // Step 4: Fetch attachments and floors in parallel
      const [attachments, floors] = await Promise.all([
        this.attachmentsService.findMultipleByEquipmentIds(equipmentIds),
        this.floorsService.findMultipleByEquipmentIds(equipmentIds)
      ]);

      allAttachments = attachments;
      allFloors = floors;
    }

    // Step 5: Structure the data (checklists are now handled separately)
    const projectResult = {
      ...projectData,
      equipments: equipments.map(equipment => ({
        ...equipment,
        floors: allFloors.filter(floor => floor.equipment_id === equipment._id),
        attachments: allAttachments.filter(attachment => attachment.equipment_id === equipment._id)
      })),
      attachments: allAttachments // All project attachments
    };

    const mappedResult = this.mapToDetailResponseDto(projectResult);
    return mappedResult;
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
      updated_by: user,
      created_at: new Date(),
      updated_at: new Date(),
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

  async generateInspectionDocument(projectId: string): Promise<{ buffer: Buffer; projectName: string }> {
    // Get project details with all related data
    const project = await this.findById(projectId);
    const checklists = await this.checklistsService.findAll();

    // Generate Excel document
    const buffer = await this.excelService.generateInspectionDocument(project, checklists);
    return { buffer, projectName: project.name };
  }

  async generateReport(projectId: string, user: UserInfo): Promise<{ buffer: Buffer; projectName: string }> {
    const project = await this.findById(projectId);
    const checklists = await this.checklistsService.findAll();
    const reportService = this.reportServiceFactory.create(project, checklists, user);
    const buffer = await reportService.generateReport();
    return { buffer, projectName: project.name };
  }

  private mapToDetailResponseDto(projectData: any): ProjectDetailResponseDto {
    return {
      _id: projectData._id,
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
