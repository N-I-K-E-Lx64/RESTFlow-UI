import { Box, Button, Divider, Stack } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { selectModel, updateTask } from './slices/modelSlice';
import {
  FormEval,
  GeneralTaskParams,
  Task,
  TaskParams,
  TaskType,
} from '../../model/types';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSelection } from './slices/selectionSlice';
import ModelForm from './forms/ModelForm';
import { FormInput } from '../../ui/FormInput';
import { FormSelect } from '../../ui/FormSelect';
import { taskTypes } from '../../model/Labels';
import { AssignForm } from './forms/AssignForm';
import { SwitchForm } from './forms/SwitchForm';
import { InvokeForm } from './forms/InvokeForm';

export default function DetailModeling() {
  const dispatch = useAppDispatch();
  const methods = useForm<GeneralTaskParams>();
  const [taskModel, setTaskModel] = useState<Task | null>(null);
  const [taskType, setTaskType] = useState<number>(0);

  const invokeRef = useRef<FormEval>(null);
  const assignRef = useRef<FormEval>(null);
  const switchRef = useRef<FormEval>(null);

  const model = useAppSelector(selectModel);
  const selectionId = useAppSelector(selectSelection);

  // Update the task model, when the user changes the selection
  useEffect(() => {
    const task = model.tasks.find((modelTask) => modelTask.id === selectionId);
    console.log(task);
    if (typeof task !== 'undefined') {
      setTaskModel(task);
      setTaskType(task.type);
    } else {
      setTaskModel(null);
    }
  }, [selectionId, model.tasks]);

  // Resets all form fields when the task model changed
  useEffect(() => {
    if (taskModel !== null) {
      methods.reset({});
      methods.reset(taskModel, { keepValues: false });

      // Reset the sub forms
      if (typeof taskModel.params !== 'undefined') {
        invokeRef.current?.resetForm(taskModel.params);
        assignRef.current?.resetForm(taskModel.params);
        switchRef.current?.resetForm(taskModel.params);
      }
    }
  }, [taskModel, methods]);

  /**
   * Submits the form and check if all rules are successfully applied, get the form field values from the various sub-forms and update the task
   * model accordingly.
   */
  const handleModelUpdate = () => {
    methods.trigger().then((validationStatus) => {
      if (validationStatus && taskModel !== null) {
        const general = methods.getValues();
        const params = evaluateForm(general.type);

        if (typeof params !== 'undefined') {
          const task: Task = {
            id: general.id,
            title: general.title,
            description: general.description,
            type: general.type,
            params,
          };
          console.log(task);
          dispatch(updateTask(task));
        }
      }
    });
  };

  const evaluateForm = (taskType: TaskType): TaskParams | undefined => {
    switch (taskType) {
      case TaskType.INVOKE_TASK:
        return invokeRef.current?.evaluateForm();
      case TaskType.ASSIGN_TASK:
        return assignRef.current?.evaluateForm();
      case TaskType.SWITCH_TASK:
        return switchRef.current?.evaluateForm();
    }
  };

  const handleTaskTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTaskType(Number(event.target.value));
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
        <Stack spacing={2}>
          <FormInput fieldName="id" label="Task Id" disabled />

          <FormInput fieldName="title" label="Task Name" />

          <FormInput
            fieldName="description"
            label="Task Description"
            multiline
            rows={2}
          />

          <FormSelect
            fieldName="type"
            label="Task Type"
            options={taskTypes}
            onChange={handleTaskTypeChange}
          />

          <Divider variant="middle" />
        </Stack>
      </FormProvider>

      <Box sx={{ marginTop: '8px' }}>
        {taskType === TaskType.INVOKE_TASK && <InvokeForm ref={invokeRef} />}
        {taskType === TaskType.ASSIGN_TASK && <AssignForm ref={assignRef} />}
        {taskType === TaskType.SWITCH_TASK && <SwitchForm ref={switchRef} />}
      </Box>

      <Button variant="text" onClick={handleModelUpdate}>
        Update Model
      </Button>
    </Box>
  );
}
