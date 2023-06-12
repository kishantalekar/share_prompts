import { connectToDB } from "@utils/database";
import UserModel from "@models/users";

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handlers = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      const sessionUser = await UserModel.findOne({
        email: session.user.email,
      });
      session.user.id = sessionUser._id.toString();
      return session;
    },
    async signIn({ profile }) {
      try {
        await connectToDB();
        // console.log("from route profile", profile);
        //check if user already exists
        const userExits = await UserModel.findOne({ email: profile.email });
        //if not ,creata a new user
        if (!userExits) {
          await UserModel.create({
            email: profile.email,
            username: profile.name.replace(" ", "").toLowerCase(),
            image: profile.picture,
          });
        }
        return true;
      } catch (error) {
        console.log("error in creating a user");
        return false;
      }
    },
  },
});
export { handlers as GET, handlers as POST };
