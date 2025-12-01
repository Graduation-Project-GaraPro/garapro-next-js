import { apiClient } from "./api-client"
import type { Label, CreateLabelRequest, UpdateLabelRequest } from "@/types/manager/label"

class LabelService {
  private readonly baseUrl = "/label"

  // Get all labels
  async getAllLabels(): Promise<Label[]> {
    const response = await apiClient.get<Label[]>(this.baseUrl)
    return response.data || []
  }

  // Get labels by order status
  async getLabelsByStatus(orderStatusId: number): Promise<Label[]> {
    const response = await apiClient.get<Label[]>(`${this.baseUrl}/by-orderstatus/${orderStatusId}`)
    return response.data || []
  }

  // Create a new label
  async createLabel(request: CreateLabelRequest): Promise<Label> {
    const response = await apiClient.post<Label>(this.baseUrl, request)
    if (!response.data) {
      throw new Error("Failed to create label")
    }
    return response.data
  }

  // Update an existing label
  async updateLabel(labelId: number, request: UpdateLabelRequest): Promise<Label> {
    const response = await apiClient.put<Label>(`${this.baseUrl}/${labelId}`, request)
    if (!response.data) {
      throw new Error("Failed to update label")
    }
    return response.data
  }

  // Delete a label
  async deleteLabel(labelId: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${labelId}`)
  }
}

export const labelService = new LabelService()
