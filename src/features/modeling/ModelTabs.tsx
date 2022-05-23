import { Box, Tab, Tabs, Typography } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { Add } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectModel, setActiveModel } from './modelSlice';
import {
  useAddModelMutation,
  useGetModelsQuery,
} from '../../app/service/modelApi';
import { Model } from '../../model/types';
import { FormDialog } from '../../ui/FormDialog';

export default function ModelTabs() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentModel, setCurrentModel] = useState<number | boolean>(false);
  const selectedModel = useAppSelector(selectModel);

  const { data: models, error, isLoading } = useGetModelsQuery();
  const [addModel] = useAddModelMutation();

  const dialogRef = useRef<{ handleDialogOpen: () => void }>();

  /**
   * Handles the tab change. When the user selects a different tab the respective model is derived
   * and the "activeModel"-state is updated accordingly.
   * @param event React event
   * @param selectedIndex The index of the tab the user selected
   */
  const handleChange = (event: SyntheticEvent, selectedIndex: number) => {
    const selectedModel = models?.at(selectedIndex);
    if (typeof selectedModel !== 'undefined') {
      dispatch(setActiveModel(selectedModel));

      setCurrentModel(selectedIndex);
      navigate(selectedModel.id);
    }
  };

  /**
   * Creates a dummy model with the provided name and navigate to it
   * @param modelName Name for the new model
   */
  const createModel = (modelName: string) => {
    const modelId = uuidv4();
    const dummyModel: Model = {
      id: modelId,
      name: modelName,
      description: '',
      variables: [{ name: 'Result', type: 1 }],
      elements: [],
      connectors: [],
      tasks: [],
    };

    dispatch(setActiveModel(dummyModel));
    // Navigate to the created model
    addModel(dummyModel).then(() => navigate(`${modelId}`));
  };

  // When a new model is created set the tab-value accordingly
  useEffect(() => {
    const index = models?.findIndex(
      (model: Model) => model.name === selectedModel.name
    );
    if (index !== -1 && typeof index !== 'undefined') {
      setCurrentModel(index);
    }
  }, [models, selectedModel]);

  if (isLoading) {
    return (
      <Typography variant="h2" gutterBottom>
        Loading...
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography variant="h2" gutterBottom>
        Error
      </Typography>
    );
  }

  return (
    <Box sx={{ paddingBottom: 8 }}>
      <Tabs value={currentModel} onChange={handleChange} selectionFollowsFocus>
        {models?.map((prop: Model, index: number) => (
          <Tab label={prop.name} value={index} key={index} />
        ))}
        <Tab
          icon={<Add />}
          aria-label="Create Workflow Model"
          onClick={() => dialogRef.current?.handleDialogOpen()}
        />
      </Tabs>

      <Outlet />

      <FormDialog
        ref={dialogRef}
        dialogTitle="Model Creation"
        dialogText="Enter a name for the model"
        buttonText="Create"
        dialogCallback={createModel}
      />
    </Box>
  );
}
