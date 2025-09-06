export interface Label {
  id: number
  name: string
  category: string
  color: string
  description: string
  isDefault: boolean
}

export interface NewLabel {
  name: string
  category: string
  color: string
  description: string
}
