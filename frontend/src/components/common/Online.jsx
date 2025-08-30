import { useOnline } from "../../hooks"

export  function Online({children}){
    const {isOnline} = useOnline()
    if (isOnline ) return children
    return null
}