// import './index.css';
// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import { GoogleOAuthProvider } from "@react-oauth/google";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <GoogleOAuthProvider clientId="57538733697-h8h0hmt7mvmtmenl8lhjmipk6v0uteub.apps.googleusercontent.com">
//       <App />
//     </GoogleOAuthProvider>
//   </React.StrictMode>
// );


import './index.css';
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* खात्री करा की googleClientId मध्ये व्हॅल्यू येतेय */}
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);