import { getAppToken } from "../constants/GetAsyncStorageData";
import { SERVER_URL } from "../constants/SERVER_URL";

const postCommon = async (uri, body) => {

  try {
    const response = await fetch(
      `${await SERVER_URL()}/api/${uri}/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.log('error in postUSer...in Repo', err);
  }
};
const postFormdataCommon = async (uri, body) => {

  try {
    const response = await fetch(
      `${await SERVER_URL()}/api/${uri}/`,
      {
        method: 'POST',
        body: body,
      },
    );
    const result = await response.json();
    console.log("postFormdataCommon>>>", result)
    return result;
  } catch (err) {
    console.log('error in postUSer...in Repo', err);
  }
};
const postAuth = async (uri, body) => {

  try {
    console.log("here ", uri)
    const response = await fetch(
      `${await SERVER_URL()}/api/${uri}/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAppToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      },
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.log('error in postUAuth...in Repo', err);
  }
};

const postGoogle = async (uri, body) => {
  try {
    console.log("here ", body)
    const response = await fetch(
      `${await SERVER_URL()}/api/${uri}/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      },
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.log('error in postGoogleLinkdinLogin...in CommonREpo', err);
  }
}
const GetAuth = async (uri, body) => {

  try {
    const response = await fetch(
      `${await SERVER_URL()}/api/${uri}/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getAppToken()}`,
        },

      },
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.log('error in GetUAuth...in Repo', err);
  }
};
const GetCommon = async (uri, body) => {

  try {
    const response = await fetch(
      `${await SERVER_URL()}/api/${uri}/`,
      {
        method: 'GET',
      },
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.log('error in GetCommon...in Repo', err);
  }
};
const DelteAuth = async (uri, body) => {
  try {
    const response = await fetch(
      `${await SERVER_URL()}/api/${uri}/`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await getAppToken()}`,
        },

      },
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.log('error in DeleteUAuth...in Repo', err);
  }
};
const patchAuth = async (uri, body) => {
  console.log("here ", body)
  try {
    const response = await fetch(
      `${await SERVER_URL()}/api/${uri}/`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${await getAppToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      },
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.log('error in patchAuth...in Repo', err);
  }
};
const patchFormdatatAuth = async (uri, body) => {
  try {
    const response = await fetch(`${await SERVER_URL()}/api/${uri}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${await getAppToken()}`,
        // "Content-Type": "multipart/form-data",
      },
      body: body,
    });
    const result = await response.json();
    return result;
  } catch (err) {
    console.log("error in patchFormdatatAuth...in Repo", err);
  }
};
const postFormdatatAuth = async (uri, body) => {
  try {
    const response = await fetch(`${await SERVER_URL()}/api/${uri}/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await getAppToken()}`,
        // "Content-Type": "multipart/form-data",
      },
      body: body,
    });
    const result = await response.json();
    return result;
  } catch (err) {
    console.log("error in postFormdatatAuth...in Repo", err);
  }
};
export { postFormdataCommon, postCommon, postGoogle, postAuth, GetAuth, GetCommon, DelteAuth, patchAuth, patchFormdatatAuth, postFormdatatAuth };