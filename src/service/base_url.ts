import axios from 'axios';
 const useApi = () => {

  const token = "3eb96e29-664b-4bb6-8813-bb7549fcee19"; 

  const apiUrl = axios.create({
    baseURL: 'http://41.221.195.121:8280/aliancaconnect',
    headers: {
        'Authorization': `Bearer ${token}`
      }
  });


  return apiUrl;
};


export { useApi}
