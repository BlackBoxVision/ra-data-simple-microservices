# Micro Services DataProvider

React Admin DataProvider with support for micro-services architecture.

## Install

You can install this library via NPM or YARN.

### NPM

```bash
npm i @blackbox-vision/ra-data-microservices
```

### YARN

```bash
yarn add @blackbox-vision/ra-data-microservices
```

## Use case

You use react-admin for building a frontend to manage CRUD resources, and you have a micro-service architecture for your services.

## Example Usage

### Normal usage

```javascript
import React from 'react';
import { Admin, Resource } from 'react-admin';
import { microServicesProvider } from '@blackbox-vision/ra-data-microservices';

import { PostList } from './posts';

const dataProvider = microServicesProvider({ posts: 'http://posts.api.url' });

const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="posts" list={PostList} />
  </Admin>
);

export default App;
```

### Passing a custom HTTP Client

```javascript
import React from 'react';
import { Admin, Resource } from 'react-admin';
import { microServicesProvider } from '@blackbox-vision/ra-data-microservices';

import { PostList } from './posts';

const customHttpClient = (url, options = {}) => {};
const dataProvider = microServicesProvider(
  { posts: 'http://posts.api.url' },
  customHttpClient,
);

const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="posts" list={PostList} />
  </Admin>
);

export default App;
```

## Issues

Please, open an [issue](https://github.com/BlackBoxVision/ra-data-microservices/issues) following one of the issues templates. We will do our best to fix them.

## Contributing

If you want to contribute to this project see [contributing](https://github.com/BlackBoxVision/ra-data-microservices/blob/master/CONTRIBUTING.md) for more information.

## License

Distributed under the **MIT license**. See [LICENSE](https://github.com/BlackBoxVision/ra-data-microservices/blob/master/LICENSE) for more information.
