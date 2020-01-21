//Ici je crée un module pour mes fonctions status
exports.success = function(result) {
    return {
        status: 'success',
        result: result
    }
}

exports.error = function(message) {
    return {
        status: 'error',
        message: message
    }
}