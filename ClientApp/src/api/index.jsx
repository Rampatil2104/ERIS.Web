const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "/api/";

const request = async (method, url, body) => {
  const opts = { method, headers: {} };
  if (body !== undefined) { opts.headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
  const res = await fetch(url, opts);
  const isJSON = (res.headers.get("content-type") || "").includes("application/json");
  const payload = isJSON ? await res.json() : await res.text();
  if (!res.ok) throw { response: { status: res.status, data: payload } };
  return { status: res.status, data: payload };
};

export const ENDPOINTS = {
  ASSESSMENTPROFILE: "AssessmentProfile",
  ASSESSMENTDETAILS: "AssessmentDetails",
  PHOTO: "PHOTO",
  LOGIN: "Login",
};

export const createAPIEndpoint = (endpoint) => {
  const url = BASE_URL + endpoint + "/";
  return {
    fetchAll: () => request("GET", url),
    fetchById: (id) => request("GET", url + id),
    create: (data) => request("POST", url, data),
    update: (id, data) => request("PUT", url + id, data),
  };
};
