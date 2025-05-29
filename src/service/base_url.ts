import axios from 'axios';
 const useApi = () => {

  const token = "2b10688d-0539-4dff-8d30-d9195b32f5d6"; 

  const apiUrl = axios.create({
    baseURL: 'http://41.221.195.121:8280/aliancaconnect',
    headers: {
        'Authorization': `Bearer ${token}`
      }
  });


  return apiUrl;
};


export { useApi}
