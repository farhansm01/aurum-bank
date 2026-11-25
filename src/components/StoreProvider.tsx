"use client";

// This file wraps the whole app with the Redux store.
// It must be a client component ("use client") because Redux Provider
// uses React context, which only works on the client.
// The root layout is a server component, so we wrap children here instead.

import { Provider } from "react-redux";
import { store } from "@/store";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
