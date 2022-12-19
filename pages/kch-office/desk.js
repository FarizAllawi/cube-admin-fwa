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

export default function Desk(props) {

    const [fetchData, setFetchData] = useState(false)
    const [officeData, setOfficeData] = useState([])
    const [deskSectionData, setDeskSectionData] = useState([])
    const [deskSectionDataTemp, setDeskSectionDataTemp] = useState([])
    const [deskItem, setDeskItem] = useState([])
    const [user, setUser] = useState(props.user)

    const [addModals, setAddModals] = useState(false)
    const [detailsModals, setDetailsModals] = useState({})
    const [editModals, setEditModals] = useState({})
    
    const [state, setState, newState] = useForm({
      deskSectionName: '',
      numberOfDesk: 0,
    })
    
    const [selectedOffice, setSelectedOffice] = useState(new Set(["0_Select Office"]));
    const [selectedEmployeeClass, setSelectedEmployeeClass] = useState(new Set(["0"]));

    const selectedOfficeValue = useMemo(
      () => Array.from(selectedOffice).join("").split("_")[1],
      [selectedOffice]
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

    const getData = useCallback(async (value = null) => {

      let selectOffice = null
      let office = await fetchAPI('/api/office')
      
      if (value !== null) {
        selectOffice = Array.from(value).join("").split("_")[0]

        if (selectOffice !== 0) {
          let deskSection = await fetchAPI('/api/desk-section/office/'+selectOffice)
          setDeskSectionData(deskSection)
          setDeskSectionDataTemp(deskSection)
        }
      }
      
      setOfficeData(office)
      setFetchData(true)

    }, [fetchAPI])


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
      const response = await axios.delete(url, {
        headers: {
          'Authorization' : 'Bearer ' + user.token
        }
      })
      .then(res => {
        return res.status
      })
      .catch(err => {
        errorHandler("An Error when Insert Data")
        return err.response.status
      })

      return response
    }

    const getDeskItem = async (id) => {
      let deskItem = await fetchAPI('/api/desk-item/section/'+id)
      setDeskItem(deskItem)
    }

    const addDeskItem = async (id) => {
      let deskSectionItem = {}
      let deskName = ''
      
      
      if (deskItem?.length > 0) {
        
        let output = [];
        let lastDeskItem = deskItem[deskItem?.length-1]
        let json = lastDeskItem.desk_name.split(' '); // Split text by spaces into array
  
        json.forEach(function (item) { // Loop through each array item
            let out = item.replace(/\'/g,''); // Remove all single quote '  from chunk
                out = out.split(/(\d+)/); // Now again split the chunk by Digits into array
                out = out.filter(Boolean); // With Boolean we can filter out False Boolean Values like -> false, null, 0 
                output.push(out);
        });
        
        let number = parseInt(output[0][output[0].length-1])
        deskName = output[0][0] + (number+1).toString()

      }
      else {
        deskSectionData.map( item => {
          if (item.uid_ds === id) deskSectionItem = item
        })
      }

      // Post Desk Item
      let insertDesk = await postAPI('/api/desk-item', {
        uid_ds: id,
        desk_name: deskItem?.length > 0 ? deskName : (deskSectionItem.section_name + 1).toString(),
        desk_status: 1,
        desk_employee_class: 0,
      })
        
      if (insertDesk.uid_dk !== undefined) {
        let desk = [];

        if (deskItem?.length > 0) deskItem.map(item => desk.push(item))
        desk.push(insertDesk)
        setDeskItem(desk)
      }
      else alert("An Error when add new desk")
      
    }

    const addDeskSection = async () => {
      let selectOffice = Array.from(selectedOffice).join("").split("_")[0]

      if (parseInt(selectOffice) === 0) {
        alert("Select Office First")
        setAddModals(false)
      }
      else {
        let deskSection = await postAPI('/api/desk-section', {
          uid_office: selectOffice,
          section_name: state.deskSectionName
        })

        if (deskSection.uid_ds !== undefined) {
          if (state.numberOfDesk !== 0) {
            let deskItem = []
            for (let index=0; index < state.numberOfDesk; index++) {

              await postAPI('/api/desk-item', {
                uid_ds: deskSection.uid_ds,
                desk_name: `${state.deskSectionName}${index+1}`,
                desk_status: 1,
                desk_employee_class: 0
              })

            }

          }

          await getData(selectOffice)
          newState({deskSectionName: '', numberOfDesk: 0,})
          setAddModals(false)
        }
        else alert("An error when creating desk section")
      }
    }

    const deleteDeskSection = async(id) => {
      let deleteDeskSection = await deleteAPI('/api/desk-section/'+id)
      if (deleteDeskSection === 200) {
        getData(selectedOffice)
      }
      else alert("Error when delete desk item")
    }

    const updateDeskItem = async(item) => {

      let deskStatus = await putAPI('/api/desk-item/', item)
      if (deskStatus === 200) {
        let deskItemData = []
        deskItem.map((desk, index) => {
          if (desk.uid_dk === item.uid_dk) deskItemData.push(item)
          else deskItemData.push(desk)
        })
        setDeskItem(deskItemData)
      }
      else alert("Error when update desk item")
    }

    const deleteDesk = async(id) => {
      let deleteDeskItem = await deleteAPI('/api/desk-item/'+id)
      if (deleteDeskItem === 200) {
        let deskItemData = []
        deskItem.map((item, index) => {
          if (item.uid_dk !== id) deskItemData.push(item)
        })
        setDeskItem(deskItemData)
      }
      else alert("Error when delete desk item")
    }

    const searchOnChange = (event) => {
        let search = event.target.value
        let searchDeskSection = []

        deskSectionData.map((data) => {
            let dataExists = false
            let searchKey = slugify(search)

            // Find Office by office name
            let deskSectionName = slugify(data.section_name)
            
            if (deskSectionName.includes(searchKey) && !dataExists) {
                searchDeskSection.push(data)
                dataExists = true
            }

        })

        setDeskSectionDataTemp(searchDeskSection)
    }

    useEffect(() => {
      if (!fetchData) { 
        getData()
        setFetchData(true)
      }
      
    }, [fetchData, officeData, user, getData, deskItem, deskSectionData, deskSectionDataTemp])  

    return (
      <>
        <Layout appName='kch-office' isActive='desk' UserData={props.user}>
            <Box css={{px: "$12", mt: "$12", "@xsMax": {px: "$10"}}}>

            <Row>
              <Row justify="left">
                <Text h1 weight="medium" >Desk Data</Text>
                <Dropdown>
                  <Dropdown.Button flat color="secondary" css={{ marginTop: "$9", marginLeft: "$8"}}>
                    {selectedOfficeValue}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    aria-label="Single selection actions"
                    color="secondary"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={selectedOffice}
                    onSelectionChange={(value) => {
                      setSelectedOffice(value)
                      getData(value) 
                    }}
                  >
                  <Dropdown.Item key="0_Select Office">Select Office</Dropdown.Item>
                  {
                    officeData.length > 0 && (
                      officeData.map((item, index) => {
                        return (
                          <Dropdown.Item key={`${item.uid_office}_${item.office_name}`}>{item.office_name}</Dropdown.Item>
                        )
                      })
                    )
                  }
                  </Dropdown.Menu>
                </Dropdown>
              </Row>
              <Row justify="right" css={{ mt: "$8", paddingTop: "2px"}}>
                <Button auto flat color="primary" css={{marginLeft: "0.675rem", marginRight: "0.675rem"}} onClick={() => getData(selectedOffice)}>
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
                  <Table.Column css={{ width: "45%"}}>Desk Section</Table.Column>
                  <Table.Column css={{ width: "45%"}}>Desk</Table.Column>
                  <Table.Column css={{ width: "10%"}}>Action</Table.Column>
                </Table.Header>
                <Table.Body>
                  {
                    deskSectionDataTemp?.length > 0 && (
                      deskSectionDataTemp?.map((item, index) => {
                        return (
                          <Table.Row key={index}>
                            <Table.Cell>{item.section_name}</Table.Cell>
                            <Table.Cell>
                              <StyledBadge type="active">Available</StyledBadge>
                              : {item.available_desk}
  
                              <StyledBadge type="inactive" css={{ marginLeft: "12px" }}>Unavailable</StyledBadge>
                              : {item.unavailable_desk}
                            </Table.Cell>
                            <Table.Cell>
                            <Row justify="center" align="center">
                              <Col css={{ d: "flex" }}>
                                <Tooltip content="Edit Desk Section">
                                  <IconButton onClick={() => {
                                    setEditModals(item)
                                    getDeskItem(item.uid_ds)
                                  }}>
                                    <EditIcon size={20} fill="#979797" />
                                  </IconButton>
                                </Tooltip>
                              </Col>
                              <Col css={{ d: "flex" }}>
                                <Tooltip
                                  content="Delete Desk Section"
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
                                          Are you sure you want to delete this Desk Section
                                        </Text>
                                      </Row>
                                      <Grid.Container justify="center" alignContent="center">
                                        <Grid>
                                          <Button size="sm" color="error" onPress={() => deleteDeskSection(item.uid_ds)}>
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

           {/* Edit Office */}
            <Modal
              closeButton
              blur
              aria-labelledby="modal-title"
              width="600px"
              open={editModals?.uid_ds !== undefined}
              onClose={() => {
                setEditModals({})
                getData(selectedOffice)
              }}
            >
              <Modal.Header>
                <Text id="modal-title" size={18}>
                  <Text b size={18}>Edit Desk {editModals.section_name}</Text>
                </Text>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Text b size={16} css={{ width: "90%" , marginTop: "6px" }}>Desk Item : </Text>
                  <Button auto flat color="success" css={{ marginRight: "0.675rem"}} onPress={() => addDeskItem(editModals.uid_ds)}>
                    + Add More Desk
                  </Button>
                </Row>
                {
                  deskItem?.map((item, index) => {
                    return (
                        <Row key={index} align="center">
                          <Text b css={{ marginRight: "$8", marginTop: "$4" }}>{item.desk_name}</Text>
                          <Switch checked={item.desk_status === 1 ? true : false} 
                                  size={"xs"} 
                                  css={{ marginTop: "$4", marginRight: "$8" }} 
                                  onClick={() => updateDeskItem({
                                    uid_dk: item.uid_dk,
                                    desk_name: item.desk_name,
                                    desk_status: item.desk_status === 1 ? 2 : 1,
                                    desk_employee_class : item.desk_employee_class === null ? 0 : item.desk_employee_class
                                  })}/>
                          <Dropdown>
                            <Dropdown.Button flat color="secondary" css={{ marginTop: "$4", marginRight: "$8"}}>
                                { item.desk_employee_class === 0 || item.desk_employee_class === null ? "Desk Employee Class" : "Employee Class >= " + item.desk_employee_class }
                            </Dropdown.Button>
                            <Dropdown.Menu
                              aria-label="Single selection actions"
                              color="secondary"
                              disallowEmptySelection
                              selectionMode="single"
                              selectedKeys={new Set([ item.desk_employee_class === 0 || item.desk_employee_class === null ? 0 : item.desk_employee_class])}
                              onSelectionChange={(value) => {
                                setSelectedEmployeeClass(value)
                                updateDeskItem({
                                  uid_dk: item.uid_dk,
                                  desk_name: item.desk_name,
                                  desk_status: item.desk_status,
                                  desk_employee_class : parseInt(Array.from(value).join("")[0])
                                })
                                // getData(value) 
                              }}
                            >
                              <Dropdown.Item key={0}>Desk Employee Class</Dropdown.Item>
                              <Dropdown.Item key={1}>Employee Class {'>='} 1</Dropdown.Item>
                              <Dropdown.Item key={2}>Employee Class {'>='} 2</Dropdown.Item>
                              <Dropdown.Item key={3}>Employee Class {'>='} 3</Dropdown.Item>
                              <Dropdown.Item key={4}>Employee Class {'>='} 4</Dropdown.Item>
                              <Dropdown.Item key={5}>Employee Class {'>='} 5</Dropdown.Item>
                              <Dropdown.Item key={6}>Employee Class {'>='} 6</Dropdown.Item>
                              <Dropdown.Item key={7}>Employee Class {'>='} 7</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                          <Tooltip
                            content="Delete Desk Section"
                            color="error"
                          ><Popover>
                              <Popover.Trigger>
                                <IconButton css={{ marginTop: "$4" }}>
                                  <DeleteIcon size={20} fill="#FF0080" />
                                </IconButton>
                              </Popover.Trigger>
                              <Popover.Content>
                              <Grid.Container
                                css={{  borderRadius: "20px", padding: "0.75rem", maxWidth: "330px", boxShadow: "rgba(0,0,0, 0.5)" }}
                              >
                                <Row justify="center" align="center">
                                  <Text b>Confirm</Text>
                                </Row>
                                <Row>
                                  <Text>
                                    Are you sure you want to delete this desk item
                                  </Text>
                                </Row>
                                <Grid.Container justify="center" alignContent="center">
                                  {/* <Grid>
                                    <Button size="sm" light>
                                      Cancel
                                    </Button>
                                  </Grid> */}
                                  <Grid>
                                    <Button size="sm" color="error" css={{ marginTop: "5px"}} onPress={() => deleteDesk(item.uid_dk)}>
                                      Delete
                                    </Button>
                                  </Grid>
                                </Grid.Container>
                              </Grid.Container>
                              </Popover.Content>
                            </Popover>
                          </Tooltip>
                        </Row>
                    )
                  })
                }

              </Modal.Body>
              <Modal.Footer>
                <Button auto flat color="error" onClick={() => setEditModals({})}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Add Desk Section */}
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
                  <Text b size={18}>Add Desk Section</Text>
                </Text>
              </Modal.Header>
              <Modal.Body>
              <Input
                clearable
                fullWidth
                color="primary"
                label='Desk Section Name'
                value={state.deskSectionName}
                size="md"
                placeholder="Desk Section Maximum 3 Letter"
                onChange={event => {
                  let value = event.target.value
                  if (value.length <= 3) newState({ deskSectionName : value })
                  else {
                    alert("Maximum Desk Section Name 3 Letters")
                    newState({ deskSectionName : state.deskSectionName })
                  }
                }}
              />

              <Input
                type='number'
                clearable
                fullWidth
                color="primary"
                label='How Many Desk?'
                value={state.numberOfDesk}
                size="md"
                placeholder="Example: 5"
                onChange={event => {
                  let value = event.target.value
                  if (value <= 10) newState({ numberOfDesk : value })
                  else {
                    alert("Maximum Desk Section Number 10 Desk")
                    newState({numberOfDesk : 10 })
                  }
                }}
              />

              </Modal.Body>
              <Modal.Footer>
                <Button auto flat color="error" onClick={() => setAddModals(false)}>
                  Close
                </Button>
                <Button auto flat color="primary" onPress={() => addDeskSection()}>
                  Save
                </Button>
              </Modal.Footer>
            </Modal>
        </Layout>
      </>
    )
}