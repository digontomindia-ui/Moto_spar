import {getAppToken} from "../constants/GetAsyncStorageData";
import {SERVER_URL} from "../constants/SERVER_URL";

// const postUser = async (uri, body) => {
//     try {
//         const response = await fetch(`${await SERVER_URL()}/api/${uri}`, {
//             method: "POST",
//             headers: {"Content-Type": "application/json"},
//             body: JSON.stringify(body),
//         });
//         const result = await response.json();
//         console.log(">> API REsponse", result);
//         return result;
//     } catch (err) {
//         console.log("error in postUSer...in Repo", err);
//     }
// };
const postUser = async (uri, body) => {
    try {
        const response = await fetch(`${await SERVER_URL()}/api/${uri}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        // Check if response is not OK (handle 400, 500 errors)
        if (!response.ok) {
            const errorDetails = await response.json(); // May contain error details
            console.log("Error response from API", errorDetails);
            return {
                success: false,
                message: errorDetails || "Something went wrong",
            };
        }

        // Parse the response
        const result = await response.json();
        console.log(">> API Response", result);
        return result;
    } catch (err) {
        console.log("Error in postUser...in Repo", err);
        return {
            success: false,
            message: "Network error, please try again later.",
        };
    }
};

const postUserLogout = async (uri, body) => {
    try {
        const response = await fetch(`${await SERVER_URL()}/api/${uri}/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${await getAppToken()}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        const result = await response.json();
        console.log(">> API REsponse", result);
        return result;
    } catch (err) {
        console.log("error in postAuth...in Repo", err);
    }
};
const postCommon = async (uri, body) => {
    try {
        const response = await fetch(`${await SERVER_URL()}/api/${uri}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body),
        });
        const result = await response.json();
        return result;
    } catch (err) {
        console.log("error in postCommon..in CommonREpo", err);
    }
};
const getCommon = async (uri) => {
    try {
        const response = await fetch(`${await SERVER_URL()}/api/${uri}`, {
            method: "GET",
        });
        const result = await response.json();
        return result;
    } catch (err) {
        console.log("error in getCommon..in CommonREpo", err);
    }
};
const getAuth = async (uri) => {
    try {
        const response = await fetch(`${await SERVER_URL()}/api/${uri}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${await getAppToken()}`,
            },
        });
        const result = await response.json();
        return result;
    } catch (err) {
        console.log("error in getAuth..in CommonREpo", err);
    }
};
const PatchAuth = async (uri, body) => {
    try {
        const response = await fetch(`${await SERVER_URL()}/api/${uri}/`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${await getAppToken()}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        const result = await response.json();
        console.log(">> API REsponse", result);
        return result;
    } catch (err) {
        console.log("error in postAuth...in Repo", err);
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
        console.log(">> API REsponse", result);
        return result;
    } catch (err) {
        console.log("error in patchformdataauth...in Repo", err);
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
        console.log("data", body);
        console.log(">> API REsponse", result);
        return result;
    } catch (err) {
        console.log("error in postAuth...in Repo", err);
    }
};
export {postUser, postCommon, postUserLogout, getCommon, getAuth, PatchAuth, patchFormdatatAuth, postFormdatatAuth};
