const APIURL: string =
  process.env.NODE_ENV && process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:8080/api";

const fetcher = (url: string, method: string, headers?: any, body?: any) => (
  fetch(`${APIURL}/${url}`, {
    method: method,
    headers: {
      ...headers,
      'Authorization': `Bearer ${localStorage.getItem('scrumboard-token')}`
    },
    body: body,
  })
);

export default fetcher;
