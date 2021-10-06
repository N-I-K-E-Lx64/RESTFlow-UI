import React, {useCallback, useMemo} from "react";
import {
	DataGrid,
	GridRenderCellParams,
	GridRowModel,
	GridActionsCellItem,
	GridRowId,
	GridRowParams
} from "@mui/x-data-grid";
import {Chip} from "@mui/material";
import {Delete, Pause, PlayArrow} from "@mui/icons-material";
import {MonitoringInstance, useGetMessagesQuery} from "../../app/service/websocketApi";

enum WorkflowStatus {
	INITIATED = "initiated",
	ACTIVE = "active",
	SUSPENDED = "suspended",
	TERMINATED = "terminated",
	COMPLETED = "completed"
}

export function MonitoringGrid() {

	const {data, isLoading} = useGetMessagesQuery();

	let rows: GridRowModel[] = [];

	if (typeof data !== "undefined" && isLoading === false) {
		rows = data.map((instance: MonitoringInstance) => Object.assign({ id: instance.wfName}, instance));
		console.log(rows);
	}

	const startWorkflow = useCallback((id: GridRowId) => () => {

	}, []);

	const pauseWorkflow = useCallback((params: GridRowParams) => () => {
		console.log(params.row);
	}, []);

	const deleteWorkflow = useCallback((params) => () => {

	}, []);

	const columns = useMemo(() => [
			{field: 'wfName', headerName: 'Workflow Name', type: 'string', flex: 1},
			{field: 'currentActivity', headerName: 'Current Activity', type: 'string', flex: 1},
			{
				field: 'wfStatus', headerName: 'Status', flex: 1, renderCell: (params: GridRenderCellParams) => (
					<Chip
						label={(params.value as WorkflowStatus)}
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
						icon={ <PlayArrow/> }
						label="Start Workflow"
						onClick={startWorkflow(params.id)} />,
					<GridActionsCellItem
						icon={ <Pause/> }
						label="Pause Workflow"
						onClick={pauseWorkflow(params)} />,
					<GridActionsCellItem
						icon={ <Delete/> }
						label="DeleteWorkflow"
						onClick={deleteWorkflow(params)} />
				],
			},
		],
		[startWorkflow, pauseWorkflow, deleteWorkflow],
	);

	return (
		<div style={{padding: '16px'}}>
			<DataGrid columns={columns} rows={rows} autoHeight autoPageSize checkboxSelection/>
		</div>
	);
}
