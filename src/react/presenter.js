import React from 'react';
import DrawingCanvas from './canvas/canvas';
import { object, array } from 'prop-types';
import {} from 'bootstrap/dist/css/bootstrap.css';
import { BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import $ from 'jquery';

export default class Presenter extends React.Component {
    static contextTypes = {
        messages: array,
        scores: object,
    };
    
    render() {
        let { scores, messages } = this.context;

        var top10 = messages.slice().sort((a, b) => scores[a.id] < scores[b.id] ? 1 : -1)
                    .filter( (x, i) => i < 10);

        return (
			<Grid fluid={true}>
				<Row className="show-grid">
					<Col xs={12} sm={12} md={8} lg={8}>
						<Panel header="Presenter info" bsStyle="warning">
                            <span>Event: "Valley Hackathon" </span>
                            <span>Presenter: "Rami Malek"</span>
		 				</Panel>
					</Col>
					<Col xs={12} sm={12} md={4} lg={4}>
						<Panel header="Drawing Canvas" bsStyle="warning">
                            <DrawingCanvas />
						</Panel>
					</Col>
				</Row>
				<Row className="show-grid">
					<Col xs={12} sm={12} md={12} lg={12}>
						<Panel header="Top 10 questions" bsStyle="warning">
							<BootstrapTable data={top10} hover condensed ref="table" tableBodyClass='table-responsive' search={ true }>
								<TableHeaderColumn width='150' dataField="id" dataAlign="center" dataSort isKey={true} editable={ false }>ID</TableHeaderColumn>
								<TableHeaderColumn width='150' dataField="name" dataAlign="center" dataSort >Author</TableHeaderColumn>
								<TableHeaderColumn width='150' dataField="timestamp" dataAlign="center" dataSort >Time</TableHeaderColumn>
                                <TableHeaderColumn width='150' dataField="message" dataAlign="center" dataSort >Question</TableHeaderColumn>
							</BootstrapTable>
						</Panel>
					</Col>
				</Row>
		</Grid>
        )
    }
}