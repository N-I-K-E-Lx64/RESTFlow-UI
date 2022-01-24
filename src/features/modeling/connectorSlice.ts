import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../app/store";

export interface Connector {
	id: number;
	from: string;
	to: string;
	points: number[];
}

export interface ConnectorPointUpdate {
	id: number;
	points: number[];
}

interface ConnectorState {
	connectors: Connector[];
}

const initialState: ConnectorState = {
	connectors: [],
}

export const connectorSlice = createSlice({
	name: "connectors",
	initialState,
	reducers: {
		addConnector: (state, action: PayloadAction<Connector>) => {
			state.connectors.push(action.payload);
		},
		updateConnector: (state, action: PayloadAction<ConnectorPointUpdate>) => {
			const { id, points } = action.payload;
			state.connectors[id].points = points;
		}
	},
});

export const {addConnector, updateConnector} = connectorSlice.actions;

export const selectConnectors = (state: RootState) => state.connectors.connectors;

export default connectorSlice.reducer;
