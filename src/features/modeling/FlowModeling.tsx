import {v4 as uuidv4} from "uuid";
import {
	addConnector,
	addElement,
	addTask,
	assignConnector,
	removeConnector,
	removeElement,
	selectModel,
	updateConnector,
	updateElementPosition
} from "./modelSlice";
import {Connector, Element, ElementType, InvokeTaskParams, Model, TaskType} from "../../model/types";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {Box, Divider, IconButton, Paper, SpeedDial, SpeedDialAction, SpeedDialIcon, Stack} from "@mui/material";
import {Arrow, Circle, Group, Layer, Line, Rect, Stage, Text} from "react-konva";
import {Html} from "react-konva-utils";
import {CallMade, Delete, PlayArrow, RadioButtonChecked, RadioButtonUnchecked, Save, Task} from "@mui/icons-material";
import {useWindowSize} from "usehooks-ts";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {useDeleteModelMutation, useUpdateModelMutation} from "../../app/service/modelApi";
import {setSelection} from "./selectionSlice";
import {QuickActionMenu, QuickActionMenuContext} from "./QuickActionMenu";

interface CanvasSize {
	width: number;
	height: number;
}

interface Point {
	x: number;
	y: number;
}

interface ContextMenuParams {
	activated: boolean;
	top: number;
	left: number;
	context: QuickActionMenuContext;
}

const INITIAL_CONTEXT_MENU: ContextMenuParams = { activated: false, top: 0, left: 0, context: QuickActionMenuContext.None}
const SNAP_BLOCK_SIZE: number = 25;

