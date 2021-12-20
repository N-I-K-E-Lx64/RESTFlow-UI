import React, {useCallback, useMemo} from "react";
import {
	DataGrid,
	GridRenderCellParams,
	GridRowModel,
	GridActionsCellItem,
	GridRowParams, GridRowId
} from "@mui/x-data-grid";
import {Box, Chip, Snackbar} from "@mui/material";
import {RestartAlt, StopOutlined} from "@mui/icons-material";
import {MonitoringInstance, useGetMessagesQuery} from "../../app/service/websocketApi";

enum WorkflowStatus {
	INITIATED = "initiated",
	ACTIVE = "active",
	SUSPENDED = "suspended",
	TERMINATED = "terminated",
	COMPLETED = "completed"
}

export function MonitoringGrid() {
	const [open, setOpen] = React.useState(false);
	const [message, setMessage] = React.useState("");
	const {data, isLoading} = useGetMessagesQuery();

	const rows: GridRowModel[] = useMemo(() => {
		console.log(data);
		if (typeof data !== "undefined" && isLoading === false) {
			return data.map((instance: MonitoringInstance) => Object.assign({ id: instance.wfName}, instance));
		} else {
			return [];
		}
	}, [data, isLoading]);

	const handleClose = (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
		if (reason === 'clickaway') return;

		setOpen(false);
	}

	const restartWorkflow = useCallback((id: GridRowId) => () => {
		sendCommand(id, "restart");
	}, []);

	const pauseWorkflow = useCallback((id: GridRowId) => () => {
		sendCommand(id, "stop");
	}, []);

	const sendCommand = (id: GridRowId, command: string) => {
		fetch(`http://localhost:8080/workflow/${command}/${id}`)
			.then(response => response.text())
			.then((message: string) => {
				setMessage(message);
				setOpen(true);
			})
	}

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

	const columns = useMemo(() => [
			{field: 'wfName', headerName: 'Workflow Name', type: 'string', flex: 1},
			{field: 'currentActivity', headerName: 'Current Activity', type: 'string', flex: 1},
			{
				field: 'wfStatus', headerName: 'Status', flex: 1, renderCell: (params: GridRenderCellParams) => (
					<Chip
						label={(params.value as WorkflowStatus)}
						// color={determineColor(params.value as WorkflowStatus)}
					/>
				),
			},
			{field: 'startTime', headerName: 'Last Started', type: 'dateTime', flex: 1},
			// {field: 'lastModified', type: 'dateTime', width: 180 },
			{
				field: 'actions',
				type: 'actions',
				minWidth: 120,
				getActions: (params: GridRowParams) => [
					<GridActionsCellItem
						icon={ <RestartAlt/> }
						label="Restart Workflow"
						onClick={restartWorkflow(params.id)} />,
					<GridActionsCellItem
						icon={ <StopOutlined/> }
						label="Pause Workflow"
						onClick={pauseWorkflow(params.id)} />,
				],
			},
		],
		[restartWorkflow, pauseWorkflow],
	);

	return (
		<Box sx={{padding: '16px'}}>
			<DataGrid columns={columns} rows={rows} autoHeight checkboxSelection/>
			<Snackbar open={open} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}} autoHideDuration={6000} onClose={handleClose} message={message}/>
		</Box>
	);
}
