import {AccountTree, Dashboard, DeveloperBoard, ManageAccountsOutlined} from "@mui/icons-material";
import {ReactElement} from "react";

export interface ListItemLinkProps {
	icon?: ReactElement;
	primary: string;
	to: string;
}

const Routes: ListItemLinkProps[] = [
	{
		icon: <Dashboard />,
		primary: 'Dashboard',
		to: '/',
	},
	{
		icon: <AccountTree />,
		primary: 'Modeling',
		to: '/modeling'
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
