// User types
export interface User {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  fullName: string;
  departmentName: string;
}

// API Response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Login types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  error?: string;
}

// Asset types
export interface Asset {
  id: string;
  assetNumber: string;
  name: string;
  serialNumber?: string;
  status: string;
  qrCode: string;
  categoryName: string;
  assignedToName?: string;
  assignedToEmployee?: string;
  createdAt: string;
}

// Assignment types
export interface Assignment {
  id: string;
  assignmentNumber: string;
  assetName: string;
  assetNumber: string;
  assignedToName: string;
  assignedByName: string;
  assignmentDate: string;
  returnDate?: string;
  status: string;
  notes?: string;
}

// Asset Category type
export interface AssetCategory {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}