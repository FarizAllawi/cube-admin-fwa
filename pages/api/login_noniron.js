import axios from '../../configs/kch-office/axios'
import { useState , useEffect} from 'react'

export default function useLogin() {
    var CryptoJS = require("crypto-js");

    
    const getLogin = async (email, password) => {
        let key = CryptoJS.enc.Utf8.parse(process.env.NEXT_PUBLIC_AES_HASH_KEY)
        let iv = CryptoJS.enc.Utf8.parse(process.env.NEXT_PUBLIC_AES_IV_KEY)

        let encryptedPassword = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(password), key, {iv:iv, mode:CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7})

        // DEFAULT "sayangsaka"
        let userData = await getData(email, encryptedPassword.ciphertext.toString(CryptoJS.enc.Base64)); // Send encrypted chipertext to API
        
        if(userData.status == 200){
            return userData
        }
        else{
            return "Wrong Credential"
        }
    }

    const getData = async (email, password) => {
        let fadmin = ''

        await  axios.post(`api/auth/login`, {
            email: email,
            password: password
        })
        .then(res => {
            fadmin = {
                nik: res.data.user.nik,
                name: res.data.user.name,
                email: res.data.user.email,
                token: res.data.token,
                status: res.status
            }
            return fadmin
        })
        .catch(err => {
            return err.response
        })
        return fadmin
    }

    return {
        getLogin,
    }
}