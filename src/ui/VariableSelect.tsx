import {Controller, useFormContext} from "react-hook-form";
import {Box, MenuItem, TextField} from "@mui/material";
import {Variable} from "../model/types";

export interface VariableSelectProps {
	fieldName: string;
	label: string;
	variables: Variable[];
}

export const VariableSelect = (props : VariableSelectProps) => {
	const {control} = useFormContext();

	return (
		<Box>
			<Controller
				name={props.fieldName}
				control={control}
				defaultValue={""}
				render={({field}) =>
					<TextField select fullWidth label={props.label} {...field}>
						{props.variables.map((variable, index) => (
							<MenuItem key={index} value={index}>
								{variable.name}
							</MenuItem>
						))}
					</TextField>
				}
			/>
		</Box>
	);

}
