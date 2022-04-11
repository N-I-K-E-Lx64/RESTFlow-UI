import {MenuItem, Stack, TextField} from "@mui/material";
import {ChangeEvent, useState} from "react";
import {useAppSelector} from "../../app/hooks";
import {selectVariables} from "./modelSlice";
import {Variable} from "../../model/types";
import {FormInput} from "../../ui/FormInput";
import {VariableSelect} from "../../ui/VariableSelect";

export const InvokeForm = () => {
	const [inputType, setInputType] = useState<number>(0);

	const variables: Variable[] = useAppSelector(selectVariables);

	const handleInputTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
		console.log(event.target.value);
		setInputType(Number(event.target.value));
	};

	const inputTypes = [
		{ value: 0, label: "Variable" },
		{ value: 1, label: "User Parameter" }
	];

	return (
		<Stack spacing={2}>
			<TextField value={inputType} onChange={handleInputTypeChange} select fullWidth label="Input type">
				{inputTypes.map((item) => (
					<MenuItem key={item.value} value={item.value}>
						{item.label}
					</MenuItem>
				))}
			</TextField>

			<FormInput fieldName={"params.raml"} label={"RAML file"} />
			<FormInput fieldName={"params.resource"} label={"Resource"} />

			{ inputType === 0 && (
				<VariableSelect fieldName={"params.inputVariable"} label={"Input variable"} variables={variables} />
			)}

			<VariableSelect fieldName={"params.targetVariable"} label={"Target variable"} variables={variables} />
		</Stack>
	);
}
