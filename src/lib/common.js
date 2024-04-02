import React from 'react';

export const ErrorContext = React.createContext();

/*import { getAuth } from "firebase/auth";

export const getAuthToken = async () => {
    const auth = getAuth();
    const token = await auth.currentUser.getIdToken();
    return token;
}

export const getBasicHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
}

export const getCommonHeaders = async () => {
    const token = await getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}
*/

export const getErrorMessage = (err) => {
    return (err && err.response && err.response.data)? err.response.data.message : err.message;
}

export const getErrorsList = (err) => {
  let result = Object.values(err?.response?.data?.errors || []).flat();
  if (result && !!result.length) {
    return result;
  }
  return [getErrorMessage(err)];
}

export const BACKEND_DATA_URL = 'https://data.cashbackangel.com';
export const BACKEND_ARCHIVE_DATA_URL = 'https://data.cashbackangel.com/archive';

export const extractFloatNumber = (str) => {
    if (!str || !str.length) {
        return 0;
    }
    const regex = /[+-]?\d+(\.\d+)?/g;
    const work = str.match(regex);
    if (!work || !work.length) {
        return 0;
    }
    const floats = work.map(v => parseFloat(v));
    if (floats && floats.length) {
        return floats[0];
    }
    return 0;
};

export const containsIgnoreCase = (haystack, needle) => {
    if (haystack && !!haystack.length && needle && !!needle.length) {
        return haystack.toLowerCase().includes(needle.toLowerCase());
    }
    return false;
};

export const formatDate = (date) => { 
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day; 

    return [year, month, day].join('-');
};

export const formatDate_MM_DD = (date) => { 
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day; 

    return [month, day].join('-');
};

export const convert_YYYY_MM_DD_toDate = (dateStr) => {
    if (dateStr && dateStr.length) {
        var parts = dateStr.split('-');
        var result = new Date(parts[0], parts[1] - 1, parts[2]);
        return result;
    }
    return null;
}

export const downloadFile = ({ data, fileName, fileType }) => {
  const blob = new Blob([data], { type: fileType })

  const a = document.createElement('a')
  a.download = fileName
  a.href = window.URL.createObjectURL(blob)
  const clickEvt = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  })
  a.dispatchEvent(clickEvt)
  a.remove()
}

export const convertStringToCsv = (str) => {
  return JSON.stringify(str, (key, value) => ((value === null)? '' : value ));
};

export const exportToCsv = (headers, data, fileName) => {
  let dataHeaders = Object.values(headers).join(',');
  
  // Convert users data to a csv
  let dataCsv = data.reduce((acc, record) => {
    const keys = Object.keys(headers);
    const row = keys.map(key => convertStringToCsv(record[key]));
    acc.push(row.join(','))
    return acc;
  }, [])

  downloadFile({
    data: [dataHeaders, ...dataCsv].join('\n'),
    fileName,
    fileType: 'text/csv',
  })
}

export const isColumnVisibleCommon = (columnName, visibleColumns) => {
    if (!(columnName && columnName.length)) {
      return false;
    }
    if (typeof visibleColumns === 'undefined') {
      return true;
    }
    if (visibleColumns && visibleColumns.includes(columnName)) {
      return true;
    } else {
      return false;
    }
};

export const BACKEND_DRUPAL_API_URL = 'https://api.cashbackangel.com';

export const convertDateToUnixTimestamp = (date) => {
  if (!date) {
    date = new Date();
  }
  return Math.floor(date.getTime() / 1000);
};

// you may wish to deactivate storage settings during DEV mode - set this variable "true"
const SKIP_STORAGE = false;

export const storageGet = (key, defaultValue = null) => {
  if (SKIP_STORAGE) {
    return defaultValue;
  }
  let value = localStorage.getItem('cba-data-tools.' + key);
  if ((typeof value !== 'undefined') && (value !== null)) {
    value = JSON.parse(value);
    return value;
  }
  return defaultValue;
};

export const storageSet = (key, value) => {
  if (SKIP_STORAGE) {
    return;
  }
  if ((typeof value !== 'undefined') && (value !== null)) {
    localStorage.setItem('cba-data-tools.' + key, JSON.stringify(value));
  } else {
    localStorage.removeItem('cba-data-tools.' + key);
  }
};

