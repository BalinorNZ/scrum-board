const APIURL: string =
  process.env.MOPS_ENVIRONMENT !== "dev" ? "/api" : "http://localhost:8080/api"; //: "http://nbathgate.adi.co.nz:8080/api";
export default APIURL;
