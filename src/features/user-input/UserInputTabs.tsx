import { Box, Tab, Tabs, Typography } from '@mui/material';
import React, { SyntheticEvent, useState } from 'react';
import { useGetSuspendedWorkflowsQuery } from '../../app/service/userVariableApi';
import { Outlet, useNavigate } from 'react-router-dom';

export function UserInputTabs() {
  const { data: workflows, isLoading } = useGetSuspendedWorkflowsQuery();
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState<number | boolean>(false);

  const handleChange = (event: SyntheticEvent, selectedIndex: number) => {
    const workflow = workflows?.at(selectedIndex);
    if (typeof workflow !== 'undefined') {
      // Set the tab index
      setCurrentTab(selectedIndex);
      // Navigate
      navigate(workflow);
    }
  };

  // When the user navigates to this the first tab should be selected by default
  /* useEffect(() => {
		if (!isLoading && typeof workflows !== "undefined") navigate(workflows[0])
	}, [workflows, isLoading]); */

  if (isLoading) {
    return (
      <Typography variant="h2" align="center">
        Loading ...
      </Typography>
    );
  }

  if (workflows?.length === 0) {
    return (
      <Typography variant="h2" align="center">
        No suspended workflows
      </Typography>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={currentTab}
        onChange={handleChange}
        aria-label="Suspended Workflows"
        selectionFollowsFocus
      >
        {workflows?.map((prop, index) => (
          <Tab label={prop} value={index} key={index} />
        ))}
      </Tabs>

      <Outlet />
    </Box>
  );
}
