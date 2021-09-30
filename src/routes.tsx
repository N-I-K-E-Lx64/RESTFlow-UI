import {Dashboard, DeveloperBoard} from "@mui/icons-material";

const Routes = [
	{
		icon: <Dashboard />,
		primary: 'Dashboard',
		to: '/',
	},
	{
		icon: <DeveloperBoard />,
		primary: 'Monitoring',
		to: '/monitoring',
	}
];

export default Routes;
