import { useContext } from "react";
import { Button } from "../ui";
import { ProjectContext } from "../../features/projects/projectContext";

export function OfflineProjectRefresh(){
    const {offlineProjectQuery} = useContext(ProjectContext)

    return (
        <Button plain onClick={offlineProjectQuery.refetch}>
            Refresh Offline Data
        </Button> 
    )

}