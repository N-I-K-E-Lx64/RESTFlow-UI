import { v4 as uuidv4 } from 'uuid';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Box,
  Divider,
  IconButton,
  Paper,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
} from '@mui/material';
import {
  Arrow,
  Circle,
  Group,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
} from 'react-konva';
import { Html } from 'react-konva-utils';
import {
  CallMade,
  Delete,
  PlayArrow,
  RadioButtonChecked,
  RadioButtonUnchecked,
  Save,
  Task,
} from '@mui/icons-material';
import { useWindowSize } from 'usehooks-ts';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  useDeleteModelMutation,
  useUpdateModelMutation,
} from '../../app/service/modelApi';
import { setSelection } from './slices/selectionSlice';
import { QuickActionMenu, QuickActionMenuContext } from './QuickActionMenu';
import {
  Connector,
  Element,
  ElementType,
  Model,
  TaskType,
} from '../../model/types';
import {
  addConnector,
  addElement,
  addTask,
  assignConnector,
  removeConnector,
  removeElement,
  selectConnectors,
  selectElements,
  selectModel,
  updateConnector,
  updateElementPosition,
} from './slices/modelSlice';
import {
  connectorContextMenuPosition,
  eventConnectorPoints,
  Point,
  rectConnectorPoints,
} from '../../util/ConnectorPoints';
import { useNavigate } from 'react-router-dom';
import { CreateInstanceHandler } from '../../ui/CreateInstanceHandler';

interface CanvasSize {
  width: number;
  height: number;
}

interface ContextMenuParams {
  activated: boolean;
  top: number;
  left: number;
  context: QuickActionMenuContext;
}

const INITIAL_CONTEXT_MENU: ContextMenuParams = {
  activated: false,
  top: 0,
  left: 0,
  context: QuickActionMenuContext.None,
};

const SNAP_BLOCK_SIZE: number = 25;

