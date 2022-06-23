import { Controller, useFormContext } from 'react-hook-form';
import { Box, MenuItem, TextField } from '@mui/material';
import { ChangeEvent } from 'react';

export interface CustomSelectProps {
  fieldName: string;
  fieldLabel: string;
  options: string[];
  disabled?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const CustomSelect = ({
  fieldName,
  fieldLabel,
  options,
  disabled,
  onChange,
}: CustomSelectProps) => {
  const { control } = useFormContext();

  return (
    <Box>
      <Controller
        name={fieldName}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            select
            fullWidth
            label={fieldLabel}
            disabled={disabled}
            {...field}
            onChange={(value: ChangeEvent<HTMLInputElement>) => {
              field.onChange(value);
              if (typeof onChange !== 'undefined') onChange(value);
            }}
          >
            {options.map((item, index) => (
              <MenuItem key={index} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    </Box>
  );
};
