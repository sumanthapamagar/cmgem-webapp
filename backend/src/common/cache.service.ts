import { Injectable } from '@nestjs/common';

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private cache = new Map<string, CacheItem<any>>();

  async get<T>(key: string): Promise<T | undefined> {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = Date.now() + (ttl || 300) * 1000; // Default 5 minutes
    this.cache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async reset(): Promise<void> {
    this.cache.clear();
  }

  // Specific cache methods for common use cases
  async getProject(id: string): Promise<any> {
    return this.get(`project:${id}`);
  }

  async setProject(id: string, project: any, ttl: number = 300): Promise<void> {
    await this.set(`project:${id}`, project, ttl);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.get<string[]>('project:categories');
    return result || [];
  }

  async setCategories(categories: string[], ttl: number = 3600): Promise<void> {
    await this.set('project:categories', categories, ttl);
  }

  async invalidateProject(id: string): Promise<void> {
    await this.del(`project:${id}`);
  }

  async invalidateCategories(): Promise<void> {
    await this.del('project:categories');
  }

  // Checklist cache methods
  async getChecklists(): Promise<any[]> {
    const result = await this.get<any[]>('checklists:all');
    return result || [];
  }

  async setChecklists(checklists: any[], ttl: number = 1800): Promise<void> {
    await this.set('checklists:all', checklists, ttl);
  }

  async invalidateChecklists(): Promise<void> {
    await this.del('checklists:all');
  }
}
