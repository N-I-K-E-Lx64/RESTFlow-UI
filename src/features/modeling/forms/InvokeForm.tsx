import {Stack} from "@mui/material";
import {ChangeEvent, useState} from "react";
import {useAppSelector} from "../../../app/hooks";
import {selectVariables} from "../modelSlice";
import {Variable} from "../../../model/types";
import {FormInput} from "../../../ui/FormInput";
import {VariableSelect} from "../../../ui/VariableSelect";
import {FormSelect} from "../../../ui/FormSelect";

export const InvokeForm = () => {
	const [inputType, setInputType] = useState<number>(0);

	const variables: Variable[] = useAppSelector(selectVariables);

	const handleInputTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
		setInputType(Number(event.target.value));
	};

	const inputTypes = [
		{ value: 0, label: "Variable" },
		{ value: 1, label: "User Parameter" }
	];

	return (
		<Stack spacing={2}>
			<FormSelect fieldName={"invokeParams.inputType"} label={"Input type"} options={inputTypes} onChange={handleInputTypeChange} />

			<FormInput fieldName={"invokeParams.raml"} label={"RAML file"} />
			<FormInput fieldName={"invokeParams.resource"} label={"Resource"} />

			{ inputType === 0 && (
				<VariableSelect fieldName={"invokeParams.inputVariable"} label={"Input variable"} variables={variables} />
			)}

			<VariableSelect fieldName={"invokeParams.targetVariable"} label={"Target variable"} variables={variables} />
		</Stack>
	);
}