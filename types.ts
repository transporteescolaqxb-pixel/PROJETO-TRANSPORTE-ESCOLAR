export interface FormData {
  fullName: string;
  cpf: string;
  cityDistrict: string;
  address: string;
  institution: string;
  courseRole: string;
  boardingPoint: string;
  busDriverGo: string;
  shift: string;
  photo: File | null;
  photoPreviewUrl: string | null;
  declarationFile: File | null;
  declarationPreviewUrl: string | null;
}

export type FormField = keyof FormData;