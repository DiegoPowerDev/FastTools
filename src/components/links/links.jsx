import { useEffect, useState } from "react";
import LinksDesktop from "./linksDesktop";
import LinksMobile from "./linksMobile";

export default function Links({
  links,
  setLinks,
  theme,
  textTheme,
  setDisplayLinks,
  displayLinks,
  moveLink,
}) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      {isDesktop ? (
        <LinksDesktop
          links={links}
          setLinks={setLinks}
          theme={theme}
          moveLink={moveLink}
          textTheme={textTheme}
          setDisplayLinks={setDisplayLinks}
          displayLinks={displayLinks}
        />
      ) : (
        <LinksMobile
          links={links}
          setLinks={setLinks}
          theme={theme}
          textTheme={textTheme}
        />
      )}
    </>
  );
}
