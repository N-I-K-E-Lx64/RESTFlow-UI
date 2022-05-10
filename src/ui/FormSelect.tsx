import {Controller, useFormContext} from "react-hook-form";
import {Box, MenuItem, TextField} from "@mui/material";
import {ChangeEvent} from "react";

export interface FormSelectProps {
	fieldName: string;
	label: string;
	options: { value: number, label: string}[];
	onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
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
					<TextField select fullWidth label={props.label} {...field} onChange={(value: ChangeEvent<HTMLInputElement>) => {
						field.onChange(value);
						if (typeof props.onChange !== "undefined") props.onChange(value);
					}}>
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
