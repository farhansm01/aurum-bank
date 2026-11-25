import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// Use these two hooks everywhere instead of plain useDispatch and useSelector.
// They already know the store's types so you get autocomplete.
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = (selector: (state: RootState) => unknown) =>
  useSelector(selector);
