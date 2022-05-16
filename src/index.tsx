import React from 'react';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './app/store';
import * as serviceWorker from './serviceWorker';
import { UserInput } from './features/user-input/UserInput';
import { MonitoringGrid } from './features/monitoring-grid/Overview';
import { UserInputTabs } from './features/user-input/UserInputTabs';
import { Dashboard } from './features/dashboard/Dashboard';
import ModelingTool from './features/modeling/ModelingTool';
import ModelTabs from './features/modeling/ModelTabs';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Dashboard />} />
            <Route path="modeling" element={<ModelTabs />}>
              <Route path=":modelId" element={<ModelingTool />} />
            </Route>
            <Route path="monitoring" element={<MonitoringGrid />} />
            <Route path="user-input" element={<UserInputTabs />}>
              <Route path=":instanceId" element={<UserInput />} />
            </Route>
          </Route>
        </Routes>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
