import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { IconButton, Logo, Menu } from "../components";
import {
  AuthProvider,
  ImagesProvider,
  PostsProvider,
  RoomsProvider,
  UsersProvider,
} from "../providers";
import { CloseIcon, MenuIcon, ThemeIcon } from "./icons";
import styles from "./Layout.module.css";
import SSEProvider from "../providers/SSEProvider";
import { useFeatureFlags } from "../hooks";

const FOOTER_LINKS: { label: string; path: string }[] = [
  { label: "About", path: "/about" },
  { label: "Privacy policy", path: "/privacy-policy" },
];

export default function Layout() {
  const { show_donate_call_to_action: callToDonateFlag } = useFeatureFlags();
  const [showCallToDonate, setShowCallToDonate] = useState(callToDonateFlag);
  const [showChannels, setShowChannels] = useState<boolean>(false);
  const [theme, setTheme] = useState<"light" | "dark">(
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );

  function handleToggleTheme() {
    setTheme((prevTheme) => {
      if (prevTheme === "light") return "dark";
      return "light";
    });
  }

  return (
    <div className={styles.wrapper} data-theme={theme}>
      <AuthProvider>
        <SSEProvider>
          <ImagesProvider>
            <UsersProvider>
              <RoomsProvider>
                <PostsProvider>
                  <header className={styles.header}>
                    <button
                      className={[
                        styles.menuButton,
                        ...(showChannels ? [styles.menuButtonActive] : []),
                      ].join(" ")}
                      onClick={() => setShowChannels((prevVal) => !prevVal)}
                    >
                      <MenuIcon />
                    </button>
                    <Logo />
                    <button
                      className={styles.menuButton}
                      onClick={handleToggleTheme}
                    >
                      <ThemeIcon />
                    </button>
                  </header>
                  {showCallToDonate && (
                    <div className={styles.callToDonate}>
                      <span className={styles.callToDonateText}>
                        Funds are running low! Please{" "}
                        <NavLink
                          className={styles.callToDonateLink}
                          to="/donate"
                        >
                          donate now
                        </NavLink>{" "}
                        to keep Neon Estate alive.
                      </span>
                      <IconButton
                        className={styles.callToDonateButton}
                        icon={CloseIcon}
                        onClick={() => setShowCallToDonate(false)}
                      />
                    </div>
                  )}
                  <main className={styles.main}>
                    <Menu
                      onClose={() => setShowChannels(false)}
                      open={showChannels}
                    />
                    <Outlet />
                  </main>
                  <footer className={styles.footer}>
                    {FOOTER_LINKS.map(({ label, path }) => (
                      <Link key={label} to={path}>
                        {label}
                      </Link>
                    ))}
                  </footer>
                </PostsProvider>
              </RoomsProvider>
            </UsersProvider>
          </ImagesProvider>
        </SSEProvider>
      </AuthProvider>
    </div>
  );
}
