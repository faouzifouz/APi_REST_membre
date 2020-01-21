//fichier contenant la class Members
let db, config
//ici j'exporte le module(la fonction) qui va valoir directememnt une class
module.exports = (_db,_config) => {
    db = _db
    config = _config

    return Members
}
let Members = class {
  
}