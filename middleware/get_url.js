const DEV_URL = process.env.DEV_URL;
const PROD_URL = process.env.PROD_URL;
const IS_DEV = process.env.NETLIFY_DEV;

const baseURL = () => {
  return IS_DEV ? DEV_URL : PROD_URL;
};
