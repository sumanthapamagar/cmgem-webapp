import { useNetworkStatus } from "../../contexts/NetworkStatusContext"

export function Online({children}){
    const {isOnline} = useNetworkStatus()
    if (isOnline) return children
    return null
}