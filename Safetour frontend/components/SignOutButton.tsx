import { useClerk } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity } from 'react-native'

export const SignOutButton = () => {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace('/sign-in') // 👈 send back to login page
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <TouchableOpacity
      onPress={handleSignOut}
      className="bg-purple-600 px-5 py-3 rounded-xl mt-20 items-center"
    >
      <Text className="text-white text-base font-semibold">
        Sign out
      </Text>
    </TouchableOpacity>
  )
}
