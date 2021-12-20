import {Box, Tab, Tabs, Typography} from "@mui/material";
import React, {SyntheticEvent, useEffect, useState} from "react";
import {useGetSuspendedWorkflowsQuery} from "./userVariableApi";
import {Link, Outlet, useNavigate} from "react-router-dom";

export function UserInputTabs() {
	const { data, isLoading } = useGetSuspendedWorkflowsQuery();
	const navigate = useNavigate();

	const [currentTab, setCurrentTab] = useState(0);

	const handleChange = (event: SyntheticEvent, newValue: number) => {
		setCurrentTab(newValue);
	};

	// When the user navigates to this the first tab should be selected by default
	useEffect(() => {
		if (!isLoading && typeof data !== "undefined") navigate(data[0])
	}, [data, isLoading]);

	if (isLoading) {
		return (
			<Typography variant="h2" align="center">Loading ...</Typography>
		);
	}

	// TODO : Display a message when no suspended workflow exist

	return (
		<Box sx={{ width: '100%' }}>
			<Tabs value={currentTab} onChange={handleChange} aria-label="Suspended Workflows" selectionFollowsFocus>
				{ data?.map((prop, index) => (
					<Tab label={prop} value={index} to={`${prop}`} component={Link} key={index} />
				))}
			</Tabs>

			<Outlet />
		</Box>
	);
}
