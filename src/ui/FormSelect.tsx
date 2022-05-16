import { Controller, useFormContext } from 'react-hook-form';
import { Box, MenuItem, TextField } from '@mui/material';
import { ChangeEvent } from 'react';

export interface FormSelectProps {
  fieldName: string;
  label: string;
  options: { value: number; label: string }[];
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function FormSelect({
  label,
  fieldName,
  options,
  onChange,
}: FormSelectProps) {
  const { control } = useFormContext();

  return (
    <Box>
      <Controller
        name={fieldName}
        control={control}
        defaultValue={0}
        render={({ field }) => (
          <TextField
            select
            fullWidth
            label={label}
            {...field}
            onChange={(value: ChangeEvent<HTMLInputElement>) => {
              field.onChange(value);
              if (typeof onChange !== 'undefined') onChange(value);
            }}
          >
            {options.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    </Box>
  );
}
