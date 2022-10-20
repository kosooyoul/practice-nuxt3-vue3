'use strict'

const http = require('http')
const express = require('express')

const server = http.createServer(express())

const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server
const wss = new WebSocketServer({ server })

let nextClientId = 0
const clientsById = {}

const broadcast = function (data) {
  try {
    const json = JSON.stringify(data)
    for (const id in clientsById) {
      const client = clientsById[id]
      client.ws.send(json)
    }
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log(new Date(), e)
  }
}

const send = function (client, data) {
  try {
    client.ws.send(JSON.stringify(data))
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log(new Date(), e)
  }
}

wss.on('connection', (ws) => {
  const client = {}
  client.id = nextClientId++
  client.ws = ws

  // eslint-disable-next-line no-console
  console.log('client', `${client.id} connected`)

  clientsById[client.id] = client

  // when just connect server
  // join(client);

  ws.on('message', (json) => {
    try {
      const data = JSON.parse(json)
      client.data = data
      client.dataUpdated = true
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log(new Date(), e)
    }
  })

  ws.on('close', () => {
    delete clientsById[client.id]
  })

  //
  const message1 = { type: 'cid', cid: client.id }
  send(client, message1)

  const message2 = { type: 'friends', friends: [] }
  for (const id in clientsById) {
    const client = clientsById[id]
    message2.friends.push({ cid: client.id, data: client.data })
  }

  broadcast(message2)
})

setInterval(() => {
  const message = { type: 'friends', friends: [] }

  for (const id in clientsById) {
    const client = clientsById[id]
    if (client.dataUpdated) {
      message.friends.push({ cid: client.id, data: client.data })
      client.dataUpdated = false
    }
    else {
      message.friends.push({ cid: client.id })
    }
  }

  broadcast(message)
}, 100)

// For WebSocket
server.listen(50000, () => {
  // eslint-disable-next-line no-console
  console.log(new Date(), `WebSocket Server Listen ${50000}`)
})
