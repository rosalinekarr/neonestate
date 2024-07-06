import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Layout } from "./components";
import { About, Donate, EditRoom, Room, PrivacyPolicy, Profile } from "./pages";
import { FeatureFlagProvider, FirebaseProvider } from "./providers";
import "./index.css";
import Welcome from "./pages/Welcome";

const rootElem = document.getElementById("root");

if (rootElem)
  ReactDOM.createRoot(rootElem).render(
    <React.StrictMode>
      <FirebaseProvider>
        <FeatureFlagProvider>
          <RouterProvider
            router={createBrowserRouter([
              {
                path: "/",
                element: <Layout />,
                children: [
                  {
                    element: <Welcome />,
                    index: true,
                  },
                  {
                    element: <About />,
                    path: "/about",
                  },
                  {
                    element: <Donate />,
                    path: "/donate",
                  },
                  {
                    element: <Room />,
                    path: "/rooms/:name",
                  },
                  {
                    element: <EditRoom />,
                    path: "/rooms/:name/edit",
                  },
                  {
                    element: <PrivacyPolicy />,
                    path: "/privacy-policy",
                  },
                  {
                    element: <Profile />,
                    path: "/profile",
                  },
                  {
                    element: <Profile />,
                    path: "/users/:userId",
                  },
                ],
              },
            ])}
          />
        </FeatureFlagProvider>
      </FirebaseProvider>
      ,
    </React.StrictMode>,
  );
