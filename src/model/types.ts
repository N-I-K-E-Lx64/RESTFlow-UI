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

export type TaskParams = InvokeTaskParams | AssignTaskParams | SwitchTaskParams;

export type Task = {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  params?: TaskParams;
  assignParams?: AssignTaskParams;
};

export type InvokeTaskParams = {
  type: TaskType.INVOKE_TASK;
  inputType: number;
  raml: string;
  resource: string | null;
  userParamId?: string;
  userParamType?: number;
  inputVariable?: string;
  targetVariable?: string;
};

export type AssignTaskParams = {
  type: TaskType.ASSIGN_TASK;
  value?: string;
  targetVariable?: string;
};

export type SwitchTaskParams = {
  type: TaskType.SWITCH_TASK;
  condition: {
    type?: number;
    var1?: string;
    var2?: string;
    param1?: Parameter;
    param2?: Parameter;
    isVariable1: boolean;
    isVariable2: boolean;
  };
  trueFlow?: string;
  falseFlow?: string;
};

export type GeneralTaskParams = {
  id: string;
  title: string;
  description: string;
  type: TaskType;
};

export interface Element {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ElementType;
  text?: string;
  connectors: {
    incoming: string;
    outgoing: string[];
  };
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

export interface Parameter {
  value?: string;
  type?: number;
}

export interface PositionUpdate {
  id: string;
  x: number;
  y: number;
}

export interface ConnectorAssignUpdate {
  elementId: string;
  connectorId: string;
  elementType: 'incoming' | 'outgoing';
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

export type FormEval = {
  evaluateForm: () => TaskParams;
  resetForm: (params: TaskParams) => void;
};
