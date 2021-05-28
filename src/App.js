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
    //Initialize default state
    this.state = {
      subscribedList: [],
      messageList: [],
      isLoading: false,
    }
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
    this.setupSubscription = this.setupSubscription.bind(this);
  }

  // React life cycle method we are going to use this method to fetch already subscribed queues by user 
  // We are using AWS AppSync GraphQL API with the mongodb datastore so that we can maintain the subscribed/unsubscribed status 
  // of queues for user. So for each user we are going to have 5 recods each for one queue 
  // Below is the GraphQL schema which we are going to use
  // type SunscribedQueue @model @searchable{
  //   id: ID!
  //   username: String!
  //   score: Int!
  //   hasSubscribed: Boolean!
  //   topic: String!
  // }
  componentWillMount = async () => { 
    this.showLoading();
    
    //Generate Random number which can be used to assign as a score
    let randomNumber = generateRandomNumber(maxScore);

    // Get list of already joined queues
    let alreadySubscribed = await API.graphql(graphqlOperation(listSunscribedQueues, {
      filter: { username: { eq: this.props.username } }
    }));

    let subscribedList = alreadySubscribed.data.listSunscribedQueues.items;

    await asyncForEach(topics, async (topic) => {
      try {
        let queueStatus = subscribedList.find((item) => item.topic === topic.id);
        // Create new record if queue subscription record not found.
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
    
    this.setState({
      subscribedList
    })
    this.hideLoading();

    // Use GraphQL subscriber so that when ever new record is added/update we get the notification and 
    // We will show the notification on UI
    this.setupSubscription(); // Update Record subscriber
    this.setupOnCreateSubscription();// Add Record subscriber
  }

  setupSubscription() {
    this.subscription = API.graphql({
      query: onUpdateSunscribedQueue,
      authMode: 'AMAZON_COGNITO_USER_POOLS',
    }).subscribe({
      next: (data) => { // callback funtion which is called when a user join/left a queue
        let { subscribedList , messageList} = this.state;

        const updatedData = data.value.data.onUpdateSunscribedQueue;
        let found = false;
        let newsubscribedList = subscribedList.map((list) => {
          if (list.id === updatedData.id) {
            found = true;
            list = updatedData
          }
          return list
        });
        if (!found) {
          messageList.push({
            text: `${updatedData.username} has ${updatedData.hasSubscribed ? "Subscribed" : "Unsubscribed"} to ${updatedData.topic}`
          });
        }
        this.setState({
          messageList,
          subscribedList: newsubscribedList
        })
      }
    })
  }

  setupOnCreateSubscription() {
    this.addsubscriber = API.graphql({
      query: onCreateSunscribedQueue,
      authMode: 'AMAZON_COGNITO_USER_POOLS',
    }).subscribe({
      next: (data) => {// callback funtion which is called when a new user signup
        let { messageList } = this.state;
        let { username } = this.props;

        const updatedData = data.value.data.onCreateSunscribedQueue;
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
    //unsubscribe the subscriber 
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
              {/* Queue Viewer Component */}
              <QueueStatus list={subscribedList} hideLoading={this.hideLoading} showLoading={this.showLoading} />
            </Col>
            <Col>
              {/* Notification Viewer Component */}
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

  // Handler with auth state is changed so that user will be shown home screen when user login successfully
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
      userState.username // If user is login show them home page
      ? <AppComponent // All the logic comes in this compenet which is in same file
          username={userState.username }
          handleAuthStateChange={handleAuthStateChange}
        >
        </AppComponent>
      : <AmplifyAuthenticator handleAuthStateChange={handleAuthStateChange}></AmplifyAuthenticator>
      // Used AmplifyAuthenticator default UI for authentication provided by react amplify
    }
    </React.Fragment>
  );
}

export default App;
