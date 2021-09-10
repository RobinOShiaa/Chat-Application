const users = []



const add = ({id , username , lobby}) => {
  username = username.trim().toLowerCase()
  console.log(lobby)
  lobby = lobby.trim().toLowerCase()
  if (!username || !lobby) {
    return {
      error : 'Username and lobby are required'
    }
  }
  const existingUsers = users.find((user) => {
      return user.lobby === lobby && user.username === username
  })
  if (existingUsers) {
    return {
      error : 'Username already exists'
    }
  }
  const user = {id, username, lobby}
  users.push(user)
  return {
    user
  }

}


const remove = (id) => {
  const index = users.findIndex((user) => user.id === id)

  if (index !== -1) {
    return users.splice(index, 1)[0]
  }

}


const get = (id) => {
  return users.find((user) => user.id === id)
}



listLobby = (lobby) => {
  lobby = lobby.trim().toLowerCase()
  return users.filter((user) => user.lobby === lobby)
}


module.exports = {
  add,
  remove,
  get,
  listLobby
}