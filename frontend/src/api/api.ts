import axios from "axios";

/*
Central API client for the NagaraIQ frontend.
All backend requests will go through this file.
*/

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ------------------------------
   Complaints
------------------------------ */

export const getComplaints = () => API.get("/complaints");


/* ------------------------------
   Bias Detection
------------------------------ */

export const getBiasData = () => API.get("/bias");


/* ------------------------------
   Hotspots
------------------------------ */

export const getHotspots = () => API.get("/hotspots");


/* ------------------------------
   Forecast
------------------------------ */

export const getForecast = () => API.get("/forecast");


/* ------------------------------
   Image Classification
------------------------------ */

export const classifyImage = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post("/classify-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


/* ------------------------------
   Users
------------------------------ */

export const getUsers = () => API.get("/users");


export default API;