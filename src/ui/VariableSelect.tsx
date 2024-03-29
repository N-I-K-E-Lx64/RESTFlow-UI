import { Controller, useFormContext } from 'react-hook-form';
import { Box, MenuItem, TextField } from '@mui/material';
import { useAppSelector } from '../app/hooks';
import { selectVariables } from '../features/modeling/slices/modelSlice';
import { Variable } from '../model/types';

export interface VariableSelectProps {
  fieldName: string;
  label: string;
}

export const VariableSelect = ({ fieldName, label }: VariableSelectProps) => {
  const { control } = useFormContext();

  const variables: Variable[] = useAppSelector(selectVariables);

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
};
