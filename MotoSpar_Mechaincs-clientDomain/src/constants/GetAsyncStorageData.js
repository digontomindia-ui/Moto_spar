import { getDatafromAsync } from './AsyncStorageServices';

const getAppToken = async () => {
    try {
      var Token =await  getDatafromAsync('@usertoken') ;
      return Token;
    } catch (e) {
      console.log('error in getAppToken');
    }
  };
  
  

export {getAppToken,};
