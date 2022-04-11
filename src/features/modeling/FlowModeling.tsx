import {v4 as uuidv4} from "uuid";
import {
	addConnector,
	addElement,
	addTask,
	assignConnector,
	selectModel,
	updateConnector,
	updateElementPosition
} from "./modelSlice";
import {Connector, Element, ElementType, InvokeTaskParams, Model, TaskType} from "../../model/types";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {Box, Divider, IconButton, Paper, SpeedDial, SpeedDialAction, SpeedDialIcon, Stack} from "@mui/material";
import {Arrow, Circle, Layer, Line, Rect, Stage} from "react-konva";
import {Html} from "react-konva-utils";
import {CallMade, Delete, PlayArrow, RadioButtonChecked, RadioButtonUnchecked, Save, Task} from "@mui/icons-material";
import {useWindowSize} from "usehooks-ts";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {useDeleteModelMutation, useUpdateModelMutation} from "../../app/service/modelApi";
import {setSelection} from "./selectionSlice";

interface CanvasSize {
	width: number;
	height: number;
}

export function FlowModeling() {
	const dispatch = useAppDispatch();
	const {width, height} = useWindowSize();
	const [canvasSize, setCanvasSize] = useState<CanvasSize>({width: width, height: height});
	const [addMode, setAddMode] = useState<ElementType | null>(null);
	const [connectMode, setConnectMode] = useState<boolean>(false);
	const [selectedElement, setSelectedElement] = useState<Element | null>(null);
	const [draggedElementId, setDraggedElementId] = useState<string>("");

	const [selector, setSelector] = useState<number[]>([]);

	const stageRef = useRef<HTMLDivElement>(null);

	const [updateModel] = useUpdateModelMutation();
	const [deleteModel] = useDeleteModelMutation();

	const model: Model = useAppSelector(selectModel);
	const startElement = model.elements.filter((element) => element.type === ElementType.START_EVENT);
	const endElement = model.elements.filter((element) => element.type === ElementType.END_EVENT);
	const elements = model.elements.filter((element) => element.type !== ElementType.START_EVENT && element.type !== ElementType.END_EVENT);
	const connectors = model.connectors;

	// Handles creation of new elements or deselection of elements
	const handleStageClick = (e: any) => {
		// Disable context menu
		// setContextMenu(INITIAL_CONTEXT_MENU);

		// Place the respective element in the canvas
		if (addMode !== null) {
			const pointerPosition = e.currentTarget.getPointerPosition();
			// Generate a "global" id for this task
			const id = uuidv4();

			// Create a new element on the click position based on the symbol type
			dispatch(addElement({
				id: id,
				x: pointerPosition.x,
				y: pointerPosition.y,
				width: 100,
				height: 50,
				type: addMode,
				connectors: []
			}));

			switch (addMode) {
				case ElementType.START_EVENT: {
					break;
				}
				case ElementType.END_EVENT: {
					break;
				}
				case ElementType.TASK: {
					const dummyParams: InvokeTaskParams = {raml: "", resource: "", inputVariable: "", targetVariable: ""};
					dispatch(addTask({
						id: id,
						description: "Test",
						type: TaskType.INVOKE_TASK,
						params: dummyParams
					}));
				}
			}

			// Reset the mode (with null)
			setAddMode(null);
		} else {
			// Deselect when the user clicks on empty area
			const clickedOnEmpty = e.target === e.target.getStage();
			if (clickedOnEmpty) {
				setSelectedElement(null);
				dispatch(setSelection(""));
			}
		}
	};

	// Handles element selection and connector creation
	const handleSymbolClick = (e: any) => {
		const elementId = e.target.id();
		const element: Element | null = getElement(elementId);
		console.log("Select: " + elementId, element);

		if (element !== null) {
			// Store the selected symbol if connectMode is activated
			setSelectedElement(element);
			console.log(selectedElement);
			dispatch(setSelection(elementId));

			if (selectedElement !== null && connectMode) {
				// Compute the Connector Points and store the connector, so it can be drawn
				const points = getConnectorPoints(selectedElement, element);
				const connectorId = uuidv4();
				dispatch(addConnector({
					id: connectorId,
					points: points,
					source: selectedElement.id,
					target: elementId
				}));

				// Assign the connector to the source and target element
				dispatch(assignConnector({elementId: selectedElement.id, connectorId: connectorId}));
				dispatch(assignConnector({elementId: elementId, connectorId: connectorId}));

				// Deactivate Connect Mode
				setConnectMode(false);
			}
		}
	};

	// Updates the position and the selector position of the dragged element
	const handleDragEnd = (e: any) => {
		const elementId = e.target.id();
		dispatch(updateElementPosition({id: elementId, x: e.target.x(), y: e.target.y()}));
		setDraggedElementId(elementId);
	};

	const getElement = (elementId: string): Element | null => {
		const mergedElements = elements.concat(startElement, endElement);
		const element = mergedElements.find((element) => element.id === elementId);
		if (typeof element !== "undefined") {
			return element;
		} else {
			return null;
		}
	};

	// Connectors must be automatically adjusted after an element has been dragged
	useEffect(() => {
		// Updates the connectors accordingly
		const draggedElement = getElement(draggedElementId);
		if (draggedElement !== null) {
			draggedElement.connectors.forEach((connId: string) => {
				const conn = connectors.find((conn: Connector) => conn.id === connId);

				let source: Element | null = null;
				let target: Element | null = null;

				// Determines the source and target of the connector
				if (typeof conn !== "undefined") {
					if (conn.source === draggedElementId) {
						source = draggedElement;
						target = getElement(conn.target);
					} else {
						source = getElement(conn.source);
						target = draggedElement;
					}
				}

				// Computes the new line points and store them in the state
				if (source !== null && target !== null) {
					const newPoints = getConnectorPoints(source, target);
					dispatch(updateConnector({id: connId, points: newPoints}));
				}
			});
			// Reset the dragged Element
			setDraggedElementId("");

			// Updates the selector position
			setSelectedElement(draggedElement);
		}
	}, [draggedElementId]);

	// Highlight the selected symbol
	useEffect(() => {
		if (selectedElement !== null) {
			const {x, y, width, height} = selectedElement;
			switch (selectedElement.type) {
				case ElementType.START_EVENT:
				case ElementType.END_EVENT:
					const r = (height/2) + 8;
					setSelector([x - r, y + r, x + r, y + r, x + r, y - r, x - r, y - r, x - r, y + r]);
					break;

				case ElementType.TASK:
					const w = width + 8;
					const h = height + 8;
					setSelector([x - 8, y - 8, x + w, y - 8, x + w, y + h, x - 8, y + h, x - 8 , y - 8]);
					break;
			}
		} else {
			// Disables the selector when no element is currently selected
			setSelector([]);
		}
	}, [selectedElement]);

	// Disable the selection when the model changes
	useEffect(() => {
		setSelectedElement(null);
	}, [model]);

	const getConnectorPoints = (from: Element, to: Element): number[] => {
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

	/*// Handles the drag movement by storing the current dragging position in the store.
	const handleDragMove = (e: any) => {
		setDraggingTask({id: e.target.id(), x: e.target.x(), y: e.target.y()});
	};

	// Throttles the drag move to reduce the amount of renders and computations
	const throttledDragMove = useMemo(() => {
		return throttle(handleDragMove, 50);
	}, []);*/

	useLayoutEffect(() => {
		if (stageRef.current) {
			setCanvasSize({width: stageRef.current.offsetWidth, height: 600});
		}
		// setCanvasSize({ width: 600, height: 600 });
	}, [width, height]);

	const handleUpdateModel = () => {
		console.log(model);
		updateModel(model).then((result) => console.log(result));
	};

	const handleDeleteModel = () => {
		deleteModel(model.id).then((result) => console.log(result));
	}

	// Object containing the actions for the SpeedDial
	const actions = [
		{icon: <Save/>, name: 'Save', action: handleUpdateModel},
		{icon: <Delete/>, name: 'Delete', action: handleDeleteModel},
		{icon: <PlayArrow/>, name: 'Play'}
	];

	return (
		<Box sx={{border: "medium dashed grey"}} ref={stageRef}>
			<Stage
				width={canvasSize.width}
				height={canvasSize.height}
				onMouseDown={handleStageClick}
			>
				<Layer>
					<Html>
						<Paper sx={{p: 1, position: 'absolute', top: '8px', left: '8px'}}>
							<Stack spacing={1}>
								<IconButton aria-label="AddStartEvent"
								            onClick={() => setAddMode(ElementType.START_EVENT)}>
									<RadioButtonUnchecked/>
								</IconButton>
								<IconButton aria-label="AddEndEvent"
								            onClick={() => setAddMode(ElementType.END_EVENT)}>
									<RadioButtonChecked/>
								</IconButton>
								<IconButton aria-label="AddTask" onClick={() => setAddMode(ElementType.TASK)}>
									<Task/>
								</IconButton>

								<Divider/>

								<IconButton aria-label="ConnectTasks" onClick={() => setConnectMode(true)}>
									<CallMade/>
								</IconButton>
							</Stack>
						</Paper>
					</Html>

					<Html divProps={{style: {position: 'absolute', inset: 'auto 8px 8px auto'}}}>
						<SpeedDial
							ariaLabel="SpeedDial"
							icon={<SpeedDialIcon/>}
							direction="left"
						>
							{actions.map((action) => (
								<SpeedDialAction
									key={action.name}
									icon={action.icon}
									tooltipTitle={action.name}
									onClick={action.action}
								/>
							))}
						</SpeedDial>
					</Html>

					{startElement.map((element) => (
						<Circle key={element.id} id={element.id} x={element.x} y={element.y} radius={element.height / 2}
						        fill={"white"} stroke={"black"} strokeWidth={2}
								draggable
						        onDragEnd={handleDragEnd}
						        onClick={handleSymbolClick}
						/>
					))}

					{endElement.map((element) => (
						<Circle key={element.id} id={element.id} x={element.x} y={element.y} radius={element.height / 2}
						        fill={"white"} stroke={"black"} strokeWidth={5}
						        draggable
						        onDragEnd={handleDragEnd}
						        onClick={handleSymbolClick}
						/>
					))}

					{elements.map((element) => (
						<Rect key={element.id} id={element.id} x={element.x} y={element.y} width={element.width} height={element.height}
						      fill={"white"} stroke={"black"} strokeWidth={2} cornerRadius={10}
						      draggable
						      //onDragMove={throttledDragMove}
							  onDragEnd={handleDragEnd}
							  onClick={handleSymbolClick}
						/>
					))}

					{connectors.map((conn) => (
						<Arrow key={conn.id} points={conn.points} fill={"black"} stroke={"black"}/>
					))}

					{selector.length >= 1 &&
						<Line key="Selector" points={selector} stroke='#b3e5fc' strokeWidth={2} dash={[5, 5]}/>
					}

					{/*{contextMenu.isActivated && (
								<Html>
									<Paper sx={{p: 1, position: "absolute", top: contextMenu.top, left: contextMenu.left}}>
										<Grid container spacing={1}>
											<Grid item xs>
												<IconButton aria-label="connect-tasks">
													<TrendingFlat/>
												</IconButton>
											</Grid>
										</Grid>
									</Paper>
								</Html>
							)}*/}


				</Layer>
			</Stage>
		</Box>
	)
}
