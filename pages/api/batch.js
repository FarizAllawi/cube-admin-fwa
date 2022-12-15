import axios from '../../configs/axios'
import {useRouter} from 'next/router'
import { useState , useEffect} from 'react'

export default function useBatch() {
    const [isLoading, setIsLoading] = useState(false)

    // Payment Head
    const insertPaymentHead = async ({setErrors, ...props}) => {
        let phId = ''
        await axios.post(`api/PaymentHead/insert`, props)
                   .then(res => {
                        return phId = res.phid
                   })
                   .catch(err => {
                        return err.response
                   })
        return phId
    }

    // Payment Detail
    const insertPaymentDetail = async ({setErrors, ...props}) => {
        let pdId = []
        await axios.post(`api/PaymentDetail/insert`, props)
                   .then(res => {
                         pdId = {
                              status: res.status,
                              pdid: res.pdid,
                              amount: res.amount
                         }
                        return pdId;
                   })
                   .catch(err => {
                        return err.response
                   })
        return pdId
    }
    
    const insertPAFinances = async ({setErrors, ...props}) => {
     console.log("InsertedPA")
     console.log(props.pdid)
     console.log(props.amount)
     console.log("FINISH INSERTED PA")
     let paId = []
     await axios.post(`api/PaymentApproval/insertpafinance?pdid=${props.pdid}&amount=${props.amount}`)
                .then(res => {
                    console.log("Test Check Status Insert" + res.status)
                     return paId = res.status;
                })
                .catch(err => {
                     return err.response
                })
          return paId
     }


     const updatePaid = async ({setErrors, ...props}) => {
          let paId = []
          await axios.put(`api/PaymentApproval/updatepapaid?pdid=${props.batchid}&app_dt=${props.app_dt}`)
                .then(res => {
                     return paId = res.status;
                })
                .catch(err => {
                     return err.response
                })
          return paId
     }


    return {
        insertPaymentHead,
        insertPaymentDetail,
        insertPAFinances,
        updatePaid
    }
}