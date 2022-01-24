import {useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {Grid, IconButton, Paper, Typography} from "@mui/material";
import {Arrow, Circle, Layer, Stage} from "react-konva";
import {Html} from "react-konva-utils";
import {Add, TrendingFlat} from "@mui/icons-material";
import {addTask, selectTasks, Task, updateTask, updateTaskPosition} from "./taskSlice";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {addConnector, Connector, selectConnectors, updateConnector} from "./connectorSlice";
import throttle from "lodash.throttle";
import {useWindowSize} from "usehooks-ts";

interface Position {
	id: string;
	x: number;
	y: number;
}

interface CanvasSize {
	width: number;
	height: number;
}

interface ContextMenu {
	isActivated: boolean;
	left: number;
	top: number;
}

export function ModelingTool() {
	const dispatch = useAppDispatch();

	const INITIAL_CONTEXT_MENU: ContextMenu = {isActivated: false, left: 0, top: 0};
	const INITIAL_POSITION: Position = {id: "", x: 0, y: 0};

	const {width, height} = useWindowSize();
	const [canvasSize, setCanvasSize] = useState<CanvasSize>({width: width, height: height});
	const [addMode, setAddMode] = useState<boolean>(false);
	const [connectMode, setConnectMode] = useState<boolean>(false);
	const [contextMenu, setContextMenu] = useState<ContextMenu>(INITIAL_CONTEXT_MENU);
	const [sourceId, setSourceId] = useState<string>("");
	const [draggingTask, setDraggingTask] = useState<Position>(INITIAL_POSITION);

	const tasks: Task[] = useAppSelector(selectTasks);
	const connectors: Connector[] = useAppSelector(selectConnectors);

	const stageRef = useRef<HTMLDivElement>(null);

	const handleStageClick = (e: any) => {
		// Disable context menu
		setContextMenu(INITIAL_CONTEXT_MENU);

		if (addMode) {
			const pointerPosition = e.currentTarget.getPointerPosition();
			// Create a new dummy task on the click position
			dispatch(addTask({
				id: `Task${tasks.length + 1}`,
				x: pointerPosition.x,
				y: pointerPosition.y,
				width: 80,
				height: 40,
				connectors: []
			}));
			// Deactivate Add Mode
			setAddMode(false);
		}
	};

	const handleTaskClick = (e: any) => {
		if (connectMode) {
			if (sourceId === "") {
				setSourceId(e.target.id());
			} else {
				const targetId = e.target.id();
				// Create a connector between the source and the currently selected task
				const source = tasks.find((task: Task) => task.id === sourceId);
				const target = tasks.find((task) => task.id === e.target.id());
				if (typeof source !== "undefined" && typeof target !== "undefined") {
					// Calculate the points for the line
					const points = getConnectorPoints(source, target);
					const connectorId = connectors.length;
					dispatch(addConnector({id: connectorId, from: sourceId, to: targetId, points: points}));
					// Add the connector to both tasks
					dispatch(updateTask({id: sourceId, connectorId: connectorId}));
					dispatch(updateTask({id: targetId, connectorId: connectorId}));
					// Deactivate Connect Mode
					setConnectMode(false);
				}
			}
		}
	};

	const getConnectorPoints = (from: Task, to: Task) => {
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		let angle = Math.atan2(-dy, dx);

		const radius = 50;

		return [
			from.x - radius * Math.cos(angle + Math.PI),
			from.y + radius * Math.sin(angle + Math.PI),
			to.x - radius * Math.cos(angle),
			to.y + radius * Math.sin(angle)
		];
	};

	useEffect(() => {
		dispatch(updateTaskPosition({id: draggingTask.id, x: draggingTask.x, y: draggingTask.y}));
		const task = tasks.find((task) => task.id === draggingTask.id);

		if (typeof task !== "undefined") {
			task.connectors.forEach((connectorId) => {
				const connector = connectors[connectorId];

				let from: Task | undefined;
				let to: Task | undefined;
				if (connector.from === draggingTask.id) {
					from = task;
					to = tasks.find((task) => task.id === connector.to);
				} else if (connector.to === draggingTask.id) {
					from = tasks.find((task) => task.id === connector.from);
					to = task;
				}

				if (typeof from !== "undefined" && typeof to !== "undefined") {
					const points = getConnectorPoints(from, to);
					dispatch(updateConnector({id: connector.id, points}));
				}
			});
		}
	}, [draggingTask]);

	// Handles the drag movement by storing the current dragging position in the store.
	const handleDragMove = (e: any) => {
		setDraggingTask({id: e.target.id(), x: e.target.x(), y: e.target.y()});
	};

	// Throttles the drag move to reduce the amount of renders and computations
	const throttledDragMove = useMemo(() => {
		return throttle(handleDragMove, 100);
	}, []);

	const handleContextMenu = (e: any) => {
		// Prevent the default context menu
		e.evt.preventDefault();
		// const positionLeft = e.target.x() + e.target.width() + 8;
		const positionLeft = e.target.x() + e.target.radius() + 8;
		setContextMenu({isActivated: true, left: positionLeft, top: e.target.y()});
	};


	useLayoutEffect(() => {
		if (stageRef.current) {
			// console.log(width, height);
			console.log(stageRef.current.offsetWidth, stageRef.current.offsetHeight);
			setCanvasSize({width: stageRef.current.offsetWidth, height: stageRef.current.offsetHeight});
		}
	}, [width, height]);

	return (
		<Grid container spacing={1}>
			<Grid item xs={8} ref={stageRef}>
				<Stage
					width={canvasSize.width}
					height={canvasSize.height}
					onClick={handleStageClick}
				>
					<Layer>
						<Html divProps={{style: {position: 'absolute', top: 24, left: 24}}}>
							<Paper sx={{p: 1, position: 'absolute', top: '8px', left: '8px'}}>
								<Grid container spacing={2}>
									<Grid item xs>
										<IconButton aria-label="add-task" onClick={() => setAddMode(true)}>
											<Add/>
										</IconButton>
									</Grid>
								</Grid>
							</Paper>
						</Html>


						{tasks.map((task) => (
							<Circle key={task.id} id={task.id} x={task.x} y={task.y} radius={40} fill={"green"}
							        draggable
							        onDragMove={throttledDragMove}
							        onContextMenu={handleContextMenu}
							        onClick={handleTaskClick}
							/>
						))}

						{connectors.map((conn) => (
							<Arrow key={conn.id} points={conn.points} fill={"black"} stroke={"black"}/>
						))}

						{contextMenu.isActivated && (
							<Html>
								<Paper sx={{p: 1, position: "absolute", top: contextMenu.top, left: contextMenu.left}}>
									<Grid container spacing={2}>
										<Grid item xs>
											<IconButton aria-label="connect-tasks" onClick={() => setConnectMode(true)}>
												<TrendingFlat/>
											</IconButton>
										</Grid>
									</Grid>
								</Paper>
							</Html>
						)}
					</Layer>
				</Stage>
			</Grid>
			<Grid item xs={4}>
				<Typography paragraph>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
					tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus non
					enim praesent elementum facilisis leo vel. Risus at ultrices mi tempus
					imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus.
					Convallis convallis tellus id interdum velit laoreet id donec ultrices.
					Odio morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit
					adipiscing bibendum est ultricies integer quis. Cursus euismod quis viverra
					nibh cras. Metus vulputate eu scelerisque felis imperdiet proin fermentum
					leo. Mauris commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis
					feugiat vivamus at augue. At augue eget arcu dictum varius duis at
					consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa
					sapien faucibus et molestie ac.
				</Typography>
				<Typography paragraph>
					Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper
					eget nulla facilisi etiam dignissim diam. Pulvinar elementum integer enim
					neque volutpat ac tincidunt. Ornare suspendisse sed nisi lacus sed viverra
					tellus. Purus sit amet volutpat consequat mauris. Elementum eu facilisis
					sed odio morbi. Euismod lacinia at quis risus sed vulputate odio. Morbi
					tincidunt ornare massa eget egestas purus viverra accumsan in. In hendrerit
					gravida rutrum quisque non tellus orci ac. Pellentesque nec nam aliquam sem
					et tortor. Habitant morbi tristique senectus et. Adipiscing elit duis
					tristique sollicitudin nibh sit. Ornare aenean euismod elementum nisi quis
					eleifend. Commodo viverra maecenas accumsan lacus vel facilisis. Nulla
					posuere sollicitudin aliquam ultrices sagittis orci a.
				</Typography>
			</Grid>
		</Grid>
	);
}
