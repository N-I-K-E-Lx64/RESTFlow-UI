interface Model {
	id: string;
	name: string;
	description: string;
	variables: string;
	processFlow: string;
	tasks: Task[];
	elements: Element[];
}

export interface Flow {
	taskRef: string;
	incoming: string;
	outgoing: string;
}

export enum ElementType {
	START_EVENT,
	END_EVENT,
	TASK
}

export enum TaskType {
	INVOKE_TASK,
	ASSIGN_TASK,
	SWITCH_TASK
}

export interface Task {
	id: string;
	description: string;
	type: TaskType;
	params: string;
}

export interface Element {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	type: ElementType;
	connectors: string[];
}

export interface Connector {
	id: string;
	points: number[];
	source: string;
	target: string;
}

interface FlowElement {
	id: string;
	incoming: string;
	outgoing: string;
}

export interface PositionUpdate {
	id: string;
	x: number;
	y: number;
}

export interface ConnectorAssignUpdate {
	elementId: string;
	connectorId: string;
}

export interface ConnectorUpdate {
	id: string;
	points: number[];
}


