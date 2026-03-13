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

export const getComplaints = () => API.get("/api/complaints");
export const createComplaint = (data: any) => API.post("/api/complaints", data);


/* ------------------------------
   Bias Detection
------------------------------ */

export const getBiasData = () => API.get("/api/bias");


/* ------------------------------
   Hotspots
------------------------------ */

export const getHotspots = () => API.get("/api/hotspots");


/* ------------------------------
   Forecast
------------------------------ */

export const getForecast = () => API.get("/api/forecast");


/* ------------------------------
   Image Classification
------------------------------ */

export const classifyImage = (file: File) => {
   const formData = new FormData();
   formData.append("file", file);

   return API.post("/api/classify-image", formData, {
      headers: {
         "Content-Type": "multipart/form-data",
      },
   });
};


/* ------------------------------
   Users
------------------------------ */

export const getUsers = () => API.get("/api/users");


export default API;