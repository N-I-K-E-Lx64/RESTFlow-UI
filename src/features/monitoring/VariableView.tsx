import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import {
  useGetVariablesQuery,
  Variable,
} from '../../app/service/userVariableApi';
import { TopicOutlined } from '@mui/icons-material';
import React from 'react';

export const VariableView = () => {
  const { instanceId } = useParams<{ instanceId: string }>();

  const { data: variables, isLoading: isLoadingVariables } =
    useGetVariablesQuery(instanceId!);

  if (isLoadingVariables) {
    return (
      <Typography variant="h2" align="center">
        Loading ...
      </Typography>
    );
  }

  return (
    <Grid container spacing={2}>
      {variables?.map((prop: Variable) => (
        <Grid item xs={6} key={prop.name}>
          <Card sx={{ maxWidth: 345 }}>
            <CardHeader
              avatar={
                <Avatar aria-label="icon">
                  <TopicOutlined />
                </Avatar>
              }
              title={prop.name}
              subheader={prop.type + ' -Variable'}
            />
            <CardContent>
              {prop.value !== 'null' && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {prop.value}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
