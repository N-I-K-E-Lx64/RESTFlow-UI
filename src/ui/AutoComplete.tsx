import { Controller, useFormContext } from 'react-hook-form';
import { Autocomplete, Box, CircularProgress, TextField } from '@mui/material';
import { Fragment } from 'react';

export interface AutoCompleteProps {
  fieldName: string;
  label: string;
  open: boolean;
  loading: boolean;
  options: string[];
  onStateChange: (state: boolean) => void;
}

export const AutoComplete = ({
  fieldName,
  label,
  open,
  loading,
  options,
  onStateChange,
}: AutoCompleteProps) => {
  const { control } = useFormContext();

  return (
    <Box>
      <Controller
        name={fieldName}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Autocomplete
            id="resourceSelector"
            value={field.value}
            open={open}
            onOpen={() => onStateChange(true)}
            onClose={() => onStateChange(false)}
            isOptionEqualToValue={(option, value) => option === value}
            options={options}
            loading={loading}
            onChange={(event, value) => field.onChange(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </Fragment>
                  ),
                }}
              />
            )}
          />
        )}
      />
    </Box>
  );
};
