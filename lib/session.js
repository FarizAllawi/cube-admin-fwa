// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
export const sessionOptions = {
    //  cookieName is the name of our cookie
    cookieName: "UserCookie",
    // password parameter is the password for the cookie
    password: String(process.env.NEXT_PUBLIC_COOKIE_KEY),
    // secure parameter for cookieOptions is whether the data is encrypted. 
    // For production it’ll need to be encrypted but for testing it doesn’t.
    cookieOptions:
    {
        // 
        secure: process.env.NEXT_PUBLIC_COOKIE_KEY === "production"
    },
  };