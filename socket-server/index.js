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
      const payload = JSON.parse(json)
      if (payload.type === 'position') {
        client.position = payload.data
        client.positionUpdated = true
      }
      else if (payload.type === 'dusts') {
        client.dusts = payload.data
        client.dustsUpdated = true
      }
      else if (payload.type === 'hit') {
        const target = payload.data?.target
        if (clientsById[target])
          send(clientsById[target], { type: 'dead' })
      }
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
    message2.friends.push({ cid: client.id, data: client.position })
  }

  broadcast(message2)
})

const broadcastFriends = () => {
  const message = { type: 'friends', friends: [] }

  for (const id in clientsById) {
    const client = clientsById[id]
    if (client.positionUpdated) {
      message.friends.push({ cid: client.id, data: client.position })
      client.positionUpdated = false
    }
    else {
      message.friends.push({ cid: client.id })
    }
  }

  broadcast(message)
}

const broadcastDusts = () => {
  const message = { type: 'dusts', dusts: [] }

  for (const id in clientsById) {
    const client = clientsById[id]
    if (client.dusts && client.dustsUpdated) {
      message.dusts.push({ cid: client.id, data: client.dusts })
      client.dustsUpdated = false
    }
  }

  if (message.dusts.length === 0)
    return

  broadcast(message)
}

setInterval(() => {
  broadcastFriends()
  broadcastDusts()
}, 100)

// For WebSocket
server.listen(60000, () => {
  // eslint-disable-next-line no-console
  console.log(new Date(), 'WebSocket Server Listen 60000')
})
