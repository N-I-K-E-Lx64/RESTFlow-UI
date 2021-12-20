import {
	AppBar,
	Box,
	CssBaseline,
	Drawer,
	List,
	ListItem, ListItemButton,
	ListItemIcon, ListItemText,
	Toolbar,
	Typography
} from "@mui/material";
import Routes, {ListItemLinkProps} from "../routes";
import React, {useState} from "react";
import {useNavigate, Outlet} from "react-router-dom";

export default function ClippedDrawer() {
	const navigate = useNavigate();

	const [selectedIndex, setSelectedIndex] = useState(0);

	const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, link: ListItemLinkProps, index: number) => {
		navigate(link.to);
		setSelectedIndex(index);
	}

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1}}>
				<Toolbar>
					<Typography variant="h6" noWrap component="div">
						RESTFlow
					</Typography>
				</Toolbar>
			</AppBar>
			<Drawer variant="permanent" sx={{ width: "240px", flexShrink: 0, [`& .MuiDrawer-paper`]: { width: "240px", boxSizing: "border-box"}}}>
				<Toolbar />
				<Box sx={{ overflow: "auto" }}>
					<List component="nav">
						{Routes.map((link, index) => (
							<ListItem key={link.primary} disablePadding>
								<ListItemButton
									selected={selectedIndex === index}
									onClick={(event) => handleClick(event, link, index)}>
									<ListItemIcon>{link.icon}</ListItemIcon>
									<ListItemText primary={link.primary} />
								</ListItemButton>
							</ListItem>
						))}
					</List>
				</Box>
			</Drawer>

			<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
				<Toolbar />
				<Outlet />
			</Box>
		</Box>
	);
}
