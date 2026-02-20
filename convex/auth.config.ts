export default {
    providers: [
        {
            // Production Clerk instance (ansar.family)
            domain: "https://clerk.ansar.family",
            applicationID: "convex",
        },
        {
            // Development Clerk instance
            domain: "https://just-hyena-17.clerk.accounts.dev",
            applicationID: "convex",
        },
    ],
};
