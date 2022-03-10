import {Box, Button, Stack} from "@mui/material";
import {useForm, FormProvider} from "react-hook-form";
import {FormInput} from "../../ui/FormInput";
import {FormSelect} from "../../ui/FormSelect";
import {useEffect, useState} from "react";
import {selectModel} from "./modelSlice";
import {Task} from "../../model/types";
import {useAppSelector} from "../../app/hooks";
import {selectSelection} from "./selectionSlice";

export interface ValidationRules {
	required?: { value: boolean, message: string };
}

export function Details() {
	const methods = useForm();
	const {formState} = methods;
	const [taskModel, setTaskModel] = useState<Task | null>(null);

	const model = useAppSelector(selectModel);
	const selectionId = useAppSelector(selectSelection);

	// Update the task model, when the user changes the selection
	useEffect(() => {
		const task = model.tasks.find((task) => task.id === selectionId);
		if (typeof task !== "undefined") {
			setTaskModel(task);
		}
	}, [selectionId, model]);

	useEffect(() => {
		console.log(taskModel);
		if (taskModel !== null) {
			methods.reset(taskModel);
		}
	}, [taskModel, methods]);

	const handleModelUpdate = () => {
		methods.trigger().then(validationStatus => {
			console.log(validationStatus);
		});
	}

	const activityTypes = [
		{ value: 0, label: "Invoke Task" },
		{ value: 1, label: "Assign Task" }
	];

	const validationRules: ValidationRules[] = [
		{ required: { value: true, message: "This field is required!" } },
	];

	return (
		<Box sx={{ display: "flex", flexDirection: "column" }}>
			<FormProvider {...methods}>
				<Stack spacing={2}>
					<FormInput fieldName={"id"} label={"Task Id"} rules={validationRules[0]} />
					<FormSelect fieldName={"type"} label={"Task Type"} options={activityTypes} />
				</Stack>
			</FormProvider>

			<Button variant="text" onClick={handleModelUpdate}>
				Update Model
			</Button>
		</Box>
	)
}
