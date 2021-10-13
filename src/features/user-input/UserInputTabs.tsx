import {Box, Tab, Tabs, Typography} from "@mui/material";
import React, {SyntheticEvent, useState} from "react";
import {useGetSuspendedWorkflowsQuery} from "./userVariableApi";
import {Link, Route, useRouteMatch} from "react-router-dom";
import {UserInput} from "./UserInput";

export function UserInputTabs() {
	const { data, isLoading } = useGetSuspendedWorkflowsQuery();

	const [value, setValue] = useState(0);

	let { path, url } = useRouteMatch();

	const handleChange = (event: SyntheticEvent, newValue: number) => {
		setValue(newValue);
	}

	return (
		<Box sx={{ width: '100%' }}>
			<Tabs value={value} onChange={handleChange} aria-label="Suspended Workflows">
				{ data?.map((prop, index) => (
					<Tab label={prop} value={index} to={`${url}/${prop}`} component={Link} />
				))}
			</Tabs>

			<Route exact path={path}>
				<Typography variant="h2" align="center">Please select a Workflow</Typography>
			</Route>
			<Route path={`${path}/:workflowId`}>
				<UserInput />
			</Route>

		</Box>
	);
}
