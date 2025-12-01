// Label types for repair order management

export interface Label {
  labelId: number
  labelName: string
  description: string | null
  colorName: string
  hexCode: string
  orderStatusId: number
  isDefault: boolean
  createdAt: string
  updatedAt: string | null
}

export interface CreateLabelRequest {
  labelName: string
  description?: string
  colorName: string
  hexCode: string
  orderStatusId: number
  isDefault: boolean
}

export interface UpdateLabelRequest extends Partial<CreateLabelRequest> {
  labelId: number
}

export interface AssignedLabel {
  labelId: string
  labelName: string
  colorName: string
  hexCode: string
  orderStatusId: number
}
