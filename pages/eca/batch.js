import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Grid, Table, Modal, Text, Spacer, Loading, Row, Button} from "@nextui-org/react"
import { Box } from "../../components/Box"
import styles from "/styles/pages/transaction/Batch.module.css"
import axios from '../../configs/axios'
import Layout from '../../components/layout'
import { withSessionSsr } from '../../lib/withSession';
const base_url = process.env.NEXT_PUBLIC_API_HOST;

// Get Server Side Props
export const getServerSideProps = withSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;

    if(user == undefined){
      return {
        props: {
          user: {
            verify: false
          }
        }
      }
    }
    else if(user == null){
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
    }else if (user.verify !== true) {
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

export default function Transaction(props) {
  // State
  const [isLoading, setIsLoading] = useState(false)
  const [dataState, setDataState] = useState([{}]);
  const [startDate, setStartDate] = useState(new Date());
  const [getID, setGetID] = useState([]);
  // State for Modal
  const [visible, setVisible] = React.useState(false);
  const closeHandler = () => {
    setVisible(false);
  };

  // Set Table Column Name
  const columns = [
    {
      key: "id",
      label: "#",
    },
    {
      key: "phid",
      label: "No Batch",
    },
    {
      key: "createdt",
      label: "Created Date",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "amount",
      label: "Total Amount"
    },
    {
      key: "action",
      label: "Action"
    }
  ];
 
  // Create Table Row Data
  const rowss = dataState.map((item, i )=> 
  [
    {
      key: i,
      id: item.id,
      phid: item.phid,
      status: item.status,
      amount: item.amount,
      createdt: item.createdt,
    },
  ]);


  // Get Data on page render client side
  useEffect(() => {
    const getClaim = () => {
      setDataState([{},{},{},{}])
      setIsLoading(true)
      setTimeout(() => {
          axios.get(`${base_url}api/PaymentHeadAmount/getAll`).then(res => {
              setDataState(res.data)
          }).catch(err => {
              console.log(err)
              setDataState([{
                id: "There is no transaction",
                phid: "There is no transaction",
                status: "There is no transaction",
                createdt: "There is no transaction",
              }])
          })
          setIsLoading(false)
      }, 2000);
    }

    // Check if client is user/logged in
    if(props.user.verify==false){
      router.push("/")
    }
    else{
      getClaim();
    }
  }, [])

  // Function router to change route
  const router = useRouter()

    // Format to Rupiah
    const Rupiah = (number)=>{
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR"
      }).format(number);
    }


  return (
    <Layout isActiveTest="Transaction" UserData={props.user}>
    <Box css={{px: "$12", mt: "$8", "@xsMax": {px: "$10"}}}>
    <Text h3 css={{ textAlign: 'center' }}>
      <Button.Group color="success" ghost>
        <Button className={styles.disabledButton} disabled auto>Batch List</Button>
        <Button auto onClick={()=> router.push('/Transaction')}>Approved Payment List</Button>
        <Button auto onClick={()=> router.push('/Transaction/paid')}>Paid Payment List</Button>
      </Button.Group>
    </Text>
   
    <Spacer y={1}/>

    <Grid.Container gap={2} className={styles.containerContent}>
      <Grid xs={12}>

      {
         isLoading==true? 
          <Loading className={styles.tableLoading} 
          type="default" 
          color="success" 
          loadingCss={{ $$loadingSize: "15vw", $$loadingBorder: "10px" }}
          // size="xl"
          >
          Retrieving Data...
          </Loading>
          :
          <Table
            color={"primary"}
            // selectionMode="multiple"
            animated={false}
            containerCss={{
              height: "auto",
              minWidth: "100%",
            }}
          >
            <Table.Header columns={columns}>
              {(column) => (
                <Table.Column key={column.key} className={styles.tableHeaderColumn}>{column.label}</Table.Column>
              )}
            </Table.Header>
            <Table.Body items={rowss} className={styles.bodyTableRow}>
              {(item) => (
                <Table.Row key={item[0].key} >
                  {/* {(columnKey) => <Table.Cell>{console.log(item.id)}</Table.Cell>} */}
                  {/* item[columnKey]  */}

                  <Table.Cell>{item[0].key+1}</Table.Cell>
                  <Table.Cell>{item[0].phid}</Table.Cell>
                  <Table.Cell>{new Date(item[0].createdt).toLocaleDateString("id-ID")}</Table.Cell>
                  <Table.Cell>{
                  item[0].status == 1 ?
                  <Button flat color="primary" auto className={styles.unclickeableBtn}
                  >
                    Paid
                  </Button>
                  :
                  item[0].status == 2 ?
                  <Button flat color="success" auto className={styles.unclickeableBtn}
                  >
                    Approved
                  </Button>
                  :
                  item[0].status == 3 ?
                  <Button flat color="warning" auto className={styles.unclickeableBtn}>
                    On Progress
                  </Button>
                  :
                  item[0].status == 4 ?
                  <Button flat color="error" auto className={styles.unclickeableBtn}>
                    Rejected
                  </Button>
                  :
                  item[0].status == 5 ?
                  <Button flat color="warning" auto className={styles.unclickeableBtn}>
                    Pending
                  </Button>
                  :
                  <Button flat color="primary" auto className={styles.unclickeableBtn}>
                    Undefined
                  </Button>
                  }</Table.Cell>
                  <Table.Cell>{Rupiah(item[0].amount)}</Table.Cell>
                  <Table.Cell>
                    <Button size="xs" onClick={()=>{
                      router.push({
                        pathname: "/Transaction/detail",
                        query: {phid: item[0].phid}
                      })
                    }}>
                      See Detail
                    </Button>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>

            {/* Pagination */}
            <Table.Pagination
              shadow
              noMargin
              align="center"
              total={Math.ceil((rowss.length)/15)}
              rowsPerPage={15}
              onPageChange={() => {window.scrollTo({
                  top: 0,
                  behavior: "smooth",
              })}}
            />

            {/* End Pagination */}
          </Table>
          }
      </Grid>
      <Grid xs={12}>
        
      </Grid>
    </Grid.Container>
    
  </Box>
  </Layout>

  )
}
