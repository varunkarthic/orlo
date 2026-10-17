import { renderToString } from "react-dom/server";
import { App } from "./App.tsx";
import { routes } from "./routes.ts";

export { routes };
export const render = (route: string) => renderToString(<App route={route} />);
