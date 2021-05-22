import * as http from 'http';
import express from 'express';
import {getPort, openBrowser} from './utils';
import LocalServer from '../local-server/LocalServer';

export class TransitServer {
  server?: http.Server;
  port?: number;

  async createServer(): Promise<void> {
    if (this.server) {
      return;
    }

    const app = express();
    this.port = await getPort(LocalServer.nextPort++);
    this.server = http.createServer(app);
    this.server.listen(this.port);

    app.use((req, res) => {
      const filename = decodeURIComponent(req.query.filename as string || '');
      res.status(302);
      res.setHeader('Cache-Control', 'max-age=0, no-store');
      res.setHeader('location', filename);
      res.send('please wait...');
      res.end();
    });

    return new Promise<void>((resolve, reject) => {
      const server = this.server as http.Server;
      server.on('listening', resolve);
      server.on('error', reject);
    });
  }

  destroy() {
    if (this.server) {
      try {
        this.server.close();
        this.server = undefined;
        this.port = undefined;
      } catch (e) {
        // ignore
      }
    }
  }

  async open(filename: string) {
    filename = `file://${filename}`;
    await openBrowser(`http://127.0.0.1:${this.port}/?filename=${encodeURIComponent(filename)}`);
  }
}

export const transitServer = new TransitServer();

export async function openFileByTransitServer(filename: string) {
  try {
    if (!transitServer.server) {
      await transitServer.createServer();
    }
    await transitServer.open(filename);
  } catch (e) {
    await openBrowser(filename);
  }
}
