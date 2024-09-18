/*
 *
 * HomePage
 *
 */

import React, { useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';
import { Box } from '@strapi/design-system/Box';
import { Flex } from '@strapi/design-system/Flex';
import { Typography } from '@strapi/design-system/Typography';
import { Grid, GridItem } from '@strapi/design-system';
import { ContentLayout, GridLayout,Card,CardBody,CardTitle,CardHeader } from '@strapi/design-system';
import instance from '../../utils/axiosInstance';
import _ from 'lodash'
import { LoadingIndicatorPage } from '@strapi/helper-plugin';
import {User, Calendar, Trash,PaperPlane } from '@strapi/icons';
import { th } from 'date-fns/locale';
import { Icon } from '@strapi/design-system';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  TimeScale,
  TimeSeriesScale,
  PieController,
  ArcElement
} from 'chart.js'
import { Chart, Bar, Line, Pie } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels';
import dayjs from 'dayjs';
import 'chartjs-adapter-date-fns';
import GoogleChart from "react-google-charts";
import { ThemeProvider } from '@mui/system';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ChartDataLabels,
  TimeScale,
  TimeSeriesScale,
  ArcElement
)

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState({
    adjust: {
      installs: 0,
      uninstalls: 0,
      android_installs: 0,
      android_uninstalls: 0,
      ios_installs: 0,
      ios_uninstalls: 0
    },
    guestUser: 0,
    regisUser: 0,
    haveDateOfBirth: 0,
    haveNoDateOfBirth: 0,
    orderList7Days: [],
    allOrders: [],
    summary_day_of_week: {
      "อาทิตย์": 0,
      "จันทร์": 0,
      "อังคาร": 0,
      "พุธ": 0,
      "พฤหัส": 0,
      "ศุกร์": 0,
      "เสาร์": 0
    }
  })

  useEffect(() => {
    instance.get("/dashboard")
      .then((result) => {
        const data = _.get(result, 'data')
        let summary = _.get(data, 'summary')

        console.log(data);
        setIsLoading(false)
        setSummary(prevState => {
          return {
            ...prevState,
            ...summary
          }
        })
      })
      .catch((err) => {
        console.log(`error dashboard get`, err);
        setIsLoading(false)
      })
  }, [])


  if (isLoading) {
    return <LoadingIndicatorPage />
  }

  function numberWithCommas(x) {
    if(!x) x = "0"
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const labelsDayOfWeeks = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
  const dataDayOfWeeks = {
    labels: labelsDayOfWeeks,
    datasets: [
      {
        label: labelsDayOfWeeks[0],
        data: [{ x: labelsDayOfWeeks[0], y: summary.summary_day_of_week[labelsDayOfWeeks[0]] }],
        backgroundColor: '#CA1D0F',
      },
      {
        label: labelsDayOfWeeks[1],
        data: [{ x: labelsDayOfWeeks[1], y: summary.summary_day_of_week[labelsDayOfWeeks[1]] }],
        backgroundColor: '#DFB957',
      },
      {
        label: labelsDayOfWeeks[2],
        data: [{ x: labelsDayOfWeeks[2], y: summary.summary_day_of_week[labelsDayOfWeeks[2]] }],
        backgroundColor: '#F1898A',
      },
      {
        label: labelsDayOfWeeks[3],
        data: [{ x: labelsDayOfWeeks[3], y: summary.summary_day_of_week[labelsDayOfWeeks[3]] }],
        backgroundColor: '#0AAC82',
      },
      {
        label: labelsDayOfWeeks[4],
        data: [{ x: labelsDayOfWeeks[4], y: summary.summary_day_of_week[labelsDayOfWeeks[4]] }],
        backgroundColor: '#E3714C',
      },
      {
        label: labelsDayOfWeeks[5],
        data: [{ x: labelsDayOfWeeks[5], y: summary.summary_day_of_week[labelsDayOfWeeks[5]] }],
        backgroundColor: '#5DB5DB',
      },
      {
        label: labelsDayOfWeeks[6],
        data: [{ x: labelsDayOfWeeks[6], y: summary.summary_day_of_week[labelsDayOfWeeks[6]] }],
        backgroundColor: '#7D3581',
      },
    ]
  }

  // console.log(dataDayOfWeeks);

  const optionsBar = {
    responsive: true,

    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'จำนวนสมาชิกตามวันเกิด',
      },
    },
    plugins: {
      // Change options for ALL labels of THIS CHART
      datalabels: {
        color: 'black',
        anchor: 'start',
        clamp: false,
        align: "top",
        offset: 1,
        formatter: function (value, context) {
          return value.y
        }
      }
    }
  };

  const sevenDays = Array.from({ length: 7 }, (_, i) => dayjs().subtract(7 - (i + 1), 'days'))

  const summaryRevenuePackage = sevenDays.reduce((acc, cur) => {
    const getDaysSumPackage = _.chain(summary.orderList7Days).filter((item) => cur.isSame(dayjs(item.createdAt), 'date') && item.type == 'package' && item.paymentStatus == 'purchase').sumBy('total').value()
    // const getDaysSumProduct = _.chain(summary.orderList7Days).filter((item)=>cur.isSame(dayjs(item.createdAt),'date') && item.type == 'product' && item.paymentStatus == 'purchase').sumBy('total').value()
    acc.push(getDaysSumPackage)
    return acc
  }, [])

  const summaryRevenueProduct = sevenDays.reduce((acc, cur) => {
    const getDaysSumPackage = _.chain(summary.orderList7Days).filter((item) => cur.isSame(dayjs(item.createdAt), 'date') && item.type == 'product' && item.paymentStatus == 'purchase').sumBy('total').value()
    // const getDaysSumProduct = _.chain(summary.orderList7Days).filter((item)=>cur.isSame(dayjs(item.createdAt),'date') && item.type == 'product' && item.paymentStatus == 'purchase').sumBy('total').value()
    acc.push(getDaysSumPackage)
    return acc
  }, [])




  const dataLine = {
    labels: sevenDays.map((item) => item.format("DD MMM YYYY")),
    datasets: [
      {
        label: "รายได้ Package",
        // data : summary.orderList7Days.filter((item)=>item.type == 'package' && item.paymentStatus == 'purchase').map((item)=>({
        //   x:item.createdAt,
        //   y:item.total
        // })),
        data: summaryRevenuePackage,
        backgroundColor: 'purple',
      },
      {
        label: "รายได้ สินค้ามงคล",
        data: summaryRevenueProduct,
        backgroundColor: 'yellow',
      }
    ]
  }


  const optionsLine = {
    responsive: true,
    //   scales: {
    //     x: {
    //         type: 'time',
    //         time: {
    //             unit: 'day'
    //         }
    //     }
    // },
    plugins: {
      // Change options for ALL labels of THIS CHART
      datalabels: {
        color: 'black',
        anchor: 'start',
        clamp: false,
        align: "top",
        offset: 1,
        formatter: function (value, context) {
          return value.y
        }
      }
    },
    //   adapters: {
    //     date: {
    //         locale: th
    //     }
    // }
  };


  const all_order_purchase = summary.allOrders.filter((item) => item.paymentStatus == 'purchase' && (item.partnerAcceptStatus == 'pending' || item.partnerAcceptStatus == 'accepted'));
  const total_orders = all_order_purchase.length;
  const total_pending = all_order_purchase.filter((item) => item.partnerAcceptStatus == 'pending').length
  const total_accept = all_order_purchase.filter((item) => item.partnerAcceptStatus == 'accepted').length

  // const dataPine = {
  //   labels: ['ยอดจอง', 'สั่งงาน', 'ยังไม่สั่งงาน'],
  //   datasets: [{
  //     data: [total_orders, total_accept, total_pending],
  //     backgroundColor: [
  //       'rgb(255, 99, 132)',
  //       'rgb(54, 162, 235)',
  //       'rgb(255, 205, 86)'
  //     ],
  //   }]

  // }

  const dataPine = [
    ["Order", "total"],
    ["ยอดจอง", total_orders],
    ["สั่งงาน", total_accept],
    ["ยังไม่สั่งงาน", total_pending], // Below limit.
  ];

  const optionsPine = {
    title: "",
    pieSliceText: 'value-and-percentage'
    // sliceVisibilityThreshold: 0.2, // 20%
  };


  // const optionsPine = {
  //   responsive: true,
  //   //   scales: {
  //   //     x: {
  //   //         type: 'time',
  //   //         time: {
  //   //             unit: 'day'
  //   //         }
  //   //     }
  //   // },
  //   plugins: {
  //     // Change options for ALL labels of THIS CHART
  //     datalabels: {
  //       color: 'black',
  //       anchor: 'start',
  //       clamp: false,
  //       align: "top",
  //       offset: 1,
  //       formatter: function (value, context) {
  //         return value.y
  //       }
  //     }
  //   },
  //   //   adapters: {
  //   //     date: {
  //   //         locale: th
  //   //     }
  //   // }
  // };

  console.log(total_orders, total_pending, total_accept);

  return (
    <ContentLayout>
      <Box padding={8} background="neutral100">

        <Grid gridCols={2} gap={5}>
          <GridItem style={{ height: '100%', minHeight: 435 }}>
            <Box padding={4} style={{ height: '100%' }} hasRadius height={"100%"} background="neutral0" shadow="tableShadow">

              <Grid gridCols={2} gap={5}>

                <GridItem>
                  <Flex direction={`row`} justifyContent={"center"} alignItems="center">
                    <Card style={{width:"100%"}}>
                      <CardHeader style={{padding:5}}>Guest</CardHeader>
                      <CardBody>
                        <Flex alignItems={`center`} direction={`column`}>
                          <Typography variant="alpha" style={{ color: 'rgb(0, 197, 206)' }}><User color={`red`} /> {numberWithCommas(summary?.guestUser)}</Typography>
                          
                        </Flex>
                      </CardBody>
                    </Card>
                  </Flex>
                </GridItem>
                <GridItem>
                  <Flex direction={`row`} justifyContent={"center"} alignItems="center">
                    <Card style={{width:"100%"}}>
                      <CardHeader style={{padding:5}}>Registered</CardHeader>
                      <CardBody>
                        <Flex alignItems={`center`} direction={`column`}>
                          <Typography variant="alpha" style={{ color: 'rgb(0, 197, 206)' }}><User color={`red`} /> {numberWithCommas(summary?.regisUser)}</Typography>
                        </Flex>
                      </CardBody>
                    </Card>
                  </Flex>
                </GridItem>
                <GridItem>
                  <Flex direction={`row`} justifyContent={"center"} alignItems="center">
                    <Card style={{width:"100%"}}>
                      <CardHeader style={{padding:5}}>BirthDate</CardHeader>
                      <CardBody>
                        <Flex alignItems={`center`} direction={`column`}>
                          <Typography variant="alpha" style={{ color: 'rgb(0, 197, 206)' }}><Calendar /> {numberWithCommas(summary?.haveDateOfBirth)}</Typography>
                        </Flex>
                      </CardBody>
                    </Card>
                  </Flex>
                </GridItem>
                <GridItem>
                  <Flex direction={`row`} justifyContent={"center"} alignItems="center">
                    <Card style={{width:"100%"}}>
                      <CardHeader style={{padding:5}}>No BirthDate</CardHeader>
                      <CardBody>
                        <Flex alignItems={`center`} direction={`column`}>
                          <Typography variant="alpha" style={{ color: 'rgb(0, 197, 206)' }}><Calendar /> {numberWithCommas(summary?.haveNoDateOfBirth)}</Typography>
                        </Flex>
                      </CardBody>
                    </Card>
                  </Flex>
                </GridItem>
                <GridItem>
                  <Flex direction={`row`} justifyContent={"center"} alignItems="center">
                    <Card style={{width:"100%"}}>
                      <CardHeader style={{padding:5}}>iOS Install</CardHeader>
                      <CardBody>
                        <Flex alignItems={`center`} direction={`column`}>
                          <Typography variant="alpha" style={{ color: 'rgb(0, 197, 206)' }}><Typography style={{color:"blue"}}>iOS</Typography> {numberWithCommas(summary?.adjust?.ios_installs)}</Typography>
                        </Flex>
                      </CardBody>
                    </Card>
                  </Flex>
                </GridItem>
                <GridItem>
                  <Flex direction={`row`} justifyContent={"center"} alignItems="center">
                    <Card style={{width:"100%"}}>
                      <CardHeader style={{padding:5}}>Android Install</CardHeader>
                      <CardBody>
                        <Flex alignItems={`center`} direction={`column`}>
                          <Typography variant="alpha" style={{ color: 'rgb(0, 197, 206)' }}><Typography style={{color:"green"}}>Android</Typography> {numberWithCommas(summary?.adjust?.android_installs)}</Typography>
                        </Flex>
                      </CardBody>
                    </Card>
                  </Flex>
                </GridItem>
                <GridItem>
                  <Flex direction={`row`} justifyContent={"center"} alignItems="center">
                    <Card style={{width:"100%"}}>
                      <CardHeader style={{padding:5}}>Total Install</CardHeader>
                      <CardBody>
                        <Flex alignItems={`center`} direction={`column`}>
                          <Typography variant="alpha" style={{ color: 'rgb(0, 197, 206)' }}><PaperPlane />{numberWithCommas(summary?.adjust?.installs)}</Typography>
                        </Flex>
                      </CardBody>
                    </Card>
                  </Flex>
                </GridItem>
                <GridItem>
                  <Flex direction={`row`} justifyContent={"center"} alignItems="center">
                    <Card style={{width:"100%"}}>
                      <CardHeader style={{padding:5}}>Total UnInstall</CardHeader>
                      <CardBody>
                        <Flex alignItems={`center`} direction={`column`}>
                          <Typography variant="alpha" style={{ color: 'rgb(0, 197, 206)' }}><Trash />{numberWithCommas(summary?.adjust?.uninstalls)}</Typography>
                        </Flex>
                      </CardBody>
                    </Card>
                  </Flex>
                </GridItem>

                {/* <GridItem>
                  <Grid gridCols={2}>
                    <GridItem>
                      <Flex direction={`column`}>
                        <Typography variant="alpha" style={{ color: 'green' }}>{numberWithCommas(summary?.haveDateOfBirth)}</Typography>
                        <Typography variant="epsilon" fontSize={18} style={{ color: 'green' }}>มีวันเกิด</Typography>
                      </Flex>
                    </GridItem>

                    <GridItem>
                      <Flex direction={`column`}>
                        <Typography variant="alpha" style={{ color: 'gray' }}>{numberWithCommas(summary?.haveNoDateOfBirth)}</Typography>
                        <Typography variant="epsilon" fontSize={18} style={{ color: 'gray' }}>ไม่มีวันเกิด</Typography>
                      </Flex>
                    </GridItem>
                  </Grid>
                </GridItem> */}


                {/* <GridItem>
                  <Flex direction={`row`} justifyContent={"center"} alignItems="center">
                    <Box paddingRight={5}> <Typography variant="alpha" style={{ color: 'rgb(0, 197, 206)' }}>{numberWithCommas(summary?.regisUser)}</Typography></Box>

                    <Box paddingRight={3}>
                      <Icon height={50} width={40} color="black" as={User} />
                    </Box>
                    <Typography variant="beta" fontSize={20} style={{ color: 'red' }}>จำนวน Register</Typography>
                  </Flex>
                </GridItem>

                <GridItem>
                  <Grid gridCols={2}>
                    <GridItem>
                      <Flex direction={`column`}>
                        <Typography variant="alpha" style={{ color: 'rgb(0, 197, 206)' }}>{numberWithCommas(summary?.adjust?.installs)}</Typography>
                        <Typography variant="epsilon" fontSize={18} style={{ color: 'rgb(0, 197, 206)' }}>จำนวน Install</Typography>
                      </Flex>
                    </GridItem>

                    <GridItem>
                      <Flex direction={`column`}>
                        <Typography variant="alpha" style={{ color: 'black' }}>{numberWithCommas(summary?.adjust?.uninstalls)}</Typography>
                        <Typography variant="epsilon" fontSize={18} style={{ color: 'black' }}>จำนวน Uninstall</Typography>
                      </Flex>
                    </GridItem>
                  </Grid>
                </GridItem>

                <GridItem>
                  <Grid gridCols={2}>
                    <GridItem>
                      <Flex direction={`column`}>
                        <Typography variant="alpha" style={{ color: 'rgb(0, 197, 206)' }}>{numberWithCommas(summary?.adjust?.android_installs)}</Typography>
                        <Typography variant="epsilon" fontSize={18} style={{ color: 'rgb(0, 197, 206)' }}>จำนวน Install (Android)</Typography>
                      </Flex>
                    </GridItem>

                    <GridItem>
                      <Flex direction={`column`}>
                        <Typography variant="alpha" style={{ color: 'black' }}>{numberWithCommas(summary?.adjust?.android_uninstalls)}</Typography>
                        <Typography variant="epsilon" fontSize={18} style={{ color: 'black' }}>จำนวน Uninstall (Android)</Typography>
                      </Flex>
                    </GridItem>
                  </Grid>
                </GridItem> */}

                {/* <GridItem>
                  <Grid gridCols={2}>
                    <GridItem>
                      <Flex direction={`column`}>
                        <Typography variant="alpha" style={{ color: 'rgb(0, 197, 206)' }}>{numberWithCommas(summary?.adjust?.ios_installs)}</Typography>
                        <Typography variant="epsilon" fontSize={18} style={{ color: 'rgb(0, 197, 206)' }}>จำนวน Install (IOS)</Typography>
                      </Flex>
                    </GridItem>

                    <GridItem>
                      <Flex direction={`column`}>
                        <Typography variant="alpha" style={{ color: 'black' }}>{numberWithCommas(summary?.adjust?.ios_uninstalls)}</Typography>
                        <Typography variant="epsilon" fontSize={18} style={{ color: 'black' }}>จำนวน Uninstall (IOS)</Typography>
                      </Flex>
                    </GridItem>
                  </Grid>
                </GridItem> */}

              </Grid>

            </Box>
          </GridItem>

          <GridItem style={{ height: '100%', minHeight: 435 }}>
            <Box padding={2} hasRadius background="neutral0" shadow="tableShadow" style={{height:"100%"}}>

              <Flex direction={`column`} alignItems="center">
                <Typography variant="beta">จำนวนสมาชิกตามวันเกิด</Typography>
                <Bar options={optionsBar} data={dataDayOfWeeks} />
              </Flex>
            </Box>
          </GridItem>

          <GridItem style={{ height: '100%', minHeight: 475 }}>
            <Box padding={2} hasRadius background="neutral0" shadow="tableShadow" style={{height:"100%"}}>

              <Flex direction={`column`} alignItems="center">
                <Typography variant="beta">รายได้ประจำสัปดาห์</Typography>
                <Typography variant="omega">7 วันล่าสุด</Typography>
                <Line options={optionsLine} data={dataLine} style={{height:"100%",padding:5}} />
              </Flex>
            </Box>
          </GridItem>

          <GridItem style={{ height: '100%',minHeight:475 }}>

                <Box style={{ height: '100%' }} padding={2} hasRadius background="neutral0" shadow="tableShadow">

              <Flex direction={`column`} alignItems="center">
                <Typography variant="beta">ยอดจอง สั่งงาน (ยอดรายได้รวม {numberWithCommas(summary && summary.rows?.length>0?  summary?.rows[0]?.total : "0")}) บาท</Typography>

                <GoogleChart
                  chartType="PieChart"
                  data={dataPine}
                  options={{legend: { position: 'top', alignment: 'center' },...optionsPine}}
                  width={"100%"}

                  errorElement={()=><h1>ไม่มีข้อมูล</h1>}
                  height={"475px"}
                />

              </Flex>
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </ContentLayout>
  );
};

export default HomePage;
