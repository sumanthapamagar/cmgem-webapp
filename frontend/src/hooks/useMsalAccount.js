import { useEffect, useState } from "react";
import { msalInstance } from "../lib/authConfig";

export const useMsalAccount =() =>  {
  const activeAccount = msalInstance.getActiveAccount();
  const [email, setEmail] = useState(null)
  const [name, setName] = useState(null)
  useEffect(()=> {
    if(activeAccount){
        setEmail(activeAccount.username)
        setName(activeAccount.name)
    }
  }) 
  return {email, name}
}