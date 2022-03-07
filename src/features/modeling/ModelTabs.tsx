import {Box, Tab, Tabs} from "@mui/material";
import {Link, Outlet} from "react-router-dom";
import {SyntheticEvent, useState} from "react";
import {Add} from "@mui/icons-material";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {addModel, selectModels} from "./modelSlice";

export function ModelTabs() {
	const dispatch = useAppDispatch();
	const [currentModel, setCurrentModel] = useState(0);

	const models = useAppSelector(selectModels);

	const handleChange = (event: SyntheticEvent, selectedIndex: number) => {
		setCurrentModel(selectedIndex);
	};

	const handleCreateModel = () => {
		dispatch(addModel({
			name: `Workflow${models.length + 1}`,
			description: "",
			symbols: [],
			connectors: [],
			tasks: []
		}));
	};

	return (
		<Box sx={{ paddingBottom: 8 }}>
			<Tabs value={currentModel} onChange={handleChange} selectionFollowsFocus>
				{ models?.map((prop, index) => (
					<Tab label={prop.name} value={index} to={`${prop.name}`} component={Link} key={index} />
				))}
				<Tab icon={<Add />} aria-label="Create Workflow Model" onClick={handleCreateModel}/>
			</Tabs>

			<Outlet />
		</Box>
	)
}
