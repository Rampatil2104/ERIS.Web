import React, { useState, useEffect } from 'react';
import { Button, Card, CardActions, CardContent, CardHeader } from '@mui/material/';
import { Grid } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { createAPIEndpoint, ENDPOINTS } from '../api';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material/';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Input from '../controls/Input';
import '@date-io/date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import Form from '../layouts/Form';

const columns = [
  { field: 'ProjectID', headerName: 'Project ID', flex: 1 },
  { field: 'LastName', headerName: 'Last Name', flex: 1 },
  { field: 'DateIncidentReported', headerName: 'Reported', flex: 1,
    valueGetter: (params)=> new Date(params.value).toLocaleDateString() },
  { field: 'District', headerName: 'District', flex: 1 },
  { field: 'County', headerName: 'County', sortable: false, flex: 1 },
  { field: 'Route', headerName: 'Route', flex: 1 },
  { field: 'PostMile', headerName: 'Post Mile', flex: 1 },
  { field: 'AssessmentStatus', headerName: 'Assessment Status', flex: 1 },
];

function SearchResultsGrid() {
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  // load real rows
  useEffect(() => {
    createAPIEndpoint(ENDPOINTS.ASSESSMENTPROFILE).fetchAll()
      .then(res => {
        // NOTE: server returns capitalized keys like AssessmentID, District, etc.
        // map to DataGrid shape with id := AssessmentID
        const rows = res.data.map(item => ({
          id: item.AssessmentID,
          ProjectID: item.ProjectID,
          LastName: item.LastName,
          DateIncidentReported: item.DateIncidentReported,
          County: item.County,
          District: item.District,
          Route: item.Route,
          AssessmentStatus: item.AssessmentStatus,
          PostMile: item.PostMile,
        }));
        setTableData(rows);
      })
      .catch(err => console.error(err));
  }, []);

  const onRowClick = (params) => {
    navigate(`/Details/${params.row.id}`);
  };

  return (
    <div>
      <Form>
        <Grid>
          <Grid item>
            <Card sx={{ minWidth: 275 }} variant="outlined">
              <CardHeader title="Search" />
              <CardContent>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Date</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="d-flex justify-content-around">
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          variant="outlined"
                          format="MM/dd/yyyy"
                          label="Start Date"
                          onChange={()=>{}}
                          value={null}
                        />
                      </MuiPickersUtilsProvider>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          variant="outlined"
                          format="MM/dd/yyyy"
                          label="End Date"
                          onChange={()=>{}}
                          value={null}
                        />
                      </MuiPickersUtilsProvider>
                    </div>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Location</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="row">
                      <div className="d-flex justify-content-around">
                        <Input label="District" name="districtInput"
                               onChange={e => setSearchText(e.target.value)} />
                        <Input label="County" name="countyInput"
                               onChange={e => setSearchText(e.target.value)} />
                        <Input label="Route" name="routeInput"
                               onChange={e => setSearchText(e.target.value)} />
                      </div>
                    </div>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
              <CardActions style={{ justifyContent: 'center' }}>
                <Button variant="contained" href="./Search">Reset</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Form>

      <div className="card col-xl">
        <div className="card-body">
          <div style={{ height: 400, width: '100%' }} className="col-xl-9">
            <DataGrid
              rows={tableData}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              onRowClick={onRowClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchResultsGrid;
