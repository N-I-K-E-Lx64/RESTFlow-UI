import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import { Box, IconButton, MenuItem, TextField } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

export interface FieldArrayProps {
  fieldArray: string;
  textFieldName: string;
  textFieldLabel: string;
}

export const FieldArray = ({
  fieldArray,
  textFieldName,
  textFieldLabel,
}: FieldArrayProps) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${fieldArray}`,
  });

  const variableTypes = [
    { value: 0, label: 'String' },
    { value: 1, label: 'Double' },
    { value: 2, label: 'Integer' },
    { value: 3, label: 'Json' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {fields.map((field, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            '& .MuiTextField-root': { width: '25ch', m: 1 },
          }}
        >
          <Controller
            name={`${fieldArray}.${index}.${textFieldName}`}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField variant="outlined" label={textFieldLabel} {...field} />
            )}
          />

          <Controller
            name={`${fieldArray}.${index}.type`}
            control={control}
            render={({ field }) => (
              <TextField select label="Type" {...field}>
                {variableTypes.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <IconButton aria-label="delete entry" onClick={() => remove(index)}>
            <Delete />
          </IconButton>
        </Box>
      ))}

      <IconButton
        color="primary"
        aria-label="add entry"
        onClick={() => append({ [textFieldName]: '', type: 0 })}
      >
        <Add />
      </IconButton>
    </Box>
  );
};
