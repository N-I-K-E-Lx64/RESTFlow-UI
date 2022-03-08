import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../app/store";
import {Connector, Task, Element, PositionUpdate, ConnectorAssignUpdate, ConnectorUpdate} from "../../model/types";

export interface Model {
	name: string;
	description: string;
	elements: Element[];
	connectors: Connector[];
	tasks: Task[];
}

interface ModelState {
	models: Model[]
}

const initialState: ModelState = {
	models: []
}

export const modelSlice = createSlice({
	name: "model",
	initialState,
	reducers: {
		addModel: (state, action: PayloadAction<Model>) => {
			state.models.push(action.payload);
		},
		addElement: (state, action: PayloadAction<Element>) => {
			state.models[0].elements.push(action.payload);
		},
		updateElementPosition: (state, action: PayloadAction<PositionUpdate>) => {
			const { id, x, y } = action.payload;
			const index = state.models[0].elements.findIndex((element: Element) => element.id === id);
			if (index !== -1) {
				state.models[0].elements[index].x = x;
				state.models[0].elements[index].y = y;
			}
		},
		assignConnector: (state, action: PayloadAction<ConnectorAssignUpdate>) => {
			const { elementId, connectorId } = action.payload;
			const index = state.models[0].elements.findIndex((element: Element) => element.id === elementId);
			if (index !== -1) {
				state.models[0].elements[index].connectors.push(connectorId);
			}
		},
		addConnector: (state, action: PayloadAction<Connector>) => {
			state.models[0].connectors.push(action.payload);
		},
		updateConnector: (state, action: PayloadAction<ConnectorUpdate>) => {
			const { id, points } = action.payload;
			const index = state.models[0].connectors.findIndex((connector: Connector) => connector.id === id);
			if (index !== -1) {
				state.models[0].connectors[index].points = points;
			}
		},
		addTask: (state, action: PayloadAction<Task>) => {
			state.models[0].tasks.push(action.payload);
		},
	}
});

export const {addModel, addElement, updateElementPosition, assignConnector, updateConnector, addConnector, addTask} = modelSlice.actions;

export const selectModels = (state: RootState) => state.model.models;

export default modelSlice.reducer;
