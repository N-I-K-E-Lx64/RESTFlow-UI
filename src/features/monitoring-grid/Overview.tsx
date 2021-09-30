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

enum WorkflowStatus {
	INITIATED = "initiated",
	ACTIVE = "active",
	SUSPENDED = "suspended",
	TERMINATED = "terminated",
	COMPLETED = "completed"
}

const rows: GridRowModel[] = [
	{id: 1, name: 'Test1', activity: 'TestActivity', status: WorkflowStatus.ACTIVE, lastStarted: Date.now()},
	{id: 2, name: 'Test2', activity: 'TestActivity2', status: WorkflowStatus.SUSPENDED, lastStarted: Date.now()},
];

export function MonitoringGrid() {

	const startWorkflow = useCallback((id: GridRowId) => () => {

	}, []);

	const pauseWorkflow = useCallback((params: GridRowParams) => () => {
		console.log(params.row);
	}, []);

	const deleteWorkflow = useCallback((params) => () => {

	}, []);

	const columns = useMemo(() => [
			{field: 'name', type: 'string', flex: 1, minWidth: 100},
			{field: 'activity', type: 'string', flex: 1, minWidth: 100},
			{
				field: 'status', renderCell: (params: GridRenderCellParams) => (
					<Chip
						label={(params.value as WorkflowStatus)}
					/>
				),
			},
			{field: 'lastStarted', type: 'dateTime', width: 180 },
			{field: 'lastModified', type: 'dateTime', width: 180 },
			{
				field: 'actions',
				type: 'actions',
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
		<div style={{display: 'flex', width: '100%'}}>
			<div style={{flexGrow: 1}}>
				<DataGrid columns={columns} rows={rows} autoHeight autoPageSize checkboxSelection/>
			</div>
		</div>
	);
}
