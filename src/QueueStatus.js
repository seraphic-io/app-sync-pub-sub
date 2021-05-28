import React from 'react';
import { API, graphqlOperation } from 'aws-amplify'
import { updateSunscribedQueue } from './graphql/mutations';
import { listSunscribedQueues } from './graphql/queries';
import { AmplifyButton } from '@aws-amplify/ui-react';

function QueueStatusView(props) {
    const updateSubscription = async (id, update) => {
        try {
            props.showLoading()
            // Update join/left status of record in datasource  
            let result = await API.graphql(graphqlOperation(updateSunscribedQueue, {
                input: {
                  hasSubscribed: update,
                  id: id
                }
            }));
            props.hideLoading();
            console.log("result", result)
        } catch(error) {
            props.hideLoading();
            console.log("[Error Updating Subscription]", error)
        }
    }

    const removeTopUser = async(topic) => {
        
        try {
            props.showLoading();
            // Get top topSubscriber and remove from the queue
            let topSubscriber =  await API.graphql(graphqlOperation(listSunscribedQueues, {
                filter: { topic: { eq: topic},  hasSubscribed: {eq: true}}
              }));
            let list = topSubscriber.data.listSunscribedQueues.items
            if(list.length > 0) {
                list.sort((a, b) => b.score - a.score);
                updateSubscription(list[0].id, false);
            } else {
                props.hideLoading();
                alert(`No user has subscribed to topic ${topic}`)
            }
        } catch(error) {
            props.hideLoading();
            console.log("[Error fetching top subscriber]", error)
        }
    }

    return (
      <div className="">
          <p> {props.queue.topic} </p>
          <div className="theme-buttons">
            {
                props.queue.hasSubscribed
                ? <AmplifyButton onClick={() => updateSubscription(props.queue.id, false)} className="mb-2">Unsubscribe</AmplifyButton>
                : <AmplifyButton onClick={() => updateSubscription(props.queue.id, true)}>Subscribe</AmplifyButton>
            }
          </div>
          <div className="theme-buttons">  
            <AmplifyButton onClick={() => removeTopUser(props.queue.topic)}> Remove Top</AmplifyButton>
          </div>  
      </div>
    );
}

function QueueStatus(props) {
    return (
      <div>
        {
            props.list.map((queue, index) => {
                return <QueueStatusView queue={queue} key={index} {...props}/>   
            })
        }
      </div>
    );
}
  
export default QueueStatus;