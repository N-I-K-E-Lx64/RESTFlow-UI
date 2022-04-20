import {Box, Button} from "@mui/material";
import {useForm, FormProvider} from "react-hook-form";
import {useEffect, useState} from "react";
import {selectModel, updateTask} from "./modelSlice";
import {Task} from "../../model/types";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {selectSelection} from "./selectionSlice";
import {FormContainer} from "./FormContainer";
import {ModelForm} from "./ModelForm";

export interface ValidationRules {
	required?: { value: boolean, message: string };
}

export const validationRules: ValidationRules[] = [
	{ required: { value: true, message: "This field is required!" } },
];

export function DetailModeling() {
	const dispatch = useAppDispatch();
	const methods = useForm<Task>();
	const [taskModel, setTaskModel] = useState<Task | null>(null);

	const model = useAppSelector(selectModel);
	const selectionId = useAppSelector(selectSelection);

	// Update the task model, when the user changes the selection
	useEffect(() => {
		const task = model.tasks.find((task) => task.id === selectionId);
		(typeof task !== "undefined") ? setTaskModel(task) : setTaskModel(null);
	}, [selectionId, model]);

	// Resets all form fields when the task model changed
	useEffect(() => {
		console.log(taskModel);
		if (taskModel !== null) {
			methods.reset(taskModel);
		}
	}, [taskModel, methods]);

	/**
	 * Submits the form and check if all rules are successfully applied, get the form field values and update the task
	 * model accordingly.
	 */
	const handleModelUpdate = () => {
		methods.trigger().then(validationStatus => {
			console.log(validationStatus);
			console.log(methods.getValues());
			if (validationStatus && taskModel !== null) {
				dispatch(updateTask(methods.getValues()));
			}
		});
	};

	// Show the model form if no task or element is selected.
	if (taskModel === null) {
		return (
			<Box sx={{ display: "flex", flexDirection: "column" }}>
				<ModelForm />
			</Box>
		)
	}

	return (
		<Box sx={{ display: "flex", flexDirection: "column" }}>
			<FormProvider {...methods}>
				<FormContainer task={taskModel} />
			</FormProvider>

			<Button variant="text" onClick={handleModelUpdate}>
				Update Model
			</Button>
		</Box>
	)
}
