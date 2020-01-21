//Traduit le code javascript
require('babel-register')
//ici je crée un objet pour module(sinon j'aurai du ajouter une variable avant chaque success ou error)
const {success, error} = require('./assets/functions')
//module promise mysql pour connect db avec promise (voir doc nmpjs)
const mysql = require('promise-mysql')
//Ici le framework gerer les routes server etc
const express = require('express')
//Package debug
const morgan = require('morgan')('dev')
//Permet de modifier url et port
const config = require('./assets/config')
//Permet de parser les info en body
const bodyParser = require('body-parser')


//parametre de connection
mysql.createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password
})

//pour faire une connection 
db.connect((err) =>{

    if (err)
        console.log(err.message)
    else{

        console.log('Connected')
        // je crée une instance de const express
        const app = express()
        //Ici je crée mon router(empeche de réecrire a chaque fois /api etc...)
let MembersRouter = express.Router()
//ici est exporté la class Members
let Members = require('./assets/classes/members-class')(db,config)
console.log(Members)
// j utilise les Middleware(app.) tjrs lu avant
//Ici permet de parser le json
app.use(bodyParser.json());
//Ici permet de voir si urlencoded pour que se soit interpreter
app.use(bodyParser.urlencoded({ extended: true}));
//ici le mode dev pour voir temps de reponse etc dans console
app.use(morgan)
//Ici je réuni les route get put delete(j'enleve le app et leur url)
MembersRouter.route('/:id')
//------------- methode get RECUPERE MEMBRE avec son ID
    .get((req,res) => {
            //Ici requete sql pour recup un membres avec son id
        db.query('SELECT * FROM members WHERE id = ?',[req.params.id],(err,result) =>{
            if(err) {
                res.json(error(err.message))
            }else {
                if (result[0]!= undefined){
                    //Pour avoir l'objet [0]
                    res.json(success(result[0]))
                }else{
                    res.json(error('Wrong id'))
                }
                
            }
        })
      
        
    })
    //------  ICI JE MODIFIE MEMBRE
    //Ici je gere les methodes http put qui permet de modifer un membre 
    .put((req, res) => {
        //voir si il existe
        if (req.body.name) {
            //on verrifie si le membre exist
            db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, result) => {
                if (err) {
                    res.json(error(err.message))
                } else {

                    if (result[0] != undefined) {
                        //Ici oon veririfesi pas le mm nom
                        db.query('SELECT * FROM members WHERE name = ? AND id != ?', [req.body.name, req.params.id], (err, result) => {
                            if (err) {
                                res.json(error(err.message))
                            } else {

                                if (result[0] != undefined) {
                                    res.json(error('same name'))
                                } else {
                                    //Ici requete pour modifier le membre
                                    db.query('UPDATE members SET name = ? WHERE id = ?', [req.body.name, req.params.id], (err, result) => {
                                        if (err) {
                                            res.json(error(err.message))
                                        } else {
                                            res.json(success(true))
                                        }
                                    })

                                }

                            }
                        })

                    } else {
                        res.json(error('Wrong id'))
                    }

                }
            })

        } else {
            res.json(error('no name value'))
        }

    })

       
    //------- ICI  POUR EFFACER UN MEMBRE avec SON ID
    .delete((req, res) => {
        db.query('SELECT * FROM members WHERE id = ?',[req.params.id],(err,result) =>{
            if(err) {
                res.json(error(err.message))
            }else { //Ici si c 'est pas vide on peux supprimer
                if (result[0]!= undefined){
                    //Ici requte pour supprimer
                    db.query('DELETE FROM members WHERE id = ?', [req.params.id], (err, result) => {
                        if(err) {
                            res.json(error(err.message))
                        } else {
                            res.json(success(true))
                        }
                    })
                    
                }else{
                    res.json(error('Wrong id'))
                }
                
            }
        })
        
    })
//Ici je crée une autre route pour get et post
MembersRouter.route('/')
//récup tout les membres au choix (?max=)
    .get((req, res) => {
        //permet de recup les parametres apres le ?max=
        if (req.query.max != undefined && req.query.max > 0){

            //Ici requete sql pour recup  tout les membres avec max
            db.query('SELECT * FROM members LIMIT 0, ?',[req.query.max],(err, result) =>{
                //si erreur alor message erreur
                if (err) {
                    res.json(error(err.message))
                    //sinon afficher resulat
                }else {
                    res.json(success(result))

                }
            })

            res.json(success(members.slice(0,req.query.max)))
            //Si pas  de valeur après max valeur affiche error
        }else if(req.query.max != undefined){
            res.json(error('Wrong max value'))
        }else {
            //Ici requete sql pour recup  tout les membres
            db.query('SELECT * FROM members',(err, result) =>{
                //si erreur alor message erreur
                if (err) {
                    res.json(error(err.message))
                    //sinon afficher resulat
                }else {
                    res.json(success(result))

                }
            })
            
        }
        
    })
    //-------Pour ajouter un membre ----------- à verifer avec Postman
    .post((req, res) => {
        //Si ya un nom
        if(req.body.name) {
            //Ici requete sql pour verifier si le nom n est pas deja pris
            db.query('SELECT * FROM members WHERE name = ?', [req.body.name], (err, result) =>{
                if(err) {
                    res.json(error(err.message))
                } else {
                    //Ici je traite le resultat si meme nom ou index déja plein 
                    if(result[0]!= undefined){
                        //Ici dire que c est déja pris
                        res.json(error('name already taken'))
                    } else {
                        //Ici si le nom n 'est pas pri alors on ajoute le membre
                        db.query('INSERT INTO members(name) VALUES(?)',[req.body.name], (err,result) => {
                            if (err){
                                res.json(error(err.message))
                            } else {
                                //Ici on recupere son ID
                                db.query('SELECT * FROM members WHERE name = ?',[req.body.name], (err, result) => {
                                    if(err) {
                                        res.json(error(err.message))
                                        //on envoie un success avec son Id
                                    }else {
                                            res.json(success({
                                            id:result[0].id,
                                            name:result[0].name
                                        }))
                                    }
                                  
                                })
                            }
                        })
                    }

                }
            })
            
        
        //si pas de nom envoie une erreur
        }else {
            res.json(error('no name value'))
        }
    })

app.use(config.rootAPI + 'members', MembersRouter)

app.listen(config.port, () => 
    //debug pour  ma console(affiche)
    console.log('Started on port '+config.port))
    }

   
})


// j'ai mi ces fonctions dans un module
// function success(result) {
//     return{
//         status: 'success',
//         result: result
//     }
// }

// function error(message) {
//     return {
//         status: 'error',
//         message: message
//     }
// }


