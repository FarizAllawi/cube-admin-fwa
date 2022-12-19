import axios from '../../configs/kch-office/axios'
import { useState, useEffect, useCallback } from 'react'
import { Text, Popover,Modal, Grid, Table, Input, Textarea,  Button, Image, Row, Col, Tooltip } from "@nextui-org/react";

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
import useForm from '../../helpers/useForm'


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

export default function Office(props) {

    const [fetchData, setFetchData] = useState(false)
    const [officeData, setOfficeData] = useState([])
    const [officeDataTemp, setOfficeDataTemp] = useState([])
    const [user, setUser] = useState(props.user)

    const [fileUpload, setFileUpload] = useState({})
    const [addModals, setAddModals] = useState(false)
    const [detailsModals, setDetailsModals] = useState({})
    const [editModals, setEditModals] = useState({})

    const [state, setState, newState] = useForm({
      office_name: '',
      address: '',
      office_sketch: {}
    })

    const getOffice = useCallback(async () => {
      await axios.get('/api/office', {
        headers: {
          'Authorization' : 'Bearer ' + user.token
        }
      })
      .then(res => {
        setOfficeData(res.data)
        setOfficeDataTemp(res.data)
      })
      .catch(err => {
        errorHandler("An Error when Fetching Data")
      })

      setFetchData(true)
    }, [user])

    const searchOnChange = (event) => {
      let search = event.target.value
      let searchOffice = []

      officeData?.map((data) => {
          let dataExists = false
          let searchKey = slugify(search)

          // Find Office by office name
          let officeName = slugify(data.office_name)
          
          if (officeName.includes(searchKey) && !dataExists) {
            searchOffice.push(data)
            dataExists = true
          }

          // Find Office by office address
          let officeAddress = slugify(data.address)
          if (officeAddress.includes(searchKey) && !dataExists) {
            searchOffice.push(data)
            dataExists = true
          }
      })

      setOfficeDataTemp(searchOffice)
    }

    const updateOfficeAPI = async(data) => {
      const response = await axios.put('api/office', data, {
        headers: {
          'Authorization' : 'Bearer ' + user.token
        }
      })
      .then(res => {
        return res.status
      })
      .catch(err => {
        return err.response.status
      })

      return response
    }

    const deleteOfficeAPI = async(data) => {
      const response = await axios.delete('api/office/'+data, {
        headers: {
          'Authorization' : 'Bearer ' + user.token
        }
      })
      .then(res => {
        return res.status
      })
      .catch(err => {
        return err.response.status
      })

      return response
    }

    const addOfficeAPI = async(data) => {
      const response = await axios.post('api/office', data, {
        headers: {
          'Authorization' : 'Bearer ' + user.token
        }
      })
      .then(res => {
        return res.status
      })
      .catch(err => {
        return err.response.status
      })

      return response
    }

    const updateOffice = async () => {

      // Validate Upload File
      if (fileUpload.type !== undefined) {
        if (fileUpload.type.split('/')[0] !== "image") return alert("Unsuported File Type")

        new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()

          xhr.open('POST', `/api`)
          // xhr.withCredentials = true
          // xhr.setRequestHeader("Cache-Control", "no-cache");
          // xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
          // xhr.setRequestHeader("X-File-Name", files.name);
          // xhr.setRequestHeader('Access-Control-Allow-Origin', `${process.env.NEXT_PUBLIC_API_STORAGE}`)
          // xhr.setRequestHeader('Accept', files.type)
          // xhr.setRequestHeader('Access-Control-Allow-Method', 'POST, OPTIONS, GET, PUT, DELETE, PATCH')
          // xhr.setRequestHeader('Access-Control-Allow-Headers','Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Accept, Origin, Cache-Control, X-Requested-With, Depth, User-Agent, If-Modified-Since, X-File-Size, X-Requested-With, X-File-Name, If-None-Match')
          // xhr.setRequestHeader('Access-Control-Allow-Headers', "X-Requested-With, X-File-Name, Content-Type, multipart/form-data, Origin, authorization, Accept, SMCHALLENGE")
          
          xhr.onload = async () => {
              const resp = JSON.parse(xhr.responseText)
              editModals['office_sketch'] = resp.data.filePath
              let update = await updateOfficeAPI(editModals)

              if (update === 200) {
                setEditModals({})
                getOffice()
              }
              else alert("An error when update office")
          }

          xhr.onerror = (evt) => {
              setError(true)
              reject(evt)
          }

          xhr.upload.onprogress = (event) => {
              // if (event.lengthComputable) {
              //     const percentage = (event.loaded/event.total) * 100
              //     setProgress(Math.round(percentage))
              // }
          }

          const formData = new FormData()
          formData.append('Files', fileUpload)
          xhr.send(formData)
        })
      }
      else {
        let update = await updateOfficeAPI(editModals)

        if (update === 200) {
          getOffice()
          return setEditModals({})
        }
        else alert("An error when update office")
      }

    }

    const addOffice = async () => {
      // Validate Upload File
      if (state.office_sketch.type !== undefined) {
        if (state.office_sketch.type.split('/')[0] !== "image") return alert("Unsuported File Type")

        new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()

          xhr.open('POST', `/api`)
          // xhr.withCredentials = true
          // xhr.setRequestHeader("Cache-Control", "no-cache");
          // xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
          // xhr.setRequestHeader("X-File-Name", files.name);
          // xhr.setRequestHeader('Access-Control-Allow-Origin', `${process.env.NEXT_PUBLIC_API_STORAGE}`)
          // xhr.setRequestHeader('Accept', files.type)
          // xhr.setRequestHeader('Access-Control-Allow-Method', 'POST, OPTIONS, GET, PUT, DELETE, PATCH')
          // xhr.setRequestHeader('Access-Control-Allow-Headers','Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Accept, Origin, Cache-Control, X-Requested-With, Depth, User-Agent, If-Modified-Since, X-File-Size, X-Requested-With, X-File-Name, If-None-Match')
          // xhr.setRequestHeader('Access-Control-Allow-Headers', "X-Requested-With, X-File-Name, Content-Type, multipart/form-data, Origin, authorization, Accept, SMCHALLENGE")
          
          xhr.onload = async () => {
              let data = state
              const resp = JSON.parse(xhr.responseText)
              data['office_sketch'] = resp.data.filePath
              let add = await addOfficeAPI(data)

              if (add === 200) {
                newState({
                  office_name: '',
                  address: '',
                  office_sketch: ''
                })
                setAddModals(false)
                getOffice()
              }
              else alert("An error when add office")
          }

          xhr.onerror = (evt) => {
              setError(true)
              reject(evt)
          }

          xhr.upload.onprogress = (event) => {
              // if (event.lengthComputable) {
              //     const percentage = (event.loaded/event.total) * 100
              //     setProgress(Math.round(percentage))
              // }
          }

          const formData = new FormData()
          formData.append('Files', state.office_sketch)
          xhr.send(formData)
        })
      }
      else {
        let add = await addOfficeAPI(state)

        if (add === 200) {
          getOffice()
          newState({
            office_name: '',
            address: '',
            office_sketch: ''
          })
          return setAddModals(false)
        }
        else alert("An error when add office")
      }
    }

    const deleteOffice = async (item) => {
      let update = await deleteOfficeAPI(item.uid_office)

        if (update === 200) {
          getOffice()
          return setEditModals({})
        }
        else alert("An error when delete office")
    }


    useEffect(() => {
      if (!fetchData) {
        getOffice()
        setFetchData(true)
      }

    }, [fetchData, officeData, user, fileUpload, getOffice])

    return (
      <>
        <Layout appName='kch-office' isActive='office' UserData={props.user}>
            <Box css={{px: "$12", mt: "$12", "@xsMax": {px: "$10"}}}>

            <Row>
              <Row justify="left">
                <Text h1 weight="medium" >Office Data</Text>
              </Row>
              <Row justify="right" css={{ mt: "$8"}}>
                <Button auto flat color="primary" css={{ marginTop: "2px" , marginRight: "0.775rem"}} onClick={() => getOffice()}>
                  Refresh
                </Button>
                <Button auto flat color="success" css={{ marginTop: "2px" , marginRight: "0.775rem"}} onClick={() => setAddModals(true)}>
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
                selectionMode="none"
              >
                <Table.Header>
                  <Table.Column css={{ width: "30%"}}>Office Name</Table.Column>
                  <Table.Column>Address</Table.Column>
                  <Table.Column css={{ width: "15%"}}>Action</Table.Column>
                </Table.Header>
                <Table.Body>
                  {
                    officeDataTemp.length > 0 && (
                      officeDataTemp.map((item, index) => {
                        return (
                          <Table.Row key={index}>
                            <Table.Cell>{item.office_name}</Table.Cell>
                            <Table.Cell>{item.address}</Table.Cell>
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
                                <Tooltip content="Edit Office">
                                  <IconButton onClick={() => setEditModals(item)}>
                                    <EditIcon size={20} fill="#979797" />
                                  </IconButton>
                                </Tooltip>
                              </Col>
                              <Col css={{ d: "flex" }}>
                                <Tooltip
                                  content="Delete Office"
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
                                          Are you sure you want to delete this Office
                                        </Text>
                                      </Row>
                                      <Grid.Container justify="space-between" alignContent="center">
                                        <Grid>
                                          <Button size="sm" light>
                                            Cancel
                                          </Button>
                                        </Grid>
                                        <Grid>
                                          <Button size="sm" color="error" onPress={() => deleteOffice(item)}>
                                            Delete
                                          </Button>
                                        </Grid>
                                      </Grid.Container>
                                    </Grid.Container>
                                    </Popover.Content>
                                  </Popover>
                                </Tooltip>
                              </Col>
                            </Row>
                            </Table.Cell>
                          </Table.Row>
                        )
                      })
                    )
                  }
                </Table.Body>
              </Table>
            </Box>
            {/* Detail Office */}
            <Modal
              closeButton
              scroll
              blur
              aria-labelledby="modal-title"
              width="600px"
              open={detailsModals?.uid_office !== undefined}
              onClose={() => setDetailsModals({})}
            >
              <Modal.Header>
                <Text id="modal-title" size={18}>
                  <Text b size={18}>
                    { detailsModals?.office_name }
                  </Text>
                </Text>
              </Modal.Header>
              <Modal.Body>
                <Text b size={16}>Office Address : </Text>
                <Text size={14}>{detailsModals?.address}</Text>

                <Text b size={16}>Office Sketch : </Text>
                <Image  src={process.env.NEXT_PUBLIC_STORAGE_API+'/files/get?filePath='+detailsModals.office_sketch}
                        alt="Default Image"
                        width={500}
                        height={500}/>

              </Modal.Body>
              <Modal.Footer>
                <Button auto flat color="error" onClick={() => setDetailsModals({})}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
           
           {/* Edit Office */}
            <Modal
              closeButton
              blur
              aria-labelledby="modal-title"
              width="600px"
              open={editModals?.uid_office !== undefined}
              onClose={() => setEditModals({})}
            >
              <Modal.Header>
                <Text id="modal-title" size={18}>
                  <Text b size={18}>Edit Office</Text>
                </Text>
              </Modal.Header>
              <Modal.Body>
              <Input
                clearable
                fullWidth
                color="primary"
                label='Office Name'
                value={editModals?.office_name}
                size="md"
                placeholder="Example Office floor 1"
                onChange={event => {
                  let value = event.target.value
                  editModals['office_name'] = value
                  setEditModals(editModals)
                }}
              />

              <Textarea
                size="md"
                color="primary"
                value={editModals?.address}
                label="Office Address"
                placeholder=""
                onChange={event => { 
                  let value = event.target.value
                  editModals['address'] = value
                  setEditModals(editModals)
                }}
              />

              <Text size={14} color="primary" >Office Sketch : </Text>
              {
                editModals?.office_sketch !== null && (
                  <Image  src={process.env.NEXT_PUBLIC_STORAGE_API+'/files/get?filePath='+editModals.office_sketch}
                          alt="Default Image"
                          width={250}
                          height={250}/>
                )
              }

              <input 
                type="file"
                name="Files"
                accept="image/*"
                onChange={event => setFileUpload(event.target.files[0])}
              />
              

              </Modal.Body>
              <Modal.Footer>
                <Button auto flat color="error" onClick={() => setEditModals({})}>
                  Close
                </Button>
                <Button auto flat color="primary" onPress={() => updateOffice()}>
                  Save
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Add Office */}
            <Modal
              closeButton
              blur
              aria-labelledby="modal-title"
              width="600px"
              open={addModals}
              onClose={() => setAddModals(false)}
            >
              <Modal.Header>
                <Text id="modal-title" size={18}>
                  <Text b size={18}>Add Office</Text>
                </Text>
              </Modal.Header>
              <Modal.Body>
              <Input
                clearable
                fullWidth
                color="primary"
                label='Office Name'
                value={state.office_name}
                size="md"
                placeholder="Example Office floor 1"
                onChange={event => {
                  let value = event.target.value
                  newState({ office_name : value })
                }}
              />

              <Textarea
                size="md"
                color="primary"
                value={state.address}
                label="Office Address"
                placeholder=""
                onChange={event => { 
                  let value = event.target.value
                  newState({ address : value })

                }}
              />

              <Text size={14} color="primary" >Office Sketch : </Text>
              <input 
                type="file"
                name="Files"
                accept="image/*"
                onChange={event => newState({ office_sketch: event.target.files[0]})}
              />
              

              </Modal.Body>
              <Modal.Footer>
                <Button auto flat color="error" onClick={() => setAddModals(false)}>
                  Close
                </Button>
                <Button auto flat color="primary" onPress={() => addOffice()}>
                  Save
                </Button>
              </Modal.Footer>
            </Modal>
        </Layout>
      </>
    )
}