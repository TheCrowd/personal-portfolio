import React from "react";
import {
  BrowserRouter,
  createBrowserRouter,
  Link,
  RouterProvider,
} from "react-router-dom";
import Home from "./components/Home";
import Experience from "./components/Experience";
import "./App.css";

const router = createBrowserRouter([
  {
    path: "/personal-portofolio",
    element: <Home />,
  },
  {
    path: "/experience",
    element: <Experience />,
  },
]);

function App() {
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
