import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Logo, Menu } from "../components";
import {
  AuthProvider,
  ImagesProvider,
  PostsProvider,
  RoomsProvider,
  UsersProvider,
} from "../providers";
import { MenuIcon, ThemeIcon } from "./icons";
import styles from "./Layout.module.css";
import SSEProvider from "../providers/SSEProvider";

const FOOTER_LINKS: { label: string; path: string }[] = [
  { label: "About", path: "/about" },
  { label: "Privacy policy", path: "/privacy-policy" },
];

export default function Layout() {
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
