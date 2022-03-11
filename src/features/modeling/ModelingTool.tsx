import {Grid} from "@mui/material";
import {Details} from "./Details";
import {FlowModeling} from "./FlowModeling";

export function ModelingTool() {

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
