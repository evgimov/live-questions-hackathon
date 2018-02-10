import React from 'react';
import styled from 'styled-components';
import { object, string } from 'prop-types';
import openSocket from 'socket.io-client';

import MessageList from './ChatBox/messagelist';
import TopMessageList from './ChatBox/topmessagelist';
import Header from './header';
import MessageBox from './ChatBox/messagebox';
import MiniTitle from './Profile/minititle';

import { BASEURL } from '../shared/constants';
import fetch from 'node-fetch';

import DrawingCanvas from './canvas/drawing-canvas';
import ViewingCanvas from './canvas/viewing-canvas';

let Flex = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`

let Container = styled.div`
    display: flex;
    flex-direction: column;
`
let StickToBottom = styled.div`
    position: fixed;
    bottom: 8px;
    width: 100%;
`
export default class Main extends React.Component {
    static childContextTypes = {
        socket: object,
        name: string,
        scores: object,
        room: string,
    }
    state = {
        socket: undefined,
        messages: [],
        replies: {}, // Maps message id to array of replies
        scores: {}, // Maps message + reply ids to score
        name: '',
        context: '',
    }
    
    componentDidMount() {
        this.state.socket = openSocket('http://localhost:5000');

        this.state.socket.on('new message', (message) => {
            this.setState({messages: [...this.state.messages, message]})
            this.state.scores[message.id] = 0;
        })
        this.state.socket.on('new reply', ({ replyId, reply }) => {
            let repliesForMessage = this.state.replies[replyId];
            let newReplyArray = repliesForMessage ? repliesForMessage : [];
            this.state.scores[reply.id] = 0;
            this.setState({
                replies: Object.assign( {}, this.state.replies, {[replyId]: [...newReplyArray, reply]})
            })
        })
        this.state.socket.on('score update', (update) => {
           this.setState({
               scores: Object.assign({}, this.state.scores,
                {[update.id]: update.score})
           })
        })

        this.state.socket.on('initial data', (messages) => {
            
        })

        this.state.socket.emit('subscribe', this.props.room);
    }
    getChildContext() {
        return {
            socket: this.state.socket,
            name: this.state.name,
            scores: this.state.scores,
            room: this.props.room || Math.floor(Math.random() * 100000),
        }
    }
    question(data) {
        let requestOptions = {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        requestOptions.body = this.state.context
            ?  JSON.stringify({
                message: data.message,
                context: this.state.context,
            }) : JSON.stringify({ message: data.message });

        fetch(`${BASEURL}/conversation`, requestOptions)
        .then( res => res.json())
        .then(response => {
            this.setState({
                context: response.context
            })
        })
        this.state.socket.emit('message', data, this.getChildContext().room);
    }
    login({message}) {
        this.setState({
            name: message,
        });
    }

    messageCheck(key) {
        if (key === 13 && this.state.message !== '') {
            this.props.onSubmit({
                message: this.state.message,
                name: this.context.name,
                timestamp: Date.now()
            })
            this.state.message = '';
        }
    }
    render() {
        let { messages, replies, scores } = this.state;
        return (
            <Container>
                <Header event={this.props.room}/>
                { messages.length > 4 ? <TopMessageList messages={messages} replies={replies} /> : null }
                <Flex>
                    <MessageList messages={messages} replies={replies} />
                    <ViewingCanvas />
                </Flex>
                { 
                    this.state.name !== ''
                    ? <span style={{'marginBottom': '50px'}}>
                        <StickToBottom>
                            <MessageBox checkKeypress={this.messageCheck}  placeholder={"Ask a question"} onSubmit={(data) => this.question(data)} />
                        </StickToBottom>
                     </span>
                    : <StickToBottom>
                        <MiniTitle style={{'marginLeft': '24px'}} name={"Log-in to ask a question!"} />
                        <MessageBox checkKeypress={this.messageCheck} placeholder={"Choose a username!"} onSubmit={(data) => this.login(data)} />
                    </StickToBottom>
                }
            </Container>
        )
    }
}