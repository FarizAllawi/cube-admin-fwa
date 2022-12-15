import axios from '../../configs/axios/locale'
import {useRouter} from 'next/router'
import { useState , useEffect} from 'react'

export default function useIron() {
    const [isLoading, setIsLoading] = useState(false)

    const ironLogin = async ({setErrors, ...props}) => {
     let paId = []
     await axios.post(`login`, props)
                .then(res => {
                    return paId = res;
               })
               .catch(err => {
                    return err.response
               })
          return paId
     }

     const ironLogout = async ({setErrors, ...props}) => {
        let paId = []
        await axios.post(`logout`, props)
                   .then(res => {
                       return paId = res;
                  })
                  .catch(err => {
                       return err.response
                  })
             return paId
        }

        const sendEmail = async ({setErrors, ...props}) => {
          let emails=[]
          await axios.post('email', props)
          .then((res) => {
               if (res.status === 200) {
                    return emails="OK"
               }
               else{
                    return emails="Gagal"
               }
             })
          .catch(err => {
               return emails=err.response
          })
          return emails
          }


    return {
        ironLogin,
        ironLogout,
        sendEmail
    }
}