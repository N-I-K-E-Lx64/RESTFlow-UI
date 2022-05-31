import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { forwardRef, useImperativeHandle, useState } from 'react';

import './dropzone.css';
import { Description } from '@mui/icons-material';
import { useUploadFileMutation } from '../app/service/fileApi';
import { useAppSelector } from '../app/hooks';
import { selectModelId } from '../features/modeling/slices/modelSlice';

export const FileUploadDialog = forwardRef((a, ref) => {
  const [open, setOpen] = useState<boolean>(false);

  const modelId = useAppSelector(selectModelId);

  const [uploadFile] = useUploadFileMutation();

  useImperativeHandle(ref, () => ({
    handleDialogOpen() {
      setOpen(true);
    },
  }));

  const handleDialogClose = () => {
    setOpen(false);
  };

  const handleUploadFiles = () => {
    console.log(acceptedFiles);
    console.log(fileRejections);

    const formData = new FormData();
    acceptedFiles.forEach((file) => formData.append('files', file));

    uploadFile({ modelId, files: formData });

    // Close dialog
    setOpen(false);
  };

  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    accept: {
      'application/raml+yaml': ['.raml'],
    },
  });

  return (
    <Box>
      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle>Test</DialogTitle>
        <DialogContent>
          <DialogContentText>Upload RAML File</DialogContentText>
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <Typography variant="body1" gutterBottom>
                Drop the file here ...
              </Typography>
            ) : (
              <Typography variant="body1" gutterBottom>
                Drag 'n' drop some files here, or click to select files
              </Typography>
            )}
          </div>

          <Typography variant="h6" gutterBottom>
            Accepted Files
          </Typography>
          <List>
            {acceptedFiles.map((file) => (
              <ListItem key={file.name}>
                <ListItemAvatar>
                  <Avatar>
                    <Description />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={file.name}
                  secondary={new Date(file.lastModified).toDateString()}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleUploadFiles}>Upload</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});
