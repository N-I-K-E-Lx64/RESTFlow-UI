import {Grid} from "@mui/material";
import {useAppDispatch} from "../../app/hooks";
import {Details} from "./Details";
import {useGetModelQuery} from "../../app/service/modelApi";
import {useParams} from "react-router-dom";
import {FlowModeling} from "./FlowModeling";
import {useEffect} from "react";
import {setActiveModel} from "./modelSlice";

type ModelingToolProps = {
	modelId: string;
}

export function ModelingTool() {
	const dispatch = useAppDispatch();
	let { modelId } = useParams<ModelingToolProps>();

	const { data: model, isLoading, error } = useGetModelQuery(modelId!);

	// Whenever the user selects a tab the corresponding model is requested from the server and added to the state
	useEffect(() => {
		console.log("Change Model!");
		if (typeof model !== "undefined") {
			dispatch(setActiveModel(model));
		}
	}, [model]);

	if (isLoading) {
		return (<h1>Loading...</h1>);
	}

	if (error) {
		return (<h1>Error</h1>);
	}

	return (
		<Grid container spacing={1}>
			<Grid item xs={8}>
				<FlowModeling />
			</Grid>

			<Grid item xs={4}>
				<Details />
			</Grid>
		</Grid>
	);
}
