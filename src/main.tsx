import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("react-external");
const dataset = rootElement?.dataset || {};

ReactDOM.createRoot(rootElement!).render(
	<React.StrictMode>
		<App {...dataset} />
	</React.StrictMode>,
);
