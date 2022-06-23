import React, { useCallback, useMemo } from 'react';
import {
  DataGrid,
  GridRenderCellParams,
  GridRowModel,
  GridActionsCellItem,
  GridRowParams,
  GridRowId,
  GridSelectionModel,
} from '@mui/x-data-grid';
import { Box, Chip, Snackbar } from '@mui/material';
import { Preview, RestartAlt, StopOutlined } from '@mui/icons-material';
import {
  MonitoringInstance,
  useGetMessagesQuery,
} from '../../app/service/websocketApi';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { restflowAPI } from '../../app/service/restflowAPI';

enum WorkflowStatus {
  INITIATED = 'initiated',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  COMPLETED = 'completed',
}

export function MonitoringGrid() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [selectionModel, setSelectionModel] =
    React.useState<GridSelectionModel>([]);

  const { data, isLoading } = useGetMessagesQuery();

  const rows: GridRowModel[] = useMemo(() => {
    if (typeof data !== 'undefined' && isLoading === false) {
      return data.map((instance: MonitoringInstance) =>
        Object.assign({ id: instance.wfName }, instance)
      );
    } else {
      return [];
    }
  }, [data, isLoading]);

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return;

    setOpen(false);
  };

  const restartWorkflow = useCallback(
    (id: GridRowId) => () => {
      sendCommand(id, 'restart');

      // Invalidate Tags to trigger a refetch
      dispatch(
        restflowAPI.util.invalidateTags([
          { type: 'Variable', id: 'LIST' },
          { type: 'UserParam', id: 'LIST' },
        ])
      );
    },
    []
  );

  const pauseWorkflow = useCallback(
    (id: GridRowId) => () => {
      sendCommand(id, 'stop');
    },
    []
  );

  const showResults = useCallback(
    (id: GridRowId) => () => {
      navigate(`/variables/${id}`);
    },
    [navigate]
  );

  /**
   * Send some messages to the server
   * @param instanceId Id of the workflow instance
   * @param command The command that the server should execute
   */
  const sendCommand = (instanceId: GridRowId, command: 'restart' | 'stop') => {
    fetch(`http://localhost:8080/${command}/${instanceId}`)
      .then((response) => response.text())
      .then((message: string) => {
        setMessage(message);
        setOpen(true);
      });
  };

  /* const determineColor = (status: WorkflowStatus): ('primary' | 'warning' | 'error' | 'success' | 'default') => {
		console.log(status);
		switch (status) {
			case WorkflowStatus.ACTIVE: return 'primary';
			case WorkflowStatus.SUSPENDED: return 'warning';
			case WorkflowStatus.TERMINATED: return 'error';
			case WorkflowStatus.COMPLETED: return 'success';

			default: return 'default';
		}
	} */

  const columns = useMemo(
    () => [
      { field: 'wfName', headerName: 'Workflow Name', type: 'string', flex: 1 },
      {
        field: 'currentActivity',
        headerName: 'Current Activity',
        type: 'string',
        flex: 1,
      },
      {
        field: 'wfStatus',
        headerName: 'Status',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => (
          <Chip
            label={params.value as WorkflowStatus}
            // color={determineColor(params.value as WorkflowStatus)}
          />
        ),
      },
      {
        field: 'startTime',
        headerName: 'Last Started',
        type: 'dateTime',
        flex: 1,
      },
      // {field: 'lastModified', type: 'dateTime', width: 180 },
      {
        field: 'actions',
        type: 'actions',
        minWidth: 120,
        getActions: (params: GridRowParams) => [
          <GridActionsCellItem
            icon={<RestartAlt />}
            label="Restart Workflow"
            onClick={restartWorkflow(params.id)}
          />,
          <GridActionsCellItem
            icon={<StopOutlined />}
            label="Pause Workflow"
            onClick={pauseWorkflow(params.id)}
          />,
          <GridActionsCellItem
            icon={<Preview />}
            label="Delete Workflow"
            onClick={showResults(params.id)}
          />,
        ],
      },
    ],
    [restartWorkflow, pauseWorkflow, showResults]
  );

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ flexGrow: 1 }}>
        <DataGrid
          columns={columns}
          rows={rows}
          autoHeight
          pagination
          checkboxSelection
          onSelectionModelChange={(selectionModel) =>
            setSelectionModel(selectionModel)
          }
          selectionModel={selectionModel}
        />
      </Box>

      <Snackbar
        open={open}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={6000}
        onClose={handleClose}
        message={message}
      />
    </Box>
  );
}
