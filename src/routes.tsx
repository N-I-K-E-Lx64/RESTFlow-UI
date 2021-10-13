import {Dashboard, DeveloperBoard, ManageAccountsOutlined} from "@mui/icons-material";

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
	},
	{
		icon: <ManageAccountsOutlined />,
		primary: 'User Inputs',
		to: '/user-input'
	}
];

export default Routes;
