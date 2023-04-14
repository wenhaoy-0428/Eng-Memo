import axios from "axios";

const API_GET_CSRF_TOKEN = "/api/auth-get-csrf-token/";

/**
 * sets CSRF Token inside cookie which allows subsequent axios requests to have CSRF token
 * @returns null
 */
export async function loadCSRFToken() {
  console.log("load CSRF token");
  try {
    await axios.get(API_GET_CSRF_TOKEN);
  } catch (e) {
    console.log(e);
  }
  return null;
}
