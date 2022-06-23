import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NIL } from 'uuid';
import { RootState } from '../../../app/store';
import {
  Connector,
  ConnectorAssignUpdate,
  ConnectorUpdate,
  Element,
  ElementType,
  GeneralModelData,
  Model,
  PositionUpdate,
  Task,
} from '../../../model/types';

const initialState: Model = {
  id: NIL,
  name: '',
  description: '',
  variables: [],
  elements: [],
  connectors: [],
  tasks: [],
};

export const modelSlice = createSlice({
  name: 'model',
  initialState,
  reducers: {
    setActiveModel: (state, action: PayloadAction<Model>) => {
      const { id, name, description, variables, elements, connectors, tasks } =
        action.payload;
      state.id = id;
      state.name = name;
      state.description = description;
      state.variables = variables;
      state.elements = elements;
      state.connectors = connectors;
      state.tasks = tasks;
    },
    updateGeneralModelData: (
      state,
      action: PayloadAction<GeneralModelData>
    ) => {
      const { name, description, variables } = action.payload;
      state.name = name;
      state.description = description;
      state.variables = variables;
    },
    addElement: (state, action: PayloadAction<Element>) => {
      state.elements.push(action.payload);
    },
    removeElement: (state, action: PayloadAction<Element>) => {
      const { id, type } = action.payload;
      const index = state.elements.findIndex(
        (element: Element) => element.id === id
      );
      if (index !== -1) {
        state.elements.splice(index, 1);
        // If the element is a task remove the associated task as well
        if (type === ElementType.TASK) {
          const taskIndex = state.tasks.findIndex(
            (task: Task) => task.id === id
          );
          state.tasks.splice(taskIndex, 1);
        }
      }
    },
    updateElementPosition: (state, action: PayloadAction<PositionUpdate>) => {
      const { id, x, y } = action.payload;
      const index = state.elements.findIndex(
        (element: Element) => element.id === id
      );
      if (index !== -1) {
        state.elements[index].x = x;
        state.elements[index].y = y;
      }
    },
    assignConnector: (state, action: PayloadAction<ConnectorAssignUpdate>) => {
      const { elementId, connectorId, elementType } = action.payload;
      const index = state.elements.findIndex(
        (element: Element) => element.id === elementId
      );
      if (index !== -1) {
        if (elementType === 'incoming') {
          state.elements[index].connectors.incoming = connectorId;
        } else if (elementType === 'outgoing') {
          state.elements[index].connectors.outgoing.push(connectorId);
        }
      }
    },
    addConnector: (state, action: PayloadAction<Connector>) => {
      state.connectors.push(action.payload);
    },
    updateConnector: (state, action: PayloadAction<ConnectorUpdate>) => {
      const { id, points } = action.payload;
      const index = state.connectors.findIndex(
        (connector: Connector) => connector.id === id
      );
      if (index !== -1) {
        state.connectors[index].points = points;
      }
    },
    removeConnector: (state, action: PayloadAction<Connector>) => {
      // The connector must be removed from the model connectors array as well as from the connector array from each element.
      const { id, source, target } = action.payload;
      const index = state.connectors.findIndex(
        (connector: Connector) => connector.id === id
      );
      if (index !== -1) {
        state.connectors.splice(index, 1);
      }
      const sourceIndex = state.elements.findIndex(
        (element: Element) => element.id === source
      );
      const targetIndex = state.elements.findIndex(
        (element: Element) => element.id === target
      );
      if (sourceIndex !== -1 && targetIndex !== -1) {
        state.elements[sourceIndex].connectors.incoming = '';

        const targetConnectorIndex = state.elements[
          targetIndex
        ].connectors.outgoing.findIndex((connectorId) => connectorId === id);
        state.elements[sourceIndex].connectors.outgoing.splice(
          targetConnectorIndex,
          1
        );
      }
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const { id, title } = action.payload;
      const index = state.tasks.findIndex((task: Task) => task.id === id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }

      const elementIndex = state.elements.findIndex(
        (element: Element) => element.id === id
      );
      if (index !== -1) {
        state.elements[elementIndex].text = title;
      }
    },
  },
});

export const {
  setActiveModel,
  updateGeneralModelData,
  addElement,
  removeElement,
  updateElementPosition,
  addConnector,
  updateConnector,
  assignConnector,
  removeConnector,
  addTask,
  updateTask,
} = modelSlice.actions;

export const selectModel = (state: RootState) => state.model;
export const selectModelId = (state: RootState) => state.model.id;
export const selectVariables = (state: RootState) => state.model.variables;
export const selectElements = (state: RootState) => state.model.elements;
export const selectTasks = (state: RootState) => state.model.tasks;
export const selectConnectors = (state: RootState) => state.model.connectors;

export default modelSlice.reducer;
