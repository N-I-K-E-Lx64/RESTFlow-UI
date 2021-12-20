import {
	Avatar,
	Box,
	Button, Card, CardContent, CardHeader, Grid,
	Stack,
	TextField,
	Typography
} from "@mui/material";
import {
	useGetUserParamsQuery,
	useGetVariablesQuery, UserParameterMessage,
	useUpdateUserParamMutation,
	Variable
} from "./userVariableApi";
import {useParams} from "react-router-dom";
import {TopicOutlined} from "@mui/icons-material";
import {Controller, SubmitHandler, useFieldArray, useForm} from "react-hook-form";
import React, {useEffect} from "react";
import assert from "assert";

export function UserInput() {
	const { instanceId } = useParams();
	assert(instanceId !== undefined);

	const {data: variables, isLoading: isLoadingVariables } = useGetVariablesQuery(instanceId);
	const {data: userParams, isLoading: isLoadingUserParams } = useGetUserParamsQuery(instanceId);

	const [updateUserParam] = useUpdateUserParamMutation();

	const {control, handleSubmit} = useForm();
	const {fields, append} = useFieldArray({control, name: 'params'});

	useEffect(() => {
		console.log(userParams);
		userParams?.forEach((param) => append({ value: param.value }));
	}, [append, userParams]);

	const onSubmit: SubmitHandler<any> = (data) => {
		userParams?.forEach((param: UserParameterMessage, index: number) => {
			param = { instanceId: param.instanceId, parameter: param.parameter, value: data.params[index].value };
			console.log(param);
			updateUserParam({ ...param });
		});
	}

	const getName = (name: string): string => {
		let index: number = parseInt(name.match(/\d+/g)![0], 10);

		if (typeof userParams !== "undefined") {
			const parameter: UserParameterMessage = userParams[index];
			if (parameter) return parameter.parameter;
		}

		return `params.${index}`;
	}

	if (isLoadingVariables || isLoadingUserParams) {
		return (
			<Typography variant="h2" align="center">Loading ...</Typography>
		);
	}

	return (
		<Box sx={{width: '100%', display: 'flex', flexDirection: 'row', marginTop: '8px'}}>
			<Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{flexGrow: 1}}>
				<Stack spacing={2} direction="column" alignItems="flex-start" justifyContent="flex-start">
					{fields?.map((item, index) => (
						<Controller
							key={item.id}
							name={`params[${index}].value`}
							control={control}
							defaultValue={""}
							render={({field: {name, value, onChange}}) =>
								<TextField variant="outlined" label={getName(name)} value={value} onChange={onChange} />
							}
						/>
					))}
					<Button variant="contained" type="submit" color="primary">Send</Button>
				</Stack>
			</Box>
			<Box sx={{ flexGrow: 1, padding: "8px" }}>
				<Grid container spacing={2}>
					{ variables?.map(( prop: Variable ) => (
						<Grid item xs={4}>
							<Card>
								<CardHeader
									avatar={
										<Avatar aria-label="icon">
											<TopicOutlined />
										</Avatar>
									}
									title={prop.name}
									subheader={prop.type + " -Variable"} />
								<CardContent>
									{ prop.value !== "null" &&
										<Typography variant="body2" color="text.secondary">prop.value</Typography>
									}
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>
			</Box>
		</Box>
	);
}
