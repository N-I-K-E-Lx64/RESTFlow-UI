import { Box, Divider, Stack } from '@mui/material';
import { FormSelect } from '../../../ui/FormSelect';
import { ChangeEvent, forwardRef, useImperativeHandle, useState } from 'react';
import { VariableSelect } from '../../../ui/VariableSelect';
import { FormInput } from '../../../ui/FormInput';
import { conditionTypes, parameterTypes } from '../../../model/Labels';
import { TaskSelect } from '../../../ui/TaskSelect';
import { FormEval, SwitchTaskParams } from '../../../model/types';
import { FormProvider, useForm } from 'react-hook-form';
import { FormCheckbox } from '../../../ui/FormCheckbox';

interface ConditionState {
  param1: boolean;
  param2: boolean;
}

export const SwitchForm = forwardRef<FormEval, any>((props, ref) => {
  const methods = useForm<SwitchTaskParams>();

  const [checked, setChecked] = useState<ConditionState>({
    param1: false,
    param2: false,
  });

  const handleChecked = (
    event: ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const newState = event.target.checked;
    if (fieldName === 'condition.isVariable1') {
      setChecked({ param1: newState, param2: checked.param2 });
    } else if (fieldName === 'condition.isVariable2') {
      setChecked({ param1: checked.param1, param2: newState });
    }
  };

  useImperativeHandle(ref, () => ({
    evaluateForm: () => {
      return methods.getValues();
    },
    resetForm: (params) => {
      const parameters = params as SwitchTaskParams;
      methods.reset(parameters, { keepValues: false });

      setChecked({
        param1: parameters.condition.isVariable1,
        param2: parameters.condition.isVariable2,
      });
    },
  }));

  return (
    <FormProvider {...methods}>
      <Stack spacing={2}>
        <FormSelect
          fieldName={'condition.type'}
          label="Condition Type"
          options={conditionTypes}
        />

        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <FormCheckbox
            fieldName={'condition.isVariable1'}
            label={'Variable'}
            onChange={handleChecked}
          />

          {checked.param1 && (
            <Box sx={{ flexGrow: 1 }}>
              <VariableSelect fieldName={'condition.var1'} label={'Variable'} />
            </Box>
          )}

          {!checked.param1 && (
            <Stack spacing={1} direction={'row'}>
              <FormInput fieldName={'condition.param1.value'} label={'Value'} />
              <FormSelect
                fieldName={'condition.param1.type'}
                label={'Type'}
                options={parameterTypes}
              />
            </Stack>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <FormCheckbox
            fieldName={'condition.isVariable2'}
            label={'Variable'}
            onChange={handleChecked}
          />

          {checked.param2 && (
            <Box sx={{ flexGrow: 1 }}>
              <VariableSelect fieldName={'condition.var2'} label={'Variable'} />
            </Box>
          )}

          {!checked.param2 && (
            <Stack spacing={1} direction={'row'}>
              <FormInput fieldName={'condition.param2.value'} label={'Value'} />
              <FormSelect
                fieldName={'condition.param2.type'}
                label={'Type'}
                options={parameterTypes}
              />
            </Stack>
          )}
        </Box>

        <Divider variant="middle" />

        <Stack spacing={2}>
          <TaskSelect fieldName={'trueFlow'} label={'True Flow'} />
          <TaskSelect fieldName={'falseFlow'} label={'False Flow'} />
        </Stack>
      </Stack>
    </FormProvider>
  );
});
