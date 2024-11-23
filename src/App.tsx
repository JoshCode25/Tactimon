import React from 'react';
import { GameProvider } from './store/GameContext';
import { GameMap } from './components/Map/GameMap';

function App() {
	return (
		<GameProvider>
			<GameMap />
		</GameProvider>
	);
}

export default App;
