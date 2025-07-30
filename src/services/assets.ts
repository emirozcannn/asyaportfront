import { api } from './api';
import { Asset, Assignment, ApiResponse, AssetCategory } from '../types';

export const assetService = {
  // Get all assets
  async getAssets(): Promise<ApiResponse<Asset[]>> {
    const response = await api.get<ApiResponse<Asset[]>>('/assets');
    return response.data;
  },

  // Get asset by QR code
  async getAssetByQrCode(qrCode: string): Promise<ApiResponse<Asset>> {
    const response = await api.get<ApiResponse<Asset>>(`/assets/qr/${qrCode}`);
    return response.data;
  },

  // Create asset
  async createAsset(data: { name: string; serialNumber?: string; categoryId: string }): Promise<ApiResponse<Asset>> {
    const response = await api.post<ApiResponse<Asset>>('/assets', data);
    return response.data;
  },

  // Get categories
  async getCategories(): Promise<ApiResponse<AssetCategory[]>> {
    const response = await api.get<ApiResponse<AssetCategory[]>>('/assets/categories');
    return response.data;
  }
};

export const assignmentService = {
  // Assign asset
  async assignAsset(data: { assetId: string; assignedToId: string; notes?: string }): Promise<ApiResponse<Assignment>> {
    const response = await api.post<ApiResponse<Assignment>>('/assignments/assign', data);
    return response.data;
  },

  // Return asset
  async returnAsset(assignmentId: string): Promise<ApiResponse<string>> {
    const response = await api.post<ApiResponse<string>>(`/assignments/return/${assignmentId}`);
    return response.data;
  },

  // Get active assignments
  async getActiveAssignments(): Promise<ApiResponse<Assignment[]>> {
    const response = await api.get<ApiResponse<Assignment[]>>('/assignments/active');
    return response.data;
  },

  // Get my assignments
  async getMyAssignments(): Promise<ApiResponse<Assignment[]>> {
    const response = await api.get<ApiResponse<Assignment[]>>('/assignments/my');
    return response.data;
  }
};