import axios from '../../configs/axios'
import {useRouter} from 'next/router'
import { useState , useEffect} from 'react'

export default function useNotification() {
    const [isLoading, setIsLoading] = useState(false)

    // Notif
    const insertNotification = async ({setErrors, ...props}) => {
        // console.log("THIS INSERT INNER NOTIF")
        // console.log(props)
        // console.log("FINISH PROP N")
        let inStat = []
        await axios.post('api/Notification/insert', props)
        .then(res => {
            // console.log("Check notif")
            return inStat=res.status
        })
        .catch( err => {
            return err.response
        })
        console.log("AFTER INSERT AXIOS NOTIF")
        return inStat
    }

    const insertRating = async ({setErrors, ...props}) => {
        let inRate = []
        // console.log("THIS INSERT RATING")
        // console.log(props.claimid)
        // console.log("FINISH PROP R")

        await axios.post(`api/ClaimRating/insertRating?setClaimid=${props.claimid}`)
        .then(res => {
            // console.log("Test Check Status Insert" + res.status)
             return inRate = res.status;
        })
        .catch(err => {
             return err.response
        })
        // console.log("Udah axios Rate")
        return inRate
    }

    return {
        insertNotification,
        insertRating,
    }
}