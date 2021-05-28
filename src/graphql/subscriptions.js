/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onSunscriptionUpdate = /* GraphQL */ `
  subscription OnSunscriptionUpdate($topic: String!) {
    onSunscriptionUpdate(topic: $topic) {
      username
      hasSubscribed
      topic
    }
  }
`;
export const onCreateSunscribedQueue = /* GraphQL */ `
  subscription OnCreateSunscribedQueue {
    onCreateSunscribedQueue {
      id
      username
      score
      hasSubscribed
      topic
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateSunscribedQueue = /* GraphQL */ `
  subscription OnUpdateSunscribedQueue {
    onUpdateSunscribedQueue {
      id
      username
      score
      hasSubscribed
      topic
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteSunscribedQueue = /* GraphQL */ `
  subscription OnDeleteSunscribedQueue {
    onDeleteSunscribedQueue {
      id
      username
      score
      hasSubscribed
      topic
      createdAt
      updatedAt
    }
  }
`;
