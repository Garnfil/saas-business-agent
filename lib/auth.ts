import { Session } from "next-auth"

export const auth = async (): Promise<Session | null> => {
  // This is a client-side only function that will be replaced by NextAuth's useSession
  // For server components, we'll use getServerSession
  return null
}
