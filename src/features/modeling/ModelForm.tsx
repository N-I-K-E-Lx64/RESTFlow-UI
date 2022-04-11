import {Box, Button, Divider, IconButton, MenuItem, TextField} from "@mui/material";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {Add, Delete} from "@mui/icons-material";
import {selectModel, updateGeneralModelData} from "./modelSlice";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {useEffect} from "react";
import {GeneralModelData} from "../../model/types";

export const ModelForm = () => {
	const dispatch = useAppDispatch();
	const { control, handleSubmit, reset } = useForm<GeneralModelData>({
		defaultValues: {
			id: "",
			name: "",
			description: "",
			variables: [{ name: "result", type: 0 }]}
		});
	const { fields, append, remove } = useFieldArray({ control, name: "variables" });
	const model = useAppSelector(selectModel);

	useEffect(() => {
		console.log(model);
		const modelData: GeneralModelData = {id: model.id, name: model.name, description: model.description, variables: model.variables};
		reset(modelData);
	}, [model]);

	const onSubmit = (data: GeneralModelData) => {
		console.log(data);
		dispatch(updateGeneralModelData(data));
	};

	const variableTypes = [
		{ value: 0, label: "String" },
		{ value: 1, label: "Json"}
	];

	return (
		<Box sx={{ '& .MuiTextField-root': { m: 1} }}>
			<form onSubmit={handleSubmit(onSubmit)}>

				<Controller
					name="id"
					control={control}
					render={({ field }) =>
						<TextField variant="outlined" label="Model Id" disabled fullWidth {...field} />
					}/>

				<Controller
					name={"name"}
					control={control}
					render={({ field }) =>
						<TextField variant="outlined" label="Model Name" fullWidth {...field} />
					}/>

				<Controller
					name={"description"}
					control={control}
					render={({ field }) =>
						<TextField variant="outlined" label="Description" fullWidth multiline rows={2} {...field} />
					}/>

				<Divider variant="middle" />

				{ fields.map((field, index) => (
					<Box key={index} sx={{ display: "flex", flexDirection: "row", '& .MuiTextField-root': { width: '25ch' } }}>
						<Controller
							name={`variables.${index}.name`}
							control={control}
							render={({ field }) =>
								<TextField variant="outlined" label="Variable" {...field} />
							}/>

						<Controller
							name={`variables.${index}.type`}
							control={control}
							render={({field}) =>
								<TextField select label="Type" {...field}>
									{variableTypes.map((item) => (
										<MenuItem key={item.value} value={item.value}>
											{item.label}
										</MenuItem>
									))}
								</TextField>
							}/>

						<IconButton aria-label="delete variable" onClick={() => remove(index)}>
							<Delete />
						</IconButton>
					</Box>
				))}

				<IconButton aria-label="add variable" color="primary" onClick={() => append({ name: "", type: 0 })}>
					<Add />
				</IconButton>

				<Button type="submit" aria-label="save" variant="contained">Save</Button>
			</form>
		</Box>
	);
}
