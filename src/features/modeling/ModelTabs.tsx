import {
	Box, Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Tab,
	Tabs,
	TextField
} from "@mui/material";
import {Link, Outlet, useNavigate} from "react-router-dom";
import {SyntheticEvent, useEffect, useState} from "react";
import {Add} from "@mui/icons-material";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {setActiveModel, Model, selectModel} from "./modelSlice";
import {useAddModelMutation, useGetModelsQuery} from "../../app/service/modelApi";
import {v4 as uuidv4} from "uuid";
import {Controller, SubmitHandler, useForm} from "react-hook-form";

interface ModelNameInput {
	modelName: string
}

export function ModelTabs() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { handleSubmit, control } = useForm<ModelNameInput>();
	const [open, setOpen] = useState<boolean>(false);
	const [currentModel, setCurrentModel] = useState<number>(0);
	const selectedModel = useAppSelector(selectModel);

	const { data: models, error, isLoading } = useGetModelsQuery();
	const [addModel] = useAddModelMutation();

	const handleDialogOpen = () => {
		setOpen(true)
	};

	const handleDialogClose = () => {
		setOpen(false);
	};

	const handleChange = (event: SyntheticEvent, selectedIndex: number) => {
		setCurrentModel(selectedIndex);
		if (typeof models?.[selectedIndex] !== "undefined") {
			dispatch(setActiveModel(models?.[selectedIndex]));
		}
	};

	// Creates a dummy model with the provided name and navigate to it
	const onSubmit: SubmitHandler<ModelNameInput> = (data) => {
		console.log(data);
		const modelId = uuidv4();
		const dummyModel: Model = { id: modelId, name: data.modelName, description: "", elements: [], connectors: [], tasks: [] };
		dispatch(setActiveModel(dummyModel));
		addModel(dummyModel);
		// Deactivate the dialog
		setOpen(false);

		// Navigate to the created model
		navigate(`${modelId}`);
	};

	// When a new model is created set the tab-value accordingly
	useEffect(() => {
		const index = models?.findIndex((model: Model) => model.name === selectedModel.name);
		console.log(index);
		if (index !== -1 && typeof index !== "undefined") {
			setCurrentModel(index);
		}
	}, [models, selectedModel]);

	if (isLoading) {
		return (<h1>Loading...</h1>);
	}

	if (error) {
		return (<h1>Error</h1>);
	}

	return (
		<Box sx={{paddingBottom: 8}}>
			<Tabs value={currentModel} onChange={handleChange} selectionFollowsFocus>
				{ models?.map((prop: Model, index: number) => (
					<Tab label={prop.name} value={index} to={`${prop.id}`} component={Link} key={index} />
				))}
				<Tab icon={<Add/>} aria-label="Create Workflow Model" onClick={handleDialogOpen}/>
			</Tabs>

			<Outlet/>

			<Dialog open={open} onClose={handleDialogClose}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogTitle>Model Creation</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Enter a name for the model.
						</DialogContentText>

						<Controller
							name="modelName"
							control={control}
							defaultValue={""}
							rules={{ required: true }}
							render={({ field }) => (
								<TextField autoFocus margin="dense" label="Model Name" variant="standard" {...field} />
							)}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleDialogClose}>Cancel</Button>
						<Button type="submit">Create</Button>
					</DialogActions>
				</form>
			</Dialog>
		</Box>
	)
}
