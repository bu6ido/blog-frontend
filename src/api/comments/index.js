//import { applyPagination } from 'src/utils/apply-pagination';
//import { applySort } from 'src/utils/apply-sort';
import { deepCopy } from 'lib/deep-copy';
import useSWR from 'swr'
import axios from 'lib/axios'

//import { customer, customers, emails, invoices, logs } from './data';
//import axios from 'axios';
//import { BACKEND_FIREBASE_URL } from "src/config";
//import { getCommonHeaders } from 'lib/common';

class CommentsApi {
  async getComments(request = {}) {
    const { filters, page, rowsPerPage, sortBy, sortDir } = request;
    let params = {};
    
    if (typeof filters !== 'undefined') {
      /*data = data.filter((user) => {
        if (typeof filters.query !== 'undefined' && filters.query !== '') {
          let queryMatched = false;
          const properties = ['email', 'name', 'role'];

          properties.forEach((property) => {
            if (user[property].toLowerCase().includes(filters.query.toLowerCase())) {
              queryMatched = true;
            }
          });

          if (!queryMatched) {
            return false;
          }
        }

        if (typeof filters.hasAcceptedMarketing !== 'undefined') {
          if (user.hasAcceptedMarketing !== filters.hasAcceptedMarketing) {
            return false;
          }
        }

        if (typeof filters.isProspect !== 'undefined') {
          if (user.isProspect !== filters.isProspect) {
            return false;
          }
        }

        if (typeof filters.isReturning !== 'undefined') {
          if (user.isReturning !== filters.isReturning) {
            return false;
          }
        }

        return true;
      });
      count = data.length;
      */

        if (typeof filters.query !== 'undefined' && filters.query !== '') {
            params.query = filters.query;
        }

        if (typeof filters.postId !== 'undefined' && filters.postId !== null) {
            params.post_id = filters.postId;
        }
    }

    if (typeof sortBy !== 'undefined' && typeof sortDir !== 'undefined') {
//      data = applySort(data, sortBy, sortDir);

        params.sortBy = sortBy;
        params.sortDir = sortDir;
    }

    if (typeof page !== 'undefined' && typeof rowsPerPage !== 'undefined') {
//      data = applyPagination(data, page, rowsPerPage);

        params.page = page;
        params.rowsPerPage = rowsPerPage;
    }

    let queryString = new URLSearchParams(params).toString();
//    const headers = await getCommonHeaders();
    const response = await axios.get('/api/comments?' + queryString);
    
    let result = response.data || {};
    
    let data = deepCopy(result.data);
    let count = result.meta?.total;

    return Promise.resolve({
      data,
      count,
    });
  }

  async createComment(obj = {}) {
//    const headers = await getCommonHeaders();  
    const response = await axios.post('/api/comments', obj);
    const result = response.data || {}; 
    return result; 
  }
  
  async getComment(id) {
    if (!id) {
      return { id: null, title: '', content: '', user_id: null };
    }
//    const headers = await getCommonHeaders();  
    const response = await axios.get(`/api/comments/${id}`); // ?view_type=show
    let result = response.data || {};
    if (result && result.data && !result.data.id) {
      result.data.id = id;
    } 
    return result.data;
  }

  async updateComment(id, obj = {}) {
  //  const headers = await getCommonHeaders();  
    const response = await axios.put(`/api/comments/${id}`, obj);
    const result = response.data || {}; 
    return result; 
  }


  async deleteComment(id) {
//    const headers = await getCommonHeaders();  
    const response = await axios.delete(`/api/comments/${id}`);
    const result = response.data || {}; 
    return result; 
  }
  
/*
  async deleteManyUsers(ids) {
    const idsString = encodeURIComponent(JSON.stringify(ids));
    const headers = await getCommonHeaders();  
    const response = await axios.delete(BACKEND_FIREBASE_URL + '/deleteManyUsers?ids=' + idsString,
    {
      headers
    });
    const result = response.data || {}; 
    return result; 
  }  
  
  getEmails(request) {
    return Promise.resolve(deepCopy(emails));
  }

  getInvoices(request) {
    return Promise.resolve(deepCopy(invoices));
  }

  getLogs(request) {
    return Promise.resolve(deepCopy(logs));
  }
*/  
}

export const commentsApi = new CommentsApi();
