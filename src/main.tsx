import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./layout";
import ErrorPage from "./error-page";
import Home from "./routes/home";
import Settings from "./routes/settings";
import Login from "./routes/login";
import Dashboard from "./routes/dashboard";
import MainBooking from "./routes/main-booking";
import QueueManagement from "./routes/queue-management";
import CreateBooking from "./routes/create-booking";
import VerifyTicket from "./routes/verify-ticket";
import StaffManagement from "./routes/staff-management";
import StationConfiguration from "./routes/station-config";
import OvernightQueueManagement from "./routes/overnight-queue";
import { TauriProvider } from "./context/TauriProvider";
import { AuthProvider } from "./context/AuthProvider";
import "./styles.css";
import { SettingsProvider } from "./context/SettingsProvider";
import { SupervisorModeProvider } from "./context/SupervisorModeProvider";
import { InitProvider, useInit } from "./context/InitProvider";
import { NotificationProvider } from "./context/NotificationProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import { InitScreen } from "./components/InitScreen";
import { NotificationContainer } from "./components/NotificationToast";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <MainBooking />,
      },
      {
        path: "/dashboard", 
        element: <Dashboard />,
      },
      {
        path: "/booking",
        element: <MainBooking />,
      },
      {
        path: "/queue",
        element: <QueueManagement />,
      },
      {
        path: "/create-booking",
        element: <CreateBooking />,
      },
      {
        path: "/verify",
        element: <VerifyTicket />,
      },
      {
        path: "/staff-management",
        element: <StaffManagement />,
      },
      {
        path: "/station-config",
        element: <StationConfiguration />,
      },
      {
        path: "/overnight-queue",
        element: <OvernightQueueManagement />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/home",
        element: <Home />,
      },
    ],
  },
]);

const App: React.FC = () => {
  const { isInitialized, isInitializing, shouldShowLogin, completeInitialization } = useInit();

  if (isInitializing || !isInitialized) {
    return <InitScreen onInitComplete={completeInitialization} />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <NotificationContainer />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TauriProvider>
      <InitProvider>
        <NotificationProvider>
          <AuthProvider>
      <SettingsProvider>
              <SupervisorModeProvider>
                <App />
              </SupervisorModeProvider>
      </SettingsProvider>
          </AuthProvider>
        </NotificationProvider>
      </InitProvider>
    </TauriProvider>
  </React.StrictMode>
);
