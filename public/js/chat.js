const socket = io()

const $msgForm = document.querySelector('#input-form')
const $msgInput = $msgForm.querySelector('input')
const $sendButton = $msgForm.querySelector('button')
const $LocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#text')
const $Loading = document.querySelector('#loading')
const text_template = document.querySelector('#text_input_template').innerHTML
const address_template = document.querySelector('#coordinates-template').innerHTML
const sidebarTemplate = document.querySelector('#lobby-sidebar-template').innerHTML


const {username, lobby} = Qs.parse(location.search, {ignoreQueryPrefix: true})
console.log(username, lobby)

const updateScroll = () => {
    const latesMessage = $messages.lastElementChild
    const stylesOfMessage = getComputedStyle(latesMessage)
    const marginOfMessage = parseInt(stylesOfMessage.marginBottom)
    const messageHeight = latesMessage.offsetHeight + marginOfMessage


    const heightVisible = $messages.offsetHeight
    const contentHeight = $messages.scrollHeight
    const totalScrolled = $messages.scrollTop + heightVisible

    if(contentHeight - messageHeight <= totalScrolled) {
        $messages.scrollTop = $messages.scrollHeight
    }
    console.log(stylesOfMessage)
}


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(text_template, {
        name: message.name,
        message : message.msg,
        createdAt : moment(message.createdAt).format('h:mm'),
    })
    $messages.insertAdjacentHTML('beforeend', html)
    updateScroll()
})


socket.on('locationM',(location) => {
  console.log(location)
  const html = Mustache.render(address_template, {
    name : location.name,
    location : location.msg,
    createdAt : moment(location.createdAt).format('h:mm'),
  })
  console.log(html)

  $messages.insertAdjacentHTML('beforeend', html)
  updateScroll()

})

socket.on('listRoom', ({lobby,users}) => {
    const html = Mustache.render(sidebarTemplate, {
        lobby,
        users
    })
    document.querySelector('#side').innerHTML = html
})

$msgForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $msgForm.setAttribute('disabled', 'disabled')

    const message = e.target.elements.msg.value

    socket.emit('sendM', message, (error) => {
        $msgForm.removeAttribute('disabled')
        $msgInput.value = ''
        $msgInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered')
    })
})

$LocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Location not supported by browser')
    }
    $Loading.display='block'
    $LocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('locationSend', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $LocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
    $Loading.display='none'
})


socket.emit('join', {username, lobby}, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})