import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getGraph = (parent_id = null) =>
  api.get('/graph', { params: parent_id ? { parent_id } : {} }).then(r => r.data);

export const getNodes = (params = {}) =>
  api.get('/nodes', { params }).then(r => r.data);

export const getTree = () =>
  api.get('/nodes/tree').then(r => r.data);

export const getNode = (id) =>
  api.get(`/nodes/${id}`).then(r => r.data);

export const createNode = (data) =>
  api.post('/nodes', data).then(r => r.data);

export const updateNode = (id, data) =>
  api.put(`/nodes/${id}`, data).then(r => r.data);

export const deleteNode = (id) =>
  api.delete(`/nodes/${id}`).then(r => r.data);

export const searchNodes = (q) =>
  api.get('/nodes/search', { params: { q } }).then(r => r.data);

export const createEdge = (data) =>
  api.post('/edges', data).then(r => r.data);

export const deleteEdge = (id) =>
  api.delete(`/edges/${id}`).then(r => r.data);

export const updateEdge = (id, data) =>
  api.put(`/edges/${id}`, data).then(r => r.data);
