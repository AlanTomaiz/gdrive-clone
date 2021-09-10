import { describe, test, expect, jest } from '@jest/globals';
import Routes from '../../src/routes.js';

describe('#Routes test suite', () => {
  const defaultParams = {
    request: {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      method: '',
      body: {},
    },
    response: {
      writeHead: jest.fn(),
      setHeader: jest.fn(),
      end: jest.fn(),
    },
    values: () => Object.values(defaultParams),
  };

  describe('- SocketInstance', () => {
    test('setSocket should store io instance', () => {
      const routes = new Routes();

      const ioObj = {
        to: (id) => ioObj,
        emit: (event, message) => {}
      }

      routes.setSocketInstance(ioObj);
      expect(routes.io).toStrictEqual(ioObj);
    });
  });

  describe('- Handler', () => {
    test('given an inexistent router', async () => {
      const routes = new Routes();

      const params = { ...defaultParams };
      params.request.method = 'inexistent';

      await routes.handler(...params.values());
      expect(params.response.writeHead).toHaveBeenCalledWith(404);
      expect(params.response.end).toHaveBeenCalledWith('Not Found');
    });

    test('it should set any request with CORS enabled', async () => {
      const routes = new Routes();

      const params = { ...defaultParams };
      params.request.method = 'inexistent';

      await routes.handler(...params.values());
      expect(params.response.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    });

    test('given method OPTIONS it should choose options route', async () => {
      const routes = new Routes();

      const params = { ...defaultParams };
      params.request.method = 'OPTIONS';

      await routes.handler(...params.values());
      expect(params.response.writeHead).toHaveBeenCalledWith(204);
      expect(params.response.end).toHaveBeenCalled();
    });

    test('given method GET it should choose get route', async () => {
      const routes = new Routes();

      const params = { ...defaultParams };
      params.request.method = 'GET';

      jest.spyOn(routes, routes.get.name).mockResolvedValue();
      await routes.handler(...params.values());
      expect(routes.get).toHaveBeenCalled();
    });

    test('given method POST should choose post route', async () => {
      const routes = new Routes();

      const params = {  ...defaultParams };
      params.request.method = 'POST';

      jest.spyOn(routes, routes.post.name).mockResolvedValue();
      await routes.handler(...params.values());
      expect(routes.post).toHaveBeenCalled();
    })
  });

  describe('- Method GET', () => {
    test('Its should return file status in correct format', async () => {
      const routes = new Routes();

      const returnMock = {
        filename: 'test.test',
        size: '42.4 MB',
        lastModified: '2021-09-10T18:42:36.787Z',
        owner: 'alantomaiz',
      };

      const params = { ...defaultParams };
      params.request.method = 'GET';

      jest.spyOn(routes.fileHelper, routes.fileHelper.getFilesStatus.name)
        .mockResolvedValue(returnMock);

      await routes.handler(...params.values());
      expect(params.response.writeHead).toHaveBeenCalledWith(200);
      expect(params.response.end).toHaveBeenCalledWith(JSON.stringify(returnMock));
    });
  });
});