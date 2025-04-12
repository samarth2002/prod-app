import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User } from "@/lib/server/models";
import { v4 as uuidv4 } from "uuid";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
        async jwt({ token, user }) {
            if (user?.email) {
                const existingUser = await User.findOne({ email: user.email });
                if (!existingUser) {
                    const newUser = new User({
                        _id: uuidv4(),
                        name: user.name,
                        email: user.email,
                    });
                    await newUser.save();
                    token._id = newUser._id;
                    token.email = newUser.email;
                } else {
                    token._id = existingUser._id;
                    token.email = existingUser.email;
                }
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user._id = token._id as string;
                session.user.email = token.email as string;
            }
            return session;
        },
    },
});

export { handler as GET, handler as POST };
