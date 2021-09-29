import React from 'react';
import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import './App.css';
import {useGetMessagesQuery} from "./features/websocket/test";
import MiniDrawer from "./ui/MiniDrawer";

function App() {

	//const {data, error, isLoading} = useGetMessagesQuery();
	//console.log(data, error, isLoading);

	return (
		<div className="App">
		  <header className="App-header">
			<img src={logo} className="App-logo" alt="logo" />
			<MiniDrawer />
		  </header>
		</div>
	);
}

export default App;
