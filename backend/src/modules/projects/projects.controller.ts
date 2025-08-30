import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, UseInterceptors, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ProjectsService } from './projects.service';
import type { PaginationOptions, PaginatedResult } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './projects.schema';
import { ProjectDetailResponseDto } from './dto/project-detail-response.dto';
import { UserInterceptor } from 'src/interceptors';
import { GetUserInfo } from 'src/decorators';
import type { UserInfo } from 'src/types/user.types';

@Controller('projects')
@UseInterceptors(UserInterceptor)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Get()
  async findAll(@Query() query: any): Promise<PaginatedResult<Project>> {
    // Parse and validate query parameters
    const options: PaginationOptions = {
      page: query.page ? Math.max(1, parseInt(query.page.toString())) : 1,
      limit: query.limit ? Math.min(100, Math.max(1, parseInt(query.limit.toString()))) : 10,
      sortBy: query.sortBy || 'created_at',
      sortOrder: query.sortOrder || 'desc',
      search: query.search,
      category: query.category,
      accountId: query.accountId,
    };

    return this.projectsService.findAll(options);
  }

  @Get('all')
  async findAllWithoutPagination(): Promise<Project[]> {
    return this.projectsService.findAllWithoutPagination();
  }

  @Get('categories')
  async getAvailableCategories(): Promise<string[]> {
    return this.projectsService.getAvailableCategories();
  }

  @Get('account/:accountId')
  async findByAccountId(@Param('accountId') accountId: string): Promise<Project[]> {
    return this.projectsService.findByAccountId(accountId);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ProjectDetailResponseDto> {
    return this.projectsService.findById(id);
  }

  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @GetUserInfo() user: UserInfo,
  ): Promise<Project> {
    return this.projectsService.create(createProjectDto, user);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: CreateProjectDto,
    @GetUserInfo() user: UserInfo,
  ): Promise<Project> {
    return this.projectsService.update(id, updateProjectDto, user);
  }

  @Patch(':id')
  async partialUpdate(
    @Param('id') id: string,
    @Body() updateProjectDto: CreateProjectDto,
    @GetUserInfo() user: UserInfo,
  ): Promise<Project> {
    return this.projectsService.update(id, updateProjectDto, user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @GetUserInfo() user: UserInfo): Promise<{ message: string }> {
    await this.projectsService.delete(id, user);
    return { message: 'Project deleted successfully' };
  }

  @Delete(':id/hard')
  async hardDelete(@Param('id') id: string, @GetUserInfo() user: UserInfo): Promise<{ message: string }> {
    await this.projectsService.hardDelete(id, user);
    return { message: 'Project permanently deleted' };
  }

  @Get(':id/inspection-report')
  async generateInspectionDocument(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const excelBuffer = await this.projectsService.generateInspectionDocument(id);
      
      // Set response headers for file download
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="inspection_report_${id}.xlsx"`,
        'Content-Length': excelBuffer.length,
      });
      
      // Send the file
      res.send(excelBuffer);
    } catch (error) {
      console.error('Error generating Excel document:', error);
      res.status(500).json({ message: 'Error generating Excel document' });
    }
  }
  @Get(':id/report')
  async generateReport(
    @Param('id') id: string,
    @GetUserInfo() user: UserInfo,
    @Res() res: Response,
  ): Promise<void> {
    
    try {
      const wordBuffer = await this.projectsService.generateReport(id, user);
      
      // Set response headers for file download
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="report_${id}.docx"`,
        'Content-Length': wordBuffer.length,
      });
      
      // Send the file
      res.send(wordBuffer);
    } catch (error) {
      console.error('Error generating Word document:', error);
      res.status(500).json({ message: 'Error generating Word document' });
    }
  }
}
