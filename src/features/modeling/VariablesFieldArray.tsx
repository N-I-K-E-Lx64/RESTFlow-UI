import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import { Box, IconButton, MenuItem, TextField } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

export function VariablesFieldArray() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variables',
  });

  // TODO : All Variable Types!
  const variableTypes = [
    { value: 0, label: 'String' },
    { value: 1, label: 'Json' },
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
            name={`variables.${index}.name`}
            control={control}
            render={({ field }) => (
              <TextField variant="outlined" label="Variable Name" {...field} />
            )}
          />

          <Controller
            name={`variables.${index}.type`}
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

          <IconButton
            aria-label="delete variable"
            onClick={() => remove(index)}
          >
            <Delete />
          </IconButton>
        </Box>
      ))}

      <IconButton
        color="primary"
        aria-label="add variable"
        onClick={() => append({ name: '', type: 0 })}
      >
        <Add />
      </IconButton>
    </Box>
  );
}
