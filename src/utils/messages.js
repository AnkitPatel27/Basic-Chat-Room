const generateMessage = (text,username)=>{
    return {
        username,
        text,
        created_At:new Date()
    }
}

module.exports = {
    generateMessage
}