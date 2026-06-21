import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({children}) => {
   const [currentUser , setCurrentUser] = useState(null);

   useEffect(()=>{
     const userId = localStorage.getItem('userId');
     if(userId){
      setCurrentUser(userId);
     }
   },[]);

   return(
    <AuthContext.Provider value={{currentUser,setCurrentUser}}>
    {children}
   </AuthContext.Provider>
   )
   
}