export interface ChildRecord {
  count: number
  long_description?: string
  longDescription?: string
}

export interface RawRecord {
  type: string
  group: string
  tag: string
  count: number
  longDescription?: string
  long_description?: string
  children?: ChildRecord[]
}

export interface FlattenedRecord {
  group: string
  tag: string
  type: string
  count: number
  longDescription: string
}

export interface VerbatimRecord {
  group: string
  tag: string
  type: string
  parentDescription: string
  verbatim: string
  weight: number
}

export interface TreemapNode {
  name: string
  value: number
  children?: TreemapNode[]
}
