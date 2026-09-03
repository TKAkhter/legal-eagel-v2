export type DriveItemType = 'folder' | 'file'

export interface DriveItem {
  id: string
  parentId: string | null
  name: string
  type: DriveItemType
  sizeKb: number | null
  modifiedAt: string
}
