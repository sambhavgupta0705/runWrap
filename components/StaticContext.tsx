"use client";
import { createContext, useContext } from "react";

/** True while rendering a slide for image export: skip animations and show final values. */
export const StaticContext = createContext(false);
export const useStatic = () => useContext(StaticContext);
