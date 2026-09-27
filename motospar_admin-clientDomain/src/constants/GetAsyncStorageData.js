const getAppToken = async () => {
  try {
    var Token = localStorage.getItem("usertoken");
    return Token;
  } catch (e) {
    console.log('error in getAppToken');
  }
};



export { getAppToken, };
