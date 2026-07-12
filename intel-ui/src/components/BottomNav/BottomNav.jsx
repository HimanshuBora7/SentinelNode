import { useState } from "react";
import "./BottomNav.css";
import { useNavigate } from "react-router-dom";

import { House, Search, Bell, SquarePen } from "lucide-react";
const navItems = [
  {
    id: "home",
    icon: House,
  },
  {
    id: "search",
    icon: Search,
  },
  {
    id: "alerts",
    icon: Bell,
  },
  {
    id: "publish",
    icon: SquarePen,
  },
];
export default function BottomNav() {
  const [activeNav, setActiveNav] = useState("home");
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === "publish") {
                navigate("/contribute"); // Routes to your new Substack editor!
              } else if (item.id !== "home") {
                alert("This feature is still in development.");
              } else {
                setActiveNav(item.id);
                navigate("/"); // Routes back to home feed
              }
            }}
            className={
              activeNav === item.id
                ? "bottom-nav__item active"
                : "bottom-nav__item"
            }
          >
            <Icon size={22} />
          </button>
        );
      })}
    </nav>
  );
}
