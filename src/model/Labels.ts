const parameterTypes = [
  { value: 0, label: 'String' },
  { value: 1, label: 'Double' },
  { value: 2, label: 'Integer' },
  { value: 3, label: 'Json' },
];

const conditionTypes = [
  { value: 0, label: 'less' },
  { value: 1, label: 'greater' },
  { value: 2, label: 'greater or equal' },
  { value: 3, label: 'less or equal' },
  { value: 4, label: 'equals' },
  { value: 5, label: 'not equals' },
  { value: 6, label: 'string contains' },
  { value: 7, label: 'string not contains' },
];

const taskTypes = [
  { value: 0, label: 'Invoke Task' },
  { value: 1, label: 'Assign Task' },
  { value: 2, label: 'Switch Task' },
];

export { parameterTypes, conditionTypes, taskTypes };
