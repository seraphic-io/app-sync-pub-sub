import React, { Component } from 'react';
import { subscribe } from "./pubsub"
import { topics } from "./appConstants";

class TopicWiseMessageList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messageList: [],
    }
    this.setupSubscription = this.setupSubscription.bind(this);
  }

  componentWillMount() {
    //set a subscriber so that we get the notification when other user's left/join a queue
    this.setupSubscription();
  }

  componentWillUnmount() {
    //Unsubscribe the subscriber
    if(this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  setupSubscription() {
    this.subscription = subscribe(this.props.topic.id, (data) => {
      let { messageList } = this.state;
      let updatedData = data.value.data.onSunscriptionUpdate;
      
      //format a proper message from the notification data
      if(updatedData.username !== this.props.username) {
        messageList.push({
          text: `${updatedData.username} has ${updatedData.hasSubscribed ? "Subscribed" : "Unsubscribed"} to ${updatedData.topic}`
        });
        this.setState({messageList})
      }
    })
  }

  render() {
    let { messageList } = this.state;
    return (
      <React.Fragment>
        <h5>{this.props.topic.id}</h5>
        {
          messageList.length > 0 ? messageList.map((message, index) => {
            return <p key={`message-${index}`} className="small-size">{message.text}</p>
          })
          : <p className="small-size">No Notification Yet!</p>
        }
      </React.Fragment>
    )
  }
}  

function MessageList(props) {
    return (
      <div>
        {
          topics.map((topic, index) => {
            return <TopicWiseMessageList topic={topic} {...props} key={index}/>
          })
        }
      </div>
    );
}
  
export default MessageList;