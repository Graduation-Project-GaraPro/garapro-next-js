export interface OrderStatus {
  orderStatusId: string
  statusName: string
  orderIndex: number
  repairOrderCount: number
  cards: unknown[]
  availableLabels: unknown[]
}

export interface OrderStatusColumn {
  orderStatusId: string
  statusName: string
  orderIndex: number
  repairOrderCount: number
  cards: unknown[]
  availableLabels: unknown[]
}

export interface OrderStatusResponse {
  pending: OrderStatus[]
  inProgress: OrderStatus[]
  completed: OrderStatus[]
}

export interface KanbanBoardResponse {
  columns: OrderStatusColumn[]
}