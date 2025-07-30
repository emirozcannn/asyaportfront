// User types
// User tablosu (doğrudan alanlar)
export interface User {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string; // opsiyonel, backendde tutulur
  departmentId: string;
  role: 'Admin' | 'ZimmetManager' | 'Employee';
  isActive: boolean;
  createdAt: string;
  // İlişkisel alanlar (opsiyonel, view/join ile gelir)
  departmentName?: string;
  fullName?: string;
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
// Asset tablosu (doğrudan alanlar)
export interface Asset {
  id: string;
  assetNumber: string;
  name: string;
  serialNumber?: string;
  categoryId: string;
  status: 'Available' | 'Assigned' | 'Damaged';
  qrCode: string;
  createdBy: string;
  createdAt: string;
  // İlişkisel alanlar (opsiyonel, view/join ile gelir)
  categoryName?: string;
  assignedToName?: string;
  assignedToEmployee?: string;
  creatorName?: string;
}

// Assignment types
// Assignment tablosu (doğrudan alanlar)
export interface Assignment {
  id: string;
  assignmentNumber: string;
  assetId: string;
  assignedToId: string;
  assignedById: string;
  assignmentDate: string;
  returnDate?: string;
  status: 'Active' | 'Returned';
  notes?: string;
  createdAt: string;
  // İlişkisel alanlar (opsiyonel, view/join ile gelir)
  assetName?: string;
  assetNumber?: string;
  assignedToName?: string;
  assignedByName?: string;
}

// Asset Category type
export interface AssetCategory {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}