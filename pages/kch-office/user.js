import CryptoJS from 'crypto-js';
import axios from '../../configs/kch-office/axios'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Text, Popover, Dropdown ,Modal, Grid, Table, Input, Textarea,  Button, Image, Row, Col, Tooltip, Switch } from "@nextui-org/react";

import Layout from "../../components/layout";
import { withSessionSsr } from '../../lib/withSession';
import { Box } from "../../components/Box"
import { StyledBadge } from "../../components/StyledBadge"
import { IconButton } from "../../components/IconButton"
import { EyeIcon } from "../../components/Icon/EyeIcon"
import { EditIcon } from "../../components/Icon/EditIcon"
import { DeleteIcon } from "../../components/Icon/DeleteIcon"

import errorHandler from '../../configs/errorHandler';
import slugify from '../../helpers/slugify'
import capitalizeEachWord from '../../helpers/capitalizeEachWord'
import useForm from '../../helpers/useForm'
import Router from 'next/router';


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

export default function User(props) {

    const [fetchData, setFetchData] = useState(false)
    const [userData, setUserData] = useState([])
    const [userDataTemp, setUserDataTemp] = useState([])
    const [departmentData, setDepartmentData] = useState([])
    const [divisionData, setDivisionData] = useState([])
    const [jobLevelData, setJobLevelData] = useState([])

    const [user, setUser] = useState(props.user)

    const [addModals, setAddModals] = useState(false)
    const [detailsModals, setDetailsModals] = useState({})
    const [editModals, setEditModals] = useState({})
    
    const [state, setState, newState] = useForm({
      nik: '',
      name: '',
      email: '',
      superior: new Set(["0_Select Superior"]),
      department: new Set(["0_Select Department"]),
      division: new Set(["0_Select Division"]),
      jobPositionName: '',
      jobLvlName: '',
      golongan: 0,
      userAccess: new Set(["0_Select Access Type"]),
    })

    const selectedSuperior = useMemo(
      () => Array.from(state.superior).join("").split("_")[1],
      [state.superior] 
    );

    const selectedDepartment = useMemo(
      () => Array.from(state.department).join("").split("_")[1],
      [state.department]
    );

    const selectedDivision = useMemo(
      () => Array.from(state.division).join("").split("_")[1],
      [state.division]
    );

    const selectedUserAccess = useMemo(
      () => Array.from(state.userAccess).join("").split("_")[1],
      [state.userAccess]
    );

    const fetchAPI = useCallback(async (url) => {
      const response = await axios.get(url, {
        headers: {
          'Authorization' : 'Bearer ' + user.token
        }
      })
      .then(res => {
        return res.data
      })
      .catch(err => {
        errorHandler("An Error when Fetching Data")
        return err.response.status
      })

      return response
    }, [user])

    const getData = useCallback(async () => {
      let user = await fetchAPI('/api/user')
      
      if (departmentData.length === 0 && divisionData.length === 0 && jobLevelData.length === 0) {
        let department = await fetchAPI('/api/user/department')
        let division = await fetchAPI('/api/user/division')
        let jobLevel = await fetchAPI('/api/user/job-level')

        setDepartmentData(department)
        setDivisionData(division)
        setJobLevelData(jobLevel)
      }

      setUserData(user)
      setUserDataTemp(user)
      setFetchData(true)

    }, [departmentData, divisionData, jobLevelData ,fetchAPI])


    const postAPI = async (url, data) => {
      const response = await axios.post(url, data, {
        headers: {
          'Authorization' : 'Bearer ' + user.token
        }
      })
      .then(res => {
        return res.data
      })
      .catch(err => {
        errorHandler("An Error when Insert Data")
        return err.response.status
      })

      return response
    }

    const putAPI = async (url, data) => {
      const response = await axios.put(url, data, {
        headers: {
          'Authorization' : 'Bearer ' + user.token
        }
      })
      .then(res => {
        return res.status
      })
      .catch(err => {
        errorHandler("An Error when Update Data")
        return err.response.status
      })

      return response
    }

    const deleteAPI = async (url) => {
      const response = await axios.delete(url,{
        headers: {
          'Authorization' : 'Bearer ' + user.token
        }
      })
      .then(res => {
        return res.status
      })
      .catch(err => {
        errorHandler("An Error when delete Data")
        return err.response.status
      })

      return response
    }

    const searchOnChange = (event) => {
        let search = event.target.value
        let searchUser = []

        userData.map((data) => {
            let dataExists = false
            let searchKey = slugify(search)

            // Find user by name
            let nik = slugify(data.nik)
            
            if (nik?.includes(searchKey) && !dataExists) {
              searchUser.push(data)
                dataExists = true
            }

            // Find user by name
            let name = slugify(data.name)
            
            if (name?.includes(searchKey) && !dataExists) {
              searchUser.push(data)
                dataExists = true
            }

            // Find user by email
            let email = slugify(data.email)
            
            if (email?.includes(searchKey) && !dataExists) {
              searchUser.push(data)
                dataExists = true
            }

            // Find user by department
            let department = slugify(data.deptName)
            
            if (department?.includes(searchKey) && !dataExists) {
              searchUser.push(data)
                dataExists = true
            }

            // Find user by division
            let division = slugify(data.divName)
            
            if (division?.includes(searchKey) && !dataExists) {
              searchUser.push(data)
                dataExists = true
            }

        })

        setUserDataTemp(searchUser)
    }

    const addUser = async () => {
      let superior = Array.from(state.superior).join("").split("_")
      superior = superior[1]?.split("-")

      let department = Array.from(state.department).join("").split("_")
      department = department[1]

      let division = Array.from(state.division).join("").split("_")
      division = division[1]

      let userAccess = Array.from(state.userAccess).join("").split("_")
      userAccess = userAccess[1]

      if (superior.length === 0 || superior === undefined || superior[0] === 'Select Superior') {
        return alert ("Please select superior")
      }

      if (department === "Select Department") {
        return alert ("Please select department")
      }

      if (division === "Select Division") {
        return alert ("Please select division")
      }

      if (userAccess === "Select Access Type") {
        return alert ("Please select user access type")
      }

      // Insert with default password
      let key = CryptoJS.enc.Utf8.parse(process.env.NEXT_PUBLIC_AES_HASH_KEY)
      let iv = CryptoJS.enc.Utf8.parse(process.env.NEXT_PUBLIC_AES_IV_KEY)

      let encryptedPassword = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse('20221205'), key, {iv:iv, mode:CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7})

      let insertUser = await postAPI('/api/user', {
        nik: state.nik,
        name: state.name,
        email: state.email,
        password: encryptedPassword.ciphertext.toString(CryptoJS.enc.Base64),
        superiorName: superior[1],
        superiorNik: superior[0],
        deptName: department,
        divName: division,
        jobLvlName: state.jobLvlName,
        jobPositionName: state.jobPositionName,
        golongan: state.golongan,
        is_admin: userAccess === 'Admin' ? 1 : 0,
      });

      if (insertUser?.uid_user !== undefined) {
        newState({
          nik: '',
          name: '',
          email: '',
          superior: new Set(["0_Select Superior"]),
          department: new Set(["0_Select Department"]),
          division: new Set(["0_Select Division"]),
          jobPositionName: '',
          jobLvlName: '',
          golongan: 0,
          userAccess: new Set(["0_Select Access Type"]),
        })
        setAddModals(false)
        await getData();
      }
      else alert ("Ther is an error when insert user")

    }

    const updateUser = async () => {
      let superior = Array.from(state.superior).join("").split("_")
      superior = superior[1]?.split("-")

      let department = Array.from(state.department).join("").split("_")
      department = department[1]

      let division = Array.from(state.division).join("").split("_")
      division = division[1]

      let userAccess = Array.from(state.userAccess).join("").split("_")
      userAccess = userAccess[1]

      let updateUser = await putAPI('/api/user', {
        uid_user: editModals.uid_user,
        nik: state.nik === '' ? editModals.nik : state.nik,
        name: state.name  === '' ? editModals.name : state.name,
        email: state.email  === '' ? editModals.email : state.email,
        password: editModals.password,
        superiorName: superior[0] === 'Select Superior For Update' ? editModals.superiorName : superior[1],
        superiorNik: superior[0] === 'Select Superior For Update' ? editModals.superiorNIK : superior[0],
        deptName: department === "Select Department For Update" ? editModals.deptName : department,
        divName: division === "Select Division For Update" ? editModals.divName : division,
        jobLvlName: state.jobLvlName === '' ? editModals.jobLvlName : state.jobLvlName,
        jobPositionName: state.jobPositionName === '' ? editModals.jobPositionName : state.jobPositionName,
        golongan: state.golongan === 0 ? editModals.golongan : state.golongan,
        is_admin: userAccess === 'Select Access Type' ? editModals.is_admin : userAccess === 'Admin' ? 1 : 0,
      });

      if (updateUser === 200) {
        newState({
          nik: '',
          name: '',
          email: '',
          superior: new Set(["0_Select Superior"]),
          department: new Set(["0_Select Department"]),
          division: new Set(["0_Select Division"]),
          jobPositionName: '',
          jobLvlName: '',
          golongan: 0,
          userAccess: new Set(["0_Select Access Type"]),
        })

        setEditModals(false)
        await getData();
      }
      else alert ("Ther is an error when update user")

    }

    const deleteUser = async (item) => {
      let user = await deleteAPI('/api/user/' + item.uid_user)
      if (user === 200)  await getData();
    }

    useEffect(() => {
      if (!fetchData) {
        getData()
        setFetchData(true)
      }

    }, [fetchData, userData, userDataTemp, user, getData])  

    return (
      <>
        <Layout appName='kch-office' isActive='user' UserData={props.user}>
            <Box css={{px: "$12", mt: "$12", "@xsMax": {px: "$10"}}}>

            <Row>
              <Row justify="left">
                <Text h2 weight="medium" css={{ marginTop: "$5" }} >User Management</Text>
              </Row>
              <Row justify="right" css={{ mt: "$8", paddingTop: "2px"}}>
                <Button auto flat color="primary" css={{marginLeft: "0.675rem", marginRight: "0.675rem"}} onClick={() => getData()}>
                  Refresh
                </Button>
                <Button auto flat color="success" css={{ marginRight: "0.675rem"}} onClick={() => setAddModals(true)}>
                  + Add
                </Button>
                <Input clearable size="lg" placeholder="Search Here" css={{ width: "300px"}}  onChange={searchOnChange}/>
              </Row>
            </Row>

              <Table
                aria-label="Example table with custom cells"
                css={{
                  height: "auto",
                  minWidth: "100%",
                }}
                selectionMode="single"
              >
                <Table.Header>
                  <Table.Column css={{ width: "10%"}}>NIK</Table.Column>
                  <Table.Column css={{ width: "15%"}}>Name</Table.Column>
                  <Table.Column css={{ width: "15%"}}>email</Table.Column>
                  <Table.Column css={{ width: "20%"}}>Department</Table.Column>
                  <Table.Column css={{ width: "20%"}}>Division</Table.Column>
                  <Table.Column css={{ width: "10%"}}>Action</Table.Column>
                </Table.Header>
                <Table.Body>
                  {
                    userDataTemp?.map((item, index) => {
                      return (
                        <Table.Row key={index}>
                          <Table.Cell>{item.nik}</Table.Cell>
                          <Table.Cell>{item.name}</Table.Cell>
                          <Table.Cell>{item.email}</Table.Cell>
                          <Table.Cell>{item.deptName}</Table.Cell>
                          <Table.Cell>{item.divName}</Table.Cell>
                          <Table.Cell>
                            <Row justify="center" align="center">
                              <Col css={{ d: "flex" }}>
                                <Tooltip content="Details">
                                  <IconButton onClick={() => setDetailsModals(item)}>
                                    <EyeIcon size={20} fill="#979797" />
                                  </IconButton>
                                </Tooltip>
                              </Col>
                              <Col css={{ d: "flex" }}>
                                <Tooltip content="Edit User">
                                  <IconButton onClick={() => {
                                      setEditModals(item)
                                      newState({
                                        superior: new Set(["0_Select Superior For Update"]),
                                        department: new Set(["0_Select Department For Update"]),
                                        division: new Set(["0_Select Division For Update"]),
                                        userAccess: new Set(["0_Select Access Type For Update"])
                                      })
                                  }}>
                                    <EditIcon size={20} fill="#979797" />
                                  </IconButton>
                                </Tooltip>
                              </Col>
                              {
                                user.nik !== item.nik ? (
                                  <Col css={{ d: "flex" }}>
                                    <Tooltip
                                      content="Delete User"
                                      color="error"
                                      onClick={() => setDeleteModals(item)}
                                    ><Popover>
                                        <Popover.Trigger>
                                          <IconButton>
                                            <DeleteIcon size={20} fill="#FF0080" />
                                          </IconButton>
                                        </Popover.Trigger>
                                        <Popover.Content>
                                        <Grid.Container
                                          css={{ borderRadius: "20px", padding: "0.75rem", maxWidth: "330px", boxShadow: "rgba(0,0,0, 0.5)" }}
                                        >
                                          <Row justify="center" align="center">
                                            <Text b>Confirm</Text>
                                          </Row>
                                          <Row>
                                            <Text>
                                              Are you sure you want to delete this User
                                            </Text>
                                          </Row>
                                          <Grid.Container justify="space-between" alignContent="center">
                                            <Grid>
                                              <Button size="sm" light>
                                                Cancel
                                              </Button>
                                            </Grid>
                                            <Grid>
                                              <Button size="sm" color="error" onPress={() => deleteUser(item)}>
                                                Delete
                                              </Button>
                                            </Grid>
                                          </Grid.Container>
                                        </Grid.Container>
                                        </Popover.Content>
                                      </Popover>
                                    </Tooltip>
                                  </Col>
                                ) : (
                                  <Col css={{ d: "flex" }}></Col>
                                )
                                
                              }
                            </Row>
                          </Table.Cell>
                        </Table.Row>
                      )
                    })
                  }
                </Table.Body>
              </Table>
            </Box>

           {/* Detail User */}
           <Modal
              closeButton
              scroll
              blur
              aria-labelledby="modal-title"
              width="600px"
              open={detailsModals?.uid_user !== undefined}
              onClose={() => setDetailsModals({})}
            >
              <Modal.Header>
                <Text id="modal-title" size={18}>
                  <Text b size={18}>
                    Detail User
                  </Text>
                </Text>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Text b size={16} css={{ width:"30%"}}>NIK</Text>
                  <Text size={14} css={{ width:"70%"}}>: {detailsModals?.nik}</Text>
                </Row>

                <Row>
                  <Text b size={16} css={{ width:"30%"}}>Name</Text>
                  <Text size={14} css={{ width:"70%"}}>: {detailsModals?.name}</Text>
                </Row>

                <Row>
                  <Text b size={16} css={{ width:"30%"}}>email</Text>
                  <Text size={14} css={{ width:"70%"}}>: {detailsModals?.email}</Text>
                </Row>

                <Row css={{ marginTop: '12px' }}>
                  <Text b size={16} css={{ width:"30%"}}>Superior Name</Text>
                  <Text size={14} css={{ width:"70%"}}>: {detailsModals?.superiorName}</Text>
                </Row>
                <Row>
                  <Text b size={16} css={{ width:"30%"}}>Superior NIK </Text>
                  <Text size={14} css={{ width:"70%"}}>: {detailsModals?.superiorNIK}</Text>
                </Row>

                <Row css={{ marginTop: '12px' }}>
                  <Text b size={16} css={{ width:"30%"}}>Department Name</Text>
                  <Text size={14} css={{ width:"70%"}}>: {detailsModals?.deptName}</Text>
                </Row>
                <Row>
                  <Text b size={16} css={{ width:"30%"}}>Division Name</Text>
                  <Text size={14} css={{ width:"70%"}}>:  {detailsModals?.divName}</Text>
                </Row>
                <Row>
                  <Text b size={16} css={{ width:"30%"}}>Job Position Name</Text>
                  <Text size={14} css={{ width:"70%"}}>: {detailsModals?.jobPositionName}</Text>
                </Row>
                <Row>
                  <Text b size={16} css={{ width:"30%"}}>Job Level Name</Text>
                  <Text size={14} css={{ width:"70%"}}>: {detailsModals?.jobLvlName}</Text>
                </Row>
                <Row>
                  <Text b size={16} css={{ width:"30%"}}>Golongan</Text>
                  <Text size={14} css={{ width:"70%"}}>: {detailsModals?.golongan}</Text>
                </Row>

                <Row css={{ marginTop: '12px' }}>
                  <Text b size={16} css={{ width:"30%"}}>Status User</Text>
                  <Text size={14} css={{ width:"70%"}}>: {detailsModals?.is_admin === 1 ? 'Admin' : 'User'}</Text>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button auto flat color="error" onClick={() => setDetailsModals({})}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
           
           {/* Edit User */}
            <Modal
              closeButton
              blur
              scroll
              aria-labelledby="modal-title"
              width="600px"
              open={editModals?.uid_user !== undefined}
              onClose={() => setEditModals({})}
            >
              <Modal.Header>
                <Text id="modal-title" size={18}>
                  <Text b size={18}>Edit User</Text>
                </Text>
              </Modal.Header>
              <Modal.Body>
              <Input
                clearable
                fullWidth
                color="primary"
                label='NIK'
                value={state.nik === '' ? editModals?.nik : state.nik}
                size="md"
                placeholder="22XXXX"
                onChange={event => {
                  let value = event.target.value
                  newState({ nik : value})
                }}
              />
              <Input
                clearable
                fullWidth
                color="primary"
                label='User Name'
                value={state.name === '' ? editModals?.name : state.name}
                size="md"
                placeholder="Jhon Doe"
                onChange={event => {
                  let value = event.target.value
                  newState({ name : value })
                }}
              />

              <Input
                clearable
                fullWidth
                color="primary"
                label='E-Mail'
                value={state.email === '' ? editModals?.email : state.email}
                size="md"
                placeholder="user@sakafarma.com"
                onChange={event => {
                  let value = event.target.value
                  newState({ email : value })
                }}
              />

              <Text size={14} color="primary" >User Report to : </Text>
              <Text size={12} css={{marginTop:"-12px"}} >Current Superior : {editModals.superiorNIK} - {editModals.superiorName}</Text>
              <Row>
                <Dropdown>
                  <Dropdown.Button flat color="secondary" css={{ marginLeft: "$8"}}>
                    {selectedSuperior}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    css={{ $$dropdownMenuWidth: "500px"}} 
                    aria-label="Single selection actions"
                    color="secondary"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={state.superior}
                    onSelectionChange={(value) => {
                      newState({ superior: value})
                      // getData(value) 
                    }}
                  >
                  <Dropdown.Item key="0_Select Superior For Update">Select Superior For Update</Dropdown.Item>
                  {
                    userData.length > 0 && (
                      userData.map((item, index) => {
                        return (
                          <Dropdown.Item key={`${index+1}_${item.nik}-${item.name}`}>{item.nik} - {item.name}</Dropdown.Item>
                        )
                      })
                    )
                  }
                  </Dropdown.Menu>
                </Dropdown>
              </Row>

              <Text size={14} color="primary" >Department Name : </Text>
              <Text size={12} css={{marginTop:"-12px"}} >Current Department : {editModals.deptName}</Text>
              <Row>
                <Dropdown>
                  <Dropdown.Button flat color="secondary" css={{ marginLeft: "$8"}}>
                    {selectedDepartment}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    css={{ $$dropdownMenuWidth: "500px"}} 
                    aria-label="Single selection actions"
                    color="secondary"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={state.department}
                    onSelectionChange={(value) => {
                      newState({ department: value})
                      // getData(value) 
                    }}
                  >
                  <Dropdown.Item key="0_Select Department For Update">Select Department For Update</Dropdown.Item>
                  {
                    departmentData.length > 0 && (
                      departmentData.map((item, index) => {
                        return (
                          <Dropdown.Item key={`${index+1}_${item}`}>{item}</Dropdown.Item>
                        )
                      })
                    )
                  }
                  </Dropdown.Menu>
                </Dropdown>
              </Row>

              <Text size={14} color="primary" >Division Name : </Text>
              <Text size={12} css={{marginTop:"-12px"}} >Current Division : {editModals.divName}</Text>
              <Row>
                <Dropdown css={{ $$dropdownWidth: "500px" }}>
                  <Dropdown.Button flat color="secondary" css={{ marginLeft: "$8"}}>
                    {selectedDivision}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    css={{ $$dropdownMenuWidth: "500px"}} 
                    aria-label="Single selection actions"
                    color="secondary"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={state.division}
                    onSelectionChange={(value) => {
                      newState({ division: value})
                      // getData(value) 
                    }}
                  >

                  <Dropdown.Item key="0_Select Department">Select Division For Update</Dropdown.Item>
                  {
                    divisionData.length > 0 && (
                      divisionData.map((item, index) => {
                        return (
                          <Dropdown.Item key={`${index+1}_${item}`}>{item}</Dropdown.Item>
                        )
                      })
                    )
                  }
                  </Dropdown.Menu>
                </Dropdown>
              </Row>

              <Input
                clearable
                fullWidth
                color="primary"
                label='Job Position Name'
                value={state.jobPositionName === '' ? editModals.jobPositionName : state.jobPositionName}
                size="md"
                placeholder="SFL - Job Position Name"
                onChange={event => {
                  let value = event.target.value
                  newState({ jobPositionName : value })
                }}
              />

              <Text size={14} color="primary" >Job Level : </Text>
              <Text size={12} css={{marginTop:"-12px"}} >Current Job Level : {editModals.jobLvlName}</Text>
              <Row>
                <Dropdown>
                  <Dropdown.Button flat color="secondary" css={{ marginLeft: "$8"}}>
                    {state.jobLvlName === '' ? "Select Job Level" : state.jobLvlName}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    css={{ $$dropdownMenuWidth: "500px"}} 
                    aria-label="Single selection actions"
                    color="secondary"
                    selectionMode="single"
                    onSelectionChange={(value) => {
                      newState({ jobLvlName: Array.from(value).join("")})
                    }}
                  >
                    <Dropdown.Item key="">Select Job Level</Dropdown.Item>
                    {
                      jobLevelData.length > 0 && (
                        jobLevelData.map((item, index) => {
                          return (
                            <Dropdown.Item key={`${item}`}>{item}</Dropdown.Item>
                          )
                        })
                      )
                    }
                    <Dropdown.Item key="INTERN">INTERN</Dropdown.Item>
                    <Dropdown.Item key="OUTSOURCE">OUTSOURCE</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Row>

              <Text size={14} color="primary" >Golongan : </Text>
              <Text size={12} css={{marginTop:"-12px"}} >Current Golongan : {editModals.golongan}</Text>
              <Row>
                <Dropdown css={{ $$dropdownWidth: "500px" }}>
                  <Dropdown.Button flat color="secondary" css={{ marginLeft: "$8"}}>
                  { state.golongan === 0  ? 'Select Golongan For Update' : 'Golongan ' +  state.golongan}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    css={{ $$dropdownMenuWidth: "500px"}} 
                    aria-label="Single selection actions"
                    color="secondary"
                    disallowEmptySelection
                    selectionMode="single"
                    onSelectionChange={(value) => {
                      newState({ golongan: parseInt(Array.from(value).join("")[0])})
                      // getData(value) 
                    }}
                  >

                  <Dropdown.Item key="0">Select Golongan For Update</Dropdown.Item>
                  <Dropdown.Item key="1">Golongan 1</Dropdown.Item>
                  <Dropdown.Item key="2">Golongan 2</Dropdown.Item>
                  <Dropdown.Item key="3">Golongan 3</Dropdown.Item>
                  <Dropdown.Item key="4">Golongan 4</Dropdown.Item>
                  <Dropdown.Item key="5">Golongan 5</Dropdown.Item>
                  <Dropdown.Item key="6">Golongan 6</Dropdown.Item>
                  <Dropdown.Item key="7">Golongan 7</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Row>

            <Text size={14} color="primary" >User Access Type : </Text>
            <Text size={12} css={{marginTop:"-12px"}} >Current User Access Type : {editModals.is_admin === 1 ? 'Admin' : 'User'}</Text>
              <Row>
                <Dropdown css={{ $$dropdownWidth: "500px" }}>
                  <Dropdown.Button flat color="secondary" css={{ marginLeft: "$8"}}>
                    {selectedUserAccess}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    css={{ $$dropdownMenuWidth: "500px"}} 
                    aria-label="Single selection actions"
                    color="secondary"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={state.userAccess}
                    onSelectionChange={(value) => {
                      newState({ userAccess: value})
                      // getData(value) 
                    }}
                  >

                  <Dropdown.Item key="0_Select Access Type For Update">Select Access Type For Update</Dropdown.Item>
                  <Dropdown.Item key="0_Admin">Admin</Dropdown.Item>
                  <Dropdown.Item key="0_User">User</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Row>


              </Modal.Body>
              <Modal.Footer>
                <Button auto flat color="error" onClick={() => setEditModals({})}>
                  Close
                </Button>
                <Button auto flat color="primary" onPress={() => updateUser()}>
                  Save
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Add User */}
            <Modal
              closeButton
              blur
              scroll
              aria-labelledby="modal-title"
              width="600px"
              open={addModals}
              onClose={() => setAddModals(false)}
            >
              <Modal.Header>
                <Text id="modal-title" size={18}>
                  <Text b size={18}>Add User</Text>
                </Text>
              </Modal.Header>
              <Modal.Body>
              <Input
                clearable
                fullWidth
                color="primary"
                label='NIK'
                value={state.nik}
                size="md"
                placeholder="22XXXX"
                onChange={event => {
                  let value = event.target.value
                  newState({ nik : value})
                }}
              />
              <Input
                clearable
                fullWidth
                color="primary"
                label='User Name'
                value={state.name}
                size="md"
                placeholder="Jhon Doe"
                onChange={event => {
                  let value = event.target.value
                  newState({ name : value })
                }}
              />

              <Input
                clearable
                fullWidth
                color="primary"
                label='E-Mail'
                value={state.email}
                size="md"
                placeholder="user@sakafarma.com"
                onChange={event => {
                  let value = event.target.value
                  newState({ email : value })
                }}
              />

              <Text size={14} color="primary" >User Report to : </Text>
              <Row>
                <Dropdown>
                  <Dropdown.Button flat color="secondary" css={{ marginLeft: "$8"}}>
                    {selectedSuperior}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    css={{ $$dropdownMenuWidth: "500px"}} 
                    aria-label="Single selection actions"
                    color="secondary"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={state.superior}
                    onSelectionChange={(value) => {
                      newState({ superior: value})
                      // getData(value) 
                    }}
                  >
                  <Dropdown.Item key="0_Select Superior">Select Superior</Dropdown.Item>
                  {
                    userData.length > 0 && (
                      userData.map((item, index) => {
                        return (
                          <Dropdown.Item key={`${index+1}_${item.nik}-${item.name}`}>{item.nik} - {item.name}</Dropdown.Item>
                        )
                      })
                    )
                  }
                  </Dropdown.Menu>
                </Dropdown>
              </Row>

              <Text size={14} color="primary" >Department Name : </Text>
              <Row>
                <Dropdown>
                  <Dropdown.Button flat color="secondary" css={{ marginLeft: "$8"}}>
                    {selectedDepartment}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    css={{ $$dropdownMenuWidth: "500px"}} 
                    aria-label="Single selection actions"
                    color="secondary"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={state.department}
                    onSelectionChange={(value) => {
                      newState({ department: value})
                      // getData(value) 
                    }}
                  >
                  <Dropdown.Item key="0_Select Department">Select Department</Dropdown.Item>
                  {
                    departmentData.length > 0 && (
                      departmentData.map((item, index) => {
                        return (
                          <Dropdown.Item key={`${index+1}_${item}`}>{item}</Dropdown.Item>
                        )
                      })
                    )
                  }
                  </Dropdown.Menu>
                </Dropdown>
              </Row>

              <Text size={14} color="primary" >Division Name : </Text>
              <Row>
                <Dropdown css={{ $$dropdownWidth: "500px" }}>
                  <Dropdown.Button flat color="secondary" css={{ marginLeft: "$8"}}>
                    {selectedDivision}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    css={{ $$dropdownMenuWidth: "500px"}} 
                    aria-label="Single selection actions"
                    color="secondary"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={state.division}
                    onSelectionChange={(value) => {
                      newState({ division: value})
                      // getData(value) 
                    }}
                  >

                  <Dropdown.Item key="0_Select Department">Select Division</Dropdown.Item>
                  {
                    divisionData.length > 0 && (
                      divisionData.map((item, index) => {
                        return (
                          <Dropdown.Item key={`${index+1}_${item}`}>{item}</Dropdown.Item>
                        )
                      })
                    )
                  }
                  </Dropdown.Menu>
                </Dropdown>
              </Row>

              <Input
                clearable
                fullWidth
                color="primary"
                label='Job Position Name'
                value={state.jobPositionName}
                size="md"
                placeholder="SFL - Job Position Name"
                onChange={event => {
                  let value = event.target.value
                  newState({ jobPositionName : value })
                }}
              />

              <Text size={14} color="primary" >Job Level : </Text>
              <Row>
                <Dropdown>
                  <Dropdown.Button flat color="secondary" css={{ marginLeft: "$8"}}>
                    {state.jobLvlName === '' ? "Select Job Level" : state.jobLvlName}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    css={{ $$dropdownMenuWidth: "500px"}} 
                    aria-label="Single selection actions"
                    color="secondary"
                    selectionMode="single"
                    onSelectionChange={(value) => {
                      newState({ jobLvlName: Array.from(value).join("")})
                    }}
                  >
                    <Dropdown.Item key="">Select Job Level</Dropdown.Item>
                    {
                      jobLevelData.map((item, index) => {
                        return (
                          <Dropdown.Item key={`${item}`}>{item}</Dropdown.Item>
                        )
                      })
                    }
                    <Dropdown.Item key="INTERN">INTERN</Dropdown.Item>
                    <Dropdown.Item key="OUTSOURCE">OUTSOURCE</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Row>

              <Text size={14} color="primary" >Golongan : </Text>
              <Row>
                <Dropdown css={{ $$dropdownWidth: "500px" }}>
                  <Dropdown.Button flat color="secondary" css={{ marginLeft: "$8"}}>
                  { state.golongan === 0  ? 'Select Golongan' : 'Golongan ' +  state.golongan}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    css={{ $$dropdownMenuWidth: "500px"}} 
                    aria-label="Single selection actions"
                    color="secondary"
                    disallowEmptySelection
                    selectionMode="single"
                    onSelectionChange={(value) => {
                      newState({ golongan: parseInt(Array.from(value).join("")[0])})
                      // getData(value) 
                    }}
                  >

                  <Dropdown.Item key="0">Select Golongan</Dropdown.Item>
                  <Dropdown.Item key="1">Golongan 1</Dropdown.Item>
                  <Dropdown.Item key="2">Golongan 2</Dropdown.Item>
                  <Dropdown.Item key="3">Golongan 3</Dropdown.Item>
                  <Dropdown.Item key="4">Golongan 4</Dropdown.Item>
                  <Dropdown.Item key="5">Golongan 5</Dropdown.Item>
                  <Dropdown.Item key="6">Golongan 6</Dropdown.Item>
                  <Dropdown.Item key="7">Golongan 7</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Row>
              

            <Text size={14} color="primary" >User Access Type : </Text>
              <Row>
                <Dropdown css={{ $$dropdownWidth: "500px" }}>
                  <Dropdown.Button flat color="secondary" css={{ marginLeft: "$8"}}>
                    {selectedUserAccess}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    css={{ $$dropdownMenuWidth: "500px"}} 
                    aria-label="Single selection actions"
                    color="secondary"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={state.userAccess}
                    onSelectionChange={(value) => {
                      newState({ userAccess: value})
                      // getData(value) 
                    }}
                  >

                  <Dropdown.Item key="0_Select Access Type">Select Access Type</Dropdown.Item>
                  <Dropdown.Item key="0_Admin">Admin</Dropdown.Item>
                  <Dropdown.Item key="0_User">User</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Row>


              </Modal.Body>
              <Modal.Footer>
                <Button auto flat color="error" onClick={() => setAddModals(false)}>
                  Close
                </Button>
                <Button auto flat color="primary" onPress={() => addUser()}>
                  Save
                </Button>
              </Modal.Footer>
            </Modal>
        </Layout>
      </>
    )
}