import axios from '../../configs/kch-office/axios'
import { useState, useEffect, useCallback } from 'react'
import { Grid, Card, Text} from "@nextui-org/react";
import { VictoryChart, VictoryAxis, VictoryPie, VictoryBar, VictoryTheme } from "victory";
import { withSessionSsr } from '../../lib/withSession';

import { formatDate } from '../../helpers/dayHelper';

import { Box } from "../../components/Box"
import Layout from "../../components/layout";

import errorHandler from '../../configs/errorHandler';

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

export default function Dashboard(props) {

    const [user, setUser] = useState(props.user)
    const [fetchData, setFetchData] = useState(false)

    const [departmentData, setDepartmentData] = useState([])
    const [bookingData, setBookingData] = useState([])

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

      let department = await fetchAPI('/api/dashboard/today-booking-deparment')
      let booking = await fetchAPI('/api/dashboard/desk-office-count')
      
      setDepartmentData(department)
      setBookingData(booking)
    }, [fetchAPI])

    useEffect(() => {
      if (!fetchData) {
        getData()
        setFetchData(true)
      } 
    }, [fetchData, getData])


    return (
        <Layout appName='kch-office' isActive='dashboard' UserData={props.user}>
            <Box css={{px: "$12", mt: "$12", "@xsMax": {px: "$10"}}}>
              <Card />
              <Grid.Container gap={2} justify="center">
                <Grid xs={6}>
                   <Card isPressable
                         isHoverable>
                      <Card.Header>
                        <Text b color='#1C6C28'>Today {formatDate(new Date())} </Text>
                      </Card.Header>
                      <Card.Divider css={{ background: "#1C6C28"}} />
                      <Card.Body>
                        <Grid.Container gap={2}>
                          <Grid xs={6}>
                            <VictoryPie
                              data={departmentData}
                              labelRadius={({ innerRadius }) => innerRadius + 25 }
                              radius={({ datum }) => 50 + datum.y * 20}
                              innerRadius={50}
                              style={{ 
                                data: {fill: "#1C6C28",},
                                labels: { fill: "#1C6C28", fontSize: 12, fontWeight: "bold" } }}
                              x="deptName"
                              y="count_booking"
                            />
                          </Grid>
                        </Grid.Container>
                      </Card.Body>
                   </Card>
                </Grid>
                <Grid xs={6}>
                  <Grid.Container>
                    <Grid xs={6}>
                      <Card isPressable
                            isHoverable>
                        <Card.Header>
                          <Text b color='#1C6C28'>Desk Section most frequently booked</Text>
                        </Card.Header>
                        <Card.Divider css={{ background: "#1C6C28"}} />

                      </Card>
                    </Grid>
                    <Grid xs={6}>
                    <Card
                      isPressable
                      isHoverable
                    >
                      <Card.Header>
                        <Text b color='#1C6C28'>Booking Desk a week ago</Text>
                      </Card.Header>
                      <Card.Divider css={{ background: "#1C6C28"}} />
                      <Card.Body>
                        {
                          bookingData.length > 0 && (
                            <VictoryChart
                              // adding the material theme provided with Victory
                              theme={VictoryTheme.material}
                              domainPadding={20}
                            >
                              <VictoryAxis
                                tickValues={[1, 2, 3, 4, 5]}
                                tickFormat={["Mon", "Tue", "Wed", "Thu", "Fri"]}
                              />
                              <VictoryAxis
                                dependentAxis
                                tickFormat={(x) => (`${ x % 1 === 0 ? x : '' }`)}
                              />
                              <VictoryBar
                                style={{
                                  data: {
                                    width: 20,
                                    fill: "#1C6C28",
                                  },
                                }}
                                cornerRadius={4}
                                data={bookingData}
                                x="bookdt"
                                y="count_booking"
                              />
                            </VictoryChart>
                          )
                        }
                      </Card.Body>
                    </Card>
                    </Grid>
                    <Grid xs={12}>

                    </Grid>
                  </Grid.Container>
                </Grid>
              </Grid.Container>

            </Box>
        </Layout>
    )
}