import { useEffect } from "react";
import { useNavigate, useRoutes } from 'react-router-dom';

import Dashboard  from "./components/dashboard/Dashboard";
import MyRepositories from "./components/dashboard/MyRepositories";
import Profile    from "./components/user/Profile";
import ExploreUsers from "./components/user/ExploreUsers";
import Login      from "./components/auth/Login";
import Signup     from "./components/auth/Signup";
import RepoPage   from "./components/repo/RepoPage";
import ResumePage from "./components/ai/ResumePage";
import ChangePassword from "./components/auth/ChangePassword";
import VerifyEmail from "./components/auth/VerifyEmail";
import NotFound from "./components/layout/NotFound";
import AuthSuccess from "./components/auth/AuthSuccess";
import PageTransition from "./components/layout/PageTransition";

import Status from "./components/layout/Status";
import Privacy from "./components/layout/Privacy";
import Terms from "./components/layout/Terms";

import { useAuth } from "./authContext";

const ProjectRoutes = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const userIdFromStorage = localStorage.getItem("userId");

        if (userIdFromStorage && !currentUser) {
            setCurrentUser(userIdFromStorage);
        }

        const allowedPaths = ["/auth", "/signup", "/auth/success", "/change-password", "/verify-email", "/status", "/privacy", "/terms"];
        const isAllowedPath = allowedPaths.some(p => window.location.pathname.startsWith(p));

        if (!userIdFromStorage && !isAllowedPath) {
            navigate("/auth");
        }

        if (userIdFromStorage && ["/auth", "/signup"].includes(window.location.pathname)) {
            navigate("/");
        }
    }, [currentUser, navigate, setCurrentUser]);

    let element = useRoutes([
        { path: "/",           element: <PageTransition><Dashboard /></PageTransition>   },
        { path: "/my-repos",   element: <PageTransition><MyRepositories /></PageTransition> },
        { path: "/auth",       element: <PageTransition><Login /></PageTransition>       },
        { path: "/signup",     element: <PageTransition><Signup /></PageTransition>      },
        { path: "/verify-email", element: <PageTransition><VerifyEmail /></PageTransition> },
        { path: "/auth/success", element: <PageTransition><AuthSuccess /></PageTransition> },
        { path: "/change-password", element: <PageTransition><ChangePassword /></PageTransition> },
        { path: "/profile",    element: <PageTransition><Profile /></PageTransition>     },
        { path: "/profile/:id",element: <PageTransition><Profile /></PageTransition>     },
        { path: "/explore",    element: <PageTransition><ExploreUsers /></PageTransition>},
        { path: "/repo/:id",   element: <PageTransition><RepoPage /></PageTransition>    },
        { path: "/ai/resume",  element: <PageTransition><ResumePage /></PageTransition>  },
        { path: "/status",     element: <PageTransition><Status /></PageTransition>      },
        { path: "/privacy",    element: <PageTransition><Privacy /></PageTransition>     },
        { path: "/terms",      element: <PageTransition><Terms /></PageTransition>       },
        { path: "/create",     element: <PageTransition><Dashboard /></PageTransition>   }, // legacy redirect
        { path: "*",           element: <NotFound />    }, // 404 — no transition needed
    ]);

    return element;
};

export default ProjectRoutes;
