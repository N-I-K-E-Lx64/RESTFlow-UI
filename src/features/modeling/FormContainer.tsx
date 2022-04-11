import {Task, TaskType} from "../../model/types";
import {Divider, Stack} from "@mui/material";
import {FormInput} from "../../ui/FormInput";
import {FormSelect} from "../../ui/FormSelect";
import {InvokeForm} from "./InvokeForm";
import {AssignForm} from "./AssignForm";

export interface FormContainerProps {
	task: Task;
}

export const FormContainer = ({ task }: FormContainerProps) => {

	const taskTypes = [
		{ value: 0, label: "Invoke Task" },
		{ value: 1, label: "Assign Task" }
	];

	return (
		<Stack spacing={2}>
			<FormInput fieldName={"id"} label={"Task Id"} disabled />
			<FormInput fieldName={"description"} label={"Task Description"} multiline rows={2} />
			<FormSelect fieldName={"type"} label={"Task Type"} options={taskTypes} />

			<Divider variant="middle" />

			{ task.type === TaskType.INVOKE_TASK && (
				<InvokeForm />
			)}
			{ task.type === TaskType.ASSIGN_TASK && (
				<AssignForm />
			)}
		</Stack>
	);
}
