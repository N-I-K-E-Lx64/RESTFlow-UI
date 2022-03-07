import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {Box, Divider, Grid, IconButton, Paper, Stack} from "@mui/material";
import {Arrow, Circle, Layer, Line, Rect, Stage} from "react-konva";
import {Html} from "react-konva-utils";
import {CallMade, RadioButtonChecked, RadioButtonUnchecked, Task} from "@mui/icons-material";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import throttle from "lodash.throttle";
import {useWindowSize} from "usehooks-ts";
import {addConnector, addElement, addTask, Model, selectModels, updateElementPosition} from "./modelSlice";
import {Details} from "./Details";
import {v4 as uuidv4} from "uuid";
import {Connector, Element, ElementType, TaskType} from "../../model/types";

interface CanvasSize {
	width: number;
	height: number;
}

// TODO : https://konvajs.org/docs/events/Binding_Events.html For highlighting a shape

export function ModelingTool() {
	const dispatch = useAppDispatch();

	const {width, height} = useWindowSize();
	const [canvasSize, setCanvasSize] = useState<CanvasSize>({width: width, height: height});
	const [addMode, setAddMode] = useState<ElementType | null>(null);
	const [connectMode, setConnectMode] = useState<boolean>(false);
	const [selectedElement, setSelectedElement] = useState<Element | null>(null);

	const [selector, setSelector] = useState<number[]>([]);

	// TODO: Make this dynamic!
	const model: Model = useAppSelector(selectModels)[0];
	const elements: Element[] = model.symbols;
	const connectors: Connector[] = model.connectors;

	const stageRef = useRef<HTMLDivElement>(null);

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
				width: 30,
				height: 30,
				type: addMode
			}));

			dispatch(addTask({
				id: id,
				description: "Test",
				type: TaskType.INVOKE_TASK,
				params: ""
			}));

			// Reset the mode (with null)
			setAddMode(null);
		} else {
			// Deselect when the user clicks on empty area
			const clickedOnEmpty = e.target === e.target.getStage();
			if (clickedOnEmpty) setSelectedElement(null);
		}
	};

	const handleSymbolClick = (e: any) => {
		const symbolId = e.target.id();
		const symbol = elements.find((symbol) => symbol.id === symbolId);
		console.log(selectedElement);
		console.log("Select: " + symbolId);

		if (typeof symbol !== "undefined") {
			// Store the selected symbol if connectMode is activated
			setSelectedElement(symbol);

			if (selectedElement !== null && connectMode) {
				// Compute the Connector Points and store the connector, so it can be drawn
				const points = getConnectorPoints(selectedElement, symbol);
				dispatch(addConnector({id: connectors.length.toString() + 1, points: points}));

				// Deactivate Connect Mode
				setConnectMode(false);
			}
		}
	};

	// Updates the position of an element when the drag move ends
	const handleDragEnd = (e: any) => {
		dispatch(updateElementPosition({id: e.target.id(), x: e.target.x(), y: e.target.y()}));
	};

	// Highlight the selected symbol
	useEffect(() => {
		if (selectedElement !== null) {
			const {x, y, width, height} = selectedElement;
			const w = width + 4;
			const h = height + 4;
			setSelector([x - w, y + h, x + w, y + h, x + w, y - h, x - w, y - h, x - w, y + h]);

			console.log("Draw Selector");
		}
	}, [selectedElement]);

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
			// console.log(width, height);
			console.log(stageRef.current.offsetWidth, stageRef.current.offsetHeight);
			setCanvasSize({width: stageRef.current.offsetWidth, height: 600});
		}
	}, [width, height]);

	return (
		<Grid container spacing={1}>
			<Grid item xs={8} ref={stageRef}>
				<Box sx={{border: "medium dashed grey"}}>
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

										<Divider />

										<IconButton aria-label="ConnectTasks" onClick={() => setConnectMode(true)}>
											<CallMade />
										</IconButton>
									</Stack>
								</Paper>
							</Html>


							{elements.map((symbol) => (
								<Circle key={symbol.id} id={symbol.id} x={symbol.x} y={symbol.y} radius={symbol.width}
									        fill={"green"}
									        draggable
									        // onDragMove={throttledDragMove}
								            onDragEnd={handleDragEnd}
											onClick={handleSymbolClick}
								/>
							))}

							{connectors.map((conn) => (
								<Arrow key={conn.id} points={conn.points} fill={"black"} stroke={"black"}/>
							))}

							{selector.length >= 1 &&
								<Line key="Selector" points={selector} stroke='#b3e5fc' strokeWidth={2} dash={[5,5]} />
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
			</Grid>

			<Grid item xs={4}>
				<Details selectedElementId={selectedElement?.id}/>
			</Grid>
		</Grid>
	);
}
