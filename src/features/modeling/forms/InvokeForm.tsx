import { Box, IconButton, Stack } from '@mui/material';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { selectVariables } from '../slices/modelSlice';
import { Variable } from '../../../model/types';
import { FormInput } from '../../../ui/FormInput';
import { VariableSelect } from '../../../ui/VariableSelect';
import { FormSelect } from '../../../ui/FormSelect';
import { FileUploadDialog } from '../../../ui/FileUploadDialog';
import { UploadFile } from '@mui/icons-material';
import { Api, selectApis } from '../slices/apiSlice';
import { CustomSelect } from '../../../ui/CustomSelect';

export const InvokeForm = () => {
  const [inputType, setInputType] = useState<number>(0);
  const [ramlFile, setRamlFile] = useState<string>('');
  const [ramlFiles, setRamlFiles] = useState<string[]>([]);
  const [ramlResources, setRamlResources] = useState<string[]>([]);

  const variables: Variable[] = useAppSelector(selectVariables);
  const apis: Api[] = useAppSelector(selectApis);

  const handleInputTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputType(Number(event.target.value));
  };

  const handleRamlFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRamlFile(event.target.value);
  };

  // Extract the filename attribute from each api object
  useEffect(() => {
    setRamlFiles(apis.map((api) => api.fileName));
  }, [apis, setRamlFiles]);

  // Looks for the corresponding api-object and extracts the resources attribute from it
  useEffect(() => {
    const selectedApi = apis.find((api) => api.fileName === ramlFile);
    if (typeof selectedApi !== 'undefined') {
      setRamlResources(selectedApi.resources);
    }
  }, [apis, ramlFile, setRamlResources]);

  const inputTypes = [
    { value: 0, label: 'Variable' },
    { value: 1, label: 'User Parameter' },
  ];

  const userParamDataTypes = [
    { value: 0, label: 'String' },
    { value: 1, label: 'Double' },
    { value: 2, label: 'Integer' },
  ];

  const dialogRef = useRef<{ handleDialogOpen: () => void }>();

  return (
    <Box>
      <Stack spacing={2}>
        <FormSelect
          fieldName={'invokeParams.inputType'}
          label={'Input type'}
          options={inputTypes}
          onChange={handleInputTypeChange}
        />

        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Box sx={{ flex: 1 }}>
            <CustomSelect
              fieldName={'invokeParams.raml'}
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

        <CustomSelect
          fieldName={'invokeParams.resource'}
          fieldLabel={'Resource'}
          options={ramlResources}
          disabled={ramlFile === ''}
        />

        {inputType === 0 && (
          <VariableSelect
            fieldName={'invokeParams.inputVariable'}
            label={'Input variable'}
            variables={variables}
          />
        )}

        {inputType === 1 && (
          <Stack spacing={2}>
            <FormInput
              fieldName={'invokeParams.userParamId'}
              label={'Parameter Id'}
            />
            <FormSelect
              fieldName={'invokeParams.userParamType'}
              label={'Parameter Type'}
              options={userParamDataTypes}
            />
          </Stack>
        )}

        <VariableSelect
          fieldName={'invokeParams.targetVariable'}
          label={'Target variable'}
          variables={variables}
        />
      </Stack>

      <FileUploadDialog ref={dialogRef} />
    </Box>
  );
};
