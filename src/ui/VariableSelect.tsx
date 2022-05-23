import { Controller, useFormContext } from 'react-hook-form';
import { Box, MenuItem, TextField } from '@mui/material';
import { Variable } from '../model/types';

export interface VariableSelectProps {
  fieldName: string;
  label: string;
  variables: Variable[];
}

export function VariableSelect({
  fieldName,
  label,
  variables,
}: VariableSelectProps) {
  const { control } = useFormContext();

  return (
    <Box>
      <Controller
        name={fieldName}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField select fullWidth label={label} {...field}>
            {variables.map((variable, index) => (
              <MenuItem key={index} value={variable.name}>
                {variable.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    </Box>
  );
}
