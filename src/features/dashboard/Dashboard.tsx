import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from '@mui/material';
import {
  useDeleteModelMutation,
  useGetModelsQuery,
} from '../../app/service/modelApi';
import { Model } from '../../model/types';
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateInstanceHandler } from '../../ui/CreateInstanceHandler';

export function Dashboard() {
  const navigate = useNavigate();

  const { data: models, error, isLoading } = useGetModelsQuery();
  const [deleteModel] = useDeleteModelMutation();

  const handlerRef = useRef<{ handleShowDialog: (modelId: string) => void }>(
    null
  );

  const primaryCardAction = (
    event: React.MouseEvent<HTMLButtonElement>,
    model: Model
  ) => {
    navigate(`/modeling/${model.id}`);
  };

  const handleDeleteModel = (model: Model) => {
    deleteModel(model.id);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {models?.map((model, index) => (
          <Grid item xs={2} key={index}>
            <Card sx={{ maxWidth: 300 }}>
              <CardActionArea onClick={(e) => primaryCardAction(e, model)}>
                <CardHeader
                  avatar={<Avatar>{model.name.charAt(0).toUpperCase()}</Avatar>}
                  title={model.name}
                  subheader={model.id}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {model.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Button size="small" onClick={() => handleDeleteModel(model)}>
                  Delete
                </Button>
                <Button
                  size="small"
                  onClick={() => handlerRef.current?.handleShowDialog(model.id)}
                >
                  Start
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <CreateInstanceHandler ref={handlerRef} />
    </Box>
  );
}
