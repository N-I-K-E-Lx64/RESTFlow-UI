import { Box, IconButton, Stack } from '@mui/material';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { selectVariables } from '../slices/modelSlice';
import { InvokeTaskParams, Variable } from '../../../model/types';
import { VariableSelect } from '../../../ui/VariableSelect';
import { FormSelect } from '../../../ui/FormSelect';
import { FileUploadDialog } from '../../../ui/FileUploadDialog';
import { UploadFile } from '@mui/icons-material';
import { Api, selectApis } from '../slices/apiSlice';
import { CustomSelect } from '../../../ui/CustomSelect';
import { FieldArray } from '../../../ui/FieldArray';
import { NestedFormProps } from './FormContainer';
import { AutoComplete } from '../../../ui/AutoComplete';

export const InvokeForm = ({ task }: NestedFormProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [inputType, setInputType] = useState<number>(0);
  const [ramlFile, setRamlFile] = useState<string>('');
  const [ramlResources, setRamlResources] = useState<string[]>([]);
  const loading = open && ramlResources.length === 0;

  const variables: Variable[] = useAppSelector(selectVariables);
  const apis: Api[] = useAppSelector(selectApis);

  // Extracts the params-object from the task and set the inputType and ramlFile accordingly.
  useEffect(() => {
    const params: InvokeTaskParams = task.params as InvokeTaskParams;

    setInputType(params?.inputType);
    setRamlFile(params?.raml);
  }, [task]);

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
    <Box>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Box sx={{ flex: 1 }}>
            <CustomSelect
              fieldName={'params.raml'}
              fieldLabel={'RAML file'}
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
          fieldName="params.resource"
          label="Resource"
          open={open}
          loading={loading}
          options={ramlResources}
          onStateChange={handleStateChange}
        />

        <FormSelect
          fieldName={'params.inputType'}
          label={'Input type'}
          options={inputTypes}
          onChange={handleInputTypeChange}
        />

        {inputType === 0 && (
          <VariableSelect
            fieldName={'params.inputVariable'}
            label={'Input variable'}
            variables={variables}
          />
        )}

        {inputType === 1 && (
          <FieldArray
            fieldArray="params.userParams"
            textFieldName="userParamId"
            textFieldLabel="Parameter-Id"
          />
        )}

        <VariableSelect
          fieldName={'params.targetVariable'}
          label={'Target variable'}
          variables={variables}
        />
      </Stack>

      <FileUploadDialog ref={dialogRef} />
    </Box>
  );
};
