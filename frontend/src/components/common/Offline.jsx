import { useNetworkStatus } from "../../contexts/NetworkStatusContext"

export function Offline({children}){
    const {isOffline} = useNetworkStatus()
    if (isOffline) return children
    return null
}