import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./components/Home";
import ErrorPage from "./components/ErrorPage";
import Polls from "./components/Polls";
import Poll from "./components/Poll";
import Login from "./components/Login";
import EditPoll from "./components/EditPoll";
import ManageCatalouge from "./components/ManageCatalouge";
import SignUp from "./components/SignUp";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "/polls", element: <Polls /> },
      { path: "/polls/:id", element: <Poll /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <SignUp /> },
      { path: "/manage_polls/0", element: <EditPoll /> },
      { path: "/manage-catalouge", element: <ManageCatalouge /> },
      { path: "/manage_polls/:id", element: <EditPoll /> },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
