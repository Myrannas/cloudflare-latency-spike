const WebSocket = require('ws')
const fs = require('fs');

class Connection {
  #hostname
  #document
  #ws
  #id
  #sequence = 0

  constructor(hostname, document, id) {
    this.#hostname = hostname
    this.#document = document
    this.#id = id;
  }

  async connect() {
    this.#ws = new WebSocket(`${this.#hostname}/${this.#document}`)

    return new Promise((resolve) => {
      this.#ws.once('open', () => {
        resolve(this.#ws)
      })
    })
  }

  async start() {
    const stream = fs.createWriteStream(`./output/${this.#id}.csv`)

    const socket = await this.connect();

    setInterval(() => {
      socket.send(JSON.stringify({
        timestamp: Date.now(),
        sequence: this.#sequence++,
        id: this.#id
      }))
    }, 300);

    socket.on('message', (messageSerialized) => {
      const message = JSON.parse(messageSerialized);
      const latency = Date.now() - message.timestamp;
      stream.write(`${message.id},${latency},${message.sequence}\n`);
    });

    socket.on('error', (err) => {
      console.error(`error from socket ${this.#id}`, err)
    });

    socket.on('close', () => {
      console.log(`socket ${this.#id} closed`)
    })
  }
}

async function sleep(amount) {
  return new Promise((resolve) => setTimeout(resolve, amount))
}

async function start() {
  fs.mkdirSync('output', { recursive: true });

  for (let i = 0; i < 30; i++) {
    // console.log(process.arg)
    const connection = new Connection(process.argv[2], 'ba433337-91f3-4230-a3be-06577ec78839', String(i));

    connection.start().catch(err => console.error('Error starting socket', err));

    await sleep(100);
  }
}


start().catch(err => console.error(err))
