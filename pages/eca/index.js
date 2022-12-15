import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Grid, Input, Table, Modal, Text, Spacer, Loading, Row, Button, Divider} from "@nextui-org/react"
import { Box } from "../../components/Box"
import styles from "/styles/pages/transaction/Transaction.module.css"
import axios from '../../configs/axios'
import Layout from '../../components/layout'
import "react-datepicker/dist/react-datepicker.css"
import useBatch from "../api/batch"
import { withSessionSsr } from '../../lib/withSession';
import useNotification from '../api/notification'
import * as XLSX from 'xlsx';
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
    else if(user == undefined){
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
  const [selectedData, setSelectedData] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [getID, setGetID] = useState([]);
  const { 
    updatePaid
  } = useBatch()
  const {
    insertNotification,
    insertRating
  } = useNotification()


  // State for Modal
  const [modalMsg, setModalMsg] = useState("Something is wrong, please try again!");
  const [visible, setVisible] = React.useState(false);
  const [visible2, setVisible2] = React.useState(false);
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
    // {
    //   key: "paid_date",
    //   label: "Tanggal Bayar",
    // }
  ];

  // Temp Table Row Data
  const rows = [
    {
      id: "1",
      paid_date: "20/10/22",
      name: "PD2209012",
      createdt: "10/10/22",
      co_type: "421-Mileage",
      amount: "20000",
      status: "Waiting Approval",
      name_bank: "BCA",
      no_bank: "7200021",
    },
    {
        id: "2",
        paid_date: "20/10/22",
        name: "PD2209012",
        createdt: "10/10/22",
        co_type: "421-Mileage",
        amount: "20000",
        status: "Waiting Approval",
        name_bank: "BCA",
        no_bank: "7200021",
      },
      {
        id: "3",
        paid_date: "20/10/22",
        name: "PD2209012",
        createdt: "10/10/22",
        co_type: "421-Mileage",
        amount: "20000",
        status: "Approved",
        name_bank: "BCA",
        no_bank: "7200021",
      },
      {
        id: "4",
        paid_date: "20/10/22",
        name: "PD2209012",
        createdt: "10/10/22",
        co_type: "421-Mileage",
        amount: "20000",
        status: "Approved",
        name_bank: "BCA",
        no_bank: "7200021",
      },
      {
        id: "5",
        paid_date: "20/10/22",
        name: "PD2209012",
        createdt: "10/10/22",
        co_type: "421-Mileage",
        amount: "20000",
        status: "Waiting Approval",
        name_bank: "BCA",
        no_bank: "7200021",
      },
  ];

  // Set Table Row Data
  const rowss = dataState.map((item, i )=> 
  [
    {
      key: i,
      batchid: item.batchid,
      name: item.name,
      pengajuan_date: item.pengajuan_date,
      claim_type: item.claim_type,
      claim_id: item.claim_id,
      amount: item.amount,
      status: item.status,
      name_bank: item.name_bank,
      no_bank: item.no_bank
    },
  ]);

  // Batch Data
  const batchedArray = async () => {
    // Check if Selected row is all row or not
    if(selectedData!="all"){
      await selectedData.forEach(element => {
        batchData.push(dataState[element])
      });
      return console.log("batched");
    }
    else{
      // If Selected All
      const count=0;
      await rowss.forEach(element => {
        batchData.push(dataState[count])
        count+=1;
      });
      return console.log("batched all");
    }
  }

  // Convert Date to UTC Format
  const convertSDate = async (date) => {
    var dates = await new Date(date).getUTCFullYear() + '-' +
    ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
    ('00' + date.getUTCDate()).slice(-2) + ' ' + 
    ('00' + date.getUTCHours()).slice(-2) + ':' + 
    ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
    ('00' + date.getUTCMilliseconds()).slice(-2);
    return await dates;
  }

  // Function buat replace di spesifik line number
  String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
  }

  // Function Generate CSV
  // Ntar tambah, pak danil gaboleh masuk sini account nya
  const GenerateCSV = async () => {
    try{
      // Clear Array Temp Data
      setIsLoading(true)
      await setBatchData([]);
      // Get Selected Row from Table
      await batchedArray();
      setSelectedData([]);
      
        // await batchData.map( async (element) => {
        //   let paids = await updatePaid({
        //     batchid: element.batchid,
        //     app_dt: tanggals
        //   })
        // })
        if(batchData.length==0){
          setModalMsg("Please select a data first!")
          setIsLoading(false)
          setVisible2(true);
          return console.log("Generate Success");
        }
        else{
          // console.log(batchData);
          // console.log("Ini BatchData")
          let Dataas=[];

          let TotalAmount = 0;
          let TotalCount = 0;

          await batchData.map(async (datas, i)=>{
            let text_tmp="                                                                                                                                                                                                                                                                ";
            // console.log(datas.amount)
            // console.log("Ini amounts")
            let no_banks= datas.no_bank;
            let amounts = datas.amount;

            // Sum
            TotalAmount += datas.amount;
            TotalCount += 1;

            let kode_bcas = "BCA    1111111    BCA";
            let cabangs = "JAKARTA";
            // let kets = "RPU Cab JAKARTA SAJAKARTA H2 SAKA";
            let kets = datas.claim_type+"-"+datas.claim_id;
            let uniques = "1R014";
            let angka = "00000000000000000"
            let nama_reks = datas.name_bank
            // Get Bank Name after '-'
            nama_reks = nama_reks.split('-').pop();
            // Check -
            if(nama_reks.substring(0,1) == ' '){
              nama_reks = nama_reks.substring(1)
            }else{
              nama_reks = nama_reks.substring(0)
            }

            angka = angka.replaceAt(17-Math.ceil(Math.log10(amounts + 1)), String(amounts))

            text_tmp = text_tmp.replaceAt(0, "1"+String(no_banks))
            text_tmp = text_tmp.replaceAt(53, angka+".00"+nama_reks)
            text_tmp = text_tmp.replaceAt(143, kode_bcas)
            text_tmp = text_tmp.replaceAt(179, cabangs)
            text_tmp = text_tmp.replaceAt(197, kets)
            text_tmp = text_tmp.replaceAt(251, uniques)

            Dataas.push([text_tmp])
          })

          // console.log(TotalAmount);
          // console.log(TotalCount);

          // console.log("Ini Datas");
          // console.log(Dataas);
          let column_tmp="                                                                                                                                                                                                                                                                ";
          
          let head_tmp="0SP"
          let norek_tmp="7060300822 70600822"

          let TotalRecord="0000000BCA"
          let TotalAmounts="00000000000000000"

          // Define Total Records
          TotalRecord = TotalRecord.replaceAt(7-Math.ceil(Math.log10(TotalCount + 1)), String(TotalCount));
          // console.log(TotalRecord);

          // Define Total Amounts
          TotalAmounts = TotalAmounts.replaceAt(17-Math.ceil(Math.log10(TotalAmount + 1)), String(TotalAmount))
          // console.log(TotalAmounts)

          // Sort Column Head
          // Add 0sp
          column_tmp = column_tmp.replaceAt(0, head_tmp);
          // Add No Rek
          column_tmp = column_tmp.replaceAt(11, norek_tmp);
          // Add Amount - Total Batch
          column_tmp = column_tmp.replaceAt(45, TotalAmounts+"."+TotalRecord);
          
          // Change to Array
          let columnHead=[column_tmp];

          // Create new Excel
          const workbook = await XLSX.utils.book_new();
    
          // Append Column Name and Column Row
          const worksheetData = [
            columnHead,
            ...Dataas
          ];
    
          // Create worksheet and insert it data
          const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
          // Append Worksheet to Workbook
          await XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
          XLSX.writeFile(workbook, 'Data.txt');

          setModalMsg("CSV Generated!")
          setIsLoading(false)
          return console.log("Generate Success");
        }
      }
    catch(err){
      setModalMsg("Failed to Generate CSV, Please try again later!")
      console.log("Generate Failed");
      setIsLoading(false)
      return setVisible2(true);
    }
  }

  // Function Update Paid Status
  const PaidSelected = async (tanggals) => {
    try{
      // Clear Array Temp Data
      setIsLoading(true)
      await setBatchData([]);
      // Get Selected Row from Table
      await batchedArray();
      setSelectedData([]);
      
      // console.log("Batch Data")
      // console.log(batchData)
      // console.log("Tanggal:")
      // console.log(tanggals)
      if(!batchData.length != true){

        // Update Paid on Each array in BatchData
        await batchData.map( async (element) => {
          let paids = await updatePaid({
            batchid: element.batchid,
            app_dt: tanggals
          })
          // console.log(paids)
          // console.log(element)
          // console.log("before insert")
          // console.log(paids)
          if(paids != 200){
            console.log("FAILED UPDATEPAID")
            setModalMsg("Network Connection Error, please refresh/try again!");
            setIsLoading(false)
            return setVisible(true);
          }else{
            // Insert to Rating
            // console.log("INSERT RATE")
            let insertRate= await insertRating({claimid: element.claim_id});
            // console.log("AFTER INSERT RATE")
            // console.log(insertRate)
            if(insertRate == 200){
              // Insert Notification
              // console.log("BEFORE NOTIF")
              let insertNot= await insertNotification({
                nik: element.nik,
                header: `paid-Paid-${element.claim_id}`,
                description: `Your Request NO: ${element.claim_id} has been Paid`
              }
              );
              // console.log(insertNot)
              // console.log("AFTER NOTIF")
              if(insertNot==200){

                let sendData= await JSON.stringify(element);
                // console.log("Check String")
                // console.log(sendData)
                // console.log("GO Insert Email")
                // Insert Mail Notif
                let emailStat= await fetch('/api/email', {
                  method: 'POST',
                  headers: {
                    'Access-Control-Allow-Origin' : `${process.env.NEXT_PUBLIC_API_HOST}`,
                    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                  },
                  body: sendData
                })
                .then((res) => {
                  // console.log("After Fetch Email")
                  // console.log(res.status)
                  // console.log('Response received')
                  if (res.status === 200) {
                    console.log('Response succeeded!')
                    return res.status
                  }
                  else{
                    console.log("Error")
                    return res.status=400
                  }
                })
                // console.log("After Send Email")
                // console.log(emailStat)

                if(emailStat == 200){
                  console.log("Succes")
                  setModalMsg("Paid Success");
                  setIsLoading(false)
                  return setVisible2(true); 
                }else{
                  console.log("GAGAL Email")
                  setModalMsg("Something is wrong, Please try again later!");
                  setIsLoading(false)
                  return setVisible2(true);
                }
              }
              // Else from Insert Notif
              else{
                console.log("GAGAL NOTIF")
                setModalMsg("Something is wrong, Please try again later!");
                setIsLoading(false)
                return setVisible2(true);
              }
            }
            // Else Insert Rate
            else{
              console.log("GAGAL RATE")
              setModalMsg("Something is wrong, Please try again later!");
              setIsLoading(false)
              return setVisible2(true);
            }
          }
        // End Batch Data Map
        })
        setModalMsg("Paid Success");
        setIsLoading(false)
        return setVisible2(true);
      }
      else{
        setModalMsg("Select 1 or more Transaction to be Paid!");
        setIsLoading(false)
        return setVisible2(true);
      }
    }
    catch(err){
      setModalMsg("Failed to Update Payment, Please try again later!")
      setIsLoading(false)
      return setVisible2(true);
    }
  }

  

  useEffect(() => {
    const getClaim = () => {
      setDataState([{},{},{},{}])
      setIsLoading(true)
      setTimeout(() => {
          axios.get(`${base_url}api/Batch/getBatch/approved`).then(res => {
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
      getClaim();

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


  return (
    <Layout isActiveTest="Transaction" UserData={props.user}>
    <Box css={{px: "$12", mt: "$8", "@xsMax": {px: "$10"}}}>
    <Text h3 css={{ textAlign: 'center' }}>
      <Button.Group color="success" ghost>
        <Button auto onClick={()=> router.push('/Transaction/batch')}>Batch List</Button>
        <Button className={styles.disabledButton} disabled auto>Approved Payment List</Button>
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
            // disallowEmptySelection
            // defaultSelectedKeys={["0"]}
            selectionMode="multiple"
            animated={false}
            containerCss={{
              height: "auto",
              minWidth: "100%",
            }}
            onSelectionChange={(keys) =>  {setSelectedData(keys)}}
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
                  <Table.Cell>{item[0].batchid}</Table.Cell>
                  <Table.Cell>{new Date(item[0].pengajuan_date).toLocaleDateString("id-ID")}</Table.Cell>
                  <Table.Cell>{item[0].claim_type}</Table.Cell>
                  <Table.Cell>{Rupiah(item[0].amount)}</Table.Cell>
                  <Table.Cell>{item[0].name}</Table.Cell>
                  <Table.Cell>{item[0].name_bank}</Table.Cell>
                  <Table.Cell>{item[0].no_bank}</Table.Cell>
                  {/* <Table.Cell>
                    <Button size="xs" onClick={()=>{setVisible(true), setGetID(item[0].batchid)}}>
                      Paid
                    </Button>
                  </Table.Cell> */}
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
          {isLoading==true?<></>:
          <div className={styles.buttonTable}>
            <Button className={styles.btnTblChild}
            onClick={async ()=> {
              await GenerateCSV()
            }}>Generate CSV</Button>
            <Spacer y={1}/>
            <Button className={styles.btnTblChild}
            onClick={async ()=> {
              setVisible(true);
            }}>Update Paid Status</Button>
          </div>
          }
      <Grid xs={12}>
      </Grid>
    </Grid.Container>
   
    {/* Modal Pick Payment Date*/}
    <div>
      <Modal
        autoMargin={true}
        preventClose
        blur
        aria-labelledby="modal-title"
        width="400px"
        // css={{height:450}}
        id="modal-date"
        open={visible}
        onClose={closeHandler}
      >
        <Modal.Header>
          <Text id="modal-title" b size={22}>
            Pick Payment Date
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
              <Text size="md">Validating Data...</Text>
              </Loading>
              :
              <div className={styles.modalPickers}>
                <Input 
                  className={styles.datePicker}
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
            }
          </Row>
        </Modal.Body>
        <Modal.Footer justify='center'>
          <Button auto flat color="error" onClick={()=>{
              setVisible(false);
          }}>
            Cancel
          </Button>
          <Button auto flat color="primary" onClick={async ()=>{
              setVisible(false);
              setVisible2(true);
              var tanggals = await convertSDate(startDate)
              console.log("New DAtes")
              console.log(tanggals)
              console.log("END Dassta")
              await PaidSelected(tanggals);
              // router.reload()
            }}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    {/* Modal Date Picker End */}

    {/* Modal Msg */}
    <div>
      <Modal
        preventClose
        blur
        aria-labelledby="modal-title"
        open={visible2}
        onClose={closeHandler}
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
              <Text size="md">Processing Paid Status...</Text>
              </Loading>
              :
              <Text size={20}>{modalMsg}</Text>
            }
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onClick={()=>{
            if(modalMsg != "Paid Success"){
              setVisible2(false);
            }
            else{
              setVisible2(false);
              router.reload();
            }
            }}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    {/* Modal Msg End */}
    
  </Box>
  </Layout>

  )
}
