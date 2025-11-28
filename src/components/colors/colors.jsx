import ColorsDesktop from "./colorsDesktop";
import ColorsMobile from "./colorsMobile";

export default function Colors({
  colors,
  setColors,
  theme,
  textTheme,
  setTheme,
  setTextTheme,
  moveColor,
  displayColors,
  setDisplayColors,
}) {
  return (
    <>
      <div className="w-full h-full md:block hidden">
        <ColorsDesktop
          moveColor={moveColor}
          displayColors={displayColors}
          setDisplayColors={setDisplayColors}
          colors={colors}
          setColors={setColors}
          theme={theme}
          textTheme={textTheme}
          setTextTheme={setTextTheme}
          setTheme={setTheme}
        />
      </div>
      <div className="w-full h-full block md:hidden">
        <ColorsMobile
          moveColor={moveColor}
          displayColors={displayColors}
          setDisplayColors={setDisplayColors}
          colors={colors}
          setColors={setColors}
          theme={theme}
          textTheme={textTheme}
          setTextTheme={setTextTheme}
          setTheme={setTheme}
        />
      </div>
    </>
  );
}