export function FlowModeling() {
	const dispatch = useAppDispatch();
	const {width, height} = useWindowSize();
	const [canvasSize, setCanvasSize] = useState<CanvasSize>({width: width, height: height});
	const [addMode, setAddMode] = useState<ElementType | null>(null);
	const [connectMode, setConnectMode] = useState<boolean>(false);
	const [selectedElement, setSelectedElement] = useState<Element | null>(null);
	const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
	const [draggedElementId, setDraggedElementId] = useState<string>("");

	const [elementSelection, setElementSelection] = useState<number[]>([]);
	const [contextMenu, setContextMenu] = useState<ContextMenuParams>(INITIAL_CONTEXT_MENU);

	const stageRef = useRef<HTMLDivElement>(null);

	const [updateModel] = useUpdateModelMutation();
	const [deleteModel] = useDeleteModelMutation();

	const model: Model = useAppSelector(selectModel);
	const startElement = model.elements.filter((element) => element.type === ElementType.START_EVENT);
	const endElement = model.elements.filter((element) => element.type === ElementType.END_EVENT);
	const elements = model.elements.filter((element) => element.type !== ElementType.START_EVENT && element.type !== ElementType.END_EVENT);
	const connectors = model.connectors;

	/*let snappingGrid : number[][] = [];

	for (var i = 0; i < width / SNAP_BLOCK_SIZE; i++) {
		snappingGrid.push([ Math.round(i * SNAP_BLOCK_SIZE) + 0.5, 0, Math.round(i * SNAP_BLOCK_SIZE) + 0.5, height]);
	}

	for (var j = 0; j < height / SNAP_BLOCK_SIZE; j++) {
		snappingGrid.push([0, Math.round(j * SNAP_BLOCK_SIZE), width, Math.round(j * SNAP_BLOCK_SIZE)]);
	}*/

	/**
	 * Handles creation of new elements or deselection of elements
	 * @param e Konva Click event
	 */
	const handleStageClick = (e: any) => {
		// Place the respective element in the canvas
		if (addMode !== null) {
			const pointerPosition = e.currentTarget.getPointerPosition();
			// Generate a "global" id for this task
			const id = uuidv4();

			// Create a new element on the click position based on the symbol type
			dispatch(addElement({
				id: id,
				x: Math.round(pointerPosition.x / SNAP_BLOCK_SIZE) * SNAP_BLOCK_SIZE,
				y: Math.round(pointerPosition.y / SNAP_BLOCK_SIZE) * SNAP_BLOCK_SIZE,
				width: 100,
				height: 50,
				type: addMode,
				text: 'Task',
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
						title: 'Invoke Task',
						description: `Invoke Task ${id}`,
						type: TaskType.INVOKE_TASK,
						params: dummyParams
					}));
				}
			}

			// Reset the mode (with null)
			setAddMode(null);
		} else {
			// Deselect element/connector and disable context menu when the user clicks on an empty area
			const clickedOnEmpty = e.target === e.target.getStage();
			if (clickedOnEmpty) {
				setSelectedElement(null);
				setSelectedConnector(null);

				dispatch(setSelection(""));
				setContextMenu(INITIAL_CONTEXT_MENU);
			}
		}
	};

	// Handles element selection and connector creation
	const handleSymbolClick = (e: any) => {
		const elementId = e.target.id();
		const element: Element | null = getElement(elementId);

		if (element !== null) {
			// Store the selected symbol if connectMode is activated
			setSelectedElement(element);
			dispatch(setSelection(elementId));

			setContextMenu({ activated: true, top: element.y, left: (element.x + element.width + 8), context: QuickActionMenuContext.Element });

			if (selectedElement !== null && connectMode) {
				// Compute the Connector Points and store the connector, so it can be drawn
				const points = calcConnectorPoints(selectedElement, element);
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
		const snappingPosition: Point = {
			x: Math.round(e.target.x() / SNAP_BLOCK_SIZE) * SNAP_BLOCK_SIZE,
			y: Math.round(e.target.y() / SNAP_BLOCK_SIZE) * SNAP_BLOCK_SIZE
		};
		dispatch(updateElementPosition({id: elementId, x: snappingPosition.x, y: snappingPosition.y}));
		setDraggedElementId(elementId);
	};

	const getElement = (elementId: string): Element | null => {
		const mergedElements: Element[] = elements.concat(startElement, endElement);
		const element = mergedElements.find((element) => element.id === elementId);
		return (typeof element !== "undefined") ? element : null;
	};

	/**
	 * Creates a task element
	 */
	const createTask = () => {
		if (selectedElement !== null) {
			// Generate a "global" id for this task
			const id = uuidv4();

			// Create a new element on the right of the existing element
			const newElement: Element = {
				id: id,
				x: selectedElement.x + selectedElement.width + 32,
				y: selectedElement.y,
				width: 100,
				height: 50,
				type: ElementType.TASK,
				text: 'Invoke Task',
				connectors: []
			};
			dispatch(addElement(newElement));

			const dummyParams: InvokeTaskParams = {raml: "", resource: "", inputVariable: "", targetVariable: ""};
			dispatch(addTask({
				id: id,
				title: 'Invoke Task',
				description: `Invoke Task ${id}`,
				type: TaskType.INVOKE_TASK,
				params: dummyParams
			}));

			// Compute the Connector Points and store the connector, so it can be drawn
			const points = calcConnectorPoints(selectedElement, newElement);
			const connectorId = uuidv4();
			dispatch(addConnector({
				id: connectorId,
				points: points,
				source: selectedElement.id,
				target: newElement.id
			}));

			// Assign the connector to the source and target element
			dispatch(assignConnector({elementId: selectedElement.id, connectorId: connectorId}));
			dispatch(assignConnector({elementId: newElement.id, connectorId: connectorId}));
		}
	};

	/**
	 * Removes the selected element/connector from the model
	 */
	const deleteElement = () => {
		if (contextMenu.context === QuickActionMenuContext.Element && selectedElement !== null) {
			// Removes the selection
			setSelectedElement(null);
			dispatch(removeElement(selectedElement));
		} else if (contextMenu.context === QuickActionMenuContext.Connector && selectedConnector !== null) {
			// Removes the selection
			setSelectedConnector(null);
			dispatch(removeConnector(selectedConnector));
		}
		setContextMenu(INITIAL_CONTEXT_MENU);
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
					const newPoints = calcConnectorPoints(source, target);
					dispatch(updateConnector({id: connId, points: newPoints}));
				}
			});
			// Reset the dragged Element
			setDraggedElementId("");

			// Updates the selector position
			setSelectedElement(draggedElement);
		}
	}, [draggedElementId, connectors, dispatch, getElement]);

	// Highlight the selected symbol
	useEffect(() => {
		if (selectedElement !== null) {
			const {x, y, width, height} = selectedElement;
			switch (selectedElement.type) {
				case ElementType.START_EVENT:
				case ElementType.END_EVENT:
					const r = (height/2) + 8;
					setElementSelection([x - r, y + r, x + r, y + r, x + r, y - r, x - r, y - r, x - r, y + r]);
					break;

				case ElementType.TASK:
					const w = width + 4;
					const h = height + 4;
					setElementSelection([x - 4, y - 4, x + w, y - 4, x + w, y + h, x - 4, y + h, x - 4 , y - 4]);
					break;
			}
		} else {
			// Disables the selector when no element is currently selected
			setElementSelection([]);
		}
	}, [selectedElement]);

	// Disable the selection when the model changes
	useEffect(() => {
		setSelectedElement(null);
	}, [model]);

	/**
	 * Calculates the connector points for two elements
	 * @param from source element
	 * @param to target element
	 */
	const calcConnectorPoints = (from: Element, to: Element): number[] => {
		if (from.type === ElementType.TASK && to.type === ElementType.TASK) {
			return rectConnectorPoints(from, to);
		} else if (from.type === ElementType.START_EVENT && to.type === ElementType.TASK) {
			return eventConnectorPoints(from, to, true);
		} else if (from.type === ElementType.TASK && to.type === ElementType.END_EVENT) {
			return eventConnectorPoints(to, from, false);
		} else {
			return [];
		}
	}

	/**
	 * Calculate the connector points for two circles
	 * @param from source point
	 * @param to target point
	 * @param radius distance between the circle center point and the connector point
	 */
	const circleConnectorPoints = (from: Point, to: Point, radius: number): number[] => {
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		let angle = Math.atan2(-dy, dx);

		return [
			from.x - radius * Math.cos(angle + Math.PI),
			from.y + radius * Math.sin(angle + Math.PI),
			to.x - radius * Math.cos(angle),
			to.y + radius * Math.sin(angle)
		];
	};

	/**
	 * Calculate the connector points between two rectangles
	 * @param from source point
	 * @param to target point
	 */
	const rectConnectorPoints = (from: Element, to: Element): number[] => {
		const cf = { x: from.x + (from.width / 2), y: from.y + (from.height / 2) };
		const ct = { x: to.x + (to.width / 2), y: to.y + (to.height / 2)};
		const s = (cf.y - ct.y) / (cf.x - ct.x);

		const f = rectIntersectPoint(cf, ct, from.width, from.height, s);
		const t = rectIntersectPoint(ct, cf, to.width, to.height, s);

		return [
			f.x,
			f.y,
			t.x,
			t.y
		];
	};

	/**
	 * Calculates one intersection point based on the source element (cf)
	 * @param cf center of the source element
	 * @param ct center of the target element
	 * @param w element width
	 * @param h element height
	 * @param s slope
	 */
	const rectIntersectPoint = (cf: Point, ct: Point, w: number, h: number, s: number): Point => {
		if ((-h / 2) <= s * (w / 2) && s * (w / 2) <= (h / 2)) {
			// left intersect
			if (cf.x > ct.x) return { x: cf.x - (w / 2), y: cf.y - s * (w / 2)};
			// right intersect
			if (cf.x < ct.x) return { x: cf.x + (w / 2), y: cf.y + s * (w / 2)};
		}

		if ((-w / 2) <= ((h / 2) / s) && ((h / 2) / s) <= (w / 2)) {
			// top intersect
			if (cf.y > ct.y) return { x: cf.x - ((h / 2) / s), y: cf.y - (h / 2) };
			// bottom intersect
			if (cf.y < ct.y) return { x: cf.x + ((h / 2) / s), y: cf.y + (h / 2) };
		}
		return { x: 0, y: 0 };
	};

	useLayoutEffect(() => {
		if (stageRef.current) {
			setCanvasSize({width: stageRef.current.offsetWidth, height: 600});
		}
	}, [width, height]);

	/**
	 * Saves the changed model on the server
	 */
	const handleUpdateModel = () => {
		updateModel(model).then((result) => console.log(result));
	};

	/**
	 * Deletes the model on the server
	 */
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
				<Layer imageSmoothingEnabled={true}>
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
						<Circle key={element.id} id={element.id} x={element.x} y={element.y} radius={element.height / 3}
						        fill={"white"} stroke={"black"} strokeWidth={2}
						        draggable
						        onDragEnd={handleDragEnd}
						        onClick={handleSymbolClick}
						/>
					))}

					{endElement.map((element) => (
						<Circle key={element.id} id={element.id} x={element.x} y={element.y} radius={element.height / 3}
						        fill={"white"} stroke={"black"} strokeWidth={5}
						        draggable
						        onDragEnd={handleDragEnd}
						        onClick={handleSymbolClick}
						/>
					))}

					{elements.map((element) => (
						<Group key={element.id} id={element.id} x={element.x} y={element.y} draggable onDragEnd={handleDragEnd}>
							<Rect width={element.width} height={element.height} fill={"white"} stroke={"black"} strokeWidth={2} cornerRadius={10} />
							<Text text={element.text} id={element.id} align='center' verticalAlign='middle' fontSize={14} fill={"black"} width={element.width} height={element.height} onClick={handleSymbolClick}/>
						</Group>
					))}

					{connectors.map((conn) => (
						<Arrow key={conn.id} id={conn.id} points={conn.points} fill={"black"} stroke={"black"} onClick={handleConnectorClick} hitStrokeWidth={24}/>
					))}

					{elementSelection.length >= 1 &&
						<Line key="Selector" points={elementSelection} stroke='#b3e5fc' strokeWidth={2} dash={[5, 5]}/>
					}

					{selectedConnector !== null && selectedConnector!.points.length >= 1 &&
						<Arrow key="ConnectorSelector" points={selectedConnector!.points} fill='#29b6f6' stroke='#29b6f6'/>
					}

					{contextMenu.activated &&
						<Html divProps={{style: {position: 'absolute', inset: `${contextMenu.top}px auto auto ${contextMenu.left}px`}}}>
							<QuickActionMenu
								onDelete={deleteElement}
								onTaskCreate={createTask}
								context={contextMenu.context}
							/>
						</Html>
					}

					{/*{snappingGrid.map((snapLine, index) => (
						<Line key={index} points={snapLine} stroke="#ddd" strokeWidth={1} />
					))}*/}
				</Layer>
			</Stage>
		</Box>
	)
}
