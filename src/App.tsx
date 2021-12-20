import React from 'react';
import './App.css';
import MiniDrawer from "./ui/MiniDrawer";
import ClippedDrawer from "./ui/ClippedDrawer";

function App() {

	return (
		<div className="App">
		    <header>
			    {/* <MiniDrawer /> */}
			    <ClippedDrawer />
		    </header>
		</div>
	);
}

export default App;
