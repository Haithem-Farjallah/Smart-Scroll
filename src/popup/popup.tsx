import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const Popup = () => {
  return <div>Popup</div>;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Popup />
  </StrictMode>
);