export default function FlowModeling() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { width, height } = useWindowSize();

  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width, height });
  const [addMode, setAddMode] = useState<ElementType | null>(null);
  const [connectMode, setConnectMode] = useState<boolean>(false);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(
    null
  );
  const [draggedElementId, setDraggedElementId] = useState<string>('');

  const [elementSelection, setElementSelection] = useState<number[]>([]);
  const [contextMenu, setContextMenu] =
    useState<ContextMenuParams>(INITIAL_CONTEXT_MENU);

  const stageRef = useRef<HTMLDivElement>(null);
  const handlerRef = useRef<{ handleShowDialog: (modelId: string) => void }>(
    null
  );

  const [updateModel] = useUpdateModelMutation();
  const [deleteModel] = useDeleteModelMutation();

  const model: Model = useAppSelector(selectModel);
  const connectors = useAppSelector(selectConnectors);
  const elements = useAppSelector(selectElements);
  const startElement = elements.filter(
    (element) => element.type === ElementType.START_EVENT
  );
  const endElement = elements.filter(
    (element) => element.type === ElementType.END_EVENT
  );

  // console.log(model, connectors, elements);

  /* let snappingGrid : number[][] = [];

	for (var i = 0; i < width / SNAP_BLOCK_SIZE; i++) {
		snappingGrid.push([ Math.round(i * SNAP_BLOCK_SIZE) + 0.5, 0, Math.round(i * SNAP_BLOCK_SIZE) + 0.5, height]);
	}

	for (var j = 0; j < height / SNAP_BLOCK_SIZE; j++) {
		snappingGrid.push([0, Math.round(j * SNAP_BLOCK_SIZE), width, Math.round(j * SNAP_BLOCK_SIZE)]);
	} */

  /**
   * Calculates the connector points for two elements
   * @param from source element
   * @param to target element
   */
  const calcConnectorPoints = (from: Element, to: Element): number[] => {
    if (from.type === ElementType.TASK && to.type === ElementType.TASK) {
      return rectConnectorPoints(from, to);
    } else if (
      from.type === ElementType.START_EVENT &&
      to.type === ElementType.TASK
    ) {
      return eventConnectorPoints(from, to, true);
    } else if (
      from.type === ElementType.TASK &&
      to.type === ElementType.END_EVENT
    ) {
      return eventConnectorPoints(to, from, false);
    }
    return [];
  };

  /**
   * Searches for the specified element and either returns it or if it cannot be found return null
   */
  const getElement = useCallback(
    (elementId: string): Element | null => {
      const element = elements.find((element) => element.id === elementId);
      return typeof element !== 'undefined' ? element : null;
    },
    [elements]
  );

  /**
   * Searches for the specified connector and either returns it or if it cannot be found return null
   */
  const getConnector = useCallback(
    (connectorId: string): Connector | null => {
      const connector = connectors.find((conn) => conn.id === connectorId);
      return typeof connector !== 'undefined' ? connector : null;
    },
    [connectors]
  );

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

      // Compute the "snapped" click position
      const position: Point = {
        x: Math.round(pointerPosition.x / SNAP_BLOCK_SIZE) * SNAP_BLOCK_SIZE,
        y: Math.round(pointerPosition.y / SNAP_BLOCK_SIZE) * SNAP_BLOCK_SIZE,
      };

      // Create a new element on the click position based on the symbol type
      switch (addMode) {
        case ElementType.START_EVENT:
        case ElementType.END_EVENT: {
          dispatch(
            addElement({
              id,
              x: position.x,
              y: position.y,
              width: 50,
              height: 50,
              type: addMode,
              connectors: [],
            })
          );
          break;
        }
        case ElementType.TASK: {
          dispatch(
            addElement({
              id,
              x: position.x,
              y: position.y,
              width: 100,
              height: 50,
              type: ElementType.TASK,
              connectors: [],
            })
          );
          dispatch(
            addTask({
              id,
              title: 'Task',
              description: `Task ${id}`,
              type: TaskType.INVOKE_TASK,
            })
          );
          break;
        }
        default:
          console.error('Mode is not supported!');
      }

      // Reset the mode (with null)
      setAddMode(null);
    } else {
      // Deselect element/connector and disable context menu when the user clicks on an empty area
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelectedElement(null);
        setSelectedConnector(null);

        dispatch(setSelection(''));
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

      if (element.type === ElementType.TASK) {
        setContextMenu({
          activated: true,
          top: element.y + element.height / 2,
          left: element.x + element.width + 16,
          context: QuickActionMenuContext.Element,
        });
      } else if (
        element.type === ElementType.START_EVENT ||
        element.type === ElementType.END_EVENT
      ) {
        setContextMenu({
          activated: true,
          top: element.y,
          left: element.x + element.width / 2 + 8,
          context: QuickActionMenuContext.Element,
        });
      }

      if (selectedElement !== null && connectMode) {
        // Compute the Connector Points and store the connector, so it can be drawn
        const points = calcConnectorPoints(selectedElement, element);
        const connectorId = uuidv4();
        dispatch(
          addConnector({
            id: connectorId,
            points,
            source: selectedElement.id,
            target: elementId,
          })
        );

        // Assign the connector to the source and target element
        dispatch(
          assignConnector({ elementId: selectedElement.id, connectorId })
        );
        dispatch(assignConnector({ elementId, connectorId }));

        // Deactivate Connect Mode
        setConnectMode(false);
      }
    }
  };

  /**
   * Handles the click on a connector.
   * @param e Konva click event
   */
  const handleConnectorClick = (e: any) => {
    const connector = connectors.find((conn) => conn.id === e.target.id());
    if (typeof connector !== 'undefined') {
      // Highlight the selected connector
      setSelectedConnector(connector);
      // Calculates the position of the context menu
      const positionCM: Point = connectorContextMenuPosition(connector);
      setContextMenu({
        activated: true,
        top: positionCM.y - 20,
        left: positionCM.x - 20,
        context: QuickActionMenuContext.Connector,
      });
    }
  };

  /**
   * Updates the position and the selector position of the dragged element
   * @param e Konva drag event
   */
  const handleDragEnd = (e: any) => {
    const elementId = e.target.id();
    const snappingPosition: Point = {
      x: Math.round(e.target.x() / SNAP_BLOCK_SIZE) * SNAP_BLOCK_SIZE,
      y: Math.round(e.target.y() / SNAP_BLOCK_SIZE) * SNAP_BLOCK_SIZE,
    };
    dispatch(
      updateElementPosition({
        id: elementId,
        x: snappingPosition.x,
        y: snappingPosition.y,
      })
    );
    setDraggedElementId(elementId);
  };

  /**
   * Creates a task element
   */
  const createTask = () => {
    if (selectedElement !== null) {
      // Generate a "global" id for this task
      const id = uuidv4();

      const newTaskPosition: Point = {
        x: selectedElement.x + selectedElement.width + 32,
        y: selectedElement.y,
      };

      // Since Konva uses different reference points on Circles and Rects, the y position needs to be adjusted
      if (
        selectedElement.type === ElementType.START_EVENT ||
        selectedElement.type === ElementType.END_EVENT
      ) {
        newTaskPosition.y = selectedElement.y - selectedElement.height / 2;
      }

      // Create a new element on the right of the existing element
      const newElement: Element = {
        id,
        x: newTaskPosition.x,
        y: newTaskPosition.y,
        width: 100,
        height: 50,
        type: ElementType.TASK,
        text: 'Task',
        connectors: [],
      };
      dispatch(addElement(newElement));

      dispatch(
        addTask({
          id,
          title: 'Task',
          description: `Task ${id}`,
          type: TaskType.INVOKE_TASK,
        })
      );

      // Compute the Connector Points and store the connector, so it can be drawn
      const points = calcConnectorPoints(selectedElement, newElement);
      const connectorId = uuidv4();
      dispatch(
        addConnector({
          id: connectorId,
          points,
          source: selectedElement.id,
          target: newElement.id,
        })
      );

      // Assign the connector to the source and target element
      dispatch(assignConnector({ elementId: selectedElement.id, connectorId }));
      dispatch(assignConnector({ elementId: newElement.id, connectorId }));
    }
  };

  /**
   * Removes the selected element/connector from the model
   */
  const deleteElement = () => {
    if (
      contextMenu.context === QuickActionMenuContext.Element &&
      selectedElement !== null
    ) {
      // Removes the associated connectors!
      selectedElement.connectors.forEach((connectorId) =>
        dispatch(removeConnector(getConnector(connectorId)!))
      );
      // Remove the element!
      dispatch(removeElement(selectedElement));
      // Removes the selection
      setSelectedElement(null);
    } else if (
      contextMenu.context === QuickActionMenuContext.Connector &&
      selectedConnector !== null
    ) {
      // Removes the selection
      setSelectedConnector(null);
      dispatch(removeConnector(selectedConnector));
    }

    // Reset the context menu
    setContextMenu(INITIAL_CONTEXT_MENU);
  };

  // Connectors must be automatically adjusted after an element has been dragged
  useEffect(() => {
    // Updates the connectors accordingly
    const draggedElement = getElement(draggedElementId);
    if (draggedElement !== null) {
      draggedElement.connectors.forEach((connectorId: string) => {
        const connector = getConnector(connectorId);

        let source: Element | null;
        let target: Element | null;

        // Determines the source and target of the connector
        if (connector!.source === draggedElementId) {
          source = draggedElement;
          target = getElement(connector!.target);
        } else {
          source = getElement(connector!.source);
          target = draggedElement;
        }

        // Computes the new line points and store them in the state
        if (source !== null && target !== null) {
          const newPoints = calcConnectorPoints(source, target);
          dispatch(updateConnector({ id: connectorId, points: newPoints }));
        }
      });
      // Reset the dragged Element
      setDraggedElementId('');

      // Updates the selector position
      setSelectedElement(draggedElement);
    }
  }, [draggedElementId, dispatch, getElement, getConnector]);

  // Highlight the selected symbol
  useEffect(() => {
    if (selectedElement !== null) {
      const { x, y, width, height } = selectedElement;

      const r = height / 2;
      const w = width + 8;
      const h = height + 8;

      switch (selectedElement.type) {
        case ElementType.START_EVENT:
        case ElementType.END_EVENT:
          setElementSelection([
            x - r,
            y + r,
            x + r,
            y + r,
            x + r,
            y - r,
            x - r,
            y - r,
            x - r,
            y + r,
          ]);
          break;

        case ElementType.TASK:
          setElementSelection([
            x - 8,
            y - 8,
            x + w,
            y - 8,
            x + w,
            y + h,
            x - 8,
            y + h,
            x - 8,
            y - 8,
          ]);
          break;

        default:
          console.error(`Unsupported ElementType: ${selectedElement.type}`);
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

  useLayoutEffect(() => {
    if (stageRef.current) {
      setCanvasSize({ width: stageRef.current.offsetWidth, height: 600 });
    }
  }, [width, height]);

  /**
   * Saves the changed model on the server
   */
  const handleUpdateModel = () => {
    console.log(model);
    updateModel(model).then((result) => console.log(result));
  };

  /**
   * Deletes the model on the server
   */
  const handleDeleteModel = () => {
    deleteModel(model.id).then(() => navigate('/modeling'));
  };

  // Object containing the actions for the SpeedDial
  const actions = [
    { icon: <Save />, name: 'Save', action: handleUpdateModel },
    { icon: <Delete />, name: 'Delete', action: handleDeleteModel },
    {
      icon: <PlayArrow />,
      name: 'Play',
      action: () => handlerRef.current?.handleShowDialog(model.id),
    },
  ];

  return (
    <Box>
      <Box sx={{ border: 'medium dashed grey' }} ref={stageRef}>
        <Stage
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleStageClick}
        >
          <Layer imageSmoothingEnabled>
            <Html>
              <Paper
                sx={{
                  p: 1,
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                }}
              >
                <Stack spacing={1}>
                  <IconButton
                    aria-label="AddStartEvent"
                    onClick={() => setAddMode(ElementType.START_EVENT)}
                  >
                    <RadioButtonUnchecked />
                  </IconButton>
                  <IconButton
                    aria-label="AddEndEvent"
                    onClick={() => setAddMode(ElementType.END_EVENT)}
                  >
                    <RadioButtonChecked />
                  </IconButton>
                  <IconButton
                    aria-label="AddTask"
                    onClick={() => setAddMode(ElementType.TASK)}
                  >
                    <Task />
                  </IconButton>

                  <Divider />

                  <IconButton
                    aria-label="ConnectTasks"
                    onClick={() => setConnectMode(true)}
                  >
                    <CallMade />
                  </IconButton>
                </Stack>
              </Paper>
            </Html>

            <Html
              divProps={{
                style: { position: 'absolute', inset: 'auto 8px 8px auto' },
              }}
            >
              <SpeedDial
                ariaLabel="SpeedDial"
                icon={<SpeedDialIcon />}
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
              <Circle
                key={element.id}
                id={element.id}
                x={element.x}
                y={element.y}
                radius={element.height / 3}
                fill="white"
                stroke="black"
                strokeWidth={2}
                draggable
                onDragEnd={handleDragEnd}
                onClick={handleSymbolClick}
              />
            ))}

            {endElement.map((element) => (
              <Circle
                key={element.id}
                id={element.id}
                x={element.x}
                y={element.y}
                radius={element.height / 3}
                fill="white"
                stroke="black"
                strokeWidth={5}
                draggable
                onDragEnd={handleDragEnd}
                onClick={handleSymbolClick}
              />
            ))}

            {elements.map(
              (element) =>
                element.type === ElementType.TASK && (
                  <Group
                    key={element.id}
                    id={element.id}
                    x={element.x}
                    y={element.y}
                    draggable
                    onDragEnd={handleDragEnd}
                  >
                    <Rect
                      width={element.width}
                      height={element.height}
                      fill="white"
                      stroke="black"
                      strokeWidth={2}
                      cornerRadius={10}
                    />
                    <Text
                      text={element.text}
                      id={element.id}
                      align="center"
                      verticalAlign="middle"
                      fontSize={14}
                      fill="black"
                      width={element.width}
                      height={element.height}
                      onClick={handleSymbolClick}
                    />
                  </Group>
                )
            )}

            {connectors.map((conn) => (
              <Arrow
                key={conn.id}
                id={conn.id}
                points={conn.points}
                fill="black"
                stroke="black"
                onClick={handleConnectorClick}
                hitStrokeWidth={24}
              />
            ))}

            {elementSelection.length >= 1 && (
              <Line
                key="Selector"
                points={elementSelection}
                stroke="#b3e5fc"
                strokeWidth={2}
                dash={[5, 5]}
              />
            )}

            {selectedConnector !== null &&
              selectedConnector!.points.length >= 1 && (
                <Arrow
                  key="ConnectorSelector"
                  points={selectedConnector!.points}
                  fill="#29b6f6"
                  stroke="#29b6f6"
                />
              )}

            {contextMenu.activated && (
              <Html
                divProps={{
                  style: {
                    position: 'absolute',
                    inset: `${contextMenu.top}px auto auto ${contextMenu.left}px`,
                  },
                }}
              >
                <QuickActionMenu
                  onDelete={deleteElement}
                  onTaskCreate={createTask}
                  context={contextMenu.context}
                />
              </Html>
            )}

            {/* {snappingGrid.map((snapLine, index) => (
						<Line key={index} points={snapLine} stroke="#ddd" strokeWidth={1} />
					))} */}
          </Layer>
        </Stage>
      </Box>

      <CreateInstanceHandler ref={handlerRef} />
    </Box>
  );
}
