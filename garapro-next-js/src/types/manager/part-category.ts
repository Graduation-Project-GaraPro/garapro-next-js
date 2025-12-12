export interface PartCategory {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt?: string
}

export interface Part {
  id: string
  name: string
  partCategoryId: string
  categoryName?: string
  branchId: string
  branchName?: string
  price: number
  stock: number
  description?: string
  createdAt?: string
  updatedAt?: string
}



export interface CreatePartCategoryRequest {
  name: string
  description?: string
}

export interface UpdatePartCategoryRequest {
  name: string
  description?: string
}

export interface CreatePartRequest {
  name: string
  partCategoryId: string
  branchId: string
  price: number
  stock: number
}

export interface UpdatePartRequest {
  name: string
  partCategoryId: string
  price: number
  stock: number
}

// API Response for editing (different from create)
export interface PartEditResponse {
  partId: string
  partCategoryId: string
  partCategoryName: string
  name: string
  price: number
  stock: number
  createdAt: string
  updatedAt?: string
}



// API Response types (what the backend actually returns)
export interface PartCategoryApiResponse {
  laborCategoryId: string
  categoryName: string
  description?: string
  createdAt: string
  updatedAt?: string
}

// API Request types (what the backend expects)
export interface PartCategoryApiRequest {
  categoryName: string
  description?: string
}

// Pagination types
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface SearchParams extends PaginationParams {
  searchTerm?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}