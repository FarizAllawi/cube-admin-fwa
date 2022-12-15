import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Grid, Table, Modal, Text, Spacer, Loading, Row, Button} from "@nextui-org/react"
import { Box } from "../../components/Box"
import styles from "/styles/pages/transaction/Detail.module.css"
import axios from '../../configs/axios'
import Layout from '../../components/layout'
import { withSessionSsr } from '../../lib/withSession';
import capitalizeEachWord from '/helpers/capitalizeEachWord.js'
const base_url = process.env.NEXT_PUBLIC_API_HOST;

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

export default function Detail(props) {
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
  const router = useRouter()

  // Set Table Column Name
  const columns = [
    {
      key: "id",
      label: "#",
    },
    {
      key: "phid",
      label: "No Payment Detail",
    },
    {
      key: "claimid",
      label: "No Claim",
    },
    {
      key: "amount",
      label: "Amount",
    },
    {
      key: "createdt",
      label: "Created",
    },
    {
      key: "name",
      label: "Requestor",
    },
    {
      key: "deptName",
      label: "Department",
    },
    // {
    //   key: "action",
    //   label: "Action"
    // }
  ];
 
  // Set Table Row Data
  const rowss = dataState.map((item, i )=> 
  [
    {
      key: i,
      pdid: item.pdid,
      claimid: item.claimid,
      amount: item.amount,
      createdt: item.createdt,
      name: item.name,
      deptName: item.deptName
    },
  ]);

 

  useEffect(() => {
    const getClaim = () => {
      setDataState([{},{},{},{}])
      setIsLoading(true)
      setTimeout(() => {
          axios.get(`${base_url}api/PaymentDetailAll/get/byPh?getPhid=${router.query.phid}`).then(res => {
              setDataState(res.data)
          }).catch(err => {
              console.log(err)
              setDataState([{
                pdid: "There is no transaction",
                phid: "There is no transaction",
                claimid: "There is no transaction",
                amount: "There is no transaction",
                createdt: "There is no transaction",
                name: "There is no transaction",
                deptName: "There is no transaction",
              }])
          })
          setIsLoading(false)
      }, 2000);
    }

    if(props.user.verify==false){
      router.push("/")
    }
    else{
      getClaim();
    }
  }, [])

  const convertDate = (date) => {
    var tanggals = new Date(date)
    var tanggal_fix = 
    ('00' + tanggals.getUTCDate()).slice(-2) + '-' +
    ('00' + (tanggals.getUTCMonth()+1)).slice(-2) + '-' +
    tanggals.getUTCFullYear();

    return tanggal_fix;
  }

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
    <div className={styles.backClass} onClick={()=>{router.back()}}>
        <Text h1 className={styles.backClassTexts}>{"<"}</Text>
        <Text h3 className={styles.backClassText}>Back to Batch List</Text>
    </div>

    <div className={styles.titleInvoice}>
        <Text h4 css={{ textAlign: 'center' }} >
        Invoice Batch No:
        </Text>
        <Text h2 css={{ textAlign: 'center' }} className={styles.titleInvoiceText}>
        {router.query.phid}
        </Text>
    </div>
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
                  <Table.Cell>{item[0].pdid}</Table.Cell>
                  <Table.Cell>{item[0].claimid}</Table.Cell>
                  <Table.Cell>{Rupiah(item[0].amount)}</Table.Cell>
                  <Table.Cell>{new Date(item[0].createdt).toLocaleDateString("id-ID")}</Table.Cell>
                  <Table.Cell>{`${item[0].name?.length > 10 ? capitalizeEachWord(item[0].name).substring(0,10) : ''}...`}</Table.Cell>
                  <Table.Cell>{item[0].deptName}</Table.Cell>
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
