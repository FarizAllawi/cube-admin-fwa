import React, { useEffect, useCallback } from 'react'
import Image from 'next/image'
import styles from '../../styles/module/Layout.module.css'
import { Container, Navbar, Button, Modal, Input, Row, Checkbox, Text } from "@nextui-org/react";
import { useRouter } from 'next/router';
import ScrollToTop from '../ScrollToTop'
import { withSessionSsr } from '../../lib/withSession';
import useIron from '../../pages/api/iron';

export default function Layout(props) {

  const { UserData } = props

  const {
    ironLogout
  } = useIron()

  const router = useRouter()

  const Logouted = useCallback( async () => {
    var senderLog = await ironLogout(JSON.stringify(UserData));

    senderLog.ok == true? router.push('/'): console.log("Error")
  }, [UserData, ironLogout, router])

  useEffect(()=>{
    if (UserData.verify === false) Logouted()
  },[Logouted, UserData.verify])

  return (
    <Container css={{
        maxW: "100%"
      }} aria-label="containerlayout">
  
        <Navbar isBordered variant="static">
          <Navbar.Brand>
            
            <Image className={styles.iconLogoKCH} src={"/img/IconKCH.png"} width="100%" height={25} onClick={ () => router.push('/Home')} alt="Company Logo"/>
          </Navbar.Brand>
          <Navbar.Content enableCursorHighlight activeColor="primary" hideIn="xs" variant="highlight-rounded">
            {
              props.appName == 'kch-office' && (
                <>
                  <Navbar.Link isActive={props.isActive == 'dashboard' ? true : false} onClick={()=>{router.push("/kch-office")}}>Dashboard</Navbar.Link>
                  <Navbar.Link isActive={props.isActive == 'office' ? true : false} onClick={()=>{router.push("/kch-office/office")}}> Office </Navbar.Link>
                  <Navbar.Link isActive={props.isActive == 'desk' ? true : false} onClick={()=>{router.push("/kch-office/desk")}}> Desk </Navbar.Link>
                  <Navbar.Link isActive={props.isActive == 'user' ? true : false} onClick={()=>{router.push("/kch-office/user")}}> User </Navbar.Link>
                  {/* <Navbar.Link isActive={props.isActive == 'department' ? true : false} onClick={()=>{router.push("/kch-office/user")}}> Department </Navbar.Link> */}
                </>
              )
            }

            {
              props.appName == 'cube' && (
                <>
                  <Navbar.Link isActive={props.isActive == 'dashboard' ? true : false} onClick={()=>{router.push("/cube")}}>Dashboard</Navbar.Link>
                  {/* <Navbar.Link isActive={props.isActive == 'office' ? true : false} onClick={()=>{router.push("/cube/transaction/batch")}}> Batch Transaction</Navbar.Link>
                  <Navbar.Link isActive={props.isActive == 'desk' ? true : false} onClick={()=>{router.push("/cube/transaction/detail")}}> Detail Transaction </Navbar.Link> */}
                </>
              )
            }

            {/* {
              props.isActiveTest == "Landing" ? 
              <>
              <Navbar.Link isActive onClick={()=>{router.push("/Home")}}>Generate Transaction</Navbar.Link>
              <Navbar.Link onClick={()=>{router.push("/Transaction/batch")}}>Transaction List</Navbar.Link>
              </> 
              : 
              <>
              <Navbar.Link onClick={()=>{router.push("/Home")}}>Generate Transaction</Navbar.Link>
              <Navbar.Link isActive onClick={()=>{router.push("/Transaction/batch")}}>Transaction List</Navbar.Link>
              </> 
            } */}
            {/* <Navbar.Link  href="/">
              Generate Transaksi
            </Navbar.Link>
            <Navbar.Link href="/Paid">Daftar Transaksi</Navbar.Link> */}
            {/* <Navbar.Link isActive href="/Paid">Daftar Transaksi</Navbar.Link> */}
          </Navbar.Content>
          <Navbar.Content>
            {/* <Navbar.Link color="inherit" href="#">
              Login
            </Navbar.Link> */}
            <Navbar.Item>
                {props.UserData.verify==true? 
                <div className={styles.phitext}>
                  <Text size="$xs">{props.UserData.role}</Text>
                  <Text size="$md">{props.UserData.name}</Text>
                </div>
                :<></>}
            </Navbar.Item>
            <Navbar.Item>
                {props.UserData.verify==true?
                <>
                  {/* <Image src={"/img/iconPic.png"} width={50} height={50}></Image> */}
                  <Image src={"/icon/turnoff.png"} width={32} height={32} className={styles.iconLogout}
                  onClick={Logouted}
                  ></Image>
                </>
                :<></>}
            </Navbar.Item>
          </Navbar.Content>
        </Navbar>

        {props.children}
        <ScrollToTop/>

        
      </Container>
  )
}
