import { Stack } from '@mui/material';
import { FormInput } from '../../../ui/FormInput';
import { VariableSelect } from '../../../ui/VariableSelect';
import { AssignTaskParams, FormEval } from '../../../model/types';
import { FormProvider, useForm } from 'react-hook-form';
import { forwardRef, useImperativeHandle } from 'react';

export const AssignForm = forwardRef<FormEval, any>((props, ref) => {
  const methods = useForm<AssignTaskParams>();

  useImperativeHandle(ref, () => ({
    evaluateForm: () => {
      return methods.getValues();
    },
    resetForm: (params) => {
      const parameters = params as AssignTaskParams;
      methods.reset(parameters, { keepValues: false });
    },
  }));

  return (
    <FormProvider {...methods}>
      <Stack spacing={2}>
        <FormInput fieldName="paramId" label="Parameter Id" />
        <FormInput fieldName="value" label="Parameter Value" />
        <VariableSelect fieldName="variable" label="Target Variable" />
      </Stack>
    </FormProvider>
  );
});
