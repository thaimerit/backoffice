/*
 *
 * HomePage
 *
 */

import _ from "lodash";
import React from "react";
import instance from "../../../../../dashboard/admin/src/utils/axiosInstance";
// import PropTypes from 'prop-types';
import pluginId from "../../pluginId";

import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";
import dayjs from "dayjs";
import "dayjs/locale/th";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DatePicker, Button } from "@strapi/design-system";
import { LoadingIndicatorPage } from "@strapi/helper-plugin";
const json2csv = require("json2csv").parse;

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: "id",
    numeric: false,
    disablePadding: true,
    label: "ID",
  },
  {
    id: "type",
    numeric: false,
    disablePadding: false,
    label: "ประเภท",
  },
  {
    id: "customer_name",
    numeric: false,
    disablePadding: false,
    label: "ชื่อผู้ขอพร",
  },
  {
    id: "orderItems",
    numeric: false,
    disablePadding: false,
    label: "รายการสั่งซื้อ",
  },
  {
    id: "sum",
    numeric: false,
    disablePadding: false,
    label: "รวมราคา",
  },
  {
    id: "paymentStatus",
    numeric: false,
    disablePadding: false,
    label: "สถานะจ่ายเงิน",
  },
  {
    id: "status",
    numeric: false,
    disablePadding: false,
    label: "สถานะ",
  },
  {
    id: "partnerAcceptStatus",
    numeric: false,
    disablePadding: false,
    label: "สถานะรับงาน",
  },
  {
    id: "createdAt",
    numeric: false,
    disablePadding: false,
    label: "เวลา",
  },
];

