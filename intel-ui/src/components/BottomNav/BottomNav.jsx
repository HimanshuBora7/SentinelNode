import { useState } from "react";
import "./BottomNav.css";

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
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
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
