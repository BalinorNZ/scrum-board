const APIURL: string =
  process.env.NODE_ENV == "production"
    ? "/api"
    : "http://nbathgate.adi.co.nz:8080";
export default APIURL;
