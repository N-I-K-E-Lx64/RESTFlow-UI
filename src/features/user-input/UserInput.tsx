import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import {
  useGetUserParamsQuery,
  UserParameterMessage,
  useUpdateUserParamMutation,
} from '../../app/service/userVariableApi';
import { useParams } from 'react-router-dom';
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import React, { useEffect } from 'react';
import { VariableView } from '../monitoring/VariableView';

export function UserInput() {
  const { instanceId } = useParams<{ instanceId: string }>();

  const { data: userParams, isLoading: isLoadingUserParams } =
    useGetUserParamsQuery(instanceId!);

  const [updateUserParam] = useUpdateUserParamMutation();

  const { control, handleSubmit } = useForm();
  const { fields, replace } = useFieldArray({ control, name: 'params' });

  useEffect(() => {
    const userParamValues = userParams?.map((param) => param.value);
    if (typeof userParamValues !== 'undefined') replace(userParamValues);
  }, [replace, userParams]);

  const onSubmit: SubmitHandler<any> = (data) => {
    userParams?.forEach((param: UserParameterMessage, index: number) => {
      param = {
        instanceId: param.instanceId,
        parameter: param.parameter,
        value: data.params[index].value,
      };
      updateUserParam({ ...param });
    });
  };

  const getName = (name: string): string => {
    let index: number = parseInt(name.match(/\d+/g)![0], 10);

    if (typeof userParams !== 'undefined') {
      const parameter: UserParameterMessage = userParams[index];
      if (parameter) return parameter.parameter;
    }

    return `params.${index}`;
  };

  if (isLoadingUserParams) {
    return (
      <Typography variant="h2" align="center">
        Loading ...
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        marginTop: '8px',
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ flexGrow: 1 }}
      >
        <Stack
          spacing={2}
          direction="column"
          alignItems="flex-start"
          justifyContent="flex-start"
        >
          {fields?.map((item, index) => (
            <Controller
              key={item.id}
              name={`params[${index}].value`}
              control={control}
              defaultValue={''}
              render={({ field: { name, value, onChange } }) => (
                <TextField
                  variant="outlined"
                  label={getName(name)}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          ))}

          {fields.length > 0 && (
            <Button variant="contained" type="submit" color="primary">
              Send
            </Button>
          )}

          {fields.length === 0 && (
            <Typography variant="h4" gutterBottom>
              Nothing to do!
            </Typography>
          )}
        </Stack>
      </Box>
      <Box sx={{ flexGrow: 1, padding: '8px' }}>
        <VariableView />
      </Box>
    </Box>
  );
}
