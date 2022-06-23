import { Grid, Typography } from '@mui/material';
import DetailModeling from './DetailModeling';
import FlowModeling from './FlowModeling';
import { useParams } from 'react-router-dom';
import { useGetApiResourcesQuery } from '../../app/service/fileApi';
import { useEffect } from 'react';
import { useGetModelByIdQuery } from '../../app/service/modelApi';
import { useAppDispatch } from '../../app/hooks';
import { setActiveModel } from './slices/modelSlice';
import { apisSet } from './slices/apiSlice';

export default function ModelingTool() {
  const dispatch = useAppDispatch();

  const { modelId } = useParams<{ modelId: any }>();

  const { data: model, isLoading } = useGetModelByIdQuery(modelId);
  const { data: apiResources } = useGetApiResourcesQuery(modelId);

  useEffect(() => {
    if (model) dispatch(setActiveModel(model));
  }, [model, dispatch]);

  useEffect(() => {
    if (apiResources) dispatch(apisSet(apiResources));
  }, [apiResources, dispatch]);

  if (isLoading) {
    return (
      <Typography variant="h2" gutterBottom>
        Loading...
      </Typography>
    );
  }

  if (!model) {
    return (
      <Typography variant="h2" gutterBottom>
        Model {modelId} could not be found! Try reloading or selecting another
        model...
      </Typography>
    );
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={8}>
        <FlowModeling />
      </Grid>

      <Grid item xs={4}>
        <DetailModeling />
      </Grid>
    </Grid>
  );
}
