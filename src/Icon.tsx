import type { CSSProperties } from "react";

export type IconName =
  | "arrow"
  | "arrowUp"
  | "search"
  | "close"
  | "bookmark"
  | "flame"
  | "clock"
  | "heart"
  | "repeat"
  | "reply"
  | "link"
  | "info"
  | "chip"
  | "code"
  | "people"
  | "check"
  | "radar"
  | "x";
const paths: Record<IconName, React.ReactNode> = {
  arrow: (
    <>
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </>
  ),
  arrowUp: (
    <>
      <path d="M6 18 18 6M6 6h12v12" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  bookmark: <path d="M6 4h12v17l-6-4-6 4V4Z" />,
  flame: (
    <path d="M13 3c1 5-5 6-3 10 2 0 4-2 4-4 8 7 3 13-2 13S2 16 6 10c0 4 2 4 2 4C5 8 13 8 13 3Z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  heart: (
    <path d="M20.8 4.6c-2.2-2.2-5.7-1.4-8.8 1.8C8.9 3.2 5.4 2.4 3.2 4.6-2 9.9 7 16.7 12 21c5-4.3 14-11.1 8.8-16.4Z" />
  ),
  repeat: (
    <>
      <path d="m16 3 4 4-4 4M4 11V9a2 2 0 0 1 2-2h14M8 21l-4-4 4-4m12 0v2a2 2 0 0 1-2 2H4" />
    </>
  ),
  reply: <path d="M21 11a9 9 0 0 1-9 9H4l-1 1 1-6a9 9 0 1 1 17-4Z" />,
  link: (
    <>
      <path
        d="m10 13 4-4m-6 8-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 10a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-1 1"
        transform="translate(1 0) scale(.9)"
      />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6m0-10v.1" />
    </>
  ),
  chip: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 2v4m6-4v4m-6 12v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4" />
      <rect x="10" y="10" width="4" height="4" />
    </>
  ),
  code: (
    <>
      <path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  radar: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 12 19 5" />
    </>
  ),
  x: (
    <>
      <path d="m4 3 12 18h4L8 3H4Zm0 18 7-8m2-2 7-8" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {paths[name]}
    </svg>
  );
}
