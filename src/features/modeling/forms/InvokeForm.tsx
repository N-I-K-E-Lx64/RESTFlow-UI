import { Box, IconButton, Stack } from '@mui/material';
import {
  ChangeEvent,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAppSelector } from '../../../app/hooks';
import { FormEval, InvokeTaskParams } from '../../../model/types';
import { VariableSelect } from '../../../ui/VariableSelect';
import { FormSelect } from '../../../ui/FormSelect';
import { FileUploadDialog } from '../../../ui/FileUploadDialog';
import { UploadFile } from '@mui/icons-material';
import { Api, selectApis } from '../slices/apiSlice';
import { CustomSelect } from '../../../ui/CustomSelect';
import { FieldArray } from '../../../ui/FieldArray';
import { AutoComplete } from '../../../ui/AutoComplete';
import { FormProvider, useForm } from 'react-hook-form';

export const InvokeForm = forwardRef<FormEval, any>((props, ref) => {
  const methods = useForm<InvokeTaskParams>();

  const [open, setOpen] = useState<boolean>(false);
  const [inputType, setInputType] = useState<number>(0);
  const [ramlFile, setRamlFile] = useState<string>('');
  const [ramlResources, setRamlResources] = useState<string[]>([]);
  const loading = open && ramlResources.length === 0;

  const apis: Api[] = useAppSelector(selectApis);

  useImperativeHandle(ref, () => ({
    evaluateForm: () => {
      return methods.getValues();
    },
    resetForm: (params) => {
      const parameters = params as InvokeTaskParams;
      console.log(parameters);

      // set the inputType and ramlFile correctly -> needed for the resource parsing!
      setInputType(parameters?.inputType);
      setRamlFile(parameters?.raml);

      methods.reset(parameters, { keepValues: false });
    },
  }));

  // Extracts the resource list from the selected api/raml-file
  useEffect(() => {
    let active = true;

    if (!loading) return undefined;

    (async () => {
      const selectedApi = apis.find((api) => api.fileName === ramlFile);
      if (typeof selectedApi !== 'undefined' && active) {
        setRamlResources(selectedApi.resources);
      } else if (typeof selectedApi === 'undefined' && active) {
        setRamlResources([]);
      }
    })();

    return () => {
      active = false;
    };
  }, [loading, ramlFile, apis]);

  /**
   * Extract the filename attribute from each api object
   */
  const ramlFiles = useMemo(() => {
    return apis.map((api) => api.fileName);
  }, [apis]);

  const handleInputTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputType(Number(event.target.value));
  };

  const handleRamlFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRamlFile(event.target.value);
  };

  /**
   * Set the state of the autocomplete component
   * @param state new State
   */
  const handleStateChange = (state: boolean) => {
    setOpen(state);
  };

  const inputTypes = [
    { value: 0, label: 'Variable' },
    { value: 1, label: 'User Parameter' },
  ];

  const dialogRef = useRef<{ handleDialogOpen: () => void }>();

  return (
    <FormProvider {...methods}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Box sx={{ flex: 1 }}>
            <CustomSelect
              fieldName="raml"
              fieldLabel="RAML file"
              options={ramlFiles}
              onChange={handleRamlFileChange}
            />
          </Box>

          <IconButton
            aria-label="upload file"
            onClick={() => dialogRef.current?.handleDialogOpen()}
          >
            <UploadFile />
          </IconButton>
        </Box>

        <AutoComplete
          fieldName="resource"
          label="Resource"
          open={open}
          loading={loading}
          options={ramlResources}
          onStateChange={handleStateChange}
        />

        <FormSelect
          fieldName="inputType"
          label="Input type"
          options={inputTypes}
          onChange={handleInputTypeChange}
        />

        {inputType === 0 && (
          <VariableSelect fieldName="inputVariable" label="Input variable" />
        )}

        {inputType === 1 && (
          <FieldArray
            fieldArray="userParams"
            textFieldName="userParamId"
            textFieldLabel="Parameter Id"
          />
        )}

        <VariableSelect fieldName="targetVariable" label="Target variable" />
      </Stack>

      <FileUploadDialog ref={dialogRef} />
    </FormProvider>
  );
});
