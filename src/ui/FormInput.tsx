import { Box, TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { ValidationRules } from '../util/ValidationRules';

export interface FormInputProps {
  fieldName: string;
  label: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  rules?: ValidationRules;
}

export function FormInput({
  fieldName,
  label,
  disabled,
  multiline,
  rows,
  rules,
}: FormInputProps) {
  const { control } = useFormContext();

  return (
    <Box>
      <Controller
        name={fieldName}
        control={control}
        defaultValue=""
        rules={rules}
        render={({ field, formState }) => (
          <TextField
            error={!!formState.errors[fieldName]}
            helperText={formState.errors[fieldName]?.message}
            variant="outlined"
            label={label}
            disabled={disabled}
            multiline={multiline}
            rows={rows}
            fullWidth
            {...field}
          />
        )}
      />
    </Box>
  );
}
