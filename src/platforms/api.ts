// import axios = require('axios')
import axios from "axios"
//const got = require('got') //http request, Streams
import * as store from 'store'
import  {decode} from 'jsonwebtoken'


import {Promise} from 'es6-promise'
const baseurl = '//47.96.103.163/api'


export function signout():any
{
    return axios.post(baseurl + '/signout', {})
        .then(function(response){
            axios.defaults.headers.common['Authorization'] = ''
            store.set('identity-auth', '')
            store.set('identity-classe', '')
            store.set('identity-auth-time-plus', 0)
            return true
        })
}

function getToken(auth:string) {
    let arry = auth.split(' ')
    let token = arry[arry.length-1]
    return token
}
export function signin(username:string, password:string):any
{
    return axios.post(baseurl + '/signin', {username, password})
        .then(function(response){
            if(response.data.err){
                return Promise.reject(response.data)
            }else{
                let auth = response.headers.authorization
                axios.defaults.headers.common['Authorization'] = auth
                try{
                let user = decode(getToken(auth),{complete: true}).payload
                let iat =user['iat']
                
                store.set('identity-auth', auth)
 
                store.set('identity-auth-time-plus', Number.parseInt(iat) - Math.floor(Date.now() / 1000 ))
                
                }catch(err){
                    console.error(err)
                }
                return user
            }
        }).catch(function (error) {
            if (error.response) {
                if(error.response.status === 401){
                    return Promise.reject('用户名或口令错误')
                }
              } else if (error.request) {
                console.log(error.request);
              } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
              }
        })
}

export function  signup(username:string, password:string, params:any):any
{
    return axios.post(baseurl + '/signup', {username, password, params})
        .then(function(response){
            if(response.data.err){
                return new Promise(function(resolve,reject){ 
                    reject(response.data)
                })
            }else{
                return response.data
            }
        })
}

export function bindUser(username:string, password:string, gameUserId:string):any
{
    return signup(username, password, {gameUserId:gameUserId})
}

export function getMyClasses():any
{
    function getUserAccount() {
        return axios.get('/user/12345');
      }
      
      function getUserPermissions() {
        return axios.get('/user/12345/permissions');
      }
      
      axios.all([axios.get(baseurl + '/classes'), axios.get(baseurl + '/classes?filter=owned')])
        .then(axios.spread(function (acct, perms) {
          // 两个请求现在都执行完成
        }));
  
   return axios.get(baseurl + '/classes')
            .then(function(response){
                let classes = []
                for(let i=0; i< response.data.length; i++){
                    classes.push(response.data[i])
                }
                return axios.get(baseurl + '/classes?filter=owned')
                    .then(function(response2){
                        for(let i=0; i< response2.data.length; i++){
                            classes.push(response2.data[i])
                        }
                        return classes
                    })
                
            })
}


export function checkIdentity():any
{
    let auth = store.get('identity-auth')
    
    if(auth) {
      let user = decode(getToken(auth))
      let exp = user['exp']
      let timePlus = store.get('identity-auth-time-plus')
      if( Math.floor(Date.now() / 1000)  + timePlus < exp){
        axios.defaults.headers.common['Authorization'] = auth
        return Promise.resolve(user)
      }
    }
    return Promise.reject(null)
  }

export function checkClassInfo(username):any
{
    let classe = store.get('identity-classe')
    console.log('checkClassInfo', username, classe)
    if(classe && classe.username === username) {
      return Promise.resolve(classe)
    }
    return Promise.reject(null)
}

export function storeClassInfo(username,id, name, idType,teacherId){
    store.set('identity-classe', {
        username,id, name, idType,teacherId
    })
}
  
  

