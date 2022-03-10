import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { NIL } from "uuid";
import {RootState} from "../../app/store";

interface SelectionState {
	selectedElementId: string;
}

const initialState: SelectionState = {
	selectedElementId: NIL
}

// Used as a storage for the selected Element (FlowModeling - TaskModeling - Communication)
export const selectionSlice = createSlice({
	name: "selection",
	initialState,
	reducers: {
		setSelection: (state, action: PayloadAction<string>) => {
			state.selectedElementId = action.payload;
		}
	}
});

export const {setSelection} = selectionSlice.actions;

export const selectSelection = (state: RootState) => state.selection.selectedElementId;

export default selectionSlice.reducer;

