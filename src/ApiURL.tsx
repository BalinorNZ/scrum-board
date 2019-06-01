const APIURL: string =
  process.env.MOPS_ENVIRONMENT && process.env.MOPS_ENVIRONMENT !== "dev"
    ? "/api"
    : "http://localhost:8080/api";
export default APIURL;
