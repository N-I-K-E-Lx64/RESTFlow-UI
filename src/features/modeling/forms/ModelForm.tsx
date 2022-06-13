import { Box, Button, Divider, Stack } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { useEffect } from 'react';
import { selectModel, updateGeneralModelData } from '../slices/modelSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { GeneralModelData } from '../../../model/types';
import { FormInput } from '../../../ui/FormInput';
import { FieldArray } from '../../../ui/FieldArray';
import { validationRules } from '../../../util/ValidationRules';

export default function ModelForm() {
  const dispatch = useAppDispatch();
  const methods = useForm<GeneralModelData>({
    defaultValues: {
      id: '',
      name: '',
      description: '',
      variables: [{ name: 'result', type: 0 }],
    },
  });
  const model = useAppSelector(selectModel);

  // Resets all form fields when the model has changed
  useEffect(() => {
    const modelData: GeneralModelData = {
      id: model.id,
      name: model.name,
      description: model.description,
      variables: model.variables,
    };
    methods.reset(modelData);
  }, [model, methods]);

  /**
   * Submits the form and check if all rules are successfully applied, get the form field values and update the model
   * accordingly.
   */
  const handleModelUpdate = () => {
    methods.trigger().then((validationStatus) => {
      if (validationStatus)
        dispatch(updateGeneralModelData(methods.getValues()));
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <FormProvider {...methods}>
        <Stack spacing={2}>
          <FormInput fieldName="id" label="Model Id" disabled />
          <FormInput
            fieldName="name"
            label="Model Name"
            rules={validationRules[0]}
          />
          <FormInput
            fieldName="description"
            label="Description"
            multiline
            rows={2}
          />

          <Divider variant="middle" />

          <FieldArray
            fieldArray="variables"
            textFieldName="name"
            textFieldLabel="Variable-Id"
          />

          <Divider variant="middle" />
        </Stack>

        <Button variant="text" onClick={handleModelUpdate}>
          Update Model
        </Button>
      </FormProvider>
    </Box>
  );
}
