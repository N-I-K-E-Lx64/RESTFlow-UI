import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../app/store";

export interface Task {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	connectors: number[];
}

export interface TaskUpdate {
	id: string;
	connectorId: number;
}

export interface PositionUpdate {
	id: string;
	x: number;
	y: number;
}

export interface TaskState {
	tasks: Task[];
}

const initialState: TaskState = {
	tasks: [],
}

// TODO : https://redux-toolkit.js.org/usage/immer-reducers#reducers-and-immutable-updates

export const taskSlice = createSlice({
	name: "tasks",
	initialState,
	reducers: {
		addTask: (state, action: PayloadAction<Task>) => {
			state.tasks.push(action.payload);
		},
		updateTask: (state, action: PayloadAction<TaskUpdate>) => {
			const { id, connectorId } = action.payload;
			const index = state.tasks.findIndex((task: Task) => task.id === id);
			if (index !== -1) {
				state.tasks[index].connectors.push(connectorId);
			}
		},
		updateTaskPosition: (state, action: PayloadAction<PositionUpdate>) => {
			const { id, x, y } = action.payload;
			const index = state.tasks.findIndex((task: Task) => task.id === id);
			if (index !== -1) {
				state.tasks[index].x = x;
				state.tasks[index].y = y;
 			}
		},
		deleteTask: (state, action: PayloadAction<string>) => {
			state.tasks = state.tasks.filter((task: Task) => task.id !== action.payload);
		}
	},
});

export const {addTask, updateTask, updateTaskPosition, deleteTask} = taskSlice.actions;

export const selectTasks = (state: RootState) => state.tasks.tasks;

export default taskSlice.reducer;
