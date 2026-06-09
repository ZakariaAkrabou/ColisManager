export const applyTheme = (theme: "light" | "dark") => {
  localStorage.setItem("theme", theme);

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export const initializeTheme = () => {
  const savedTheme =
    (localStorage.getItem("theme") as "light" | "dark") || "light";

  applyTheme(savedTheme);
};