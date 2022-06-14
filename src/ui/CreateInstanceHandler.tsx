import { FormDialog } from './FormDialog';
import { CustomSnackbar, SnackbarProps } from './CustomSnackbar';
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Box } from '@mui/material';
import axios from 'axios';

const INITIAL_SNACKBAR: SnackbarProps = {
  text: '',
  severity: 'info',
};

/**
 * Wrapper component for the create-instance workflow, in which the FormDialog and a Snackbar component is used
 */
export const CreateInstanceHandler = forwardRef((props, ref) => {
  const [snackbar, setSnackbar] = useState<SnackbarProps>(INITIAL_SNACKBAR);
  const [modelId, setModelId] = useState<string>('');

  const dialogRef = useRef<{ handleDialogOpen: () => void }>();
  const snackbarRef = useRef<{ handleOpen: () => void }>();

  useImperativeHandle(ref, () => ({
    handleShowDialog(modelId: string) {
      setModelId(modelId);
      dialogRef.current?.handleDialogOpen();
    },
  }));

  /**
   * Sends a request (with the instance id as a query parameter) to the server to execute the specified instance.
   * @param instanceId Result of the dialog form that represents the instance id
   */
  const handleExecuteWorkflow = (instanceId: string) => {
    axios
      .get(`http://localhost:8080/execute/${modelId}/${instanceId}`)
      .then((response) => {
        setSnackbar({ text: response.data, severity: 'success' });
        snackbarRef.current?.handleOpen();
      })
      .catch((error) => {
        setSnackbar({ text: error.response.data, severity: 'error' });
        snackbarRef.current?.handleOpen();
      });
  };

  return (
    <Box>
      <FormDialog
        ref={dialogRef}
        dialogTitle="Workflow Execution"
        dialogText="Enter a name for the workflow-instance to be created"
        buttonText="Execute"
        dialogCallback={handleExecuteWorkflow}
      />

      <CustomSnackbar
        ref={snackbarRef}
        text={snackbar.text}
        severity={snackbar.severity}
      />
    </Box>
  );
});
