import Config from 'react-native-config';

const SERVER_URL = async () => {
  let baseurl = Config.API_BASE_URL || "https://api.motospar.com";
  return baseurl;
}

export { SERVER_URL };
