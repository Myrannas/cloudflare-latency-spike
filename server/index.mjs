export default {
  async fetch(request, env) {
    const id = env.DurableObject.idFromName(new URL(request.url).pathname)

    const stub = env.DurableObject.get(id)

    return await stub.fetch(request)
  },
}

export class DurableObject {
  #sessions = new Set()

  constructor(state, env) {
    this.state = state;
    console.log('Starting durable object')
  }

  async fetch(request) {
    console.log('Establishing connection')

    const [client, server] = Object.values(new WebSocketPair())

    console.log('Creating websocket pair')

    server.accept();
    this.#sessions.add(server)

    server.addEventListener('message', async (msg) => {
      this.#sessions.forEach((session) => {
        session.send(msg.data)
      })
    });

    server.addEventListener('close', () => {
      this.#sessions.delete(server)
    });
    server.addEventListener('error', () => {
      this.#sessions.delete(server)
    });

    // Now we return the other end of the pair to the client.

    console.log('Upgrading connection')

    return new Response(null, { status: 101, webSocket: client });
  }
}
