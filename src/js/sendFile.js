export default function sendFile(file, server) {
  const wsServer = server;
  const httpServer = wsServer.replace('ws', 'http');
  const xhr = new XMLHttpRequest();
  xhr.open('POST', `${httpServer}upload`);
  xhr.addEventListener('error', (e) => { throw new Error(e); });
  const data = new FormData();
  data.append('file', file);
  xhr.send(data);
}
