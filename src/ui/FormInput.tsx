import {Box, TextField} from "@mui/material";
import {Controller, useFormContext} from "react-hook-form";
import {ValidationRules} from "../features/modeling/DetailModeling";

export interface FormInputProps {
	fieldName: string;
	label: string;
	disabled?: boolean;
	multiline?: boolean;
	rows?: number;
	rules?: ValidationRules;
}

export function FormInput(props: FormInputProps) {
	const {control} = useFormContext();

	return (
		<Box>
			<Controller
				name={props.fieldName}
				control={control}
				defaultValue={""}
				rules={props.rules}
				render={({ field, formState }) =>
					<TextField
						error={!!formState.errors[props.fieldName]}
						helperText={formState.errors[props.fieldName]?.message}
						variant="outlined"
						label={props.label}
						disabled={props.disabled}
						multiline={props.multiline}
						rows={props.rows}
						fullWidth
						{...field} />
				}
			/>
		</Box>
	);
}
