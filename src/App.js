import React, { Component, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import awsExports from "./aws-exports";
import { AmplifyAuthenticator, AmplifyGreetings } from '@aws-amplify/ui-react';
import { AuthState } from "@aws-amplify/ui-components";
import { asyncForEach, generateRandomNumber } from "./helperFunction";
import { topics, maxScore } from "./appConstants";
import { createSunscribedQueue } from './graphql/mutations';
import { listSunscribedQueues } from './graphql/queries';
import { onUpdateSunscribedQueue, onCreateSunscribedQueue } from './graphql/subscriptions';
import QueueStatus from "./QueueStatus";
import MessageList from "./MessageList";
import Loader from "./Loader";
import { Row, Col, Container } from "react-bootstrap";

Amplify.configure(awsExports);

class AppComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subscribedList: [],
      messageList: [],
      isLoading: false,

    }
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
    this.setupSubscription = this.setupSubscription.bind(this);
  }

  componentWillMount = async () => {
    console.log("Use Effect called 1")
    this.showLoading();
    let randomNumber = generateRandomNumber(maxScore)
    let alreadySubscribed = await API.graphql(graphqlOperation(listSunscribedQueues, {
      filter: { username: { eq: this.props.username } }
    }));

    let subscribedList = alreadySubscribed.data.listSunscribedQueues.items;
    await asyncForEach(topics, async (topic) => {
      try {
        let queueStatus = subscribedList.find((item) => item.topic === topic.id);
        if (!queueStatus) {
          let result = await API.graphql(graphqlOperation(createSunscribedQueue, {
            input: {
              username: this.props.username,
              score: randomNumber,
              hasSubscribed: true,
              topic: topic.id
            }
          }));
          subscribedList.push(result.data.createSunscribedQueue);
        }
      } catch (error) {
        this.hideLoading();
        console.log("[Error subscribed to queue]", error)
      }
    });
    console.log("subscribedList", subscribedList)
    this.setState({
      subscribedList
    })
    this.hideLoading();

    this.setupSubscription();
    this.setupOnCreateSubscription();
  }

  setupSubscription() {
    this.subscription = API.graphql({
      query: onUpdateSunscribedQueue,
      authMode: 'AMAZON_COGNITO_USER_POOLS',
    }).subscribe({
      next: (data) => {
        let { subscribedList , messageList} = this.state;

        const updatedData = data.value.data.onUpdateSunscribedQueue;
        console.log("updatedData", updatedData)
        let found = false;
        console.log("subscribedList", subscribedList)
        let newsubscribedList = subscribedList.map((list) => {
          console.log("list", list)
          if (list.id === updatedData.id) {
            found = true;
            list = updatedData
          }
          return list
        });
        console.log("found", found)
        if (!found) {
          messageList.push({
            text: `${updatedData.username} has ${updatedData.hasSubscribed ? "Subscribed" : "Unsubscribed"} to ${updatedData.topic}`
          });
        }
        this.setState({
          messageList,
          subscribedList: newsubscribedList
        })
        // setSubscribedList(newsubscribedList);
      }
    })
  }

  setupOnCreateSubscription() {
    this.addsubscriber = API.graphql({
      query: onCreateSunscribedQueue,
      authMode: 'AMAZON_COGNITO_USER_POOLS',
    }).subscribe({
      next: (data) => {
        let { messageList } = this.state;
        let { username } = this.props;

        const updatedData = data.value.data.onCreateSunscribedQueue;
        console.log("updatedData", updatedData)
        
        if (updatedData.username !== username) {
          messageList.push({
            text: `${updatedData.username} has ${updatedData.hasSubscribed ? "Subscribed" : "Unsubscribed"} to ${updatedData.topic}`
          });
        }
        this.setState({
          messageList,
        })
      }
    })
  }

  componentWillUnmount() {
    console.log("this.subscription",this.subscription.unsubscribe)
    if(this.subscription){
      this.subscription.unsubscribe();
    }
    if(this.addsubscriber) {
      this.addsubscriber.unsubscribe();
    }
  }

  showLoading = () => {
    this.setState({
      isLoading: true
    })
  }

  hideLoading = () => {
    this.setState({
      isLoading: false
    })
  }
  
  render() {
    let { subscribedList, messageList, isLoading } = this.state;
    return (
      <React.Fragment>
        <Container fluid>
            <AmplifyGreetings username={this.props.username} handleAuthStateChange={this.props.handleAuthStateChange}/>
          <Row>
            <Col>
              <QueueStatus list={subscribedList} hideLoading={this.hideLoading} showLoading={this.showLoading} />
            </Col>
            <Col>
              <MessageList list={messageList} />
            </Col>
          </Row>
        </Container>
        <Loader isLoading={isLoading} />
      </React.Fragment>  
    )
  }
}

function App() {
  const [userState, setAuthUser] = useState({});

  const handleAuthStateChange = (async (nextAuthState, authData) => {
    if (authData && nextAuthState === AuthState.SignedIn) {
      setAuthUser(authData)
    } else {
      setAuthUser({})
    }
  });

  return (
    <React.Fragment>
    {
      userState.username 
      ? <AppComponent 
          username={userState.username }
          handleAuthStateChange={handleAuthStateChange}
        >
        </AppComponent>
      : <AmplifyAuthenticator handleAuthStateChange={handleAuthStateChange}></AmplifyAuthenticator>
    }
    </React.Fragment>
  );
}

export default App;
