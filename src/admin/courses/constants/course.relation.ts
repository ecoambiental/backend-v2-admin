export const COURSE_RELATIONS = [
  'certificates',
  'certificates.tipoCertificado',
] as const;

// Deriva el tipo a partir del array
export type CourseRelation = (typeof COURSE_RELATIONS)[number];
