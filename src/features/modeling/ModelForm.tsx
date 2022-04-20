import {Box, Button, Divider, Stack} from "@mui/material";
import {useForm, FormProvider} from "react-hook-form";
import {selectModel, updateGeneralModelData} from "./modelSlice";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {useEffect} from "react";
import {GeneralModelData} from "../../model/types";
import {FormInput} from "../../ui/FormInput";
import {validationRules} from "./DetailModeling";
import {VariablesFieldArray} from "./VariablesFieldArray";

export const ModelForm = () => {
	const dispatch = useAppDispatch();
	const methods = useForm<GeneralModelData>({
		defaultValues: {
			id: "",
			name: "",
			description: "",
			variables: [{ name: "result", type: 0 }]}
		});
	const model = useAppSelector(selectModel);

	// Resets all form fields when the model has changed
	useEffect(() => {
		const modelData: GeneralModelData = {id: model.id, name: model.name, description: model.description, variables: model.variables};
		methods.reset(modelData);
	}, [model]);

	/**
	 * Submits the form and check if all rules are successfully applied, get the form field values and update the model
	 * accordingly.
	 */
	const handleModelUpdate = () => {
		methods.trigger().then(validationStatus => {
			console.log(validationStatus);
			console.log(methods.getValues());
			if (validationStatus) dispatch(updateGeneralModelData(methods.getValues()));
		});
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column" }}>
			<FormProvider {...methods}>
				<Stack spacing={2}>
					<FormInput fieldName={"id"} label={"Model Id"} disabled />
					<FormInput fieldName={"name"} label={"Model Name"} rules={validationRules[0]}/>
					<FormInput fieldName={"description"} label={"Description"} multiline rows={2} />

					<Divider variant="middle" />

					<VariablesFieldArray />

					<Divider variant="middle" />
				</Stack>

				<Button variant="text" onClick={handleModelUpdate}>
					Update Model
				</Button>
			</FormProvider>
		</Box>
	);
}
