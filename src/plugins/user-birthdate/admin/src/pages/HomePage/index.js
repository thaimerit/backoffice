/*
 *
 * HomePage
 *
 */

import _ from 'lodash';
import React from 'react';
import instance from '../../../../../dashboard/admin/src/utils/axiosInstance';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';

import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';
import dayjs from 'dayjs';
import 'dayjs/locale/th'
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from '@mui/material';

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
  return order === 'desc'
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
    id: 'id',
    numeric: false,
    disablePadding: true,
    label: 'ID',
  },
  {
    id: 'firstName',
    numeric: false,
    disablePadding: false,
    label: 'ชื่อ',
  },
  {
    id: 'lastName',
    numeric: false,
    disablePadding: false,
    label: 'นามสกุล',
  },
  {
    id: 'username',
    numeric: false,
    disablePadding: false,
    label: 'Username',
  },
  {
    id: 'email',
    numeric: false,
    disablePadding: false,
    label: 'อีเมล',
  },
  {
    id: 'dateOfBirth',
    numeric: false,
    disablePadding: false,
    label: 'เกิดวันที่',
  },
  {
    id: 'dayOfBirth',
    numeric: false,
    disablePadding: false,
    label: 'วันเกิด',
  },
  {
    id: 'createdAt',
    numeric: false,
    disablePadding: false,
    label: 'ลงทะเบียนเมื่อ',
  },
];


function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={'center'}
            // padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
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
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
  const { numSelected, onSearchhandle, search, onDayChange, dayBirth } = props;

  return (
    <Toolbar

      sx={{
        pl: { sm: 2 },
        // pr: { sm: 2 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <div style={{ display: 'flex', flexDirection: "column", padding: 10 }}>
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            ผู้ใช้ที่ระบุวันเกิด
          </Typography>
          <div style={{ marginTop: 10 }}>
            <TextField onChange={onSearchhandle} value={search} size='small' id="outlined-basic" label="ค้นหา" variant="outlined" />

            <FormControl sx={{ m: 0, minWidth: 120, ml: 1 }}>
              <InputLabel id="demo-simple-select-helper-label">วันเกิด</InputLabel>
              <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                value={dayBirth}
                size='small'
                label="วันเกิด"
                onChange={onDayChange}
              >
                <MenuItem value="">
                  <em>-</em>
                </MenuItem>
                <MenuItem value={0}>อาทิตย์</MenuItem>
                <MenuItem value={1}>จันทร์</MenuItem>
                <MenuItem value={2}>อังคาร</MenuItem>
                <MenuItem value={3}>พุธ</MenuItem>
                <MenuItem value={4}>พฤหัสบดี</MenuItem>
                <MenuItem value={5}>ศุกร์</MenuItem>
                <MenuItem value={6}>เสาร์</MenuItem>
              </Select>
              {/* <FormHelperText>กรองข้อมูลวันเกิด</FormHelperText> */}
            </FormControl>
          </div>

        </div>
      )}

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

  const [users, setUsers] = React.useState([])

  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const [search, setSearch] = React.useState("");
  const onSearchhandle = (value) => {
    console.log(value.target.value);
    setSearch(value.target.value)
  }


  const [dayBirth, setDayBirth] = React.useState();
  const onDayChange = (value) => {
    // console.log(value);
    setDayBirth(value.target.value)
  }


  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = users.map((n) => n.name);
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
        selected.slice(selectedIndex + 1),
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
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

  React.useEffect(() => {
    instance.get(`/user-birthdate`)
      .then((result) => {
        let data = _.get(result, 'data.data')

        data = data.map((item) => {
          item.dayOfBirth = labelsDayOfWeeks[dayjs(item.dateOfBirth).day()]
          item.dateOfBirth = dayjs(item.dateOfBirth).add(543, 'years').locale('th').format("DD MMM YYYY")
          item.createdAt = dayjs(item.createdAt).add(543, 'years').format("DD/MM/YYYY HH:mm:ss")
          return item
        })

        if(search){
          data = data.filter((item)=>{
            console.log(search);
            return item.firstName.toLowerCase().indexOf(search.toLowerCase()) > -1 || item.lastName.toLowerCase().indexOf(search.toLowerCase()) > -1 || item.email.toLowerCase().indexOf(search.toLowerCase()) > -1
          })
        }

        console.log(data);

        if(dayBirth){
          data = data.filter((item)=>{
            // console.log(search);
            return item.dayOfBirth == labelsDayOfWeeks[parseInt(dayBirth)]
          })
        }

        setUsers(data)
      })
  }, [search,dayBirth])

  const labelsDayOfWeeks = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];

  return (
    <Box sx={{ width: '97%', m: 3 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar numSelected={selected.length} onDayChange={onDayChange} onSearchhandle={onSearchhandle} search={search} dayBirth={dayBirth}   />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={users.length}
            />
            <TableBody>
              {stableSort(users, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  // const isItemSelected = isSelected(row.name);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      key={row.id.toString()}
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
                      <TableCell align="center">{row.firstName}</TableCell>
                      <TableCell align="center">{row.lastName}</TableCell>
                      <TableCell align="center">{row.username}</TableCell>
                      <TableCell align="center">{row.email}</TableCell>
                      <TableCell align="center">{row.dateOfBirth}</TableCell>
                      <TableCell align="center">{row.dayOfBirth}</TableCell>
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
        <TablePagination
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={users.length}
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
