import { Box, MenuItem, TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { Task } from '../model/types';
import { useAppSelector } from '../app/hooks';
import { selectTasks } from '../features/modeling/slices/modelSlice';

export interface TaskSelectProps {
  fieldName: string;
  label: string;
}

export const TaskSelect = ({ fieldName, label }: TaskSelectProps) => {
  const { control } = useFormContext();

  const tasks: Task[] = useAppSelector(selectTasks);

  return (
    <Box>
      <Controller
        name={fieldName}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField select fullWidth label={label} {...field}>
            {tasks.map((task, index) => (
              <MenuItem key={index} value={task.id}>
                {task.title}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    </Box>
  );
};
