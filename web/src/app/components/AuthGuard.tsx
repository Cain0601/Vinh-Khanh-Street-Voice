// "use client"

// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'

// // Placeholder auth guard. Replace getUserRole with real auth integration.
// function getUserRole() {
//   // TODO: read from cookie/localStorage or call backend
//   return null as string | null
// }

// export default function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
//   const router = useRouter()
//   const [ready, setReady] = useState(false)
//   const [authorized, setAuthorized] = useState(false)

//   useEffect(() => {
//     const role = getUserRole()
//     if (!role) {
//       // redirect to home or login
//       router.push('/')
//       return
//     }
//     setAuthorized(allowedRoles.includes(role))
//     setReady(true)
//   }, [])

//   if (!ready) return <div>Checking permissions...</div>
//   if (!authorized) return <div>Access denied</div>
//   return <>{children}</>
// }
