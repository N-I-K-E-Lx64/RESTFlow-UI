import { Grid } from '@mui/material';
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

  const { data: model } = useGetModelByIdQuery(modelId);
  const { data: apiResources } = useGetApiResourcesQuery(modelId);

  useEffect(() => {
    if (typeof model !== 'undefined' && typeof apiResources !== 'undefined') {
      dispatch(setActiveModel(model));
      dispatch(apisSet(apiResources));
    }
  }, [model, apiResources, dispatch]);

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