function EnhancedTableHead(props) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={"center"}
            // padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
  const {
    numSelected,
    onSearchhandle,
    search,
    onDayChange,
    dayBirth,
    date,
    orderList,
    setDate,
    paymentStatus,
    onPaymentStatusChange,
    status,
    onStatusChange,
    partnerAcceptStatus,
    onPartnertAcceptStatusChange,
    setStartDate,
    startDate,
    setEndDate,
    endDate,
  } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        // pr: { sm: 2 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <>
          <div
            style={{ display: "flex", flexDirection: "column", padding: 10 }}
          >
            <Typography
              sx={{ flex: "1 1 100%" }}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              ออเดอร์รายวัน
            </Typography>
            <div
              style={{ marginTop: 10, display: "flex", flexDirection: "row" }}
            >
              <div style={{marginRight:"10px"}}>
              <DatePicker
                onChange={(date) => {
                  if(dayjs(date) > dayjs(endDate)){
                    setEndDate(dayjs(date).toISOString())
                  }
                  setStartDate(dayjs(date).toISOString())
                }}
                maxDate={dayjs().add(7, "hours").toDate()}
                selectedDate={startDate}
                label="เลือกวันที่เริ่มต้น"
                name="datepicker"
                clearLabel="Clear the datepicker"
                onClear={() => setStartDate(undefined)}
                selectedDateLabel={(formattedDate) =>
                  `Date picker, current is ${formattedDate}`
                }

              />
              </div>

              <DatePicker
                onChange={(date) => {
                  if(dayjs(date) < dayjs(startDate)){
                    setStartDate(dayjs(date).toISOString())
                  }
                  setEndDate(dayjs(date).toISOString())
                }}
                maxDate={dayjs().add(7, "hours").toDate()}
                selectedDate={endDate}
                label="เลือกวันที่สิ้นสุด"
                name="datepicker"
                clearLabel="Clear the datepicker"
                onClear={() => setEndDate(undefined)}
                selectedDateLabel={(formattedDate) =>
                  `Date picker, current is ${formattedDate}`
                }
              />

              <FormControl sx={{ m: 0, minWidth: 200, ml: 1, marginTop: 2.5 }}>
                <InputLabel id="paymentstatus-label">สถานะจ่ายเงิน</InputLabel>
                <Select
                  labelId="paymentstatus-label"
                  id="demo-simple-select-helper"
                  value={paymentStatus}
                  size="small"
                  label="สถานะจ่ายเงิน"
                  onChange={onPaymentStatusChange}
                >
                  <MenuItem value="">
                    <em>-</em>
                  </MenuItem>
                  <MenuItem value={"pending"}>รอชำระเงิน</MenuItem>
                  <MenuItem value={"waiting-for-payment"}>
                    รอเจ้าหน้าที่ตรวจสอบการโอนเงิน
                  </MenuItem>
                  <MenuItem value={"cancel"}>ยกเลิก</MenuItem>
                  <MenuItem value={"purchase"}>ชำระแล้ว</MenuItem>
                </Select>
                {/* <FormHelperText>กรองข้อมูลวันเกิด</FormHelperText> */}
              </FormControl>

              <FormControl sx={{ m: 0, minWidth: 200, ml: 1, marginTop: 2.5 }}>
                <InputLabel id="paymentstatus-label">สถานะ</InputLabel>
                <Select
                  labelId="paymentstatus-label"
                  id="demo-simple-select-helper"
                  value={status}
                  size="small"
                  label="สถานะ"
                  onChange={onStatusChange}
                >
                  <MenuItem value="">
                    <em>-</em>
                  </MenuItem>
                  <MenuItem value={"pending"}>รอชำระเงิน</MenuItem>
                  <MenuItem value={"approve"}>ยืนยัน</MenuItem>
                  <MenuItem value={"cancel"}>ยกเลิก</MenuItem>
                  <MenuItem value={"complete"}>จบงาน</MenuItem>
                </Select>
                {/* <FormHelperText>กรองข้อมูลวันเกิด</FormHelperText> */}
              </FormControl>

              <FormControl sx={{ m: 0, minWidth: 200, ml: 1, marginTop: 2.5 }}>
                <InputLabel id="partneraccept-label">สถานะรับงาน</InputLabel>
                <Select
                  labelId="partneraccept-label"
                  id="demo-simple-select-helper"
                  value={partnerAcceptStatus}
                  size="small"
                  label="สถานะ"
                  onChange={onPartnertAcceptStatusChange}
                >
                  <MenuItem value="">
                    <em>-</em>
                  </MenuItem>
                  <MenuItem value={"pending"}>รอดำเนินการ</MenuItem>
                  <MenuItem value={"accepted"}>รับงานแล้ว</MenuItem>
                  <MenuItem value={"reject"}>ยกเลิก</MenuItem>
                </Select>
                {/* <FormHelperText>กรองข้อมูลวันเกิด</FormHelperText> */}
              </FormControl>
            </div>
          </div>
        </>
      )}
      {/* headers={[
        'ID',
        'ประเภท',
        'ชื่อผู้ขอพร',
        'รายการสั่งซื้อ',
        'รวมราคา',
        'สถานะจ่ายเงิน',
        'สถานะ',
        'สถานะรับงาน',
        'เวลา'
      ]}  */}
      <Button
        onClick={() => {
          const toCsv = orderList.map((item) => ({
            ID: item.id,
            ประเภท: item.type,
            ชื่อผู้ขอพร: item.customer_name,
            รายการสั่งซื้อ: item.orderItems,
            รวมราคา: item.sum,
            สถานะจ่ายเงิน: item.paymentStatus,
            สถานะ: item.status,
            สถานะรับงาน: item.partnerAcceptStatus,
            เวลา: item.createdAt,
          }));
          const fields = [
            "ID",
            "ประเภท",
            "ชื่อผู้ขอพร",
            "รายการสั่งซื้อ",
            "รวมราคา",
            "สถานะจ่ายเงิน",
            "สถานะ",
            "สถานะรับงาน",
            "เวลา",
          ];
          var csv = json2csv(toCsv, { fields });
          // console.log(csv);
          var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);

          link.setAttribute("href", url);
          link.setAttribute(
            "download",
            `order-daily-${dayjs()
              .add(7, "hours")
              .format("DD-MM-YYYY-HH-mm")}.csv`
          );
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);

          // console.log(link);
          // link.download = `order-daily-${dayjs().add(7, 'hours').format('DD-MM-YYYY-HH-mm')}.csv`;
          // document.body.appendChild(link);
          // link.click();
          // document.body.removeChild(link);
        }}
        style={{ position: "absolute", right: 20, marginTop: 50 }}
      >
        Export CSV File
      </Button>

      {/* <CsvDownloadButton
      delimiter=''

      style={{position:"absolute",right:20}} data={[{

        'ID':'test',
        'ประเภท':"test"
      }]} filename={`order-daily-${dayjs().add(7, 'hours').format('DD-MM-YYYY')}.csv`} /> */}
      {/* {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )} */}
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const HomePage = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  const [users, setUsers] = React.useState([]);
  const [orderList, setOrderList] = React.useState([]);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const [search, setSearch] = React.useState("");
  const onSearchhandle = (value) => {
    console.log(value.target.value);
    setSearch(value.target.value);
  };

  const [date, setDate] = React.useState(dayjs().toISOString());
  const [startDate, setStartDate] = React.useState(
    dayjs().startOf("date").toISOString()
  );
  const [endDate, setEndDate] = React.useState(
    dayjs().endOf("date").toISOString()
  );

  const [dayBirth, setDayBirth] = React.useState();
  const onDayChange = (value) => {
    // console.log(value);
    setDayBirth(value.target.value);
  };

  const [status, setStatus] = React.useState("");
  const onStatusChange = (value) => {
    // console.log(value);
    setStatus(value.target.value);
  };

  const [paymentStatus, setPaymentStatus] = React.useState("");
  const onPaymentStatusChange = (value) => {
    // console.log(value);
    setPaymentStatus(value.target.value);
  };

  const [partnerAcceptStatus, setPartnerAcceptStatus] = React.useState("");
  const onPartnertAcceptStatusChange = (value) => {
    // console.log(value);
    setPartnerAcceptStatus(value.target.value);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = orderList.map((n) => n.name);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  // Avoid a layout jump when reaching the last page with empty users.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - orderList.length) : 0;

  React.useEffect(() => {
    setIsLoading((prevState) => true);
    instance
      .get(`/order-daily`, {
        params:{
          startDate,
          endDate
        },
        onDownloadProgress: () => {
          setIsLoading(true);
        },
      })
      .then((result) => {
        setIsLoading(false);
        let data = _.get(result, "data.data");

        if (status) {
          data = data.filter((item) => item.status == status);
        }

        if (partnerAcceptStatus) {
          data = data.filter(
            (item) => item.partnerAcceptStatus == partnerAcceptStatus
          );
        }

        if (paymentStatus) {
          data = data.filter((item) => item.paymentStatus == paymentStatus);
        }

        data.map((item) => {
          if (item.orderItems.length > 0) {
            item.orderItems = item.orderItems[0].product?.name + " (" + item.orderItems[0].product?.id + ")";
          } else {
            item.orderItems = "-";
          }
          switch (item.type) {
            case "package":
              item.type = "แพ็คเกจ";
              break;
            case "product":
              item.type = "วัตถุมงคล";
              break;
          }

          switch (item.status) {
            case "pending":
              item.status = "รอชำระเงิน";
              break;
            case "approve":
              item.status = "ยืนยัน";
              break;
            case "cancel":
              item.status = "ยกเลิก";
              break;
            case "complete":
              item.status = "จบงาน";
              break;
          }

          switch (item.partnerAcceptStatus) {
            case "pending":
              item.partnerAcceptStatus = "รอดำเนินการ";
              break;
            case "accepted":
              item.partnerAcceptStatus = "รับงานแล้ว";
              break;
            case "reject":
              item.partnerAcceptStatus = "ยกเลิก";
              break;
          }

          switch (item.paymentStatus) {
            case "pending":
              item.paymentStatus = "รอยืนยันการชำระ";
              break;
            case "waiting-for-payment":
              item.paymentStatus = "รอเจ้าหน้าที่ตรวจสอบการโอนเงิน";
              break;
            case "cancel":
              item.paymentStatus = "ยกเลิก";
              break;
            case "purchase":
              item.paymentStatus = "ชำระแล้ว";
              break;
          }

          item.createdAt = dayjs(item.createdAt)
            .add(7, "hours")
            .format("DD/MM/YYYY HH:mm:ss");

          return item;
        });

        console.log(data);

        setOrderList(data);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  }, [startDate, endDate, status, partnerAcceptStatus, paymentStatus]);

  const labelsDayOfWeeks = [
    "อาทิตย์",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัส",
    "ศุกร์",
    "เสาร์",
  ];

  return (
    <Box sx={{ width: "97%", m: 3 }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          orderList={orderList}
          onStatusChange={onStatusChange}
          status={status}
          onPartnertAcceptStatusChange={onPartnertAcceptStatusChange}
          onPaymentStatusChange={onPaymentStatusChange}
          paymentStatus={paymentStatus}
          onDayChange={onDayChange}
          onSearchhandle={onSearchhandle}
          search={search}
          dayBirth={dayBirth}
          setDate={setDate}
          date={dayjs(date).toDate()}
          setStartDate={setStartDate}
          startDate={dayjs(startDate).toDate()}
          setEndDate={setEndDate}
          endDate={dayjs(endDate).toDate()}
        />
        {isLoading ? (
          <LoadingIndicatorPage />
        ) : (
          <TableContainer>
            <Table
              sx={{ minWidth: 750 }}
              aria-labelledby="tableTitle"
              size={dense ? "small" : "medium"}
            >
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={orderList.length}
              />
              <TableBody>
                {stableSort(orderList, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    // const isItemSelected = isSelected(row.name);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        sx={{
                          cursor: "pointer",
                        }}
                        key={row.id.toString()}
                        onClick={() =>
                          (window.location = `/cms/admin/content-manager/collectionType/api::order.order/${row.id.toString()}`)
                        }
                      >
                        <TableCell
                          align="center"
                          // component="th"
                          // id={labelId}
                          // scope="row"
                          // padding="none"
                        >
                          {row.id}
                        </TableCell>
                        <TableCell align="center">{row.type}</TableCell>
                        <TableCell align="center">
                          {row.customer_name}
                        </TableCell>
                        <TableCell align="center">{row.orderItems}</TableCell>
                        <TableCell align="center">{row.sum}</TableCell>
                        <TableCell align="center">
                          {row.paymentStatus}
                        </TableCell>
                        <TableCell align="center">{row.status}</TableCell>
                        <TableCell align="center">
                          {row.partnerAcceptStatus}
                        </TableCell>
                        <TableCell align="center">{row.createdAt}</TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow
                    style={{
                      height: (dense ? 33 : 53) * emptyRows,
                    }}
                  >
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <TablePagination
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={orderList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      {/* <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      /> */}
    </Box>
  );
};

export default HomePage;
