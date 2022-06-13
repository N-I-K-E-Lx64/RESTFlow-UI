import { Box, Tab, Tabs, Typography } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { Add } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import {
  useAddModelMutation,
  useGetModelsQuery,
} from '../../app/service/modelApi';
import { Model } from '../../model/types';
import { FormDialog } from '../../ui/FormDialog';

export default function ModelTabs() {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState<number | boolean>(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

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
      // Set the tab index
      setTabIndex(selectedIndex);
      // Set the model
      setSelectedModel(selectedModel);
      navigate(selectedModel.id);
    }
  };

  /**
   * Creates a dummy model with the provided name and navigate to it
   * @param modelName Name for the new model
   */
  const createModel = (modelName: string) => {
    const modelId = uuidv4();
    const newModel: Model = {
      id: modelId,
      name: modelName,
      description: '',
      variables: [{ name: 'Result', type: 3 }],
      elements: [],
      connectors: [],
      tasks: [],
    };

    addModel(newModel).then(() => {
      setSelectedModel(newModel);
      // Navigate to the created model
      navigate(`${modelId}`);
    });
  };

  // If the models array is empty reset the two state values to their initial values
  useEffect(() => {
    if (models?.length === 0) {
      setTabIndex(false);
      setSelectedModel(null);
    } else {
      const index = models?.findIndex(
        (model) => model.name === selectedModel?.name
      );
      if (typeof index !== 'undefined' && index !== -1) {
        setTabIndex(index);
      }
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
      <Tabs value={tabIndex} onChange={handleChange} selectionFollowsFocus>
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
