import {Box, Tab, Tabs} from "@mui/material";
import {Link, Outlet} from "react-router-dom";
import {SyntheticEvent, useState} from "react";
import {Add} from "@mui/icons-material";
import {useAppDispatch} from "../../app/hooks";
import {setActiveModel, Model} from "./modelSlice";
import {useAddModelMutation, useGetModelsQuery} from "../../app/service/modelApi";
import {v4 as uuidv4} from "uuid";


export function ModelTabs() {
	const dispatch = useAppDispatch();
	const [currentModel, setCurrentModel] = useState(0);

	const { data: modelNames, error, isLoading } = useGetModelsQuery();
	const [addModel] = useAddModelMutation();

	const handleChange = (event: SyntheticEvent, selectedIndex: number) => {
		setCurrentModel(selectedIndex);
	};

	const handleCreateModel = () => {
		const dummyModel: Model = { id: uuidv4(), name: "Test", description: "", elements: [], connectors: [], tasks: []};
		dispatch(setActiveModel(dummyModel));
		addModel(dummyModel);
	};

	if (isLoading) {
		return (<h1>Loading...</h1>);
	}

	if (error) {
		return (<h1>Error</h1>);
	}

	return (
		<Box sx={{paddingBottom: 8}}>
			<Tabs value={currentModel} onChange={handleChange} selectionFollowsFocus>
				{ modelNames?.map((prop: Model, index: number) => (
					<Tab label={prop.name} value={index} to={`${prop.id}`} component={Link} key={index} />
				))}
				<Tab icon={<Add/>} aria-label="Create Workflow Model" onClick={handleCreateModel}/>
			</Tabs>

			<Outlet/>
		</Box>
	)
}
