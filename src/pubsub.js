import { API, graphqlOperation } from 'aws-amplify';
import { publishSubscription } from './graphql/mutations';
import { onSunscriptionUpdate } from './graphql/subscriptions';

export const publish = (topic, jsonMessage) => {
    return API.graphql(graphqlOperation(publishSubscription, Object.assign({topic}, jsonMessage)))
}

export const subscribe = (topic, callback) => {
    let subscription = API.graphql({
        query: onSunscriptionUpdate,
        variables: { topic },
        authMode: 'AMAZON_COGNITO_USER_POOLS',
      }).subscribe({
      next: callback
    });
    return subscription
}