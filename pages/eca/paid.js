import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Grid, Table, Input, Loading, Text, Spacer, Modal, Row, Button} from "@nextui-org/react"
import { Box } from "../../components/Box"
import styles from "/styles/pages/transaction/Paid.module.css"
import axios from '../../configs/axios'
import Layout from '../../components/layout'
import * as XLSX from 'xlsx';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import { withSessionSsr } from '../../lib/withSession';
import capitalizeEachWord from '/helpers/capitalizeEachWord.js'
const base_url = process.env.NEXT_PUBLIC_API_HOST;

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

export default function Paid(props) {
    const [modalMsg, setModalMsg] = useState("Something is wrong, please try again!");
    const [isLoading, setIsLoading] = useState(false)
    const [isLoading2, setIsLoading2] = useState(false)
    const [dataState, setDataState] = useState([{}]);
    const [startDate, setStartDate] = useState(new Date());
    const [sDate, setSDate] = useState(null);
    const [endDate, setEndDate] = useState(new Date());
    const [eDate, setEDate] = useState(null);
    const [visible, setVisible] = React.useState(false);
    const closeHandler = () => {
      setVisible(false);
    };
  
    const columns = [
      {
        key: "id",
        label: "#",
      },
      {
        key: "batchid",
        label: "No Payment",
      },
      {
        key: "createdt",
        label: "Entry",
      },
      {
        key: "claim_type",
        label: "Claim Type",
      },
      {
        key: "amount",
        label: "Amount",
      },
      {
        key: "name",
        label: "Requestor",
      },
      {
        key: "name_bank",
        label: "Bank",
      },
      {
        key: "no_bank",
        label: "Bank Number"
      },
      {
        key: "approval_dt",
        label: "Approved",
      }
    ];
  
  
    const rowss = dataState.map((item, i )=> 
    [
      {
        key: i,
        batchid: item.batchid,
        name: item.name,
        email: item.email,
        nik: item.nik,
        pengajuan_date: item.pengajuan_date,
        claim_type: item.claim_type,
        claim_id: item.claim_id,
        amount: item.amount,
        status: item.status,
        name_bank: item.name_bank,
        no_bank: item.no_bank,
        approval_dt: item.approval_dt
      },
    ]);
  
    

    const fetchRange = (from_date, end_date) => {
      setIsLoading(true)
      setTimeout(() => {
          axios.get(`${base_url}api/Batch/getBatch/date?from_date=${from_date}&end_date=${end_date}`).then(res => {
              setDataState(res.data)

              return null;
          }).catch(err => {
              console.log(err)
              setDataState([])
          })
      }, 2000);
    }

    const getByRange = async (from_date, end_date) => {
      try{
        setIsLoading(true)

        let getData = await fetchRange(from_date, end_date);
          if(getData == 0){
            setIsLoading(false)
            return null;
        }
          setModalMsg("Generate Success");
          setIsLoading(false)
          return null;
      }
      catch(err){
        setModalMsg("Failed to Generate, Please try again later!")
        setIsLoading(false)
        return null;
      }
    }
    const getClaim = () => {
      setDataState([{},{},{},{}])
      setIsLoading(true)
      setTimeout(() => {
          axios.get(`${base_url}api/Batch/getBatch/paid`).then(res => {
            if(res.data.length == 0){
              setDataState([{
                batchid: "There is no transaction",
                name: "There is no transaction",
                pangajuan_date: "There is no transaction",
                claim_type: "There is no transaction",
                claim_id: "There is no transaction",
                amount: "There is no transaction",
                status: "There is no transaction",
                name_bank: "There is no transaction",
                no_bank: "There is no transaction",
                approval_dt: "There is no transaction",
              }])
            }else{
              setDataState(res.data)
            }
          }).catch(err => {
              console.log(err)
              setDataState([{
                batchid: "There is no transaction",
                name: "There is no transaction",
                pangajuan_date: "There is no transaction",
                claim_type: "There is no transaction",
                claim_id: "There is no transaction",
                amount: "There is no transaction",
                status: "There is no transaction",
                name_bank: "There is no transaction",
                no_bank: "There is no transaction",
                approval_dt: "There is no transaction",
              }])
          })
          setIsLoading(false)
      }, 2000);
    }
  
    useEffect(() => {
      
      if(props.user.verify==false){
        router.push("/")
      }
      else{
        getClaim();
      }
    }, [])
  
  
    const router = useRouter()
  
    // Format to Rupiah
    const Rupiah = (number)=>{
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR"
      }).format(number);
    }

    // Format Date JS to ISO DateTime SQL Actual
    // const convertDates = (date) => {
    //   return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
    // }
    
    // Convert Start Date
    const convertSDate = async (date) => {
      var dates = await new Date(date).getUTCFullYear() + '-' +
      ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
      ('00' + date.getUTCDate()).slice(-2) + ' ' + 
      ('00').slice(-2) + ':' + 
      ('00').slice(-2) + ':' + 
      ('00').slice(-2);
      return await dates;
    }

    // Convert End Date
    const convertEDate = async (date) => {
      var dates = await new Date(date).getUTCFullYear() + '-' +
      ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
      ('00' + date.getUTCDate()).slice(-2) + ' ' + 
      ('23').slice(-2) + ':' + 
      ('59').slice(-2) + ':' + 
      ('59').slice(-2);
      return await dates;
    }

    const downloadExcel = async (data) => {

      // Create Column Header Name
      const worksheetColumnName = [
        "No.",
        "No Payment Batch",
        "No Claim Batch",
        "Entry Date",
        "Claim Type",
        "Amount",
        "Requestor",
        "Bank",
        "Bank Number",
        "Approved Date"
      ];

      // Sort Data to Column Row
      const Dataas = await data.map((datas, i) => {
        return [i+1, datas[0].batchid, datas[0].claim_id, datas[0].pengajuan_date, 
          datas[0].claim_type, datas[0].amount, datas[0].name, datas[0].name_bank, 
          datas[0].no_bank, datas[0].approval_dt]
      })

      // Create new Excel
      const workbook = await XLSX.utils.book_new();

      // Append Column Name and Column Row
      const worksheetData = [
        worksheetColumnName,
        ...Dataas
      ];

      // Create worksheet and insert it data
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      // Append Worksheet to Workbook
      await XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // Download the Excel File with the name Desired
      if(sDate==null && eDate == null){
        XLSX.writeFile(workbook, 'DataSheetAllDate.xls');
      }
      else{
        XLSX.writeFile(workbook, `DataSheet_From_${new Date(sDate).toLocaleDateString("es-CL")}_To_${new Date(eDate).toLocaleDateString("es-CL")}.xls`);
      }
    };

    return (
      <Layout isActiveTest="Transaction" UserData={props.user}>
  
      <Box css={{px: "$12", mt: "$8", "@xsMax": {px: "$10"}}}>
      
      <Text h3 css={{ textAlign: 'center' }}>
        {/* <Button onClick={()=>{
          }}>Test</Button> */}
      <Button.Group color="success" ghost>
        <Button auto onClick={()=> router.push('/Transaction/batch')}>Batch List</Button>
        <Button auto onClick={()=> router.push('/Transaction')}>Approved Payment List</Button>
        <Button className={styles.disabledButton} disabled auto>Paid Payment List</Button>
      </Button.Group>
      </Text>

      <Spacer y={1}/>

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
        <>
      <div className={styles.containerPicker}>
        <Text h3>Pick Date Range</Text>
        <div id="picker" className={styles.boxPicker}>
          <div className={styles.fromPicker}>
            <Text h4>From: </Text> <Spacer y="1"/>
            <Input 
              aria-label='start-date'
              initialValue={new Date()}
              type="date"
              size="lg"
              onChange={(e) => {
                console.log(e.target.valueAsNumber)
                if(e.target.valueAsNumber >= 4102444800000){
                  e.target.valueAsNumber = new Date().getTime()
                  setStartDate(new Date())
                }
                else{
                  console.log("success")
                  setStartDate(new Date(e.target.value))
                }
              }}
            />
          </div>
          <Spacer y="1"/>
          <div className={styles.toPicker}>
            <Text h4>To: </Text> <Spacer y="1"/>
            <Input
              aria-label='end-date'
              type="date"
              size="lg"
              onChange={(e) => {
                console.log(e.target.valueAsNumber)
                if(e.target.valueAsNumber >= 4102444800000){
                  e.target.valueAsNumber = new Date().getTime()
                  setEndDate(new Date())
                }
                else{
                  console.log("success")
                  setEndDate(new Date(e.target.value))
                }
              }}
            />
          </div>
        </div>
        <Button className={styles.dateGenBtn} 
        onClick={async ()=>{
          setIsLoading(true)
          setVisible(true)
          var from_date=await convertSDate(startDate);
          var end_date=await convertEDate(endDate)
          await getByRange(from_date, end_date);
          await setSDate(startDate)
          await setEDate(endDate)
          setIsLoading(false)
          console.log("Success")
          // console.log(" From "+await convertSDate(startDate)+" To "+await convertEDate(endDate))
        }}>Generate</Button>
      </div>

  
      <Grid.Container gap={2} className={styles.containerContent}>
        {sDate==null & eDate==null?
        <Text className={styles.textGenerated}>All Table Data Generated</Text>
        :
        <Text className={styles.textGenerated}>Table Data is generated from {new Date(sDate).toLocaleDateString("id-ID")} to {new Date(eDate).toLocaleDateString("id-ID")}</Text>
        }
        <Grid xs={12}>

        {
         isLoading==true || isLoading2==true ? 
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
            // defaultSelectedKeys={["2"]}
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
            {isLoading2 == true?
            <Loading className={styles.tableLoading} 
            type="default" 
            color="success" 
            loadingCss={{ $$loadingSize: "15vw", $$loadingBorder: "10px" }}
            // size="xl"
            >
            Retrieving Data...
            </Loading>
            :
            <Table.Body items={rowss}>
              {(item) => (
                <Table.Row key={item[0].key}>
                  <Table.Cell>{item[0].key+1}</Table.Cell>
                  <Table.Cell>{item[0].batchid}</Table.Cell>
                  <Table.Cell>{new Date(item[0].pengajuan_date).toLocaleDateString("id-ID")}</Table.Cell>
                  <Table.Cell>{item[0].claim_type}</Table.Cell>
                  <Table.Cell>{Rupiah(item[0].amount)}</Table.Cell>
                  <Table.Cell>{`${item[0].name?.length > 10 ? capitalizeEachWord(item[0].name).substring(0,10) : ''}...`}</Table.Cell>
                  <Table.Cell>{item[0].name_bank}</Table.Cell>
                  <Table.Cell>{item[0].no_bank}</Table.Cell>
                  <Table.Cell>{new Date(item[0].approval_dt).toLocaleDateString("id-ID")}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
            }
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
        <Button size="md" onClick={()=> downloadExcel(rowss)} color="success">
          Export to Excel
        </Button>
        <Grid xs={12}>
          
        </Grid>
      </Grid.Container>
     </>}

    {/* Modal Msg Start*/}
    <div>
      <Modal
        preventClose
        blur
        aria-labelledby="modal-title"
        open={visible}
        onClose={closeHandler}
        onOpen={async ()=>{
          await rowss, setIsLoading2(true)
        }}
      >
        <Modal.Header>
          <Text id="modal-title" b size={22}>
            Employee Claim Apps Message!
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Row justify="center">
            {
              isLoading == true ?
              <Loading className={styles.tableLoading} 
              type="default" 
              color="success" 
              size="xl"
              >
              <Text size="md">Generating Payment Batch...</Text>
              </Loading>
              :
              <Text size={20}>{modalMsg}</Text>
            }
          </Row>
        </Modal.Body>
        { isLoading == true?
          <></>
          :
        <Modal.Footer>
          <Button auto flat color="error" onClick={async ()=>{
            if(isLoading==false){
              setIsLoading2(false)
              setVisible(false);
            }else{
              setVisible(true)
            }
          }}>
            Close
          </Button>
        </Modal.Footer>
        }
      </Modal>
    </div>
    {/* Modal Msg End */}

    </Box>
    </Layout>
  
    )
}
