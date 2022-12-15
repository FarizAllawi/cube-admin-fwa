
import React, { useEffect, useState } from 'react'
import { Loading, Button, Modal, Input, Row, Checkbox, Text, Spacer } from "@nextui-org/react";
import { useRouter } from 'next/router';
import { Mail } from "../styles/svg/Mail";
import { Password } from "../styles/svg/Password";
import styles from "../styles/index.module.css"
import { withSessionSsr } from '../lib/withSession';
import useLogin from './api/login_noniron';
import useIron from './api/iron';

// Session, get server side props
export const getServerSideProps = withSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;
    if(user == null){
      return {
        props: {
          user: {
            verify: false
          }
        }
      }
    }else if(new Date(user.expire) < new Date()){
      return {
        props: {
          user: {
            verify: false
          }
        }
      }
    }
    else if (user.verify !== true) {
      return {
        props: {
          user: {
            verify: false
          }
        }
      }
    }

    return {
      props: {
        user: req.session.user,
      },
    };
  },
);

export default function Home(props) {
  // State
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("andrian.santo@sakafarma.com");
  const [password, setPassword] = useState();
  const [helperEmail, setHelperEmail] = useState("Please enter your email!");
  const [helperPassword, setHelperPassword] = useState("Please enter your password!");
  const { 
    getLogin
  } = useLogin()

  const {
    ironLogin
  } = useIron()

  // Check If user logged in on Render
  useEffect(() => {
    if(props.user.verify==true){
      router.push("/Home")
    }
  }, [])

  // Validate email is email format 
  const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  // Function to Check Login
  const Login = async (emails, passwords)=>{
    setIsLoading(true);
    // Check if inputed email and password is null?
    if(await emails == null || passwords == null){
      setHelperEmail("Email can't be empty, please enter your email!")
      setHelperPassword("Please enter your password!")
      setIsLoading(false)
    } //Check if inputed email is email
      // else if(await validateEmail(emails)==null){
      //   setHelperEmail("Please enter a valid email!")
      //   setIsLoading(false);
      // }
    else{
      // Hit function login
      let new_emails = validateEmail(emails) ? emails : emails + "@sakafarma.com"
      let checkerData = await getLogin(new_emails, passwords);
      if(checkerData == "Wrong Credential"){
        setHelperEmail("Wrong Credential, please try again!")
        setHelperPassword("Wrong Credential, please try again!")
        setIsLoading(false);
      }
      else{
        // Session
        try {
          // Hit and Create Session
          var logedin = await ironLogin(checkerData)
          console.log(logedin)
        } catch (error) {
          if (error) {
            setHelperEmail("Login Failed, please try again!")
            setHelperPassword("Login Failed, please try again!")
            setErrorMsg(error);
          } else {
            console.error("An unexpected error happened:", error);
          }
        }
        setHelperEmail("Login Success!")
        setHelperPassword("Login Success!")
        console.log("Login Success");
        setIsLoading(false);
        router.push("/kch-office")
      }
    }
  }

  
  return (
    <div className={styles.containerLogin} aria-label="container-login">
      {/* Login Modal */}
      <Modal
          preventClose
          blur
          aria-labelledby="modal-title"
          open={true}
          width={350}
          css={{height: "18rem"}}
          >
          <Modal.Header>
            <Text b id="modal-title" size={18}>
              Admin Sakafarma
            </Text>
          </Modal.Header>
          <Modal.Body>
            <Input
              clearable
              bordered
              fullWidth
              aria-label="input-login"
              color="primary"
              size="lg"
              placeholder="email@sakafarma.com"
              contentLeft={<Mail fill="currentColor" />}
              helperText={helperEmail}
              required
              onChange={(e) => setEmail(e.target.value)}
              contentRight={
              isLoading == true?
              <Loading size="xs"/>:<></>}
              />
            <Spacer y="0.2"/>
            <Input
              clearable
              bordered
              fullWidth
              aria-label="input-password"
              color="primary"
              size="lg"
              type="password"
              placeholder="Password"
              contentLeft={<Password fill="currentColor" />}
              helperText={helperPassword}
              required
              onChange={(e) => setPassword(e.target.value)}
              contentRight={
                isLoading == true?
                <Loading size="xs"/>:<></>}
              />
            {/* <Row justify="space-between">
              <Checkbox>
                <Text size={14}>Remember me</Text>
              </Checkbox>
              <Text size={14}>Forgot password?</Text>=====            </Row> */}
          </Modal.Body>
          <Modal.Footer>
            <Button auto onClick={async ()=> {
              await Login(email, password);
              console.log("Finish")
            }}>
              Sign in
            </Button>
          </Modal.Footer>
        </Modal>
    </div>
  )
}
