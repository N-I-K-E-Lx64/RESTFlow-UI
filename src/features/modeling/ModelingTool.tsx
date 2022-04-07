import {Grid} from "@mui/material";
import {DetailModeling} from "./DetailModeling";
import {FlowModeling} from "./FlowModeling";

export function ModelingTool() {

	return (
		<Grid container spacing={1}>
			<Grid item xs={8}>
				<FlowModeling />
			</Grid>

			<Grid item xs={4}>
				<DetailModeling />
			</Grid>
		</Grid>
	);
}
