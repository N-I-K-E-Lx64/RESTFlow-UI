import { Checkbox, FormControlLabel } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { ChangeEvent } from 'react';

export interface FormCheckboxProps {
  fieldName: string;
  label: string;
  onChange: (event: ChangeEvent<HTMLInputElement>, fieldName: string) => void;
}

export const FormCheckbox = ({
  fieldName,
  label,
  onChange,
}: FormCheckboxProps) => {
  const { control } = useFormContext();

  return (
    <FormControlLabel
      control={
        <Controller
          name={fieldName}
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <Checkbox
              {...field}
              checked={field.value}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                field.onChange(event);
                if (typeof onChange !== 'undefined') onChange(event, fieldName);
              }}
            />
          )}
        />
      }
      label={label}
    />
  );
};
