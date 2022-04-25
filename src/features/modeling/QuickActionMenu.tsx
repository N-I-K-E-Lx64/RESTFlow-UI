import {Grid, IconButton, Paper} from "@mui/material";
import {Delete, Task} from "@mui/icons-material";

export interface QuickActionMenuProps {
	context: QuickActionMenuContext;
	onDelete (): void;
	onTaskCreate (): void;
}

export enum QuickActionMenuContext {
	Element,
	Connector,
	None
}

export const QuickActionMenu = ({ onDelete, onTaskCreate, context } : QuickActionMenuProps) => {
	return (
		<Paper>
			<Grid container>
				<Grid item xs>
					<IconButton aria-label="delete-element" onClick={onDelete}>
						<Delete />
					</IconButton>
					{ context === QuickActionMenuContext.Element &&
						<IconButton aria-label="add-task" onClick={onTaskCreate}>
							<Task />
						</IconButton>
					}
				</Grid>
			</Grid>
		</Paper>
	);
}
