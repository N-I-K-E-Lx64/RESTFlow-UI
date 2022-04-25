import {Task, TaskType} from "../../model/types";
import {Divider, Stack} from "@mui/material";
import {FormInput} from "../../ui/FormInput";
import {FormSelect} from "../../ui/FormSelect";
import {InvokeForm} from "./InvokeForm";
import {AssignForm} from "./AssignForm";
import {ChangeEvent, useState} from "react";

export interface FormContainerProps {
	task: Task;
}

export const FormContainer = ({ task }: FormContainerProps) => {
	const [taskType, setTaskType] = useState<number>(0);

	const handleTaskTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
		const newTaskType = Number(event.target.value);
		setTaskType(newTaskType);
	};

	const taskTypes = [
		{ value: 0, label: "Invoke Task" },
		{ value: 1, label: "Assign Task" }
	];

	return (
		<Stack spacing={2}>
			<FormInput fieldName={"id"} label={"Task Id"} disabled />
			<FormInput fieldName={"title"} label={"Task Name"} />
			<FormInput fieldName={"description"} label={"Task Description"} multiline rows={2} />
			<FormSelect fieldName={"type"} label={"Task Type"} options={taskTypes} test={handleTaskTypeChange}/>

			<Divider variant="middle" />

			{ taskType === TaskType.INVOKE_TASK && (
				<InvokeForm />
			)}
			{ taskType === TaskType.ASSIGN_TASK && (
				<AssignForm />
			)}
		</Stack>
	);
}
