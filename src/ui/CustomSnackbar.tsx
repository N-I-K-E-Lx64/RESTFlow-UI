import { Snackbar } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import {
  forwardRef,
  SyntheticEvent,
  useImperativeHandle,
  useState,
} from 'react';

export interface SnackbarProps {
  text: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const CustomSnackbar = forwardRef(
  ({ text, severity }: SnackbarProps, ref) => {
    const [open, setOpen] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
      handleOpen() {
        setOpen(true);
      },
    }));

    const handleClose = (event?: SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') return;

      setOpen(false);
    };

    return (
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={severity}>
          {text}
        </Alert>
      </Snackbar>
    );
  }
);
