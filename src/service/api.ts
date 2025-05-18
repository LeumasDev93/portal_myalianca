import axios from 'axios';
import { useSession } from "next-auth/react";
 const useApi = () => {
  const { data: session } = useSession();

 
  const api = axios.create({
    baseURL: 'https://aliancacvtest.rtcom.pt/anywhere/api/v1/private/externalsystem',
    headers: {
        'Authorization': `Bearer ${session?.user?.accessToken}`
      }
  });


  return api;
};



export { useApi}
