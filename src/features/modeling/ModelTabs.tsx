import {Box, Tab, Tabs} from "@mui/material";
import {Link, Outlet} from "react-router-dom";
import {SyntheticEvent, useState} from "react";
import {Add} from "@mui/icons-material";

export function ModelTabs() {

	const [currentModel, setCurrentModel] = useState(0);
	const [test, setModels] = useState<string[]>(["workflow1"]);

	const handleChange = (event: SyntheticEvent, selectedIndex: number) => {
		if (selectedIndex === test.length) {
			setModels((prevState) => [...(prevState), `workflow${selectedIndex + 1}`]);
		}
		setCurrentModel(selectedIndex);
	}

	return (
		<Box sx={{ paddingBottom: 8 }}>
			<Tabs value={currentModel} onChange={handleChange} selectionFollowsFocus>
				{ test?.map((prop, index) => (
					<Tab label={prop} value={index} to={`${prop}`} component={Link} key={index} />
				))}
				<Tab icon={<Add />} aria-label="Create Workflow Model" />
			</Tabs>

			<Outlet />
		</Box>
	)
}
