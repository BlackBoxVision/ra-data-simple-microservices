import { stringify } from 'query-string';
import { fetchUtils, DataProvider } from 'ra-core';

export type MicroServiceConfig = {
  /**
   * key/value pair representing a resource/microservice url
   */
  [resource: string]: string;
};

/**
 * Maps react-admin queries to a Micro Services API
 *
 * @example
 *
 * getList     => GET http://posts.api.url?sort=['title','ASC']&range=[0, 24]
 * getOne      => GET http://posts.api.url/123
 * getMany     => GET http://posts.api.url?filter={id:[123,456,789]}
 * update      => PUT http://posts.api.url/123
 * create      => POST http://posts.api.url
 * delete      => DELETE http://posts.api.url/123
 *
 * @example
 *
 * import React from 'react';
 * import { Admin, Resource } from 'react-admin';
 * import { microServicesProvider } from '@blackbox-vision/ra-data-microservices';
 *
 * import { PostList } from './posts';
 *
 * const App = () => (
 *     <Admin dataProvider={microServicesProvider({ posts: 'http://path.to.my.api/' })}>
 *         <Resource name="posts" list={PostList} />
 *     </Admin>
 * );
 *
 * export default App;
 */
export const microServicesProvider = (
  config: MicroServiceConfig,
  httpClient = fetchUtils.fetchJson,
): DataProvider => ({
  getList: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify(params.filter),
    };

    return httpClient(`${config[resource]}?${stringify(query)}`).then(
      ({ headers, json }) => {
        if (!headers.has('content-range')) {
          throw new Error(
            'The Content-Range header is missing in the HTTP Response. The simple REST data provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare Content-Range in the Access-Control-Expose-Headers header?',
          );
        }

        const contentRange = headers.get('content-range');
        let total = '10';

        if (contentRange) {
          total = contentRange.split('/').pop() as any;
        }

        return {
          data: json,
          total: parseInt(total, 10),
        };
      },
    );
  },
  getOne: (resource, params) =>
    httpClient(`${config[resource]}/${params.id}`).then(({ json }) => ({
      data: json,
    })),
  getMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };

    return httpClient(
      `${config[resource]}?${stringify(query)}`,
    ).then(({ json }) => ({ data: json }));
  },
  getManyReference: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify({
        ...params.filter,
        [params.target]: params.id,
      }),
    };

    return httpClient(`${config[resource]}?${stringify(query)}`).then(
      ({ headers, json }) => {
        if (!headers.has('content-range')) {
          throw new Error(
            'The Content-Range header is missing in the HTTP Response. The simple REST data provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare Content-Range in the Access-Control-Expose-Headers header?',
          );
        }

        const contentRange = headers.get('content-range');
        let total = '10';

        if (contentRange) {
          total = contentRange.split('/').pop() as any;
        }

        return {
          data: json,
          total: parseInt(total, 10),
        };
      },
    );
  },
  update: (resource, params) =>
    httpClient(`${config[resource]}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json })),
  // simple-rest doesn't handle provide an updateMany route, so we fallback to calling update n times instead
  updateMany: (resource, params) =>
    Promise.all(
      params.ids.map((id) =>
        httpClient(`${config[resource]}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(params.data),
        }),
      ),
    ).then((responses) => ({ data: responses.map(({ json }) => json.id) })),
  create: (resource, params) =>
    httpClient(`${config[resource]}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json.id },
    })),
  delete: (resource, params) =>
    httpClient(`${config[resource]}/${params.id}`, {
      method: 'DELETE',
    }).then(({ json }) => ({ data: json })),
  // simple-rest doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
  deleteMany: (resource, params) =>
    Promise.all(
      params.ids.map((id) =>
        httpClient(`${config[resource]}/${id}`, {
          method: 'DELETE',
        }),
      ),
    ).then((responses) => ({ data: responses.map(({ json }) => json.id) })),
});
