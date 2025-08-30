import { useOnline } from "../../hooks"

export function Offline({children}){
    const {isOffline} = useOnline()
    if (isOffline ) return children
    return null
}