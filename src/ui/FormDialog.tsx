import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';

interface DialogInput {
  input: string;
}

export interface FormDialogProps {
  dialogTitle: string;
  dialogText: string;
  buttonText: string;
  dialogCallback: (input: string) => void;
}

export const FormDialog = forwardRef(
  (
    { dialogTitle, dialogText, buttonText, dialogCallback }: FormDialogProps,
    ref
  ) => {
    const { handleSubmit, control } = useForm<DialogInput>();
    const [open, setOpen] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
      handleDialogOpen() {
        setOpen(true);
      },
    }));

    const handleDialogClose = () => {
      setOpen(false);
    };

    const dialogSubmit: SubmitHandler<DialogInput> = (data) => {
      dialogCallback(data.input);

      setOpen(false);
    };

    return (
      <Box>
        <Dialog open={open} onClose={handleDialogClose}>
          <form onSubmit={handleSubmit(dialogSubmit)}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
              <DialogContentText>{dialogText}</DialogContentText>

              <Controller
                name="input"
                control={control}
                defaultValue=""
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    margin="dense"
                    label="Instance Name"
                    variant="standard"
                    {...field}
                  />
                )}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button type="submit">{buttonText}</Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    );
  }
);
