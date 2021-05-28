import React, { Component, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import awsExports from "./aws-exports";
import { AmplifyAuthenticator, AmplifyGreetings } from '@aws-amplify/ui-react';
import { AuthState } from "@aws-amplify/ui-components";
import { asyncForEach, generateRandomNumber } from "./helperFunction";
import { topics, maxScore } from "./appConstants";
import { createSunscribedQueue } from './graphql/mutations';
import { listSunscribedQueues } from './graphql/queries';
import QueueStatus from "./QueueStatus";
import MessageList from "./MessageList";
import Loader from "./Loader";
import { Row, Col, Container } from "react-bootstrap";
import { publish } from "./pubsub";

Amplify.configure(awsExports);

class AppComponent extends Component {
  constructor(props) {
    super(props);
    //Initialize default state
    this.state = {
      subscribedList: [],
      isLoading: false,
    }
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
  }
  
  // We are using AWS AppSync GraphQL API with the mongodb datastore so that we can maintain the subscribed/unsubscribed status 
  // of queues for user. So for each user we are going to have 5 record each for one queue 
  // Below is the GraphQL schema which we are going to use
  // type SunscribedQueue @model @searchable{
  //   id: ID!
  //   username: String!
  //   score: Int!
  //   hasSubscribed: Boolean!
  //   topic: String!
  // }

  // React life cycle method we are going to use this method to fetch already subscribed queues by user 
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

          //Publish the data to all other users
          publish(topic.id, {username: this.props.username, hasSubscribed: true})
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
    let { subscribedList, isLoading } = this.state;
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
              <MessageList  username={this.props.username}/>
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
