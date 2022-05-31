export interface Model {
  id: string;
  name: string;
  description: string;
  variables: Variable[];
  connectors: Connector[];
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
  TASK,
}

export enum TaskType {
  INVOKE_TASK,
  ASSIGN_TASK,
  SWITCH_TASK,
}

export enum VariableType {
  STRING,
  JSON,
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  invokeParams?: InvokeTaskParams;
  assignParams?: AssignTaskParams;
}

export type InvokeTaskParams = {
  inputType?: number;
  raml?: string;
  resource?: string;
  userParamId?: string;
  userParamType?: number;
  inputVariable?: string;
  targetVariable?: string;
};

export type AssignTaskParams = {
  value?: string;
  targetVariable?: string;
};

export interface Element {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ElementType;
  text?: string;
  connectors: string[];
}

export interface Connector {
  id: string;
  points: number[];
  source: string;
  target: string;
}

export interface Variable {
  name: string;
  type: VariableType;
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

export interface GeneralModelData {
  id: string;
  name: string;
  description: string;
  variables: Variable[];
}

export interface RAMLFile {
  fileName: string;
  resources: string[];
}

export interface FileUpload {
  modelId: string;
  files: FormData;
}
