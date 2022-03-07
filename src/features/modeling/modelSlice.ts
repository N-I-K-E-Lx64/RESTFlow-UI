import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../app/store";
import {Connector, Task, Element, PositionUpdate} from "../../model/types";

export interface Model {
	name: string;
	description: string;
	symbols: Element[];
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
			state.models[0].symbols.push(action.payload);
		},
		updateElementPosition: (state, action: PayloadAction<PositionUpdate>) => {
			const { id, x, y } = action.payload;
			const index = state.models[0].symbols.findIndex((element: Element) => element.id === id);
			if (index !== -1) {
				state.models[0].symbols[index].x = x;
				state.models[0].symbols[index].y = y;
			}
		},
		addConnector: (state, action: PayloadAction<Connector>) => {
			state.models[0].connectors.push(action.payload);
		},
		addTask: (state, action: PayloadAction<Task>) => {
			state.models[0].tasks.push(action.payload);
		},
	}
});

export const {addModel, addElement, updateElementPosition, addConnector, addTask} = modelSlice.actions;

export const selectModels = (state: RootState) => state.model.models;

export default modelSlice.reducer;
