const createMessage = (name, msg) => {
  return {
    name,
    msg,
    createdAt : new Date().getTime()
  }
}


module.exports = {
  createMessage
}