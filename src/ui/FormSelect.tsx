import {Controller, useFormContext} from "react-hook-form";
import {Box, MenuItem, TextField} from "@mui/material";

export interface FormSelectProps {
	fieldName: string;
	label: string;
	options: { value: number, label: string}[];
}

export function FormSelect(props: FormSelectProps) {
	const {control} = useFormContext();

	return (
		<Box>
			<Controller
				name={props.fieldName}
				control={control}
				defaultValue={0}
				render={({field}) =>
					<TextField select label={props.label} {...field}>
						{props.options.map((item) => (
							<MenuItem key={item.value} value={item.value}>
								{item.label}
							</MenuItem>
						))}
					</TextField>
				}
				/>
		</Box>
	);
}
