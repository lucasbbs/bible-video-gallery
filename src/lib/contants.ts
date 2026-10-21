export const DEFAULT_TYPE = 'sermons'
export const TYPE_VALUES = ['all', 'sermons', 'bible_studies'] as const
export type TypeValue = (typeof TYPE_VALUES)[number]