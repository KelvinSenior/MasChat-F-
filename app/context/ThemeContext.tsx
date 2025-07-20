// Move this file to MasChat-main/context/ThemeContext.ts and update all imports accordingly.
import React from "react";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => children;
export const useTheme = () => ({});

// Default export to fix warning
export default ThemeProvider;