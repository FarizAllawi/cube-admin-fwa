import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";

const sessionOptions = {
  // cookie name
  cookieName: "eca_admin-cookie",
  // pw
  password: process.env.NEXT_PUBLIC_COOKIE_KEY,
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    maxAge: undefined,
    secure: process.env.NEXT_PUBLIC_COOKIE_KEY === "production",
  },
}

export function withSessionRoute(handler) {
  return withIronSessionApiRoute(handler, sessionOptions);
}

export function withSessionSsr(handler) {
  return withIronSessionSsr(handler, sessionOptions);
}