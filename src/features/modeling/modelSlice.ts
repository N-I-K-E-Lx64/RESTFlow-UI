import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../app/store";
import {
	Connector,
	Task,
	Element,
	PositionUpdate,
	ConnectorAssignUpdate,
	ConnectorUpdate,
	Model, GeneralModelData
} from "../../model/types";
import { NIL } from "uuid";

interface ModelState {
	model: Model
}

const initialState: ModelState = {
	model: {id: NIL, name: "", description: "", variables: [],  elements: [], connectors: [], tasks: []}
}

export const modelSlice = createSlice({
	name: "model",
	initialState,
	reducers: {
		setActiveModel: (state, action: PayloadAction<Model>) => {
			state.model = action.payload;
		},
		updateGeneralModelData: (state, action: PayloadAction<GeneralModelData>) => {
			const { name, description, variables } = action.payload;
			state.model.name = name;
			state.model.description = description;
			state.model.variables = variables;
		},
		addElement: (state, action: PayloadAction<Element>) => {
			state.model.elements.push(action.payload);
		},
		updateElementPosition: (state, action: PayloadAction<PositionUpdate>) => {
			const { id, x, y } = action.payload;
			const index = state.model.elements.findIndex((element: Element) => element.id === id);
			if (index !== -1) {
				state.model.elements[index].x = x;
				state.model.elements[index].y = y;
			}
		},
		assignConnector: (state, action: PayloadAction<ConnectorAssignUpdate>) => {
			const { elementId, connectorId } = action.payload;
			const index = state.model.elements.findIndex((element: Element) => element.id === elementId);
			if (index !== -1) {
				state.model.elements[index].connectors.push(connectorId);
			}
		},
		addConnector: (state, action: PayloadAction<Connector>) => {
			state.model.connectors.push(action.payload);
		},
		updateConnector: (state, action: PayloadAction<ConnectorUpdate>) => {
			const { id, points } = action.payload;
			const index = state.model.connectors.findIndex((connector: Connector) => connector.id === id);
			if (index !== -1) {
				state.model.connectors[index].points = points;
			}
		},
		addTask: (state, action: PayloadAction<Task>) => {
			state.model.tasks.push(action.payload);
		},
		updateTask: (state, action: PayloadAction<Task>) => {
			const { id } = action.payload;
			const index = state.model.tasks.findIndex((task: Task) => task.id === id);
			if (index !== -1) {
				state.model.tasks[index] = {...state.model.tasks[index], ...action.payload};
			}
		}
	}
});

export const {
	setActiveModel,
	updateGeneralModelData,
	addElement,
	updateElementPosition,
	assignConnector,
	updateConnector,
	addConnector,
	addTask,
	updateTask
} = modelSlice.actions;

export const selectModel = (state: RootState) => state.model.model;
export const selectVariables = (state: RootState) => state.model.model.variables;

export default modelSlice.reducer;
