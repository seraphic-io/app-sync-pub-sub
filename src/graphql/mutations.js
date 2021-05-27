/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createSunscribedQueue = /* GraphQL */ `
  mutation CreateSunscribedQueue(
    $input: CreateSunscribedQueueInput!
    $condition: ModelSunscribedQueueConditionInput
  ) {
    createSunscribedQueue(input: $input, condition: $condition) {
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
export const updateSunscribedQueue = /* GraphQL */ `
  mutation UpdateSunscribedQueue(
    $input: UpdateSunscribedQueueInput!
    $condition: ModelSunscribedQueueConditionInput
  ) {
    updateSunscribedQueue(input: $input, condition: $condition) {
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
export const deleteSunscribedQueue = /* GraphQL */ `
  mutation DeleteSunscribedQueue(
    $input: DeleteSunscribedQueueInput!
    $condition: ModelSunscribedQueueConditionInput
  ) {
    deleteSunscribedQueue(input: $input, condition: $condition) {
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
