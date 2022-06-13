import { Box, Button } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { selectModel, updateTask } from './slices/modelSlice';
import { Task } from '../../model/types';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSelection } from './slices/selectionSlice';
import FormContainer from './forms/FormContainer';
import ModelForm from './forms/ModelForm';

export default function DetailModeling() {
  const dispatch = useAppDispatch();
  const methods = useForm<Task>();
  const [taskModel, setTaskModel] = useState<Task | null>(null);

  const model = useAppSelector(selectModel);
  const selectionId = useAppSelector(selectSelection);

  // Update the task model, when the user changes the selection
  useEffect(() => {
    const task = model.tasks.find((modelTask) => modelTask.id === selectionId);
    typeof task !== 'undefined' ? setTaskModel(task) : setTaskModel(null);
  }, [selectionId, model.tasks]);

  // Resets all form fields when the task model changed
  useEffect(() => {
    if (taskModel !== null) {
      methods.reset({});
      methods.reset(taskModel, { keepValues: false });
    }
  }, [taskModel, methods]);

  /**
   * Submits the form and check if all rules are successfully applied, get the form field values and update the task
   * model accordingly.
   */
  const handleModelUpdate = () => {
    methods.trigger().then((validationStatus) => {
      if (validationStatus && taskModel !== null) {
        const task: Task = methods.getValues();
        console.log(task);
        dispatch(updateTask(task));
      }
    });
  };

  // Show the model form if no task or element is selected.
  if (taskModel === null) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <ModelForm />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <FormProvider {...methods}>
        <FormContainer task={taskModel} />
      </FormProvider>

      <Button variant="text" onClick={handleModelUpdate}>
        Update Model
      </Button>
    </Box>
  );
}
