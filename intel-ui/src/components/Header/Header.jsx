import "./header.css";
import { CircleUserRound } from "lucide-react";
import Logo from "../Logo";

export default function Header() {
  return (
    <header className="header">
      <div className="header__left"></div>

      <div className="header__logo">
        <Logo size={38} status="online" />
      </div>

      <div className="header__profile">
        <CircleUserRound size={26} />
      </div>
    </header>
  );
}
