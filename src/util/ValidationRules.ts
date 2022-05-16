export interface ValidationRules {
  required?: { value: boolean; message: string };
}

export const validationRules: ValidationRules[] = [
  { required: { value: true, message: 'This field is required!' } },
];
