import React, {forwardRef, ReactElement, useMemo, useState} from "react";
import {
	Box,
	CssBaseline,
	CSSObject,
	Divider,
	IconButton,
	List, ListItem, ListItemIcon, ListItemText,
	styled,
	Theme,
	Toolbar,
	Typography,
	useTheme
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, {AppBarProps as MuiAppBarProps} from "@mui/material/AppBar";

import MenuIcon from "@mui/icons-material/Menu";
import Routes from "../routes";
import {Link as RouterLink, LinkProps as RouterLinkProps, Outlet} from "react-router-dom";
import {ChevronLeft, ChevronRight} from "@mui/icons-material";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
	width: drawerWidth,
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	}),
	overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	overflowX: 'hidden',
	width: `calc(${theme.spacing(7)} + 1px)`,
	[theme.breakpoints.up('sm')]: {
		width: `calc(${theme.spacing(9)} + 1px)`,
	},
});

const DrawerHeader = styled('div')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'flex-end',
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
	open?: boolean;
}

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
	zIndex: theme.zIndex.drawer + 1,
	transition: theme.transitions.create(['width', 'margin'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
		marginLeft: drawerWidth,
		width: `calc(100% - ${drawerWidth}px)`,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
	({ theme, open }) => ({
		width: drawerWidth,
		flexShrink: 0,
		whiteSpace: 'nowrap',
		boxSizing: 'border-box',
		...(open && {
			...openedMixin(theme),
			'& .MuiDrawer-paper': openedMixin(theme),
		}),
		...(!open && {
			...closedMixin(theme),
			'& .MuiDrawer-paper': closedMixin(theme),
		}),
	}),
);

interface ListItemLinkProps {
	icon?: ReactElement;
	primary: string;
	to: string;
}

function ListItemLink(props: ListItemLinkProps) {
	const { icon, primary, to } = props;

	const renderLink = useMemo(() => forwardRef<HTMLAnchorElement, Omit<RouterLinkProps, 'to'>>(
		function Link (itemProps, ref) {
			return <RouterLink to={to} ref={ref} {...itemProps} role={undefined} />;
		}),
		[to],
		);

	return (
		<li>
			<ListItem button component={renderLink} key={primary}>
				{icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
				<ListItemText primary={primary} />
			</ListItem>
		</li>
	);
}

export default function MiniDrawer() {
	const theme = useTheme();
	const [open, setOpen] = useState(false);

	const handleDrawerOpen = () => setOpen(true);
	const handleDrawerClose = () => setOpen(false);


	return (
		<Box sx={{ display: 'flex' }}>
			<CssBaseline />
			<AppBar position="fixed" open={open}>
				<Toolbar>
					<IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerOpen} edge="start"
						sx={{marginRight: '36px', ...(open && { display: 'none'})}}>
						<MenuIcon/>
					</IconButton>
					<Typography variant="h6" noWrap component="div">
						RESTFlow
					</Typography>
				</Toolbar>
			</AppBar>
			<Drawer variant="permanent" open={open}>
				<DrawerHeader>
					<IconButton onClick={handleDrawerClose}>
						{theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft /> }
					</IconButton>
				</DrawerHeader>
				<Divider/>
				<List>
					{Routes.map((prop, key) => (
						<ListItemLink primary={prop.primary} to={prop.to} icon={prop.icon} key={key}/>
					))}
				</List>
			</Drawer>

			<Box component="main" sx={{ flexGrow: 1, paddingLeft: '16px', paddingRight: '16px' }} >
				<DrawerHeader />
				<Box>
					<Outlet />
				</Box>
			</Box>
		</Box>
	);
}
