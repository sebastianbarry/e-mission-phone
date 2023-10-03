import axios from 'axios'; // You can use Axios for making HTTP requests in React
import { useTranslation } from "react-i18next";

export const geti18nFileName = (defaultPath, fpFirstPart, fpSecondPart) => {
    const { t, i18n } = useTranslation(); //able to pull lang from this

    const lang = i18n.language; // You'll need to replace this with your language logic in React
    const i18nPath = 'i18n/';
    var defaultVal = defaultPath + fpFirstPart + fpSecondPart;
    
    if (lang !== 'en') {
      var url = i18nPath + fpFirstPart + "-" + lang + fpSecondPart;
      return axios.get(url)
        .then(function (result) {
          console.debug("Successfully found the " + url + ", result is " + JSON.stringify(result.data).substring(0, 10));
          return url;
        })
        .catch(function (err) {
          console.debug(url + " file not found, loading English version, error is " + JSON.stringify(err));
          return Promise.resolve(defaultVal);
        });
    }

    return Promise.resolve(defaultVal);
}

export const checkFile = (func) => {
    return new Promise(function (resolve, reject) {
      if (/^\//.test(func)) {
        reject('directory cannot start with /');
      }

      return axios.get(func)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
}

export function i18nUtils() {
    // const checkFile = checkFile
    // const geti18nFileName = geti18nFileName
}

export default i18nUtils;
